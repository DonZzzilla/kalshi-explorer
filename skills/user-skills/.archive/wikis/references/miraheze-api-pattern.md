# Miraheze Wiki API Access Pattern

## Working Pattern: browser_console fetch() with URLSearchParams

The most reliable editing pattern on Miraheze is via `browser_console` `fetch()` — **but you must use `URLSearchParams` or a URL-encoded string with `Content-Type: application/x-www-form-urlencoded`**. Using `FormData` silently fails (returns HTML login page).

### Step-by-step

```javascript
// Log in via browser FIRST (navigate to Special:UserLogin)
// Then in browser_console:

(async function() {
  // 1. Get CSRF token
  var tr = await fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json').then(r => r.json());
  var token = tr.query.tokens.csrftoken;

  // 2. Get current page content
  var pr = await fetch('/w/api.php?action=query&titles=Page_Name&prop=revisions&rvprop=content&format=json').then(r => r.json());
  var pages = pr.query.pages;
  var pid = Object.keys(pages)[0];
  var content = pages[pid].revisions[0]['*'];

  // 3. Modify content as needed
  var newContent = content.replace(/old/g, 'new');

  // 4. Submit edit — USE URLSearchParams, NOT FormData
  var params = 'action=edit&title=' + encodeURIComponent('Page_Name') +
    '&text=' + encodeURIComponent(newContent) +
    '&token=' + encodeURIComponent(token) +
    '&summary=' + encodeURIComponent('Edit summary') +
    '&format=json';

  var er = await fetch('/w/api.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: params
  }).then(r => r.json());

  console.log(er.edit.result); // "Success" or check for errors
})();
```

### ⚠️ FormData BROKEN on Miraheze

```javascript
// ❌ THIS FAILS — silently returns HTML login page
var fd = new FormData();
fd.append('action', 'edit');
fd.append('title', 'Page_Name');
fd.append('text', newContent);
fd.append('token', token);
var resp = await fetch('/w/api.php', {method: 'POST', body: fd}).then(r => r.json());
// Throws: SyntaxError: Unexpected token '<'
```

If you see `SyntaxError: Unexpected token '<'` on a POST, the browser session likely expired. Re-login and retry with URLSearchParams.

### Batch Editing Pattern

When processing many pages, refresh the CSRF token every ~10-20 edits to avoid token expiry:

```javascript
var tr = await fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json').then(r => r.json());
var token = tr.query.tokens.csrftoken;
// ... do edits ...
// If an edit fails with "permissiondenied" or "badtoken":
var tr2 = await fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json').then(r => r.json());
token = tr2.query.tokens.csrftoken; // refresh and retry
```

## Key Gotchas

- **Pipe `|` in page titles breaks the `titles=` parameter** — use `pageids` instead, or query one at a time
- **Protected pages return HTTP 403** — check first via browser edit view
- **Login tokens are single-use** — get a fresh one for each login attempt
- **CSRF tokens may expire** — refresh if you see "badtoken" or "permissiondenied" errors
- **Session expiry** — if reads return valid JSON but POSTs fail with HTML, re-login

## Checking Page Protection

Navigate to `https://got.miraheze.org/w/index.php?title=Page_Name&action=edit` in the browser. If the page is protected, the edit form will show:
> "You do not have permission to edit this page, for the following reasons: The action you have requested is limited to users in one of the groups: Bureaucrats, Confirmed users, Users"

## Checking for Redirects Programmatically

```javascript
function isRedirect(content) {
  return content.trim().toUpperCase().startsWith('#REDIRECT');
}
```

## Checking Backlinks (to determine canonical page name)

```javascript
async function getBacklinks(title) {
  var resp = await fetch('/w/api.php?action=query&list=backlinks&bltitle=' + encodeURIComponent(title) + '&bllimit=50&format=json').then(r => r.json());
  return resp.query.backlinks.map(bl => bl.title);
}
```

## Deprecated: Python urllib Login

The cookie-based Python `urllib.request` login pattern (get login token → POST login → get CSRF token → POST edit) **consistently fails** on Miraheze with "Unable to continue login. Your session most likely timed out." — even with correct credentials. Use the browser approach above instead.
