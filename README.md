# KALSHI//PROBABILITY_EXPLORER

A cyberpunk-themed prediction market analysis tool and implied probability engine. Connects to Kalshi's public API to scan markets, compute trading edges, and project earnings — all from the browser or a Raspberry Pi.

**Live site:** [donzzzilla.github.io/kalshi-explorer](https://donzzzilla.github.io/kalshi-explorer/)

![Cyberpunk-themed Kalshi scanner interface](https://img.shields.io/badge/theme-cyberpunk-ff00aa) ![License](https://img.shields.io/badge/license-MIT-00f0ff) ![Status](https://img.shields.io/badge/status-live-00ff88)

---

## Table of Contents

- [What Is Kalshi?](#what-is-kalshi)
- [Features](#features)
- [Live Demo Sections](#live-demo-sections)
- [Quick Start (Browser)](#quick-start-browser)
- [Quick Start (Discord Bot)](#quick-start-discord-bot)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## What Is Kalshi?

[Kalshi](https://kalshi.com) is a **CFTC-regulated Designated Contract Market (DCM)** — the first federally licensed exchange for event contracts in the US.

- Each contract is a **binary option**: pays **$1.00 if YES**, **$0.00 if NO**
- Prices are quoted in **cents (1–99)** representing the market's implied probability
- A 65¢ YES price implies the market assigns a 65% chance to the event happening

**Example:** "Dow Above 45000" at 12¢ YES:
- Buy 100 YES contracts at 12¢ each → $12 invested
- If Dow > 45000 → you receive $100 → **profit = $88**

---

## Features

- 🔍 **Live Market Scanner** — Fetches and filters Kalshi markets by status and keyword
- 📊 **Edge Rankings** — Top 10 markets sorted by price gap (opportunity finder)
- 🧮 **Probability Calculator** — Compute payouts, ROI, and projected returns at any buy price
- 📈 **Earnings Chart** — Visual payoff curve across all price points
- 🏗️ **Architecture Diagram** — Interactive 5-stage data pipeline breakdown
- 🔄 **API Flow Walkthrough** — Step-by-step anatomy of a REST request to Kalshi
- 🤖 **Bot Design Guide** — Planned Discord bot commands and deployment specs
- 🧠 **Hermes Hub** — Full Raspberry Pi 4 + AI agent deployment scenarios
- 🎚️ **4-Level Explainer** — Every section adapts to Caveman / Child / Teenager / In-Depth
- 🖥️ **Cyberpunk UI** — Three.js particle background, scanned-line overlay, neon theme

---

## Live Demo Sections

| Tab | Description |
|-----|-------------|
| **SCANNER** | Live market list with search/filter, top-10 by edge, detail panel |
| **CALCULATOR** | Payout, ROI, monthly/annual projections for any price and stake |
| **EARNINGS** | Bar chart + table showing profit at prices from 20¢ to 90¢ |
| **ARCHITECTURE** | Interactive data pipeline: API → Proxy → Parser → Analyzer → UI |
| **API FLOW** | 5-step REST round-trip walkthrough with actual code snippets |
| **BOT DESIGN** | Discord bot command spec and feature list |
| **HERMES HUB** | 3 deployment scenarios + 5 alternative setups + quick-start guide |

---

## Quick Start (Browser)

No install needed. The site runs entirely in the browser via GitHub Pages.

```bash
# Clone and serve locally (optional)
git clone https://github.com/DonZzzilla/kalshi-explorer.git
cd kalshi-explorer
# Open index.html in your browser, or:
python3 -m http.server 8080
```

> **Note:** Due to browser CORS restrictions, the live site routes API calls through public proxies (`corsproxy.io`, `proxy.cors.sh`). If both proxies fail, the page falls back to realistic demo data. Install the [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/) extension or use a server-side bot for direct API access.

---

## Quick Start (Discord Bot)

Get market alerts in your Discord server in under 30 minutes:

### 1. Create a Discord Webhook

1. Open your Discord server → **Server Settings** → **Integrations** → **Webhooks**
2. Click **New Webhook**, name it (e.g. "Kalshi Bot"), copy the URL
3. Set the environment variable:
   ```bash
   echo 'DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...' >> ~/.env
   ```

### 2. Create the Scanner Script

```bash
mkdir -p ~/kalshi-bot && cd ~/kalshi-bot
cat > scan.py << 'EOF'
import requests, json, os
from datetime import datetime

WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL', '')
API = 'https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200'

def fetch_markets():
    r = requests.get(API, timeout=10)
    r.raise_for_status()
    return r.json().get('get_markets', [])

def to_cents(s):
    try: return round(float(s) * 100)
    except: return None

def normalize(m):
    yes = to_cents(m.get('yes_bid_dollars')) or to_cents(m.get('yes_ask_dollars')) or 50
    no  = to_cents(m.get('no_bid_dollars'))  or to_cents(m.get('no_ask_dollars'))  or (100 - yes)
    return {
        'ticker': m['ticker'],
        'title': m['title'],
        'yes': yes,
        'no': no,
        'abs_volume_24h': m.get('volume_24h', 0)
    }

def edge(m):
    return abs(m['yes'] - m['no'])

def send_discord(markets):
    if not WEBHOOK_URL:
        print("No webhook URL set")
        return
    top10 = sorted(markets, key=edge, reverse=True)[:10]
    lines = [f"🔥 **Kalshi Top 10 by Edge** — {datetime.now().strftime('%H:%M')}\n"]
    for m in top10:
        e = edge(m)
        lines.push(f"• **{m['ticker']}** — {m['title']}\n  YES {m['yes']}¢ / NO {m['no']}¢ • Edge **{e}¢**")
    requests.post(WEBHOOK_URL, json={'content': '\n'.join(lines)})

try:
    raw = fetch_markets()
    markets = [normalize(m) for m in raw]
    send_discord(markets)
    print(f"OK — sent {len(market)} markets to Discord")
except Exception as e:
    print(f"ERROR: {e}")
EOF
```

### 3. Install Dependencies & Schedule

```bash
pip3 install requests
python3 scan.py                    # test it

# Add to crontab (every 15 minutes)
(crontab -l 2>/dev/null; echo "*/15 * * * * cd /home/donzzz/kalshi-bot && /usr/bin/python3 scan.py >> bot.log 2>&1") | crontab -
```

Done! Your Discord will get a top-10-by-edge alert every 15 minutes.

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  KALSHI API │────▶│ CORS PROXY  │────▶│ DATA PARSER  │────▶│  ANALYSIS    │────▶│  UI         │
│  (remote)   │     │ (browser    │     │ (normalize   │     │  ENGINE      │     │  RENDERER   │
│             │     │  workaround)│     │  prices,     │     │ (edge,       │     │ (tables,    │
│  REST/JSON  │     │             │     │  volumes)    │     │  sort,       │     │  charts,    │
│  No auth    │     │ corsproxy   │     │              │     │  filter)     │     │  panels)    │
│ Rate: 100/m │     │ .io or     │     │ cents =      │     │              │     │             │
│             │     │ proxy.cors  │     │ round(float  │     │ edge =       │     │ DOM +       │
│             │     │ .sh         │     │ * 100)       │     │ |yes - no|   │     │ Chart.js +  │
└─────────────┘     └─────────────┘     └──────────────┘     └──────────────┘     │ Three.js    │
                                                                                    └─────────────┘
```

Each stage is **stateless and pure**, so the same pipeline drives the browser UI, a cron job, a Discord bot, or a Telegram bot — no rewrites needed.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown.

---

## API Reference

**Base URL:** `https://external-api.kalshi.com/trade-api/v2`

| Endpoint | Description | Auth |
|----------|-------------|------|
| `GET /v2/markets` | List all markets | None |
| `GET /v2/markets/{ticker}` | Single market detail | None |
| `GET /v2/events` | List all events | None |
| `GET /v2/events/{id}/markets` | Markets in an event | None |
| `GET /v2/markets/{ticker}/orderbook` | Orderbook with depth | None |
| `POST /v2/portfolio/orders` | Place an order | API key (RSA) |

**Query Parameters (list markets):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | — | `open`, `closed`, `settled` |
| `limit` | int | 100 | Max 200 |
| `cursor` | string | — | Pagination token |

**Price format:** Dollar strings like `"0.6500"` (= 65¢). Multiply by 100 and round for cents.

**Rate limit:** ~100 requests/minute per IP. Read-only endpoints require no authentication.

---

## Deployment

### GitHub Pages (current)

The site is deployed to GitHub Pages via the `main` branch. The `.nojekyll` file ensures raw asset serving.

```bash
# Cache-bust after changes
sed -i 's/app.js?v=[0-9]*/app.js?v=NEXT/' index.html
git add -A && git commit -m "bump cache" && git push
```

### Raspberry Pi 4 (bot server)

See the **Hermes Hub** tab on the live site for full deployment scenarios:

| Scenario | RAM | Cost | Description |
|----------|-----|------|-------------|
| **A: Read-Only Research** | ~120MB | $0 | Hourly Discord digests, manual trading |
| **B: Advise-and-Confirm** | ~180MB | $0 | Bot proposes, you approve via Discord reply |
| **C: Full Autonomous** | ~250MB | $0 | Auto-trading within your risk rules |
| **Cloud (Fly.io/Oracle)** | ~256MB | $0 | No hardware to maintain |
| **Phone (Termux)** | varies | $0 | On-the-go alerts via termux-notification |

---

## Project Structure

```
kalshi-explorer/
├── index.html          # Main app (all sections, tooltips, tier system)
├── app.js              # Data pipeline, rendering, charts, UI logic
├── README.md           # ← You are here
├── ARCHITECTURE.md     # Detailed pipeline and design docs
├── BOT_GUIDE.md        # Discord/Telegram bot setup guide
├── CONTRIBUTING.md     # How to contribute
├── .nojekyll           # GitHub Pages: disable Jekyll processing
├── .gitkeep            # Preserve directory structure
├── config/cron/        # Cron job definitions (for server-side bot)
├── memories/           # AI agent memory files (for Hermes integration)
├── notes/daily/        # Daily development notes
└── skills/user-skills/ # Hermes agent skills
```

**No build step.** Pure HTML/CSS/JS with CDN dependencies:

- [Three.js r128](https://threejs.org/) — WebGL particle background
- [Chart.js](https://www.chartjs.org/) — Earnings bar chart

Total bundle (excluding CDN libs): ~15KB CSS + ~25KB JS.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

**Quick summary:**
1. Fork the repo
2. Make changes to `index.html` and/or `app.js`
3. Test locally (open in browser or `python3 -m http.server 8080`)
4. Bump the cache version in the `<script src="app.js?v=N">` tag
5. Submit a PR

---

## License

MIT — do whatever you want with it. Not financial advice. Trade at your own risk.

---

*Built with ☕ and ☢️ by [DonZzzilla](https://github.com/DonZzzilla). Powered by [Kalshi](https://kalshi.com) public API and [Hermes Agent](https://github.com/DonZzzilla).*
