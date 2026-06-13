---
name: wiki-editing
description: Edit MediaWiki wikis via the browser when local execution is unavailable. Covers fetching raw wikitext and edit tokens through the browser console, probing user-group permissions to diagnose edit failures, and pushing edits via CSRF-authenticated POST. Trigger this when the task involves reading or modifying MediaWiki site content and/or when Docker/terminal is timing out.
---

## May 28, 2026 Session

### Ammo Page Updated
- Replaced old ammo table with new **per-shell ballistics data** (previously per-pellet for 12GA)
- 78 ammo types across 10 calibers in sortable table
- Header updated to "Ammo Ballistics Data (Per-Shell)"
- Added aboleth credit for datamining
- Old "Outdated Ammo Chart" section preserved

### Armor Page Created
- **New page** (wiki went from 71 to 72 articles)
- 31 body armors (chest), 7 face shields, 28 helmets
- 3 sortable tables grouped by location
- Full stats: Prot Lvl, Blunt Dmg, Pen Dmg, Wgt, Dura Base/Effective/AUC/Weighted/Fragil
- Notes section explaining each stat column
- Data sourced from aboleth's datamining

### execute_code / requests Confirmed Working
- Successfully used `execute_code` with `requests` library for all wiki edits
- Login → CSRF token → edit flow works entirely in `execute_code`
- This contradicts the previous skill version which said urllib/requests doesn't work
- Key: `requests.Session()` maintains cookies within a single execution

## When to Use
- Task involves reading, analyzing, or modifying MediaWiki page content
- Docker/terminal environment is timing out or unavailable
- You need to diagnose why edits are failing (permissions, protection, etc.)
- Task involves reading Discord content (forums, channels) via headless browser

## Discord API Token Auth via XHR (Best Method for Reading Content)

When you have Discord credentials, the **most efficient** way to read forum/channel content is via the Discord API using XHR from the browser console. This bypasses all DOM scraping limitations and gives you clean structured data.

### Login to Get Token
```javascript
(function() {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://discord.com/api/v9/auth/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      resolve(data.token);
    };
    xhr.onerror = function() { resolve('error'); };
    xhr.send(JSON.stringify({ login: 'EMAIL', password: 'PASSWORD', undelete: false }));
  });
})()
```

### Read Channel Messages
```javascript
(function() {
  var token = 'TOKEN_FROM_LOGIN';
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://discord.com/api/v9/channels/CHANNEL_ID/messages?limit=50', true);
    xhr.setRequestHeader('Authorization', token);
    xhr.onload = function() {
      var msgs = JSON.parse(xhr.responseText);
      var clean = msgs.filter(function(m) { return m.type === 0 || m.type === 19; })
        .map(function(m) { return { author: m.author.global_name || m.author.username, content: m.content }; });
      resolve(JSON.stringify(clean));
    };
    xhr.onerror = function() { resolve('error'); };
    xhr.send();
  });
})()
```

### List Forum Threads
```javascript
// Archived public threads (most useful for Q&A forums)
'https://discord.com/api/v9/channels/FORUM_ID/threads/archived/public?limit=50'
// Active threads
'https://discord.com/api/v9/channels/FORUM_ID/threads-active'
```

### Batch Fetch Multiple Threads in Parallel
```javascript
(function() {
  var token = 'TOKEN';
  var threadIds = ['ID1', 'ID2', 'ID3'];
  var promises = threadIds.map(function(tid) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://discord.com/api/v9/channels/' + tid + '/messages?limit=50', true);
      xhr.setRequestHeader('Authorization', token);
      xhr.onload = function() {
        var msgs = JSON.parse(xhr.responseText);
        var clean = msgs.filter(function(m) { return m.type === 0 || m.type === 19; })
          .map(function(m) { return { author: m.author.global_name || m.author.username, content: m.content }; });
        resolve({ thread: tid, messages: clean });
      };
      xhr.onerror = function() { resolve({ thread: tid, error: true }); };
      xhr.send();
    });
  });
  return Promise.all(promises).then(function(data) {
    window.__batchResults = data;
    return 'stored in window.__batchResults, threads: ' + data.length;
  });
})()
```

**Key tips:**
- Store large results in `window.__batchResults` to avoid console truncation
- Extract in a separate call: `JSON.stringify(window.__batchResults)`
- Messages are returned newest-first; filter `type === 0` (normal) or `type === 19` (reply)
- The token persists for the browser session; re-login if you navigate away
- This method is **far more reliable** than DOM scraping for reading large amounts of content

## Discord Access in Automated Context

**Discord login via `browser_navigate` to `discord.com/login` shows the login form but cannot be submitted programmatically** in most automated cron contexts. The browser gets stuck at the login wall.

**Options when you need Discord content:**
1. **Use the Discord API token approach** (documented above) if credentials are available
2. **Ask the user to provide the Discord token** directly
3. **Skip Discord and rely on wiki sources** — game wikis often have the same information that's in Discord channels
4. **Ask the user to manually check Discord** and report findings

**DO NOT waste time** trying to interact with Discord's login form in an automated context — it requires 2FA/Captcha in most cases.

### Workflow
1. Navigate to `https://discord.com/channels/SERVER_ID/FORUM_ID`
2. Extract thread cards: `document.querySelectorAll('.mainCard_f369db')`
3. Click relevant threads to open them
4. Read messages: `document.querySelectorAll('[class*="messageContent"]')`
5. Scroll `.scroller_ef3116` (the one with `scrollHeight > 1000`) to load more threads

### Key selectors
- Thread cards: `.mainCard_f369db`
- Thread title: `.header_faa96b`
- Tags/status: `.tags__08166` (look for "Solved")
- Reply count: `.messageCountText_faa96b`
- Message content (after click): `[class*="messageContent"]`
- Channel list: `document.querySelectorAll('a[href*="/channels/"]')`

### ❌ Don't waste time on
- XHR/fetch interceptor token extraction (Discord uses WebSocket)
- localStorage token access (blocked)
- document.cookie (HttpOnly)
- webpack module scanning
- `fetch(credentials: 'include')` (401 — needs Authorization header)

### Reading External Wikis for Reference

When building wiki content from an external wiki (e.g., got.miraheze.org):

1. Navigate to the external wiki: `browser_navigate` to the wiki URL
2. Read pages via the same XHR pattern (relative URLs work on that domain)
3. Key API endpoints:
   - `action=parse&page=PageName&prop=wikitext` — get page content
   - `action=query&list=allpages&aplimit=500` — list all pages
   - `action=query&meta=tokens&type=csrf` — get edit token (if editing)
4. Cross-origin fetch won't work — you must be on the same domain
5. Navigate back to your target wiki when done reading

## Alternate Read-Only API Access: browser_navigate + document.body.innerText

When you only need to **read** API data (not edit), and the async `fetch()` pattern in `browser_console` is problematic, you can use a simpler approach:

