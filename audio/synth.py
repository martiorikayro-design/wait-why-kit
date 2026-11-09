"""synth.py - free, sample-less cartoon music + SFX synthesis for the Wait, Why? shorts.

Everything is generated from oscillators and filtered noise (48 kHz mono float64), so there is
nothing to license. Ideas adapted from the cartoon-short-kit audio.py (pluck/brass/drum/sting/creak)
plus our own instruments (Karplus-Strong pizzicato, reed, celesta, crowd walla, crickets ...).
"""
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

SR = 48000
rng = np.random.default_rng(11)


# ---------------------------------------------------------------- basics
def n_of(d): return max(1, int(round(d * SR)))
def tt(d): return np.arange(n_of(d)) / SR
def noise(d): return rng.standard_normal(n_of(d))
def _sos(kind, f, o): return butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return sosfilt(_sos('low', min(f, SR * 0.45), o), x)
def hp(x, f, o=2): return sosfilt(_sos('high', f, o), x)
def bp(x, lo, hi, o=2): return sosfilt(_sos('band', [lo, min(hi, SR * 0.45)], o), x)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

_NAMES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def note(s):
    """'D3', 'C#4', 'Bb2' -> MIDI number"""
    k = _NAMES[s[0]]; i = 1
    while i < len(s) and s[i] in '#b':
        k += 1 if s[i] == '#' else -1; i += 1
    return 12 * (int(s[i:]) + 1) + k
def hz(s): return midi(note(s))


def env(d, a=0.005, r=0.2):
    """linear attack then exponential decay (r = time constant)"""
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(r, 1e-4))

def ar(d, a=0.01, rel=0.05):
    """attack / hold / release gate"""
    t = tt(d)
    return np.clip(np.minimum(t / max(a, 1e-4), (d - t) / max(rel, 1e-4)), 0, 1)

def fade(x, fi=0.003, fo=0.01):
    x = x.copy(); a, b = min(n_of(fi), len(x) // 2), min(n_of(fo), len(x) // 2)
    if a < 1 or b < 1: return x
    x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b); return x

def place(buf, x, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += g * x[:n]
    return buf

def sweep(f, d):
    """sine following a frequency array or a function of t"""
    t = tt(d); fr = f(t) if callable(f) else np.full(len(t), float(f))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR)


# ---------------------------------------------------------------- instruments
def pizz(f, d=0.45, bright=0.45, damp=0.994):
    """Karplus-Strong plucked string (pizzicato), short body decay"""
    n = n_of(d); N = max(2, int(round(SR / f - 0.5)))
    exc = lp(rng.uniform(-1, 1, N), 900 + 7000 * bright)
    x = np.zeros(n); x[:N] = exc - exc.mean()
    a = np.zeros(N + 2); a[0] = 1.0; a[N] = a[N + 1] = -0.5 * damp
    y = lfilter([1.0], a, x)
    y = lp(y, 3200) * env(d, 0.002, d * 0.32)
    return fade(y / (np.abs(y).max() + 1e-9))

def reed(f, d=0.2, dark=0.5, vib=0.0, a=0.018, rel=0.05):
    """clarinet/bassoon-ish: odd harmonics + some even, breath, soft attack"""
    t = tt(d)
    ph = 2 * np.pi * f * t + (vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.15))
    s = np.zeros_like(t)
    for k in range(1, 16):
        if k * f > 9000: break
        amp = (1 / k ** 1.15) if k % 2 else (dark * 0.45 / k ** 1.6)
        s += amp * np.sin(k * ph)
    s += 0.02 * lp(noise(d), 3000)
    s = lp(s, 1600 + 2400 * (1 - dark))
    return fade(s * ar(d, a, rel) / 1.6)

def celesta(f, d=1.2, bright=1.0):
    t = tt(d); s = np.zeros_like(t)
    for mult, amp, dec in [(1, 1, 2.6), (2, 0.35 * bright, 4.5), (3, 0.12 * bright, 7), (4.07, 0.08 * bright, 11)]:
        s += amp * np.sin(2 * np.pi * f * mult * t) * np.exp(-dec * t)
    return fade(s * np.minimum(1, t / 0.002) / 1.4)

