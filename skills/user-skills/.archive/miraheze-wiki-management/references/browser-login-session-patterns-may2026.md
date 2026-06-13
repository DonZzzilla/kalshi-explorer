# Browser Login & Session Patterns — May 2026

## Problem: Miraheze Login Resets Between `browser_type` Calls

The Miraheze SUL3 login form (`auth.miraheze.org`) has username and password fields that can reset between separate `browser_type` tool calls. The page may re-render or JS validation may clear fields.

## Root Cause

`browser_type` sends a clear-then-type sequence. On Miraheze's auth form, typing into one field can trigger JS that resets the other. The separate tool calls (username → snapshot → password → snapshot → click) give the page time to reset between each step.

## Working Pattern

```
1. browser_navigate to https://WIKI/wiki/Special:UserLogin
   → redirects to auth.miraheze.org

2. browser_type ref=<username_field> text=ZeroSkills

3. browser_type ref=<password_field> text=ForkedT2000
   (immediately, no snapshot between steps 2 and 3)

4. browser_click ref=<login_button>
   (immediately after step 3)
```

The rapid sequence (type/type/click) gives the page no time to reset between fields.

## After Login Click

- Browser redirects back to the wiki (e.g., `got.miraheze.org/wiki/Ghosts_of_Tabor_Wiki`)
- **Start API work immediately** — use `browser_console` with absolute URLs
- Don't take snapshots before API calls if possible (each snapshot = a `browser_navigate`-like round trip that can lose session context)

## API Work Must Use Absolute URLs

After the auth redirect chain, relative URLs like `/w/api.php` may resolve to `auth.miraheze.org` instead of the wiki domain. Always use:
```
https://got.miraheze.org/w/api.php
https://csez.miraheze.org/w/api.php
```
not `/w/api.php`.

## Session Expiry Signs

- `browser_console` `fetch()` returns HTML instead of JSON → session dead
- API returns `anonymous` for userinfo → not logged in
- Edit returns `badtoken` → CSRF token expired (just re-fetch token)

## Cross-Wiki

Each Miraheze wiki has its own session. Logging into GoT does NOT log into CSEZ. You must go through the full login flow for each wiki, or use Python `execute_code` with `requests.Session()` which handles CentralAuth cookies correctly.

## Python Alternative (More Reliable for Bulk)

For bulk edits across many pages, Python `execute_code` with `requests.Session()` is more reliable than browser:

```python
import requests
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})
base = 'https://WIKI_DOMAIN/w/api.php'

# Login
lt = s.get(base, params={'action':'query','meta':'tokens','type':'login','format':'json'}).json()['query']['tokens']['logintoken']
s.post(base, data={'action':'login','lgname':'ZeroSkills','lgpassword':'ForkedT2000','lgtoken':lt,'format':'json'})

# Get CSRF
csrf = s.get(base, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']

# Edit
s.post(base, data={'action':'edit','title':'PageName','text':'new content','token':csrf,'summary':'edit summary','format':'json'})
```

This avoids the browser session entirely and handles CentralAuth cookies automatically through `requests.Session()`.
