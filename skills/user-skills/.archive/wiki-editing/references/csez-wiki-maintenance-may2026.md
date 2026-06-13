# CSEZ Wiki Maintenance — May 2026

**Wiki**: Contractors Showdown ExfilZone Wiki (https://csez.miraheze.org)
**Game version**: v1.6.5.0
**Account**: ZeroSkills (sysop)

---

## May 25, 2026 Session

| Page | Change |
|------|--------|
| Ammo | Updated table header from v1.6.3.1 to v1.6.5.0 |
| Suburbs | Removed duplicate `[[Category:Locations]]`/`[[Category:Pages including data maps]]` tags; added quest cross-links and boss section (Iron Wolf) |
| Equipment | Removed outdated user comment; completed NVG table (added AN/PVS-31 entry) |
| Weapons | Fixed RC416 (added REG LVL 4, 85000 EZD, corrected weight/recoil/ergo/RPM) |
| Smuggling Tunnel | Fixed placeholder extraction descriptions; added Quests and Bosses sections with cross-links |
| Dam | Added quest links (Battle Of The Dam, Recon II, On The Trail) and boss section |
| Metro | Added quest links (Undercurrents, Ruler In the Depths, Entangled Paths I) and boss section |
| Resort | Added quest reference and boss section |

---

## May 27, 2026 Session

### New Pages Created

| Page | Description |
|------|-------------|
| **Bonecrusher** | Full boss page for Tier 6 armored boss in Resort Bank Tunnels — strategy (bring grenades, tight tunnels), loot table, location |
| **Butcher** | Full boss page for unarmored fanatic at Resort Workers' Dorms — strategy (no armor but surrounded by goons), loot, location |
| **Extraction** | Core gameplay page — how extraction works per map, extraction rules, death/insurance mechanics, tips |
| **PvE** | Season 5 game mode page — AI enemies, revamped AI, full loot, quest progress, maps available |

### Pages Expanded/Replaced

| Page | Change |
|------|--------|
| **Resort Boss** | Replaced 139-byte stub with full Barricade boss page — corrupt SWAT officer, Tier 6 SWAT armor, no face protection weakness |
| **Resort** | Fixed incorrect boss info (was: 1 boss at Hospital → now: 3 bosses at Bank/Tunnels/Dorms), added strategy section, extraction info, cross-links to all 3 boss pages |
| **Traders** | Replaced empty template-only page (36 bytes) with full overview of all 5 traders, trading mechanics (Trust Points, EZD), quest types |
| **Consumables** | Added descriptions for food/energy, drinks/hydration, medicine/booster mechanics |
| **Resources** | Removed placeholder Google link, cleaned up formatting |

### Category Fixes

| Page | Fix |
|------|-----|
| Hideout | `[[Category:Maps]]` → `[[Category:Gameplay]]` (was incorrectly categorized as a map) |

### Key Learnings

#### Session Expiry Mid-Batch
The first edit attempt returned `permissiondenied` — the session had expired since the last login. Re-ran the login flow via `browser_console` fetch and continued. **Always verify login before starting edits.**

#### Resort Map — Wrong Boss Info
The Resort page incorrectly stated there was 1 boss at the Hospital. The Bosses page correctly listed 3 bosses (Barricade at Bank, Bonecrusher at Bank Tunnels, Butcher at Workers' Dorms). **Always cross-reference the Bosses overview page when editing map boss sections.**

#### Page Count Growth
Wiki grew from 37 to ~97 articles (API `allpages` count includes all namespaces; main namespace articles grew from 37 to approximately 42).

---

## Key Learnings (Both Sessions Combined)

### execute_code urllib DOES NOT work for Miraheze
Even with correct CSRF token and sysop account, `urllib.request` in `execute_code` gets `permissiondenied`. The Python process has no browser cookies. **Always use `browser_console` `fetch()`**.

### Token handling
CSRF tokens contain `+\\` — use `URLSearchParams.append('token', token)` rather than manual `encodeURIComponent` to avoid double-encoding.

### Content audit patterns
- Search `action=query&list=search&srsearch=1.6.3` to find stale version references
- Check `Template:Version` for current version
- `{{NUMBEROFARTICLES}}` auto-updates (don't hardcode)
- Look for `???`, `##`, empty cells, "Placeholder" text as signs of incomplete data
- Duplicate `[[Category:X]]` tags accumulate after repeated edits — scan and deduplicate

### Cross-linking pattern for map pages
For map pages, standard sections to add:
```
== Quests ==
{{Main|Quests}}
* [[Task:Quest Name|Quest Name]] - Description

== Bosses ==
* [[Boss Name]] - Spawn location description
```

### Category verification
Use `prop=categories` to check categories on a page. Note: Miraheze's `prop=categories` can be stale — for critical checks, fetch raw wikitext and regex-search for `[[Category:` patterns.

### Substantive stub expansion before creating new pages
Before creating a new page, check if a stub already exists that could be expanded instead. In this session, the "Resort Boss" stub (139 bytes) was replaced with a full boss page, and "Traders" (36 bytes, template-only) was expanded to a full overview. This avoids fragmentation.
