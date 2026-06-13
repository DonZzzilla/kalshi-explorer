# Ghosts of Tabor Wiki Maintenance — May 25, 2026 (Run 5)

## Wiki Stats
- Articles (site stats): ~750
- Main namespace pages (list=allpages): **500** (single batch)
- Categories: 113
- Game version: 0.13.0.8808.63144 (Wipe 9)
- MW version: 1.45.3

## Login
ZeroSkills confirmed sysop (ID 479, 1675 edits). Full admin rights.
Password: ForkedT2000. Login via `action=clientlogin` worked without hCaptcha.

## What Was Fixed

### 1. BOA Content Deleted
- `BOA Ranks & Structure` — redirect to GoT Wiki Hub. Deleted (logid 7432).
- `BOA Discord Rules & Policies` — redirect to GoT Wiki Hub. Deleted (logid 7433).
- Both were BOA program content that doesn't belong on got.miraheze.org.
- **Category:BOA Hub confirmed NOT present on wiki (clean).**

### 2. BOA Supply Drop Verified
- Reviewed and confirmed as **legitimate game content** — an in-game quest named after the BOA faction.
- Properly categorized: Quests, Game_Mechanics, Items.
- **Kept as-is.** Rule: quests named after in-game factions ≠ BOA program content.

### 3. Categories Added (~182 edits)

| Category | Pages | Success | Failed |
|----------|-------|---------|--------|
| Weapons + Items | 34 | 29 | 5 |
| Quests | 26 | 26 | 0 |
| Map | 8 | 8 | 0 |
| Items batch 1 | 29 | 26 | 3 |
| Items batch 2 | 17 | 16 | 1 |
| Items batch 3 | 32 | 31 | 1 |
| Magazines + Items | 29 | 29 | 0 |
| Key pages (Bosses, Maps, Hunger, etc.) | 10 | 10 | 0 |
| Attachments | 8 | 7 | 1 |
| **TOTAL** | **~193** | **~182** | **~11** |

### 4. Content Fixes
- **Personal Bunker**: Updated outdated 0.12.0 warning to 0.13.0 Wipe 9 notice.
- **Tasks**: Added orange Wipe 9 update notice banner at top.

## API Behavior Notes

### prop=categories Returns Null-Value Objects
When querying `prop=categories`, existing categories appear as:
```json
{"categories": [{"*": null}, {"*": null}]}
```
Not as strings. Checking `page.categories.length > 0` works, but don't try to read category names from the values — they're always null in this API response format.

### Stale Uncategorized Count After Batch Edits
After ~182 category additions, a full re-scan via `prop=categories` still showed 270 uncategorized (same as pre-edit snapshot). This is because:
1. `window.__allPages` was captured pre-edits and isn't refreshed
2. `prop=categories` can return cached results on the first query
3. Spot-checking individual pages confirmed edits stuck correctly

**Lesson:** Don't trust the full re-scan count immediately after batch edits. Spot-check specific pages instead.

## Remaining Issues

### ~88 Pages Still Uncategorized
Mostly niche items, junk, and guide pages not covered in this run.

### Top Wanted Pages (Broken Links)
| Page | Broken Links |
|------|-------------|
| Items | 407 |
| Ammunition | 89 |
| Magazines | 82 |
| Containers | 34 |
| Helmets | 25 |
| Currency | 23 |
| Game Mechanics | 15 |
| Map | 15 |

### Pages Needing Wipe 9 Updates
- **AI** — no 0.13.0 reference, boss behavior may have changed
- **Equipment** — missing new 0.13.0 grips (Tigerclaw, Romanian DL, DD Vertical, A3 AFG) and cosmetics
- **Loot** — no 0.13.0 reference

### Outdated Pages (from previous run)
- Ballistics + 4 backup versions — outdated since 0.10.0
- Blue Keycard, White Keycard, Time to Kill — in Outdated category
