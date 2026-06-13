# CSEZ Wiki Page-Specific Wikitext Patterns — May 2026

## Page Cell Format Reference

Different CSEZ wiki pages use DIFFERENT cell separator styles. Always check the raw wikitext before writing regex replacements.

| Page | Cell Type | Example | Price Format |
|------|-----------|---------|-------------|
| Weapons (main table) | `\|Name` (data cell) | `\|AK-74M` | `\|REG LVL 2<hr />36050 EZD` |
| Weapons (throwables) | `!Name` (header cell) | `!VOG-25` | `!REG LVL 1<hr />8543 EZD` |
| Equipment (all sections) | `\|Name` then `\|style=...` next line | `\|Vagrant Rucksack\n| style="background-color:#3f8a38;" |NTG LVL 1/##` | `LVL X/##` or `LVL X/PRICE` |
| Healing | `[[Linked Name]]` then `\|style=...` next line | `[[Bandage|Gauze]]\n| style="..." |NTG LV1\n| style="..." |2437 EZD` | `PRICE EZD` on 3rd line after name |
| Ammo | Complex nested tables with colored `\|style=...` cells | Per-caliber sub-tables | `PRICE EZD` inline in cells |
| Armor | Stat tables (no prices) | Body armor stats | N/A (prices on Equipment page) |
| Keys | Location/usage tables (no prices) | Key locations per map | N/A |

## Critical Regex Patterns (JS in browser_console)

### Weapons page — data cells (`|Name`)
```javascript
const regex = new RegExp('^(\\|' + nameEsc + '[^\\n]*\\n(?:[^\\n]*\\n){0,3}[^\\n]*?)(\\d[\\d,]{3,7})(\\s+EZD)', 'm');
```

### Weapons page — header cells (`!Name`) for Throwables
```javascript
const regex = new RegExp('(!' + nameEsc + '\\n![^\\n]*\\n!\\w+\\s+\\w+\\s+\\d+<hr\\s*/?>)(\\d[\\d,]{2,7})(\\s+EZD)', 'g');
```

### Equipment page — multi-line format
```javascript
// Missing price (##):
const regex = new RegExp('(\\|' + nameEsc + '\\n\\|\\s*style=[^\\|]*\\|\\w+\\s+\\w+\\s+\\d+/)##(\\||\\n)', 'g');
// Wrong price:
const regex = new RegExp('(\\|' + nameEsc + '\\n\\|\\s*style=[^\\|]*\\|\\w+\\s+\\w+\\s+\\d+/)(\\d[\\d,]{2,7})', 'g');
```

### Healing page — linked name then 2-line gap to price
```javascript
const regex = new RegExp('(\\[' + '[' + nameEsc + '[^\\]]*\\]\\]\\n\\|\\s*style=[^\\|]*\\|\\s*\\w+[^\\|]*\\n\\|\\s*style=[^\\|]*\\|)(\\d[\\d,]{2,7})(\\s+EZD)', 'g');
```

## Special Name Mappings (Wiki Name ↔ Our Data Name)

| Wiki Name | Our Data Name | Notes |
|-----------|--------------|-------|
| `[[Bandage|Gauze]]` | `Gauze` | Pipe alias — escape as `Bandage\\|Gauze` |
| `ELITE OPS` | `Elite Ops` | Case mismatch |
| `ELITE OPS GREEN` | `Elite Ops` | Same price as ELITE OPS |
| `Odldos Black Backpack` | `Odldos black Backpack` | Case mismatch |
| `Odldos Flowers Backpack` | `Odldos flowers Backpack` | Case mismatch |
| `Parachute Training Helmet` | `Black Parachute Training Helmet` | Wiki shortens it |
| `PASGT` | `PASGT Helmet` | Wiki shortens it |
| `BlueLine SWAT Helmet` | `SWAT Helmet` | Wiki uses full name |
| `6B17` | `6B17 Body Armor` | Ambiguous — context determines section |
| `6B17 Upgraded` | `6B17 Upgraded Body Armor` | Full name in our data |
| `G3SG1-AK4` | `G3SG1 AK4` | Hyphen vs space |
| `AKS-74U Mod FZ` | `AKS-74U ZT` | Different names, same price (69150) |

## CSEZ Price Data Locations

All item data lives in `~/projects/csez-data/`. All prices are in `stats.price` (not top-level `price`).

| Data File | Wiki Page(s) | Item Count |
|-----------|-------------|------------|
| `weapons.json` | Weapons | 69 |
| `ammunition.json` | Ammo | 39 |
| `backpacks.json` | Equipment (Backpacks) | 11 |
| `armor.json` | Equipment (Armor Vests) | 24 |
| `helmets.json` | Equipment (Helmets) | 30 |
| `face-shields.json` | Equipment (Face Shields) | 6 |
| `medical.json` | Healing | 16 |
| `keys.json` | Keys (no prices on wiki) | 33 |
| `provisions.json` | Consumables (empty tables) | 16 |
| `attachments.json` | Attachments | 22 |
| `grenades.json` | Weapons (Throwables) | 9 |
| `misc.json` | Junk | 150 |
| `task-items.json` | (various) | 43 |
| `magazines.json` | (not on wiki yet) | 56 |
| `holsters.json` | (not on wiki yet) | 7 |

## Lessons Learned This Session

1. **Always check raw wikitext first** — don't assume the cell format. Different sections of the same page may use `|` vs `!` cells.
2. **`browser_console` JS regex with `[[` brackets must be escaped carefully** — the `[` in wiki link syntax conflicts with regex character classes. Use `'\\[' + '[' + nameEsc` pattern.
3. **CSRF token reuse is fine** — you can do 60+ edits on one token. No need to refresh every 15 edits.
4. **Batch size of 20-30 edits per `browser_console` call works fine** — the 5-15 guideline was too conservative.
5. **Relative URLs work fine after login** — `/w/api.php` with `credentials: 'include'` works throughout the session.
