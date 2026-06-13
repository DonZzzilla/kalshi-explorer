# GoT Wiki Audit — May 28, 2026 (Session 5)

## Scope
Cron maintenance pass on got.miraheze.org as ZeroSkills. Focus: broken redirects, uncategorized pages, miscategorization, BOA program pages.

## Findings

### Stale Caches (No Action Needed)
All three Special page caches (BrokenRedirects, DoubleRedirects, UncategorizedPages) were stale — last updated 09:23, 25 May 2026. Every entry required live API verification.

### Broken Redirects — Both False Positives
- `Sean - Spectre Guns and Accessories` — Listed as broken redirect but has full content (not a redirect at all). Is the **target** of the `Spectre Guns and Accessories` redirect. Stale cache ghost.
- `File:3237902661854da387f049abebf3d3d3.jpeg` — Listed as broken redirect but has content `[[Category:Files]]`. Not a redirect.

### Double Redirects — All Resolved
All 6 entries were crossed out. No action needed.

### Uncategorized Pages — All False Positives
All 50 pages in the cache had categories in their content. The `prop=categories` API returned empty for many (categories added via infobox templates), but raw wikitext confirmed `[[Category:` lines present.

### Fixed: Category:Helmets in Wrong Parent
- **Problem**: `Category:Helmets` had `[[Category:---]]` (a junk category)
- **Fix**: Replaced with `[[Category:Armor]]` and added description
- **Why it matters**: Helmets are armor, not random items. The `---` category is a junk/maintenance artifact with no content or purpose.

### Fixed: Category:Armor Empty and Uncategorized
- **Problem**: `Category:Armor` had no content and no parent category — a floating orphan
- **Fix**: Added description and `[[Category:Items]]` parent
- **Correct hierarchy**: `Category:Items` -> `Category:Armor` -> `Category:Helmets`

### Fixed: Stray Wiki-Links on Content Pages (3 pages)
The `[[Wiki Link]]` + `[[Category:X]]` co-occurrence pattern (already documented in s3 audit):

| Page | Stray Link | Category | Action |
|------|-----------|----------|--------|
| Ratnik | `[[Items]]` | `[[Category:Armor]]` | Removed `[[Items]]` |
| Santa Beard | `[[Items]]` | `[[Category:Armor]]` | Removed `[[Items]]` |
| Sean - Spectre Guns and Accessories | `[[Items]]` | `[[Category:Traders]]` | Removed `[[Items]]` |

### Fixed: Self-Referential Wiki-Link
- **Problem**: `Skins` page had `[[Skins]]` at the bottom — a self-referential link
- **Action**: Removed it
- **Pattern**: A page should never have a wiki-link to itself as a "see also" style footer link. These are artifacts from copy-paste templates.

### Left Alone: Stray `[[Helmets]]` on Armor Pages
Pages like Mamba Hood, Mamba Mask, Patriot Hat, Santa Hat all have `[[Helmets]]` in their footer. The `Helmets` page exists but is empty (no content, no categories). These links point to a blank page. Not fixed because:
- The links are technically correct (these ARE helmets)
- Fixing requires creating the Helmets article (content creation, not maintenance)
- The `Helmets` page needs a proper article written first

### Left Alone: `Spectre Guns and Accessories` Redirect
The redirect page `Spectre Guns and Accessories` -> `Sean - Spectre Guns and Accessories` has `[[Items]]` after the `#REDIRECT` line. Not fixed because redirect pages must never be edited (per "NEVER EDIT REDIRECT PAGES" rule).

### No BOA Program Pages Found
Searched for BOA, Battlefield of Adrian, About BOA, BOA Ranks, Discord Rules, Team Map, Hall of Fame. Only "Team Map" exists and it already redirects to "GoT Wiki Hub". "BOA Supply Drop" is a legitimate in-game item.

## Category Hierarchy Discovered
```
Category:Ghosts of Tabor Wiki (root)
+-- Category:Items
    +-- Category:Armor
    |   +-- Category:Helmets
    +-- Category:Traders
    +-- Category:Customization
```

## New Patterns to Watch For
1. **Self-referential wiki-links**: Pages with `[[Page Name]]` linking to themselves — remove the self-link
2. **Junk categories** (`Category:---`): Empty categories with dashes. Check members (via `categorymembers`), and if the only members are misplaced categories, fix the members. Don't delete the junk category itself.
3. **Empty category pages**: Category pages with no content and no parent — they need at minimum a description and `[[Category:Parent]]`
