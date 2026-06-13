---
name: excalidraw
description: "Hand-drawn Excalidraw JSON diagrams (arch, flow, seq)."
version: 1.0.0
author: Hermes Agent
license: MIT
dependencies: []
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Excalidraw, Diagrams, Flowcharts, Architecture, Visualization, JSON]
    related_skills: []

---

# Excalidraw Diagram Skill

Create diagrams by writing standard Excalidraw element JSON and saving as `.excalidraw` files. These files can be drag-and-dropped onto [excalidraw.com](https://excalidraw.com) for viewing and editing. No accounts, no API keys, no rendering libraries -- just JSON.

## When to use

Generate `.excalidraw` files for architecture diagrams, flowcharts, sequence diagrams, concept maps, and more. Files can be opened at excalidraw.com or uploaded for shareable links.

## Embedding Diagrams in Static HTML (Inline SVG)

`.excalidraw` files cannot be viewed directly in a browser — they need to be rendered as inline SVG within HTML. Use this approach when diagrams need to live inside a static site (e.g., GitHub Pages).

**CRITICAL — Two pitfalls when embedding diagrams:**

1. **`write_file` corrupts large/complex content:** Double-escapes backslashes, strips `***` patterns. For files >10KB or containing JSON/JS/complex strings, use `execute_code` with `open().write()` instead. See `references/write-file-escaping-pitfall.md` in the `claude-design` skill.

2. **`execute_code` truncates very large strings:** When building SVG data as Python strings in `execute_code`, content over ~50KB may be silently truncated. Write SVG data to a separate `.js` file via `open().write()`, then embed the JS file in HTML. See `references/excalidraw-to-svg.md` for the full pattern.

### Approach: Excalidraw JSON → SVG Converter

Write a Python converter in `execute_code` that parses the excalidraw elements array and emits SVG markup. Element type mappings:

| Excalidraw type | SVG element |
|---|---|
| `rectangle` | `<rect>` with fill, stroke, rx for roundness |
| `text` | `<text>` with font-size, fill, font-weight, text-anchor. Handle multiline by splitting on `\n` and offsetting y by `fontSize * 1.4` per line. Use `fontFamily: "monospace"` if `fontFamily: 1`. |
| `arrow` | `<path>` with `marker-end` arrowhead. Define `<marker>` in `<defs>` for each arrow. |
| `image` | Skip (or render placeholder) |

**CRITICAL:** The SVG string will be 50-80KB+ for a typical diagram. `execute_code` silently strips or truncates very large strings. To avoid this:

1. **Write the SVG output to a separate `.js` file** via `execute_code` using `open().write()`, not by building the string inline
2. **Embed the JS file** in the HTML with a `<script>` tag that injects SVG into designated container divs

Pattern:
```python
# Step 1: Convert and write to diagrams.js (in execute_code)
import json
# ... conversion logic ...
with open("docs/diagrams.js", "w") as f:
    f.write("const DIAGRAMS = [];\n")
    for d in diagrams:
        svg_escaped = svg.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        f.write(f'DIAGRAMS.push({{id: "{d_id}", svg: `{svg_escaped}`}});\n')
```

```html
<!-- Step 2: In HTML, add container divs -->
<div class="diagram-svg-wrap" id="diag-01-partnership-overview"></div>

<!-- Step 3: Render script before </body> -->
<script>
DIAGRAMS.forEach(function(d){
  var el = document.getElementById('diag-' + d.id);
  if(el) el.innerHTML = d.svg;
});
</script>
```

**Verification:** After embedding, fetch the live URL and check: `svg_count` should be ≥ 6 (1 decorative + N diagrams), and diagram section titles should appear in the HTML source.

## GitHub Pages Deployment Notes

After pushing updated files to the repo, GitHub Pages does NOT serve them immediately.

- Check build status via `GET https://api.github.com/repos/{owner}/{repo}/pages/builds/latest` — field `status` goes from `"building"` to `"built"`
- Build typically takes 1-5 minutes
- The live site will show the **old** version until the build completes
- To verify the repo has the right content (independent of Pages build), fetch the file from the GitHub API `contents` endpoint and base64-decode the `content` field
- Three.js particle colors use raw RGB fractions (0-1 range) in BufferAttribute arrays — do NOT use hex strings

## JavaScript Array Pitfall: `.push()` Return Value

When building diagram data JS, NEVER write:

```js
var diagrams = DIAGRAMS.push({id: "foo", svg: "..."});
```

`Array.push()` returns the **new length** (a number), not the array. So `diagrams` becomes a number and `diagrams.forEach(...)` silently fails — no diagrams render, no console error.

Correct pattern:
```js
DIAGRAMS.push({id: "foo", svg: "..."});
DIAGRAMS.forEach(function(d){ ... });
```

## Color Extraction from Live Sites

To extract brand colors from a website, use `browser_console` with:

```javascript
(function() {
  const body = document.body;
  const s = window.getComputedStyle;
  const all = document.querySelectorAll('*');
  const bgColors = new Set();
  const textColors = new Set();
  all.forEach(el => {
    const bg = s(el).backgroundColor;
    const c = s(el).color;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bgColors.add(bg);
    if (c && c !== 'rgb(0, 0, 0)') textColors.add(c);
  });
  const headings = document.querySelectorAll('h1,h2,h3');
  const links = document.querySelectorAll('a');
  return JSON.stringify({
    bodyBg: s(body).backgroundColor,
    headingColor: headings.length ? s(headings[0]).color : 'N/A',
    linkColor: links.length ? s(links[0]).color : 'N/A',
    bgColors: [...bgColors].slice(0, 15),
    textColors: [...textColors].slice(0, 10)
  });
})();
```

Convert `rgb(r, g, b)` values to hex for CSS use. Also extract logos by querying `document.querySelectorAll('img')` and filtering by `src` containing 'logo'.

## Batch Text Replacement in Excalidraw Diagrams

When updating text across multiple `.excalidraw` files (e.g., rebranding, acronym changes, content rewrites), use a batch replacement approach:

```python
import json, os

diagram_updates = {
    "diagram-name.excalidraw": {
        "texts": {
            "Old Text 1": "New Text 1",
            "Old Text 2": "New Text 2",
            # Multiline: exact match including \n
            "Line 1\nLine 2": "New Line 1\nNew Line 2",
        }
    },
}

for fname, updates in diagram_updates.items():
    fpath = os.path.join(diagram_dir, fname)
    with open(fpath, "r") as f:
        data = json.load(f)
    
    for el in data["elements"]:
        if el.get("type") == "text":
            current = el.get("text", "")
            for old_text, new_text in updates.get("texts", {}).items():
                if current.strip() == old_text.strip():
                    el["text"] = new_text
                    if "originalText" in el:
                        el["originalText"] = new_text
                    break
    
    with open(fpath, "w") as f:
        json.dump(data, f, indent=2)
```

**Key points:**
- Match on `current.strip()` to handle whitespace differences
- Always update both `text` and `originalText` fields
- After batch update, re-validate all files with `json.load()`
- If diagrams are embedded in HTML via SVG converter, regenerate the SVG and JS files after text changes

See `references/excalidraw-to-svg.md` for the full converter implementation and session-tested code.

## Font

Use **sans-serif (Helvetica/Arial)** for all text elements unless the user requests otherwise. Don prefers clean, official-looking sans-serif fonts over the default hand-drawn style. Set `fontFamily: 1` (sans-serif) on all text elements.

## Workflow

1. **Load this skill** (you already did)
2. **Write the elements JSON** -- an array of Excalidraw element objects
3. **Save the file** using `execute_code` with `json.dump()` -- NEVER use `write_file` for `.excalidraw` files (it double-escapes backslashes, corrupting JSON)
4. **Optionally upload** for a shareable link using `scripts/upload.py` via `terminal`

### Saving a Diagram

**CRITICAL: Do NOT use `write_file` to save `.excalidraw` files.** The `write_file` tool double-escapes backslash sequences (`\n` → `\\n`, `\"` → `\\\"`), which corrupts JSON string values and produces invalid `.excalidraw` files that won't load on excalidraw.com. See `references/write-file-escaping-pitfall.md` in the `claude-design` skill for full details.

**Correct approach — use Python's `open().write()` via `execute_code`:**

```python
import json

data = {
  "type": "excalidraw",
  "version": 2,
  "source": "hermes-agent",
  "elements": [ ...your elements array here... ],
  "appState": {
    "viewBackgroundColor": "#0a0b0e"
  }
}

with open("/path/to/output.excalidraw", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

This applies to **any file containing JSON with escape sequences** (`.excalidraw`, `.json`, `.theme`, etc.) — always use `execute_code` with `json.dump()` or `open().write()`, never `write_file`.

**Verification step — MANDATORY, not optional:** After writing, immediately verify the file parses:
```python
import json
with open("/path/to/output.excalidraw") as f:
    data = json.load(f)
print(f"OK: {len(data['elements'])} elements")
```

**If validation fails**, the file was corrupted by `write_file` escaping. Re-write using the Python `open().write()` approach above.

**Batch validation** — to check all `.excalidraw` files in a directory, use the included script:
```bash
python3 /path/to/skill/scripts/validate_excalidraw.py /path/to/diagrams/*.excalidraw
```
Or inline:
```bash
for f in /path/to/diagrams/*.excalidraw; do
  echo -n "$(basename $f): "
  python3 -c "import json; json.load(open('$f')); print('VALID')" 2>&1
done
```

Save to any path, e.g. `~/diagrams/my_diagram.excalidraw`.

### Uploading for a Shareable Link

Run the upload script (located in this skill's `scripts/` directory) via terminal:

```bash
python skills/diagramming/excalidraw/scripts/upload.py ~/diagrams/my_diagram.excalidraw
```

This uploads to excalidraw.com (no account needed) and prints a shareable URL. Requires the `cryptography` pip package (`pip install cryptography`).

---

## Element Format Reference

### Required Fields (all elements)
`type`, `id` (unique string), `x`, `y`, `width`, `height`

### Defaults (skip these -- they're applied automatically)
- `strokeColor`: `"#1e1e1e"`
- `backgroundColor`: `"transparent"`
- `fillStyle`: `"solid"`
- `strokeWidth`: `2`
- `roughness`: `1` (hand-drawn look)
- `opacity`: `100`

Canvas background is white.

### Element Types

**Rectangle**:
```json
{ "type": "rectangle", "id": "r1", "x": 100, "y": 100, "width": 200, "height": 100 }
```
- `roundness: { "type": 3 }` for rounded corners
- `backgroundColor: "#a5d8ff"`, `fillStyle: "solid"` for filled

**Ellipse**:
```json
{ "type": "ellipse", "id": "e1", "x": 100, "y": 100, "width": 150, "height": 150 }
```

**Diamond**:
```json
{ "type": "diamond", "id": "d1", "x": 100, "y": 100, "width": 150, "height": 150 }
```

**Labeled shape (container binding)** -- create a text element bound to the shape:

> **WARNING:** Do NOT use `"label": { "text": "..." }` on shapes. This is NOT a valid
> Excalidraw property and will be silently ignored, producing blank shapes. You MUST
> use the container binding approach below.

The shape needs `boundElements` listing the text, and the text needs `containerId` pointing back:
```json
{ "type": "rectangle", "id": "r1", "x": 100, "y": 100, "width": 200, "height": 80,
  "roundness": { "type": 3 }, "backgroundColor": "#a5d8ff", "fillStyle": "solid",
  "boundElements": [{ "id": "t_r1", "type": "text" }] },
{ "type": "text", "id": "t_r1", "x": 105, "y": 110, "width": 190, "height": 25,
  "text": "Hello", "fontSize": 20, "fontFamily": 1, "strokeColor": "#1e1e1e",
  "textAlign": "center", "verticalAlign": "middle",
  "containerId": "r1", "originalText": "Hello", "autoResize": true }
```
- Works on rectangle, ellipse, diamond
- Text is auto-centered by Excalidraw when `containerId` is set
- The text `x`/`y`/`width`/`height` are approximate -- Excalidraw recalculates them on load
- `originalText` should match `text`
- **Font selection:** Default to `fontFamily: 3` (Helvetica, sans-serif) for official/professional diagrams. Use `fontFamily: 1` (Virgil) only when the user wants a hand-drawn/casual look. To update all text elements' font in an existing `.excalidraw` file, batch-replace `"fontFamily": 1` with `"fontFamily": 3` in the JSON.

**Labeled arrow** -- same container binding approach:
```json
{ "type": "arrow", "id": "a1", "x": 300, "y": 150, "width": 200, "height": 0,
  "points": [[0,0],[200,0]], "endArrowhead": "arrow",
  "boundElements": [{ "id": "t_a1", "type": "text" }] },
{ "type": "text", "id": "t_a1", "x": 370, "y": 130, "width": 60, "height": 20,
  "text": "connects", "fontSize": 16, "fontFamily": 1, "strokeColor": "#1e1e1e",
  "textAlign": "center", "verticalAlign": "middle",
  "containerId": "a1", "originalText": "connects", "autoResize": true }
```

**Standalone text** (titles and annotations only -- no container):
```json
{ "type": "text", "id": "t1", "x": 150, "y": 138, "text": "Hello", "fontSize": 20,
  "fontFamily": 1, "strokeColor": "#1e1e1e", "originalText": "Hello", "autoResize": true }
```
- `x` is the LEFT edge. To center at position `cx`: `x = cx - (text.length * fontSize * 0.5) / 2`
- Do NOT rely on `textAlign` or `width` for positioning

**Arrow**:
```json
{ "type": "arrow", "id": "a1", "x": 300, "y": 150, "width": 200, "height": 0,
  "points": [[0,0],[200,0]], "endArrowhead": "arrow" }
```
- `points`: `[dx, dy]` offsets from element `x`, `y`
- `endArrowhead`: `null` | `"arrow"` | `"bar"` | `"dot"` | `"triangle"`
- `strokeStyle`: `"solid"` (default) | `"dashed"` | `"dotted"`

### Arrow Bindings (connect arrows to shapes)

```json
{
  "type": "arrow", "id": "a1", "x": 300, "y": 150, "width": 150, "height": 0,
  "points": [[0,0],[150,0]], "endArrowhead": "arrow",
  "startBinding": { "elementId": "r1", "fixedPoint": [1, 0.5] },
  "endBinding": { "elementId": "r2", "fixedPoint": [0, 0.5] }
}
```

`fixedPoint` coordinates: `top=[0.5,0]`, `bottom=[0.5,1]`, `left=[0,0.5]`, `right=[1,0.5]`

### Drawing Order (z-order)
- Array order = z-order (first = back, last = front)
- Emit progressively: background zones → shape → its bound text → its arrows → next shape
- BAD: all rectangles, then all texts, then all arrows
- GOOD: bg_zone → shape1 → text_for_shape1 → arrow1 → arrow_label_text → shape2 → text_for_shape2 → ...
- Always place the bound text element immediately after its container shape

### Sizing Guidelines

**Font sizes:**
- Minimum `fontSize`: **16** for body text, labels, descriptions
- Minimum `fontSize`: **20** for titles and headings
- Minimum `fontSize`: **14** for secondary annotations only (sparingly)
- NEVER use `fontSize` below 14

**Element sizes:**
- Minimum shape size: 120x60 for labeled rectangles/ellipses
- Leave 20-30px gaps between elements minimum
- Prefer fewer, larger elements over many tiny ones

### Color Palette

See `references/colors.md` for full color tables. Quick reference:

| Use | Fill Color | Hex |
|-----|-----------|-----|
| Primary / Input | Light Blue | `#a5d8ff` |
| Success / Output | Light Green | `#b2f2bb` |
| Warning / External | Light Orange | `#ffd8a8` |
| Processing / Special | Light Purple | `#d0bfff` |
| Error / Critical | Light Red | `#ffc9c9` |
| Notes / Decisions | Light Yellow | `#fff3bf` |
| Storage / Data | Light Teal | `#c3fae8` |
### Tips

- Use the color palette consistently across the diagram
- **Text contrast is CRITICAL** -- never use light gray on dark backgrounds. Minimum text color on dark: `#8b8fa3`
- Do NOT use emoji in text -- they don't render in Excalidraw's font
- For dark mode diagrams, see `references/dark-mode.md` for the full color palette (backgrounds, text, accents, example elements)
- For larger examples, see `references/examples.md`


