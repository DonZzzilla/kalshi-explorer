# BOA Hub Wiki — Full Categorization Pass (May 28, 2026)

## Scope
Full audit and categorization of boa.miraheze.org. 51 pages total (48 content + 3 redirects).

## Before State
- 33 content pages had **zero** categories
- 22 categories existed in the wiki but **none were organized into a hierarchy**
- Category:BOA Hub (the root category) had **no category page** (missing page)
- 8 hub/guide pages were missing See Also sections

## Work Performed

### 1. Added Categories to 33 Uncategorized Pages
Used `appendtext` via `browser_console` `fetch()` POST with URLSearchParams. All 33 succeeded:
- AI Enemies Guide, Aim and Recoil Guide, Alpha Container Guide, Armor and Equipment Guide,
  BOA Ranks & Structure, Boss Guides, Collector Boss Guide, Combat Tips, Extraction Guide,
  Friend or Foe Guide, Gear Fear Guide, GoT Wiki Hub, Grenade Guide, Insurance Guide,
  Inventory and Backpack Management, Island Map Guide, Keycard Farming Guide, Krtek Boss Guide,
  Mall PvP Guide, Mamba Boss Guide, Map Guides, Matka Map Guide, Miest Map Guide,
  New Player Survival Guide, PvP Combat Guide, Quest Stacking Guide, Rations and Supply System,
  Silo Map Guide, Solo Play Guide, Suppressor Guide, Trader Leveling Guide, VR Movement Guide,
  Weapon and Loadout Guide

Categories assigned: BOA Hub (all), Guides (22), Combat (10), Tactics (14), Maps (5),
Items (4), Weapons (5), AI Enemies (1)

### 2. Created Missing Root Category Page
Category:BOA Hub was used by all pages but the category page itself didn't exist (pageid -1).
Created with description text and self-referencing `[[Category:BOA Hub]]`.

### 3. Organized Category Hierarchy (21 parent assignments)
Established a 3-level tree:

```
Category:BOA Hub (root)
├── Category:Gameplay
│   ├── Category:Combat
│   │   ├── Category:PvP
│   │   ├── Category:Weapons
│   │   └── Category:Equipment
│   ├── Category:Tactics
│   ├── Category:AI Enemies
│   ├── Category:Bosses
│   ├── Category:Teamwork
│   ├── Category:VR
│   ├── Category:Economy
│   ├── Category:Inventory
│   └── Category:Resources
├── Category:Guides
├── Category:Maps
├── Category:Items
├── Category:Money
├── Category:Missions
├── Category:Quests
├── Category:Psychology
└── Category:Hub
```

### 4. Added See Also Sections to 8 Pages
Guide:Getting Started, About, BOA Discord Rules & Policies, BOA Hall of Fame,
BOA Player Reviews, The Story of the BOA Hub Discord, Rations and Supply System,
Solo Play Guide

## After State
- 0 uncategorized content pages (3 uncategorized pages are all redirects — correct)
- Full category hierarchy in place
- All hub/guide pages have See Also cross-links
- Total edits: 62 (33 category + 1 category page creation + 21 hierarchy + 8 See Also)

## Technique Notes
- `appendtext` with categories works even when page already has template-embedded categories;
  API returns `nochange` for those pages (content was already present)
- `prop=categories` correctly returned `[]` for truly uncategorized pages on this wiki
  (different from stale-cache behavior seen on GoT wiki)
- JS `var` for token variable reused across all edits in single browser_console block — no issues
- Category hierarchy applied by editing each Category: page with appendtext containing parent category
