# Ghosts of Tabor Wiki Maintenance Audit — May 25, 2026 (Run 3: Full Scan)

## Wiki Stats
- Articles (site stats): 750
- Main namespace pages (list=allpages): **894**
- Total pages: 3,628 | Categories: 113
- Game version: 0.13.0.8808.63144 (Wipe 9)

## Login: ZeroSkills confirmed sysop
- User ID: 479, Edit count: 1,539
- Groups: sysop, editor, confirmed, chatmod, csmoderator, interface-admin, rollbacker

## Category Audit Results
- **Total scanned**: 894 main namespace pages
- **No categories**: **761 (85.1%)**
- **Have categories**: 133 (14.9%)

### High-Priority Missing Categories
| Page | Should Have |
|------|-------------|
| Maps | `[[Category:Map]]` |
| Vault | `[[Category:Map]]` |
| Market Room | `[[Category:Map]]` |
| Medical Block | `[[Category:Map]]` |
| Boss | `[[Category:Bosses]]` |
| Bosses | `[[Category:Bosses]]` |
| Main Page | `[[Category:Ghosts of Tabor Wiki]]` |
| About | `[[Category:Ghosts of Tabor Wiki]]` |

### Category Coverage (Selected)
Items:256, Junk:55, Skins:39, Weapons:79, Quests:145, Magazines:76, Ammunition:54,
Armor:15, Helmets:28, SMG:20, Rifle:27, Sidearm:14, Melee:11, Throwables:14,
Grenades:9, Keycards:10, Suppressor:9, Grips:7, Map:11, Game_Mechanics:11,
Traders:9, Guides:1, Firearms:3, Knives:3, Sniper:2, Secure_Containers:3

### Duplicate Pages Needing Merge
- M1A SASS (1717B) / M1ASASS (52B) / M1SASS (51B)
- AS VAL (1247B) / ASVAL (79B)
- Barrett (109B) / Barret (89B)
- Dragunov (1215B) / Dragnov (62B)
- Honey Badger (887B) / AAC Honey Badger (918B)
- Krtek (3688B) / Kertek (39B) / Ketec (39B)
- VSS (989B) / Vss (27B)
- Bosses (125B) / Boss (125B) — identical content

### Outdated Content
- Personal Bunker: EXPLICITLY MARKED OUTDATED (references 0.12.0)
- Equipment: Old patch references, no 0.13.0
- Ballistics: Tagged Outdated — needs complete rewrite
- Blue Keycard, White Keycard, Time to Kill: Tagged outdated

### Technical Issues
- Broken file links: 16 pages (Attachments, Ballistics, etc.)
- Script errors: 25 pages
- Syntax highlighting errors: 3 pages

## Wipe 9 / 0.13.0 Gaps
- Balaclava, Ski masks: no pages exist
- 94 weapon pages: all uncategorized
- Foxtrot armor rebalance: AI page needs update
- Market pricing rebalance: Prices page needs update
- CrawlerTV's Liquid Death, Sui Dabz Blow Torch: removed from game

## Full Enumeration Technique (Validated)
```
Call 1: list=allpages&aplimit=500&apnamespace=0
→ 500 pages, continue.apfrom = "Medical Block"
Call 2: list=allpages&aplimit=500&apnamespace=0&apfrom=Medical+Block
→ 394 pages, batchcomplete → done (894 total)
Then: action=query&titles=BATCH&prop=categories in batches of 50
```

**Key finding**: The continuation parameter from `list=allpages` is `apfrom` (a title string), NOT `apcontinue`. Use `apfrom` in subsequent calls.
