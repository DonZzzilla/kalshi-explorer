# Excalidraw to Inline SVG Converter

Session-tested pattern for embedding `.excalidraw` diagrams as inline SVGs in static HTML.

## Problem

`.excalidraw` files are JSON — browsers can't render them directly. GitHub Pages serves them as downloads (404 for viewing). Need inline SVG.

## Solution Overview

1. Parse excalidraw JSON elements
2. Convert to SVG markup via Python
3. Write to a `.js` file (not inline — too large for `execute_code` string building)
4. Inject into HTML container divs via a render script

## Why Not Inline?

`execute_code` silently truncates very large strings. A 70KB SVG string built via `"".join()` or f-string concatenation will be silently dropped. The HTML file will be written but the diagram content will be missing. Always write large data to a separate file via `open().write()`.

## Converter Code

```python
import json, os, html

def excalidraw_to_svg(elements, width=1200, height=700):
    parts = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="auto" style="display:block;margin:0 auto;max-width:100%;">')
    
    bg = "#0a0b0e"
    for el in elements:
        if el.get("type") == "rectangle" and el.get("id") == "bg":
            bg = el.get("backgroundColor", "#0a0b0e")
            break
    parts.append(f'<rect width="{width}" height="{height}" fill="{bg}"/>')
    
    ac = 0
    for el in elements:
        t = el.get("type")
        x, y, w, h = el.get("x",0), el.get("y",0), el.get("width",0), el.get("height",0)
        
        if t == "rectangle" and el.get("id") != "bg":
            fill = el.get("backgroundColor","transparent")
            if fill == "transparent": fill = "none"
            sc = el.get("strokeColor","none")
            sw = el.get("strokeWidth",1)
            op = el.get("opacity",100)/100
            rx = 8 if el.get("roundness") else 4
            parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{sc}" stroke-width="{sw}" opacity="{op}"/>')
        
        elif t == "text":
            txt = el.get("text","")
            fs = el.get("fontSize",14)
            col = el.get("strokeColor","#fff")
            bold = "bold" if el.get("fontWeight",400)>=700 else "normal"
            anc = "middle" if el.get("textAlign")=="center" else "start"
            ff = "monospace" if el.get("fontFamily")==1 else "sans-serif"
            lh = fs * 1.4
            for i, line in enumerate(txt.split("\n")):
                if line.strip():
                    tx = x + w/2 if anc=="middle" else x
                    ty = y + i*lh
                    parts.append(f'<text x="{tx}" y="{ty}" dy="1em" font-size="{fs}" fill="{col}" font-weight="{bold}" text-anchor="{anc}" font-family="{ff}" dominant-baseline="hanging">{html.escape(line)}</text>')
        
        elif t == "arrow":
            pts = el.get("points",[])
            if len(pts)>=2:
                sc = el.get("strokeColor","#d4a853")
                sw = el.get("strokeWidth",2)
                d = f"M {pts[0][0]} {pts[0][1]}"
                for px,py in pts[1:]: d += f" L {px} {py}"
                aid = f"a{ac}"; ac += 1
                parts.append(f'<defs><marker id="{aid}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="{sc}"/></marker></defs>')
                parts.append(f'<path d="{d}" stroke="{sc}" stroke-width="{sw}" fill="none" marker-end="url(#{aid})"/>')
    
    parts.append('</svg>')
    return '\n'.join(parts)
```

## File Writing Pattern

```python
# Write diagram data to JS file (in execute_code)
with open("docs/diagrams.js", "w") as f:
    f.write("const DIAGRAMS = [];\n")
    for d in diagrams:
        svg_escaped = d["svg"].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        f.write(f'DIAGRAMS.push({{id: "{d_id}", svg: `{svg_escaped}`}});\n')
```

In HTML, add container divs and render script:
```html
<div class="diagram-svg-wrap" id="diag-01-partnership-overview"></div>
<!-- ... more containers ... -->

<script>
DIAGRAMS.forEach(function(d){
  var el = document.getElementById('diag-' + d.id);
  if(el) el.innerHTML = d.svg;
});
</script>
```

## Verification Checklist

After pushing to live site:
- `html.count("<svg")` should be >= 6 (1 decorative + N diagrams)
- `"diagram-grid" in html` should be True
- Diagram section titles present in HTML
- If svg_count == 1, content was stripped — re-write using file-based approach

## Element Support

| Excalidraw type | SVG element | Notes |
|---|---|---|
| `rectangle` | `<rect>` | fill, stroke, roundness -> rx |
| `text` | `<text>` | Multiline via `\n`, fontFamily 1 -> monospace |
| `arrow` | `<path>` + `<marker>` | Arrowhead via SVG marker |
| `image` | Skip | Not supported in static rendering |
