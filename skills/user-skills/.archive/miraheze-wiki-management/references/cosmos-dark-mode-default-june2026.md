# Cosmos Skin Dark Mode Default (June 2026)

## Problem

Cosmos skin defaults to light mode (`theme-light` class on `<body>`). The DarkMode extension adds this class by default, and users must manually toggle to dark mode.

## Solution: Invert the Theme Mapping

The key insight: **style `.theme-light` to look DARK**. When the DarkMode extension removes `.theme-light` (user clicks "turn dark mode on"), the page falls through to light appearance. The toggle labels are inverted but functionality works.

## CSS Pattern for `MediaWiki:Cosmos.css`

```css
/* --- Dark Mode as Default --- */
/* DarkMode extension adds .theme-light by default.
   .theme-light = dark appearance. No class = light appearance. */

:root {
    --bg-main-dark: #1a1a2e;
    --bg-content-dark: rgba(26, 26, 46, 0.95);
    --text-main-dark: #e0e0e0;
    --heading-dark: #ffffff;
    --link-dark: #d4a853;
    --link-hover-dark: #f0d890;
    --link-new-dark: #e06060;
    --border-dark: #3a3a5c;
    --bg-header-dark: linear-gradient(90deg, rgba(40,40,70,0.9) 0%, rgba(60,60,100,0.4) 50%, transparent 100%);
}

/* Light mode (no theme-light class) */
body:not(.theme-light) {
    --bg-main: #e7e7e7;
    --bg-content: rgba(215, 215, 215, 0.97);
    --text-main: #0a0a0a;
    --text-dark: #ddd;
    --link: #7a5c28;
    --link-hover: #bfae7c;
    --link-new: #8c1a1a;
    --border: #8181a5;
    --bg-header: linear-gradient(90deg, rgb(129,134,163) 0%, rgba(85,91,127,0.3) 50%, transparent 100%);
}

body:not(.theme-light) h1, body:not(.theme-light) h2,
body:not(.theme-light) h3, body:not(.theme-light) h4,
body:not(.theme-light) h5, body:not(.theme-light) h6 {
    color: #000 !important;
}

/* Dark mode (theme-light class added by DarkMode extension) */
body.theme-light {
    --bg-main: var(--bg-main-dark);
    --bg-content: var(--bg-content-dark);
    --text-main: var(--text-main-dark);
    --link: var(--link-dark);
    --link-hover: var(--link-hover-dark);
    --link-new: var(--link-new-dark);
    --border: var(--border-dark);
    --bg-header: var(--bg-header-dark);
}

body.theme-light h1, body.theme-light h2,
body.theme-light h3, body.theme-light h4,
body.theme-light h5, body.theme-light h6 {
    color: var(--heading-dark) !important;
}

body.theme-light #cosmos-banner {
    background: var(--bg-header-dark) !important;
}

body.theme-light .mw-body {
    background-color: var(--bg-content-dark) !important;
    color: var(--text-main-dark) !important;
}

body.theme-light .wikitable {
    background-color: rgba(30, 30, 50, 0.8) !important;
    color: var(--text-main-dark) !important;
    border-color: var(--border-dark) !important;
}

body.theme-light .wikitable th {
    background-color: rgba(40, 40, 70, 0.9) !important;
    color: var(--heading-dark) !important;
}

body.theme-light #catlinks {
    background-color: rgba(30, 30, 50, 0.8) !important;
    border-color: var(--border-dark) !important;
    color: var(--text-main-dark) !important;
}
```

## Important Notes

1. **This goes in `MediaWiki:Cosmos.css`**, NOT `MediaWiki:Common.css`. Cosmos skin CSS loads after Common.css, so overrides must be in Cosmos.css.

2. **Toggle labels are inverted** — "Turn dark mode on" appears when you're already in dark mode. The functionality works correctly, just the labels are backwards. To fix labels, add JS to Common.js that swaps the toggle text.

3. **Use `!important`** on heading colors — the Cosmos skin has `h1,h2,h3... { color: #000; }` in its built-in CSS that loads after Common.css. Only `!important` in Cosmos.css can override it.

4. **Verify with `ss -tlnp`** that the CSS is being loaded. After editing, the page should render with dark background by default.

## Alternative: JS-Based Approach

If you want to keep the toggle labels correct, add to `MediaWiki:Common.js`:

```javascript
// Force dark mode as default if no preference set
if (!localStorage.getItem('darkmode-preference')) {
    document.body.classList.add('theme-light');
    localStorage.setItem('darkmode-preference', 'dark');
}
```

This requires the DarkMode extension to respect the `theme-light` class, which it does on Miraheze.
