# Silent North Wiki Maintenance — May 27, 2026 Audit

## Audit Result: READ-ONLY (login blocked — hCaptcha/no credentials in cron)

## Full Page Inventory (67 pages, 0 redirects detected)
All pages verified to exist with content. No redirect pages found.

### Uncategorized Pages (NEED CATEGORIES)
| Page | Size | Categories Needed |
|------|------|-------------------|
| `Swiss Alps` | 3,741 chars | `[[Category:Locations]]`, `[[Category:Environment]]` |
| `Tech Support` | 1,981 chars | `[[Category:Tech Support]]`, `[[Category:Guides]]` |
| `Blog:Recent posts` | 137 chars | DELETE (broken `<bloglist>` template tag, non-functional) |

### Duplicate Pairs (NEED MERGE)
| Canonical | Keep Size | Duplicate | Redirect Size | Notes |
|-----------|-----------|-----------|---------------|-------|
| `Weapons` | 5,495 chars | `Weapons List` | 1,860 chars | Weapons List is strict subset — Weapons has all the same tables + more |
| `Foods` | 3,596 chars | `Food` | 2,571 chars | Foods is more comprehensive; has tips Food lacks |

### Main Page Issues
- Gallery references 13 non-existent `File:` icons → `Category:Pages with broken file links`
- Contains `[[Category:Silent North Wiki]]` on main page (unusual)
- Helpful Resources section links to Fandom (`w:c:community:Help:...`) — wrong wiki
- Nav grid missing good pages: Consumables, Combat, Crafting, Weather, Hunting, Fishing, Cooking

### Pages with Only 2 Categories (could add 1 more)
Discord, Gameplay, Gear, Getting Started, Plains, Player Interaction, Quests, Silent North Wiki

## Game Version
Current: 0.2.4.745.41503

## Auth Status
ZeroSkills account confirmed as sysop, but login requires hCaptcha. Cannot make edits from cron job without credentials.
