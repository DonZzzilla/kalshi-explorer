# Miraheze Wiki Maintenance: Stale Index, Ghost Pages, and Link Validation

## `allpages` Returns Stale Entries

The `list=allpages` API on Miraheze wikis can return pages that no longer exist.
When queried via `action=parse` or `prop=revisions`, ghosts return `"missing": ""`
or `pageid: -1` with no content.

**Root cause:** Miraheze's search/index updater lags behind actual page deletions.
Deleted pages (or never-fully-created pages) remain in the index for minutes to hours.

### Detection

```
GET /w/api.php?action=query&titles=Page1|Page2|Page3&prop=revisions&rvprop=content&format=json
```
Pages with `"missing": ""` in the response are ghosts — skip them.

## Can't Delete Ghost Pages

Ghost pages appear in `allpages` but:
- `action=delete&title=PageName` → error `missingtitle`
- `action=delete&pageid=NNN` → error "no page with this ID"

These pages are **already deleted**. The index will catch up. Just ignore them.

## Systematic Cross-Page Link Validation

After editing, verify no broken internal links remain across all pages:

1. Define a list of known-nonexistent pages (from ghost detection)
2. Fetch each real page's wikitext via `action=parse&prop=wikitext`
3. Check for `[[NonExistentPage]]` patterns in each page
4. Also check for content issues (e.g., BOA-as-game mischaracterization)
5. Fix all issues found, then re-validate

See the SKILL.md main body for the full validation code pattern.

### Concrete Example: Ghosts of Tabor Broken Links

On the BOA Hub Wiki (boa.miraheze.org), several pages used `[[Ghosts of Tabor]]` as
an internal link, but no page with that title exists on that wiki. The game article
doesn't exist locally — it's an external subject. Fix pattern:

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', '/w/api.php?action=parse&page=PageName&prop=wikitext&format=json', false);
xhr.send();
var text = JSON.parse(xhr.responseText).parse.wikitext['*'];
var fixed = text.replace(/\[\[Ghosts of Tabor\]\]/g, '[https://store.steampowered.com/app/1512190/Ghosts_of_Tabor/ Ghosts of Tabor]');
```

Pages found with this issue: Trader Leveling Guide, Armor and Equipment Guide,
Inventory and Backpack Management.

## Bot-Induced Content Corruption: Literal Backslash-N and Duplicate Categories

### Symptoms

When a bot (e.g., ZeroSkills) edits many pages via the Miraheze API, content can become corrupted:
1. **Literal `\n\n` text** appears in page footers — wikitext contains literal backslash-n instead of real newlines
2. **`[[Magazines]][[Ammunition]]` stray links** — duplicate link pairs at page bottom (e.g., on magazine pages)
3. **Duplicate `[[Category:X]]` tags** — same category appearing 2-6 times

These show on rendered pages as:
- Visible `\n\n` text near the bottom
- Red-linked "MagazinesAmmunition" text
- Categories appearing multiple times

### Detection Pattern

```javascript
const hasLiteralSlashN = /\\n{2,}/.test(text);              // literal backslash-n in footer
const hasDupAmmo = text.includes('MagazinesAmmunition');   // dup link concat
const cats = text.match(/\[\[Category:[^\]]+\]\]/g) || [];
const hasDupCats = cats.length > [...new Set(cats)].length;
```

### Fix Pattern (Proven May 2026)

The reliable fix is to **strip ALL categories and re-add unique ones**:

```javascript
let text = d.parse.wikitext['*'];
text = text.replace(/\\n/g, '\n');                          // fix literal backslash-n
text = text.replace(/\[\[Magazines\]\]\[\[Ammunition\]\]/g, '');  // remove stray links
const cats = [...new Set((text.match(/\[\[Category:[^\]]+\]\]/g) || []))];  // unique cats
text = text.replace(/\n?\[\[Category:[^\]]+\]\]/g, '');     // strip ALL categories
text = text.replace(/\n{3,}/g, '\n\n');                     // clean excess whitespace
text = text.trimEnd();
cats.forEach(c => text += '\n' + c);                       // re-add unique set
```

**Critical:** Use `text.replace(/\n?\[\[Category:[^\]]+\]\]/g, '')` to strip categories — NOT `lastIndexOf` or iterative dedup, which fail when categories appear multiple times with varying whitespace.

### Verification

After fixing, re-scan with the detection pattern above. Should return 0 matches.

## Wiki Content Can Change During Your Session

Other editors can add/remove pages while you're working. **Always re-fetch
`list=allpages` before updating navigation templates or the main page.**

In one session, the wiki grew from 11 → 23 articles due to concurrent editing.
New pages may contain broken links to pages that were deleted before you started.

## Known BOA Hub Domain Facts

For maintenance on boa.miraheze.org:
- **BOA** = Battlefield Observation & Awareness (volunteer group, NOT a game)
- **Game** = Ghosts of Tabor (VR extraction shooter by Combat Waffle Studios)
- **TaborMap** = `https://tablormap.com` — NOT `taborabormap.com` (typo found on Main Page and GoT Wiki Hub in May 2026)
- **Official GoT Wiki** = `https://got.miraheze.org/wiki/Ghosts_of_Tabor_Wiki`
- **GOT Wiki BOA Supply Drop** = An in-game quest referencing a faction called BOA (unrelated to the volunteer group)

