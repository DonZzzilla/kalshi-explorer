# GoT Wiki Audit — May 28, 2026 (Session 6)

## Scope
Cron maintenance pass on got.miraheze.org as ZeroSkills. Focus: broken redirects, double redirects, uncategorized pages, BOA program contamination.

## Findings

### Broken Redirects
- **`Category:BOA Hub`** — Was redirecting to non-existent `Category:Staging`. Fixed to redirect to `GoT Wiki Hub`. BOA program contamination artifact.

### Double Redirects
- **`Armor`** — Was a self-referencing redirect: `#REDIRECT [[Armor]]` with stray `[[Armor]]` and `[[Category:Armor]]` lines. Originally (2023-03-29 by Orbb09) redirected to `[[Equipment]]`. The self-redirect was introduced during session 4/5 edits. Fixed by restoring to `#REDIRECT [[Equipment]]`.

**Technique: Detecting self-referencing redirects via API:**
```
action=query&titles=Armor&redirects=1
→ If resolved page title == queried title AND page is a redirect, it's a self-referencing redirect
```
Or simply fetch wikitext and check if `#REDIRECT [[X]]` where X == page title.

### Uncategorized Pages — Clean
0 pages listed. No action needed.

### Uncategorized Categories — Clean
0 categories listed. No action needed.

### BOA Program Contamination
- Only `Category:BOA Hub` found. No About BOA, BOA Ranks, Discord Rules, Team Map, or Hall of Fame pages.

## New Pattern: Redirect Target Corruption

During maintenance passes, redirect targets can get accidentally overwritten. **Always fetch current wikitext before editing redirect pages**, and verify the target matches expectations. The `action=query&redirects=1` parameter resolves the full chain in one call — use it to verify.

## Verification Method for Redirects

To verify any redirect resolves correctly:
```python
resp = s.get(base_url, params={
    'action': 'query', 'titles': 'PageName', 'redirects': '1', 'format': 'json'
})
data = json.loads(resp.text)
resolved = data['query']['pages']
redirects = data.get('redirects', [])
# If redirects[] is non-empty, the chain was followed
# If resolved page title == original title and it has 'redirect' key, check target manually
```

## Summary of Edits
| Page | Before | After | Reason |
|------|--------|-------|--------|
| Armor | `#REDIRECT [[Armor]]` + stray content | `#REDIRECT [[Equipment]]` | Self-referencing redirect bug |
| Category:BOA Hub | `#REDIRECT [[Category:Staging]]` | `#REDIRECT [[GoT Wiki Hub]]` | BOA content to correct destination |
