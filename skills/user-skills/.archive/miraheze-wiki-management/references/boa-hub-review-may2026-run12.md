# BOA Hub Wiki — Run 12 (May 31, 2026)

## Summary
Full audit of 47 articles on boa.miraheze.org. Applied 2 substantive edits across 2 pages.

## Issues Found & Fixed

### 1. Main Page Edit Count Outdated
- **Main Page** — "464 Edits" → "487 Edits"
- Wiki had grown from 464 to 487 edits since last manual update.

### 2. Missing SEO Template (1 page)
- **Ghosts of Tabor Game Info** — Added `{{#seo:...}}` template for search discoverability. This page was the only non-redirect page missing an SEO template.

## Audit Technique Used
- Public API (`action=query&meta=siteinfo&siprop=statistics`) for GoT article count — confirmed 737 (unchanged from run 11)
- Full content audit of all 52 main-namespace pages via `action=parse&prop=wikitext`
- `list=querypage` checks (WantedPages/UncategorizedPages/LonelyPages/BrokenRedirects/DoubleRedirects) — all returned empty
- Broken wikilink scan across all pages

## Other Observations
- **GoT Wiki article count**: 737 articles — all 4 referencing pages (Main Page, GoT Wiki Hub, BOA Ranks & Structure, Tactics Guide) show correct count
- **`Loadout Guide`** redirect has `[[Weapon_and_Loadout_Guide]]` (underscores in target) — per "never edit redirects" rule, left unchanged
- **Singular game name**: No instances of "Ghost of Tabor" (singular) found — all pages use correct "Ghosts of Tabor"
- **Categories placement**: No categories-before-See Also issues found
- **Corruption scan**: No literal backslash-n, duplicate categories, Image=File: double prefix, or other corruption patterns found
- **Stubs**: No stub pages (all non-redirect pages have >200 chars of content)
- **Uncategorized redirects**: `Island of Tabor Guide`, `Loadout Guide`, `Matka Miest Guide` flagged by prop=categories API — all are redirects, expected MediaWiki behavior, not a bug
- **New page since run 11**: `Guide:FAQ` appears as a new article (46 → 47 articles)

## Results

| Metric | Result |
|--------|--------|
| Uncategorized pages | 0 |
| Orphan pages | 0 |
| Broken internal links | 0 (excluding redirect targets) |
| Missing SEO templates | 0 (fixed) |
| Outdated edit counts | 0 (fixed) |
| Corruption issues | 0 |

## Wiki Stats After Run
- 47 articles, 103 total pages, 488 edits, 17 users, 6 files

## Technical Notes
- Used Playwright headless Chromium for browser login (Selenium not available on Linux ARM64)
- Miraheze API login still disabled; browser form login via auth.miraheze.org SUL3 only
- CSRF token valid for entire session; both edits completed in single session
