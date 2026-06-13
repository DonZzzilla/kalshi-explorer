# Ghosts of Tabor Wiki Maintenance Audit — May 25, 2026 (Anonymous Read-Only)

## Wiki Stats (as of 2026-05-25 ~09:00 UTC)
- URL: https://got.miraheze.org
- Articles: ~750 (banner count) | Main namespace: 893 (API count)
- Total categories: 107
- Game version: 0.13.0.8808.63144 (Wipe 9)

## Login Status
- **ANONYMOUS** — IP: 172.249.29.115, User ID: 0, Edit count: 0
- Groups: `*` (anonymous), Rights: `read` only — NO edit permissions
- **NO EDITS CAN BE MADE** without obtaining edit rights on got.miraheze.org

## Category Coverage — CRITICAL

| Metric | Count | % |
|--------|-------|---|
| Main namespace pages | 893 | 100% |
| Pages missing ALL categories | **804** | **90%** |
| Pages with >=1 category | 89 | 10% |

## Batch Category Audit Technique (This Session)

The reliable approach for auditing categories across 800+ pages uses `titles=` POST batches of 50:

```javascript
// Step 1: Get page titles (paginated, 500 per batch)
// Batch 1
POST action=query&list=allpages&aplimit=500&apnamespace=0&format=json
// Store: window.__pages = d.query.allpages

// Batch 2 (use apcontinue from previous)
POST action=query&list=allpages&aplimit=500&apnamespace=0&apcontinue=LAST_TITLE&format=json
// Store: window.__pages2 = d.query.allpages

// Step 2: Check categories in batches of 50 via POST
POST action=query&titles=Page1%7CPage2%7C...%7CPage50&prop=categories&format=json
// Count pages where !p.categories
```

**Why not `generator=allpages`?** The `gapcontinue` pagination gets stuck repeating the same pages after 2-3 batches. The `titles=` batch approach is more reliable for full wiki scans.

**Key lesson:** Store page lists in `window.__pages`, `window.__pages2` etc. for reuse across console evaluations (use unique names to avoid `SyntaxError: Identifier already declared`).

## Key Pages Missing Categories

### Major Game Pages
- Tasks (~54KB) — needs `[[Category:Quests]]`, `[[Category:Game Mechanics]]`
- Ammo — needs `[[Category:Items]]`, `[[Category:Ammunition]]`
- Bosses — needs `[[Category:Enemies]]`, `[[Category:Game Mechanics]]`
- Hunger — needs `[[Category:Game Mechanics]]`
- Maps — needs `[[Category:Maps]]`
- Main Page — needs `[[Category:Ghosts of Tabor Wiki]]`
- GoT Wiki Hub, Ghost of Tabor Game Info — need `[[Category:Community]]`
- BOA Discord Rules & Policies, BOA Ranks & Structure — need `[[Category:BOA Hub]]`, `[[Category:Community]]`
- Merchant Of Death — needs `[[Category:Traders]]`

### Wrong Categories
- Health — only has `[[Category:Items]]`, should be `[[Category:Game Mechanics]]`
- Guns — only has `[[Category:Items]]`, should also have `[[Category:Weapons]]`
- Fenix — only has template tracking categories

### Scale by Type
- Weapon pages: 41/44 missing categories (93%)
- Magazine pages: ~40/40 missing categories (100%)
- Quest pages: 26/33 missing categories (79%)
- Map sub-pages: ~10/16 missing categories (63%)

## Pages WITH Categories
Quests, Weapons, Equipment, Loot, Personal Bunker, AI, Attachments, Factions, Locations, Keys and Keycards, Chodov Mall, Missile Silo, Matka Miest, Island of Tabor, all Trader pages, Armor, Bandage, Sights, Consumables, Junk, Guns

## Outdated Pages (Category:Outdated)
Ballistics (43KB, pre-0.10.0), 4 Ballistics backups, Blue Keycard, Time to Kill, White Keycard

## Pages with Broken File Links (16 pages)
Attachments, Ballistics + 4 backups, Character Customization, Item Spawns, Progression, Standard Shield Small, SteamVR Jump Binding Fix, 4 user sandboxes

## Wanted Pages (Top Missing)
Items (407 links), Ammunition (89), Magazines (82), Containers (34), Helmets (25), Currency (23), Game Mechanics (15), Map (15), Throwables (11), Static spawns (9), Enemies (8), Keycards (8)

## Content Issues for Wipe 9
- AI page: "Neck snapping removed July 30th 2025 wipe" — Wipe 8 reference
- Ballistics: severely outdated (pre-0.10.0)
- Personal Bunker: still has 0.12.0 outdated warning
- Loot: references removed items (Liquid Death, Sui Dabz)
- Quests: references removed items

## Discord Intel
- Could not access — Discord requires login in automated context
