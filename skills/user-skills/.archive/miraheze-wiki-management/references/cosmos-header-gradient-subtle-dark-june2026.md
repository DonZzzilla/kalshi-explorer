# Cosmos Header Gradient — Subtle Dark Override

## Problem

The Cosmos skin's `cosmos-header::before` pseudo-element has a double gradient overlay that creates a "glowy" light gray effect. When the header background is dark, this gradient looks out of place.

## Solution

Don't kill the gradient entirely — make it subtle with dark tones:

```css
/* MediaWiki:Cosmos.css */
body.theme-light .cosmos-header::before {
    background: linear-gradient(to right, rgba(30,30,30,0.4), rgba(20,20,20,0.3)),
                linear-gradient(to left, rgba(10,10,10,0) 200px, #1a1a1a 430px) !important;
}
```

## What NOT to Do

- **Don't use `background: none`** — this kills the header texture entirely and looks flat
- **Don't override with a single solid color** — loses the depth/gradients Cosmos adds
- **Don't target `.cosmos-header` directly for the gradient** — it's on the `::before` pseudo-element

## Result

The gradient structure is preserved (left-to-right + right-to-left blend) but uses dark tones that blend with the dark header background. The header has visible depth without the light gray "glow."