## ⚠️ Broken File Links — NEVER Replace with Placeholders

**This is a critical lesson learned June 2026.** A cron maintenance job replaced hundreds of broken `[[File:Name.png|...]]` links across 16 wiki pages with `[[File:Missing Image.png|...]]`. The community was angry — the images actually existed on the wiki, the links just had wrong filenames/casing and needed to be corrected (retouted to the right item pages), not replaced with generic placeholders.

**Rules for broken file links:**
1. **Check if the file exists under a different name** — search `list=allpages&apnamespace=6` with a prefix of the filename. Casing, spaces vs underscores, and `-` vs `_` are common mismatches.
2. **If the file truly doesn't exist**, link to the item page instead: replace `[[File:Name.png|...]]` with a text link like `[[ItemName|Name]]` so editors can see what image is needed.
3. **NEVER use `Missing Image.png` as a replacement** — it destroys the information about what image was supposed to be there.
4. **The `BrokenFiles` category is cached** — it clears when the job queue runs (hours, not instant). A file showing as broken may actually exist.

**How to revert if placeholders were already applied:**
```python
# Get the revision before the placeholder edit
r = s.get(base, params={'action':'query','titles':title,'prop':'revisions','rvlimit':5,'rvprop':'ids|timestamp|comment','format':'json'}).json()
# Find the rev where comment contains "placeholder", then use the NEXT older rev
r2 = s.get(base, params={'action':'parse','oldid':target_revid,'prop':'wikitext','format':'json'}).json()
old_content = r2['parse']['wikitext']['*']
# Edit back to old_content
```

**See `references/broken-file-link-placeholder-disaster-june2026.md` for the full incident report, affected pages list, and revert procedure.**

## Maintenance Workflow

1. Fetch all pages via `list=allpages`
2. Verify existence via batched `titles=...&prop=revisions`
3. Identify ghosts (missing pages in index)
4. Fetch all real page contents
5. Check for issues: broken links, mischaracterization, empty pages, literal `\\n\\n`, duplicate categories
6. Fix issues one page at a time with fresh CSRF tokens
7. Re-validate after all fixes
8. Update main page nav **last** (reflects final state)

## Post-Edit Verification Pattern

After fixing links, always verify from the **correct wiki domain**. If you navigated
to an external wiki (e.g., got.miraheze.org) for cross-referencing, the browser's
API origin changes — subsequent `/w/api.php` calls go to the wrong wiki. Navigate
back to the target wiki before verifying fixes:

```
GOOD: browser_navigate to boa.miraheze.org → fetch from /w/api.php
BAD:  browser_navigate to got.miraheze.org → fetch from /w/api.php (wrong domain!)
```

## Batch Editing Limits

- **5-15 edits per browser_console call** before hitting 30-second timeout on Miraheze
- Use 300-400ms delays between edits
- For large batch jobs (100+ pages), process in chunks of 10-15 per call, storing progress in `window.__cursor`
- Always get a fresh CSRF token per batch (token expires with session)
