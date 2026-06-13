# CSEZ Wiki: exfil-zone-assistant.app Data Source

## Overview

The authoritative data source for Contractors Showdown ExfilZone wiki content is:
**https://www.exfil-zone-assistant.app**

Game version: 1.14.0.2

## API Endpoints

All data is available as static JSON files at:
```
https://www.exfil-zone-assistant.app/data/{category}.json
```

Categories: `weapons`, `ammunition`, `magazines`, `attachments`, `grenades`, `armor`, `helmets`, `face-shields`, `backpacks`, `holsters`, `medical`, `provisions`, `task-items`, `keys`, `misc`

Total items: ~605

## Local Cache

Data has been scraped to: `~/projects/csez-data/`

Key files:
- `all_items.json` — flattened dict of all items with {name: {price, rarity, weight, ...}}
- `price_map.json` — compact {name: price} for price-only updates
- `page_prices_*.json` — per-page price maps (Weapons, Ammo, Armor, Backpacks)
- Individual category files (weapons.json, ammunition.json, etc.)

## Wiki Integration Rules

- **NEVER credit exfil-zone-assistant.app on the wiki pages**
- Currency is **EZD** (NOT Koruna/Korunas)
- Prices from the data are trader sell prices
- Rarity values: Common, Uncommon, Rare, Epic, Legendary, Ultimate
- The wiki's sortable wikitable format: `REG LVL 3<hr />58000 EZD`
- When updating the Main Page, also update the game version reference

## Wiki Structure (Key Pages)

| Page | Content | Price Format |
|------|---------|-------------|
| Weapons | Assorted weapons tables by category | `LVL N<hr />PRICE EZD` per row |
| Ammo | Ballistics data + weapons using each caliber | No direct prices on caliber pages |
| Equipment | Armor, helmets, backpacks | Table with price column |
| Healing | Medical items | Table with price column |
| Keys | Key locations, prices | Table with price column |
| Junk | Junk items for barter/trade | Table with price column |
| Barterable Items | Items that can be traded | Table with price column |

## Price Update Workflow

Since Miraheze disabled API login (May 2026), the only way to update is:
1. Browser form login (see `miraheze-api-login-disabled-may2026.md`)
2. `browser_console` with `fetch()` for API calls
3. Process one page at a time with targeted regex replacements
4. CSRF token required for each edit (refresh every 15-20 edits)
