# BOA Hub Wiki — Run 10 (May 30, 2026)

## Summary
Full audit of 46 articles on boa.miraheze.org. Applied 15 substantive edits across 8 pages fixing content accuracy, formatting, and navigation.

## Issues Found & Fixed

### 1. GoT Wiki Article Count Outdated (5 pages)
GoT Wiki had 736 articles but BOA wiki claimed "750+" and "747+" across 5 pages.
- **GoT Wiki Hub** — Updated 750+ → 736+ and 747+ → 736+
- **Main Page** — Updated 750+ → 736+
- **BOA Ranks & Structure** — Updated 750+ → 736+
- **Tactics Guide** — Updated 750+ → 736+
- **Ghost of Tabor Game Info** — Updated 750+ → 736+

**Pattern:** Cross-domain GET to `got.miraheze.org/w/api.php?action=query&meta=siteinfo&siprop=statistics` to fetch current count, then update all local references.

### 2. "Ghost of Tabor" Singular → "Ghosts of Tabor" (2 pages)
The game's official name is "Ghosts of Tabor" (plural). Fixed inconsistent singular usage:
- **Main Page** — Fixed 1 instance
- **Tactics Guide** — Fixed 1 instance

### 3. Boss Guides Table Wikilinks (1 page)
- **Boss Guides** — Fixed `[[Mall_Boss_Guide|Nikolai]]` → `[[Mall Boss Guide|Nikolai]]` and same for Tatra, Collector, Mamba entries.

### 4. See Also Underscore Links (2 pages)
- **Krtek Boss Guide** — Fixed `[[Boss_Guides]]` → `[[Boss Guides]]`, `[[Silo_Map_Guide]]` → `[[Silo Map Guide]]`, `[[Keycard_Farming_Guide]]` → `[[Keycard Farming Guide]]`, `[[Money_Making_Guide]]` → `[[Money Making Guide]]`
- **Silo Map Guide** — Fixed 5 underscore-based See Also links to use spaces

### 5. Missing SEO Template (1 page)
- **Main Page** — Added `{{#seo:...}}` template. Was the only page missing it.

### 6. Missing See Also Section (1 page)
- **GoT Wiki Hub** — Added See Also section with links to Main Page, Ghost of Tabor Game Info, and Boss Guides

### 7. Outdated Boss Schedule (1 page)
- **Ghost of Tabor Game Info** — Updated boss schedule section. Removed outdated "Week 2 community vote" detail, added complete list of all 5 currently active bosses.

### 8. Wiki Stats Banner (1 page)
- **Main Page** — Updated "45 Articles" → "46 Articles" and "300+ Edits" → "463 Edits"

## Audit Technique Used
- `list=querypage&qppage=WantedPages/UncategorizedPages/LonelyPages/BrokenRedirects/DoubleRedirects` — all returned empty, confirming healthy wiki
- FlaggedRevs check via `siprop=extensions` — not enabled, edits go live immediately
- Cross-wiki article count via Python `requests` GET (no auth needed for public API)
- Full content audit of all 46 pages via `action=parse&prop=wikitext`

## Results

| Metric | Result |
|--------|--------|
| Uncategorized pages | 0 |
| Orphan pages | 0 |
| Broken internal links | 0 |
| Missing SEO templates | 0 (fixed) |
| Outdated article counts | 0 (fixed) |
| Singular game name | 0 (fixed) |
| Underscore wikilinks | 0 (fixed) |

## Wiki Stats After Run
- 46 articles, 102 total pages, 463 edits, 17 users, 6 files
