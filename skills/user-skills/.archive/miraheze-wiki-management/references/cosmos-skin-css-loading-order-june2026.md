# Cosmos Skin CSS Loading Order — Miraheze Wikis

**Discovered:** June 2026, CSEZ wiki heading visibility issue + GoT sidebar dropdowns

## The Full Loading Order

```
1. load.php?modules=site.styles&skin=cosmos  →  Common.css + MediaWiki:Cosmos.css (OUR CSS)
2. load.php?modules=skins.cosmos.styles       →  Skin built-in CSS (63KB, loads LAST)
```

**The skin's built-in CSS (`skins.cosmos.styles`) loads AFTER `site.styles`.** This is the root cause of many CSS override issues.

## Problem 1: Heading Colors

Heading colors (`h1, h2, h3...`) set in `MediaWiki:Common.css` were not taking effect on the CSEZ wiki. The headings remained black (`#000`) on a dark background (`#252525`), making them invisible.

The skin's built-in CSS includes:
```css
h1,h2,h3,h4,h5,h6 {
    color: #000;  /* black — invisible on dark bg */
}
```

**Fix:** Put heading overrides in `MediaWiki:Cosmos.css` instead of `MediaWiki:Common.css`:
```css
h1, h2, h3, h4, h5, h6 {
    color: #e0e0e0 !important;
}
```

## Problem 2: Sidebar Dropdowns (More Severe)

The skin has this rule in `skins.cosmos.styles`:
```css
.wds-tabs__tab .wds-dropdown__content, .wds-dropdown-level-2__content {
    position: relative !important;
    display: block !important;
    border: 0 !important;
    background-color: transparent !important;
}
```

This sets `background-color: transparent !important` on ALL level-2 sidebar dropdown panels. Since the skin CSS loads AFTER our CSS, this wins even if our CSS also uses `!important`.

**Fix:** Use higher specificity selectors:
```css
/* Specificity (1,3,2) — beats skin's (0,2,0) */
html body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content {
    background-color: #1a1a1a !important;
}
```

## The `!important` + Source Order Rule

When both custom CSS and skin CSS use `!important`, the **later-loaded file wins**. To beat skin CSS:

1. **Higher specificity** — Use `#cosmos-banner` (ID) + multiple classes + elements
2. **JavaScript injection** — Use `mw.hook('wikipage.content')` in `MediaWiki:Common.js` to inject `<style>` after all CSS loads

## Rule of Thumb

| File | Purpose |
|------|---------|
| `MediaWiki:Common.css` | Cross-skin resets that DON'T need to override skin defaults |
| `MediaWiki:Cosmos.css` | Cosmos-specific overrides that MUST override skin defaults (headings, sidebar, theme) |
| `MediaWiki:Vector.css` | Vector-specific overrides (if needed) |
| `MediaWiki:Citizen.css` | Citizen-specific overrides (if needed) |

**When unsure, put it in `MediaWiki:Cosmos.css` for Cosmos wikis.**

## Verification

Check what `load.php` actually serves:
```bash
python3 -c "
import urllib.request, gzip
url = 'https://WIKI/w/load.php?lang=en&modules=skins.cosmos.styles&only=styles'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip'})
with urllib.request.urlopen(req, timeout=15) as resp:
    data = resp.read()
    css = gzip.decompress(data).decode() if resp.headers.get('Content-Encoding') == 'gzip' else data.decode()
print(f'Length: {len(css)}')
print('Has wds-dropdown:', 'wds-dropdown' in css)
print('Has !important transparent:', 'transparent !important' in css)
"
```

## Affected Wikis

- CSEZ (`csez.miraheze.org`) — Cosmos skin
- GoT (`got.miraheze.org`) — Cosmos skin
- BOA Hub (`boa.miraheze.org`) — Citizen skin (separate CSS file)
- Silent North (`silentnorth.miraheze.org`) — Citizen skin
