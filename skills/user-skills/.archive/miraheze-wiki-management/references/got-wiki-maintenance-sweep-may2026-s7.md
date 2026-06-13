# Ghosts of Tabor Wiki — Maintenance Sweep Procedure (May 2026 S7)

Bulk corruption sweep of got.miraheze.org, 2026-05-28. Fixed 137 pages with literal `\n` and `Image=File:` corruption.

## Sweep Procedure

### Step 1: Collect all main-namespace pages

```python
import requests, json

base_url = 'https://got.miraheze.org/w/api.php'
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})

# Login
lt = s.get(base_url, params={'action':'query','meta':'tokens','type':'login','format':'json'}).json()['query']['tokens']['logintoken']
s.post(base_url, data={'action':'login','lgname':'ZeroSkills','lgpassword':'ForkedT2000','lgtoken':lt,'format':'json'})
csrf = s.get(base_url, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']

# Collect all pages (batches of 500, use apcontinue for pagination)
all_pages = []
offset = None
while True:
    params = {'action':'query','list':'allpages','aplimit':500,'apnamespace':'0','format':'json'}
    if offset:
        params['apfrom'] = offset
    r = s.get(base_url, params=params).json()
    if 'query' in r:
        all_pages.extend(p['title'] for p in r['query']['allpages'])
    if 'continue' in r and 'apcontinue' in r['continue']:
        offset = r['continue']['apcontinue']
    else:
        break
```

### Step 2: Scan each page for corruption

```python
import re

def scan_page_corruption(content):
    issues = []
    # Literal backslash-n (NOT a real newline)
    stripped = content.replace('\n', '').replace('\r', '')
    if '\\n' in stripped:
        issues.append('literal-backslash-n')
    # Double File: prefix in infobox params
    if 'Image=File:' in content:
        issues.append('Image-File-prefix')
    return issues

pages_to_fix = []
for title in all_pages:
    r = s.get(base_url, params={'action':'parse','page':title,'prop':'wikitext','format':'json'}).json()
    if 'parse' in r:
        content = r['parse']['wikitext']['*']
        issues = scan_page_corruption(content)
        if issues:
            pages_to_fix.append((title, issues))
```

### Step 3: Fix and save

```python
for title, issues in pages_to_fix:
    r = s.get(base_url, params={'action':'parse','page':title,'prop':'wikitext','format':'json'}).json()
    if 'parse' not in r:
        continue
    content = r['parse']['wikitext']['*']
    original = content
    
    if 'literal-backslash-n' in issues:
        content = content.replace('\\n', '\n')
    if 'Image-File-prefix' in issues:
        content = content.replace('Image=File:', 'Image=')
    
    if content == original:
        continue  # Skip if no change (stale detection)
    
    summaries = []
    if 'literal-backslash-n' in issues:
        summaries.append('replace literal \\\\n with newlines')
    if 'Image-File-prefix' in issues:
        summaries.append('remove double File: prefix')
    
    resp = s.post(base_url, data={
        'action': 'edit',
        'title': title,
        'text': content,
        'token': csrf,
        'summary': 'Fix: ' + '; '.join(summaries) + ' (automated maintenance)',
        'format': 'json',
        'bot': '1'
    })
    result = resp.json()
    # Check result['edit']['result'] == 'Success'
```

### Step 4: Verify

Re-scan all fixed pages to confirm no remaining issues. Also spot-check a few pages by viewing their rendered content.

## Results (2026-05-28)

- Total main-namespace pages scanned: 899
- Pages with literal `\n` corruption: 124
- Pages with `Image=File:` double prefix: 13 (subset of the 124)
- Total pages fixed: 137 (some had both issues)
- Success rate: 100% (0 failures)

## False Positives Encountered

### MediaWiki Tracking Categories

- **Special:BrokenRedirects** listed `Category:BOA Hub` as broken, but the redirect to `GoT Wiki Hub` (real page, pageid 4080) works fine. The listing was stale cache from a previous state when it targeted non-existent `Category:Staging`. Fixed by ZeroSkills on 2026-05-28 09:57.
- **Special:DoubleRedirects** listed `Armor` as a double redirect, but `Armor → Equipment` is a single redirect (Equipment is a real page, not a redirect). False positive.
- **Category:Pages with broken file links** listed 16 pages, but all file links on content pages actually resolve. Stale cache.
- **Category:Pages with script errors** listed 25 pages, mostly templates and sandboxes. Content pages affected were due to `{{MessageBox|id=test3}}` template parameter, not content issues.
- **Special:UncategorizedPages** listed 3 pages (FN57 Extended Magazine, Origin 12 Magazine, PPK 20 Magazine), but all have proper categories. Stale cache.

### Key Lesson
**Always verify tracking category entries manually before acting.** MediaWiki's tracking categories are updated on a schedule and frequently lag behind actual page state. A quick API check (`action=parse` + `action=query&prop=categories`) resolves most false positives in seconds.

## Corruption Pattern: Literal `\n`

The literal `\n` corruption is the most common content issue on this wiki. It manifests as:
- Page content contains the two-character sequence `\` + `n` where a real newline should be
- On the wiki, text appears as one continuous paragraph
- The corruption is invisible in the wikitext editor (looks like a normal newline) but the API returns it as `\\n` in Python repr

**Detection is tricky**: Simply searching for `\n` in Python matches real newlines too. You must strip real newlines first:
```python
# WRONG: matches real newlines too
if '\\n' in content:  # This is actually checking for backslash-n in the raw string

# RIGHT: strip real newlines first, then check
stripped = content.replace('\n', '').replace('\r', '')
if '\\n' in stripped:  # Now only matches literal backslash-n
```

**Fix is straightforward**: `content.replace('\\n', '\n')` — in Python source, `'\\n'` is the two-character sequence and `'\n'` is the real newline character.
