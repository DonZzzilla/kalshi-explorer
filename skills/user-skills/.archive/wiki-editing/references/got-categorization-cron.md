# Cron Job: Ghosts of Tabor Wiki Batch Categorization

## Purpose
Automated recurring cron job to categorize uncategorized pages on the Ghosts of Tabor Wiki (got.miraheze.org).

## Wiki Stats (as of May 2026)
- Total namespace-0 pages: ~882
- Initially uncategorized: 749
- After May 2026 run: ~147 remaining
- Account: ZeroSkills (admin)

## Cron Pattern
- **Frequency**: Periodically (every 30 min or on schedule)
- **Pages per run**: 15-20 (to avoid browser timeout)
- **Tracking**: Re-scan all pages each run, pick next uncategorized batch

## Authentication
```
Login: ZeroSkills
Password: ForkedT2000 (or via BotPasswords)
```

## API Flow Per Run
1. Navigate to wiki main page
2. Check login: `action=query&meta=userinfo&format=json`
3. If not logged in: get login token → POST login → verify
4. Get CSRF token: `action=query&meta=tokens&type=csrf&format=json`
5. Get all pages: `action=query&list=allpages&aplimit=500&apnamespace=0` (paginate)
6. Check categories in batches of 50: `action=query&titles=...|...&prop=categories`
7. Collect titles with no categories
8. For each uncategorize page: categorize by title rules → POST edit with `appendtext`

## Full Categorization Rules
See `miraheze-batch-categorization.md` section "Categorization Rule Priority" for the full ordered rule list.

## Key Rules Summary
| Pattern | Categories |
|---------|-----------|
| Magazine/Mag/Drum | Magazines, Ammunition |
| Ammo | Ammunition |
| Grenade/Frag | Grenades |
| Smoke/Flashbang/Flare/Landmine/Bomb | Throwables |
| Knife | Knives |
| Tomahawk/Saber/Sabre | Melee |
| Keycard/ends with "Card" | Keycards |
| Bandage/Painkiller/Epinephrine/Inhaler/Promedol/Canteen/Rations/Medical/Medicine | Consumables |
| Junk | Junk |
| Gold/Silver/Money/Poker/Token/Koruna/Bar/Stack | Currency |
| Quest/Mission/"The "/"A " | Quests |
| Boss/Krtek/Collector/Nikolai/Tatra/Mamba | Bosses |
| Fenix/Zero Foxtrot/Elite/Cultist | Enemies |
| Scope/Sight/Optic/ACOG/Holographic/Red Dot | Sights |
| Suppressor/Muzzle/Brake/Compensator | Suppressor |
| Grip/Foregrip | Grips |
| Rail/Laser/Light | Attachments |
| NVG/GPNVG/PVS/Goggles/Night Vision | Night Vision |
| Helmet/Hat/Mask/Shield | Helmets |
| Vest/Armor | Armor |
| Backpack/Sling/Ragnar | Backpacks |
| Container/Alpha+Secure/Delta+Secure/Omega+Secure | Secure Containers |
| Case/Crate/Box/Pouch/Safe/Locker | Containers |
| Map/Island/Silo/Mall/Matka/Underground | Map |
| Streamer | Streamer items |
| Trader/Trade/Market | Traders |
| Wipe/Never Wipe | Wipe |
| DLC | DLC |
| Training/Level/Stamina/Hunger/Thirst | Game Mechanics |
| Ballistics/backup | Outdated |
| Fix/Error/Tech Support/How to/BattlEye/SteamVR/PCVR | Tech Support |
| Blog | Blog posts |
| disambiguation/Disambiguation | Disambiguations |
| (default) | Items |

## Known Issues
- CSRF token `+\\` means anonymous — must login first
- Large batches (40+) trigger "Failed to fetch" rate limits
- Session can be lost mid-run — always re-verify login before editing
- The `\\n` in JS strings produces literal `\n` in page text but categories still register
