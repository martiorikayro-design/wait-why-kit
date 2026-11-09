# paper.py -> public/stick/paper.png : paper grain + fine horizontal scanlines + soft dark vignette (multiply overlay)
import numpy as np
from PIL import Image, ImageFilter
import sys
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1080, 1920)
OUT = sys.argv[3] if len(sys.argv) > 3 else 'public/stick/paper.png'
rng = np.random.default_rng(3)
g = rng.normal(0, 1, (max(2, H // 2), max(2, W // 2))).astype(np.float32)
g = np.array(Image.fromarray(((g - g.min()) / (g.max() - g.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
fib = rng.normal(0, 1, (max(2, H // 8), max(2, W // 8))).astype(np.float32)
fib = np.array(Image.fromarray(((fib - fib.min()) / (fib.max() - fib.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6)), np.float32) / 255
y = np.arange(H)[:, None]
scan = 0.5 + 0.5 * np.cos(2 * np.pi * y / 3.0)
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
vig = np.clip((r - 0.55) / 0.6, 0, 1) ** 1.6
v = 1 - 0.10 * (g - 0.5) * 2 - 0.05 * (fib - 0.5) * 2 - 0.035 * scan - 0.42 * vig
v = np.clip(v, 0, 1)
rgb = np.stack([v * 1.0, v * 0.985, v * 0.95], -1)
Image.fromarray((rgb * 255).astype(np.uint8)).save(OUT, optimize=True)
print(OUT, W, H)
