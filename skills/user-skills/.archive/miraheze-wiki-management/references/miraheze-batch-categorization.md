# Large-Scale Wiki Batch Categorization

## Problem
A wiki has 700+ pages with no categories. Need to systematically categorize all of them using the browser console API.

## Key Lessons (from GoT wiki, May 2026)

### Throughput
- **15 edits per browser_console call** is the reliable maximum with 500ms delays between edits
- Batches of ~48+ in a single async loop trigger "Failed to fetch" rate limiting — keep batches to 15-20 max
- Use `browser_console` with `async () => { ... }()` pattern for clean batch processing
- Processing 750 pages at 15 per batch = ~50 batches

### Token Management
- CSRF tokens expire unpredictably during long sessions
- **Get a fresh token every session** — the `+\\` token is the anonymous user token, not a valid edit token
- A valid CSRF token only appears after login (e.g., `f6deea7b441e7536aa5574354fe9cdc06a13de56+\`)
- When an edit fails with "Invalid CSRF token", re-login and get a fresh token
- Login session can be lost between browser navigations — always re-verify with `meta=userinfo`

### URL Encoding & API Calls
- Use **full URLs** (`https://got.miraheze.org/w/api.php`) with `credentials: 'include'` — relative URLs can fail with "Failed to parse URL"
- Use **POST with `URLSearchParams`** for queries with pipe `|` characters in `titles=` parameter
- The ALLPAGES API pagination uses `apcontinue` — encode it with `encodeURIComponent`
- `encodeURIComponent` the `titles=` parameter value, not just individual titles

### Newline in appendtext
- In JavaScript string literals, `'\\n[[Category:XXX]]'` produces literal `\n` (backslash-n) in the appended text
- MediaWiki **still parses the category tags correctly** despite the literal `\n` — the categories are registered
- The page content will show `\n[[Category:XXX]]` as text, but the category is properly assigned
- For actual newlines, use String.fromCharCode(10) in JS: `'[[Category:XXX]]' + String.fromCharCode(10) + '[[Category:YYY]]'`

### Common Pitfalls
1. **Rate limiting** — Batches of ~48+ fetch calls in a single browser_console evaluation trigger "Failed to fetch" errors. Keep batches to 15-20 with 500ms delays.
2. **Session loss** — The browser session can be lost during long batch operations. If fetch starts failing, re-navigate to the wiki and re-login.
3. **Content-Type typo** — `'application/x-www-form-urlencoded'` NOT `'application/x-www/form-urlencoded'`
4. **Token in wrong param** — Old login flow `action=login` needs `lgtoken` not `token`; edit flow needs `token`
5. **Pages with existing categories** — Always check `prop=categories` first; some pages already have categories
6. **Double-counting in recounts** — When re-checking uncategorized pages, the count may appear unchanged if the batch check includes pages that were already categorized. Verify with specific page queries.

### Verification Pattern
After batch edits, verify by:
1. Querying specific edited pages: `action=query&titles=PageName&prop=categories`
2. For full recount: paginate through `allpages` in batches of 50, check `prop=categories` for each batch
3. Count pages where `categories` is missing or empty array

### ⚠️ Stale "Uncategorizedpages" Special Page (CSEZ Wiki, May 2026)
The `Special:Uncategorizedpages` page (and the `list=querypage&qppage=Uncategorizedpages` API) uses a **separate cache** that can be severely out of date. In the CSEZ wiki, it showed 50+ pages as uncategorized even though every page already had `[[Category:...]]` tags confirmed via `prop=categories`.

**Always trust `prop=categories` over `querypage=Uncategorizedpages`.**

Similarly, an initial `prop=categories` query returned 59 "uncategorized" pages, but a **fresh re-query moments later** showed all pages categorized. If you get unexpected results from `prop=categories`, re-run the query before taking action — the API may return stale cached results on the first call.

**Reliable verification workflow:**
1. Get all page titles via `list=allpages&apnamespace=0&aplimit=500`
2. Query categories via `prop=categories&cllimit=500` (POST with URLSearchParams for pipe-separated titles)
3. If results show uncategorized pages, **re-query** to confirm before editing
4. After editing, verify with a fresh `prop=categories` query

### Cron Job Approach
For 750+ pages, create a cron job that runs periodically, processes 15-20 pages per run.
- Track progress by re-scanning all pages each run and picking the next uncategorized ones
- No need for external state — the wiki itself is the source of truth

### Category Taxonomy (Game Wiki Example)
- Weapons: Firearms + subtype (Rifle, SMG, Shotgun, Sniper, Sidearm, Machine-Gun, Bolt-Action, Lever-Action)
- Ammunition: Ammunition, Magazines, Drum
- Attachments: Sights, Optics, Scopes, Grips, Suppressor
- Equipment: Armor, Helmets, Shields, Backpacks, Consumables
- Items: Containers, Secure Containers, Keycards, Currency, Junk
- Gameplay: Quests, Game Mechanics, Traders
- Enemies: Bosses, Enemies
- Locations: Map, Static spawns
- Meta: Tech Support, Outdated, Blog posts, Disambiguations, DLC, Wipe, Streamer items

### ⚠️ prop=categories Returns Null-Value Category Objects
On Miraheze MW 1.45+, `prop=categories` returns category objects with `{"*": null}` instead of category name strings:
```json
{"categories": [{"*": null}, {"*": null}]}
```
Checking `page.categories.length > 0` correctly detects categorized pages, but you **cannot** read category names from these objects. Use regex-search raw wikitext for `[[Category:` tags to identify specific categories.

### ⚠️ Stale Re-Scan Counts After Large Batch Edits
After adding categories to 100+ pages, a full re-scan via `prop=categories` may still show the same uncategorized count as before editing. Causes:
1. Miraheze's MediaWiki cache layer serves stale `prop=categories` results
2. The page title list (`window.__allPages`) captured pre-edits is still accurate, but the category data is cached
3. The cache typically refreshes within minutes to hours

**Verification strategy:** Spot-check 3-5 specific edited pages individually rather than running a full re-scan. Individual page queries (`action=query&titles=PageName&prop=categories`) return fresher results than bulk re-scans.

### ⚠️ BOA Content vs. BOA-Named Game Content
When auditing a Ghosts of Tabor wiki for foreign BOA program content:
- **DELETE**: Pages like "BOA Ranks & Structure", "BOA Discord Rules", "BOA About", "BOA Hall of Fame" — these are program/org charts, not game content
- **KEEP**: Pages like "BOA Supply Drop" — these are in-game quests/tasks named after the BOA faction. They are legitimate game content and should stay on the game wiki
- **Rule of thumb**: If the page describes the volunteer program structure, ranks, or Discord policies → BOA program content. If it describes an in-game quest, item, or location → game content.

### Silent North Wiki Categorization (May 2026)
- Wiki started with 5 pages, all uncategorized
- Categories used: Game Mechanics, Gameplay, Items, Weapons, Infected, Locations, Survival, Guides, Getting Started, Equipment, Consumables, Community, VR
- Pages were created with categories already appended during creation (more efficient than retroactive categorization)
- For new wiki builds, always add categories at page creation time

### Categorization Rule Priority
Rules are checked in order — first match wins. Order matters:
1. Magazine/Mag/Drum → Magazines + Ammunition
2. Ammo → Ammunition
3. Grenade/Frag → Grenades
4. Smoke/Flashbang/Flare/Landmine/Bomb → Throwables
5. Knife → Knives
6. Tomahawk/Saber/Sabre → Melee
7. Keycard/ends with "Card" → Keycards
8. Medical/consumable keywords → Consumables
9. Junk → Junk
10. Currency keywords → Currency
11. Quest/Mission/"The "/"A " → Quests
12. Boss/figurine keywords → Bosses
13. Fenix/Zero Foxtrot/Elite/Cultist → Enemies
14. Sight/optic keywords → Sights
15. Suppressor/muzzle/brake → Suppressor
16. Grip/foregrip → Grips
17. Rail/laser/light → Attachments
18. NVG/night vision → Night Vision
19. Helmet/hat/mask/shield → Helmets
20. Vest/armor → Armor
21. Backpack/sling/Ragnar → Backpacks
22. Container/Secure Container keywords → Secure Containers
23. Case/crate/box/pouch/safe/locker → Containers
24. Map/island/silo/mall/Matka/underground → Map
25. Streamer → Streamer items
26. Trader/trade/market → Traders
27. Wipe/Never Wipe → Wipe
28. DLC → DLC
29. Training/level/stamina/hunger/thirst → Game Mechanics
30. Ballistics/backup → Outdated
31. Fix/error/tech support/How to/BattlEye/SteamVR/PCVR → Tech Support
32. Blog → Blog posts
33. Disambiguation → Disambiguations
34. Default → Items