def musicbox(f, d=1.4):
    t = tt(d)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-3 * t) + 0.5 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-5 * t)
         + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-14 * t))
    click = hp(noise(0.01), 3000) * np.exp(-tt(0.01) * 500) * 0.3
    s[:len(click)] += click
    return fade(s * np.minimum(1, t / 0.001) / 1.6)

def pad(freqs, d, a=0.35, rel=0.5, cutoff=1400):
    """soft string pad: detuned saws, low-passed"""
    t = tt(d); s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.004):
            ph = (f * (1 + det) * t) % 1.0
            s += 2 * ph - 1
    s = lp(s, cutoff, 2) / (2 * len(freqs))
    return fade(s * ar(d, a, rel))

def brass(freqs, d, a=0.06, rel=0.12, cutoff=1900):
    t = tt(d); s = np.zeros_like(t)
    for f in freqs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(10) if (k + 1) * f < 9000)
    return fade(lp(s * ar(d, a, rel), cutoff) / max(1, len(freqs)) / 1.8)

def kick(soft=True):
    d = 0.32; t = tt(d); f = 48 + (70 if soft else 110) * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (11 if soft else 8))
    return fade(s)

def brush(d=0.16):
    """brush snare 'tss'"""
    t = tt(d); s = hp(noise(d), 1800) * np.minimum(1, t / 0.012) * np.exp(-t * 22)
    return fade(lp(s, 9000) * 0.6)

def snare():
    d = 0.18; t = tt(d)
    s = noise(d) * np.exp(-t * 28) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5
    return fade(hp(s, 300))

def woodblock(f=1100):
    t = tt(0.08)
    return fade((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t * 60))

def timpani(f=73.4, d=1.4):
    t = tt(d); fr = f * (1 + 0.06 * np.exp(-t * 8))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 2.2)
    s += 0.6 * lp(noise(d), 400) * np.exp(-t * 25)
    return fade(s)

def drone(d, root='D2'):
    f = hz(root); t = tt(d)
    s = (np.sin(2 * np.pi * f * t) + 0.55 * np.sin(2 * np.pi * f * 1.5 * t + 0.3 * np.sin(2 * np.pi * 0.23 * t))
         + 0.35 * np.sin(2 * np.pi * f * 2.003 * t) + 0.2 * np.sin(2 * np.pi * f * 3.0 * t))
    s += 0.05 * lp(noise(d), 300)
    return fade(lp(s, 520) * np.minimum(1, t / 1.0) / 2.1, 0.01, 0.2)


# ---------------------------------------------------------------- SFX
def whoosh(d=0.45, lo=350, hi=2600):
    """air swish whose band rises then falls; envelope peaks in the middle"""
    t = tt(d); u = t / d
    a = bp(noise(d), lo, hi * 0.6); b = bp(noise(d), lo * 2.2, hi)
    mixu = np.sin(np.pi * u)
    s = a * (1 - mixu) + b * mixu
    return fade(s * np.sin(np.pi * u) ** 2.2)

def swish(d=0.28):
    """cloth / fabric flap"""
    t = tt(d); u = t / d
    s = bp(noise(d), 1200, 6500) * (0.55 + 0.45 * np.sin(2 * np.pi * 22 * t)) * np.sin(np.pi * u) ** 1.5
    return fade(s)

def pop(f0=420, f1=1300, d=0.07):
    s = sweep(lambda t: f0 * (f1 / f0) ** (t / d), d) * env(d, 0.001, d * 0.35)
    s[:n_of(0.003)] += hp(noise(0.003), 2000) * 0.5
    return fade(s)

def plop(f0=900, f1=300, d=0.09):
    return fade(sweep(lambda t: f0 * (f1 / f0) ** (t / d), d) * env(d, 0.001, d * 0.4))

