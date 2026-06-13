# Changelog Wikikitext Save Fix — June 2026

## Problem

When the bot's scraper detects a new build and updates the wiki changelog page, it must also save the full wiki wikitext to `/tmp/changelog_wikitext.txt` so that `changelog_sync.py` can regenerate the HTML and push to GitHub.

The wikitext save code was inside the `if patch_wiki:` block, meaning it only ran when `parse_got_patch_notes()` returned something. If the saved message had no recognizable sections, the wikitext was never saved, and `changelog_sync.py` used stale data.

## Fix

Move the wikitext save **outside** the `if patch_wiki:` block so it runs unconditionally after every successful build detection:

```python
# Parse patch notes from saved message and update changelog
try:
    with open("/home/donzzz/projects/got-patch-bot/last_got_message.txt") as f:
        msg_content = f.read()
    hotfix_num = None
    import re as _re
    m = _re.search(r'[Hh]otfix\s*#?(\d+)', msg_content)
    if m: hotfix_num = m.group(1)
    patch_wiki = parse_got_patch_notes(msg_content, build, hotfix_num)
    if patch_wiki:
        update_got_changelog(build, patch_wiki)
except Exception as e:
    log("GOT changelog parse error: %s" % e)

# Save full wiki changelog wikitext for changelog_sync.py (ALWAYS, after any wiki update)
try:
    import requests as _req
    wiki_api = "https://got.miraheze.org/w/api.php"
    r = _req.get(wiki_api, params={"action":"parse","page":"Changelog","prop":"wikitext","format":"json"}, timeout=15)
    wt = r.json().get("parse",{}).get("wikitext",{}).get("*","")
    if wt:
        with open("/tmp/changelog_wikitext.txt","w") as _f:
            _f.write(wt)
        log("Saved changelog wikitext for sync (%d chars)" % len(wt))
except Exception as _e:
    log("Changelog wikitext save error: %s" % _e)
```

## Verification

After a build update:
1. Check `/tmp/changelog_wikitext.txt` exists and has recent content
2. Run `python3 /home/donzzz/projects/got-patch-bot/changelog_sync.py` manually
3. Verify GitHub Pages updated with new entry
