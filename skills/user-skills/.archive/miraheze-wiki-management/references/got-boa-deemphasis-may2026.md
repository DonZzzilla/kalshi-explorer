# GoT Wiki BOA De-emphasis Cleanup — May 26, 2026

## Context
Don directed: BOA program content should not have a heavy presence on got.miraheze.org. The BOA is a small volunteer group, not core game content. Got.miraheze.org should focus on the game itself.

## Discovery: Wiki Structure

**Critical finding**: got.miraheze.org has TWO "main pages":
- `/wiki/Main_Page` — An **orphaned page** with BOA Hub content (NOT the wiki's main page)
- `/wiki/Ghosts_of_Tabor_Wiki` — The **real** GoT wiki main page (set via `MediaWiki:Mainpage`)

The wiki's `MediaWiki:Mainpage` setting points to `Ghosts of Tabor Wiki`, so `/wiki/` correctly redirects to the real main page. The `Main_Page` was a leftover from BOA content creation.

**Lesson**: Always check `MediaWiki:Mainpage` first to find the real landing page. Don't assume `Main_Page` is the wiki main page.

## Pages Cleaned Up

### Converted to Redirects (→ GoT Wiki Hub)
| Page | Content | Action |
|------|---------|--------|
| `Main_Page` | Full BOA Hub main page | Redirect → Ghosts_of_Tabor_Wiki |
| `About` | About BOA program | Redirect → GoT Wiki Hub |
| `BOA Ranks & Structure` | BOA org chart & roles | Redirect → GoT Wiki Hub |
| `BOA Discord Rules & Policies` | BOA Discord rules | Redirect → GoT Wiki Hub |
| `Team Map` | BOA team locator map | Redirect → GoT Wiki Hub |

### Rewritten
| Page | Before | After |
|------|--------|-------|
| `GoT Wiki Hub` | "This BOA Hub Wiki focuses on..." | Proper game wiki hub (Locations, Bosses, Systems, Story, Tactics) |
| `Money Making Guide` | "from BOA mentors", "BOA Hub Wiki" SEO | Community knowledge framing |

### Category Cleanup
Removed `[[Category:BOA Hub]]` from: Tactics Guide, Map Guides, Mall Boss Guide, Ghost of Tabor Game Info, Money Making Guide.
Result: **0 pages** remain in BOA Hub category.

### Kept As-Is
- `BOA Supply Drop` — This is an in-game quest name, not BOA program content

## Key Patterns

### Identifying Orphaned Pages on a Wiki
1. Check `MediaWiki:Mainpage` to find the real landing page
2. Search for pages with the target term (e.g., "BOA") via `list=allpages`
3. Check each page's content against the wiki's purpose
4. Look for pages that don't link to/from the main content tree

### De-emphasizing a Program on a Wiki
1. Convert program-specific pages to redirects to the main wiki hub
2. Remove program framing from shared content pages
3. Remove program categories from game content
4. Keep pages that are about in-game content even if they share the program's name

### API Edit Pattern (working)
```javascript
(async function() {
  var tr = await fetch('https://got.miraheze.org/w/api.php?action=query&meta=tokens&type=csrf&format=json');
  var td = await tr.json();
  var token = td.query.tokens.csrftoken;
  
  var fd = new FormData();
  fd.append('action', 'edit');
  fd.append('title', 'Page_Name');
  fd.append('text', newContent);
  fd.append('summary', 'Edit summary');
  fd.append('token', token);
  fd.append('format', 'json');
  
  var er = await fetch('https://got.miraheze.org/w/api.php', {method: 'POST', body: fd});
  return JSON.stringify(await er.json());
})()
```

## Session Notes
- Login session expired twice during the work (Miraheze sessions are short-lived)
- `browser_type` + `browser_click` login is the most reliable re-login method
- Category audit: use `list=categorymembers&cmtitle=Category:BOA_Hub` to find all pages in a category
