# CSEZ Quest Table Rebuild — June 2026

## Problem: Garbled U+FFFD Character in Table Cells

When inserting `[[Store|Store]]` wikilinks into table cells via regex replacement, a U+FFFD (replacement character) sometimes appears between `]]` and the next `|`. This causes:

1. The `#` column cell to disappear (content merges with next cell)
2. Quest Name and Phase cells collapse onto one line
3. FilterTable column indexing breaks (rows have 7-8 cells instead of 9)
4. Phase color replacement fails because Phase isn't on its own line

**Example of garbled output:**
```
| style="background-color:#824b39;" | [[Taste of Life I (Igor)|Taste of Life I]]�| style="background-color:#824b39;" | Early
```

**Root cause:** The `write_file` tool and some regex replacement paths introduce U+FFFD when MediaWiki pipe characters interact with wikilink brackets during string interpolation.

## Solution: Rebuild from Scratch

When table structure is corrupted, **do not attempt to patch**. Instead:

1. **Extract all quest data from the rendered DOM** (browser JS) or from the individual quest pages
2. **Generate clean wikitext from scratch** using Python string formatting
3. **Verify zero U+FFFD chars** before submitting: `text.count('\uffffd')` must be 0
4. **Verify cell count**: every quest row must have exactly 9 cells

## Correct Ammo-Style Pattern (Verified June 2026)

Every cell in a row gets the trader's background color EXCEPT the Phase cell, which gets its own distinct color:

```python
trader_colors = {
    'ARK': '#385c79', 'NTG': '#2e5c30', "TRUPIK'S": '#903e90',
    'Regiment': '#824b39', 'Boulder Forge': '#782c11',
}
phase_colors = {
    'Early': '#3d7a3d',   # forest green
    'Mid':   '#8a8a1e',   # olive/yellow-green
    'Late':  '#b8860b',   # dark goldenrod
}

# Per row:
table += f'| style="background-color:{tc};" | [[{store}|{store}]]\n'  # Trader
table += f'| style="background-color:{tc};" | {num}\n'               # #
table += f'| style="background-color:{tc};" | [[{page}|{display}]]\n' # Quest Name
table += f'| style="background-color:{pc};" | {phase}\n'             # Phase (distinct!)
table += f'| style="background-color:{tc};" | {objectives}\n'         # Objectives
# ... remaining cells all use tc
```

## Black Divider Rows

Between trader groups, insert a 9-cell row with `#000000`:
```python
table += '|-\n'
for c in range(9):
    table += '| style="background-color:#000000;" |\n'
```

## Verification Checklist

After generating wikitext, verify:
- `text.count('\uffffd') == 0` (no garbled chars)
- Every quest row has exactly 9 cells
- All trader names link: `[[ARK|ARK]]`, `[[NTG|NTG]]`, etc.
- All quest names link: `[[Quest Name (Trader)|Quest Name]]`
- Phase cells use phase_colors (not trader colors)
- 4 black divider rows between 5 trader groups
- FilterTable `|table=` matches table `id=`
- Column indices: Trader=1, #=2, QuestName=3, Phase=4, Objectives=5, Location=6, Type=7, Rewards=8, Notes=9

## DOM Verification (Browser JS)

```javascript
const tbl = document.querySelector('#ft-quests');
const rows = tbl.querySelectorAll('tr');
let byCount = {};
for (const r of rows) {
    const cells = r.querySelectorAll('td');
    if (cells.length === 0) continue;
    const isDiv = cells[0].style.backgroundColor === 'rgb(0, 0, 0)';
    const c = isDiv ? 'divider' : cells.length;
    byCount[c] = (byCount[c]||0)+1;
}
// Expected: {9: 97, divider: 4}
// Any other cell count means structural damage
```
