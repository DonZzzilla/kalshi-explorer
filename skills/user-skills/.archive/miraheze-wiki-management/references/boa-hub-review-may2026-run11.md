# BOA Hub Wiki — Run 11 (May 30, 2026)

## Summary
Quick audit of boa.miraheze.org. Applied 6 edits across 6 pages — all data accuracy fixes.

## Issues Found & Fixed

### 1. GoT Wiki Article Count Outdated (5 pages)
GoT Wiki grew from 736 → 737 articles since last run. Updated all references:
- **Main Page** — "736+ articles" → "737+ articles" in External Links
- **GoT Wiki Hub** — 2 occurrences fixed
- **BOA Ranks & Structure** — 1 occurrence fixed
- **Tactics Guide** — 1 occurrence fixed
- **Ghost of Tabor Game Info** — 1 occurrence fixed

### 2. Main Page Edit Count Outdated
- **Main Page** — "463 Edits" → "464 Edits" (actual: 470 after our edits)

### 3. Underscore Wikilink (1 page)
- **Krtek Boss Guide** — Fixed `[[AI_Enemies Guide]]` → `[[AI Enemies Guide]]`

## Audit Technique Used
- Cross-wiki GET to `got.miraheze.org/w/api.php?action=query&meta=siteinfo&siprop=statistics` for current count
- Full content audit of all 51 pages via `action=parse&prop=wikitext`
- `list=querypage` checks (WantedPages/UncategorizedPages/LonelyPages/BrokenRedirects/DoubleRedirects) — all returned empty

## Results

| Metric | Result |
|--------|--------|
| Uncategorized pages | 0 |
| Orphan pages | 0 |
| Broken internal links | 0 |
| Outdated article counts | 0 (fixed) |
| Underscore wikilinks | 0 (fixed) |

## Wiki Stats After Run
- 46 articles, 102 pages, 470 edits, 17 users, 6 files
