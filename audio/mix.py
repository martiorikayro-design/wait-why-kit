"""mix.py - lock the music bed and SFX to the voice, then finish to YouTube loudness.

Rules (from the cartoon-audio-short skill):
  * music gated RMS = 50 % of the voice gated RMS (-6.0 dB)
  * SFX gated RMS  <= 50 % of the voice, every SFX peak <= 0.7 x the voice peak
  * no ducking / compression; the whole mix gets ONE linear gain to -14 LUFS plus a peak limiter

usage: python mix.py voice.wav music.wav sfx.wav out.wav [duration_s]
"""
import sys, json
from math import gcd
import numpy as np, soundfile as sf
from scipy.signal import lfilter, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000
db = lambda r: 20 * np.log10(max(r, 1e-12))


def load(path, dur=None):
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g)
    if dur:
        n = int(round(dur * SR)); x = np.pad(x, (0, max(0, n - len(x))))[:n]
    return x


def _block_ms(x, block=0.4, hop=0.1):
    n, h = int(block * SR), int(hop * SR)
    if len(x) < n: x = np.pad(x, (0, n - len(x)))
    idx = np.arange(0, len(x) - n + 1, h)
    cs = np.concatenate([[0.0], np.cumsum(x * x)])
    return (cs[idx + n] - cs[idx]) / n


def gated_rms(x, abs_db=-60.0, rel_db=-10.0):
    """RMS over 400 ms blocks, absolute gate then a relative gate (like BS.1770, unweighted)"""
    ms = _block_ms(x)
    ms = ms[ms > 10 ** (abs_db / 10)]
    if len(ms) == 0: return 0.0
    ms = ms[ms > ms.mean() * 10 ** (rel_db / 10)]
    return float(np.sqrt(ms.mean()))


