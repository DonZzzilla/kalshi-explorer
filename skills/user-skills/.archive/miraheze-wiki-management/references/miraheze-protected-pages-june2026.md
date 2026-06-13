# Protected MediaWiki System Pages

## Problem

Some `MediaWiki:` namespace pages are protected and cannot be edited via the browser. The edit form shows:

> "You do not have permission to edit this page, for the following reasons:
> The action you have requested is limited to users in one of the groups: Bureaucrats, Confirmed users, Users"

The page source is visible (read-only textbox), but the save button doesn't work.

## Affected Pages (Miraheze/GoT Wiki)

- `MediaWiki:Cosmos.css` — Cosmos skin CSS (protected)
- `MediaWiki:Common.js` — Common JS (protected, needs `editinterface` right)
- `MediaWiki:Sidebar` — Sidebar configuration (may be protected)

## Solution

Use the **Python requests API** with admin credentials (ZeroSkills account has admin rights on GoT wiki):

```python
import requests

session = requests.Session()
session.headers.update({"User-Agent": "wiki-scripts/1.0", "Accept": "application/json"})
API = "https://got.miraheze.org/w/api.php"

# Login
r = session.get(API, params={"action":"query","meta":"tokens","type":"login","format":"json"})
lt = r.json()["query"]["tokens"]["logintoken"]
r = session.post(API, data={"action":"login","lgname":"ZeroSkills","lgpassword":PASSWORD,"lgtoken":lt,"format":"json"})
assert r.json()["login"]["result"] == "Success"

# Get CSRF token
r = session.get(API, params={"action":"query","meta":"tokens","type":"csrf","format":"json"})
csrf = r.json()["query"]["tokens"]["csrftoken"]

# Get current content
r = session.get("https://got.miraheze.org/w/index.php", params={"title":"MediaWiki:Cosmos.css","action":"raw","ctype":"text/css"})
css = r.text

# ... modify css ...

# Save edit (use "bot":"1" flag to mark as bot edit)
r = session.post(API, data={"action":"edit","title":"MediaWiki:Cosmos.css","text":new_css,"token":csrf,"summary":"Edit summary","bot":"1","format":"json"})
assert r.json()["edit"]["result"] == "Success"
```

## Browser Workaround

If you must use the browser:
1. Navigate to `?action=edit` to get the CSRF token and content
2. But you **cannot save** — the page is protected
3. Use `browser_console` fetch() POST instead — but this also won't work if your account lacks the rights

**The Python API approach with ZeroSkills credentials is the only reliable method for protected pages.**
