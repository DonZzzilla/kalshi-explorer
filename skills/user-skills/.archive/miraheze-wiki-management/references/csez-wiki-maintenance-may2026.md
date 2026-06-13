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

---

## May 29, 2026 Session

### Currency Fix (Koruna → EZD)

| Page | Change |
|------|--------|
| Covert Evacuation | `20,000 Korunas` → `20,000 EZD` |
| All Pieces Together 1 | `20,000 Korunas` → `20,000 EZD` |
| All Pieces Together 2 | `20,000 Korunas` → `20,000 EZD` |
| All Pieces Together 3 | `20,000 Korunas` → `20,000 EZD` |
| All Pieces Together 4 | `20,000 Korunas` → `20,000 EZD` |

**Lesson:** Koruna was the old/correct name for the in-game currency at some point, but the wiki should use the current term EZD consistently. Found via `browser_console` JS search fetching all page content via `list=allpages` + `titles=` batch query across the full wiki.

### Faction Link Display Fix (PMC → Scav)

| Page | Change |
|------|--------|
| Covert Evacuation | `[[Scavs|PMC]]` → `[[Scavs|Scav]]` on "Enter a Suburbs raid as Scav" line |

**Lesson:** `[[TargetPage|DisplayText]]` wikitext links go to the target page but DISPLAY the text after the pipe. The PMC wiki article covers both PMC AND Scav faction info — so linking to it is fine for the target. But the display text "PMC" was wrong because the quest step asks you to enter as a Scav, not a PMC. **Always verify the display text matches the in-game action, not just the link target.**

Checked all 5 quest pages that had Korunas — only Covert Evacuation had the PMC display issue.

### Key Learnings

#### Browser console fetch requires full URLs
Always use full URLs (`https://csez.miraheze.org/w/api.php`) in `browser_console` fetch calls, not relative URLs. If the browser has navigated to a different domain (even `auth.miraheze.org` during login), relative URLs fail silently.

#### CSRF token must be fresh
CSRF tokens expire. Always fetch a new token immediately before each batch of edits. Tokens from a previous `browser_navigate` may no longer work.

#### Check ALL pages for a pattern, not just obvious ones
The Koruna→EZD fix was found by fetching ALL main-namespace pages and searching raw wikitext. Only 5 pages had it (all Boulder Forge quest reward tables). A targeted search would have missed some.

---

## May 30, 2026 Session

### Quest Pages Created (9 new pages)

| Page | Trader | Source |
|------|--------|--------|
| Lost and Found | ARK | Trader table extraction |
| Friendly Reminder | ARK | Trader table extraction |
| Recon I | ARK | Trader table extraction |
| Tracking Device | ARK | Trader table extraction |
| Where Did the ARK Trucks Go | ARK | Trader table extraction |
| Imposter | ARK | Trader table extraction |
| Inviting Troubles | ARK | Trader table extraction |
| The Saboteur | ARK | Trader table extraction |
| All Pieces Together 1 | Boulder Forge | Trader table extraction |

All pages follow standard format: `{{Task}}` template, Walkthrough, Tips, See Also, dual categories (trader quests + quests).

### Currency Fix — Quests Master Page

| Page | Change |
|------|--------|
| Quests | 180 Korunas → EZD replacements across all trader quest tables |

The master `Quests` page still had "Korunas" in every reward cell. Fixed via bulk search-and-replace.

### Page Fixes / Improvements

| Page | Change |
|------|--------|
| All Pieces Together l | Null-content stub → redirect to All Pieces Together 1 |
| All Pieces Together 2-4 | Added See Also sections |
| Better Safe Than Sorry 1 | Added See Also section |
| Task:Handshake (no space) | Added walkthrough and tips (was bare template only) |
| Scavs | Rewrote equipment section (removed placeholder tables, fixed duplicate `==Equipment==` headers, replaced with prose description) |
| Wipes | Removed `fandom-table` CSS class from season table (Fandom migration artifact) |

### Key Learnings

#### Python requests works for Miraheze — `urllib` does not
Confirmed this session: `requests.Session()` via `execute_code` works perfectly for login, bulk reads, and edits. Do NOT try `urllib.request` — it gets `permissiondenied`.

#### CSRF token refresh pattern for sequential edits
When creating multiple pages in sequence via `execute_code` POST, refresh the CSRF token after *each* edit by re-querying `action=query&meta=tokens`. Don't reuse old tokens — they expire quickly and edits fail silently.

#### Trader tables as quest data source
Individual trader pages (e.g., `ARK`, `Boulder Forge`) have the most up-to-date quest data in `{| class="wikitable sortable"` tables. The master `Quests` page can be stale (evidenced by Korunas not being updated). When creating missing quest pages, prefer trader table data over the master page.

#### Rewriting vs patching broken pages
When a page has fundamental structural issues (duplicate headers, broken placeholder tables), it's faster and cleaner to rewrite the entire page content via `text` parameter than to attempt surgical regex replacements. The Scavs page required a full rewrite after two separate edit attempts left it in a worse state.

### Run Stats
- **Wiki articles:** 88 (was 84 at start of session)
- **Total edits:** 2562 (was ~2548 at start)
- **Health check:** 0 wanted/uncategorized/lonely/broken/double at end of session