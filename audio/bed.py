"""bed.py track.mp3 duration out.wav [start_s] - a licensed music track cut to the video, soft fades, voice band carved out."""
import sys, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from synth import SR, hp, peq, n_of
src, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
start = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
n = n_of(dur)
while len(x) < n: x = np.concatenate([x, x])
x = x[:n]
x[:n_of(0.25)] *= np.linspace(0, 1, n_of(0.25)); x[-n_of(0.9):] *= np.linspace(1, 0, n_of(0.9))
x = peq(hp(x, 60), 2600, -5.0, 0.8)
sf.write(out, x.astype(np.float32), SR, subtype='FLOAT')
