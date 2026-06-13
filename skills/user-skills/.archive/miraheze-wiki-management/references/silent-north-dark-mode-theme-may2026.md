# Silent North Wiki Dark Mode Theme — May 2026

## Overview

Deployed a complete dark mode theme for the Silent North wiki (silentnorth.miraheze.org), inspired by the silentnorth.com website's dark aesthetic and the GOT wiki's dark mode patterns.

Key difference from GOT: Silent North uses an ice blue accent color (#58a6ff) instead of GOT's amber/gold (#d4a853), giving it a cold Swiss Alps feel.

## Skin Confirmation

Silent North uses Cosmos skin (confirmed 2026-05-30). The body class is skin-cosmos-search-vue with theme-light class. This means the same CSS loading order issues as GOT apply — skins.cosmos.styles loads AFTER site.styles.

## Color Palette

- Primary background: #0d1117 (deep dark navy)
- Content panels: #161b22 (dark slate)
- Tertiary background: #21262d (dark gray)
- Borders: #30363d (subtle gray)
- Primary text: #c9d1d9 (light gray)
- Headings: #f0f6fc (near white)
- Links: #58a6ff (ice blue)
- Link hover: #79c0ff (lighter blue)
- New links: #f85149 (red)
- Accent: #d4a853 (amber for highlights)

## Files Updated

1. MediaWiki:Cosmos.css (23,920 chars) — Complete dark mode theme
2. MediaWiki:Common.css (14,459 chars) — Dark mode overrides + preserved light mode
3. MediaWiki:Common.js (11,844 chars) — DarkMode toggle label fix + sidebar dropdown JS injection

## CDN Cache Issue

After pushing CSS changes, the site.styles response may serve stale cached content. Users must hard refresh (Ctrl+Shift+R) to see changes. Verify with cache-busting timestamp parameter.

## Sidebar Dropdown Fix

Same two-pronged approach as GOT wiki:
1. CSS with html body.theme-light #cosmos-banner .wds-tabs__tab prefix (specificity 1,3,2)
2. JS injection via mw.hook('wikipage.content') in Common.js
