# Architecture

Deep dive into the Kalshi Probability Explorer's data pipeline, design decisions, and deployment variants.

---

## Table of Contents

- [Data Pipeline](#data-pipeline)
- [Stage 1: Fetch](#stage-1-fetch)
- [Stage 2: Normalize](#stage-2-normalize)
- [Stage 3: Compute](#stage-3-compute)
- [Stage 4: Sort & Filter](#stage-4-sort--filter)
- [Stage 5: Render](#stage-5-render)
- [Key Metrics & Formulas](#key-metrics--formulas)
- [CORS Workaround](#cors-workaround)
- [Tier System](#tier-system)
- [State Management](#state-management)
- [Performance](#performance)

---

## Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        KALSHI PROBABILITY EXPLORER                              │
│                                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  FETCH   │──▶│ NORMALIZE│──▶│ COMPUTE  │──▶│  SORT &  │──▶│  RENDER  │    │
│  │          │   │          │   │          │   │  FILTER  │   │          │    │
│  │ HTTP GET │   │ cents =  │   │ edge =   │   │ composite│   │ DOM +    │    │
│  │ /v2/     │   │ round(   │   │ |yes-no| │   │ key:     │   │ Chart.js │    │
│  │ markets  │   │ float*100│   │ volume   │   │ edge▼    │   │ Three.js │    │
│  │          │   │          │   │ score    │   │ volume▼  │   │          │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│       │                                                                     │
│       ▼                                                                     │
│  Kalshi API (via CORS proxy in browser, direct on server)                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

Each stage is **stateless and pure** (modulo caching). The same pipeline drives the browser UI, a cron job, a Discord bot, or a Telegram bot — no rewrites needed.

---

## Stage 1: Fetch

**Browser path:** `fetch()` → CORS proxy → Kalshi API
**Server path:** `requests.get()` → Kalshi API (direct, no proxy needed)

```javascript
// app.js — fetchKalshi()
const KALSHI_BASE = 'https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200';
const CORS_PROXIES = [
  u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  u => `https://proxy.cors.sh/?${u}`
];

async function fetchKalshi() {
  for (const proxyFn of CORS_PROXIES) {
    const resp = await fetch(proxyFn(KALSHI_BASE), { cache: 'no-store' });
    if (!resp.ok) continue;
    const data = await resp.json();
    if (data?.markets?.length > 0) return { markets: data.markets, source: ... };
  }
  return null; // triggers demo data fallback
}
```

**Response shape (200 markets):** ~250KB gzipped, 80-150ms latency from US.

**Failure modes:**
- Both proxies fail → falls back to 12 demo markets
- HTTP 429 (rate limit) → proxy returns error, try next
- Network timeout → try next proxy

---

## Stage 2: Normalize

Converts raw Kalshi market objects into a flat internal schema.

```javascript
function normalizeMarket(m) {
  // Prices are dollar strings: "0.6500" → 65 cents
  const toCents = s => {
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.round(n * 100);
  };

  // Use mid of bid/ask; fall back to last_price
  let yes = mid(toCents(m.yes_bid_dollars), toCents(m.yes_ask_dollars));
  let no  = mid(toCents(m.no_bid_dollars),  toCents(m.no_ask_dollars));
  if (no === null) no = 100 - yes; // derive from YES

  return {
    ticker: m.ticker,
    title: m.title,
    yes,                          // integer cents (1-99)
    no,                           // integer cents (1-99)
    volume: m.volume_24h || m.volume,
    status: m.status,
    open_time: m.open_time,
    close_time: m.close_time
  };
}
```

**Output schema:** `{ ticker, title, yes, no, volume, status, open_time, close_time }`

---

## Stage 3: Compute

Pure functions over the normalized market list.

### Edge

```
edge = |yes - no|  (in cents)
```

| Edge | Meaning |
|------|---------|
| 0¢ | 50/50 — market is uncertain |
| 20¢ | Slight lean one way |
| 50¢ | Moderate confidence |
| 80¢ | Very confident |
| 98¢ | Near-certain (e.g., 1¢ YES / 99¢ NO) |

**Important:** Edge is *inversely* related to expected profit per contract. A 90¢ YES market has high edge (80¢) but only pays 10¢ profit on a win. The sweet spot for most traders is **55–75¢**.

### Volume Score

```
volume_score = log10(volume) / 7    // saturates at ~$10M
```

### Recency Score

```
recency_score = e^(-Δt / 24h)      // decays over a day
```

### Composite Score (for Top-10 ranking)

```
composite = 0.5 * edge + 0.3 * volume_score + 0.2 * recency_score
```

---

## Stage 4: Sort & Filter

```javascript
// Primary: composite score (descending)
// Secondary: volume (descending)
// Tertiary: ticker (alphabetical for ties)
markets.sort((a, b) => b.composite - a.composite);

// User filter
if (filter === 'open') markets = markets.filter(m => m.status === 'open' || m.status === 'active');
if (searchQuery) markets = markets.filter(m =>
  m.ticker.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)
);
```

**Complexity:** O(n log n) dominated by sort. For 200 markets: sub-millisecond.

---

## Stage 5: Render

Three render targets, all synchronous:

| Target | Method | Content |
|--------|--------|---------|
| Top-10 table | `tbody.innerHTML` | Ticker, title, YES/NO prices, edge |
| Market list | `.market-item` divs | Clickable cards with prices and edge |
| Earnings chart | `new Chart(ctx, config)` | Bar chart: profit vs buy price |
| Detail panel | `innerHTML` on click | Full market info + how-to-trade box |
| WebGL bg | Three.js `requestAnimationFrame` | Decorative particle field (separate loop) |

---

## Key Metrics & Formulas

### Payout Calculator

```
contracts = floor(investment / (price / 100))
total_cost = contracts * (price / 100)
net_profit = contracts * (1 - price / 100)
roi = (net_profit / total_cost) * 100
```

### Expected Value

```
EV per contract = p × (100 - price) - (1 - p) × price
```

Where `p` = your estimated true probability. Under the null hypothesis (market is correctly priced, `p = price/100`), EV = 0.

**To beat the market:** your estimated probability must exceed the implied price.

### Breakeven Win Rate

```
breakeven = price / 100
```

At 70¢, you need to win ≥70% of the time just to break even (before fees).

---

## CORS Workaround

Kalshi's API doesn't set `Access-Control-Allow-Origin` headers, so browsers block direct `fetch()`. The page uses two public CORS proxies as a workaround:

| Proxy | URL Pattern | Notes |
|-------|-------------|-------|
| corsproxy.io | `https://corsproxy.io/?url=<encoded>` | URL-encoded target |
| proxy.cors.sh | `https://proxy.cors.sh/?<url>` | Target as query string |

**Limitations:**
- No SLA, may rate-limit, may log traffic
- Adds 100-300ms latency per request
- Fine for a public explorer, not for production trading

**For production:** Run a server-side bot (Python/Node) that calls Kalshi directly. No proxy needed.

---

## Tier System

Every explainer section has 4 levels controlled by a bottom slider:

| Tier | Label | Use Case |
|------|-------|----------|
| 0 | CAVEMAN | Absolute beginners — no jargon |
| 1 | CHILD | Simple analogies, no math |
| 2 | TEENAGER | Default — some terminology, examples |
| 3 | IN-DEPTH | Full technical detail, formulas, code |

Implementation: CSS `body[data-tier="teenager"]` toggles visibility of `.tier-block` divs. State persisted to `localStorage`.

---

## State Management

The app uses module-level variables (no framework):

```javascript
let allMarkets = [];        // current market list (live or demo)
let currentFilter = 'all';  // 'all' | 'open'
let lastSource = 'demo';    // 'live-corsproxy' | 'live-corssh' | 'demo'
```

Filter state, search query, and selected market are read from DOM on interaction — not stored in variables.

---

## Performance

| Operation | 200 markets | Notes |
|-----------|-------------|-------|
| Fetch + parse | 200-500ms | Network-bound |
| Normalize | <5ms | Pure math |
| Compute (edge, scores) | <10ms | O(n) scan |
| Sort | <1ms | O(n log n), n=200 |
| Render (DOM) | <50ms | innerHTML batch |
| Chart.js draw | <30ms | Canvas, not DOM |
| **Total** | **~300-600ms** | Dominated by network |

Memory: ~500KB for 200 markets (JSON objects in memory).
