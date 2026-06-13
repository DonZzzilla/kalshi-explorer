# CSEZ Wiki — Python API Bulk Page Creation

Created 2026-06-03. Reliable pattern for creating many wiki pages via Python requests.

## Key Learnings

### Miraheze Blocks Default User Agents

Miraheze returns 403 for default Python requests user agents. MUST set custom UA:

```python
s = requests.Session()
s.headers["User-Agent"] = "CSEZWikiBot/1.0 (Hermes Agent; contact: donzzzilla@gmail.com)"
```

### Login Flow

```python
WIKI_URL = "https://csez.miraheze.org/w/api.php"
USER = "ZeroSkills"
PASS = "ForkedT2000"

s = requests.Session()
s.headers["User-Agent"] = "CSEZWikiBot/1.0 (Hermes Agent; contact: donzzzilla@gmail.com)"

# Get login token
r = s.get(WIKI_URL, params={"action": "query", "meta": "tokens", "type": "login", "format": "json"})
token = r.json()["query"]["tokens"]["logintoken"]

# Login
r = s.post(WIKI_URL, data={"action": "login", "lgname": USER, "lgpassword": PASS, "lgtoken": token, "format": "json"})
# Check: r.json()["login"]["result"] == "Success"

# Get CSRF token for editing
def get_csrf():
    r = s.get(WIKI_URL, params={"action": "query", "meta": "tokens", "type": "csrf", "format": "json"})
    return r.json()["query"]["tokens"]["csrftoken"]

# Create/edit page
r = s.post(WIKI_URL, data={
    "action": "edit",
    "title": "Page Title",
    "text": page_content,
    "token": get_csrf(),
    "summary": "Edit summary",
    "format": "json",
    "bot": True
})
```

### Session Expiry

Sessions expire frequently during long editing sessions. If edits start failing, re-login. The login token endpoint always works even when session is expired.

### SUL3 Cross-Wiki

Login on one Miraheze wiki carries to all others via SUL3. But the Python session object is domain-specific — you need separate Session objects per wiki domain, or re-login on each domain.

### Variable Collision in Browser Console

When using browser_console fetch() multiple times, `const`/`let` variables persist. Use `var` or unique names per call.

### URLSearchParams for POST

In browser console, `FormData` is NOT available. Use `URLSearchParams` instead:

```javascript
var p = new URLSearchParams();
p.append('action', 'edit');
p.append('title', 'PageName');
p.append('text', content);
p.append('token', csrf);
fetch('/w/api.php', {method: 'POST', body: p, credentials: 'include'})
```

### Discord Message Length Limit

Discord has 2000 character limit per message. Split long responses into multiple sends.
