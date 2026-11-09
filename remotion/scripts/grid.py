import sys
from PIL import Image, ImageDraw
comp, out, cols, ts = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4:]
w, h = 216, 384
rows = (len(ts) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 20)), 'white'); d = ImageDraw.Draw(sheet)
for i, t in enumerate(ts):
    im = Image.open(f'out/stills/{comp}_{float(t):.2f}.png').convert('RGB').resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 20); sheet.paste(im, (x, y + 20)); d.text((x + 4, y + 4), f'{float(t):.2f}s', fill='black')
sheet.save(out, quality=88); print(out, sheet.size)
