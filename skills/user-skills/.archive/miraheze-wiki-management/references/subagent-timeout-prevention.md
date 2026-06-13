# Miraheze Wiki Editing: Subagent Timeout Prevention

## The Problem

Subagents (`delegate_task`) have a 600-second (10-minute) timeout. When editing multiple Miraheze wiki pages through subagents, they frequently time out because:

1. Miraheze's shared hosting API is slow (1-5 seconds per request)
2. Each page edit requires 3 API calls: get token → fetch content → post edit
3. Subagents add overhead from tool serialization and model reasoning
4. A batch of 5-10 pages can exceed 600s easily

## The Solution: Main Agent Direct Editing

For Miraheze wiki edits, **do NOT delegate to subagents**. Instead:

1. Do all editing directly in the main agent session
2. Use `browser_console` with sequential JavaScript for batches of 5-15 edits
3. For very large batches (50+ pages), use Python `execute_code` with `requests.Session()`
4. The main agent doesn't have the 600s subagent timeout constraint

## When to Use Subagents for Wiki Work

Subagents are OK for:
- Research tasks (searching, reading, synthesizing)
- Generating wikitext content offline
- Single-page complex edits that don't involve API loops

Subagents should NOT be used for:
- Batch page edits across a wiki
- Any workflow requiring >10 sequential Miraheze API calls
- Cron job wiki maintenance tasks (these run in their own session anyway)

## Python execute_code for Bulk Edits

For the fastest bulk editing, use Python requests via `execute_code`:

```python
import requests, json, time

s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})
base = 'https://csez.miraheze.org/w/api.php'

# Login
lt = s.get(base, params={'action':'query','meta':'tokens','type':'login','format':'json'}).json()['query']['tokens']['logintoken']
s.post(base, data={'action':'login','lgname':'ZeroSkills','lgpassword':'ForkedT2000','lgtoken':lt,'format':'json'})
csrf = s.get(base, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']

# Get all pages
pages = s.get(base, params={'action':'query','list':'allpages','aplimit':500,'format':'json'}).json()['query']['allpages']

# Edit in batches
for p in pages[:20]:
    title = p['title']
    # Fetch content
    d = s.get(base, params={'action':'query','titles':title,'prop':'revisions','rvprop':'content','format':'json'}).json()
    pid = list(d['query']['pages'].keys())[0]
    if 'missing' in d['query']['pages'][pid]:
        continue
    text = d['query']['pages'][pid]['revisions'][0]['*']
    
    # Apply edits...
    new_text = text.replace('old_value', 'new_value')
    if new_text != text:
        s.post(base, data={'action':'edit','title':title,'text':new_text,'token':csrf,'summary':'Plain English summary','format':'json','bot':'1'})
        time.sleep(1)  # Rate limit
```

This approach is 5-10x faster than browser console for bulk operations.