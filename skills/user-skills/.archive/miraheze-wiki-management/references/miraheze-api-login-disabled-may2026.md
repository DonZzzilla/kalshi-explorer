# Miraheze API Login Disabled — May 2026 Update

## Summary

Miraheze has disabled the `action=login` API module on their CentralAuth endpoint. Confirmed 2026-05-30:

```json
{"error": {"code": "moduledisabled", "info": "The \"login\" module has been disabled."}}
```

ALL programmatic authentication methods now fail:
- Python `requests.Session()` with `action=login` → FAILS
- Browser console `fetch()` with `action=login` → FAILS  
- Browser console `fetch()` with `action=clientlogin` → FAILS

## The Only Working Method: Browser Form Login

1. `browser_navigate` to `https://WIKI_DOMAIN/wiki/Special:UserLogin`
2. Browser redirects to `auth.miraheze.org` (SUL3 unified login)
3. **Fill both fields via JavaScript** (the React SPA resets fields between `browser_type` calls):
   ```javascript
   var u = document.querySelector('input[name="wpName"]');
   var p = document.querySelector('input[name="wpPassword"]');
   if (u && p) {
     u.value = 'ZeroSkills'; p.value = 'ForkedT2000';
     u.dispatchEvent(new Event('input', {bubbles: true}));
     p.dispatchEvent(new Event('input', {bubbles: true}));
   }
   ```
4. `browser_click` the login button
5. Browser redirects back to wiki → session active
6. All `browser_console` `fetch()` calls now work with the session cookie

## Critical: Browser Session Loss

The browser frequently navigates to `about:blank`, **killing the authenticated session**. After ANY `browser_navigate`:
1. Check `window.location.href` — if `about:blank`, navigate back to wiki first
2. Verify login: `fetch('/w/api.php?action=query&meta=userinfo&format=json')`
3. If not logged in, re-login using JS form-fill method above

## Editing at Scale (Without API Login)

1. **Work page-by-page** — small batches (5-7 pages per session)
2. **Don't inject huge JS objects** — 473-item price maps exceed console limits
3. **Process one page at a time**: fetch → targeted replacements → edit → verify
4. **Use `browser_navigate` to API endpoints for reads** — more reliable than async fetch for large pages
5. **Refresh CSRF token every 15-20 edits**
6. **Add 0.5s delays between edits**

## Subagent Timeout Warning

`delegate_task` subagents **consistently timeout** on Miraheze API (600s limit, ~15-17 calls). Do NOT delegate bulk wiki updates. Work directly in main session.

## CSEZ Wiki Price Update Notes

- Scraped data: `~/projects/csez-data/` (569 items, 15 categories + `price_map.json`)
- Data source: `https://www.exfil-zone-assistant.app/data/{category}.json`
- Wiki table price format: `REG LVL 3<hr />58000 EZD`
- NEVER credit the data source on the wiki
- Update the Main Page game version when syncing prices (currently v1.6.5.0, data is from v1.14.0.2)
