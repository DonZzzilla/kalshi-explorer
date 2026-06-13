# Batch Image Processing — 1920x1080 Patch Uploads

## Use Case

Community contributors (e.g., BoB2005) upload game patch images as 1920x1080 PNGs (~8.3MB each). These need to be:
1. Cropped to the actual patch content area
2. Scaled to ~400px wide (matching existing wiki patch format)
3. Saved as optimized transparent PNGs or GIFs (~75KB)
4. Uploaded to the wiki, overwriting the originals

## Source Image Layout

All patch images from BoB2005 use a consistent canvas layout:
- **Canvas:** 1920x1080 pixels, RGBA (with alpha channel)
- **Patch area:** x=617-1162, y=0-1079 (546x1080 pixels)
- **Outside patch area:** Fully transparent

This consistency means the same crop box works for ALL images in a batch.

## Processing Pipeline

```python
from PIL import Image
import os, glob

TARGET_WIDTH = 400
CROP_BOX = (617, 0, 1163, 1080)  # x_min, y_min, x_max, y_max

for filepath in glob.glob('/tmp/raw/*.png'):
    img = Image.open(filepath)
    
    # 1. Crop to patch area
    cropped = img.crop(CROP_BOX)  # → 546x1080
    
    # 2. Scale to target width (preserves aspect ratio)
    w, h = cropped.size
    new_h = int(h * TARGET_WIDTH / w)  # 1080 * 400/546 = 791
    resized = cropped.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
    
    # 3. Save as optimized PNG (keeps full quality)
    resized.save('output.png', 'PNG', optimize=True)
    
    # 4. Save as GIF (smaller, ~75KB, good for wiki)
    gif = resized.convert('P', palette=Image.ADAPTIVE, colors=256)
    gif.save('output.gif', 'GIF', optimize=True)
```

## Results

| Format | Size (typical) | Notes |
|--------|---------------|-------|
| Original 1920x1080 PNG | 8,309 KB | Way too big for wiki display |
| Processed 400x791 PNG | ~430 KB | Full quality with transparency |
| Processed 400x791 GIF | ~75 KB | Optimized, transparency preserved |

## Upload Pattern

```python
# Overwrite existing file on wiki
with open('output.gif', 'rb') as f:
    s.post(API, data={
        'action': 'upload',
        'filename': 'PatchName.gif',  # or .png
        'token': csrf,
        'comment': 'Processed: cropped from 1920x1080, scaled to 400x791, transparency preserved',
        'format': 'json',
        'ignorewarnings': '1',
    }, files={'file': ('PatchName.gif', f, 'image/gif')})
```

## Page Reference Updates

After uploading `.gif` versions of files that were previously `.png` on wiki pages, update the page wikitext:
```python
# Replace .png references with .gif for processed patches
content = content.replace('DevCrew_Patch.png', 'DevCrew_Patch.gif')
content = content.replace('ContentCreator_Patch.png', 'ContentCreator_Patch.gif')
# ... etc
```

## Key Pitfalls

1. **Filename mismatches:** BoB2005 uploads use spaces (`Poop Patch.png`) while wiki page references may use short names (`Poop.png`). Check both naming conventions.
2. **Not all 1920x1080 images are patches:** Some images on the wiki are legitimately sized (e.g., 400x400 PNGs). Only process images confirmed to be from the 1920x1080 batch.
3. **Existing processed files:** Some patches were already properly sized (BOA_Patch.gif at 400x791, FishPatch.png at 400x400). Don't re-process these.
4. **RGBA mode:** All BoB2005 uploads are RGBA. If an image is RGB (no alpha), the crop-to-content approach won't work — use manual crop coordinates instead.

## Session: June 11, 2026

Processed 48 images (8 existing unprocessed on Character Customization page + 40 new BoB2005 uploads). All uploaded as both PNG and GIF. Page references updated from `.png` to `.gif` for the 8 Role & Team patches.
