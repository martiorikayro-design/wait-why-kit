"""Audio for "The hottest things, ranked" (3D hall): voice + licensed music bed + synthesized SFX, then the channel mix.
run: python hot_audio.py   (from anywhere; writes remotion/public/hot/mix.wav and the stems next to it)
"""
import os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'audio'))
import numpy as np, soundfile as sf
from synth import *
import mix as M

DUR = 37.7; N = n_of(DUR); O = 0.15
OUT = os.path.join(ROOT, 'remotion/public/hot'); os.makedirs(OUT, exist_ok=True)
T0 = [x + O for x in (7.766, 14.43, 18.1, 25.433, 29.192, 31.926)]   # arrival words, scene time
GLIDE = 1.9
COUNT = [(10.07, 11.0), (17.3, 17.95), (20.1, 21.0), (27.9, 28.9), (30.85, 31.8), (35.15, 36.8)]
CRACKS = [1.035 + O, 2.017 + O, 3.1, 29.898 + O, 30.7 + O, 31.2 + O]

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

def crack():
    """lightning: sharp noise burst + a low rumble"""
    d = 0.55; t = tt(d)
    s = hp(noise(d), 1800) * np.exp(-t * 22) * 1.0 + lp(noise(d), 260) * np.exp(-t * 6) * 0.9
    s += np.sin(2 * np.pi * (58 + 40 * np.exp(-t * 18)) * t) * np.exp(-t * 7) * 0.9
    s[:n_of(0.004)] *= np.linspace(0, 1, n_of(0.004))
    return fade(s)

# ------------------------------------------------------------ voice (placed like the scene: take starts at 0.15 s)
v = np.zeros(N); x = pcm(os.path.join(HERE, 'voice.mp3')); v[n_of(O):n_of(O) + len(x)] = x[:N - n_of(O)]
sf.write(os.path.join(OUT, 'voice_pad.wav'), v.astype(np.float32), SR, subtype='FLOAT')

# ------------------------------------------------------------ music: Kevin MacLeod "Investigations" (CC BY 4.0), ranking bed
m = pcm(os.path.join(ROOT, 'music/Investigations.mp3'))
while len(m) < N: m = np.concatenate([m, m])
m = m[:N].copy()
m[:n_of(0.25)] *= np.linspace(0, 1, n_of(0.25)); m[-n_of(1.2):] *= np.linspace(1, 0, n_of(1.2))
m = peq(hp(m, 60), 2600, -5.0, 0.8)
sf.write(os.path.join(OUT, 'music_bed.wav'), m.astype(np.float32), SR, subtype='FLOAT')

# ------------------------------------------------------------ SFX
sfx = np.zeros(N)
for c in CRACKS[:3]: place(sfx, crack(), c, 0.55)                       # hook: the bolt flickers
place(sfx, crack(), CRACKS[3], 0.7); place(sfx, crack(), CRACKS[4], 0.55); place(sfx, crack(), CRACKS[5], 0.45)  # #2
cut = T0[0] - 0.2
place(sfx, flash_poof(0.45), cut, 0.6); place(sfx, whoosh(0.4, 500, 4500), cut - 0.1, 0.5)   # soft cut to #6
for i, t0 in enumerate(T0):
    place(sfx, pop(450, 1300), t0, 0.7)                                  # badge pops in
    place(sfx, plop(900, 300), t0 + 0.02, 0.4)                           # the host's hop
    if i > 0: place(sfx, whoosh(1.0, 350, 2600), t0 - GLIDE + 0.35, 0.55)   # glide to the next station
for i, (a, b) in enumerate(COUNT):
    place(sfx, ticks(b - a, 16, 2600), a, 0.35)                          # the counter rolling
    place(sfx, ting(2349 if i < 5 else 3136, 0.9), b, 0.5)               # lands on the final value
for t0, d in ((T0[2], 4.0), (T0[3], 4.0), (T0[4] + 1.0, 3.0), (T0[5], 3.5)):
    place(sfx, crackle(d, 5 + 2 * (t0 > T0[3])) * 0.5, t0, 0.35)         # the heat is getting to him
place(sfx, whoosh(1.9, 300, 6500), 35.1, 0.6)                            # white-out riser
place(sfx, timpani(hz('D2'), 1.2), 36.5, 0.75); place(sfx, sparkle(1.0, 2200), 36.6, 0.4)
sf.write(os.path.join(OUT, 'sfx.wav'), sfx.astype(np.float32), SR, subtype='FLOAT')

# ------------------------------------------------------------ mix: music ~ -15 dB under the voice (0.18), SFX <= 30 %
M.main(os.path.join(OUT, 'voice_pad.wav'), os.path.join(OUT, 'music_bed.wav'), os.path.join(OUT, 'sfx.wav'),
       os.path.join(OUT, 'mix.wav'), dur=DUR, polish=True, stems_out=OUT, music_ratio=0.18)
