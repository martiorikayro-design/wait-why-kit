"""Music bed + SFX stems for the Mona Lisa short (all synthesized), then the 50 % mix.
run: /home/claude/tts/venv/bin/python mona_audio.py   (from this folder)
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../audio'))
import numpy as np
from synth import *
import mix as M

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
DUR = 24.0; N = n_of(DUR)
music = np.zeros(N); sfx = np.zeros(N)

# ------------------------------------------------------------------ music
BPM = 108; B = 60 / BPM; E8 = B / 2; T0 = 2.95       # beat 0 = first tiptoe step; 8ths match the steps
bt = lambda k: T0 + k * B
STOP_HOOK, BUTTON = 2.23, bt(30)                      # the theft; the cut back to the gallery (19.617)

# hook: "superstar" sparkle in D major, stops dead on "stole"
for i, nm in enumerate(['D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'A5', 'D6']):
    at = bt(-5) + i * E8
    if at < STOP_HOOK - 0.05: place(music, celesta(hz(nm), 0.9), at, 0.30)
place(music, pad([hz('D4'), hz('F#4'), hz('A4')], STOP_HOOK - 0.1, a=0.3, rel=0.04), 0.1, 0.20)
for k in (-5, -4, -3, -2):
    place(music, pizz(hz('D2' if k % 2 else 'A2'), 0.4), bt(k), 0.50)
i0, i1 = n_of(STOP_HOOK), n_of(T0 - 0.02)
music[i0:i1] *= np.r_[np.linspace(1, 0, n_of(0.025)), np.zeros(i1 - i0 - n_of(0.025))]

# heist groove: pizz bass on the beats, off-beat pizz chords, brush kit, sneaky bassoon
BARS = ['Dm', 'Dm', 'Gm', 'A7', 'Dm', 'Dm', 'A7', 'Dm']
BASS = {'Dm': ['D2', 'A2', 'D2', 'A2'], 'Gm': ['G2', 'D3', 'G2', 'D3'], 'A7': ['A2', 'E2', 'A2', 'C#3']}
OFF = {'Dm': ['D4', 'F4', 'A4'], 'Gm': ['D4', 'G4', 'Bb4'], 'A7': ['C#4', 'E4', 'G4']}
MEL = {0: [None, 'A2', None, 'Bb2', None, 'A2', 'G#2', 'A2', None, None, 'D3', None, 'F3', None, 'E3', None],
       2: [None, 'G2', None, 'Bb2', None, 'D3', 'C#3', 'D3', None, None, 'E3', None, 'C#3', None, 'A2', None],
       5: [None, 'A2', None, 'Bb2', None, 'A2', 'G#2', 'A2', None, None, 'E3', None, 'C#3', None, 'A2', None]}
APT = 17.84                                            # cut to the apartment: the band drops out
for b, ch in enumerate(BARS):
    for j in range(4):
        k = 4 * b + j; at = bt(k)
        if at >= BUTTON - 0.01: break
        quiet = at >= APT
        place(music, pizz(hz(BASS[ch][j]), 0.42, bright=0.4), at, 0.32 if quiet else 0.55)
        if quiet: continue
        if j % 2 == 0: place(music, kick(), at, 0.22)
        else: place(music, brush(), at, 0.22)
        if b != 4 or j % 2 == 0:                      # bar 5 (time-lapse) is thinner
            for n_ in OFF[ch]: place(music, pizz(hz(n_), 0.25, bright=0.6), at + E8, 0.10)
for b0, phrase in MEL.items():
    for s_, nm in enumerate(phrase):
        at = bt(4 * b0) + s_ * E8
        if nm and at < APT - 0.05:
            place(music, reed(hz(nm), 0.2, dark=0.65), at, 0.42)
# apartment at night: a little music box over a soft pad
for at, nm in [(bt(27), 'A5'), (bt(28), 'F5'), (bt(28.5), 'D5'), (bt(29), 'E5'), (bt(29.5), 'C#5')]:
    place(music, musicbox(hz(nm), 1.2), at, 0.30)
place(music, pad([hz('D3'), hz('F3'), hz('A3')], BUTTON - APT, a=0.4, rel=0.1, cutoff=900), APT, 0.16)
# button on the cut back to the gallery, then silence and a low drone under the twist
for nm, g in [('D2', 0.45), ('D3', 0.28)]: place(music, pizz(hz(nm), 0.5, bright=0.7), BUTTON, g)
place(music, reed(hz('D3'), 0.22, dark=0.5), BUTTON, 0.28)
place(music, brass([hz('D3'), hz('F3'), hz('A3')], 0.24, 0.01, 0.08), BUTTON, 0.3)
place(music, timpani(hz('D2'), 1.0), BUTTON, 0.3)
place(music, drone(DUR - 20.0, 'D2'), 20.0, 0.30)
music = peq(hp(music, 45), 2600, -4.0, 0.8)          # leave the presence band to the voice

# ------------------------------------------------------------------ SFX
cues = []
def cue(fn, at, g): cues.append((fn, at, g))
# hook: press photographers' magnesium flashes, the painting vanishes, the detective's hat pops
for at, g in [(1.19, 0.55), (1.32, 0.42), (1.45, 0.48), (1.60, 0.40)]: cue(flash_poof(0.4), at, g)
cue(pop(280, 1700, 0.09), 2.22, 0.9); cue(whoosh(0.22, 900, 5000), 2.20, 0.5); cue(boing(230, 0.45), 2.26, 0.45)
# white-flash transitions (whoosh peaks on the cut)
for c in (2.84, 17.84, 19.62): cue(whoosh(0.5, 400, 3200), c - 0.27, 0.65)
# tiptoe in, collar fix
t_ = 2.95 + 0.5 / 1.8; i = 0
while t_ < 5.6: cue(tap(900 if i % 2 else 1080), t_, 0.38); t_ += 0.5 / 1.8; i += 1
cue(swish(0.22), 5.55, 0.25)
# polishing the glass
for i, at in enumerate(np.arange(6.5, 8.35, 1 / 2.6)): cue(squeak(i % 2 == 0), at, 0.30)
# the lift: reach, unhook, down to his side; the smock wrap "poof"; the quick exit
cue(swish(0.18), 8.40, 0.25); cue(clunk(), 8.53, 0.7); cue(whoosh(0.3, 600, 3000), 8.52, 0.25)
cue(whoosh(0.45, 300, 1800), 8.8, 0.22); cue(step(True), 9.25, 0.35)
cue(swish(0.32), 9.40, 0.55); cue(plop(700, 260, 0.12), 9.44, 0.4)
for at in np.arange(10.31 + 1 / 6.4, 10.98, 1 / 6.4): cue(tap(1150, 0.04), at, 0.35)
cue(whoosh(0.32, 1200, 6000), 10.55, 0.45)
# a whole day passes: fast clock + the detective pops up
cue(ticks(1.3, rate=10), 11.1, 0.30); cue(whoosh(1.4, 200, 900), 11.05, 0.22)
cue(slide(320, 950, 0.24), 11.04, 0.30); cue(slide(950, 300, 0.28), 12.18, 0.30)
# the guard: boots, a shrug, the thought of a photo shoot
for at in (12.707, 12.934): cue(step(True), at, 0.5)
cue(step(True), 13.05, 0.45); cue(wah(('Bb2', 'A2'), 0.5), 13.21, 0.45)
cue(pop(500, 900, 0.05), 13.36, 0.25); cue(pop(450, 1200, 0.08), 13.42, 0.5)
cue(flash_poof(0.45), 13.75, 0.65); cue(plop(800, 300, 0.1), 14.2, 0.35)
# museum reopens: crowd shuffles in, murmurs, a newspaper blows past, the crowd parts
wal = murmur(3.5); wal *= np.clip(np.minimum(tt(3.5) / 0.7, 1), 0, 1)
wal *= 1 + 0.6 * np.exp(-((tt(3.5) + 14.5 - 16.6) / 0.35) ** 2)          # "ooh" as they lean in
cue(wal, 14.5, 0.45)
for at in np.sort(rng.uniform(14.5, 15.5, 11)): cue(step(False), at, 0.18)
cue(flutter(1.5), 15.0, 0.35)
cue(swish(0.35), 16.85, 0.30); cue(whoosh(0.9, 250, 1600), 16.72, 0.35)
# apartment at night: crickets, candle, the trunk creaks open, eyes peek
cue(crickets(1.78), APT, 0.10); cue(crackle(1.78), APT, 0.12)
cue(creak(0.42, 130), 18.70, 0.55); cue(plop(1200, 900, 0.05), 19.02, 0.28); cue(plop(1200, 900, 0.05), 19.14, 0.24)
# the twist: crowd again (quiet), photographers, the sting, the smile
fin = murmur(1.6) * np.linspace(1, 0, n_of(1.6)) ** 1.5; cue(fin, 19.62, 0.30)
for at in (20.7, 21.1, 21.5, 21.95, 22.4, 22.75): cue(flash_poof(0.3), at, 0.22)
cue(sting('D2'), 22.85, 0.5); cue(pop(600, 1400, 0.05), 22.93, 0.25); cue(sparkle(0.7), 23.07, 0.20)
for fn, at, g in cues: place(sfx, fn, at, g)
sfx = hp(sfx, 40)

# ------------------------------------------------------------------ stems + mix
os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
if os.environ.get('NO_MUSIC'): music[:] = 0          # the owner asked for no background music
save(os.path.join(HERE, 'stems/music.wav'), music / (np.abs(music).max() + 1e-9) * 0.8 if np.abs(music).max() > 0 else music)
save(os.path.join(HERE, 'stems/sfx.wav'), sfx / (np.abs(sfx).max() + 1e-9) * 0.8)
voice = os.path.join(ROOT, 'work/voice/take_1.08.wav')
M.main(voice, os.path.join(HERE, 'stems/music.wav'), os.path.join(HERE, 'stems/sfx.wav'),
       os.path.join(ROOT, 'public/mona/mix.wav'), DUR, stems_out=os.path.join(HERE, 'stems'))
