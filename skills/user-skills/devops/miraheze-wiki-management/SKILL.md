---
name: miraheze-wiki-management
description: "Edit and maintain MiraHeze wikis via the MediaWiki API. Trigger: user asks to edit, create, or maintain pages on any MiraHeze wiki."
version: 1.0.0
author: OWL
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [wiki, miraheze, mediawiki, api, editing, maintenance]
    related_skills: [discord-bot-builder]
---

# MiraHeze Wiki Management

Edit and maintain MiraHeze-hosted wikis via the MediaWiki API.

## Credentials

Wiki credentials are stored in the Hermes config/env or memory. Always check memory for current credentials before asking the user. Common pattern: `ZeroSkills` / `ForkedT2000`.

**Never ask for credentials if they are already stored in memory or config.**

## Wiki Endpoint Pattern

Each wiki has its own base URL:
- GoT: `https://got.miraheze.org/w/api.php`
- CSEZ: `https://csez.miraheze.org/w/api.php`
- BOA: `https://boa.miraheze.org/w/api.php`
- SilentNorth: `https://silentnorth.miraheze.org/w/api.php`

## Login + Edit Workflow

Use Python with `urllib.request` and `http.cookiejar` (not `requests` — handles auth redirects better):

```python
import urllib.request, urllib.parse, json, http.cookiejar

BASE = "https://<wiki>.miraheze.org/w/api.php"
USER = "ZeroSkills"
PASS = "ForkedT2000"

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
opener.addheaders = [("User-Agent", "OWL/1.0")]

def api_get(params):
    url = BASE + "?" + urllib.parse.urlencode({**params, "format": "json"})
    return json.loads(opener.open(url, timeout=10).read())

def api_post(data):
    data["format"] = "json"
    body = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(BASE, data=body)
    return json.loads(opener.open(req, timeout=10).read())

# Step 1: Login
login_token = api_get({"action": "query", "meta": "tokens", "type": "login"})["query"]["tokens"]["logintoken"]
result = api_post({"action": "login", "lgname": USER, "lgpassword": PASS, "lgtoken": login_token})
assert result["login"]["result"] == "Success", f"Login failed: {result}"

# Step 2: Get CSRF token
csrf_token = api_get({"action": "query", "meta": "tokens", "type": "csrf"})["query"]["tokens"]["csrftoken"]

# Step 3: Edit a page
edit_result = api_post({
    "action": "edit",
    "title": "Page Title",
    "text": "New wikitext content",
    "token": csrf_token,
    "summary": "Edit summary here",
    "bot": "1"
})
assert edit_result.get("edit", {}).get("result") == "Success"
```

## Getting Page Content

```python
def get_wikitext(title):
    data = api_get({"action": "parse", "page": title, "prop": "wikitext"})
    return data["parse"]["wikitext"]["*"]
```

## Checking if a Page Exists

```python
def page_exists(title):
    data = api_get({"action": "query", "titles": title})
    pages = data["query"]["pages"]
    for id, p in pages.items():
        if "missing" in p:
            return False
    return True
```

## Common Edit Patterns

### Linking plain text to wiki pages
```python
# Replace |BossName\n with |[[BossName|BossName]]\n
text = text.replace("|Skull\n", "|[[Skull|Skull]]\n")
text = text.replace("|Ravager\n", "|[[Ravager|Ravager]]\n")
```

### Adding a line to a section
```python
old = "== Bosses ==\n* [[Iron Wolf]]"
new = "== Bosses ==\n* [[Ravager]] - Spawns at Trupik's Mall\n* [[Iron Wolf]]"
text = text.replace(old, new)
```

### Replacing a broken template call with a link
```python
# {{Main|Quests}} where Quests page does not exist yet
text = text.replace("{{Main|Quests}}", "[[Quests]]")
```

### Creating a "Main article" template (Template:Main)
```python
template_text = """<div style="background:#1a1a2e;border:1px solid #00f0ff;border-radius:8px;padding:0.8rem 1.2rem;margin:0.5rem 0 1rem 0;font-size:0.9rem;">
'''Main article: [[{{{1|}}}]]'''
</div>
<noinclude>[[Category:Templates]]</noinclude>"""
```

### Creating a navigation template
```python
# Links related pages together in a navbox
template_text = """<div style="background:#16161f;border:1px solid #ff00aa;border-radius:8px;padding:1rem;margin:0.5rem 0 1rem 0;">
<div style="color:#ff00aa;font-weight:bold;margin-bottom:0.5rem;">NAVIGATION</div>
<div style="display:flex;flex-wrap:wrap;gap:0.8rem;font-size:0.8rem;">
<div>[[Page A]]</div><div>[[Page B]]</div><div>[[Page C]]</div>
</div>
</div>
<noinclude>[[Category:Templates]]</noinclude>"""
```

### Creating a content page from scratch
When creating a new page that other pages link to:
1. Check if the page exists first with `page_exists(title)`
2. If not, create it with meaningful content — never leave it as a stub
3. Include `[[Category:X]]` at the bottom
4. Cross-link to/from related pages

## Verifying Edits

After editing, navigate to the page in the browser and verify:
1. The edit appears in the page content
2. Links work (click them — should not be red)
3. Templates render properly (no raw `Template:X` text)
4. Categories appear at the bottom

## Pitfalls

- **Always verify page existence before editing a link target.** A `[[BossName]]` link to a non-existent page shows as red. Create the page first or use a redirect.
- **Template parameters use triple braces: `{{{1|}}}`.** Double braces `{{ }}` invoke a template; triple braces `{{{ }}}` access parameters within a template.
- **`{{Main|X}}` requires Template:Main to exist.** If the template does not exist, it shows as a red link. Either create the template or replace the call with a direct `[[X]]` link.
- **Wiki text is case-sensitive.** `[[Boss]]` and `[[boss]]` are different pages.
- **The `bot` flag hides edits from Recent Changes.** Use `"bot": "1"` for bulk/maintenance edits.
- **Write multi-step edit scripts to `/tmp/` and run via `terminal`.** Clean up temp files after.
