# Reference: CSEZ Wiki Ammo Data Sync (May 2026)

## Context
Aboleth (bureaucrat/sysop) updated the main Ammo page on the Contractors Showdown ExfilZone Wiki with new ballistics data on May 3-4 2026. The individual caliber pages still have old data that needs syncing.

- Wiki: https://csez.miraheze.org
- Master page: `Ammo` (https://csez.miraheze.org/wiki/Ammo)
- Child pages: `.45 acp`, `12GA`, `5.45x39mm`, `5.56x45mm`, `6.8x51mm`, `7.62x39mm`, `7.62x51mm`, `7.62x54R`, `9x19mm`

## Permission Issue Discovered
The `ZeroSkills` account (created May 24 2026) only has groups `["*", "user"]`. Editing requires `confirmed` group membership. Aboleth has `["bureaucrat", "confirmed", "interface-admin", "rollbacker", "sysop", ...]`. A bureaucrat must confirm ZeroSkills before it can edit.

## Pen Value Color Scheme
| Pen Range | Color | Hex |
|-----------|-------|-----|
| < 1.0 | Very dark gray | #2e2e2e |
| 1.0 - 1.9 | Dark green | #304d3e |
| 2.0 - 2.9 | Blue | #194762 |
| 3.0 - 3.9 | Purple | #51325c |
| 4.0 - 4.9 | Dark red | #621b1b |
| 5.0 - 5.9 | Orange/brown | #622e02 |
| >= 6.0 | Very dark red | #3e0300 |

## Data Mismatches Found (all values: old → correct)

### 9x19mm (row background #545f5f)
- PSO: Pen 0.9→1.0 (#2e2e2e→#304d3e), Bleed 0.25→0.125
- FMJ: Pen 1.6→1.4, Bleed 0.15→0.075
- Pst: Pen 2.2→2.1, DMG 55→54, Bleed 0.15→0.075
- AP: Pen 3.7→3.4, Bleed 0.15→0.075

### .45 acp (row background #385c79)
- FMJ: Bleed 0.22→0.11
- L-Match: Bleed 0.22→0.11
- AP: Bleed 0.22→0.11

### 12GA (row background #903e90)
- Super HP: Pen 1.1→0.5 (#304d3e→#2e2e2e), DMG 165→220, Vel 410→594, Bleed 0.55→0.11
- 7mmBuckShot: DMG 30→140, Bleed 0.22→0.28
- Flechette: Pen 3.5→3.3, DMG 18→154, Vel 330→320, Bleed 0.22→0.28
- AP20: DMG 120→145, Bleed 0.40→0.20

### 5.45x39mm (row background #556743)
- PRS: Bleed 0.30→0.15
- FMJ: DMG 55→61, Bleed 0.19→0.095
- PP: Pen 3.6→3.5, DMG 53→55, Bleed 0.19→0.095
- 7N40: Pen 4.5→4.3, DMG 51→53, Bleed 0.19→0.095
- BS: Pen 5.6→5.5, DMG 45→46, Vel 910→830, Bleed 0.19→0.095

### 5.56x45mm (row background #2e5c30)
- MK255: Bleed 0.30→0.15
- FMJ: DMG 58→62, Bleed 0.20→0.10
- MK318: Pen 3.6→3.3, DMG 52→56, Bleed 0.20→0.10
- M995: Pen 4.6→5.3 (#621b1b→#622e02), DMG 47→46, Vel 980→1010, Bleed 0.20→0.10
- AP: Bleed 0.20→0.10

### 7.62x39mm (row background #824b39)
- SP: Vel 750→770, Bleed 0.34→0.17
- FMJ: DMG 62→67, Bleed 0.25→0.125
- PS: Pen 3.3→3.7, DMG 64→62, Bleed 0.25→0.125
- BP: Pen 4.6→4.7, Bleed 0.25→0.125
- AP: Bleed 0.25→0.125

### 7.62x51mm (row background #782c11)
- SP: Pen 2.7→2.5, DMG 89→86, Bleed 0.37→0.15
- FMJ: DMG 82→83, Bleed 0.25→0.125
- M80: Pen 4.4→4.3, DMG 79→82, Bleed 0.25→0.125
- M61: Pen 5.3→6.0 (#622e02→#3e0300), DMG 72→69, Bleed 0.25→0.125
- M993: Pen 6.8→6.5, DMG 69→63, Bleed 0.25→0.125

### 6.8x51mm (row background #96632c)
- FMJ: Pen 3.4→3.7, Bleed 0.23→0.115
- Hybrid: Pen 4.8→4.7, Bleed 0.23→0.115

### 7.62x54R (row background #421b00)
- HP: DMG 105→102, Bleed 0.39→0.195
- FMJ: Pen 3.2→3.4, Bleed 0.27→0.125
- LPS: Pen 3.9→4.3, Bleed 0.27→0.125
- PS: Pen 4.7→4.6, DMG 81→78, Bleed 0.27→0.125
- SNB: Pen 6.2→6.1, DMG 72→75, Bleed 0.27→0.125

## Notes
- The 9x19mm page uses decimal bleed values (0.25 = 25%) in source wikitext
- The caliber pages have additional columns not on the main page (Range, Max Range, Min DMG Multiplier, Min DMG, Blunt Multiplier, Durability scalars, Durability loss)
- Only the shared fields (DMG, Pen, Velocity, Bleed) need to match; caliber-specific columns are independent
- **All 9 caliber pages were successfully edited** via browser console API (May 24, 2026). The key technique was: (1) programmatic login via `action=login` POST, (2) per-page edit batches to avoid browser JS execution limits, (3) relative URLs (`/w/api.php`) for all API calls.
- The `ZeroSkills` account (groups `["*", "user"]`) was able to edit despite not being in the `confirmed` group — email confirmation may have been sufficient for this wiki's permissions.
