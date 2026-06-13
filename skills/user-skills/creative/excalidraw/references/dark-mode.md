# Excalidraw Dark Mode Color Reference

Dark-themed diagram palette for use with `viewBackgroundColor: "#0a0b0e"`.

## Background Colors

| Use | Hex | Notes |
|-----|-----|-------|
| Canvas background | `#0a0b0e` | Main background (near-black) |
| Card/surface | `#111318` | Primary surface |
| Elevated surface | `#181b22` | Cards, panels |
| Highlight surface | `#1e2230` | Emphasized cards, buttons |
| Border | `#2a2e3a` | Default border |
| Border active | `#3a3e4e` | Hover/active border |

## Text Colors

| Use | Hex | Notes |
|-----|-----|-------|
| Primary text | `#e8eaed` | Main content |
| Muted text | `#8b8fa3` | Secondary content |
| Dim text | `#5a5e72` | Tertiary, timestamps |
| Accent text | `#d4a853` | Gold accent |

## Accent Fill Colors (for shapes)

| Use | Border | Text |
|-----|--------|------|
| Primary/Info | `#5b8dee` | `#5b8dee` |
| Success | `#55c57a` | `#55c57a` |
| Warning | `#d4a853` | `#d4a853` |
| Error | `#e05555` | `#e05555` |
| Processing | `#d0bfff` | `#d0bfff` |
| Storage | `#55c57a` | `#55c57a` |
| Notes | `#d4a853` | `#d4a853` |

Use fill at 70-80% opacity for subtle shapes, 100% for emphasis.

## Example Dark Theme Elements

Rectangle card:
```json
{"type":"rectangle","id":"c1","x":100,"y":100,"width":240,"height":80,"backgroundColor":"#1e2230","fillStyle":"solid","strokeColor":"#5b8dee","strokeWidth":2,"roughness":1,"roundness":{"type":3}}
```

Title text:
```json
{"type":"text","id":"t1","x":300,"y":25,"width":600,"height":32,"text":"Title","fontSize":26,"fontFamily":1,"strokeColor":"#d4a853","fontWeight":800,"textAlign":"center","verticalAlign":"middle","originalText":"Title","autoResize":true}
```

Body text:
```json
{"type":"text","id":"t2","x":110,"y":110,"width":220,"height":20,"text":"Body text","fontSize":14,"fontFamily":1,"strokeColor":"#8b8fa3","textAlign":"center","verticalAlign":"middle","originalText":"Body text","autoResize":true}
```
