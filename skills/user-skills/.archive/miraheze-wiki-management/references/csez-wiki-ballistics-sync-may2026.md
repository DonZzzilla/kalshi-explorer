# CSEZ Wiki Ammo & Armor Ballistics Sync — May 2026

**Wiki**: Contractors Showdown ExfilZone Wiki (https://csez.miraheze.org)
**Game version**: v1.6.5.0
**Data source**: aboleth (datamined)
**Source files**: Google Drive folder https://drive.google.com/drive/folders/1Gj1o7t2vrleuz8XHfw2Thh073IuJUuuz

---

## Files

| File | Size | Content |
|------|------|---------|
| `04-07-2026_ballistics.csv` | 5 KB | Ammo ballistics (78 ammo types) |
| `12-29-2025_Armor_ballistics.csv` | 4 KB | Armor ballistics (67 armor pieces) |

---

## Ammo Data

**CSV columns**: Name, Pen, Dmg, Blunt, PenArm, BluntArm, Optimal, Bleed, m/s

**Calibers covered**: 9x19mm, .45 ACP, 12GA, 5.45x39mm, 5.56x45mm, 6.8x51mm, 7.62x39mm, 7.62x51mm, 7.62x54R, 9x39mm

**Key detail**: 12GA values are **per-shell** (not per-pellet). This is a change from the old wiki table which showed per-pellet values.

**Page updated**: https://csez.miraheze.org/wiki/Ammo
- New "Ammo Ballistics Data (Per-Shell)" table with 10 columns
- Sortable, grouped by caliber
- Old "Outdated Ammo Chart" section preserved below

---

## Armor Data

**CSV columns**: Name, Prot Lvl, Blunt Dmg, Pen Dmg, Wgt, Loc, Dura Base, Dura Effective, Dura AUC, Dura Weighted, Dura Fragil

**Groups**: 31 body armors (chest), 7 face shields, 28 helmets

**Page created**: https://csez.miraheze.org/wiki/Armor (new page, was missing)
- 3 sortable tables by location
- Notes section explaining all stat columns
- Categories: Items, Equipment

---

## How to Download from Google Drive

Download URL: `https://drive.google.com/uc?export=download&id=FILE_ID`

File IDs found via `document.querySelectorAll('[data-id]')` in the Drive folder page, or extracted from the page HTML.

---

## Styling Notes

- `{| class="wikitable sortable"` for all data tables
- Group under `== Section ==` headers
- Notes section after tables explaining column meanings
- `[[Category:Items]]` and sub-categories at bottom
- Credit data sources in intro: `Data datamined by aboleth.`

---

## Wiki Article Count

71 → 72 (Armor page created)