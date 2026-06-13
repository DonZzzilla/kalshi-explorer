# Ghosts of Tabor Wiki Maintenance — May 26, 2026

## Wiki Stats
- Articles (site stats): **748**
- Main namespace pages (list=allpages): **848** (500 + 348)
- Total pages: 3,626 | Categories: 113
- Game version: 0.13.0.8808.63144 (Wipe 9)
- MW version: 1.45.3

## Login
ZeroSkills confirmed sysop (ID 479, 1539 edits). Groups: sysop, editor, confirmed, chatmod, csmoderator, interface-admin, rollbacker, special_edit, upwizcampeditors.

## What Was Fixed

### 1. Spam/Vandalism Deleted
- `Magical-Fix-Game-Button` — promotional YouTube link, no game content. Deleted.

### 2. Deletion Candidate Removed
- `Farming` — tagged `{{delete}}`, empty sections, outdated. Deleted.

### 3. Categories Added (67 pages)
All uncategorized main namespace pages were categorized:

| Category | Count | Examples |
|---|---|---|
| Items | 20 | Poop duck, Motherboard, Wifi Router, Solid Fuel, War Medal, The Heart of Tabor, VigorX, Shampoo, TR Powder, Quart of Paint, Sui Dabz Blow Torch, TheNollic Toilet Paper, Skill Issue Book, Water pump, Proxys Bomb |
| Containers | 4 | Medical Storage Box, Pistol Storage Box, Pistol Magazine Storage Box, Rifle Mag Storage Box |
| Boss drops | 6 | Pristine Collector/Cultist/Krtek/Mamba/Nikolai/Tatra Figurine |
| Weapons | 5 | Origin 12, PPK 20, Striker-12, TSVL-8, TomaHawk |
| Attachments | 12 | MP5 Drum Mag, Ruger Drum, RVG, RK1, Romanian DL Grip, TacSac, Tigerclaw Grip, Surefire X301, TSVL-8 Magazine, VSS Drum Magazine |
| Armor | 10 | Mamba Hood, Mamba Mask, Patriot Hat, Santa Beard, Santa Hat, Ratnik, Tactical Goggles, Terminator Sunglasses, The Gambler, Wolf Mask |
| Bunker | 4 | Market Room, Medical Block, Vault, Shooting Range |
| Maps | 2 | Mountain Pass, Maps |
| Other | 4 | Vaults→Loot, Survival mechanics→Gameplay Mechanics, Training Mode→Gameplay Mechanics, Skins→Customization |

**Total edits: 69 (67 categorizations + 2 deletions)**

### Batch Edit Pattern (Validated)
- Batches of 10 pages with 400ms delays between edits
- Used `appendtext` to add `[[Category:X]]` to existing pages
- `browser_console` 30-second timeout limits batch size on slow Miraheze connections

## Issues Found But Not Fixed (Need Human Review)

### Outdated Pages (8 pages)
- `Ballistics` — 43KB, not updated since 0.10.0, health system overhauled. Needs complete rewrite for 0.13.0.
- `Ballistics (4 backup pages)` — old version snapshots. Consider deleting or marking as historical archives.
- `Blue Keycard` — marked "removed from the game"
- `White Keycard` — outdated
- `Time to Kill` — outdated

### Broken File Links (16 pages)
- `Standard Shield Small` — missing SmallShield.gif and other images
- `SteamVR Jump Binding Fix` — 3 missing SteamVR binding screenshots
- 6 are in `User:` sandboxes — low priority

### Very Short Stubs
- `Raid Terminal` — 23 chars: "I have no clue.\n[[Map]]"
- `TomaHawk` — 89 chars: placeholder text, needs expansion
- `Shooting Range` — 69 chars, placeholder text

## BOA Content Check: CLEAN
All BOA program pages properly redirected. No BOA program content on the wiki.

## Cache Behavior Notes
- `list=querypage&qppage=Uncategorizedpages` still showed 79 pages after all were categorized
- Cache refreshes on MediaWiki's maintenance cycle (hours)
- Spot-check with `prop=categories` to verify edits actually stuck
- Deleted pages also remain in cache temporarily
