# tts.py SCRIPT.txt VOICE SPEED OUT.wav  -> OUT.wav (24 kHz) + OUT.json (word times from Kokoro)
import sys, json, numpy as np, soundfile as sf
from kokoro import KPipeline
text = open(sys.argv[1]).read().strip()
voice, speed, out = sys.argv[2], float(sys.argv[3]), sys.argv[4]
pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
audios, words, t0 = [], [], 0.0
for r in pipe(text, voice=voice, speed=speed, split_pattern=None):
    a = r.audio.cpu().numpy() if hasattr(r.audio, 'cpu') else np.asarray(r.audio)
    for tok in (r.tokens or []):
        if getattr(tok, 'start_ts', None) is not None:
            words.append({'w': tok.text, 's': round(t0 + tok.start_ts, 3), 'e': round(t0 + tok.end_ts, 3)})
    audios.append(a); t0 += len(a) / 24000
    print('PHONEMES:', r.phonemes)
sf.write(out, np.concatenate(audios), 24000)
json.dump(words, open(out.replace('.wav', '.json'), 'w'), indent=1)
print('dur %.2f s, %d timed tokens' % (t0, len(words)))
