---
name: wikis
description: "Managing and maintaining Miraheze wiki projects — cron jobs, editing, categorization, and content policies across multiple wiki domains."
---

# Wikis

Managing multi-wiki projects on Miraheze, including cron-driven maintenance, content policies, and deduplication.

## Wiki Registry

| Wiki | Domain | Purpose |
|------|--------|---------|
| BOA Hub | boa.miraheze.org | BOA program content only |
| Ghosts of Tabor | got.miraheze.org | Game wiki ONLY — weapons, maps, bosses, mechanics. NO BOA program pages. |
| CSEZ | csez.miraheze.org | Contractors Showdown ExfilZone Wiki |
| Silent North | silentnorth.miraheze.org | Silent North (Swiss Alps PvPvE zombie survival VR) |

**Rule: Each wiki is independent. Never cross-contaminate.**

## Credentials

- **Username:** ZeroSkills
- **Password:** ForkedT2000
- Admin perms on all 4 wikis

## Editing Rules

- **⚠️ NEVER EDIT REDIRECT PAGES.** Don't remove stray categories, fix targets, clean artifacts, or make ANY changes. Only recreate if completely missing.
- **⚠️ Check for self-referencing redirects:** A page that is a `#REDIRECT [[ItsOwnName]]` is broken. Verify with `action=query&titles=PageName&redirects=1` — if the resolved title equals the queried title AND the page has the `redirect` property, the target is self-referencing. Fix by restoring the correct target from page history.
- **Community joke pages** (e.g., `Magical-Fix-Game-Button`) are intentional — never delete.
- **Deduplicate categories:** Reduce multiple `[[Category:X]]` to one. See `references/boa-hub-maintenance-sweep-may2026.md` for the Python removal method.
- **Trailing newlines:** Max 2 newlines at EOF.
- **Arty's Game bord:** Correct in-game spelling. Leave alone.

## CSEZ Wiki — Barter/Trader Data

### Barter Table Format

| Column | Description |
|--------|-------------|
| Item | What you **receive** from the trader |
| Type | Weapon, Gear, Misc., Backpack, Helmet, Ammo |
| Trade | What **you give** (EZD or barter items) |
| Rarity | UNUSUAL, RARE, EPIC, LEGENDARY, ULTIMATE |
| Level | Trader level (1.0–4.0+) |
| Exfil? | Extraction required? (some traders) |
| Map | Spawn map (some traders) |
| Trader | Anna/Tommy/Igor (ALL AMMO TRADES only) |

### Trader Pages

Existing: Regiment, NTG, TRUPIK'S, ARK, Boulder Forge, Neumann
Created: ALL_AMMO_TRADES

### Adding Barter Data to Trader Pages

1. Fetch existing content: `action=parse&page=Page_Name&prop=wikitext`
2. Remove existing `== Barter Trades ==` section (regex: `r'\\\\n== Barter Trades ==.*?(?=\\\\n== |\\\\Z)'`, flags=`re.DOTALL`)
3. Build barter table with proper wiki formatting (see **Wiki Table Styling** below)
4. Append new barter section before `[[Category:` lines
5. Use `URLSearchParams` for POST body (NOT FormData)

### ⚠️ Extracting Barter Data from Trader Pages (Python)

When parsing barter data from trader pages, be aware of these pitfalls:

**Multiple wikitable sortable tables on one page:** Some trader pages (e.g., Regiment) have a quest table `{| class="wikitable sortable"` BEFORE the barter table. Finding the first `{| class="wikitable sortable"` grabs the wrong table. **Fix:** First find the `== Barter Trades ==` section, then look for the table within that section:

```python
# Step 1: Find the barter section by header
bm = re.search(r'==\s*Barter Trades\s*==\s*\n(.*?)(?=\n==\s|\n\[\[Category|\Z)', content, re.DOTALL)

# Step 2: Fallback for pages without the header (e.g., Neumann)
if not bm:
    table_start = content.find('{| class="wikitable sortable"')
    if table_start >= 0:
        barter_section = content[table_start:]
    else:
        return []  # No barter data
else:
    barter_section = bm.group(1)

# Step 3: Find the table within the barter section
table_start = barter_section.find('{| class="wikitable sortable"')
```

**Neumann has no `== Barter Trades ==` header:** The barter table is at the very top of the page. Always use the fallback above.

