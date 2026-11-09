# tts_gaps.py SCRIPT.txt VOICE SPEED OUT.wav "g1,g2,..."
# One Kokoro pass per sentence, silence trimmed, then joined with the given gaps (seconds).
# Writes OUT.wav (24 kHz) + OUT.json (word times on the joined timeline).
import sys, re, json, numpy as np, soundfile as sf
from kokoro import KPipeline

text = open(sys.argv[1]).read().strip()
voice, speed, out = sys.argv[2], float(sys.argv[3]), sys.argv[4]
gaps = [float(g) for g in sys.argv[5].split(',')]
sents = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
SR = 24000
pieces, words, t = [], [], 0.0
for i, s in enumerate(sents):
    aud, toks = [], []
    off = 0.0
    for r in pipe(s, voice=voice, speed=speed, split_pattern=None):
        a = r.audio.cpu().numpy() if hasattr(r.audio, 'cpu') else np.asarray(r.audio)
        for tok in (r.tokens or []):
            if getattr(tok, 'start_ts', None) is not None:
                toks.append((tok.text, off + tok.start_ts, off + tok.end_ts))
        aud.append(a); off += len(a) / SR
    a = np.concatenate(aud)
    env = np.abs(a) > 10 ** (-45 / 20)
    i0 = max(0, int(np.argmax(env)) - int(0.03 * SR))
    i1 = min(len(a), len(a) - int(np.argmax(env[::-1])) + int(0.06 * SR))
    a = a[i0:i1]; lead = i0 / SR
    for w, s0, e0 in toks:
        words.append({'w': w, 's': round(t + s0 - lead, 3), 'e': round(t + e0 - lead, 3)})
    pieces.append(a); t += len(a) / SR
    if i < len(sents) - 1:
        g = gaps[i] if i < len(gaps) else 0.25
        pieces.append(np.zeros(int(g * SR))); t += g
    print(f'{i}: {len(a) / SR:.2f}s  {s}')
y = np.concatenate(pieces)
sf.write(out, y, SR)
json.dump(words, open(out.replace('.wav', '.json'), 'w'), indent=1)
print('total %.2f s' % (len(y) / SR))