1. Navigate directly to the API endpoint: `browser_navigate` to `https://WIKI_URL/w/api.php?action=...&format=json`
2. Read the response: `browser_console` with expression `document.body.innerText`
3. The response is plain text JSON, parseable with `JSON.parse()` if needed

This is **simpler than the async fetch pattern** and works well for:
- Bulk data retrieval (page lists, category members, search results)
- Getting page wikitext via `action=parse&page=X&prop=wikitext`
- Any read-only API operation

**Limitation:** This only works for GET requests. For POST requests (editing), you must use `browser_console` with `fetch()`.

**Tip:** For very large JSON responses, the console output may be truncated. In that case, use `document.body.innerText.substring(0, N)` to read specific chunks.

When local execution is unavailable, use the **browser console** (browser_console tool) to make API calls in the page's origin context. This bypasses CORS restrictions since the fetch runs from the wiki's own domain.

### Recommended: Async Fetch Pattern with Full URLs

Use full URLs with `credentials: 'include'` — relative URLs can fail with "Failed to parse URL" in some browser environments:

```javascript
(async () => {
  const resp = await fetch('https://got.miraheze.org/w/api.php?action=query&meta=userinfo&format=json', { credentials: 'include' });
  const data = await resp.json();
  return JSON.stringify(data.query.userinfo);
})()
```

For POST requests with pipe characters in parameters, use `URLSearchParams`:

```javascript
(async () => {
  const formData = new URLSearchParams();
  formData.append('action', 'query');
  formData.append('titles', 'Page1|Page2|Page3');
  formData.append('prop', 'categories');
  formData.append('format', 'json');
  const resp = await fetch('https://got.miraheze.org/w/api.php', {
    method: 'POST', body: formData, credentials: 'include'
  });
  const data = await resp.json();
  return JSON.stringify(data);
})()
```

### Synchronous XHR Pattern (alternative)

Synchronous `XMLHttpRequest` (third param `false`) is more reliable than `async/await` `fetch()` in some browser console microtask environments:

```javascript
(function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/w/api.php?action=query&meta=tokens&type=csrf&format=json', false);
  xhr.send();
  return JSON.parse(xhr.responseText).query.tokens.csrftoken;
})()
```

## When Login is NOT Needed

**Content audits and reading do NOT require login.** All Miraheze wiki pages are publicly readable. Before attempting login, ask yourself:
- Am I only **reading** content? → Login not needed, proceed with `action=parse` or `browser_navigate`
- Am I only **checking links, categories, structure**? → Login not needed, use the API anonymously
- Am I **editing or creating pages**? → Login required, attempt the login flow above

Only trigger the login flow when you need to write. This avoids unnecessary CAPTCHA failures on read-only tasks.

### Checking Current Session Status

**Always start by checking who you already are** before attempting any login:

```javascript
(async () => {
  const resp = await fetch('https://got.miraheze.org/w/api.php?action=query&meta=userinfo&uiprop=groups|rights|editcount&format=json');
  const data = await resp.json();
  return JSON.stringify(data.query.userinfo);
})()
```

Note: `uiprop=name` is not recognized on some Miraheze MW versions. Use `uiprop=groups|rights|editcount` and check `data.query.userinfo.name` (which is always present) + `data.query.userinfo.anon` (empty string = logged in, absent = logged in, present with value = anonymous).

If `name` is an IP address, you're anonymous. If `name` shows a username, you're already logged in — check `groups` for `sysop`, `editor`, etc.

**⚠️ DON'T use `browser_navigate` to `action=login`** — it will fail with `"mustbeposted"` because `browser_navigate` only does GET requests. Login requires POST.

### Checking User Rights for Another User
```
action=query&list=users&ususers=Username&usprop=groups|rights|editcount|registration&format=json
```

This works without login and is useful for checking if a specific account exists and what rights it has.

### Option A: Browser Form Login (when you have credentials and need to establish a session)
1. Navigate to `https://WIKI_URL/wiki/Special:UserLogin`
2. **⚠️ SUL3 Redirect**: Miraheze uses SUL3 unified login. The browser will redirect to `auth.miraheze.org/WIKI_ID/wiki/Special:UserLogin?usesul3=1`. This is a *different domain* — session cookies set here apply back to the wiki.
3. Fill username/password with `browser_type`
4. Click login button with `browser_click`
5. Verify with API (on the *original wiki domain*, not auth): `action=query&meta=userinfo&uiprop=name|groups|rights`
6. Only attempt this if userinfo shows you're anonymous

> **⚠️ hCaptcha on Login = Hard Blocker**: Miraheze login forms include **hCaptcha**. If the CAPTCHA challenge appears after clicking "Log in" (or sometimes immediately on the login page), **you cannot solve it in an automated context**. The CAPTCHA is hosted inside an iframe and requires visual puzzle-solving (e.g. "click the two identical shapes"). When this happens, stop and report to the user — do not retry the password.
>
> **Workarounds for hCaptcha-blocked login:**
> 1. Ask the user to provide a **pre-authenticated session** (e.g., session cookie or a bot account exempt from CAPTCHA)
> 2. Ask the user to **temporarily whitelist the wiki** from CAPTCHA via wiki settings (if they have shell/admin access)
> 3. Ask the user to make the edits manually from the audit report
> 4. Check if the wiki already has a **bot password** configured (Special:BotPasswords) — bot accounts sometimes bypass CAPTCHA
>
> **Do NOT** repeatedly retry the password — each failed attempt triggers a new CAPTCHA.

> **⚠️ Password Field Binding**: On Miraheze's SUL3 login form, `browser_type` into the password field may appear to work (field shows dots) but the value may not actually bind to the underlying form input, especially if there's a delay between typing and submitting. This manifests as "Incorrect username or password" even with correct credentials. Try typing the password and immediately clicking submit with minimal delay. If it keeps failing, assume hCaptcha or session token expiry is the cause.

### Option B: API Login via browser_console
```javascript
(async () => {
  // Get login token
  const r1 = await fetch('https://got.miraheze.org/w/api.php?action=query&meta=tokens&type=login&format=json', { credentials: 'include' });
  const d1 = await r1.json();
  const loginToken = d1.query.tokens.logintoken;
  
  // Login — MUST use clientlogin, NOT login
  // ⚠️ action=login FAILS SILENTLY on Miraheze (returns "WrongToken" or "Failed"
  // even with correct credentials). Always use action=clientlogin.
  const formData = new URLSearchParams();
  formData.append('action', 'clientlogin');
  formData.append('username', 'Username');
  formData.append('password', 'Password');
  formData.append('logintoken', loginToken);
  formData.append('loginreturnurl', 'https://WIKI_URL/wiki/Main_Page');
  formData.append('format', 'json');
  const r2 = await fetch('https://got.miraheze.org/w/api.php', { method: 'POST', body: formData, credentials: 'include' });
  const d2 = await r2.json();
  
  // Get CSRF token
  const r3 = await fetch('https://got.miraheze.org/w/api.php?action=query&meta=tokens&type=csrf&format=json', { credentials: 'include' });
  const d3 = await r3.json();
  
  return JSON.stringify({ login: d2.clientlogin.status, csrfToken: d3.query.tokens.csrftoken });
})()
```

