# Notification Icons Dark Mode Fix — June 2026

The Cosmos skin's notification icons (bell, tray) are dark SVGs rendered on a dark header. They become invisible in dark mode.

## Problem

The notification icons use inline SVGs with dark fill colors. On the dark header (`#0a0a0a`), they're black-on-black.

## Fix

Add to `MediaWiki:Cosmos.css` — insert before the "COSMOS BANNER USER OPTIONS" section:

```css
body.theme-light #cosmos-notification-icons .oo-ui-icon-bell,
body.theme-light #cosmos-notification-icons .oo-ui-icon-tray,
body.theme-light #cosmos-notification-icons .mw-echo-notifications-badge {
    filter: invert(1) brightness(0.85) !important;
}
body.theme-light .mw-echo-notification-badge-nojs {
    color: #c8c8c8 !important;
}
body.theme-light .mw-echo-unseen-notifications {
    color: #d4a853 !important;
    filter: none !important;
}
body.theme-light #cosmos-notification-icons svg {
    fill: #c8c8c8 !important;
}
body.theme-light #pt-notifications-alert a,
body.theme-light #pt-notifications-notice a {
    color: #c8c8c8 !important;
}
body.theme-light #cosmos-notification-icons [data-counter-num] {
    color: #c8c8c8 !important;
}
```

## DOM Structure Reference

```html
<div id="cosmos-notification-icons">
  <div id="cosmos-notifsButton-icon" class="cosmos-bannerOption-icon">
    <li id="pt-notifications-alert" class="mw-list-item">
      <a class="mw-echo-notifications-badge oo-ui-icon-bell" ...>Alerts (3)</a>
    </li>
    <li id="pt-notifications-notice" class="mw-list-item">
      <a class="mw-echo-notifications-badge oo-ui-icon-tray" ...>Notices (30)</a>
    </li>
  </div>
</div>
```

## Verification

The notification area doesn't render in the headless browser (not logged in). Verify by:
1. Log into the wiki in a real browser
2. Inspect the notification icons
3. Confirm they appear light/white on dark header in dark mode
4. Counter numbers should be readable gray
5. Unseen counts should be amber/gold