**Row splitting:** Use `re.split(r'\n\|\-\s*\n', table)` to split into rows — splitting on bare `|-` can match content inside cells. After splitting, each data row starts with `| Type || Item || ...` (strip the leading `|` from the first cell).

**Cell parsing:** Split cells by `||`, then strip the leading `|` from the first cell. Search cells 3+ for rarity keywords (COMMON/UNUSUAL/RARE/EPIC/LEGENDARY/ULTIMATE). Level is in the next cell after rarity. Exfil and Map are 2 and 3 cells after rarity respectively.

**⚠️ Cell sanitization — ALWAYS strip `|}` from extracted values:** When splitting rows by `\n|-\n` and cells by `||`, the `|}` closing marker from adjacent rows can bleed into the last cell of a row (e.g., `map="Metro \n|}"`). If this contaminated data is inserted into a new table, it prematurely closes it. **Sanitize every cell:**

```python
cells = [c.replace('|}', '').replace('\n|}', '').strip() for c in cells]
```

See [`references/python-wikitext-pitfalls-may2026.md`](references/python-wikitext-pitfalls-may2026.md) for the full incident report, safe table-closing patterns, and post-build validation checklist.

**⚠️ Data validation — reject copy-paste errors:** Source pages may contain data entry errors (e.g., armor listed as Ammo type, trade costs duplicated across rows). Validate each extracted row before using it in a master table:

```python
# Type-value consistency
if b['type'] == 'Ammo' and any(kw in b['item'].lower() for kw in ['armor', 'helmet', 'vest', 'protector']):
    print("WARNING: armor listed as Ammo — skipping: %s" % b['item'][:60])
    continue

# Trade cost sanity for ammo
if b['type'] == 'Ammo' and any(kw in b['trade'].lower() for kw in ['armor', 'protector', 'full body']):
    print("WARNING: copy-paste error in ammo trade cost: %s" % b['trade'][:60])
    continue
```

Flag bad source rows with `<!-- FIXME: correct trade cost unknown -->` on the source page rather than silently dropping them — this makes it visible to the user what needs fixing.

**Trader page name ≠ display name:** The Barterable Items master page should link to actual page names (`[[Regiment|Igor]]`, `[[NTG|Maggie]]`, `[[ARK|Tommy]]`, `[[Boulder Forge|Maximilian]]`, `[[Neumann|Anna]]`), NOT old names like IGOR/MAGGIE/TOMMY as standalone links.

### ⚠️ Building Wiki Tables in Python — The `|}` Problem

When constructing wikitext tables programmatically, the `|}` closing sequence is dangerous. See [`references/python-wikitext-pitfalls-may2026.md`](references/python-wikitext-pitfalls-may2026.md) for full details. Key rules:

- **Safe:** `closing = "|" + "}"` then `table_lines.append(closing)`
- **Safe:** `table_lines.append("|" + chr(125))`
- **NEVER:** `lines.append("|")` + `lines.append("}")` — produces `|\n}` (two lines), not a valid table closing
- **ALWAYS validate after building:** Count standalone lines starting with `{|` and standalone lines that are exactly `|}` — they must be equal
- **ALWAYS sanitize cell data** from source pages before inserting into new tables

## Google Drive XLSX Import

1. Get file ID from Drive URL or `document.querySelectorAll('[data-id]')` — iterate elements, collect unique IDs > 10 chars
2. Download: `https://drive.google.com/uc?export=download&id={file_id}`
3. Parse with `zipfile` + `xml.etree.ElementTree` (XLSX = ZIP of XML)
4. Read `xl/sharedStrings.xml` first, then `xl/worksheets/sheet{N}.xml`
5. Handle merged cells (`<mergeCell ref="A1:B2"/>`) — value is in top-left cell
6. Detect header rows by content, not position — merged headers shift data columns
7. Item names are typically one column to the right of the "Item" header when the header cell is merged (e.g. header spans A:B, data is in column B)

## Wiki Table Styling (Dark Mode)

### Standard Classes

| Context | Class |
|---------|-------|
| Data tables (barter, trades) | `class="wikitable sortable"` |
| Reference tables (ammo, armor stats) | `class="sortable mw-collapsible wikitable floatheader"` |
| Collapsible sections | Add `mw-collapsible` to the class |

### Color Scheme (dark mode)

All colors must use hex `background-color` inline styles on `| cell |` entries.

**Rarity colors (barter tables):**

