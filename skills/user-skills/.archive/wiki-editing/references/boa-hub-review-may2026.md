# BOA Hub Wiki — Content Review (May 2026)

## Wiki Facts
- **URL**: https://boa.miraheze.org
- **Skin**: Citizen
- **Game**: Ghosts of Tabor (VR extraction shooter) by Combat Waffle Studios
- **Account**: ZeroSkills (sysop)
- **Stats at review time**: 30 articles, 6 files, 160+ edits

## Pages Reviewed (30 total)

### Core
- Main Page, About, BOA Ranks and Structure, Guide:FAQ, Guide:Getting Started
- BOA Player Reviews, BOA Hall of Fame

### Tactics & Strategy
- Tactics Guide, Map Guides, Mall Boss Guide, Boss Guides
- Collector Boss Guide, Mamba Boss Guide
- PvP Combat Guide, AI Enemies Guide, Grenade Guide, Extraction Guide

### Guides
- New Player Survival Guide, Money Making Guide, Weapon and Loadout Guide
- Gear Fear Guide, Alpha Container Guide, Quest Stacking Guide
- Trader Leveling Guide, VR Movement Guide

### Hub/Resources
- GoT Wiki Hub, Ghost of Tabor Game Info

## Changes Made (8 edits)

1. **Main Page** — Added `[[Category:BOA Hub]]` (was missing all categories)
2. **Tactics Guide** — Added `[[Category:BOA Hub]]`
3. **Map Guides** — Added `[[Category:BOA Hub]]`
4. **GoT Wiki Hub** — Added `[[Category:BOA Hub]]`; fixed article count "695" → "744" (consistent with Main Page)
5. **New Player Survival Guide** — Expanded from stub to full guide; removed `[[Category:Stubs]]`, added `[[Category:BOA Hub]][[Category:Guides]]`
6. **Mamba Boss Guide** — Fixed 3 broken wikilinks: `[[Foxtrot AI Guide]]`→`[[AI Enemies Guide|Foxtrot AI Guide]]`, `[[Island of Tabor Guide]]`→`[[Map Guides#Island|Island of Tabor Guide]]`, duplicate `[[Boss Guides|Boss Guides]]`→`[[Boss Guides]]`
7. **Collector Boss Guide** — Fixed 2 broken wikilinks: `[[Matka Map Guide]]`→`[[Map Guides#Matka_%26_Matka_Underground|Matka Map Guide]]`, `[[Foxtrot AI Guide]]`→`[[AI Enemies Guide|Foxtrot AI Guide]]`
8. **15 pages** — Added `[[Category:BOA Hub]]` to all pages missing it: Mall Boss Guide, Extraction Guide, Boss Guides, Weapon and Loadout Guide, AI Enemies Guide, PvP Combat Guide, Gear Fear Guide, Alpha Container Guide, Quest Stacking Guide, VR Movement Guide, Grenade Guide, Money Making Guide, Collector Boss Guide, Mamba Boss Guide, Trader Leveling Guide

## Content Accuracy Status
- Game Info: Current (Wipe 9, April 22 2026, v0.13.0)
- FAQ: Current (May 2026, ticket pause/reopening dates correct)
- About: Correct (tickets reopened May 15 2026)
- Hall of Fame: Current through May 2026
- Player Reviews: Current through May 2026
- All external links properly formatted
- Footer/social media links: NOT modified (per standing instruction)

## Technique Notes
- Used `action=parse&prop=categories` for efficient category checking per page
- Used `Promise.all` with `encodeURIComponent` for batch page fetching
- Variable name collision gotcha: `const pages = [...]` declared in two separate browser_console evaluations throws `SyntaxError: Identifier 'pages' has already declared` — use unique names per evaluation
- Login session lost after `browser_navigate` to different domain — must re-login
