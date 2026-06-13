# Batch Patch GIF Processing — 1920x1080 BoB2005 Uploads

## Use Case

Community contributor BoB2005 uploaded 50+ patch images as 1920x1080 PNGs (~8.3MB each). These need to be:
1. Cropped to the patch content area
2. Scaled to 400px wide
3. Combined with old wiki versions into animated GIFs (5s per frame)
4. Uploaded back to the wiki

## Consistent Crop Box

All BoB2005 1920x1080 uploads have the patch content at the **same position**:
- **x=617 to x=1162** (546px wide)
- **y=0 to y=1080** (full height)
- Crop box: `(617, 0, 1163, 1080)`

This was verified across all 48 images — the patch is always centered at the same spot on the 1920x1080 canvas.

## Old/New Pairing Strategy

For each patch on the Character Customization page:
- **Frame 0 (old):** The version that was already on the wiki (typically 397x397 or 400x400, already processed). Scale to fit within 400x791 canvas, center on transparent background.
- **Frame 1 (new):** The BoB2005 upload (1920x1080). Crop to 546x1080, scale to 400x791.

Old images are smaller squares — they get centered vertically on the 400x791 transparent canvas.

## Complete Pipeline Script

```python
#!/usr/bin/env python3
"""Batch process patch images into animated GIFs."""
import os, glob, requests
from PIL import Image

API = 'https://got.miraheze.org/w/api.php'
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})

# Login
lt = s.get(API, params={'action':'query','meta':'tokens','type':'login','format':'json'}).json()['query']['tokens']['logintoken']
s.post(API, data={'action':'login','lgname':'ZeroSkills','lgpassword':'ForkedT2000','lgtoken':lt,'format':'json'})
csrf = s.get(API, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']

CROP_BOX = (617, 0, 1163, 1080)
TARGET_SIZE = (400, 791)
FRAME_DURATION = 5000  # 5 seconds per frame

def get_file_url(fname):
    r = s.get(API, params={'action':'query','titles':f'File:{fname}','prop':'imageinfo','iiprop':'url','format':'json'}).json()
    for pid, pinfo in r['query']['pages'].items():
        if 'imageinfo' in pinfo:
            return pinfo['imageinfo'][0]['url']
    return None

def process_new(img):
    return img.crop(CROP_BOX).resize(TARGET_SIZE, Image.LANCZOS)

def process_old(img):
    img = img.convert('RGBA')
    w, h = img.size
    scale = min(TARGET_SIZE[0] / w, TARGET_SIZE[1] / h)
    resized = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', TARGET_SIZE, (0, 0, 0, 0))
    canvas.paste(resized, ((TARGET_SIZE[0] - resized.size[0]) // 2, (TARGET_SIZE[1] - resized.size[1]) // 2))
    return canvas

def make_animated_gif(old_path, new_path, output_path):
    old_img = Image.open(old_path).convert('RGBA')
    new_img = Image.open(new_path).convert('RGBA')
    frame0 = process_old(old_img)
    frame1 = process_new(new_img)
    frames_p = []
    for frame in [frame0, frame1]:
        alpha_ch = frame.split()[3]
        mask = Image.eval(alpha_ch, lambda a: 255 if a < 128 else 0)
        p_frame = frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
        p_frame.info['transparency'] = 255
        arr = list(p_frame.getdata())
        mask_data = list(mask.getdata())
        p_frame.putdata([255 if m == 255 else p for p, m in zip(arr, mask_data)])
        frames_p.append(p_frame)
    frames_p[0].save(output_path, save_all=True, append_images=frames_p[1:],
                     duration=FRAME_DURATION, loop=0, transparency=255, disposal=2, optimize=False)
    return os.path.getsize(output_path)
```

## Upload Pattern

```python
with open(output_path, 'rb') as f:
    s.post(API, data={
        'action': 'upload', 'filename': output_name, 'token': csrf,
        'comment': 'Animated GIF: old wiki version + new BoB2005 version, 5s per frame loop',
        'format': 'json', 'ignorewarnings': '1',
    }, files={'file': (output_name, f, 'image/gif')})
```

## Results (June 11, 2026)

- 28 animated GIFs created and uploaded
- File sizes: 73-115KB (vs original 8.3MB PNGs)
- All patches on Character Customization page now animate between old and new versions
- 4 patches remain static (no BoB2005 new version available): ChadPatch, FishPatch, HoS, Watching
