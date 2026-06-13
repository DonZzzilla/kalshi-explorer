# Patch Image Processing (Character Customization Wiki)

**Date**: 2026-07-11
**Wiki**: got.miraheze.org (Ghosts of Tabor)

## Source Images
BoB2005 uploads 1920x1080 RGBA PNGs (~8.3MB each) to the wiki.
All patches use consistent canvas layout with patch content at:
- **Crop box**: x=617-1162, y=0-1079 (546x1080 area)

## Animated GIF Spec
- **Size**: 400x791
- **Frames**: 2 (frame 0 = old wiki version, frame 1 = new BoB2005 version)
- **Duration**: 5000ms per frame
- **Loop**: Infinite (loop=0)
- **Transparency**: MUST be preserved — index 0 = transparent
- **Scaling**: PROPORTIONAL only — never stretch to fill

## Critical Pitfalls
1. **Non-proportional scaling**: Old 400x400 images MUST NOT be stretched to 400x791. Scale proportionally, center on transparent canvas.
2. **Lost transparency**: RGBA→P conversion drops alpha. Must set transparency=0 and map transparent pixels to palette index 0.
3. **Wrong game reference**: Always "Ghosts of Tabor" (GoT), NEVER "Game of Tabor" or "Game of Thrones".
4. **Wrong team reference**: Always "Battlefield Observation & Awareness" (BOA), NEVER "Operation".
5. **optimize=True** in PIL GIF save breaks transparency. Use optimize=False.

## Processing Pipeline
```python
def process_frame(img, target_w=400, target_h=791):
    img = img.convert('RGBA')
    w, h = img.size
    scale = min(target_w / w, target_h / h)
    new_w, new_h = max(int(w*scale), 1), max(int(h*scale), 1)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    canvas.paste(resized, ((target_w-new_w)//2, (target_h-new_h)//2), resized)
    return canvas

def process_new_bob2005(img):
    return process_frame(img.crop((617, 0, 1163, 1080)))

def create_animated_gif(old_path, new_path, output_path):
    old_img = Image.open(old_path).convert('RGBA')
    new_img = Image.open(new_path).convert('RGBA')
    frame0 = process_frame(old_img)
    frame1 = process_new_bob2005(new_img)
    # Convert to palette with transparency index 0
    rgb0 = frame0.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
    rgb1 = frame1.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
    alpha0, alpha1 = np.array(frame0)[:,:,3], np.array(frame1)[:,:,3]
    arr0, arr1 = np.array(rgb0), np.array(rgb1)
    arr0[alpha0 < 10] = 0; arr1[alpha1 < 10] = 0
    p0 = Image.fromarray(arr0, mode='P'); p0.putpalette(rgb0.getpalette()); p0.info['transparency'] = 0
    p1 = Image.fromarray(arr1, mode='P'); p1.putpalette(rgb1.getpalette()); p1.info['transparency'] = 0
    p0.save(output_path, 'GIF', save_all=True, append_images=[p1],
            duration=5000, loop=0, transparency=0, optimize=False)
```

## Batch Pattern (40+ images)
Write a single Python script that downloads all pairs, processes each → animated GIF, uploads with 1s rate limiting, logs results.

## Wiki Page Update
After uploading, update Character Customization page .png → .gif references via API action=edit.
