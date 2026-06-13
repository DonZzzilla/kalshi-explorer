# FilterTable Deployment — Complete Pitfalls & Solutions (May 2026)

## What FilterTable Does
Adds interactive filter buttons above wiki tables so users can filter rows by column values (tier, type, caliber, trader, etc.).

## Required Components (5 pages, import from dev.miraheze.org)

1. **Template:FilterTable** — wrapper div with `data-table-id`
2. **Template:FilterTable/row** — generates filter buttons per column
3. **Template:FilterTable/styles.css** — button styling (requires TemplateStyles extension)
4. **Module:Loops** — Lua module for iterating numbered arguments
5. **Module:Arguments** — standard Scribunto argument parsing

**Also requires in Common.js:** `mw.loader.load("https://cdn.jsdelivr.net/gh/lihaohong6/MirahezeDevScripts@dist/dist/FilterTable/gadget-impl.js");`

## Critical Pitfall #1: `{{FilterTable}}` Requires `|table=ID` Parameter

**Wrong:** `{{FilterTable}}`
**Right:** `{{FilterTable|table=uniqueTableId}}`

## Critical Pitfall #2: Table Must Have Matching `id=`

**Wrong:** `{| class="sortable mw-collapsible wikitable"`
**Right:** `{| id="uniqueTableId" class="sortable mw-collapsible wikitable"`

## Critical Pitfall #3: FilterTable/row Requires `queryN=` Named Parameters

The row template uses `{{{queryINDEX|}}}` for the filter query value. Without `queryN=`, `data-query` is empty.

**Wrong:** `{{FilterTable/row|column=1|label=Tier:|S|A|B}}`
**Right:** `{{FilterTable/row|column=1|label=Tier:|query1=S|query2=A|query3=B|S|A|B}}`

Numbered args = display text. `queryN` args = filter values matched against cell content.

## Critical Pitfall #4: Content Must Be Passed as `|1=` Parameter

The `{{{1|}}}` in FilterTable captures the first unnamed parameter. Content between `{{FilterTable}}` and `{{/FilterTable}}` is NOT automatically captured. Must use explicit `|1=` syntax.

**Wrong (renders empty wrapper):**
```
{{FilterTable|table=ft1}}
{{FilterTable/row|column=1|label=Tier:|query1=S|S}}
{{/FilterTable}}
```

**Right:**
```
{{FilterTable|table=ft1|1=
{{FilterTable/row|column=1|label=Tier:|query1=S|S}}
}}
```

**Python fix for existing pages:**
```python
import re
pattern = r'\{\{FilterTable\|table=([^}]+)\}\}\n((?:\{\{FilterTable/row[^}]*\}\}\n?)+)\{\{/FilterTable\}\}'
def replace_block(m):
    table_id = m.group(1)
    rows = m.group(2).strip()
    return f'{{{{FilterTable|table={table_id}|1=\n{rows}\n}}}}'
new_wt = re.sub(pattern, replace_block, wt)
```

## Critical Pitfall #5: No Table Markup Inside Filter Wrapper

Only `{{FilterTable/row}}` calls go between `{{FilterTable}}` and `{{/FilterTable}}`. `|+` and `|-` render as raw text.

## Critical Pitfall #6: Citizen Skin JS Loading Timing

On Citizen skin, `mw.hook("wikipage.content")` fires before the async gadget loads. Buttons render but clicks don't filter.

**Vector skin works correctly** — confirmed on got.miraheze.org (May 31, 2026).

## Critical Pitfall #7: Common.js Duplication

Multiple regex edits to Common.js can create duplicate functions/syntax errors. If in doubt, rewrite from scratch.

## Critical Pitfall #8: Section Header Matching

Headers vary: `==Section==`, `===Section===`, `=='''Bold'''==`, `==[[Link]]==`. Try multiple patterns. Use `re.findall(r'^={2,4}\s*([^=].*?)\s*={2,4}$', wt, re.MULTILINE)`.