| Rarity | Hex |
|--------|-----|
| COMMON | `#545f5f` |
| UNUSUAL | `#3f8a38` |
| RARE | `#38658a` |
| EPIC | `#8a3865` |
| LEGENDARY | `#8a6b38` |
| ULTIMATE | `#6b388a` |

Format: `| style="background-color:#38658a;;;" | RARE`

**Protection level colors (armor tables):**

| Level | Hex |
|-------|-----|
| Level 0 | `#00008B` |
| Level 1 | `#00008B` |
| Level 2 | `#0000CD` |
| Level 3 | `#008000` |
| Level 4 | `#228B22` |
| Level 5 | `#B8860B` |
| Level 6 | `#8B0000` |
| Price/Req | `#3f8a38` |

**Penetration colors (ammo tables):**

| Pen Range | Hex |
|-----------|-----|
| < 1 | `#2e2e2e` |
| 1 – 2 | `#545f5f` |
| 2 – 3 | `#304d3e` |
| 3 – 4 | `#194762` |
| 4 – 5 | `#51325c` |
| 5 – 6 | `#621b1b` |
| > 6 | `#3e0303` |

### Table Structure Requirements

- Use `|+ Caption` for table caption (required for sortable tables)
- Header row: `! Col1 !! Col2 !! Col3`
- Data rows: `|-` then `| cell1 || cell2 || cell3`
- Color cells: `| style="background-color:#hex;"` on the cell, preceding the ` | value`
- End with `|}`
- Collapsible tables: add `mw-collapsible` to class

### Example: Barter Table

```wiki
{| class="wikitable sortable"
|+ Barter Trades
! Type !! Item !! Trade !! Rarity !! Level !! Exfil !! Map
|-
| Misc. || [[File:Icon_Bearkery_Storage_Key.png|frameless|40x40px]] Bearkery Storage Key || 1 Radio scanner, 1 Cleanser || style="background-color:#38658a;" | RARE || 1.0 || No || Suburbs
|-
| Gear || [[File:Icon_vest_lv1-sudden.png|frameless|40x40px]] Soft Armor || 1 Super Glue || style="background-color:#3f8a38;" | UNUSUAL || 1.0 || N/A || N/A
|}
```

### ⚠️ Barter Table Header Row Pitfall
Broken barter tables often have `|-\n Type !! Item !!` (data row separator + bare text) instead of `! Type !! Item !!` (header cells). The `|-\n` creates a new empty row, and `Type` becomes plain text, not a header. Fix: replace `|-\n Type !!` with `! Type !!`.

### Adding Images to Barter Tables
When adding item images to existing barter tables, use partial matching on item names since names may have extra spaces or slight variations:
```python
def find_image(item_name):
    k = item_name.lower().strip()
    if k in IMAGE_MAP: return IMAGE_MAP[k]
    for key, img in IMAGE_MAP.items():
        if key in k or k in key: return img
    return None
```
Then transform each item cell from ` Item Name ` to ` [[File:Image.png|frameless|40x40px]] Item Name `. Be careful with existing wiki links — strip `[[...]]` wrappers before matching, then re-wrap if needed.

### Penetration Color Coding (Ammo Table)

Penetration values are the most important stat for ammo comparison. Color the **Pen** column cell:
```wiki
| style="background-color:#194762;" | 3.4
```

## API Access

### Method A: browser_console fetch() (preferred for small edits)
1. Log in via browser first (`Special:UserLogin`)
2. Get CSRF token: `fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json')`
3. POST edits with `URLSearchParams` (NOT FormData — FormData silently fails on Miraheze)
4. Use `var` not `const`/`let` across multiple `browser_console` calls (shared JS scope)

### Browser Console JS Pitfall

The `browser_console` expression evaluator has limitations:
- **`var` only** — `let`/`const` leak across calls and cause "identifier already declared" errors in shared scope
- **No `return` statements** — wrapping code in a function body causes `SyntaxError: Illegal return statement`; use expression chains (`.then()` → final value) instead
- **No `async`/`await` in multi-line** — use `.then()` chains instead
- **Complex logic** — for multi-step processing (fetch → modify → POST), use `execute_code` with Python `requests` instead; it's more reliable and doesn't have scope leakage between calls
- **JSON handling** — use `.json()` directly on fetch responses; there's no `json_parse()` helper (that was a hallucinated function from another tool context)

