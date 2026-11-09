"""captions.py - word-timed caption chunks (+ SRT) from Kokoro word times.

usage: python captions.py words.json offset out_captions.json out.srt [merges.json]
  merges.json: [["one hundred ninety-four", "194"], ...]  (spoken words -> shown text; timed at the first word)
Chunks break after sentence punctuation, after commas/colons when the chunk already has 2+ words,
or at 4 words / 24 characters.
"""
import sys, json, re

words = json.load(open(sys.argv[1]))
off = float(sys.argv[2])
merges = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else []

toks = []  # (text, start, end, punct_after)
for w in words:
    if re.fullmatch(r'[\.,:;!?]+', w['w']):
        if toks: toks[-1][3] += w['w']
        continue
    toks.append([w['w'], w['s'] + off, w['e'] + off, ''])

# merge spoken numbers into digits
i, out = 0, []
while i < len(toks):
    done = False
    for spoken, shown in merges:
        n = len(spoken.split())
        seq = ' '.join(t[0].lower() for t in toks[i:i + n])
        if seq == spoken.lower():
            out.append([shown, toks[i][1], toks[i + n - 1][2], toks[i + n - 1][3]]); i += n; done = True; break
    if not done:
        out.append(toks[i]); i += 1
toks = out

chunks, cur = [], []
SOFT = {'and', 'but', 'or', 'into', 'in', 'to', 'of', 'with', 'that', 'which', 'when', 'because'}
for k, (txt, s, e, p) in enumerate(toks):
    nxt = toks[k + 1][0] if k + 1 < len(toks) else None
    if cur and nxt is not None and False: pass
    cur.append((txt, s, e))
    chars = sum(len(c[0]) + 1 for c in cur) - 1
    brk = any(ch in p for ch in '.!?:,') or len(cur) >= 5
    if not brk and nxt is not None:
        if chars + 1 + len(nxt) > 24: brk = True
        elif nxt.lower() in SOFT and len(cur) >= 3: brk = True
    if brk or k == len(toks) - 1:
        chunks.append(cur); cur = []

caps = []
for j, c in enumerate(chunks):
    start = max(0.0, c[0][1] - 0.05)
    end = (chunks[j + 1][0][1] - 0.05) if j + 1 < len(chunks) else c[-1][2] + 0.6
    caps.append({'start': round(start, 3), 'end': round(end, 3),
                 'words': [{'text': re.sub(r'[^\w\'\-,~+#]', '', w[0]).upper().strip(','), 'raw': w[0], 'at': round(w[1], 3)} for w in c]})
json.dump(caps, open(sys.argv[3], 'w'), indent=1)

def ts(x):
    h, m = int(x // 3600), int(x % 3600 // 60); s = x % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
with open(sys.argv[4], 'w') as f:
    for j, c in enumerate(caps):
        f.write(f"{j + 1}\n{ts(c['start'])} --> {ts(c['end'])}\n{' '.join(w['raw'] for w in c['words'])}\n\n")
print(len(caps), 'chunks')
for c in caps: print(round(c['start'], 2), ' '.join(w['text'] for w in c['words']))
