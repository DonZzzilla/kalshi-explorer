# FilterTable CSS — Reference

## Current CSS (deployed June 2026 to GOT, CSEZ, BOA, Silent North)

The `Template:FilterTable/styles.css` on each wiki contains:

- `.filter-row, .filter-search`: flex layout, 8px gap, centered
- `.filter-button`: uses CSS custom properties for theme adaptation
- `.filter-button.button-selected`: gradient overlay + thicker border + triple-layer glow shadow + bold text
  - Light mode: blue gradient (`rgba(40,100,220)`)
  - Dark mode: gold gradient (`rgba(255,205,60)`) — overrides via `prefers-color-scheme: dark`
- `.filter-search input`: 2.1em height (1.5×), 8px 10px padding, 200px width

## Deployment Notes

Deployed to: GOT (Cosmos skin), CSEZ (Vector), BOA (Citizen skin), Silent North (Vector/Monobook)

Cross-origin browser fetch is blocked between Miraheze wiki domains. Must navigate to each wiki to edit. SUL3 central auth carries login session across wikis when navigating.

The CSS file lives at `Template:FilterTable/styles.css` on each wiki and is loaded via `<templatestyles src="FilterTable/styles.css"/>` in the FilterTable template.

## Multi-Wiki Editing Pattern

When deploying changes across all 4 wikis:
1. Navigate to wiki A → edit → navigate to wiki B → edit → etc.
2. SUL3 central auth carries login session — no need to re-login
3. Each wiki's `Template:FilterTable/styles.css` must be edited individually
4. Verify by checking the page source after edit
