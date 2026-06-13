# Inline Background Colors & FilterTable Counter Styling — Dark Mode Fixes

## Problem: Inline `background-color` Overridden by Dark Mode

When table cells have inline `style="background-color:#385c79;"` (e.g., trader group colors on quest tables), the dark mode CSS `!important` rule on `td` backgrounds overrides them.

### Fix

Add a MORE SPECIFIC selector targeting cells with inline background colors:

```css
body.theme-light .wikitable td[style*="background-color"],
body.theme-light .wikitable th[style*="background-color"],
body.theme-light table td[style*="background-color"],
body.theme-light table th[style*="background-color"] {
    background-color: revert !important;
}
```

**Placement:** Insert BEFORE the `/* COMPREHENSIVE TABLE DARK MODE */` section in `MediaWiki:Cosmos.css`.

## FilterTable Counter Styling

Make `.filter-counter` and `.filter-counter-total` bigger and bolder:

```css
.filter-counter,
body.theme-light .filter-counter,
body.theme-light .filter-counter-total {
    color: #d4a853 !important;
    font-size: 1.15em !important;
    font-weight: 700 !important;
}
```

## Notification Icon Visibility

Dark SVGs on dark header need `filter: invert(1)`:

```css
body.theme-light #cosmos-notification-icons .oo-ui-icon-bell,
body.theme-light #cosmos-notification-icons .oo-ui-icon-tray,
body.theme-light #cosmos-notification-icons .mw-echo-notifications-badge {
    filter: invert(1) brightness(0.85) !important;
}
body.theme-light #cosmos-notification-icons .mw-echo-unseen-notifications {
    color: #d4a853 !important;
    filter: none !important;
}
body.theme-light #cosmos-notification-icons svg { fill: #c8c8c8 !important; }
body.theme-light #pt-notifications-alert a,
body.theme-light #pt-notifications-notice a { color: #c8c8c8 !important; }
body.theme-light #cosmos-notification-icons [data-counter-num] { color: #c8c8c8 !important; }
```
