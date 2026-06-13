# site.sty CSS Loading Order — Why Cosmos.css Overrides Fail

## The Cascade Problem

On Miraheze wikis using Cosmos skin, CSS loads in this order:

1. `MediaWiki:Common.css` (via `site.sty` load.php module)
2. `MediaWiki:Cosmos.css` (via `cosmos` skin load.php module)
3. TemplateStyles CSS (e.g., `Template:FilterTable/styles.css`)

**The critical issue:** `site.sty` (Common.css) loads AFTER `cosmos.css` (skin CSS). When both use `!important`, the later-loaded stylesheet wins due to source order.

## Specific Example

`site.sty` contains:
```css
table, .mw-parser-output table, .wikitable, .infobox, .sortable {
    background: rgb(220, 220, 229);  /* light blue-gray */
    ...
}
th, .mw-parser-output th, .wikitable th, .infobox th, .sortable th {
    background: rgb(220, 220, 229);
    color: rgb(0, 31, 125);  /* dark blue */
    ...
}
```

Even if `cosmos.css` has:
```css
body.theme-light .wikitable {
    background-color: var(--dark-bg-panel) !important;
}
```

The `site.sty` rule for plain `table` or `.sortable` (without `.wikitable`) still wins because:
1. The selector `table` in `site.sty` matches
2. Both have `!important`
3. `site.sty` loads later → wins

## The Fix

Use MORE SPECIFIC selectors in Cosmos.css that cover ALL table types:

```css
/* NOT just .wikitable — cover everything */
body.theme-light table,
body.theme-light .mw-parser-output table,
body.theme-light table.wikitable,
body.theme-light .sortable,
body.theme-light .fandom-table,
body.theme-light .floatheader,
body.theme-light table.sortable,
body.theme-light table.fandom-table {
    background-color: var(--dark-bg-panel) !important;
    color: var(--dark-text-primary) !important;
    border-color: var(--dark-border) !important;
}

/* Same for th and td — cover all variants */
body.theme-light table th,
body.theme-light .mw-parser-output table th,
body.theme-light .wikitable th,
body.theme-light .sortable th,
body.theme-light .fandom-table th,
body.theme-light .floatheader th {
    background-color: var(--dark-bg-secondary) !important;
    color: var(--dark-link) !important;
    border-color: var(--dark-border) !important;
    border-bottom: 2px solid var(--dark-link) !important;
}
```

## Key Takeaway

When writing dark mode CSS for Cosmos skin:
- **Always** use `body.theme-light` prefix (not just the class alone)
- **Always** cover ALL table variants: `table`, `.wikitable`, `.sortable`, `.fandom-table`, `.floatheader`, `.infobox`
- **Always** use `!important` on every property
- **Always** check `site.sty` content first to know what you're overriding
- **Always** check for separate TemplateStyles CSS pages that load independently

## Verification

To check what `site.sty` contains on a wiki:
```javascript
// In browser console on the wiki
for (const sheet of document.styleSheets) {
    if (sheet.href && sheet.href.includes('site.sty')) {
        for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('table')) {
                console.log(rule.selectorText, rule.cssText.substring(0, 100));
            }
        }
    }
}
```
