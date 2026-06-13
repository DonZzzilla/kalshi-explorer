# GoT Wiki Miscategorization Audit — May 27, 2026

## Fixed Pages

| Page | Issue | Fix |
|------|-------|-----|
| `File:3237902661854da387f049abebf3d3d3.jpeg` | Broken redirect to `File:Movedfile.jpeg` (target missing) | Replaced redirect with `[[Category:Files]]` |
| `Elite zero` | `[[Category:Enemies]]` + `[[Category:Weapons]]` on a rig | Removed Enemies+Weapons, added `[[Category:Equipment]]` |
| `Fourthechelon` | `[[Category:Quests]]` on night vision equipment | Removed Quests category |
| `Fish Cultist Mask` | `[[Category:Enemies]]` + `[[Enemies]]` link on a helmet | Removed both, kept `Category:Boss drops` + `Category:Helmets` |
| `Damaged Cultist Figurine` | `[[Category:Enemies]]` + `[[Enemies]]` link on junk item + `\n\n` corruption artifacts | Removed both, added `[[Category:Junk items]]`, cleaned `\n` literals |
| `Care Package` | `[[Category:Quests]]` on a loot/junk item | Removed Quests, kept `Category:Quest items` + `Category:Items` |

## Pattern: `[[Wiki Link]]` + `[[Category:X]]` Co-occurrence

Two of the fixed pages followed an identical pattern:
```
[[Enemies]]
[[Category:Enemies]]
```
at the very bottom of the page. The wiki-link and the category BOTH need removing when the association is wrong. Don't just remove the category and leave the wiki-link.

## Corrupted `\n` Artifacts

`Damaged Cultist Figurine` had literal `\n\n` text at the end of its wikitext — not real newlines but the escaped string. This is a known escaping bug. When found, clean the entire page tail.

## Verified Not Broken (Stale Caches)

- `Special:DoubleRedirects` listed 6 pages (Barret, Consumable, M1SASS, Mason Burrito, Zero Foxtrot, ZERO FOXTROT) — all were stale cache entries; each was a single-hop redirect to a valid target page.
- `Special:BrokenRedirects` listed Specter and the file — Specter's target exists; the file was truly broken and was fixed.
- `Special:UncategorizedPages` returned empty (null).
- Cache timestamp on special pages: May 25, 2026 — 2 days stale at time of audit.

## Miscategorization Detection Method

Effective scan approach used this session:
1. Query `action=query&list=allpages&aplimit=500` to get all page titles
2. Spot-check suspicious titles and category memberships
3. For each category, use `action=query&list=categorymembers&cmtitle=Category:X` to enumerate members
4. Spot-check a few pages in each suspicious category with `prop=revisions&rvprop=content`
5. Use `prop=categories` after editing to verify fixes

## Left Untouched (Per Skill Rules)

- `Barret` and `Barrett` redirects with stray `[[Category:Currency]]` — redirect pages must not be edited
- `Fenix translation` redirect with `[[Category:Enemies]]` and `[[Enemies]]` link — redirect pages must not be edited
- `CategoryTest` — existing test/maintenance page, not causing harm
- `Ballistics (*) backup` pages — legitimate archived content
- `Ghost of Tabor Game Info` — game meta-info page; BOA references are legitimate game lore context
