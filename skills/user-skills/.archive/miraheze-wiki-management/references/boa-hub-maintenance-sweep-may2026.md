# BOA Hub Wiki — Maintenance Sweep, May 28, 2026

Bulk sweep of boa.miraheze.org for content corruption and categorization issues.

## Results Summary

| Issue | Pages Affected | Fix Applied |
|-------|---------------|-------------|
| Literal `\n` between categories | 5 | Replace `[[Category:X]]\\nCategory:Y` with `[[Category:X]]\n[[Category:Y]]` |
| Duplicate categories | 35 | Remove all but first occurrence of each `[[Category:X]]` |
| Missing `[[Category:Guides]]` | 2 | Add `[[Category:Guides]]` before `[[Category:BOA Hub]]` |
| `Image=File:` double prefix | 0 | N/A |

## Corruption Pattern: `\n` Between Categories (Specific Variant)

A sub-pattern of the general literal `\n` issue (see `got-wiki-maintenance-sweep-may2026-s7.md`):

On affected pages, the API returns:
```
[[Category:BOA Hub]]\\nCategory:Money
```

This is **not** just a missing newline — the `[[...]]` wrapper on the second category is also gone. The fix requires BOTH restoring the newline AND re-wrapping the orphaned category name:

```python
new_content = content.replace('[[Category:BOA Hub]]\\nCategory:', '[[Category:BOA Hub]]\n[[Category:')
```

After this targeted fix, scan for any remaining literal `\n` and replace generically:
```python
stripped = new_content.replace('\n', '').replace('\r', '')
if '\\n' in stripped:
    new_content = new_content.replace('\\n', '\n')
```

### How to distinguish from the general `\n` pattern

The general `\n` pattern replaces ALL newlines in the page content (text appears as one block). The between-categories variant specifically appears at the category declarations at the bottom of the page — the page content itself may look normal, but the category line is corrupted.

### Pages found affected (May 28, 2026)

- `Grenade Guide` — `[[Category:BOA Hub]]\\nCategory:Combat`
- `Insurance Guide` — `[[Category:BOA Hub]]\\nCategory:Money`
- `PvP Combat Guide` — `[[Category:BOA Hub]]\\nCategory:Combat`
- `Quest Stacking Guide` — `[[Category:BOA Hub]]\\nCategory:Money`
- `Trader Leveling Guide` — `[[Category:BOA Hub]]\\nCategory:Money`

All also had duplicate `[[Category:BOA Hub]]` entries (the original AND a correctly-formatted copy on the next line).

## Duplicate Category Removal — Python Method

Every guide page had `[[Category:BOA Hub]]` duplicated. Detection and fix:

```python
import re

cat_pattern = re.compile(r'\[\[Category:([^\]]+)\]\]')
matches = list(cat_pattern.finditer(content))

seen = set()
new_content = content
offset = 0
for m in matches:
    cat_key = m.group(1)  # e.g. "BOA Hub"
    if cat_key in seen:
        # Remove this duplicate occurrence
        start = m.start() + offset
        end = m.end() + offset
        # Also consume preceding newline to avoid blank lines
        if start > 0 and new_content[start-1] == '\n':
            new_content = new_content[:start-1] + new_content[end:]
            offset -= (end - start + 1)
        else:
            new_content = new_content[:start] + new_content[end:]
            offset -= (end - start)
    else:
        seen.add(cat_key)
```

After editing, verify with `action=query&prop=categories` — each category name should appear exactly once.

## Missing Category Detection

Compare page categories against expected sets:
- Guide-type pages should always have `[[Category:Guides]]`
- All content pages should have `[[Category:BOA Hub]]`

Detection:
```python
cats = re.findall(r'\[\[Category:([^\]]+)\]\]', content)
cat_set = set(cats)
if 'Guides' not in cat_set and is_guide_page(title):
    # Add [[Category:Guides]]
    new_content = content.replace('[[Category:BOA Hub]]', '[[Category:BOA Hub]]\n[[Category:Guides]]', 1)
```

### Pages fixed

- `Mall Boss Guide` — added `[[Category:Guides]]` (had Tactics, Maps, BOA Hub)
- `Tactics Guide` — added `[[Category:Guides]]` (had Tactics, BOA Hub)

## False Positives / Not Issues

- Sidebar links to `mainpage`, `recentchanges-url`, `randompage-url`, and `Special:Upload` all show as "missing" in API queries. These are **standard MediaWiki magic words**, NOT broken links. Do not attempt to fix.
