# Bot Guide

Set up a Discord (or Telegram) bot that scans Kalshi markets and sends alerts automatically.

---

## Table of Contents

- [Overview](#overview)
- [Option A: Discord Webhook (Easiest)](#option-a-discord-webhook-easiest)
- [Option B: Discord Bot (Interactive)](#option-b-discord-bot-interactive)
- [Option C: Telegram Bot](#option-c-telegram-bot)
- [Example: scan.py](#example-scanpy)
- [Scheduling](#scheduling)
- [Hermes Agent Integration](#hermes-agent-integration)
- [Alert Format Examples](#alert-format-examples)

---

## Overview

The browser-based explorer relies on CORS proxies, which are unreliable. A **server-side bot** can call Kalshi's API directly — faster, more reliable, and doesn't depend on third-party proxies.

**Bot capabilities:**

| Feature | Discord Webhook | Discord Bot | Telegram |
|---------|----------------|-------------|----------|
| Push alerts | ✅ | ✅ | ✅ |
| User commands | ❌ | ✅ | ✅ |
| Interactive buttons | ❌ | ✅ | ✅ |
| Setup complexity | Low | Medium | Medium |
| Inbound port needed | No | No (long-poll) | No (long-poll) |

---

## Option A: Discord Webhook (Easiest)

Webhooks are one-way: the bot POSTS to Discord, but can't receive commands. Perfect for alert-only setups.

### 1. Create the Webhook

1. Discord → **Server Settings** → **Integrations** → **Webhooks**
2. **New Webhook** → name it → copy URL

### 2. Set Environment Variable

```bash
echo 'DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN' >> ~/.env
```

### 3. Deploy scan.py

See [Example: scan.py](#example-scanpy) below.

---

## Option B: Discord Bot (Interactive)

A full `discord.py` bot that responds to slash commands and can have interactive approval buttons.

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → name it → **Bot** tab → **Add Bot**
3. Copy the **Bot Token**
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**
5. **OAuth2** → **URL Generator** → scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
6. Open the generated URL to invite the bot to your server

### 2. Install Dependencies

```bash
pip3 install discord.py requests
```

### 3. Bot Script

```python
# bot.py
import discord, requests, os
from discord import app_commands

DISCORD_TOKEN = os.environ['DISCORD_BOT_TOKEN']
KALSHI_API = 'https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200'

intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

def fetch_markets():
    r = requests.get(KALSHI_API, timeout=10)
    r.raise_for_status()
    return r.json().get('markets', [])

def to_cents(s):
    try: return round(float(s) * 100)
    except: return 50

def normalize(m):
    yes = to_cents(m.get('yes_bid_dollars')) or to_cents(m.get('yes_ask_dollars')) or 50
    no  = to_cents(m.get('no_bid_dollars'))  or to_cents(m.get('no_ask_dollars'))  or (100 - yes)
    return {'ticker': m['ticker'], 'title': m['title'], 'yes': yes, 'no': no}

@tree.command(name='kalshi', description='Scan Kalshi markets')
@app_commands.describe(topic='Filter by topic (e.g. BTC, inflation, recession)')
async def kalshi_cmd(interaction: discord.Interaction, topic: str = None):
    await interaction.response.defer()
    try:
        raw = fetch_markets()
        markets = [normalize(m) for m in raw]
        if topic:
            markets = [m for m in markets if topic.lower() in m['title'].lower()]
        markets.sort(key=lambda m: abs(m['yes'] - m['no']), reverse=True)
        top = markets[:10]
        lines = [f'📊 **Kalshi Top 10** (`{topic or "all"}`)']
        for m in top:
            e = abs(m['yes'] - m['no'])
            lines.append(f'• **{m["ticker"]}** — {m["title"]} — YES {m["yes"]}¢ / NO {m["no"]}¢ — Edge **{e}¢**')
        await interaction.followup.send('\n'.join(lines))
    except Exception as e:
        await interaction.followup.send(f'Error: {e}')

@tree.command(name='kalshi-detail', description='Get details for a specific market')
@app_commands.describe(ticker='Market ticker (e.g. KXBTC)')
async def detail_cmd(interaction: discord.Interaction, ticker: str):
    await interaction.response.defer()
    try:
        r = requests.get(f'https://external-api.kalshi.com/trade-api/v2/markets/{ticker}', timeout=10)
        m = r.json().get('market', {})
        yes = to_cents(m.get('yes_bid_dollars'))
        no  = to_cents(m.get('no_bid_dollars'))
        embed = discord.Embed(title=f'{m["ticker"]} — {m["ticker"]}', color=0x00f0ff)
        embed.add_field(name='YES', value=f'{yes}¢', inline=True)
        embed.add_field(name='NO', value=f'{no}¢', inline=True)
        embed.add_field(name='Edge', value=f'{abs(yes - no)}¢', inline=True)
        await interaction.followup.send(embed=embed)
    except Exception as e:
        await interaction.followup.send(f'Error: {e}')

@client.event
async def on_ready():
    await tree.sync()
    print(f'Logged in as {client.user}')

client.run(DISCORD_TOKEN)
```

---

## Option C: Telegram Bot

Telegram bots use a simple HTTP API and work well for push alerts + commands.

### 1. Create Bot via BotFather

1. Open Telegram → search **@BotFather**
2. `/newbot` → name it → copy the HTTP API token

### 2. Deploy

```bash
pip3 install python-telegram-bot requests
```

```python
# telegram_bot.py
import os, requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TELEGRAM_TOKEN = os.environ['TELEGRAM_BOT_TOKEN']
KALSHI_API = 'https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200'

async def scan(update: Update, context: ContextTypes.DEFAULT_TYPE):
    r = requests.get(KALSHI_API, timeout=10)
    markets = r.json().get('markets', [])
    top = sorted(markets[:20], key=lambda m: abs(
        round(float(m.get('yes_bid_dollars', 0)) * 100) -
        round(float(m.get('no_bid_dollars', 0)) * 100)
    ), reverse=True)[:10]
    lines = ['🔥 **Kalshi Top 10 by Edge**\n']
    for m in top:
        yes = round(float(m.get('yes_bid_dollars', 0)) * 100)
        no  = round(float(m.get('no_bid_dollars', 0)) * 100)
        lines.append(f'• {m["ticker"]}: YES {yes}¢ / NO {no}¢ — Edge {abs(yes-no)}¢')
    await update.message.reply_text('\n'.join(lines), parse_mode='Markdown')

app = Application.builder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler('scan', scan))
app.run_polling()
```

---

## Example: scan.py

A minimal scanner using a Discord webhook (no bot framework needed):

```python
#!/usr/bin/env python3
"""Kalshi market scanner — sends top-10 by edge to Discord via webhook."""

import os, json, requests
from datetime import datetime

WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL', '')
API = 'https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200'

def scan():
    resp = requests.get(API, timeout=10)
    resp.raise_for_status()
    markets = resp.json().get('markets', [])
    
    def to_cents(s):
        try: return round(float(s) * 100)
        except: return 50
    
    def edge(m):
        yes = to_cents(m.get('yes_bid_dollars')) or 50
        no  = to_cents(m.get('no_bid_dollars')) or (100 - yes)
        return abs(yes - no)
    
    top10 = sorted(markets, key=edge, reverse=True)[:10]
    
    lines = [f"🔥 **Kalshi Top 10 by Edge** — {datetime.now().strftime('%H:%M')}\n"]
    for m in top10:
        e = edge(m)
        yes = to_cents(m.get('yes_bid_dollars')) or 50
        no  = to_cents(m.get('no_bid_dollars')) or (100 - yes)
        lines.append(f"• **{m['ticker']}** — {m['title']}\n  YES {yes}¢ / NO {no}¢ • Edge **{e}¢**")
    
    payload = {'content': '\n'.join(lines)}
    r = requests.post(WEBHOOK_URL, json=payload, timeout=10)
    r.raise_for_status()
    print(f"Sent {len(top10)} markets to Discord")

if __name__ == '__main__':
    scan()
```

---

## Scheduling

### Cron (Linux/macOS)

```bash
# Every 15 minutes
crontab -e
# Add:
*/15 * * * * cd /home/donzzz/kalshi-bot && /usr/bin/python3 scan.py >> bot.log 2>&1
```

### systemd Timer (Linux)

```ini
# /etc/systemd/system/kalshi-scan.service
[Unit]
Description=Kalshi Market Scanner

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 /home/donzzz/kalshi-bot/scan.py
Environment=DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

```ini
# /etc/systemd/system/kalshi-scan.timer
[Unit]
Description=Run Kalshi scanner every 15 minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now kalshi-scan.timer
```

---

## Hermes Agent Integration

This explorer is designed to work with [Hermes Agent](https://github.com/DonZzzilla) — an AI agent framework running on a Raspberry Pi. With Hermes:

- The bot runs as a **cron job** or **Hermes cron skill**
- Market data is piped through Hermes' analysis layer for smarter filtering
- AI-generated summaries explain *why* a market moved (not just *what* moved)
- Trade journals are stored in SQLite on the Pi

### Hermes Cron Setup

```bash
# Create a Hermes cron job that runs the scanner
# In Hermes:
"Create a cron job named 'kalshi-scan' that runs every 15 minutes,
 executes python3 /home/donzzz/kalshi-bot/scan.py,
 and delivers results to Discord #zzzilla-reports channel."
```

---

## Alert Format Examples

### Simple Edge Alert

```
🔥 Kalshi Top 10 by Edge — 14:30

• KXBTC — Bitcoin Above 100K
  YES 18¢ / NO 82¢ • Edge 64¢
• KXDJIA — Dow Above 45000
  YES 12¢ / NO 88¢ • Edge 76¢
• KXETH — Ethereum Above 5000
  YES 48¢ / NO 52¢ • Edge 4¢
...
```

### Price Movement Alert (with Hermes AI)

```
⚡ PRICE ALERT: KXBTC

Bitcoin Above 100K just moved:
  22¢ → 18¢ (↓4¢) in the last hour
  Volume: $23M (above average)

🤔 Why it might have moved:
  Bitcoin is currently trading at $97,200,
  down 2% in the last 24 hours. The market
  is adjusting downward as the <100K-by-EOY
  probability decreases.

📊 Edge: 64¢ — worth watching.
```

### Social Intelligence Alert (with Hermes + xurl)

```
🚨 SOCIAL SIGNAL: Fed Governor hints at rate cut

Source: @fedchair (Federal Reserve)
Post: "Recent economic data suggests we may need to
reconsider the current rate path. More to come at
next week's meeting."

📊 Markets affected: KXRATE, KXFED, KXINFLATION
📈 Signal confidence: 82%
💡 Why: Fed officials rarely hint at policy shifts
   publicly. This suggests a rate cut is being
   considered, which would push "Fed rate below X%"
   markets higher.

⏱️ Market typically prices this in within 15-60 min.
   Current KXRATE price: 42¢ (was 38¢ yesterday)
```
