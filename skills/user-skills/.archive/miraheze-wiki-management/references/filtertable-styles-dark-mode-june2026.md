# FilterTable/styles.css Dark Mode Overrides

## Problem

`Template:FilterTable/styles.css` is loaded separately via TemplateStyles. It has hardcoded light colors that don't respond to the DarkMode extension's `body.theme-light` class:

- `.filter-button` uses `var(--background-color-base, #fff)` — white
- `.filter-button:hover` uses `var(--background-color-interactive-subtle--hover, #eaecf0)` — light gray
- `.filter-button.button-selected` has blue gradient (wrong on dark)
- `.filter-search input` has no color styles (inherits white)
- `@media (prefers-color-scheme: dark)` only covers `.button-selected`

## Solution

Append `body.theme-light` overrides to the END of `Template:FilterTable/styles.css`. See the code block in the SKILL.md section "FilterTable/styles.css — Separate CSS Page Needs Dark Mode Overrides".

## Key Principle

When dark-modding a wiki, audit ALL separate CSS pages (templates, gadgets, TemplateStyles). The main Cosmos.css doesn't cover them. Each needs its own `body.theme-light` overrides.

Common culprits:
- `Template:FilterTable/styles.css`
- `Template:Infobox/styles.css` (if using TemplateStyles)
- Gadget CSS loaded via `mw.loader.load()`

## Status

- **GoT wiki**: Deployed June 2026
- **Other wikis**: Check and deploy if FilterTable is used
