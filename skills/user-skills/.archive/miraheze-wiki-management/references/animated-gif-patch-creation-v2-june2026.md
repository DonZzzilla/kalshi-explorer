# Animated GIF Patch Creation v2 — Proportional Scaling + Transparency

**Date:** 2026-06-11
**Supersedes:** v1 (non-proportional scaling, lost transparency)

## Problem

Community contributors upload game patch images as 1920x1080 RGBA PNGs (~8.3MB). The wiki already has "old" versions (397x397 or 400x400 PNGs). Need animated GIFs combining old + new, swapping every 5 seconds.

## Key Requirements

1. **Proportional scaling** — NEVER stretch/distort. Both old and new must maintain aspect ratio
2. **Transparency preserved** — GIF must have transparent background
3. **Same canvas size** — Both frames exactly 400x791
4. **5 seconds per frame** — duration=5000, loop=0

## Pipeline

### Crop box for 1920x1080 BoB2005 uploads

All uploads have patch content at **x=617-1162, y=0-1079** (546x1080).

```
CROP_BOX = (617, 0, 1163, 1080)
TARGET_SIZE = (400, 791)
```

### Processing both frames

```python
from PIL import Image
import numpy as np

def process_frame(img, target_w, target_h):
    """Scale proportionally, center on transparent canvas."""
    img = img.convert('RGBA')
    w, h = img.size
    scale = min(target_w / w, target_h / h)
    new_w, new_h = max(int(w * scale), 1), max(int(h * scale), 1)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    x, y = (target_w - new_w) // 2, (target_h - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

# New: crop then scale
new_img = Image.open('new.png').convert('RGBA')
cropped = new_img.crop(CROP_BOX)
frame_new = process_frame(cropped, 400, 791)

# Old: scale directly (already ~400x400)
old_img = Image.open('old.png').convert('RGBA')
frame_old = process_frame(old_img, 400, 791)
```

### Create animated GIF with transparency

```python
# Convert to palette, preserving transparency via index 0
def to_palette_with_transparency(frame):
    rgb = frame.convert('RGB')
    p = rgb.convert('P', palette=Image.ADAPTIVE, colors=255)
    alpha = np.array(frame)[:,:,3]
    arr = np.array(p)
    arr[alpha < 10] = 0  # transparent -> index 0
    result = Image.fromarray(arr, mode='P')
    result.putpalette(p.getpalette())
    result.info['transparency'] = 0
    return result

p0 = to_palette_with_transparency(frame_old)
p1 = to_palette_with_transparency(frame_new)

p0.save('output.gif', 'GIF',
    save_all=True, append_images=[p1],
    duration=5000, loop=0, transparency=0, optimize=False)
```

**CRITICAL:** `optimize=False` -- optimization breaks transparency.

## Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Non-proportional scaling | Square images stretched | Use `min(w_scale, h_scale)` |
| Lost transparency | Black background in GIF | Palette index 0 + `transparency=0` + `optimize=False` |
| Frames different sizes | GIF won't loop | Both frames must be exactly 400x791 |
| Wrong crop box | Patch cut off | x=617-1162, y=0-1079 |
| `optimize=True` breaks alpha | Random black pixels | Always `optimize=False` |
