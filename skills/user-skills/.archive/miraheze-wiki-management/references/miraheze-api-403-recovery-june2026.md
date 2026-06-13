# Miraheze API Session Expiry & 403 Errors

## Symptoms

- API calls start returning HTTP 403 Forbidden mid-session
- Affects both read (query) and write (edit) operations
- Even `action=query&meta=siteinfo` returns 403 when the session is dead
- The session may have been alive for hours, then suddenly dies

## Cause

Miraheze API sessions expire. The exact timeout is not documented but can be as short as 30-60 minutes of inactivity. Cross-wiki operations accelerate expiry.

## Solution

Re-login using the standard Two-Step Login flow:

```python
import urllib.request, urllib.parse, json, http.cookiejar, ssl

cj = http.cookiejar.CookieJar()
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cj),
    urllib.request.HTTPSHandler(context=ctx))
opener.addheaders = [('User-Agent', 'Mozilla/5.0')]

# Step 1: Get login token
params = urllib.parse.urlencode({"action":"query","meta":"tokens","type":"login","format":"json"})
data = json.loads(opener.open(f"https://WIKI/w/api.php?{params}", timeout=15).read())
login_token = data["query"]["tokens"]["logintoken"]

# Step 2: Login
login_data = urllib.parse.urlencode({
    "action":"login","lgname":"ZeroSkills","lgpassword":"ForkedT2000",
    "lgtoken":login_token,"format":"json"
}).encode()
result = json.loads(opener.open("https://WIKI/w/api.php", data=login_data, timeout=15).read())
assert result["login"]["result"] == "Success"

# Step 3: Get CSRF token for editing
params = urllib.parse.urlencode({"action":"query","meta":"tokens","format":"json"})
data = json.loads(opener.open(f"https://WIKI/w/api.php?{params}", timeout=15).read())
csrf_token = data["query"]["tokens"]["csrftoken"]
```

## Prevention

- Check session status before large batches: fetch a small page first
- If 403, re-login immediately and retry
- SUL3 means one login covers all Miraheze wikis
- Build retry logic into scripts: catch 403 → re-login → retry up to 3 times