> **⚠️ Login Token Encoding Pitfall**: The login token from Miraheze contains `+\` (plus-backslash). If you build the POST URL as a raw string with `encodeURIComponent(token)`, it can over-encode and cause a `"WrongToken"` error. **Always use `URLSearchParams`** for the login POST body — it handles the token encoding correctly. Do NOT manually construct the POST body string with `encodeURIComponent` on the token.

> **⚠️ Login method**: On Miraheze, `action=clientlogin` is the documented reliable method. However, `action=login` (two-step token POST via `fetch()` with `credentials: 'include'`) has also been observed working in browser contexts where the session cookie is already present. Use whichever succeeds; if `clientlogin` returns `WrongToken`, try `action=login` with the two-step pattern before giving up.

> **Important**: The CSRF token `+\\` (backslash-plus) is the **anonymous user token**. A valid edit token only appears after successful login.

## Bulk Category Audit Pattern

When auditing a wiki for missing categories across hundreds of pages, use the **titles=batch POST approach** — it is more reliable than `generator=allpages` which can get stuck repeating the same pages.

### Step 1: Get all page titles via `list=allpages`

```javascript
// Batch 1 (store in window.__pages)
fetch('https://WIKI_URL/w/api.php', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: 'action=query&list=allpages&aplimit=500&apnamespace=0&format=json'}).then(r=>r.json()).then(d=>{ window.__pages = d.query.allpages; return d.query.allpages.length + ' pages'; })

