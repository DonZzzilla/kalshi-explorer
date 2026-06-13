# Wikitext Quest Name Replacement — Pitfalls & Patterns

Created 2026-06-03 after bulk-linking quest names on CSEZ store pages.

## Pitfall 1: No Space After `|`

Wiki table cells use `|QuestName` (no space) not just `| QuestName`. Check both.

## Pitfall 2: Partial Match Cascading (Roman Numerals)

"Recon I" matches inside "Recon II"/"Recon III". Sorting longest-first is NOT sufficient.
Fix with explicit cleanup:
```python
content = content.replace("]]I ", "]] ").replace("]]I]]", "]]]]")
```

## Pitfall 3: Already-Linked Quests Create Double-Wraps

`[[Task:Handshake|Handshake]]` → replacing "Handshake" inside creates broken double-wrap.
Fix: skip lines with existing `[[]]`, then cleanup with regex:
```python
content = re.sub(r'\[\[[^:]+:\[\[([^|]+)\|([^]]+)\]\]\|\[\[[^|]+\|([^]]+)\]\]\]\]', r'[[\1|\2]]', content)
```

## Pitfall 4: Multiple Tables — Track Table Depth

```python
table_depth = 0
for line in lines:
    if '{|' in line: table_depth += 1
    if line.strip() == '|}': table_depth -= 1
    if table_depth == 1 and is_data_cell(line):  # Only first table
```

## Pitfall 5: Store Name vs Person Name

CSEZ wiki uses store names (Regiment, NTG, TRUPIK'S, ARK, Boulder Forge) as primary pages.
Person names redirect. Quest "See Also" links must use store names.

## Two-Pass Strategy

Pass 1: Replace plain-text cells only (no existing `[[]]`)
Pass 2: Fix double-wraps with cleanup regex
