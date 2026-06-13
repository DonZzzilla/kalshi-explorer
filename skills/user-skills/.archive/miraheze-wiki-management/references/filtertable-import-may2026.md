# FilterTable Import Guide — May 2026

## What is FilterTable?

A template system that adds interactive filter buttons above wiki tables. Users can filter rows by category, trader, caliber, tier, etc.

## Required Pages (5 total)

All sourced from `https://dev.miraheze.org`. Each must be imported or manually created:

1. **Template:FilterTable** (270 chars) — wrapper with filter UI container
2. **Template:FilterTable/row** (666 chars) — generates filter buttons per column
3. **Template:FilterTable/styles.css** (870 chars) — button styling (requires TemplateStyles)
4. **Module:Loops** (3226 chars) — Lua module for iterating arguments
5. **Module:Arguments** (10054 chars) — standard Scribunto argument parsing library

## Prerequisites

- **TemplateStyles extension** must be enabled (ManageWiki → Extensions)
- **Import or admin permission** to create Template:/Module: pages
- **Interface admin** to edit `MediaWiki:Common.js`

## Import Methods

### Method 1: Special:Import (easiest, requires import right)
1. Navigate to `Special:Import` on target wiki
2. Scroll to "Import from another wiki"
3. Enter source page: `Template:FilterTable`
4. Interwiki prefix: `dev`
5. Check "Include all templates and transcluded pages"
6. Click Import
7. Repeat for remaining 4 pages

### Method 2: Export XML + Upload
1. `Special:Export` on dev.miraheze.org → add all 5 pages → download XML
2. `Special:Import` on target wiki → upload XML

### Method 3: Manual API creation
1. Navigate to dev.miraheze.org
2. Fetch each page via `/w/api.php?action=parse&page=Title&prop=wikitext`
3. Navigate back to target wiki
4. Create each page via `action=edit`

## Common Wikitext Pattern

```wikitext
{{FilterTable
|table = weapons-table
| {{FilterTable/row|column=Caliber|label=Caliber|all|5.56x45mm|7.62x39mm|9x19mm}}
| {{FilterTable/row|column=Trader|label=Trader|all|Regiment|NTG|ARK}}
|
{| id="weapons-table" class="wikitable sortable"
! Name !! Caliber !! Trader !! Price
|-
| M4A1 || 5.56x45mm || Regiment || 38000
...
|}}
}}
```

## Also Needed

- JS in `MediaWiki:Common.js` (see `references/filtertable-common-js.md`)

## Best Target Tables

- CSEZ Weapons (69+ rows)
- CSEZ Equipment (armor, helmets, backpacks)
- CSEZ Ammo (39 types)
- GoT Weapons (similar size)
- SN Items

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API import returns "nofile" | Use Special:Import browser form, not API |
| CSS shows as raw text | Enable TemplateStyles extension |
| Buttons don't filter | Add JS to Common.js |
| Module errors | Import both Module:Loops AND Module:Arguments |