// Batch 2+ (use apcontinue from previous response, store in window.__pages2, etc.)
```

**Note**: The response structure is `data.query.allpages` (not `data.allpages`). Each element has `.title` and `.pageid`.

### Step 2: Check categories in batches of 50 via POST

```javascript
fetch('https://WIKI_URL/w/api.php', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: 'action=query&titles=' + window.__pages.slice(0,50).map(p=>encodeURIComponent(p.title)).join('%7C') + '&prop=categories&format=json'}).then(r=>r.json()).then(d=>{ let noCat = Object.values(d.query.pages).filter(p => !p.categories); return noCat.length + '/' + Object.values(d.query.pages).length + ' missing: ' + noCat.map(p=>p.title).join(', '); })
```

### Step 3: Aggregate results across all batches

**⚠️ KNOWN ISSUE: `generator=allpages` pagination gets stuck** repeating the same batch after 2-3 iterations when used with `prop=categories`. The `gapcontinue` parameter is unreliable. Use the `titles=` batch approach above for accurate full-wiki scans.

**⚠️ KNOWN ISSUE: `generator=allpages` with `prop=categories` can give false "no categories" results** when the JSON response is very large and gets truncated. Always re-verify with targeted `titles=` queries.

**Alternative for finding uncategorized pages:** Navigate to `Special:UncategorizedPages` or use `list=querypage&qppage=Uncategorizedpages` — uses MediaWiki's own maintenance cache and is more reliable.

**Always set `cllimit=50`** when querying categories — the default is 10, which can cause pages with many categories to appear to have fewer than they do.

**For checking individual page categories:** `action=parse&page=PageName&prop=categories` is more reliable for spot-checks.

### ⚠️ Redirect Page Category Behavior

**Redirect pages can have `[[Category:X]]` tags in their wikitext but the API's `prop=categories` will NOT return them.** This is normal MediaWiki behavior. To check if a redirect page has categories, fetch the raw wikitext instead: `action=parse&page=PageName&prop=wikitext` and search for `[[Category:` tags.

### Pagination for Large Wikis

When using `list=allpages`, the maximum `aplimit` is 500. For wikis with more than 500 articles:
1. First call: `list=allpages&aplimit=500&apnamespace=0`
2. Check for `continue.apfrom` in the response (**NOT** `apcontinue` or `gapcontinue`)
3. Subsequent calls: add `apfrom=VALUE_FROM_PREVIOUS_RESPONSE` — this is a **title string**, not a numeric offset
4. Repeat until `batchcomplete` appears without a `continue` key
5. The final batch will have fewer than 500 results when complete

**⚠️ CRITICAL**: The continuation parameter from `list=allpages` is `apfrom` (the next page title to start from). Do NOT use `apcontinue` — that parameter does not exist for `list=allpages`. The response's `continue.apfrom` field contains the exact title string to pass.

**Example continuation flow:**
```
Call 1: list=allpages&aplimit=500&apnamespace=0
→ returns pages A through Market Room (500 pages)
→ continue.apfrom = "Medical Block"

Call 2: list=allpages&aplimit=500&apnamespace=0&apfrom=Medical Block
→ returns pages Medical Block through Zero Foxtrot (394 pages)
→ batchcomplete appears → done, total = 894 pages
```

The same `list=allpages` + `titles=batch` approach (described in Bulk Category Audit Pattern above) is the reliable method for full-wiki category audits. **Never use `generator=allpages` with `prop=categories`** — it gets stuck in pagination loops.

## Duplicate Page Detection and Redirect

When `list=allpages` returns pages with similar names (e.g., "Page & Name" and "Page and Name"):

1. Fetch both pages' wikitext via `action=parse`
2. Check if one is already a redirect: `text.startsWith('#REDIRECT')`
3. If both are full pages, determine the canonical page (more content, more inbound links, or correct naming)
4. **Merge unique content from the duplicate into the canonical page** (see Merge Procedure below)
5. Replace the duplicate with a redirect: `#REDIRECT [[Canonical Page Name]]`
6. After replacing, verify the redirect works by re-fetching

### Merge Procedure (Duplicate → Canonical)

When the duplicate page has unique content worth keeping:

1. Fetch both pages' raw wikitext
2. Identify sections/tips in the duplicate that are NOT in the canonical page
3. Insert unique content into the canonical page **before the category block** (see Content-Append-After-Categories Pitfall)
4. Verify the merged content renders correctly
5. Redirect the duplicate to the canonical page

**Example from BOA Hub Run (May 2026):** "Foxtrot AI Guide" was a near-duplicate of "AI Enemies Guide". The unique "Boss Foxtrot Guards" section (including the Collector basement trick) was extracted from the duplicate and inserted into the canonical page before categories. The duplicate was then redirected.

## Updating Main Page Navigation

When a wiki has outgrown its original navigation grid:

1. Fetch current Main Page wikitext via `action=parse&page=Main_Page&prop=wikitext`
2. Identify the navigation table structure (often `{| class="wikitable"` with `! Quick Navigation`)
3. Add new rows before the table closing `|}` — keep existing row format consistent
4. Typical row format: `| [[PageName|'''Display Text'''<br><small>Short description</small>]]`
5. Update article/edit counts in any stats box (check `{{NUMBEROFARTICLES}}` vs hardcoded numbers)
6. Use `action=edit` with `text` parameter for the full replacement (single page edit, low risk)

## Content Creation Checklist

When creating new wiki pages:

1. **Check existence first** — use `createonly=true` parameter to prevent overwriting
2. **Include `{{#seo:...}}` template** at the top for searchability
3. **Add categories at the bottom** — `[[Category:XXX]]` per the wiki's category taxonomy
4. **See Also section** — always include cross-links to related pages
5. **Main Page nav** — add the page to the navigation grid if one exists
6. **Cross-link from related pages** — update existing pages that reference this topic to link to the new page
7. **Verify rendering** — navigate to the new page and confirm it displays correctly

See `references/boa-hub-review-may2026-run8.md` for a worked example (45 pages audited, 2 new pages created, nav grid updated).
See `references/boa-hub-review-may2026-run9.md` for a worked example (47 pages audited, Miest Map Guide created, 3 redirects, duplicate section prevention technique).

## Batch Editing

### Batch Size Limits
- **5-10 edits per browser_console call** with 400ms delays between edits on Miraheze
- The `browser_console` tool has a hard 30-second timeout — on slow Miraheze connections, 15+ edits will exceed it
- Use `appendtext` (not `text`) to preserve existing content (e.g., adding categories to existing pages)
- For mass categorization, use batches of 10 with `appendtext` and 400ms delays
- For creating new pages, one page per `browser_console` call is safest

### Batch Procedure
1. Get fresh CSRF token per session (not per edit)
2. Process 15-20 pages per browser_console evaluation
3. Add 500ms delay between edits: `await new Promise(r => setTimeout(r, 500))`
4. Verify `data.edit.result === "Success"` for each edit
5. Re-scan all pages each run to find remaining uncategorized pages

### Newline Handling in appendtext
- `'\\n[[Category:XXX]]'` in JS produces literal `\n` in page text — categories still register correctly
- For actual newlines: `'[[Category:XXX]]' + String.fromCharCode(10) + '[[Category:YYY]]'`

## Diagnosing Permission Failures

### Check User Groups
```
GET /w/api.php?action=query&list=users&ususers=<Username>&usprop=groups|editcount|registration&format=json
```

Key groups: `user`, `confirmed`/`autoconfirmed`, `sysop`/`bureaucrat`.

### Check Page Protection
Navigate to `Special:Log?page=<PageName>&type=protect`.

## Common Pitfalls

- **Table row separator (`|-`) in JS-constructed wikitext**: When building wikitext tables inside JavaScript strings (e.g., for `browser_console` page creation), it's easy to emit `\n-\n` instead of `\n|-\n` for row separators. A standalone `-` loses the row boundary and the row merges into the previous one — cells stack horizontally instead of forming a new row. **Always use `|-` for row separators.** After creating a page, verify the table renders with `action=prop&page=X&prop=wikitext` and check that every data row starts with `|-` not bare `-`. To fix post-creation: split the wikitext into lines, find lines inside tables that start with `-` but not `|-` or `-}`, prepend `|`, then re-submit the edit.

- **Session expiry**: Re-login programmatically. Do NOT navigate to login page. Miraheze sessions expire frequently — even mid-edit-batch. Expect to re-login 2-3 times during a large editing session. After any `browser_navigate`, always verify login status via `userinfo` before attempting edits.
- **Rate limiting**: Keep batches to 15-20 edits with 500ms delays.
- **Relative URLs failing**: Use full URLs with `credentials: 'include'` when relative URLs fail.
- **Anonymous CSRF token**: The `+\\` token is anonymous — must login to get a valid edit token.
- **Token reuse**: Get new token every session, not per edit.
- **Stale `prop=categories` results on Miraheze**: The `prop=categories` API can return empty/missing categories for pages that DO have `[[Category:X]]` tags in their raw wikitext. This is a Miraheze-specific caching issue (separate from FlaggedRevs). When auditing for uncategorized pages, **always verify by fetching raw wikitext** (`action=parse&prop=wikitext`) and regex-searching for `[[Category:` — never rely solely on `prop=categories`. If raw wikitext has categories but the API doesn't report them, the categories ARE there — the cache just hasn't updated yet. The `Special:Uncategorizedpages` page and `list=querypage` API use a separate cache that can also be weeks out of date.
- **Use `action=clientlogin`, never `action=login` on Miraheze**: The deprecated `action=login` fails silently on Miraheze — it returns `"WrongToken"` or `"Incorrect username or password"` even with correct credentials. Only `action=clientlogin` works reliably. Always use synchronous XHR for the login call (async fetch can timeout on slow Miraheze responses).
- **`const` variable persistence in browser_console**: Variables declared with `const` or `let` persist across `browser_console` evaluations within the same page session. Running two blocks that both declare `const pages = [...]` will throw `SyntaxError: Identifier 'pages' has already been declared`. Use unique variable names per evaluation (e.g., `const pg1 = [...]`, `const pg2 = [...]`), or use `var` which is function-scoped and doesn't collide in the same scope. **This also applies to `async` IIFEs** — `(async () => { const ... })()` followed by another block using `const` for the same variable name will collide. Use `var` or unique names.
- **Session restoration after fetch failure**: If `browser_console` `fetch()` calls start failing with `TypeError: Failed to fetch`, the browser session may have expired or the origin context was lost (e.g., after a failed login attempt that navigated to `auth.miraheze.org`, or a CAPTCHA wall). **Fix**: Call `browser_navigate` to the wiki URL again (e.g., `https://WIKI_URL/wiki/Main_Page`), then retry the API calls using **relative URLs** (`/w/api.php?...`) in `browser_console`. This is faster than the first load and restores the session context. Do NOT continue retrying against the stale session — you'll just burn time on failures.
- **Duplicate category tag accumulation**: After repeated batch categorization runs, pages commonly accumulate duplicate `[[Category:X]]` tags (e.g., `[[Category:Items]]` appearing 3-4 times). The `prop=categories` API often returns empty results for these pages due to cache issues, making raw wikitext the only reliable verification. **Detection**: Fetch raw wikitext and regex-search for `\[\[Category:([^\\]]+)\]\]` — if the same category appears more than once, it's duplicated. **Fix**: Replace the entire category block at the page bottom with a deduplicated set. A common anti-pattern is `[[Category:Items]]\\n\\n[[Category:Items]]` — consolidate to single instances. Run deduplication passes periodically, especially after batch categorization jobs.
- **`gapcontinue` pagination stall**: When using `generator=allpages` with `prop=categories`, the `gapcontinue` parameter can get stuck returning the same batch of pages after 2-3 iterations. Use `list=allpages` (without prop) for title enumeration, then `titles=` batches for category checks. The `list=querypage&qppage=Uncategorizedpages` endpoint is more reliable for finding uncategorized pages.
- **Title encoding with `&`**: Page titles containing `&` (e.g., "BOA Ranks & Structure") must be passed as literal strings in `URLSearchParams`. Do NOT pre-encode to `%26` — this causes "invalidtitle" errors on some MediaWiki versions. Reading works with either form; editing requires the literal.
- **Login page navigation breaks API session**: Navigating to `Special:UserLogin` redirects to `auth.miraheze.org` (a different origin). After this redirect, relative-URL `fetch()` calls from the browser console silently fail or target the wrong domain. ALWAYS restore the session by calling `browser_navigate` back to the wiki URL BEFORE retrying any API calls. Do not attempt API calls while on `auth.miraheze.org`.
- **Duplicate page determination heuristic**: When two pages cover the same topic (e.g., "Weapons" and "Weapons List"), determine the canonical page by: (1) fetch full wikitext of both, (2) check cross-references (which page links to the other in See Also?), (3) content length — longer usually means more complete, (4) redirect the shorter/less-referenced page to the longer one. Edit the canonical page's See Also to remove self-references after redirecting.
- **Duplicate section insertion**: When adding a new `== Section ==` to a page that already has a subsection with the same or similar heading, you can accidentally create duplicates. **Always fetch raw wikitext first and search for ALL occurrences of the section heading** before inserting. If an old version exists (e.g., without "Main article:" or with different content), remove it in the same edit or a follow-up edit. Verify with a second API call that only one instance remains. This commonly happens when a page has a brief subsection (e.g., `== Miest ==\n=== Overview ===\nShort text`) and you insert a full section with the same heading.
- **Cron job conflicts**: Before doing manual wiki cleanup edits, always check for active cron jobs (`cronjob action=list`) that might be editing the same wiki. Cron jobs running as the same account can recreate content you just cleaned up, causing an edit loop. Pause conflicting jobs first, do the cleanup, then re-enable with corrected scopes.
- **FormData vs URLSearchParams for edits**: When submitting large wikitext payloads via the edit API, prefer `FormData` over `URLSearchParams`. `FormData` handles special characters (backticks, curly braces, pipes) more reliably, while `URLSearchParams` can choke on content containing JS-triggering characters when passed as a string.
- **`allpages` response structure**: `data.query.allpages` — not `data.allpages`. Each entry has `.title` and `.pageid`. Use a `for...of` loop to extract titles since it's an array, not a direct `.map()` on the response.

## ✅ execute_code / requests WORKS for Miraheze Edits

**Correction (May 2026)**: The previous version of this skill stated that `execute_code` with `urllib.request` or `requests` does NOT work for Miraheze. **This is incorrect.** `execute_code` with the `requests` library **does work reliably** for Miraheze wiki operations, including:

- Login via `action=clientlogin`
- Getting CSRF tokens via `action=query&meta=tokens&type=csrf`
- Editing pages via `action=edit` with the `text` parameter
- Creating new pages
- **Bulk reading**: fetching all pages via `list=allpages` + `action=parse&prop=wikitext`

The `requests.Session()` object maintains cookies across calls within the same `execute_code` execution.

**Preferred approach for bulk scraping/archiving**: Use `execute_code` with `requests` to fetch all wiki content via GET API calls. This is how the BOA Hub wiki (51 pages, ~161K chars) was fully archived in ~19 seconds. No browser needed for read-only operations.

```python
import requests, json, time

base = 'https://<wiki>/w/api.php'
s = requests.Session()

# Get all pages
pages = s.get(base, params={'action':'query','list':'allpages','aplimit':500,'format':'json'}).json()['query']['allpages']

# Fetch each page's wikitext
content = {}
for p in pages:
    d = s.get(base, params={'action':'parse','page':p['title'],'prop':'wikitext','format':'json'}).json()
    if 'parse' in d:
        content[p['title']] = d.parse['wikitext']['*']
    time.sleep(0.2)
```

**For writing/editing**: The same session approach works — login → CSRF token → edit, all in a single `execute_code` execution. Cookies do NOT persist across separate `execute_code` calls.

## CSV-to-Wiki-Table Pattern (May 2026)
When importing structured data from CSV files (e.g., game ballistics data) into wiki tables:

1. **Download CSV** from Google Drive using the direct download URL: `https://drive.google.com/uc?export=download&id=FILE_ID`
2. **Parse CSV** with Python's `csv.DictReader`
3. **Group data** logically (e.g., by caliber for ammo, by location for armor)
4. **Generate wikitext** rows programmatically
5. **Write to temp files** in chunks if the table is large (>8K chars per file to avoid stream timeouts)
6. **Read back and concatenate** in `execute_code` before uploading
7. **Upload** via `action=edit` with the full wikitext

**Example**: CSEZ wiki ammo page — 78 ammo types across 10 calibers, generated from a 5KB CSV downloaded from Google Drive. Armor page — 67 armor entries (31 chest, 7 face, 28 head) from a 4KB CSV.

**Column naming**: Use clear, concise column headers that match the in-game stat names. For sortable tables, include all relevant stats. For armor: Name, Prot Lvl, Blunt Dmg, Pen Dmg, Wgt, Dura Base, Dura Effective, Dura AUC, Dura Weighted, Dura Fragil. For ammo: Name, Pen, Dmg, Blunt, PenArm, BluntArm, Optimal, Bleed, m/s.

**Per-shell vs per-pellet**: When updating ammo data, note whether values are per-shell or per-pellet (important for 12GA). The wiki should clearly label which convention is used. Per-shell values are more useful for direct damage comparison.

## ⚠️ Protected Community Content

Some wiki pages are protected community resources that must never be deleted or modified:

- **Magical-Fix-Game-Button** (got.miraheze.org) — A community joke page shared as an inside joke. Never delete, even if it looks like spam.

## ⚠️ Redirect Page Protection

**NEVER delete, overwrite, or edit redirect pages.** Leave them completely alone — don't fix targets, don't remove stray categories, don't chain them. If a redirect page has issues, report them but do not modify the page. Redirects are critical for community usability (misspellings, alternate names).

Only recreate a redirect page if it is confirmed missing (page doesn't exist and community confirms it should).

### Token Handling in Browser Fetch

CSRF tokens from Miraheze contain `+\` (plus-backslash). Use `URLSearchParams` for POST data — it handles encoding automatically:

```javascript
(async () => {
  const token = await getCsrfToken(); // e.g. "8fa4b081dcd2c1d76bf8bb7dd17833d56a13ee5b+\"
  const params = new URLSearchParams();
  params.append('action', 'edit');
  params.append('title', 'PageName');
  params.append('text', newContent);
  params.append('token', token);  // URLSearchParams handles the + and \ correctly
  params.append('summary', 'Edit summary');
  params.append('format', 'json');
  const r = await fetch('/w/api.php', {method: 'POST', body: params});
  return await r.json();
})()
```

Do NOT use `encodeURIComponent()` on the token manually when using `URLSearchParams` — double-encoding will break it.

## Reusable Page Fetch Helper

When making many API calls to the same wiki, define a helper on `window` to avoid repeating the fetch boilerplate:

```javascript
// Define once per session
window._getPage = function(title) {
  return fetch('/w/api.php?action=parse&page=' + encodeURIComponent(title) + '&prop=wikitext&format=json')
    .then(r => r.json())
    .then(d => d.parse.wikitext['*']);
};

// Use repeatedly
window._getPage('Quests').then(t => console.log(t.length));
```

For multiple pages in parallel:
```javascript
Promise.all([
  window._getPage('Page1'),
  window._getPage('Page2'),
  window._getPage('Page3')
]).then(results => {
  // results[0] = wikitext of Page1, etc.
});
```

> **Note**: `d.parse.wikitext` is an object with key `'*'`, not a string. Access as `d.parse.wikitext['*']`.

## Site-Wide Notices (MediaWiki:Sitenotice)

The banner shown on all wiki pages is controlled by `MediaWiki:Sitenotice` — a regular wiki page, not a template. To update it:

```javascript
// Read current notice
window._getPage('MediaWiki:Sitenotice').then(t => console.log(t));

// Edit notice (use the edit API with the notice page title)
```

This is useful for updating version warnings, maintenance banners, or other site-wide messages.

## Deleting Pages

To delete a page via the API:

```javascript
(async () => {
  const token = window.__csrfToken; // obtained via action=query&meta=tokens&type=csrf
  const r = await fetch('/w/api.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'action=delete&title=' + encodeURIComponent('PageName') + '&reason=' + encodeURIComponent('Deletion reason') + '&token=' + encodeURIComponent(token) + '&format=json',
    credentials: 'include'
  });
  return await r.json();
})()
```

Returns `{"delete": {"title": "...", "reason": "...", "logid": N}}` on success.

**Common reasons:** spam/vandalism, deletion candidates (`{{delete}}`), outdated unfinished pages, duplicate content.

## Verifying Edits and Cache Behavior

### Uncategorized Pages Cache Delay
The `list=querypage&qppage=Uncategorizedpages` endpoint uses a **separate cache** that can lag hours behind actual edits. After batch-categorizing pages:
- **Don't trust the uncategorized count immediately** — it may still show old numbers
- **Verify by spot-checking** individual pages with `prop=categories` instead
- Deleted pages may also remain in the cache temporarily
- The cache refreshes on MediaWiki's maintenance cycle (usually within a few hours)

### Post-Edit Verification Pattern
After making edits, always verify by re-fetching the page and checking key content:

```javascript
// After editing, verify the change stuck
window._getPage('Quests').then(t => {
  const hasOldWarning = t.includes('0.10.0');
  const hasNewWarning = t.includes('0.13.0 Wipe 9');
  return JSON.stringify({ hasOldWarning, hasNewWarning });
});
```

**⚠️ Edit Reversion / Stale Cache**: Edits may appear successful (API returns `result: Success`) but the page content still shows old values when re-fetched. This can happen due to Miraheze's MediaWiki job queue delay, edit moderation, or caching layers. **Always re-fetch page content after editing to verify changes actually stuck.** If the old value is still present, re-submit the edit.

For batch verification of multiple pages, use `Promise.all` with a summary:
```javascript
Promise.all([
  window._getPage('Page1').then(t => ({page: 'Page1', ok: t.includes('expected text')})),
  window._getPage('Page2').then(t => ({page: 'Page2', ok: t.includes('expected text')}))
]).then(results => JSON.stringify(results));
```

## SEO Template Pattern

Adding `{{#seo:...}}` templates to wiki pages improves search discoverability. Place at the very top of the wikitext:

```
{{#seo:
|title       = Page Title - Wiki Name
|description = Concise 1-2 sentence description for search engines.
}}
```

- `title` should include the wiki name suffix (e.g., "- BOA Hub Wiki")
- `description` should summarize the page content for search results
- Must be placed before any other wikitext content
- New pages should include this template at creation time

## Broken Link Audit Pattern — Full Procedure

When reviewing an entire wiki for broken links and content issues:

### Phase 1: Bulk Content Retrieval
Fetch all page wikitext in parallel batches:
```javascript
(async () => {
  const pages = ['Page1', 'Page2', ...];
  const results = {};
  for (const page of pages) {
    const r = await fetch('/w/api.php?action=parse&page=' + encodeURIComponent(page) + '&prop=wikitext&format=json');
    const d = await r.json();
    if (d.parse) results[page] = d.parse.wikitext['*'];
    else results[page] = 'PAGE_NOT_FOUND';
  }
  return results;
})()
```

### Phase 2: Identify Broken Links
Search each page's wikitext for:
- `[[InternalLink]]` patterns that point to non-existent local pages
- External links with typos (e.g., `tablormap.com` → `tabormap.com`)
- Inconsistent data (e.g., outdated article counts, version numbers)
- Duplicate pages (same content under different names)

### Phase 3: Fix and Verify
1. Edit each affected page via the edit API
2. Re-fetch to verify changes stuck
3. Run a second audit pass to confirm all issues resolved

See `references/boa-hub-review-may2026-run4.md` for a complete worked example (43 pages, 17 edits: duplicate redirect, main page update, 14 category additions, stub expansion).
See `references/got-wiki-bot-corruption-fix-may2026.md` for the bot-corruption fix pattern (250+ pages: stray links, literal backslash-n, duplicate categories).

## Cross-Domain Session Pitfall

**Always use full URLs in browser_console fetch calls** (`https://boa.miraheze.org/w/api.php`), not relative URLs (`/w/api.php`). After navigating to read an external wiki or site, the browser's origin changes and relative URLs will target the wrong domain. This silently produces cross-origin errors or wrong-wiki results.

When reviewing a wiki for version accuracy:

1. **Version headers** — Search for old version strings (e.g., `1.6.3.1`) in page content
2. **Template version** — Check `Template:Version` points to current version
3. **Magic word counters** — `{{NUMBEROFARTICLES}}` and `{{Version}}` auto-update; don't hardcode
4. **Duplicate categories** — Some pages accumulate duplicate `[[Category:X]]` tags after edits
5. **Incomplete entries** — Look for `???`, `##`, empty table cells, "placeholder" text
6. **Cross-links** — Add `{{Main|Page}}` links between related pages (maps↔quests↔bosses↔items)
7. **Outdated comments** — Remove user comments like "page needs updating" once fixes are applied
8. **Search for old versions** — Use `action=query&list=search&srsearch=1.6.3` to find references

## Session Management Across Multiple Wikis

When working across multiple Miraheze wikis in a single session:

1. **Session per domain**: Each Miraheze wiki has its own session. Logging into got.miraheze.org does NOT give you a session on silentnorth.miraheze.org.
2. **Re-login after navigation**: When you navigate to a different domain (e.g., to read external sources like Steam), the browser loses the wiki session. Always re-login when returning to a wiki.
3. **Session expiry**: Miraheze sessions can expire during long operations. If `fetch()` starts failing with HTML responses (not JSON), the session has expired. Re-login immediately.
4. **Verify with userinfo**: After any navigation, verify login status: `action=query&meta=userinfo&uiprop=name|groups`. If `name` shows an IP address, you're anonymous.

## Subagent Delegation for Wiki Editing

**delegate_task is unreliable for Miraheze wiki editing.** The subagent gets its own browser session which:
- Has no login state (starts anonymous)
- Times out after 600s even with few API calls (Miraheze is slow)
- Cannot share the parent's browser cookies

**Preferred approach**: Do wiki editing directly in the parent session using `browser_console` with `fetch()`. Only delegate if the task is purely research-based (reading external sources).

## Creating Multiple Pages Efficiently

When creating many new pages on a wiki:

1. **One page per browser_console call** is more reliable than batch creation
2. **Keep wikitext simple** — complex templates with nested `{}` can cause JS parsing errors in the browser console
3. **Use `action=edit` with `text` parameter** (not `appendtext`) for new page creation
4. **Add categories at the bottom** of each page: `[[Category:XXX]]`
5. **Create 5-10 pages per session** before the session expires

## FlaggedRevs (Content Moderation Queue)

Some Miraheze wikis run the **FlaggedRevs** extension, which holds edits in a moderation queue before they become publicly visible. Signs you're dealing with FlaggedRevs:

- After editing, the page shows a **"New changes await moderation."** banner link
- `action=parse` returns the **stable** (older) content, not your new revision
- Your edit appears in `list=recentchanges` with the correct revid, but the stable revid is older
- The history page shows your revision flagged as "pending review"

**What to do:**
1. **Don't waste time trying to self-approve.** API actions `review`, `stabilize`, `approve`, `approverevisions` are NOT available via the MediaWiki API on Miraheze. FlaggedRevs approval is done through the web UI or by another admin. You cannot bypass it programmatically.
2. **Verify your edit was actually saved** by checking `list=recentchanges` or `action=query&titles=X&prop=revisions&rvlimit=1` — your revid should appear. If it does, the edit is safely stored.
3. **Move on.** The edit will appear once a moderator approves it. Your job is to make the edit correctly; the approval is out of your control.
4. **When re-reading pages after editing,** always use the raw revision API (`prop=revisions&rvprop=content&rvstartid=REVID`) if you need to verify your specific edit, since `action=parse` returns the stable version.

## Cross-Domain API Reading (External Wikis)

When you need to read content from a **different** Miraheze wiki (e.g., reading got.miraheze.org while working on boa.miraheze.org):

1. **Cross-origin `fetch()` fails with `TypeError: Failed to fetch`**. You cannot call `fetch('https://other.wiki.org/w/api.php')` from a browser tab on a different domain.
2. **Solution:** Use `browser_navigate` to go to the external wiki first, then make API calls via `browser_console` using relative URLs (`/w/api.php?...`).
3. **The cost:** Navigating away may expire your session on the original wiki. Be prepared to re-login when you navigate back.
4. **Strategy for cross-wiki work:** Batch all reads from the external wiki in one visit, then navigate back. Use `browser_navigate` to go to the external wiki, make multiple `browser_console` calls, then `browser_navigate` back.

## Checking Page Existence (Lightweight)

To check if a page exists without fetching its full content:

```javascript
(async () => {
  const resp = await fetch('/w/api.php?action=parse&page=PageName&prop=format&format=json');
  const data = await resp.json();
  return data.parse ? 'EXISTS' : (data.error ? 'MISSING: ' + data.error.code : 'UNKNOWN');
})()
```

If the page exists, `data.parse` will be present. If missing, `data.error.code` will be `missingtitle`. This is faster than fetching full wikitext when you just need existence.

## Stub Detection Heuristic

When auditing for stub/empty pages, **do not use line count** from `split('\n')` on API-returned wikitext — the API returns content as a single string, so `split('\n')` always yields 1 line. Use **character count** instead: pages with < 1500 characters are likely stubs. Pages with < 200 characters are almost certainly empty or broken.

## Bot-Corruption Fix Pattern (May 2026)

See `references/got-wiki-bot-corruption-fix-may2026.md` for the full session log (250+ pages fixed).

## Miscategorization Audit Pattern (May 2026)

See `references/got-wiki-miscategorization-audit-may2026.md` for the detection and fix pattern when pages in one category (e.g., Quests) are incorrectly tagged with another (e.g., Items). Key technique: batch-fetch `prop=categories` and filter for cross-category contamination.

## Malformed Category Tag Anti-Pattern

When editing wiki pages, check for malformed category tags at the bottom of wikitext. A common anti-pattern:

```
[[Category:BOA Hub]]]]\\]\\]
Category:Weapons
```

The `]\\]\\]\nCategory:X` is a literal newline-escape that renders as text instead of a proper category. It should be:

```
[[Category:BOA Hub]][[Category:Weapons]]
```

**How to detect:** Fetch raw wikitext and search for `]\\]\\]\nCategory:` (literal backslash-n before "Category:"). Also check for categories that appear in the wikitext but don't show up on the page's category listing — this is a telltale sign. Quick scan: fetch the last 200 chars of wikitext and regex-match for `\[\[Category:[^\\]]+\]\]` — if the count looks wrong or you see bare `Category:X` without brackets, it's malformed.

**Fix:** Replace `]\\]\\]\nCategory:X` with `[[Category:X]]` and consolidate into a clean block at the page bottom.

## ⚠️ Content-Append-After-Categories Pitfall

When editing a page to add new sections/content, **always ensure new content goes BEFORE the category block, not after it**. Categories must be at the very end of the wikitext.

**How it happens:** If you use `action=edit` with `text` parameter and build new content by concatenating `oldContent + '\n\n== New Section =='`, the new section ends up AFTER the existing categories. This breaks category rendering.

**Safe pattern for adding content to an existing page:**
```javascript
// 1. Fetch current content
const oldText = d.parse.wikitext['*'];

// 2. Find where categories start
const catIndex = oldText.lastIndexOf('[[Category:');

// 3. Split: main content vs categories
const mainContent = catIndex !== -1 ? oldText.substring(0, catIndex) : oldText;
const catBlock = catIndex !== -1 ? oldText.substring(catIndex) : '';

// 4. Rebuild: main + new section + categories
const newContent = mainContent + '\n\n== New Section ==\n...\n\n' + catBlock;
```

**Alternative:** Use `appendtext` parameter instead of `text` — it adds to the very top or bottom of the page. For inserting mid-page (e.g., adding a new section before categories), the split-and-rebuild pattern above is required.
- URL: https://silentnorth.miraheze.org
- Game: Silent North (VR zombie survival, Swiss Alps)
- Version: 0.2.4.745.41503
- Skin: Citizen
- Cron jobs: SN Wiki Builder (2h), SN Wiki Content Expander (3h)

## Citizen Skin (Miraheze) Notes

- **Sidebar**: `MediaWiki:Sidebar` — format: `* '''[Section Name]]'` / `** [[Page|Name]]`
- **Creating pages**: Use `createonly=1` to prevent overwriting
- **Sidebar organization**: Group links under category headers, never use a flat list
- **Footer**: `MediaWiki:Citizen-footer-desc` and `MediaWiki:Citizen-footer-tagline` — DO NOT modify without explicit permission (CWS wikis have custom footer content)

## Ghosts of Tabor Domain Knowledge

### ⚠️ Wiki Main Page: Ghosts_of_Tabor_Wiki — NOT Main_Page

On got.miraheze.org, `MediaWiki:Mainpage` = `Ghosts_of_Tabor_Wiki`. The page `Main_Page` is NOT the wiki's main page — it was an orphaned page. Always verify the real landing page by checking `MediaWiki:Mainpage`:

```javascript
(async () => {
  var r = await fetch('/w/api.php?action=parse&page=MediaWiki:Mainpage&prop=wikitext&format=json');
  var d = await r.json();
  return d.parse.wikitext['*'].trim();
})()
```

- **Game**: Ghosts of Tabor (VR extraction shooter) by Combat Waffle Studios
- **BOA**: Volunteer players sanctioned by CWS — NOT a separate game. BOA program content should NOT have a heavy presence on got.miraheze.org — it's a small volunteer group, not core game content. Keep BOA references minimal (quest names like "BOA Supply Drop" are fine, but program explainers and org charts belong on boa.miraheze.org).
- **Official wiki**: https://got.miraheze.org/wiki/Ghosts_of_Tabor_Wiki
- **Stats (May 2026 Run 6)**: 749 articles, 10 admins, 476 registered users, 17 active (30d)
- **Game version**: 0.13.0.8808.63144 (Wipe 9)
- **MW version**: 1.45.3
- **Account**: ZeroSkills (sysop)
- **Maps**: Missile Silo, Island of Tabor, Matka Miest, Matka Underground, Chodov Mall
- **Bosses**: Krtek (Silo), Nikolai & Tatra (Mall), The Collector (Matka), Mamba (Island)

- `references/got-wiki-maintenance-may2026-run6.md` — GoT wiki audit Run 6 (May 26, 2026): 82% duplicate category tags, prop=categories cache confirmed stale, BOA content verified clean, session restoration pattern
- `references/got-wiki-maintenance-may2026-run5.md` — GoT wiki audit Run 5 (May 2026): full audit of 38 pages, login blocked by hCaptcha, 5 pages with empty placeholder content identified
- `references/boa-hub-review-may2026-run4.md` — BOA Hub wiki 4th review (May 2026 Run 4): duplicate redirect, main page update, 14 category additions, Insurance Guide expansion
- `references/boa-hub-review-may2026-run3.md` — BOA Hub wiki 3rd review (May 2026 Run 3): broken links, TaborMap fix, article count standardization
- `references/boa-hub-review-may2026b.md` — BOA Hub wiki 2nd review (May 2026 Run 2)
- `references/boa-hub-review-may2026.md` — BOA Hub wiki (boa.miraheze.org) full content review Run 1
- `references/cron-conflict-may2026.md` — Cron job edit conflict incident: why you must check `cronjob(action='list')` before manual wiki edits
- `references/boa-hub-tactics-content.md` — Extracted tactics from Discord Q&A
- `references/got-discord-qa-intel-may2026.md` — Discord Q&A forum intel: 43 threads reviewed
- `references/got-patch-0.13.0.md` — Patch 0.13.0/Wipe 9 changelog summary with wiki action items
- `references/miraheze-csez-ammo-sync.md` — ammo data sync example
- `references/miraheze-batch-categorization.md` — batch categorization pattern (UPDATED May 2026)
- `references/miraheze-maintenance-patterns.md` — stale index, concurrent editing, link validation
- `references/miraheze-boa-hub-cleanup.md` — Citizen skin wiki cleanup
- `references/ghost-of-tabor-boa-domain.md` — GoT/BOA domain knowledge
- `references/boa-hub-discord-internal.md` — BOA Discord channel structure
- `references/cron-wiki-builder.md` — Cron job pattern for wiki maintenance
- `references/got-wiki-maintenance-may2026.md` — GoT wiki audit Run 1
- `references/got-wiki-maintenance-may2026-run2.md` — GoT wiki audit Run 2
- `references/got-wiki-maintenance-may2026-run4.md` — GoT wiki audit Run 4 (May 26, 2026): 67 categorizations, 2 deletions, BOA content verified clean, cache behavior notes
- `references/got-wiki-maintenance-may2026-run3.md` — GoT wiki audit Run 3 (May 25, 2026): 761 of 894 pages uncategorized, duplicate page pairs, Wipe 9 gaps
- `references/got-audit-may2026-anon.md` — GoT wiki full audit (anonymous)
- `references/csez-wiki-maintenance-may2026.md` — CSEZ wiki audit
- `references/got-boa-deemphasis-may2026.md` — GoT wiki BOA de-emphasis cleanup
- `references/boa-hub-review-may2026-run6.md` — BOA Hub wiki 6th review (May 2026 Run 6): full audit of 40 pages, stats update, malformed category tag fixes, all content verified complete
- `references/boa-hub-review-may2026-run7.md` — BOA Hub wiki 7th review (May 2026 Run 7): duplicate page merge (Foxtrot AI → AI Enemies), 3 malformed category fixes, split-and-rebuild pattern for mid-page content insertion
- `references/silent-north-domain.md` — Silent North wiki domain info
- `references/multi-wiki-cron-strategy.md` — Multi-wiki cron strategy
- `references/discord-session-may25.md` — May 25, 2026 Discord session notes
- `references/got-categorization-cron.md` — GoT wiki batch categorization cron job
- `references/discord-forum-reading.md` — Complete Discord forum reading guide (MUST READ before Discord work)
- `references/miraheze-multi-wiki-cron-strategy.md` — Multi-wiki cron strategy (duplicate listing, same as multi-wiki-cron-strategy.md)