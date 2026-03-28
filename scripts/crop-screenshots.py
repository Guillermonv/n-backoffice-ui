"""
Crops screenshots in docs/screenshots/ to remove empty background space
below the last content row. Run from the project root:

    python3 scripts/crop-screenshots.py
"""
from PIL import Image
import os

OUT = "docs/screenshots"
BG = (241, 245, 249)     # --bg: #f1f5f9
IGNORE = {BG, (255, 255, 255), (248, 250, 252), (30, 41, 59), (15, 23, 42)}
PADDING = 32

for fname in sorted(os.listdir(OUT)):
    if not fname.endswith(".png"):
        continue
    path = os.path.join(OUT, fname)
    img = Image.open(path).convert("RGB")
    w, h = img.size
    pixels = img.load()

    last_content_row = 0
    for y in range(h - 1, -1, -1):
        if set(pixels[x, y] for x in range(w)) - IGNORE:
            last_content_row = y
            break

    crop_h = min(last_content_row + PADDING, h)
    cropped = img.crop((0, 0, w, crop_h))
    cropped.save(path)
    print(f"{fname}: {h}px → {crop_h}px")
