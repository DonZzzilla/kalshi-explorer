# Python Wikitext Building Pitfalls (May 2026)

## The `|`/`}` Problem

When building wiki table wikitext in Python, the `|}` table closing sequence is deceptively dangerous.

### Root Cause

1. **f-strings interpret `}` as a delimiter** — `f"...|}"` causes `SyntaxError: f-string: single '}' is not allowed`
2. **Separate appends create broken closings** — `lines.append("|")` + `lines.append("}")` produces `|\n}` (two lines), which the wiki parser does NOT recognize as a table closing
3. **Cell data from source pages can contain `|}`** — When parsing wiki tables by splitting rows on `\n|-\n` and cells on `||`, the `|}` closing marker from adjacent rows can bleed into the last cell of a row (e.g., a map cell containing `"Metro \n|}"`). If this contaminated data is then inserted into a new table, it prematurely closes it.

### Safe Patterns for Table Closings

```python
# RECOMMENDED: Single combined string
closing = "|" + "}"
table_lines.append(closing)

# ALSO SAFE: chr() escape
table_lines.append("|" + chr(125))
```

### NEVER Do This

```python
# BROKEN — creates two lines, not a table closing
table_lines.append("|")
table_lines.append("}")
```

### Cell Sanitization (When Parsing Source Tables)

```python
# After splitting cells by ||, ALWAYS sanitize:
cells = [c.replace('|}', '').replace('\n|}', '').strip() for c in cells]
```

Without this, a map value like `"Metro \n|}"` gets injected into the cell, which then prematurely closes any master table built from that data.

### Post-Build Validation

Always validate wikitext before POSTing to the wiki:

```python
content = '\n'.join(table_lines)
lines = content.split('\n')

opens = sum(1 for l in lines if l.strip().startswith('{|'))
closes = sum(1 for l in lines if l.strip() == '|}')
assert opens == closes, "Table mismatch: %d opens vs %d closes" % (opens, closes)

# Check no cell content contains bare |}
for i, l in enumerate(lines):
    if '|}' in l and l.strip() != '|}':
        print("WARNING: stray |} in content at line %d: %s" % (i, l[:80]))
```

## Data Validation for Extracted Trades

Source pages can have copy-paste errors (e.g., Neumann's page had `S.D Protector Full Body Armor` listed as **Ammo** type, and 7 ammo rows all with trade cost `"S.D Protector Full Body , Armor"`).

Validate extracted data before using it in a master table:

```python
# Type-value consistency
if b['type'] == 'Ammo' and any(kw in b['item'].lower() for kw in ['armor', 'helmet', 'vest', 'protector']):
    print("WARNING: armor listed as Ammo — skipping: %s" % b['item'][:60])
    continue

# Trade cost sanity for ammo
if b['type'] == 'Ammo' and any(kw in b['trade'].lower() for kw in ['armor', 'protector', 'full body']):
    print("WARNING: copy-paste error in ammo trade cost: %s" % b['trade'][:60])
    continue
```

Flag bad source rows with `<!-- FIXME: correct trade cost unknown -->` on the source page rather than silently dropping them — this makes it visible to the user what needs fixing.

## Incident Reference: Barterable Items Master Page (2026-05-28)

The Barterable Items master page was broken by two issues:
1. Cell data from NTG (map="Metro \n|}") and Boulder Forge (map="N/A \n|}") contained embedded `|}` that prematurely closed the master table at lines 93 and 154 of 213
2. Neumann's source page had 8 invalid rows (armor-as-ammo + copy-paste trade costs) that needed removal

The NTG/Boulder Forge source pages had the `|}` embedded in the raw wikitext at the cell level — not visible when viewing the page, but present in the API parse output. This is why cell sanitization is mandatory.

## Miraheze API — Rate Limiting & Error Handling

When making many API calls in a loop (e.g. checking if pages exist, scanning for broken file links), Miraheze may rate-limit you. The API returns normal JSON but **without a `pages` key** on error responses, causing `KeyError: 'pages'` if your code assumes the key always exists.

### Defensive `check_page_exists` pattern

```python
def check_page_exists(session, base_url, title):
    """Check if a wiki page exists. Returns True/False/None on error."""
    try:
        resp = session.get(base_url, params={
            'action': 'query',
            'titles': title,
            'format': 'json'
        }, timeout=10).json()
        if 'query' not in resp or 'pages' not in resp['query']:
            return None  # rate-limited or error
        for pid, pdata in resp['query']['pages'].items():
            if int(pid) > 0 and 'missing' not in pdata:
                return True
        return False
    except (KeyError, ValueError, requests.RequestException):
        return None
```

### Python Variable Name Collision with `re` Module

When iterating over API results with a variable named `r`, be aware this shadows the imported `re` module:

```python
import re
# ...
for r in result_list:  # ← overwrites `re` module!
    # ...
    pattern = re.escape(r)  # ← NameError: name 're' is not defined
```

**Fix**: Use a different variable name (`page`, `item`, `f` (for filename), etc.):
```python
for fname in broken_files:
    pattern = re.escape(fname)  # ← works fine
    new_content = re.sub(pattern, '', new_content)
```

Or use `import regex as regex_mod` to avoid the collision.

## Broken Table Class Pattern: `{| class="wikitable}`

A systematic wikitext syntax error where the closing `}` immediately follows the closing `"` of a class attribute — `class="wikitable}` instead of `class="wikitable"`. The `}` gets consumed as part of the class attribute value, not as the wikitable delimiter. Tables render as raw wikitext on the page.

**Detection:**
```python
if '{| class="wikitable}' in content:  # missing closing quote before }
    issues.append('broken wikitable class')
```

**Fix:**
```python
content = content.replace('{| class="wikitable}', '{| class="wikitable"')
```

Found on 5 Silent North wiki pages (Fishing, Hunting, Quests, Stamina, Vehicles) — likely from a copy-paste source that used this incorrect pattern. Also check for variants like `class="wikitable sortable}` (missing `"` before `}`).
