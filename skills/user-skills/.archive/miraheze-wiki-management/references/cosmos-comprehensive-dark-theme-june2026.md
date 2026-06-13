# Cosmos Comprehensive Dark Theme — Ghosts of Tabor Tactical Style

## Color Palette

The Ghosts of Tabor game uses a dark tactical UI with amber/gold accents.

### Dark Mode CSS Variables

```css
:root {
    --dark-bg-primary: #0d0d0d;
    --dark-bg-secondary: #1a1a1a;
    --dark-bg-panel: #2a2a2a;
    --dark-bg-content: rgba(26, 26, 26, 0.95);
    --dark-border: #3a3a3a;
    --dark-border-light: #4a4a4a;
    --dark-text-primary: #c8c8c8;
    --dark-text-secondary: #a0a0a0;
    --dark-text-heading: #ffffff;
    --dark-text-bright: #e0e0e0;
    --dark-link: #d4a853;
    --dark-link-hover: #f0d890;
    --dark-link-new: #cc4444;
    --dark-header-bg: linear-gradient(90deg, rgba(20,20,20,0.95) 0%, rgba(40,40,40,0.6) 50%, transparent 100%);
}
```

## Key Skin Selectors Requiring `!important`

| Skin Selector | Controls |
|---|---|
| `body .wikitable > tr > th` | Table headers — `#fff` bg, `#000` text |
| `body .wikitable > tr > td` | Table cells — `#fff` bg, `#000` text |
| `.wikitable` | Table container — `#f8f9fa` bg |
| `.toc` | TOC — `#f8f9fa` bg |
| `.toc .tocnumber` | TOC numbers — `#000` |
| `#catlinks` | Category bar |
| `.cosmos-sidebar` | Sidebar panels |
| `#cosmos-banner` | Top banner |
| `#footer` | Footer |

## Deployment Notes

- Add to `MediaWiki:Cosmos.css` ONLY (NOT Common.css — skin CSS loads after)
- Use `body.theme-light` for dark appearance (DarkMode extension adds this by default)
- Use `body:not(.theme-light)` for light appearance (toggle off)
- ALL heading/table/link rules need `!important` to override skin defaults

## Toggle Label Fix (JS)

When dark is default, the DarkMode toggle labels are inverted. Fix in Common.js:

```javascript
(function() {
    function updateLabel() {
        var isDark = document.body.classList.contains('theme-light');
        var link = document.querySelector('.ext-darkmode-link');
        if (link) {
            link.textContent = isDark ? 'Light mode' : 'Dark mode';
            link.title = isDark ? 'Turn light mode on' : 'Turn dark mode on';
        }
    }
    updateLabel();
    document.addEventListener('click', function(e) {
        if (e.target.closest('.ext-darkmode-link')) setTimeout(updateLabel, 100);
    });
})();
```
