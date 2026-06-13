# BOA Hub Wiki Audit — May 25, 2026 (Run 3)

## Summary
Full audit of 15 BOA Hub wiki pages on boa.miraheze.org. Fixed broken links, corrected URLs, standardized GoT wiki article counts.

## Changes Made

| Page | Change | Rev ID |
|------|--------|--------|
| GoT Wiki Hub | Fixed 15 broken internal wikilinks to external got.miraheze.org links; fixed TaborMap URL; updated article count | 18666, 219->221 |
| Main Page | Fixed TaborMap URL (tablormap.com -> tabormap.com); updated article count 752->750+ | 220->222 |
| Money Making Guide | Removed 5 broken links to non-existent pages (Quest Stacking Guide, AI Enemies Guide, Boss Guides, PvP Combat Guide, Gear Fear Guide); replaced with GoT wiki links | 204->227 |
| BOA Ranks and Structure | Fixed [[Ghosts of Tabor]] red link to external link; updated article count 744->750+ | 18668->226 |
| Ghost of Tabor Game Info | Updated article count 752->750+ | 18664->18669 |
| Tactics Guide | Updated article count 744->750+ | updated |
| GoT Wiki Hub | Updated article count 747->750+ | updated |

## Issues Found and Resolved
- TaborMap URL: tablormap.com (typo) on Main Page and GoT Wiki Hub -> corrected to tabormap.com
- GoT Wiki article count: Inconsistent across pages (744, 747, 752) -> standardized to "750+ articles"
- Red link: [[Ghosts of Tabor]] on BOA Ranks & Structure -> external link to got.miraheze.org
- Broken local links: 5 non-existent page links in Money Making Guide -> replaced with GoT wiki external links
- GoT Wiki Hub: 15 internal wikilinks to GoT wiki content (Weapons, Locations, Krtek, etc.) were all red links -> converted to external URLs

## Accuracy Check
- No pages incorrectly describe BOA as a game
- "In-Game BOA Content" section in Game Info correctly distinguishes in-game faction from volunteer program
- All external links to GoT wiki use full https://got.miraheze.org/wiki/... URLs

## GoT Wiki Cross-Reference
- Current article count: 750 (as of May 25, 2026)
- GoT wiki main page title: Ghosts_of_Tabor_Wiki (not Main_Page)
- Game version: 0.13.0.8808.63144 (Wipe 9)

## Notes for Next Run
- Re-verify article count on got.miraheze.org (it may have changed)
- Check if any new pages have been created on GoT wiki that we should link to
- The & in page titles (e.g., "BOA Ranks & Structure") must NOT be URL-encoded as %26 in the title parameter of edit API calls - use the literal title string
