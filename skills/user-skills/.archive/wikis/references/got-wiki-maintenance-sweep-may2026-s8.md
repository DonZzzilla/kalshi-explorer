# GoT Wiki Maintenance Sweep — May 2026 Session 8

**Date**: 2026-05-28  
**Wiki**: got.miraheze.org  
**Scanner**: OWL (cron job)  
**Pages scanned**: 899 main namespace, 141 redirects, 758 non-redirects  

## Summary

3 infobox `Image=` parameter corruption fixes applied, 1 Fandom→local image fix. No content corruption, no broken redirects, no BOA content issues.

## Fixes Applied

### Infobox `Image=` contains `[[File:...]]` (new corruption pattern)

Three pages had full wiki `[[File:...]]` syntax inside infobox `Image=` params instead of bare filenames:

| Page | Before | After |
|------|--------|-------|
| `Glock 17 (blicky)` | `\| Image=\n[[File:Blicky NoBG.png\|thumb]]` | `Blicky NoBG.png` |
| `Standard Shield Large` | `\| Image = [[File:LargeShield.gif\|frameless\|150px]]` | `LargeShield.gif` |
| `Standard Shield Small` | `\| Image =[[File:SmallShield.gif\|frameless\|150px]]` | `SmallShield.gif` |

**Pattern**: `re.sub(r'(\|\s*\w*[Ii]mage\w*\s*=\s*)\[\[File:([^\]]+)\]\]', lambda m: m.group(1) + m.group(2).split('|')[0], content)`

All three local files exist on the wiki. The `[[File:]]` wrapper inside `Image=` prevents the infobox template from rendering the image correctly.

### External Fandom URL in infobox `Image=`

| Page | Before | After |
|------|--------|-------|
| `EO-Tech 2x-4x magnifier` | `Image=https://static.wikia.nocookie.net/ghosts-of-tabor/images/7/7a/Bozidar_4.jpg/...` | `Image=EO-Tech 2x-4x magnifier.png` |
| | `caption-Image=https://static.wikitide.net/...` | `caption-Image=EO-Tech 2x-4x magnifier.png` |

Local file `File:EO-Tech 2x-4x magnifier.png` confirmed to exist before replacing.

## Issues Checked — No Action Needed

| Check | Result |
|-------|--------|
| Broken redirects (tracking category) | 1 reported: `Category:BOA Hub` → `GoT Wiki Hub` — **target exists, NOT broken** (false positive) |
| Self-referencing redirects | 0 found across 141 redirects |
| BOA program pages | All 3 (`About BOA`, `BOA Ranks`, `BOA Program`) correctly redirect to `GoT Wiki Hub` |
| Content corruption (literal `\n`, `Image=File:`, dup categories) | 0 pages affected |
| Broken file links (tracking category) | 0 reported |
| Case-duplicate titles | 5 pairs exist, all have disambiguation or redirects in place |
| Uncategorized pages (tracking) | Reports 0; `prop=categories` API showed inconsistent results (staleness issue) — no reliable signal to act on |
| `prop=categories` API reliability | Confirmed stale — `Ammo` returned 0 categories on first check, verified as having 2 via page source. Cross-check with regex on source when results unexpected. |

## New Corruption Pattern Discovered

**`[[File:...]]` inside infobox `Image=` parameter** — an infobox where `| Image = [[File:Name.png|params]]` instead of `| Image = Name.png`. Differs from the previously documented `Image=File:Name.png` (missing brackets) variant. Added to the corruption pattern list as pattern #5 in SKILL.md `scan_page_corruption()`.
