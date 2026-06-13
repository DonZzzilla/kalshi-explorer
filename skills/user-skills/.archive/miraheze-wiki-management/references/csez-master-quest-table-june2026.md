# CSEZ Master Quest Table — June 2026

## What was done

Replaced the Quests page with an Ammo-style FilterTable: one unified table with trader-colored rows, black divider rows between groups, and full column filters (Trader, Phase, Type, Search).

## Page Structure

**FilterTable template** above the table provides:
- **Reset all** button
- **Trader:** exact-match filter (ARK / NTG / TRUPIK'S / Regiment / Boulder Forge)
- **Phase:** exact-match filter (Early / Mid / Late)
- **Type:** contains filter (PMC / Scav / Any)
- **Search:** free-text across all columns
- **Counter:** "Showing X of 97 quests"

**Table columns:** Trader, #, Quest Name, Phase, Objectives, Location, Type, Rewards, Notes

**Table class:** `sortable mw-collapsible fandom-table floatheader` (NOT wikitable — matches Ammo page)

## Row Coloring by Trader

Every cell in a quest row gets `style="background-color:#hex;"` with the trader's color:

| Trader | Color | Hex | RGB |
|--------|-------|-----|-----|
| ARK (Tommy) | Blue | `#385c79` | rgb(56,92,121) |
| NTG (Maggie) | Green | `#2e5c30` | rgb(46,92,48) |
| TRUPIK'S (Johnny) | Purple | `#903e90` | rgb(144,62,144) |
| Regiment (Igor) | Brown | `#824b39` | rgb(130,75,57) |
| Boulder Forge (Maximilian) | Dark Red | `#782c11` | rgb(120,44,17) |

## Black Divider Rows

Between each trader group, insert a row with 9 cells all `style="background-color:#000000;"`:
```wikitext
|-
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
| style="background-color:#000000;" |
```

No divider before the first trader group.

## Phase Classification

Quest position within each trader's list:
- First third → Early
- Middle third → Mid
- Last third → Late

## Trader Column Uses Store Names

The Trader column contains STORE NAMES (ARK, NTG, TRUPIK'S, Regiment, Boulder Forge) — not person names (Tommy, Maggie, etc.). This matches the filter button labels so `mode=exact` filtering works.

## Python Construction Pattern

```python
# Parse existing Quests page wikitext
# Split on |- to get rows
# Extract cells from each row (handle style attributes)
# Group quests by trader

# Build new wikitext
new_page = """== All Quests ==

{{FilterTable
|table=ft-quests
|1=
{{FilterTable/row|reset=true}}
{{FilterTable/row|column=1|label=Trader:|all=true|mode=exact|1=ARK|2=NTG|3=TRUPIK'S|4=Regiment|5=Boulder Forge}}
{{FilterTable/row|column=4|label=Phase:|all=true|mode=exact|1=Early|2=Mid|3=Late}}
{{FilterTable/row|column=7|label=Type:|all=true|mode=contains|1=PMC|2=Scav|3=Any}}
{{FilterTable/row|search=true|label=Search:}}
<div>Showing <span class="filter-counter"></span> of <span class="filter-counter-total"></span> quests.</div>
}}

"""

# Table with matching id
table = '{| id="ft-quests" class="sortable mw-collapsible fandom-table floatheader"\n'
table += '! Trader !! # !! Quest Name !! Phase !! Objectives !! Location !! Type !! Rewards !! Notes\n'

for trader in trader_order:
    if not first_trader:
        # Black divider row
        table += '|-\n'
        for _ in range(9):
            table += '| style="background-color:#000000;" |\n'
    first_trader = False
    
    for quest in quests:
        table += '|-\n'
        for cell_content in [store_name, quest.num, quest.name, ...]:
            table += f'| style="background-color:{color};" | {cell_content}\n'

table += '|}\n'
```

## Verification Commands (Browser Console)

```javascript
// Check divider rows + trader colors
(() => {
    const tbl = document.querySelector('table');
    const rows = tbl.querySelectorAll('tr');
    let dividers = 0;
    let traders = {};
    for (const r of rows) {
        const cells = r.querySelectorAll('td');
        if (cells.length > 0) {
            const bg = cells[0].style.backgroundColor;
            const t = cells[0].textContent.trim();
            if (t) { traders[t] = {count: (traders[t]?.count||0)+1, color: bg}; }
            if (bg === 'rgb(0, 0, 0)') dividers++;
        }
    }
    return JSON.stringify({dividers, traders});
})()
```

Expected: 4 dividers, 5 traders each with correct count and color.

## Counts

- Tommy (ARK): 25 quests
- Maggie (NTG): 22 quests
- Johnny (TRUPIK'S): 6 quests
- Igor (Regiment): 21 quests
- Maximilian (Boulder Forge): 23 quests
- Total: 97 quests, 4 black divider rows
