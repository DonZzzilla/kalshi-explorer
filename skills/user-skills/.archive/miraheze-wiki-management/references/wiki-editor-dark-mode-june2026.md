# WikiEditor / CodeMirror Dark Mode — GOT Wiki June 2026

## Problem

The source editing textarea has hardcoded `background: white; color: black` from the skin/extension CSS. In dark mode this produces dark text on dark background — completely invisible editing. The WikiEditor toolbar, tabs, summary input, edit buttons, and CodeMirror syntax editor all have the same issue.

## Root Cause

The WikiEditor extension loads its own stylesheets independently from the skin. The skin's `body.theme-light` overrides don't cover editor-specific classes like `.mw-editfont-monospace`, `.wikiEditor-ui-toolbar`, `.wikiEditor-ui-tabs`, `.CodeMirror`, etc.

## Solution

Added comprehensive dark mode overrides to `MediaWiki:Cosmos.css` covering:

### Textarea (main editor)
- `.mw-editfont-monospace`, `.mw-editfont-sans-serif` — dark bg `rgba(25,25,35,0.95)`, light text `#c8c8c8`, dark border
- Focus state — slightly lighter bg, amber outline glow

### WikiEditor Toolbar
- `.wikiEditor-ui-toolbar` — dark background, dark borders
- `.tool-button` — dark buttons with light text, hover state brighter
- `.tool-button.selected` — amber/gold highlight for active tools

### WikiEditor Tabs
- `.wikiEditor-ui-tabs` — dark tab bar
- `.tab` — muted gray text, dark background
- `.tab.current` — brighter text for active tab
- `.tab:hover` — amber highlight

### Edit Summary & Options
- `#wpSummary` — dark input, light text, amber focus
- `.editOptions`, `#editpage-checkboxes` — dark background, light text

### Edit Buttons
- `#wpSave`, `#wpPreview`, `#wpDiff` — amber/gold tones
- `#wpCancel` — dark red

### CodeMirror (syntax-highlighted editor)
- Dark background, light text
- Dark gutters with muted line numbers
- Amber cursor
- Selection highlight
- Syntax coloring for wikitext:
  - Templates: amber `#d4a853`
  - Template arguments: green `#a0c8a0`
  - Links: blue `#7cb8dd`
  - Tags: amber `#d4a853`
  - Comments: green `#6a8a6a`
  - Headings: white/bold `#e0e0e0`
  - Lists: amber `#d4a853`
  - Table definitions: green `#a0c8a0`
  - Template variables: red `#dd9999`
  - Magic links: blue `#7cb8dd`

## Classes Found on Edit Page

From inspecting the edit page DOM:
- `#wpTextbox1` — the main textarea, class `mw-editfont-monospace` (or `mw-editfont-sans-serif` depending on preference)
- `.mw-body-content` — parent container
- WikiEditor toolbar, tabs, and bottom bar (not loaded in headless browser but present in real browsers)
- `#wpSummary` — edit summary input
- `#wpSave`, `#wpPreview`, `#wpDiff`, `#wpCancel` — edit buttons
- `.editOptions` — options container

## Verification

Navigate to any edit page (`?action=edit`) and check:
```javascript
const ta = document.querySelector('#wpTextbox1');
const cs = window.getComputedStyle(ta);
// cs.backgroundColor should be "rgb(25, 25, 35)" or similar dark value
// cs.color should be "rgb(200, 200, 200)" or similar light value
```

## Deployment

- Added to `MediaWiki:Cosmos.css` on got.miraheze.org (June 4, 2026)
- Applied via Python requests API with `body.theme-light` selectors

## See Also

- `references/cosmos-dark-mode-default-june2026.md` — main dark mode pattern
- `references/site-sty-table-cascade-june2026.md` — CSS loading order issue
- `references/filtertable-styles-dark-mode-june2026.md` — FilterTable dark mode
- `references/mbox-documentation-dark-mode-june2026.md` — Mbox/Documentation dark mode
