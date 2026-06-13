# Quest Objective Wiki-Linking Pattern (June 2026)

## Problem
The Quests page "All Quests" table had ~180 quest rows where the Objectives column contained unlinked item names (weapons, armor, ammo, consumables). Players couldn't click through to see what items they needed.

## Table Format Discovery
The quest table uses **vertical format** — each quest spans 6 lines, not a single `||`-separated line:
```
| style="background-color:#hex;" | [[Trader]]
| #
| [[Quest Name]]
| Location
| • Objective 1<br>• Objective 2
| XP<br>+Rep<br>Koruna<br>[[Reward Item]]<br>...
|-
```

## Solution: Regex-Based Linking with Double-Link Prevention

### Key Technique: `find_link_spans()` + Overlap Filtering

The critical challenge is avoiding double-links when:
1. Some items are already linked in the Rewards column
2. Multiple regex patterns can match at the same position (e.g., "6B47" vs "6B47 Helmet")

```python
def find_link_spans(text):
    """Find all [[...]] link spans as (start, end) tuples."""
    spans = []
    i = 0
    while i < len(text):
        if text[i:i+2] == '[[':
            depth = 1
            j = i + 2
            while j < len(text) - 1 and depth > 0:
                if text[j:j+2] == '[[':
                    depth += 1; j += 2
                elif text[j:j+2] == ']]':
                    depth -= 1; j += 2
                else:
                    j += 1
            if depth == 0:
                spans.append((i, j))
            i = j
        else:
            i += 1
    return spans

def link_text(text, rules):
    link_spans = find_link_spans(text)
    all_matches = []
    for regex, page, display in rules:
        for m in regex.finditer(text):
            if not is_inside_link(m.start(), link_spans):
                all_matches.append((m.start(), m.end(), page, display, m.group(0)))
    # Sort by start, then by length (longest first)
    all_matches.sort(key=lambda x: (x[0], -(x[1] - x[0])))
    # Filter overlapping matches (keep longer ones)
    filtered = []
    used_ranges = []
    for start, end, page, display, matched in all_matches:
        overlaps = any(start < ue and end > us for us, ue in used_ranges)
        if not overlaps:
            filtered.append((start, end, page, display, matched))
            used_ranges.append((start, end))
    # Replace from end to start
    filtered.sort(key=lambda x: x[0], reverse=True)
    result = text
    for start, end, page, display, matched in filtered:
        replacement = '[[' + page + '|' + matched + ']]' if display and display != matched else '[[' + page + ']]'
        result = result[:start] + replacement + result[end:]
    return result
```

### Processing the Vertical Table

```python
# Find table boundaries
for i, line in enumerate(lines):
    if 'id="ft-got-quests"' in line:
        table_start = i
    elif table_start is not None and line.strip() == '|}':
        table_end = i
        break

# Process each quest row (7 lines each: Trader, #, Name, Location, Objectives, Rewards, |-)
modified = 0
i = table_start + 1
while i < table_end:
    line = lines[i]
    if line.startswith('!') or line.startswith('|-'):
        i += 1; continue
    if 'style=' in line and 'background' in line:
        if i + 4 <= table_end:
            obj_idx = i + 4  # Objectives is 5th line
            original = lines[obj_idx]
            new_text = link_text(original, rules)
            if new_text != original:
                lines[obj_idx] = new_text
                modified += 1
        i += 7
    else:
        i += 1
```

## Results
- 107 quest rows modified
- 231 new links added (1333 -> 1564 total)
- 0 double-links after overlap filtering
- Collection table verified: all 71 items match individual quest data
- 69 of 71 items have wiki pages enhanced with Quests sections showing which quests require them