### Method B: Python requests via execute_code (preferred for bulk edits)
```python
import requests, json
base_url = 'https://csez.miraheze.org/w/api.php'
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})
# Login
lt = json.loads(s.get(base_url, params={'action':'query','meta':'tokens','type':'login','format':'json'}).text)['query']['tokens']['logintoken']
s.post(base_url, data={'action':'login','lgname':'ZeroSkills','lgpassword':'ForkedT2000','lgtoken':lt,'format':'json'})
csrf = json.loads(s.get(base_url, params={'action':'query','meta':'tokens','type':'csrf','format':'json'}).text)['query']['tokens']['csrftoken']
# Get page
resp = s.get(base_url, params={'action':'parse','page':'PageName','prop':'wikitext','format':'json'})
existing = json.loads(resp.text)['parse']['wikitext']['*']
# Edit page
resp = s.post(base_url, data={'action':'edit','title':'PageName','text':new_content,'token':csrf,'summary':'...','format':'json','bot':'1'})
```

### ✅ Python requests login is reliable on Miraheze (confirmed May 2026)
`action=login` (NOT `action=clientlogin`) works reliably via Python `requests.Session()`:
```python
import requests, json
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})
base = 'https://WIKI_URL/w/api.php'
lt = s.get(base, params={'action':'query','meta':'tokens','type':'login','format':'json'}).json()['query']['tokens']['logintoken']
s.post(base, data={'action':'login','lgname':'USER','lgpassword':'PASS','lgtoken':lt,'format':'json'})
csrf = s.get(base, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']
```
The session cookie persists across calls within a single `execute_code` execution. This is the **preferred method** for bulk edits — faster than browser, no session expiry mid-batch, no hCaptcha.

### Deprecated: Python urllib login
Consistently fails on Miraheze with "session timed out." Use requests Session instead.

## Wiki Home Page Naming

The home page title varies by wiki. Check before editing:
- CSEZ: `Main Page`
- Silent North: `Silent North Wiki` (NOT `Main Page`)
- BOA Hub: `Main Page`
- Others: Verify via `action=query&meta=siteinfo&siprop=general` (`general.mainpage`) or by visiting the wiki root URL

## Sidebar Editing Best Practices

When updating `MediaWiki:Sidebar`:

1. **Fetch current content** first: `action=parse&page=MediaWiki:Sidebar&prop=wikitext`
2. **Group logically**: `* Section` for headers, `** target|display` for links; keep sections focused
3. **Avoid redundant entries**: Don't list a page in both *navigation* and a content section
4. **Link check**: Verify each `**` line uses a real page title (first `|` field); broken sidebar links break the nav
5. **Sidebar section titles** that match page names (e.g., `* Game World`) become clickable links to non-existent pages — avoid this by using display-only titles like `* GAME WORLD` or ensuring the section title text doesn't match an existing page
6. **Standard MediaWiki magic words** (`mainpage`, `recentchanges-url`, `randompage-url`, `Special:Upload`) will show as "missing" in API queries. These are NOT broken links — do not attempt to fix them.

## Cron Job Rules

1. Scope to ONE wiki domain per job
2. Prompt must name exact wiki URL
3. Check before creating — verify pages don't already exist
4. Substantive work only — no trivial edits
5. Minimum frequency: 6 hours

### MediaWiki Tracking Categories — Verify Before Acting

Tracking categories like "Broken Redirects", "Pages with broken file links", "Pages with script errors", and "Uncategorized pages" are **frequently stale** due to MediaWiki caching. NEVER trust them blindly. For each page listed:

- **Broken redirects**: Manually verify by checking if the redirect target exists. Fetch the page content, extract the `#REDIRECT [[Target]]`, then check if the target page `missing` property is false. Category-namespace pages redirecting to main namespace are often **false positives** in the BrokenRedirects report — the redirect may work fine.
- **Pages with broken file links**: Sample-check actual file links with `action=query&titles=File:Name` — the tracking category is often stale. Verify a few before investing effort. Also look for placeholder images (`''(Placeholder image: ...)''`) — these files never existed and the links can be safely removed along with the placeholder comment text.
- **Pages with script errors**: Often template-level issues (e.g., `{{MessageBox|id=test3}}`), not content problems. Check non-template/non-sandbox pages first.
- **Uncategorized pages**: Verify with `action=query&prop=categories` — often stale cache. **Caveat**: `prop=categories` can also be unreliable — a page that genuinely has categories may still return an empty list. Cross-check by fetching the page source and searching for `[[Category:...]]` regex when results seem unexpected.

