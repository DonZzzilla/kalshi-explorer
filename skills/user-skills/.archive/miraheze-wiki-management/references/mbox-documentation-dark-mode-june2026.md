# Mbox & Documentation TemplateStyles — Dark Mode Overrides (June 2026)

## Problem

`Template:Mbox/styles.css` and `Module:Documentation/styles.css` are **separate CSS pages** loaded via TemplateStyles. They are NOT affected by `MediaWiki:Cosmos.css` overrides. Both had hardcoded light colors with no `body.theme-light` support.

## Mbox/styles.css — Issues Found

- `.messagebox` → `var(--background-color-base, #f8f9fa)` — light gray
- `.messagebox.merge` → `#f0e5ff` — light purple
- `.messagebox.cleanup` → `#efefff` — light blue
- `.messagebox.standard-talk` → `#f8eaba` — light yellow
- `table.ambox` → `var(--background-color-base, #fbfbfb)` — near-white
- `table.imbox` → `var(--background-color-base, #fbfbfb)` — near-white
- `table.cmbox` → `#DFE8FF` — light blue
- `table.ombox` → `var(--background-color-base, #f8f9fa)` — light gray
- `table.tmbox` → `#f8eaba` — light yellow
- `table.fmbox` → `var(--background-color-base, #f8f9fa)` — light gray
- `table.fmbox-warning` → `#ffdbdb` — pink
- Various `div.mw-warning*` → `#ffdbdb` — pink
- Only had `prefers-color-scheme: dark` and `skin-theme-clientpref-night/os` for `.tmbox` — nothing for `body.theme-light`

## Documentation/styles.css — Issues Found

- `.documentation` → `#ecfcf4` — light teal
- `.documentation-metadata` → `#ecfcf4` — light teal
- Already had `skin-theme-clientpref-night` and `prefers-color-scheme: dark` support (setting `#0b1e1c`)
- Missing `body.theme-light` support

## Solution Applied

Appended `body.theme-light` overrides to both files:

### Mbox dark mode colors:
- Base messagebox: `rgba(40, 40, 50, 0.95)` — dark gray
- Merge: `rgba(50, 40, 60, 0.95)` — dark purple
- Cleanup: `rgba(40, 45, 65, 0.95)` — dark blue
- Standard-talk/nested-talk: `rgba(55, 50, 35, 0.95)` — dark yellow-brown
- Speedy/delete variants: `rgba(60, 30, 30, 0.95)` — dark red
- Content variants: `rgba(60, 45, 25, 0.95)` — dark orange
- Style variants: `rgba(60, 55, 25, 0.95)` — dark yellow
- Move variants: `rgba(50, 35, 60, 0.95)` — dark purple
- Protection variants: `rgba(45, 45, 50, 0.95)` — dark gray
- Warning divs: `rgba(60, 30, 30, 0.95)` — dark red
- Text cells: `#c8c8c8` — light gray
- Image cells: transparent

### Documentation dark mode colors:
- Background: `#0b1e1c` — dark teal (same as existing `prefers-color-scheme: dark`)
- Text: `#c8c8c8` — light gray
- Border: `#3a5a55` — dark teal border
- Heading: `#e0e0e0` — near-white
- Toolbar: `#a0a0a0` — muted gray

## Key Principle

**When dark-modding a wiki, audit ALL separate CSS pages (templates, gadgets, TemplateStyles).** The main Cosmos.css doesn't cover them. Each needs its own `body.theme-light` overrides.

Common culprits to check:
- `Template:FilterTable/styles.css`
- `Template:Mbox/styles.css`
- `Module:Documentation/styles.css`
- `Template:Infobox/styles.css` (if exists)
- Any gadget CSS loaded via `mw.loader.load()`

## Deployment

Both edits applied via Python requests API (not browser — protected pages):
- `Template:Mbox/styles.css`: 9,661 → 15,457 chars (+5,796)
- `Module:Documentation/styles.css`: 1,211 → 1,694 chars (+483)
