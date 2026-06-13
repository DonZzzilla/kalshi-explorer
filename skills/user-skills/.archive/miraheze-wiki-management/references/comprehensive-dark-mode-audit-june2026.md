# Comprehensive Dark Mode CSS Audit & Override Pattern (June 2026)

## Problem

Overriding `MediaWiki:Cosmos.css` alone is NOT sufficient. TemplateStyles CSS pages load independently with hardcoded light colors.

## CSS Load Order (Cosmos wikis)

1. `MediaWiki:Common.css`
2. Skin built-in CSS (Cosmos)
3. `MediaWiki:Cosmos.css` — skin-specific overrides
4. `site.sty` (via load.php) — generic table selectors, loads LAST
5. TemplateStyles (`Template:*/styles.css`) — per-page, independent

`site.sty` has `table, .wikitable { background: rgb(220,220,229) }` that overrides Cosmos.css even with `!important`. Match or exceed specificity.

## Audit Checklist

Check ALL these for hardcoded bright colors:
- `MediaWiki:Cosmos.css`
- `MediaWiki:Common.css`
- `Template:FilterTable/styles.css`
- `Template:Mbox/styles.css`
- `Module:Documentation/styles.css`
- `MediaWiki:Gadget-*.css`
- Any other TemplateStyles pages

## Override Pattern

Append at END of each file using `body.theme-light` + `!important`:

```css
/* DARK MODE OVERRIDES - GOT wiki body.theme-light */
body.theme-light .some-class {
    background-color: rgba(40, 40, 50, 0.95) !important;
    color: #c8c8c8 !important;
    border-color: #555 !important;
}
```

## Dark Mode Color Palette

| Element | BG | Text | Border |
|---------|-----|------|--------|
| Base panel | `rgba(40,40,50,0.95)` | `#c8c8c8` | `#555` |
| Secondary | `rgba(30,30,40,0.9)` | `#a0a0a0` | `#555` |
| Heading | — | `#e0e0e0` | — |
| Muted | — | `#888` | — |
| Amber accent | `rgba(50,45,35,0.9)` | `#d4a853` | `rgba(212,168,83,0.5)` |
| Red/danger | `rgba(60,30,30,0.95)` | `#cc8888` | `#755` |
| Purple | `rgba(50,35,60,0.95)` | `#c8c8c8` | `#776699` |
| Teal (docs) | `#0b1e1c` | `#c8c8c8` | `#3a5a55` |

## Pages Fixed (June 2026, GoT Wiki)

- `MediaWiki:Cosmos.css` — comprehensive dark theme
- `Template:FilterTable/styles.css` — filter buttons, search, counters
- `Template:Mbox/styles.css` — all 7 mbox types + warning divs
- `Module:Documentation/styles.css` — documentation template
- `MediaWiki:Common.css` — articleFeedbackv5-panel

## Remaining

- `Template:Infobox/styles.css` (if exists)
- Gadget CSS pages (`MediaWiki:Gadget-*.css`)
- Extension CSS on special pages
