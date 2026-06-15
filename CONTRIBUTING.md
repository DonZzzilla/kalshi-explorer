# Contributing

Thanks for your interest in improving the Kalshi Probability Explorer! This is a lightweight, no-build, single-page app — contributions are welcome.

---

## Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Making Changes](#making-changes)
- [Cache Busting](#cache-busting)
- [What to Work On](#what-to-work-on)
- [Code of Conduct](#code-of-conduct)

---

## How to Contribute

1. **Fork** the repo on GitHub
2. **Clone** your fork: `git clone https://github.com/YOU/kalshi-explorer.git`
3. **Make changes** (see below)
4. **Test locally** (open `index.html` in a browser)
5. **Bust the cache** (update `app.js?v=N` in `index.html`)
6. **Commit** with a clear message
7. **Push** and open a Pull Request

No complex toolchain. No `npm install`. No build step.

---

## Development Setup

```bash
git clone https://github.com/DonZzzilla/kalshi-explorer.git
cd kalshi-explorer

# Open directly in browser:
open index.html        # macOS
xdg-open index.html    # Linux

# Or serve locally (useful for testing fetch):
python3 -m http.server 8080
# → http://localhost:8080
```

**Dependencies** (all CDN, no install):

| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| Three.js | r128 | cdnjs | WebGL particle background |
| Chart.js | latest | jsdelivr | Earnings bar chart |

---

## Project Conventions

### File Structure

- **`index.html`** — All HTML, CSS, and section templates. Single file, no templates.
- **`app.js`** — All JavaScript. Data pipeline, rendering, event handlers.
- **No CSS files** — all styles are in `<style>` block in `index.html`.
- **No framework** — vanilla DOM APIs only.

### CSS

- Use the existing CSS custom properties (`:root` variables) for colors:
  - `--cyan: #00f0ff`, `--magenta: #ff00aa`, `--yellow: #ffe600`
  - `--green: #00ff88`, `--red: #ff3366`
  - `--bg: #0d0d14`, `--surface: #16161f`, `--surface2: #1e1e28`
  - `--text: #f0f0f5`, `--dim: #9a9ab0`
- Font is always `'Courier New', monospace`
- Max content width: `960px`
- Mobile breakpoint: `768px`

### Tier System

Every new explainer section should include all 4 tiers:

```html
<div class="tier-block" data-tier="caveman">
  <p>Simple, no jargon. 2-3 sentences max.</p>
</div>
<div class="tier-block" data-tier="child">
  <p>Simple analogies. No math. Think "explain to a 10-year-old."</p>
</div>
<div class="tier-block" data-tier="teenager">
  <p>Default level. Some terminology OK. Include examples.</p>
</div>
<div class="tier-block" data-tier="indepth">
  <p>Full technical detail. Formulas, code snippets, edge cases.</p>
</div>
```

### JavaScript

- Use `const`/`let`, never `var`
- Use arrow functions for callbacks
- Use template literals for HTML generation
- Keep functions pure where possible
- DOM rendering uses `innerHTML` (not `createElement` chains) for simplicity

---

## Making Changes

### Adding a Market to Demo Data

Edit the `demoData` array at the top of `app.js`:

```javascript
{ ticker: 'KXNEW', title: 'New Market Title', yes: 45, no: 55, volume: 5000000, status: 'active' }
```

### Adding a New Section Tab

1. Add the tab button in `index.html`:
   ```html
   <div class="tab" data-section="new-section">NEW SECTION</div>
   ```

2. Add the section container:
   ```html
   <section id="new-section" class="section" style="display:none">
     <!-- content -->
   </section>
   ```

3. The existing `switchTab()` function handles toggling automatically — no JS changes needed.

### Adding Tooltip Help

Use the existing portal tooltip pattern:

```html
<span class="tooltip">
  <span style="font-size:0.7rem;color:var(--dim)">?</span>
  <span class="tip-text">
    <span class="tip-label">Tooltip Title</span>
    <span class="tier-block" data-tier="teenager">Default explanation.</span>
    <span class="tier-block" data-tier="indepth">Technical deep-dive.</span>
  </span>
</span>
```

---

## Cache Busting

GitHub Pages + CDN can cache assets for 10-30 minutes. **Always** bump the version when pushing JS changes:

```html
<!-- Change this number every time app.js changes: -->
<script src="app.js?v=8"></script>
```

Without this, users may see stale JavaScript for up to 30 minutes.

---

## What to Work On

### Good First Issues

- Add more demo data markets (diverse categories: crypto, economics, politics, weather)
- Improve mobile layout for the architecture/flow diagrams
- Add a dark/light mode toggle
- Translate tier content (Caveman tier could use funnier writing)

### Medium Effort

- Add orderbook depth visualization (fetch `/v2/markets/{ticker}/orderbook`)
- Add price history chart for individual markets
- Add a "favorites" system (persisted to `localStorage`)
- Add a portfolio tracker (paper trading mode)

### Advanced

- WebSocket streaming for real-time price updates
- Add authenticated trading (requires Kalshi API key + RSA signing)
- Build the full Discord bot from the BOT_GUIDE.md spec
- Integrate with Hermes Agent for AI-powered market analysis

---

## Code of Conduct

- Keep it respectful. This is a hobby project.
- Not financial advice. Make that clear in any PRs.
- Test your changes before submitting.
- Don't add tracking, analytics, or ads. The page stays clean.

---

*Questions? Open an issue or ask in the [Discord](https://discord.com/channels/1333668222892769341).*
