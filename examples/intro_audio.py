"""Audio for the "WAIT, HOW?" intro preview.
A = narrator says "Wait... how?" over the stinger, B = sound effects only.
Hook and story come from the finished Mona Lisa mix; the stinger sits in the silent gap between them.
"""
import sys, os
sys.path.insert(0, '/home/claude/shorts/lib/audio')
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from synth import *
import mix as M

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
HOOK_END, RESUME_AT, STING, STORY = 2.833, 2.93, 1.35, 3.2

full, _ = sf.read(os.path.join(ROOT, 'public/mona/mix.wav'))
voice_ref, _ = sf.read(os.path.join(ROOT, 'work/audio/stems/voice_final.wav'))
v_rms = M.gated_rms(voice_ref); v_peak = float(np.abs(voice_ref).max())

def load_line(path, speed_tag=''):
    x, sr = sf.read(path)
    x = resample_poly(x, 2, 1) if sr == 24000 else x
    on = np.argmax(np.abs(x) > 10 ** (-40 / 20))
    x = x[max(0, on - int(0.01 * SR)):]
    off = len(x) - np.argmax(np.abs(x[::-1]) > 10 ** (-45 / 20))
    x = fade(x[:off + int(0.04 * SR)], 0.004, 0.03)
    x = M.voice_chain(x)
    return x * (v_rms / M.gated_rms(x))

def stinger(with_voice):
    n = n_of(STING); fx = np.zeros(n); vo = np.zeros(n)
    place(fx, shutter(), 0.0, 0.9); place(fx, timpani(hz('D2'), 0.9), 0.0, 0.55)
    place(fx, slide(300, 900, 0.2), 0.03, 0.35); place(fx, pop(450, 1300, 0.06), 0.12, 0.6)
    place(fx, whoosh(0.14, 900, 4500), 0.5, 0.45)
    thunk = clunk() * 0.8; thunk[:n_of(0.12)] += lp(noise(0.12), 500) * env(0.12, 0.002, 0.03)
    place(fx, thunk, 0.63, 0.55 if with_voice else 0.9)
    place(fx, bp(noise(0.18), 1500, 7000) * env(0.18, 0.002, 0.04), 0.635, 0.35)
    place(fx, ting(2349, 0.8), 0.66, 0.35)
    place(fx, pizz(hz('D2'), 0.5, bright=0.6), 0.72, 0.8); place(fx, pizz(hz('Ab2'), 0.6, bright=0.6), 0.95, 0.8)
    place(fx, whoosh(0.42, 400, 3200), STING - 0.3, 0.6)
    # SFX bus: same rules as the main mix (<= 50 % of the voice, peaks <= 0.7x voice peak)
    fx = M.tame(fx, 12.0, 0.02)
    fx *= 0.5 * v_rms / max(M.gated_rms(fx), 1e-9)
    fx = M.limiter(fx, 0.7 * v_peak, 0.002, 0.03)
    if with_voice:
        place(vo, load_line(os.path.join(HERE, 'wait_fast.wav')), 0.13)
        place(vo, load_line(os.path.join(HERE, 'how_fast.wav')), 0.66)
    return fx + vo

for tag, wv in (('A', True), ('B', False)):
    hook = full[:n_of(HOOK_END)].copy(); hook[-n_of(0.015):] *= np.linspace(1, 0, n_of(0.015))
    story = full[n_of(RESUME_AT):n_of(RESUME_AT + STORY)].copy(); story[:n_of(0.01)] *= np.linspace(0, 1, n_of(0.01))
    y = np.concatenate([hook, stinger(wv), story])
    y = M.limiter(y, 10 ** (-1.8 / 20), tp=True)
    out = os.path.join(HERE, f'intro_{tag}.wav')
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24')
    print(tag, 'dur %.2f s' % (len(y) / SR), 'LUFS %.1f' % M.lufs(y), 'TP %.1f dBTP' % M.db(M.true_peak(y)))