### Bulk Content Corruption Scanning

For maintenance sweeps, scan all main-namespace pages for corruption patterns using Python `requests` (Method B API) for speed and reliability. See [`references/got-wiki-maintenance-sweep-may2026-s7.md`](references/got-wiki-maintenance-sweep-may2026-s7.md) for the complete procedure and [`references/boa-hub-maintenance-sweep-may2026.md`](references/boa-hub-maintenance-sweep-may2026.md) for BOA Hub-specific results.

**Common corruption patterns to detect:**

1. **Literal `\\n` in content** — A literal backslash-n (two characters: `\` + `n`) stored instead of a real newline (byte 0x0A). Text appears as one continuous block on the wiki. **Detection**:
   ```python
   stripped = content.replace('\n', '').replace('\r', '')
   has_issue = '\\n' in stripped  # literal backslash + n
   ```
   **Fix**: `content.replace('\\n', '\n')` — in Python source code, `'\\n'` matches the two-character sequence backslash-n, and `'\n'` is the real newline.
   **Historical note**: May 2026 sweep found 137 of ~899 pages (15%) affected on GoT wiki. Likely caused by a past bulk import/editing tool that escaped newlines.

2. **`\\n` between categories (specific variant)** — Appears as `[[Category:X]]\\nCategory:Y` where the second category also loses its `[[...]]` wrapper. **Detection**: search for `]]\\nCategory:` pattern. **Fix**: `content.replace('[[Category:X]]\\nCategory:', '[[Category:X]]\n[[Category:Y]]')`. After targeted fix, scan for remaining literal `\n` with the general pattern above. See [`references/boa-hub-maintenance-sweep-may2026.md`](references/boa-hub-maintenance-sweep-may2026.md) for affected pages and exact fix patterns.

3. **`Image=File:` double prefix in infoboxes** — Infobox `Image=File:ImageName.png` instead of `Image=ImageName.png`. The extra prefix breaks image rendering. **Detection**: `'Image=File:' in content`. **Fix**: `content.replace('Image=File:', 'Image=')`.

4. **Duplicate categories** — Multiple identical `[[Category:X]]` entries on the same page. Keep only the first occurrence. **Detection**: `cats = re.findall(r'\[\[Category:([^\]]+)\]\]', content)` then check `len(cats) != len(set(cats))`. **Fix**: iterate regex matches, track seen set, remove subsequent duplicates with offset tracking. See [`references/boa-hub-maintenance-sweep-may2026.md`](references/boa-hub-maintenance-sweep-may2026.md) for the complete Python method.

5. **`[[File:...]]` inside infobox `Image=` parameter** — Infobox `| Image = [[File:Name.png|params]]` instead of `| Image = Name.png`. The full wiki link syntax inside an infobox parameter breaks image rendering. **Detection**: `re.search(r'\|\s*\w*[Ii]mage\w*\s*=\s*\[\[File:', content)`. **Fix**: `re.sub(r'(\|\s*\w*[Ii]mage\w*\s*=\s*)\[\[File:([^\]]+)\]\]', lambda m: m.group(1) + m.group(2).split('|')[0], content)` — strips `[[File:...|...]]` wrapper, keeps only bare filename.

6. **External URL in infobox `Image=` parameter** — Infobox `| Image = https://external-site.com/image.png` instead of a local filename. Common on wikis migrated from Fandom. **Detection**: `re.search(r'\|\s*\w*[Ii]mage\w*\s*=\s*https?://', content)`. **Fix**: Replace with the correct local filename after verifying it exists via `action=query&titles=File:LocalName`.

7. **`{| class="wikitable}` broken table class** — The closing `}` immediately after the closing `"` (`class="wikitable}`) is consumed by the parser as part of the class attribute value, not as the wikitable delimiter. The `}` that should end the table-open token gets swallowed. This produces tables that render as raw wikitext on the page. **Detection**:
   ```python
   if '{| class="wikitable}' in content:  # missing closing quote before }
       issues.append('broken wikitable class')
   ```
   **Fix**: `content.replace('{| class="wikitable}', '{| class="wikitable"')` — add the missing closing `"`.
   **Note**: The correct MediaWiki table-open syntax is `{| class="wikitable"` (with the closing quote). This was a widespread issue on the Silent North wiki (5 pages affected: Fishing, Hunting, Quests, Stamina, Vehicles), likely introduced by a copy-paste error from a poorly formatted source.

