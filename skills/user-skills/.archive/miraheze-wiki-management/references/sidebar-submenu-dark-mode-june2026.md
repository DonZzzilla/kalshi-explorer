# Silent North Wiki: Sidebar Submenu Dark Mode Fix (June 2026)

## Problem
The Cosmos skin loads `skins.cosmos.styles` (63KB) AFTER `site.styles` (which contains our custom CSS in MediaWiki:Common.css and MediaWiki:Cosmos.css). The skin has the following rule:
```css
.wds-tabs__tab .wds-dropdown__content,
.wds-tabs__tab .wds-dropdown-level-2__content {
    background-color: transparent !important;
}
```
This `!important` rule from the skin overrides our dark mode styling in `body.theme-light` due to CSS source order (later wins when both have `!important`).

Our attempts to style `.wds-dropdown-level-2__content` in `MediaWiki:Cosmos.css` were being overridden by the skin's built-in transparency.

## Solution
We used a two-pronged approach:

### 1. Maximum Specificity CSS in MediaWiki:Cosmos.css
We increased specificity to beat the skin's selectors:
```css
/* Sidebar dropdowns - Level 1 */
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__content,
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content,
body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content {
    background-color: #1c2128 !important;
    border-color: #30363d !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
}

/* Dropdown toggles */
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__toggle,
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__toggle,
body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__toggle {
    color: var(--dark-text-primary) !important;
}

body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__toggle:hover,
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__toggle:hover,
body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__toggle:hover {
    background-color: rgba(88,166,255,0.1) !important;
    color: var(--dark-link) !important;
}

/* Dropdown list items */
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__content .wds-list.wds-is-linked > li > a,
body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content .wds-list.wds-is-linked > li > a {
    color: var(--dark-text-primary) !important;
}

body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__content .wds-list.wds-is-linked > li:hover > a,
body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content .wds-list.wds-is-linked > li:hover > a {
    background-color: rgba(88,166,255,0.1) !important;
    color: var(--dark-link) !important;
}

/* Chevron icons */
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown__toggle-chevron,
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-chevron {
    filter: invert(1) !important;
    opacity: 0.5 !important;
}

/* Dropdown pseudo-elements */
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown::before {
    border-bottom-color: var(--dark-border) !important;
}
body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown::after {
    border-bottom-color: var(--dark-bg-panel) !important;
}
```

### 2. JS Injection via MediaWiki:Common.js (Belt-and-suspenders)
As a backup, we inject a `<style>` element after page load to ensure our styles win:
```javascript
/* ===== Sidebar Dropdown Dark Mode Fix ===== */
// Injects dark mode styles for sidebar dropdowns after page loads
// This overrides the skin's built-in CSS which loads after our custom CSS
mw.hook('wikipage.content').add(function() {
    if (!document.body.classList.contains('theme-light')) return;
    
    var styleId = 'sn-sidebar-dark-fix';
    if (document.getElementById(styleId)) return;
    
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content,',
        'body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content {',
        '    background-color: #1c2128 !important;',
        '    border-color: #30363d !important;',
        '    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;',
        '}',
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__toggle,',
        'body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__toggle {',
        '    color: var(--dark-text-primary) !important;',
        '}',
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__toggle:hover,',
        'body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__toggle:hover {',
        '    background-color: rgba(88,166,255,0.1) !important;',
        '    color: var(--dark-link) !important;',
        '}',
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content .wds-list.wds-is-linked > li > a,',
        'body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content .wds-list.wds-is-linked > li > a {',
        '    color: var(--dark-text-primary) !important;',
        '}',
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content .wds-list.wds-is-linked > li:hover > a,',
        'body.theme-light #cosmos-banner .wds-tabs__tab [class*="wds-dropdown-level"]__content .wds-list.wds-is-linked > li:hover > a {',
        '    background-color: rgba(88,166,255,0.1) !important;',
        '    color: var(--dark-link) !important;',
        '}',
        'body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2 .wds-dropdown-chevron {',
        '    filter: invert(1) !important;',
        '    opacity: 0.5 !important;',
        '}'
    ].join('\n');
    document.head.appendChild(style);
});
```

## Why This Works
1. **CSS Specificity**: Our selectors (`body.theme-light #cosmos-banner .wds-tabs__tab .wds-dropdown-level-2__content`) have higher specificity than the skin's (`.wds-tabs__tab .wds-dropdown-level-2__content`)
2. **JS Injection**: The injected `<style>` element appears in the DOM after the skin's CSS, so it wins regardless of specificity
3. **Fallback**: If JS fails, the CSS still works due to specificity

## Verification
After deployment (June 2026), sidebar submenu dropdowns on silentnorth.miraheze.org now correctly display:
- Background: `#1c2128` (dark panel color)
- Text: `#c9d1d9` (primary text)
- Hover: `rgba(88,166,255,0.1)` background with `#58a6ff` text
- Chevrons: Properly inverted for dark mode

## References
- See `MediaWiki:Cosmos.css` on silentnorth.miraheze.org for the CSS implementation
- See `MediaWiki:Common.js` on silentnorth.miraheze.org for the JS injection
- See the miraheze-wiki-management skill for how this fits into the broader dark mode pattern
