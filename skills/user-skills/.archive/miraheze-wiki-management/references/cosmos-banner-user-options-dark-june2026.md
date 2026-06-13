# Cosmos Banner User Options — Dark Mode Styling

## Problem

The Cosmos skin's top-right banner area (notification icons, username, personal tools dropdown) has dark/black text on the dark header background after dark mode is applied. This makes the username, notification badges, and dropdown menu invisible or hard to read.

## HTML Structure

```
<div id="cosmos-banner-userOptions">
  <div id="cosmos-notification-icons">
    <li id="pt-notifications-alert"><a>Alerts (3)</a></li>
    <li id="pt-notifications-notice"><a>Notices (30)</a></li>
  </div>
  <div id="p-personal">
    <span class="cosmos-userButton-label">Username</span>
    <div class="cosmos-dropdown-icon"><svg>...</svg></div>
    <ul class="cosmos-dropdown-list">
      <li id="pt-darkmode"><a class="ext-darkmode-link">Light mode</a></li>
      ... (user page, talk, sandbox, preferences, etc.)
    </ul>
  </div>
</div>
```

## Solution — CSS for MediaWiki:Cosmos.css

Insert this section before the "COSMOS HEADER — Dark Gritty Tactical" section:

```css
/* Cosmos Banner User Options - Dark mode */
body.theme-light #cosmos-banner-userOptions {
    color: var(--dark-text-primary) !important;
}
body.theme-light #cosmos-notification-icons .mw-list-item a,
body.theme-light #cosmos-notifsButton-icon a,
body.theme-light #cosmos-notification-icons a {
    color: var(--dark-text-primary) !important;
}
body.theme-light #cosmos-notification-icons .mw-echo-notifications-badge {
    color: var(--dark-text-primary) !important;
    opacity: 0.85;
}
body.theme-light #cosmos-notification-icons .mw-echo-unseen-notifications {
    color: var(--dark-link) !important;
}
body.theme-light #p-personal .cosmos-userButton-label,
body.theme-light #cosmos-personalTools-userButton .cosmos-userButton-label,
body.theme-light #p-personal-label {
    color: var(--dark-text-primary) !important;
}
body.theme-light #cosmos-userButton-avatar img {
    border-color: var(--dark-border) !important;
}
body.theme-light #cosmos-userButton-icon svg,
body.theme-light .cosmos-dropdown-icon svg {
    fill: var(--dark-text-secondary) !important;
}
body.theme-light .cosmos-personalTools-list,
body.theme-light #p-personal .cosmos-dropdown-list {
    background-color: var(--dark-bg-panel) !important;
    border-color: var(--dark-border) !important;
}
body.theme-light .cosmos-personalTools-list a,
body.theme-light #p-personal .cosmos-dropdown-list a {
    color: var(--dark-text-primary) !important;
}
body.theme-light #pt-darkmode a,
body.theme-light #pt-darkmode .ext-darkmode-link {
    color: var(--dark-link) !important;
}
```

## Deployment Note

`MediaWiki:Cosmos.css` is a **protected page** — the browser shows "You do not have permission to edit this page" and the edit form textbox is read-only. Must edit via Python requests API with admin credentials (ZeroSkills).
