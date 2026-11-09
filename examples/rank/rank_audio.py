"""Music bed + SFX for the longevity ranking short, mixed at 50 % of the voice.
run: /home/claude/tts/venv/bin/python rank_audio.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../audio'))
import numpy as np
from synth import *
import mix as M

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
DUR = 25.0; N = n_of(DUR)
music = np.zeros(N); sfx = np.zeros(N)

# entries (composition seconds, voice at +0.15)
E6, E5, E4, E3, E2, E1 = 2.17, 6.92, 9.48, 12.59, 14.73, 18.22
RUSH0, RUSH1 = 17.55, 18.4
HURT, OLD, TURN, BABY, START = 20.41, 20.91, 21.62, 22.56, 23.47

# ------------------------------------------------------------------ music
BPM = 104; B = 60 / BPM; E8 = B / 2
# sections: (start, end, chord notes, bass root) - the key steps down as we dive, then jumps back up
SECT = [
    (2.0, E5, ['F3', 'A3', 'C4'], 'F2'),
    (E5, E4, ['Eb3', 'G3', 'Bb3'], 'Eb2'),
    (E4, E3, ['D3', 'F3', 'A3'], 'D2'),
    (E3, E2, ['C3', 'Eb3', 'G3'], 'C2'),
    (E2, RUSH0, ['Bb2', 'Db3', 'F3'], 'Bb1'),
    (RUSH1, HURT - 0.1, ['F3', 'A3', 'C4'], 'F2'),
    (START, DUR, ['F3', 'A3', 'C4'], 'F2'),
]
# hook: a mysterious drone and a two-note celesta question
place(music, drone(2.0, 'D2'), 0.0, 0.5)
for at, nm in [(0.25, 'A5'), (0.55, 'C6'), (1.2, 'A5'), (1.5, 'D6')]:
    place(music, celesta(hz(nm), 1.0), at, 0.28)
for (a, b, ch, root) in SECT:
    k = 0; t_ = a
    place(music, pad([hz(n) for n in ch], b - a + 0.05, a=0.2, rel=0.12, cutoff=1100), a, 0.16)
    while t_ < b - 0.02:
        beat = k % 2 == 0
        pat = [root, ch[2][:-1] + str(int(ch[2][-1]) - 1), root[:-1] + str(int(root[-1]) + 1), ch[2][:-1] + str(int(ch[2][-1]) - 1)]
        place(music, pizz(hz(pat[k % 4]), 0.35, bright=0.45), t_, 0.42 if beat else 0.26)
        if beat and (k // 2) % 2 == 0: place(music, kick(), t_, 0.16)
        place(music, brush(0.08), t_ + E8 * 0.5, 0.05)
        if k % 8 == 0:
            for j, n_ in enumerate(ch):
                place(music, celesta(hz(n_[:-1] + str(int(n_[-1]) + 2)), 0.8), t_ + j * 0.09, 0.14)
        t_ += E8; k += 1
# rush to the surface: a celesta glissando up
gl = ['F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6']
for i, nm in enumerate(gl):
    place(music, celesta(hz(nm), 0.7), RUSH0 + 0.08 + i * 0.11, 0.24)
# "when it's hurt or old": everything thins to a minor pad
place(music, pad([hz('F3'), hz('Ab3'), hz('C4')], BABY - HURT + 0.1, a=0.3, rel=0.2, cutoff=900), HURT - 0.1, 0.18)
for at, nm in [(HURT + 0.1, 'C5'), (OLD + 0.1, 'Ab4'), (TURN, 'F4')]:
    place(music, celesta(hz(nm), 1.2), at, 0.2)
# baby stage: a music-box lullaby, then the groove starts over
for i, nm in enumerate(['C6', 'A5', 'F5', 'A5', 'G5']):
    place(music, musicbox(hz(nm), 1.0), BABY + i * 0.18, 0.26)
music = peq(hp(music, 45), 2600, -4.0, 0.8)

# ------------------------------------------------------------------ SFX
cues = []
def cue(fn, at, g): cues.append((fn, at, g))
# hook
cue(sparkle(0.7, 2400), 0.3, 0.18)
cue(timpani(hz('D2'), 1.0), 1.47, 0.35); cue(boing(260, 0.35), 1.5, 0.22)
cue(whoosh(0.5, 400, 3200), 2.0 - 0.27, 0.55)
# badge pops + the detective ageing poof on every entry
for i, e in enumerate([E6, E5, E4, E3, E2, E1]):
    cue(pop(500, 1300, 0.06), e, 0.55); cue(ting(1568 if i < 5 else 2093, 0.8), e + 0.02, 0.22)
    if i < 5:
        cue(whoosh(0.3, 600, 2500), e - 0.05, 0.25); cue(plop(500, 220, 0.1), e + 0.05, 0.25)
        if i >= 2: cue(creak(0.32, 150 + i * 10), e + 0.25, 0.30)
# age counters tick while they roll, a ding on the final value
for (c0, c1) in [(4.82, 5.57), (8.30, 8.95), (11.11, 11.91), (13.47, 14.17), (16.19, 16.94)]:
    for at in np.arange(c0, c1, 1 / 16): cue(woodblock(2600), at, 0.12)
    cue(ting(2637, 0.6), c1, 0.25)
# dives between entries
for a, b in [(6.55, 7.05), (9.2, 9.7), (12.3, 12.8), (14.45, 15.0)]:
    cue(whoosh(b - a + 0.15, 250, 1500), a - 0.05, 0.4)
    for j in range(4): cue(pop(700 + j * 120, 1300 + j * 150, 0.04), a + 0.1 + j * 0.09, 0.18)
# whale spout + a low whale moan
spray = hp(noise(0.7), 1200) * np.sin(np.pi * tt(0.7) / 0.7) ** 0.7 * np.exp(-tt(0.7) * 1.5)
cue(spray, 7.5, 0.25)
moan = sweep(lambda t: 210 - 70 * t / 1.3, 1.3); moan = lp(moan + 0.5 * np.sign(moan) * 0.2, 800) * np.sin(np.pi * tt(1.3) / 1.3)
cue(moan, 7.85, 0.15)
# glass shimmer on the sponge, the big rush up, the reveal
cue(sparkle(0.9, 2600), 15.45, 0.22)
cue(whoosh(0.95, 200, 2400), RUSH0, 0.6)
for j in range(10): cue(pop(600 + j * 80, 1400 + j * 100, 0.04), RUSH0 + 0.05 + j * 0.07, 0.16)
cue(sparkle(0.8, 2093), RUSH1 + 0.05, 0.25); cue(sparkle(1.0, 1568), 19.1, 0.28)
# hurt, old, rewind, baby, start over
cue(clunk(), HURT, 0.35); cue(pop(400, 900, 0.05), HURT + 0.05, 0.3)
cue(creak(0.45, 120), OLD, 0.35)
rew = np.zeros(n_of(0.7))
for j, at in enumerate(np.arange(0, 0.65, 0.035)): place(rew, woodblock(3200 - j * 90), at, 0.7)
cue(rew, TURN - 0.05, 0.28); cue(whoosh(0.6, 900, 4000)[::-1].copy(), TURN, 0.25)
cue(whoosh(0.3, 600, 2500), BABY - 0.05, 0.3); cue(plop(500, 220, 0.1), BABY + 0.05, 0.3)
sq = np.zeros(n_of(0.4))
for j in range(2): place(sq, squeak(True, 0.12) * 0.9, j * 0.17)
cue(sq, BABY + 0.25, 0.30)
cue(sparkle(0.9, 2093), START, 0.25)
for j in range(6): cue(pop(800 + j * 90, 1500 + j * 120, 0.04), START + 0.1 + j * 0.15, 0.14)
for fn, at, g in cues: place(sfx, fn, at, g)
sfx = hp(sfx, 40)

# ------------------------------------------------------------------ stems + mix
os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
if os.environ.get('NO_MUSIC'): music[:] = 0          # the owner asked for no background music
save(os.path.join(HERE, 'stems/music.wav'), music / (np.abs(music).max() + 1e-9) * 0.8 if np.abs(music).max() > 0 else music)
save(os.path.join(HERE, 'stems/sfx.wav'), sfx / (np.abs(sfx).max() + 1e-9) * 0.8)
M.main(os.path.join(HERE, 'voice_padded.wav'), os.path.join(HERE, 'stems/music.wav'), os.path.join(HERE, 'stems/sfx.wav'),
       os.path.join(ROOT, 'public/rank/mix.wav'), DUR, stems_out=os.path.join(HERE, 'stems'))
