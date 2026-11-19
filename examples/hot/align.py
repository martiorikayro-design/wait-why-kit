"""Word times for a voice take without a speech model.
Split the audio at its pauses, then find (by dynamic programming) the way to give the script's words, in order, to the
speech segments so that each segment's length matches its syllable count; breaks at , . : are preferred.
usage: python align.py take.wav script.txt out.json [silence_dB=-38] [min_pause=0.10]"""
import json, re, subprocess, sys

wav, script, out = sys.argv[1:4]
db = sys.argv[4] if len(sys.argv) > 4 else '-38'
dmin = sys.argv[5] if len(sys.argv) > 5 else '0.10'
txt = open(script).read().strip()
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
e = subprocess.run(['ffmpeg', '-i', wav, '-af', f'silencedetect=n={db}dB:d={dmin}', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', e)]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', e)]
segs, t = [], 0.0
for i, s in enumerate(st):
    if s - t > 0.06: segs.append((t, s))
    t = en[i] if i < len(en) else dur
if dur - t > 0.06: segs.append((t, dur))

def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower())
    n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and not w.endswith(('le', 'ee')) and n > 1: n -= 1
    return max(1, n)

raw = txt.split()
words = [w.strip(',.:') for w in raw]
S = [syl(w) for w in words]
brk = [bool(re.search(r'[,.:]$', w)) for w in raw]  # break allowed after word i
N, M = len(words), len(segs)
speech = sum(b - a for a, b in segs)
r = speech / sum(S)  # seconds per syllable
cum = [0]
for s in S: cum.append(cum[-1] + s)
INF = 1e18
# dp[j][i]: best cost with the first j segments consuming the first i words (every segment takes >=1 word, or is skipped as noise)
dp = [[INF] * (N + 1) for _ in range(M + 1)]
bk = [[None] * (N + 1) for _ in range(M + 1)]
dp[0][0] = 0
for j in range(1, M + 1):
    d = segs[j - 1][1] - segs[j - 1][0]
    for i in range(N + 1):
        if dp[j - 1][i] < INF and d < 0.35:  # a tiny blip may be noise: skip it
            c = dp[j - 1][i] + 0.4
            if c < dp[j][i]: dp[j][i], bk[j][i] = c, (i, 'skip')
        for k in range(1, i + 1):
            p = dp[j - 1][i - k]
            if p >= INF: continue
            syls = cum[i] - cum[i - k]
            c = p + (d - r * syls) ** 2 / (r * syls + 0.25)
            if i < N and not brk[i - 1]: c += 0.5  # pause in the middle of a phrase
            if c < dp[j][i]: dp[j][i], bk[j][i] = c, (i - k, 'take')
assert dp[M][N] < INF, 'no alignment'
groups, j, i = [], M, N
while j > 0:
    pi, kind = bk[j][i]
    if kind == 'take': groups.append((j - 1, pi, i))
    i, j = pi, j - 1
groups.reverse()
res = []
for sj, a, b in groups:
    s0, s1 = segs[sj]
    wt = [S[k] + 0.35 for k in range(a, b)]
    tot, c = sum(wt), s0
    for k, x in zip(range(a, b), wt):
        l = (s1 - s0) * x / tot
        res.append({'raw': words[k], 'at': round(c, 3), 'end': round(c + l, 3)})
        c += l
json.dump({'duration': dur, 'segments': segs, 'words': res}, open(out, 'w'), indent=1)
print(f'{M} segments, {N} words, rate {r:.3f}s/syl, cost {dp[M][N]:.2f}')
for sj, a, b in groups:
    print(f'{segs[sj][0]:6.2f}-{segs[sj][1]:6.2f}  {" ".join(words[a:b])}')
