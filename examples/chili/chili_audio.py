"""Music bed + SFX for the chili short (detective remake), mixed at 50 % of the voice.
run: /home/claude/tts/venv/bin/python chili_audio.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../audio'))
import numpy as np
from synth import *
import mix as M

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
DUR = 20.2; N = n_of(DUR)
music = np.zeros(N); sfx = np.zeros(N)
T = dict(eat=0.6, make=1.53, cry=1.89, nothing=2.65, isnt=3.75, real=4.0, heat=4.29, caps1=4.9, tricking=5.7, warns=6.76, burns=7.6,
         have=8.98, caps2=9.75, cant=10.5, theirs=11.03, helps=11.9, pepper=12.3, burn2=13.0, scares=13.29, off=13.7,
         chew=14.5, bits=15.3, swallow=16.56, whole=17.15, poop=17.59, out=17.98, ready=18.22, grow=18.53)
CUTS = [4.65, 11.45, 14.2, 15.74]

# ------------------------------------------------------------------ music
BPM = 112; B = 60 / BPM; E8 = B / 2
def groove(a, b, root, ch, mel=None, bright=True, g=1.0):
    k = 0; t_ = a
    while t_ < b - 0.02:
        beat = k % 2 == 0
        pat = [root, ch[0], ch[1], ch[0]]
        place(music, pizz(hz(pat[k % 4]), 0.32, bright=0.5), t_, (0.44 if beat else 0.26) * g)
        if bright:
            if k % 4 == 0: place(music, kick(), t_, 0.14 * g)
            if k % 4 == 2: place(music, brush(0.1), t_, 0.12 * g)
            place(music, woodblock(1900 if k % 2 else 1500), t_ + E8 * 0.5, 0.03 * g)
        t_ += E8; k += 1
    if mel:
        for i, nm in enumerate(mel):
            at = a + i * E8
            if nm and at < b - 0.1: place(music, celesta(hz(nm), 0.6) if bright else reed(hz(nm), 0.18, dark=0.6), at, (0.22 if bright else 0.3) * g)
# garden groove in G major (bouncy), a sneaky minor version inside the mouths
MEL_G = ['D5', None, 'G5', None, 'B5', 'A5', None, 'G5', None, 'E5', None, 'D5', None, None, 'B4', None] * 2
MEL_SNEAK = [None, 'E3', None, 'F3', None, 'E3', 'D#3', 'E3', None, None, 'A3', None, 'C4', None, 'B3', None] * 2
groove(0.0, 3.3, 'G2', ['D3', 'G3'], MEL_G)
groove(3.3, 4.62, 'C3', ['G3', 'C4'], None, g=0.8)
groove(4.65, 8.15, 'E2', ['B2', 'E3'], MEL_SNEAK, bright=False)
groove(8.15, T['cant'] + 0.02, 'A2', ['E3', 'A3'], MEL_SNEAK, bright=False)
place(music, wah(('G2', 'F#2', 'F2'), 0.9), T['theirs'] - 0.25, 0.5)
groove(11.45, 14.18, 'G2', ['D3', 'G3'], MEL_G)
groove(14.2, 15.72, 'E2', ['B2', 'E3'], None, bright=False, g=0.9)
groove(15.74, 18.85, 'G2', ['D3', 'G3'], MEL_G)
for nm, g in [('G2', 0.5), ('G3', 0.3)]: place(music, pizz(hz(nm), 0.5, bright=0.7), 18.9, g)
place(music, brass([hz('G3'), hz('B3'), hz('D4')], 0.22, 0.01, 0.08), 18.9, 0.3)
for i, nm in enumerate(['D5', 'G5', 'B5', 'D6']): place(music, celesta(hz(nm), 1.0), 19.05 + i * 0.08, 0.16)
music = peq(hp(music, 45), 2600, -4.0, 0.8)

# ------------------------------------------------------------------ SFX
cues = []
def cue(fn, at, g): cues.append((fn, at, g))
def bloop(f0, f1, d): return fade(sweep(lambda t: f0 * (f1 / f0) ** (t / d), d) * env(d, 0.004, d * 0.35))
def gulp():
    g = np.zeros(n_of(0.4)); place(g, bloop(420, 150, 0.13), 0); place(g, bloop(300, 110, 0.16) * 0.9, 0.12); return lp(g, 2500)
def chomp():
    c = np.zeros(n_of(0.3))
    for i, at in enumerate([0.0, 0.028, 0.06, 0.1]): place(c, bp(noise(0.06), 1400, 6000) * env(0.06, 0.001, 0.012) * (1 - i * 0.18), at)
    place(c, 0.8 * sweep(lambda t: 140 - 300 * t, 0.06) * env(0.06, 0.002, 0.02), 0.0); return c
def fwoosh(d=0.7):
    t = tt(d); return fade(lp(noise(d), 900 + 2600 * np.exp(-t * 3)[0]) * np.minimum(1, t / 0.03) * np.exp(-t * 3.2) + 0.3 * crackle(d, 30))
def hiss(d=0.8): return fade(hp(noise(d), 3000) * np.minimum(1, tt(d) / 0.05) * np.exp(-tt(d) * 3) * 0.6)
def chirp():
    c = np.zeros(n_of(0.3))
    for j, (f0, f1) in enumerate([(3200, 4200), (3600, 4600)]): place(c, sweep(lambda t: f0 + (f1 - f0) * t / 0.07, 0.07) * env(0.07, 0.004, 0.03), j * 0.11)
    return c
def bell_ring(d=1.1):
    t = tt(d); hammer = (np.sin(2 * np.pi * 18 * t) > 0).astype(float)
    tone = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1180, 1), (2950, 0.5), (4400, 0.25)])
    return fade(tone * (0.4 + 0.6 * lp(hammer, 60)) * np.minimum(1, t / 0.01) * 0.5)
def lock_click():
    c = np.zeros(n_of(0.3)); place(c, click(2200, 0.012), 0); place(c, clunk() * 0.4, 0.12); place(c, click(3000, 0.01), 0.16); return c
def squeal(): return fade(sweep(lambda t: 2600 + 2400 * t / 0.22 + 300 * np.sin(2 * np.pi * 30 * t), 0.22) * ar(0.22, 0.01, 0.05))
def splat():
    s = np.zeros(n_of(0.4)); place(s, plop(300, 90, 0.15), 0); place(s, lp(noise(0.25), 1200) * env(0.25, 0.002, 0.05) * 0.8, 0.0); return s
def flaps(d=0.6):
    out = np.zeros(n_of(d))
    for at in np.arange(0, d, 0.09): place(out, bp(noise(0.06), 400, 2500) * env(0.06, 0.005, 0.02), at, 0.8)
    return out

for c in CUTS: cue(whoosh(0.5, 400, 3200), c - 0.27, 0.6)
# hook: bird gulps, guy bites and burns, bird shrugs
cue(gulp(), T['eat'], 0.55)
cue(chomp(), T['make'], 0.7)
cue(fwoosh(0.8), T['cry'], 0.55); cue(hiss(0.9), T['cry'] + 0.1, 0.25)
cue(chirp(), T['nothing'] + 0.05, 0.4); cue(boing(250, 0.35), T['nothing'] + 0.02, 0.25)
# the fake flame: whip pan, crackle, thermometer, cardboard flip
cue(whoosh(0.32, 700, 3500), 3.28, 0.45); cue(crackle(0.7, 25), 3.3, 0.35)
cue(pop(500, 1200, 0.06), T['isnt'] - 0.05, 0.45); cue(swish(0.2), T['real'], 0.5); cue(flutter(0.3), T['real'] + 0.02, 0.35)
cue(ting(2093, 0.8), T['heat'] - 0.08, 0.3); cue(slide(320, 950, 0.2), 4.05, 0.25); cue(slide(950, 300, 0.2), 4.44, 0.22)
# the trickster key and the human alarm
for i, at in enumerate(np.arange(T['caps1'], 5.55, 0.11)): cue(tap(1000 if i % 2 else 1200, 0.04), at, 0.3)
cue(lock_click(), 5.95, 0.55)
cue(bell_ring(1.2), T['warns'], 0.35); cue(fwoosh(0.6), T['burns'] - 0.03, 0.45)
# the bird's alarm: a bounce, a sneak, a bonk
cue(whoosh(0.45, 500, 3000), 8.15, 0.45); cue(boing(300, 0.3), T['have'], 0.3)
for i, at in enumerate(np.arange(T['caps2'], 10.45, 0.11)): cue(tap(1000 if i % 2 else 1200, 0.04), at, 0.3)
cue(clunk(), T['cant'] + 0.05, 0.75); cue(ting(3136, 0.6), T['cant'] + 0.07, 0.3); cue(sparkle(0.6, 2600), T['cant'] + 0.2, 0.18)
cue(slide(320, 950, 0.2), 10.7, 0.25); cue(ting(2637, 0.7), 10.95, 0.25); cue(slide(950, 300, 0.2), 11.24, 0.22)
# garden: the plant is pleased, the mouse learns its lesson
cue(sparkle(0.8, 2093), T['helps'], 0.25); cue(sparkle(0.6, 2637), T['pepper'], 0.2)
for i, at in enumerate(np.arange(12.3, 12.85, 0.09)): cue(tap(1500, 0.03), at, 0.22)
cue(chomp() * 0.7, T['burn2'], 0.5); cue(squeal(), T['scares'], 0.4); cue(fwoosh(0.5), T['scares'] + 0.02, 0.35); cue(hiss(0.6), T['scares'] + 0.1, 0.2)
cue(whoosh(0.35, 1500, 6500), T['off'], 0.55)
for i, at in enumerate(np.arange(T['chew'], T['bits'] - 0.05, 0.11)): cue(chomp() * 0.5, at, 0.32)
cue(chomp(), T['bits'], 0.6); cue(crackle(0.4, 40), T['bits'] + 0.02, 0.35)
# swallow whole, x-ray, take off, the drop, the sprout
cue(gulp(), T['swallow'], 0.6); cue(pop(600, 1300, 0.06), 16.98, 0.4); cue(ting(1760, 0.8), 17.0, 0.25)
cue(flaps(0.7), 17.45, 0.35); cue(slide(1400, 500, 0.38), T['poop'], 0.3); cue(splat(), T['out'], 0.6)
cue(pop(300, 900, 0.08), T['ready'] + 0.02, 0.45); cue(sparkle(0.8, 1568), T['grow'], 0.3); cue(ting(2093, 0.7), T['grow'] + 0.32, 0.25)
cue(flaps(0.4), 18.95, 0.25)
for fn, at, g in cues: place(sfx, fn, at, g)
sfx = hp(sfx, 40)

os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
if os.environ.get('NO_MUSIC'): music[:] = 0          # the owner asked for no background music
save(os.path.join(HERE, 'stems/music.wav'), music / (np.abs(music).max() + 1e-9) * 0.8 if np.abs(music).max() > 0 else music)
save(os.path.join(HERE, 'stems/sfx.wav'), sfx / (np.abs(sfx).max() + 1e-9) * 0.8)
M.main(os.path.join(HERE, 'voice_padded.wav'), os.path.join(HERE, 'stems/music.wav'), os.path.join(HERE, 'stems/sfx.wav'),
       os.path.join(ROOT, 'public/chili2/mix.wav'), DUR, stems_out=os.path.join(HERE, 'stems'))