## Critical Pitfall #9: Check for Existing FilterTable Before Adding

Always check `if 'FilterTable' not in wt[sec_pos:table_pos]` before inserting. Duplicate wrappers break rendering.

## Complete Working Pattern

```wikitext
{{FilterTable|table=ft-search|1=
{{FilterTable/row|search=true|label=Search:}}
}}

{| id="ft-search" class="sortable mw-collapsible wikitable floatheader"
|+ Caption
! Name !! Price !! Type
|-
| Example || 1000 || Weapon
|}
```

## Critical Pitfall #10: Default CSS Selected-State Is Too Subtle

The default `Template:FilterTable/styles.css` has nearly invisible selected-state styling:
```css
.filter-button.button-selected {
    background-color: var(--background-color-interactive-subtle--active, #dadde3);
    box-shadow: inset 0 4px 5px rgba(0, 0, 0, .05);
}
```
Users **cannot reliably tell** which filters are toggled on. The visual difference is barely perceptible.

**✅ ALWAYS deploy the improved CSS below** — gradient + glow + bold + 1.5× search box height:
```css
.filter-row,
.filter-search {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin: 8px 0;
}

.filter-row.extra-line-height {
    line-height: 2em;
}

.filter-button {
    background-color: var(--background-color-base, #fff);
    color: var(--color-base, #202122);
    border: 1px solid var(--color-subtle, #54595d);
    border-radius: 4px;
    padding: 4px 8px;
    transition: background-color 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.filter-button:hover {
    cursor: pointer;
    background-color: var(--background-color-interactive-subtle--hover, #eaecf0);
}

.filter-button.button-selected {
    background-image: linear-gradient(180deg,
        rgba(40,100,220,0.22) 0%,
        rgba(40,80,180,0.34) 100%);
    background-color: var(--background-color-interactive-subtle--active, #dadde3);
    border-color: rgba(35,90,200,0.55);
    border-width: 2px;
    padding: 3px 7px;
    box-shadow:
        inset 0 0 6px 1px rgba(40,100,220,0.18),
        0 0 0 1px rgba(40,100,220,0.10),
        0 0 10px 2px rgba(40,90,210,0.25);
    color: var(--color-emphasized, #000);
    font-weight: 600;
}

@media screen and (prefers-color-scheme: dark) {
    .filter-button.button-selected {
        background-image: linear-gradient(180deg,
            rgba(255,205,60,0.18) 0%,
            rgba(225,170,30,0.28) 100%);
        border-color: rgba(230,175,40,0.55);
        box-shadow:
            inset 0 0 6px 1px rgba(255,205,60,0.16),
            0 0 0 1px rgba(255,205,60,0.10),
            0 0 10px 2px rgba(240,180,40,0.22);
    }
}

.filter-search input {
    padding: 8px 10px;
    height: 2.1em;
    line-height: 1.4;
    font-size: inherit;
    width: 200px;
    box-sizing: border-box;
    border-radius: 4px;
}
```

**Key improvements:**
- Selected buttons: blue gradient overlay + triple-layer glow + bold text + thicker border
- Dark mode: gold gradient variant for visibility on dark skins
- Search box: 1.5× height (padding 4px → 8px 10px, explicit height 2.1em)
- All changes use CSS custom properties for skin compatibility

**⚠️ Must deploy this CSS to ALL wikis** — each wiki has its own `Template:FilterTable/styles.css` page. Navigate to each wiki domain separately (cross-origin fetch blocked).

```javascript
var w = document.querySelector('.filter-wrapper');
var t = document.getElementById(w.getAttribute('data-table-id'));
var dt = jQuery(t).DataTable();
var buttons = document.querySelectorAll('.filter-button');
var inputs = document.querySelectorAll('.filter-search input');
// dt should be truthy, buttons.length > 0, inputs.length > 0
// Test: dt.column(0).search('text').draw() should filter rows
```