8. **Detection helper (updated)**:
   ```python
   def scan_page_corruption(content):
       issues = []
       stripped = content.replace('\n', '').replace('\r', '')
       if '\\n' in stripped:
           issues.append('literal-backslash-n')
       if ']]\\nCategory:' in content:
           issues.append('backslash-n-between-categories')
       if 'Image=File:' in content:
           issues.append('Image-File-prefix')
       if re.search(r'\|\s*\w*[Ii]mage\w*\s*=\s*\[\[File:', content):
           issues.append('Image-has-File-wikilink')
       if re.search(r'\|\s*\w*[Ii]mage\w*\s*=\s*https?://', content):
           issues.append('Image-external-URL')
       if '{| class="wikitable}' in content:
           issues.append('broken-table-class')
       if re.findall(r'\[\[File:[^\]]*[^\x00-\x7f][^\]]*\]\]', content):
           issues.append('unicode-lrm-in-filelink')
       cats = re.findall(r'\\[\\[Category:([^\\]]+)\\]\\]', content)
       if len(cats) != len(set(cats)):
           issues.append('duplicate-categories')
       # Categories before See Also (categories render in page body, not at bottom)
       see_also_pos = content.rfind('== See Also ==')
       if see_also_pos >= 0:
           before = content[:see_also_pos]
           if re.search(r'\\[\\[Category:', before):
               issues.append('categories-before-see-also')
       return issues
   ```

### ⚠️ False Positive: `[[File:...]]` inside Portable Infobox `image1=`

Portable Infobox templates (`{{Infobox Character}}`, `{{Infobox item}}`, `{{Infobox Keycard}}`, etc.) **intentionally use** `| image1=[[File:Name.png|params]]` syntax. The template's `<image source="image1">` tag handles the full wiki link. Do NOT flag these as "Image-has-File-wikilink" corruption. Only flag `[[File:...]]` inside `Image=` (capital I, no digit) params — those appear in legacy non-Portable infoboxes.

**Detection refinement**: The `Image-has-File-wikilink` pattern should only match `| Image =` (or `| image =` with no digit suffix), not `| image1=`, `| image2=`, etc.:
```python
# Only match non-numbered image params (legacy infoboxes)
re.search(r'\|\s*[Ii]mage\s*=\s*\[\[File:', content)  # NOT image1=, image2=
```

### ⚠️ Unicode LRM in File Links Often False Positive

The `unicode-lrm-in-filelink` scan flag catches non-ASCII characters in `[[File:...]]` links. **However**, MediaWiki can resolve both the LRM-containing filename and the clean filename to the **same file** when they have identical content (same `pageid` and `sha1`).

**Diagnostic before "fixing":**
```
action=query&titles=File:Filename.png|File:Filename.png%e2%80%8e&prop=imageinfo&iiprop=sha1
```
- Same `pageid` + `sha1` → **Cosmetic only — skip.** The file links work.
- Different or missing → genuine broken file link.

**Emoji in filenames** (✅, ❌, 💬, etc.) are valid on Miraheze and also do NOT break file resolution. Do not flag these either.

### ⚠️ Placeholder Images — Safe to Remove

Some `[[File:...]]` links are accompanied by `''(Placeholder image: ...)''` comments (with or without angle brackets: `''<...>''`). These mark images that were never uploaded. The file does not exist on wiki. Safe course of action: **remove both the file link AND the placeholder comment text** rather than leaving broken image icons. Use regex:
```python
# Variant 1: ''(Placeholder image: ...)''
content = re.sub(r"\s*\[\[File:[^\]]+\]\]\s*''\([^)]*Placeholder[^)]*\)''\s*", "\n", content)
# Variant 2: ''<(Placeholder image: ...)>''
content = re.sub(r"\s*\[\[File:[^\]]+\]\]\s*''<[^>]*Placeholder[^>]*>''\s*", "\n", content)
```

## Category Management

### Creating Category Pages in Bulk

See [`references/got-wiki-maintenance-sweep-may2026-s10-pitfalls.md`](references/got-wiki-maintenance-sweep-may2026-s10-pitfalls.md) for detailed pitfalls discovered during bulk category creation, including:

