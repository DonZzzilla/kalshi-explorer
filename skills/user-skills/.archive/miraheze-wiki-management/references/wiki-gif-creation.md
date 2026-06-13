# Wiki Media — Creating Animated GIFs from Wiki Images

## Use Case

When a wiki has multiple versions of the same image (e.g., old and new patch designs), create an animated GIF that cycles between them for visual comparison.

## ⚠️ Critical Pitfalls (June 2026)

### 1. Don't resize to a fixed square — preserve aspect ratio

**WRONG:** `img.resize((400, 400), Image.LANCZOS)` — stretches non-square images.

**RIGHT:** Scale to a fixed width, compute height from aspect ratio:
```python
ratio = target_w / img.size[0]
new_h = int(img.size[1] * ratio)
img.resize((target_w, new_h), Image.LANCZOS)
```

### 2. Crop transparent PNGs to content before resizing

New wiki images (especially from community contributors like BoB2005) are often uploaded at a large canvas size (e.g., 1920x1080) with the actual content in a small region and the rest fully transparent. If you resize the full canvas, the content appears tiny with massive whitespace.

**Always crop to the content bounding box first:**
```python
if img.mode == 'RGBA':
    alpha = img.split()[3]
    bbox = alpha.getbbox()  # returns (left, upper, right, lower)
    if bbox:
        img = img.crop(bbox)
```

### 3. Both frames must be the same aspect ratio for a clean comparison

If the old image is portrait (e.g., 954x1203) and the new one is a cropped strip (e.g., 546x1080), resize both to the **same target width** and let the heights differ. Then pad to a common canvas height:
```python
canvas_h = max(old_r.size[1], new_r.size[1])
bg = Image.new('RGB', (target_w, canvas_h), (255, 255, 255))
bg.paste(img, (0, 0), img)  # uses alpha as mask
```

### 4. Download via wiki API — direct static URLs return 403

`static.wikitide.net` URLs return HTTP 403 when fetched directly. Use the wiki API to get the URL, then download via an authenticated session:
```python
r = s.get(API, params={
    'action': 'query', 'titles': 'File:ImageName.png',
    'prop': 'imageinfo', 'iiprop': 'url', 'format': 'json'
})
url = list(r.json()['query']['pages'].values())[0]['imageinfo'][0]['url']
r2 = s.get(url, headers={'User-Agent': 'Mozilla/5.0'})
img = Image.open(io.BytesIO(r2.content))
```

### 5. Old file versions may have different extensions

When a file was overwritten (e.g., BOA_Patch.jpg → BOA_Patch.png), the old version may still exist under the original extension. Search for it:
```python
r = s.get(API, params={
    'action': 'query', 'list': 'allimages',
    'aiprefix': 'BOA', 'ailimit': 20, 'format': 'json'
})
```

## Complete Working Pattern (June 2026)

```python
import requests, json, io, os
from PIL import Image

WIKI_API = "https://got.miraheze.org/w/api.php"
s = requests.Session()
s.headers.update({'User-Agent': 'HermesAgent/1.0'})

# Login
r = s.get(WIKI_API, params={'action': 'query', 'meta': 'tokens', 'type': 'login', 'format': 'json'})
token = r.json()['query']['tokens']['logintoken']
s.post(WIKI_API, data={'action': 'login', 'lgname': USER, 'lgpassword': PASS, 'lgtoken': token, 'format': 'json'})

def download_wiki_file(title):
    """Download a file from the wiki, returning a PIL Image."""
    r = s.get(WIKI_API, params={
        'action': 'query', 'titles': title,
        'prop': 'imageinfo', 'iiprop': 'url', 'format': 'json'
    })
    url = list(r.json()['query']['pages'].values())[0]['imageinfo'][0]['url']
    r2 = s.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    return Image.open(io.BytesIO(r2.content)).convert('RGBA')

def crop_to_content(img):
    """Crop RGBA image to bounding box of non-transparent pixels."""
    if img.mode == 'RGBA':
        bbox = img.split()[3].getbbox()
        if bbox:
            return img.crop(bbox)
    return img

def make_comparison_gif(old_img, new_img, output_name, target_width=400, frame_ms=3000):
    """Create an animated GIF cycling between two images."""
    # Resize both to target width (preserving aspect ratio)
    def resize(img):
        ratio = target_width / img.size[0]
        return img.resize((target_width, int(img.size[1] * ratio)), Image.LANCZOS)
    
    old_r, new_r = resize(old_img), resize(new_img)
    canvas_h = max(old_r.size[1], new_r.size[1])
    
    def make_frame(img):
        bg = Image.new('RGB', (target_width, canvas_h), (255, 255, 255))
        if img.mode == 'RGBA':
            bg.paste(img, (0, 0), img)
        else:
            bg.paste(img)
        return bg.convert('P', palette=Image.ADAPTIVE, colors=256)
    
    frames = [make_frame(old_r), make_frame(new_r)]
    frames[0].save(output_name, save_all=True, append_images=frames[1:],
                   duration=frame_ms, loop=0, optimize=True)
    return os.path.getsize(output_name)

# Example: old JPG vs new PNG (cropped)
old_boa = download_wiki_file('File:BOA Patch.jpg')
new_boa = crop_to_content(download_wiki_file('File:BOA Patch.png'))
size = make_comparison_gif(old_boa, new_boa, 'BOA_Patch.gif')
print(f'BOA_Patch.gif: {size//1024}KB')

# Upload
r = s.get(WIKI_API, params={'action': 'query', 'meta': 'tokens', 'format': 'json'})
csrf = r.json()['query']['tokens']['csrftoken']
with open('BOA_Patch.gif', 'rb') as f:
    s.post(WIKI_API, data={
        'action': 'upload', 'filename': 'BOA_Patch.gif',
        'comment': 'Comparison GIF: old vs new BoB2005 patch',
        'token': csrf, 'format': 'json', 'ignorewarnings': 1,
    }, files={'file': ('BOA_Patch.gif', f, 'image/gif')})
```

