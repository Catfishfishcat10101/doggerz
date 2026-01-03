import os
import sys
from PIL import Image


def die(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)


# Usage:
# python scripts/slice-grid.py <sheet.png> <outDir> <cols> <rows> <frames> [cellSize]
#
# Example:
# python scripts/slice-grid.py art/sheets/jrt_real_v1/puppy/walk.png art/frames/jrt_real_v1/puppy/walk 4 3 12 1024
#
# cellSize optional: if provided, assumes the sheet is cellSize x cellSize and divides by cols/rows.
# otherwise it uses image width/cols and height/rows.

if len(sys.argv) < 6:
    die("Usage: slice-grid.py <sheet.png> <outDir> <cols> <rows> <frames> [cellSize]")

sheet_path = sys.argv[1]
out_dir = sys.argv[2]
cols = int(sys.argv[3])
rows = int(sys.argv[4])
frames = int(sys.argv[5])
cell_size = int(sys.argv[6]) if len(sys.argv) >= 7 else None

if not os.path.exists(sheet_path):
    die(f"Sheet not found: {sheet_path}")

img = Image.open(sheet_path).convert("RGBA")
w, h = img.size

if cell_size:
    w = cell_size
    h = cell_size

cell_w = w // cols
cell_h = h // rows

os.makedirs(out_dir, exist_ok=True)

count = 0
for r in range(rows):
    for c in range(cols):
        if count >= frames:
            break
        x0 = c * cell_w
        y0 = r * cell_h
        frame = img.crop((x0, y0, x0 + cell_w, y0 + cell_h))

        out_name = f"frame_{count + 1:04d}.webp"
        out_path = os.path.join(out_dir, out_name)
        frame.save(out_path, "WEBP", quality=95, method=6)
        count += 1
    if count >= frames:
        break

print(f"Sliced {count} frames into {out_dir}")
