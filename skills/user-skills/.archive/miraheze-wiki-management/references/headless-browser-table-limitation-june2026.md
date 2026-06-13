# Headless Browser — Table Rendering Limitation

## Problem

The headless browser (Browserbase) does NOT execute the FilterTable gadget JavaScript. This means:

1. **Tables don't render** — `document.querySelectorAll('table')` returns empty
2. **Filter controls don't work** — clicking filter buttons via browser_console won't hide/show rows
3. **Can't visually inspect** — screenshots won't show table content

## Workarounds

### 1. Inspect CSS via getComputedStyle()

Even though tables don't render, you can still check what CSS would apply:

```javascript
// Check computed styles on any element
(function() {
    const el = document.querySelector('.wikitable'); // may be null
    if (!el) return 'No table elements found — FilterTable JS not executed';
    const cs = window.getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color };
})()
```

### 2. Fetch Raw Wikitext via API

```javascript
// Get the raw wikitext to understand table structure
(async () => {
    const r = await fetch('/w/api.php?action=query&titles=PageName&prop=revisions&rvprop=content&rvslots=main&format=json', {credentials:'include'});
    const d = await r.json();
    const pages = d.query.pages;
    const pid = Object.keys(pages)[0];
    return pages[pid].revisions[0].slots.main['*'];
})()
```

### 3. Inspect CSS Rules Directly

```javascript
// Find all table-related CSS rules across all stylesheets
(function() {
    const results = [];
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule.selectorText && (rule.selectorText.includes('table') || rule.selectorText.includes('.wikitable'))) {
                    results.push({ sheet: sheet.href?.substring(0,60), sel: rule.selectorText.substring(0,80) });
                }
            }
        } catch(e) {}
    }
    return results;
})()
```

### 4. Verify Dark Mode CSS Applied

After editing `MediaWiki:Cosmos.css`, verify the new rules are present:

```javascript
(async () => {
    const r = await fetch('/w/index.php?title=MediaWiki:Cosmos.css&action=raw&ctype=text/css');
    const t = await r.text();
    return {
        length: t.length,
        hasComprehensive: t.includes('COMPREHENSIVE TABLE DARK MODE'),
        hasPortable: t.includes('PORTABLE INFOBOX'),
        hasSiteStyOverride: t.includes('site.sty') || t.includes('ALL tables in content area')
    };
})()
```

## Key Takeaway

**Never rely on headless browser screenshots to verify wiki table styling.** The JS-dependent features (FilterTable, DataTables) won't execute. Use CSSOM inspection via `getComputedStyle()` and raw wikitext fetching instead.