def boing(f=170, d=0.6, depth=0.28):
    s = sweep(lambda t: f * (1 + 0.35 * t / d) * (1 + depth * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 5)), d)
    s += 0.3 * sweep(lambda t: 2 * f * (1 + 0.35 * t / d) * (1 + depth * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 5)), d)
    return fade(s * env(d, 0.003, d * 0.4))

def click(f=3200, d=0.012):
    return fade(bp(noise(d), f * 0.6, f * 1.8) * np.exp(-tt(d) * 600))

def shutter():
    s = np.zeros(n_of(0.09)); place(s, click(2600), 0.0); place(s, click(3600), 0.045, 0.8)
    return s

def flash_poof(d=0.45):
    """1911 magnesium flash: a 'fwump' plus a hiss that darkens"""
    t = tt(d)
    hiss = noise(d); hi = lp(hiss, 7000) * np.exp(-t * 14); lo_ = lp(hiss, 900) * np.exp(-t * 7)
    thump = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 18)
    s = 0.45 * hi + 0.6 * lo_ + 0.7 * thump
    s[:n_of(0.012)] += shutter()[:n_of(0.012)] * 0.6
    return fade(s * np.minimum(1, t / 0.004))

def tap(f=950, d=0.05):
    """tiptoe tap"""
    t = tt(d); s = (np.sin(2 * np.pi * f * t) * 0.6 + bp(noise(d), 1500, 5000) * 0.5) * np.exp(-t * 85)
    return fade(s)

def step(heavy=False):
    d = 0.14; t = tt(d)
    thud = np.sin(2 * np.pi * (60 if heavy else 85) * t) * np.exp(-t * (30 if heavy else 45))
    scuff = lp(noise(d), 1400 if heavy else 2600) * np.exp(-t * (40 if heavy else 60))
    return fade(thud * (1.0 if heavy else 0.6) + scuff * 0.5)

def squeak(up=True, d=0.13):
    t = tt(d); u = t / d
    f = 2100 + (700 * u if up else 700 * (1 - u)) + 60 * np.sin(2 * np.pi * 42 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    s = s * (0.6 + 0.4 * (np.sin(2 * np.pi * 45 * t) > 0)) + 0.15 * bp(noise(d), 2000, 6000)
    return fade(s * np.sin(np.pi * u) ** 0.8)

def clunk():
    d = 0.25; t = tt(d)
    body = np.sin(2 * np.pi * (180 + 80 * np.exp(-t * 40)) * t) * np.exp(-t * 26)
    knock = bp(noise(d), 300, 1500) * np.exp(-t * 55)
    s = body + 0.6 * knock; s[:n_of(0.008)] += click(2500, 0.008) * 0.6
    return fade(s)

def creak(d=0.5, f0=120):
    t = tt(d)
    rate = f0 * (1 + 0.45 * np.sin(2 * np.pi * 1.3 * t / d) + 0.1 * np.sin(2 * np.pi * 9 * t))
    ph = np.cumsum(rate) / SR
    pulses = (np.mod(ph, 1) < 0.07).astype(float) * (0.6 + 0.4 * rng.random(len(t)))
    s = lp(pulses, 2400) * np.sin(np.pi * t / d)
    return fade(hp(s, 200) * 2.5)

def ting(f=2093, d=1.2):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * ff * t) * np.exp(-t * k) for ff, k in [(f, 4), (f * 1.5, 6), (f * 2, 8)])
    return fade(s * 0.33)

def sparkle(d=0.8, base=1800):
    s = np.zeros(n_of(d))
    for i, at in enumerate(np.linspace(0, d * 0.55, 6)):
        place(s, ting(base * 2 ** (i / 6), 0.5) * (1 - i * 0.1), at)
    return fade(s)

