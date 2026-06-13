# gotboa.com → Miraheze Wiki Color Scheme Mapping

## Reference: gotboa.com CSS Variables (from `assets/site.css`)

```css
:root {
  --bg: #121510;
  --bg-deep: #0c0e0a;
  --panel: #1a1e16;
  --panel-raised: #22261c;
  --border: #3a4230;
  --border-light: #4d5640;
  --text: #e6e4dc;
  --muted: #9a9688;
  --accent: #8fa652;
  --accent-bright: #a8bf6a;
  --accent-dim: rgba(143, 166, 82, 0.14);
  --gold: #c4a035;
  --gold-dim: rgba(196, 160, 53, 0.15);
  --link: #9ecae8;
  --link-hover: #c5e4f8;
}
```

## BOA Hub Wiki (boa.miraheze.org) — MediaWiki:Common.css

Updated June 2026 to match gotboa.com. Key patterns:

### Global Overrides
- `body` and `#mw-page-base` → `var(--bg-deep)` background
- All text → `var(--text)`
- Links → `var(--link)` (light blue, not red)
- Headings → `var(--accent-bright)` with `var(--accent)` bottom border on h1

### Tables (`.wikitable`)
- Header: `var(--panel-raised)` background, `var(--accent-bright)` text, `var(--accent)` bottom border
- Cells: `var(--panel)` background, `var(--border)` bottom border
- Hover: `rgba(143, 166, 82, 0.06)` subtle green tint

### Sidebar (`#mw-panel`)
- Portal boxes: `var(--panel)` background, `var(--border)` border
- Portal headings: `var(--accent-bright)`

### Navigation Tabs
- Selected tab: `var(--accent-bright)` text + `var(--accent)` bottom border
- Hover: `var(--panel-raised)` background

### TOC / Infobox / Thumbnails / Code / Footer
- All use `var(--panel)` backgrounds, `var(--border)` borders, `var(--text)` text
- TOC/Infobox titles: `var(--accent-bright)`
- Code: `var(--accent-bright)` text

### Buttons
- Default: `var(--panel-raised)` background, `var(--border)` border
- Hover: `var(--accent-dim)` background, `var(--accent)` border
- Progressive (save/submit): `var(--accent)` background with dark text

### Important Notes
- Use `!important` on all overrides — MediaWiki's default CSS loads with high specificity
- Citizen skin (BOA Hub) loads Common.css normally — no special ordering issues like Cosmos
- Purge the page after editing Common.css: add `?purge=true` to any wiki URL
- The old scheme used navy (`#1a1a2e`) and red (`#e94560`) — fully replaced