- **Structural dependency ordering**: Check parent category pages exist first; create missing intermediate parents before dependents
- **System categories to skip**: Never create categories starting with "Pages with...", "Pages using...", "Pages including...", "Candidates for..."
- **WantedCategories cache staleness**: The tracking cache doesn't update immediately after creating category pages; verify with `action=query&titles=Category:X` instead
- **Category-namespace redirect false positives**: `Category:X` → `#REDIRECT [[Y]]` may appear in BrokenRedirects even when working correctly
- **BOA keyword false matches**: "Circuit Board" and "Motherboard" are game items, not BOA program content

**Standard category page content format:**
```
Brief description of [[Topic X]].

[[Category:ParentCategory]]
```

### Category Page Styling

See [`references/csez-wiki-table-styling.md`](references/csez-wiki-table-styling.md) for color scheme, table classes, and formatting patterns.

See [`references/silentnorth-wiki-structure-may2026.md`](references/silentnorth-wiki-structure-may2026.md) for Silent North wiki page inventory, sidebar structure, and home page details.

See [`references/got-wiki-redirect-preservation-may2026.md`](references/got-wiki-redirect-preservation-may2026.md) for redirect rules.

See [`references/csez-wiki-barter-trades-may2026.md`](references/csez-wiki-barter-trades-may2026.md) for barter implementation details.

See [`references/got-wiki-miscategorization-audit-may2026-s2.md`](references/got-wiki-miscategorization-audit-may2026-s2.md) for miscategorization patterns.

See [`references/got-wiki-miscategorization-audit-may2026-s3.md`](references/got-wiki-miscategorization-audit-may2026-s3.md) for `\\n` artifact cleanup.

See [`references/got-wiki-audit-may2026-s6.md`](references/got-wiki-audit-may2026-s6.md) for self-referencing redirect detection and BOA Hub redirect fix.

See [`references/got-wiki-maintenance-sweep-may2026-s7.md`](references/got-wiki-maintenance-sweep-may2026-s7.md) for bulk corruption sweep procedure, false-positive guidelines for tracking categories, and the literal `\\n` + `Image=File:` fix patterns.

See [`references/boa-hub-maintenance-sweep-may2026.md`](references/boa-hub-maintenance-sweep-may2026.md) for BOA Hub sweep results, the `\n`-between-categories variant, duplicate category removal method, and missing category detection.

See [`references/boa-hub-maintenance-sweep-may2026-s2.md`](references/boa-hub-maintenance-sweep-may2026-s2.md) for session 2 results (May 29, 2026): categories-before-See-Alsos pattern, sidebar gap analysis (3 pages missing, 1 duplicate), and the Python reordering fix.

See [`references/csez-wiki-audit-may2026.md`](references/csez-wiki-audit-may2026.md) for CSEZ audit results.

See [`references/csez-wiki-barterable-items-may2026.md`](references/csez-wiki-barterable-items-may2026.md) for Barterable Items master page structure and trader mapping, including post-repair trade counts and FIXME items.

See [`references/python-wikitext-pitfalls-may2026.md`](references/python-wikitext-pitfalls-may2026.md) for critical Python wikitext building patterns: `|}` closing safety, cell sanitization, data validation, and the incident that broke the Barterable Items master page.

See [`references/got-wiki-maintenance-sweep-may2026-s8.md`](references/got-wiki-maintenance-sweep-may2026-s8.md) for the May 2026 session 8 results: the `[[File:...]]` inside infobox Image= corruption pattern, the external Fandom URL variant, and the `prop=categories` API staleness confirmation.

See [`references/got-wiki-maintenance-sweep-may2026-s9.md`](references/got-wiki-maintenance-sweep-may2026-s9.md) for the May 2026 session 9 results: 7 broken file links fixed (3 placeholder images on SteamVR page, 2 Ballistics image fixes including AK5C.jpg→AK5C NoBG.png, 2 backup page fixes with Unicode LRM removal), and the discovery of the Portable Infobox `image1=` false-positive pattern.

See [`references/got-wiki-maintenance-sweep-may2026-s10.md`](references/got-wiki-maintenance-sweep-may2026-s10.md) for session 10 results: 2 duplicate page redirects fixed, 61 missing category pages created.

See [`references/miraheze-api-pattern.md`](references/miraheze-api-pattern.md) for API reference.