def sting(root='D1'):
    d = 2.0; t = tt(d); f = hz(root)
    low = np.sin(2 * np.pi * (f * 1.02) * t) * np.exp(-t * 1.5) * 1.2
    hit = lp(noise(d), 900) * np.exp(-t * 6) * 0.8
    stab = brass([hz('D3'), hz('F3'), hz('Ab3')], 1.4, 0.02, 0.6)
    s = low + hit; s[:len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return fade(s)

def crickets(d, density=1.6, f=4400):
    out = np.zeros(n_of(d)); at = 0.1
    while at < d - 0.3:
        for p in range(3):
            pd = 0.022; tp = tt(pd)
            chirp = np.sin(2 * np.pi * f * tp) * np.sin(np.pi * tp / pd) ** 2
            place(out, chirp, at + p * 0.034)
        at += rng.uniform(0.6, 1.1) / density
    return out

def crackle(d, rate=7):
    out = np.zeros(n_of(d))
    for at in np.sort(rng.uniform(0, d, int(rate * d))):
        place(out, bp(noise(0.006), 1500, 7000) * np.exp(-tt(0.006) * 700) * rng.uniform(0.2, 1), at)
    return out

def murmur(d, voices=14):
    """crowd walla: band-limited noise with syllable-rate envelopes and vowel-ish bands"""
    out = np.zeros(n_of(d)); t = tt(d)
    for v in range(voices):
        lo, hi = rng.uniform(250, 450), rng.uniform(1100, 2600)
        src = bp(noise(d), lo, hi)
        rate = rng.uniform(2.8, 5.5); ph = rng.uniform(0, 6.28)
        syl = np.clip(np.sin(2 * np.pi * rate * t + ph + 0.8 * np.sin(2 * np.pi * 0.7 * t + v)), 0, 1) ** 1.5
        phrase = np.clip(np.sin(2 * np.pi * rng.uniform(0.15, 0.35) * t + rng.uniform(0, 6.28)) + 0.3, 0, 1)
        out += src * syl * phrase
    return fade(lp(out, 2400) / np.sqrt(voices), 0.2, 0.3)

def flutter(d=1.5):
    """paper flapping through the air"""
    t = tt(d)
    s = bp(noise(d), 1400, 7000) * (0.35 + 0.65 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.sin(np.pi * t / d) ** 1.2
    return fade(s)

def ticks(d, rate=8, f=2600):
    out = np.zeros(n_of(d))
    for i, at in enumerate(np.arange(0, d, 1 / rate)):
        place(out, woodblock(f if i % 2 == 0 else f * 0.8) * 0.8, at)
    return out

def slide(f0, f1, d=0.45):
    """slide whistle"""
    s = sweep(lambda t: f0 * (f1 / f0) ** (t / d) * (1 + 0.01 * np.sin(2 * np.pi * 6 * t)), d)
    s += 0.06 * bp(noise(d), 1500, 5000)
    return fade(s * ar(d, 0.03, 0.08))

def wah(notes=('Bb2', 'A2'), d=0.6):
    """muted-brass 'wah-wah' (a shrug): each note opens then closes its filter, the last one sags"""
    out = np.zeros(n_of(d)); k = len(notes); seg = d / k
    for i, nm in enumerate(notes):
        t = tt(seg); f = hz(nm) * (1 - (0.05 if i == k - 1 else 0) * t / seg)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin((j + 1) * ph) / (j + 1) ** 1.2 for j in range(12))
        w = np.sin(np.pi * np.minimum(1, t / (seg * 0.8)))
        s = lp(s, 450) * (1 - w) + lp(s, 1700) * w
        place(out, fade(s * ar(seg, 0.03, 0.08) / 2.2), i * seg)
    return out


def peq(x, f0, gain_db, q=0.9):
    """RBJ peaking EQ (use a negative gain to carve room for the voice)"""
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / SR; al = np.sin(w0) / (2 * q); c = np.cos(w0)
    b = np.array([1 + al * A, -2 * c, 1 - al * A]); a = np.array([1 + al / A, -2 * c, 1 - al / A])
    return lfilter(b / a[0], a / a[0], x)

def save(path, x):
    import soundfile as sf
    sf.write(path, np.asarray(x, dtype=np.float32), SR, subtype='FLOAT')