## Parameters That Work Well

| Parameter | Value | Notes |
|-----------|-------|-------|
| Target width | 400px | Good balance of detail vs file size |
| Frame duration | 5000ms (5s) | Better for wiki display — gives viewers time to compare (user preference) |
| Frame duration (alt) | 3000ms (3s) | Also works, faster cycling |
| Colors | 256 (ADAPTIVE) | Good quality, small file size |
| Loop | 0 (infinite) | Standard for wiki embeds |

## Transparent Background GIFs (June 2026)

White backgrounds can look bad on dark-themed wikis. Use transparent backgrounds instead:

```python
def make_transparent_gif(old_img, new_img, output_name, target_width=400, frame_ms=3000):
    """Create an animated GIF with transparent background."""
    def resize(img):
        ratio = target_width / img.size[0]
        return img.resize((target_width, int(img.size[1] * ratio)), Image.LANCZOS)
    
    old_r, new_r = resize(old_img), resize(new_img)
    canvas_w, canvas_h = target_width, max(old_r.size[1], new_r.size[1])
    
    frames_rgba = []
    for img in [old_r, new_r]:
        canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
        y_offset = (canvas_h - img.size[1]) // 2
        if img.mode == 'RGBA':
            canvas.paste(img, (0, y_offset), img)
        else:
            canvas.paste(img, (0, y_offset))
        frames_rgba.append(canvas)
    
    # Convert to palette with transparency (index 255 = transparent)
    frames_p = []
    for frame in frames_rgba:
        alpha_ch = frame.split()[3]
        mask = Image.eval(alpha_ch, lambda a: 255 if a < 128 else 0)
        p_frame = frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
        p_frame.info['transparency'] = 255
        arr = list(p_frame.getdata())
        mask_data = list(mask.getdata())
        new_arr = [255 if m == 255 else p for p, m in zip(arr, mask_data)]
        p_frame.putdata(new_arr)
        frames_p.append(p_frame)
    
    frames_p[0].save(
        output_name, save_all=True, append_images=frames_p[1:],
        duration=frame_ms, loop=0, transparency=255, disposal=2, optimize=False
    )
    return os.path.getsize(output_name)
```

**Key points:**
- Use `disposal=2` (restore to background) so transparency works between frames
- `optimize=False` — optimization can break transparency
- Reserve palette index 255 for transparent pixels (use `colors=255` for the actual palette)
- `transparency=255` in save params tells GIF which index is transparent
- Works on both light and dark wiki themes

## Example: BOA and Moderator Patch GIFs (June 2026)

Created for the Character Customization page:
- `BOA_Patch.gif` — old BOA_Patch.jpg (954x1203) vs cropped BoB2005 BOA_Patch.png (546x1080)
- `Moderator_Patch.gif` — old Moderator_Patch.jpg (1054x1142) vs cropped BoB2005 Moderator_Patch.png (546x1080)

Both: 400px wide, transparent background, ~350KB, 3s per frame, infinite loop.

## Batch Processing (June 2026)

For processing 28+ patch pairs at once (e.g., all patches on Character Customization page), use the batch pipeline in `references/batch-patch-gif-processing-june2026.md`. Key differences from single-pair processing:
- BoB2005's 1920x1080 uploads all share the same crop box: `(617, 0, 1163, 1080)`
- Old wiki images (~400x400) are centered on a transparent 400x791 canvas
- User prefers 5s frame duration for wiki display
- Present transparent GIFs using `disposal=2` + palette index 255
