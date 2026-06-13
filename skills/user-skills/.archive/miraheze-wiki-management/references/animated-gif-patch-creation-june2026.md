# Animated GIF Patch Creation (June 2026)

Technique for creating animated GIFs that cycle between old and new versions of wiki images (e.g., old close-up patch + new BoB2005 full-size upload).

## When to Use

When a wiki has multiple versions of the same image (old wiki version + new community upload), create an animated GIF that cycles between them. Common for:
- Game patch images (old close-up vs new full-size)
- Before/after comparisons
- Any "old + new" image pairs

## Pipeline

### 1. Download Both Images

```python
import requests
s = requests.Session()
s.headers.update({'User-Agent': 'HermesAgent/1.0'})

# Get URLs via API
r = s.get(API, params={'action':'query','titles':'File:Name.png','prop':'imageinfo','iiprop':'url','format':'json'}).json()
# Download
resp = requests.get(url, headers={'User-Agent': 'HermesAgent/1.0'})
```

### 2. Process Each Frame

**For new 1920x1080 uploads** (BoB2005 pattern):
- Crop box: `x=617-1162, y=0-1079` (546x1080 content area)
- Scale proportionally to fit within 400x791 canvas
- Center on transparent canvas

**For old wiki images** (typically 400x400 or similar):
- Scale proportionally to fit within 400x791 canvas
- Center on transparent canvas (do NOT stretch to fill)

### 3. Create Animated GIF with Transparency

```python
from PIL import Image
import numpy as np

def process_frame(img, target_w=400, target_h=791):
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

frame0 = process_frame(old_img)
frame1 = process_frame(new_img)

# Convert to palette with transparency index 0
def to_palette(frame):
    rgb = frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
    arr = np.array(rgb)
    alpha = np.array(frame)[:,:,3]
    arr[alpha < 10] = 0
    p = Image.fromarray(arr, mode='P')
    p.putpalette(rgb.getpalette())
    p.info['transparency'] = 0
    return p

p0 = to_palette(frame0)
p1 = to_palette(frame1)

p0.save(output_path, 'GIF', save_all=True, append_images=[p1],
        duration=5000, loop=0, transparency=0, optimize=False)
```

### 4. Upload to Wiki

```python
with open(path, 'rb') as f:
    resp = s.post(API, data={
        'action': 'upload', 'filename': 'Name.gif', 'token': csrf,
        'comment': 'Animated GIF: old + new version, 5s/frame',
        'format': 'json', 'ignorewarnings': '1',
    }, files={'file': ('Name.gif', f, 'image/gif')}).json()
```

## Critical Rules

1. **Proportional scaling ONLY** — never stretch/distort. Both old and new must maintain their aspect ratios.
2. **Same canvas size** — both frames must be exactly 400x791 (or whatever target you choose).
3. **Transparency** — use palette index 0 + `transparency=0` in GIF save options. Set `optimize=False` to avoid palette corruption.
4. **Duration** — 5000ms (5 seconds) per frame for a comfortable viewing cycle.
5. **Both frames visible** — the old image should be clearly visible when it is that frame's turn.
6. **Upload as .gif** — even if source is PNG, the animated version must be GIF format.

## Verified Working (June 2026)

- 28 patch images on Ghosts of Tabor Wiki Character Customization page
- Old wiki images (397x397 or 400x400) + new BoB2005 uploads (1920x1080)
- All converted to 400x791 animated GIFs with transparency
- File sizes: 75-115KB per GIF
- Displayed in wiki tables at `|200px` width