def kweight(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def lufs(x):
    ms = _block_ms(kweight(x))
    ms = ms[-0.691 + 10 * np.log10(ms + 1e-20) > -70]
    if len(ms) == 0: return -99.0
    rel = -0.691 + 10 * np.log10(ms.mean()) - 10
    ms = ms[-0.691 + 10 * np.log10(ms + 1e-20) > rel]
    return float(-0.691 + 10 * np.log10(ms.mean()))


def true_peak(x): return float(np.abs(resample_poly(x, 4, 1)).max())


def limiter(x, ceiling, look=0.004, release=0.04, tp=False):
    """look-ahead peak limiter: gain never above ceiling/|x| at any sample, smooth release.
    tp=True measures the 4x-oversampled (true) peak around every sample."""
    L = max(1, int(look * SR))
    a = np.abs(x)
    if tp:
        up = np.abs(resample_poly(x, 4, 1))[:len(x) * 4]
        a = np.maximum(a, up.reshape(-1, 4).max(axis=1))
    g = np.minimum(1.0, ceiling / np.maximum(a, 1e-12))
    if g.min() >= 1.0: return x.copy()
    g = minimum_filter1d(g, size=2 * L + 1)
    g = np.minimum(g, uniform_filter1d(g, size=L + 1))
    rc = np.exp(-1.0 / (release * SR)); y = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else 1.0 - (1.0 - cur) * rc
        y[i] = cur
    y = np.minimum(y, minimum_filter1d(g, size=2 * L + 1))
    return x * y


def compress(x, thresh_db, ratio=3.0, tc=0.012, smooth=0.006):
    """gentle feed-forward RMS compressor (used on the narration stem only, before the lock)"""
    a = 1 - np.exp(-1 / (tc * SR))
    lev = np.sqrt(np.maximum(lfilter([a], [1, a - 1], x * x), 1e-20))
    over = np.maximum(0.0, 20 * np.log10(lev) - thresh_db)
    gdb = -over * (1 - 1 / ratio)
    b = 1 - np.exp(-1 / (smooth * SR))
    gdb = lfilter([b], [1, b - 1], gdb)
    return x * 10 ** (gdb / 20)


def voice_chain(v, crest_db=10.5):
    """narration polish for TTS: 3:1 compression above (gated RMS + 3 dB), then peaks held to RMS + crest_db"""
    r = gated_rms(v)
    y = compress(v, db(r) + 1.0, 3.0)
    y *= r / gated_rms(y)
    y = limiter(y, gated_rms(y) * 10 ** (crest_db / 20), look=0.003, release=0.02)
    return y


def tame(x, crest_db, release=0.03):
    """bus peak control for a music/SFX stem before the lock: peaks held to (gated RMS + crest_db)"""
    r = gated_rms(x)
    if r <= 0: return x
    return limiter(x, r * 10 ** (crest_db / 20), look=0.003, release=release)


def lock(voice, music, sfx, music_ratio=0.5, sfx_ratio=0.3, sfx_peak=0.5, music_crest=11.0, sfx_crest=12.0):
    music, sfx = tame(music, music_crest, 0.04), tame(sfx, sfx_crest, 0.02)
    vr, vp = gated_rms(voice), float(np.abs(voice).max())
    rep = {'voice_gated_rms_dbfs': round(db(vr), 2), 'voice_peak_dbfs': round(db(vp), 2)}
    mr = gated_rms(music)
    m = music * (music_ratio * vr / mr) if mr > 0 else music
    rep['music_vs_voice_db'] = round(db(gated_rms(m) / vr), 2) if mr > 0 else None
    sr_ = gated_rms(sfx)
    s = sfx * (sfx_ratio * vr / sr_) if sr_ > 0 else sfx
    for _ in range(6):
        s = limiter(s, sfx_peak * vp, look=0.002, release=0.03)
        r = gated_rms(s)
        if r <= sfx_ratio * vr * 1.001: break
        s *= sfx_ratio * vr / r
    if sr_ > 0:
        rep['sfx_vs_voice_db'] = round(db(gated_rms(s) / vr), 2)
        rep['sfx_peak_vs_voice_peak'] = round(float(np.abs(s).max()) / vp, 3)
    return m, s, rep


def finish(mix, target=-14.0, tp_max=-1.5):
    """one linear gain to the loudness target + a look-ahead peak limiter (re-aimed if the limiter costs loudness)"""
    L0 = lufs(mix); g = 10 ** ((target - L0) / 20); g0 = g
    ceil = 10 ** ((tp_max - 0.3) / 20)
    for _ in range(5):
        y = mix * g
        z = limiter(y, ceil, tp=True)
        while db(true_peak(z)) > tp_max:
            ceil *= 10 ** (-0.3 / 20); z = limiter(y, ceil, tp=True)
        L = lufs(z)
        if abs(L - target) < 0.15: break
        g_new = g * 10 ** ((target - L) / 20)
        if db(g_new / g0) > 1.5: g = g0 * 10 ** (1.5 / 20); y = mix * g; z = limiter(y, ceil, tp=True); break
        g = g_new
    gr = db(np.maximum(np.abs(y), 1e-9).max() / ceil) if np.abs(y).max() > ceil else 0.0
    act = np.abs(y) > 1e-4
    grc = -20 * np.log10(np.clip(np.abs(z[act]) / np.abs(y[act]), 1e-6, 1))
    busy = {f'>{k}dB': round(float(np.mean(grc > k)) * 100, 2) for k in (1, 3, 6)}
    return z, {'pre_lufs': round(L0, 2), 'linear_gain_db': round(db(g), 2), 'final_lufs': round(lufs(z), 2),
               'true_peak_dbtp': round(db(true_peak(z)), 2), 'limiter_ceiling_dbfs': round(db(ceil), 2),
               'limiter_max_gr_db': round(gr, 2), 'limiter_time_pct': busy}


def main(vpath, mpath, spath, out, dur=None, polish=True, stems_out=None, music_ratio=0.5):
    v = load(vpath, dur); dur = dur or len(v) / SR
    crest0 = db(np.abs(v).max() / gated_rms(v))
    if polish: v = voice_chain(v)
    m, s = load(mpath, dur), load(spath, dur)
    m, s, rep = lock(v, m, s, music_ratio=music_ratio)
    rep['voice_crest_db'] = [round(crest0, 1), round(db(np.abs(v).max() / gated_rms(v)), 1)]
    y, rep2 = finish(v + m + s)
    rep.update(rep2)
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24')
    if stems_out:
        g = 10 ** (rep2['linear_gain_db'] / 20)
        for nm, x in (('voice', v), ('music', m), ('sfx', s)):
            sf.write(f'{stems_out}/{nm}_final.wav', (x * g).astype(np.float32), SR, subtype='FLOAT')
    print(json.dumps(rep, indent=1))
    return rep


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], a[2], a[3], float(a[4]) if len(a) > 4 else None)
