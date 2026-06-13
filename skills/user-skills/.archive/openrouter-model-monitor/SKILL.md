---
name: openrouter-model-monitor
description: Monitor OpenRouter model availability and send Discord alerts when a model transitions from down to up. Trigger when the user wants to monitor an OpenRouter model, set up uptime alerts, or configure fallback providers.
---

# OpenRouter Model Uptime Monitor

Monitor OpenRouter model availability via the models API and send Discord notifications when a model comes back online.

## Quick Start

1. **Script:** `/home/donzzz/.hermes/scripts/owl_alpha_monitor.py`
2. **Cron job:** runs every 30 minutes
3. **State file:** `/tmp/owl_alpha_state.json`

## How It Works

### Model Availability Check

Query the OpenRouter models API:
```
GET https://openrouter.ai/api/v1/models
Authorization: Bearer <key>
```

Parse the JSON response and look for the model ID. Check `pricing.prompt == "0"` and `pricing.completion == "0"` to confirm it is free.

**Why not the uptime page?** The uptime page (`/openrouter/<model>/uptime`) is a React SPA requiring JS rendering. The models API is plain JSON.

### State Machine

Track state in a JSON file:
```json
{"last_known": "unknown|up|down", "notified_available": false, "last_check": "ISO-8601"}
```

Only notify on `down → up` transition. Reset `notified_available` to `false` when model goes down again so future recoveries trigger a new alert.

### Discord Notification

**Use `requests` library, NOT `urllib`.** `urllib` gets error 1010 from Discord unless you spoof `User-Agent: curl/7.68.0`. `requests` works out of the box.

```python
import requests
r = requests.post(
    f"https://discord.com/api/v10/channels/{channel_id}/messages",
    headers={"Authorization": f"Bot {token}", "Content-Type": "application/json"},
    json={"content": message[:2000]},
    timeout=15
)
```

For DM: `POST /users/@me/channels` with `recipient_id` to get a DM channel ID, then post to that channel.

### Token Locations

- **OpenRouter API key:** Injected by gateway process (not stored in files)
- **Discord bot token:** `~/.hermes/hermes-agent/.discord_bot_token`

## Fallback Provider Configuration

When the primary model is down, add a fallback to `config.yaml`:

```yaml
fallback_providers:
  - provider: openrouter
    model: nvidia/nemotron-3-ultra-550b-a55b:free
  - provider: google
    model: google/gemini-2.0-flash
```

**Steps:**
1. Edit `/home/donzzz/.hermes/config.yaml` (protected file — see editing notes below)
2. Verify: `hermes config check`
3. Apply: `hermes gateway restart`

**Note:** `config.yaml` is a protected file. The Hermes agent's `patch` tool cannot edit it directly. Use terminal commands.

### ⚠️ CRITICAL: `hermes config set` Corrupts YAML Lists

`hermes config set fallback_providers '[...]'` stores the value as a **string literal**, not a YAML list. This breaks the fallback chain.

**Correct method** — use Python yaml module from terminal:
```bash
python3 -c "
import yaml
with open('.hermes/config.yaml', 'r') as f:
    config = yaml.safe_load(f)
config['fallback_providers'] = [
    {'model': 'nvidia/nemotron-3-ultra-550b-a55b:free', 'provider': 'openrouter'},
    {'model': 'google/gemini-2.0-flash', 'provider': 'google'}
]
with open('.hermes/config.yaml', 'w') as f:
    yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
"
```

### Google Gemini Provider Setup

To add Google as a fallback provider:

1. Get a free API key from https://aistudio.google.com/app/apikey (no credit card)
2. Add to Hermes credential store: `hermes auth add google --api-key <key>`
3. Add to `~/.hermes/.env`: `GOOGLE_API_KEY=<key>` (uncomment existing line)
4. Add provider block to `config.yaml`:
   ```yaml
   providers:
     google:
       base_url: https://generativelanguage.googleapis.com/v1beta
   ```
5. Add `google/gemini-2.0-flash` to `fallback_providers` (using Python yaml method above)

**Google free tier limitations:**
- ✅ Text generation (Gemini 2.0 Flash, 60 req/min, 1M context)
- ❌ Image generation (Nano Banana / Imagen requires paid Google Cloud billing)
- ❌ Model listing via API (returns 403 — use known model IDs)

### Config Version Migration

When Hermes updates, config may need migration:
```bash
hermes config migrate
```
This adds new config options and updates the version number. Run after any Hermes update.

## Verified Fallback Chain (June 2026)

- **Primary:** `openrouter/owl-alpha` (OpenRouter)
- **Fallback 1:** `nvidia/nemotron-3-ultra-550b-a55b:free` (416B params, 1M context, free on OpenRouter)
- **Fallback 2:** `google/gemini-2.0-flash` (Google AI Studio, 60 req/min, 1M context, free)
- **Config:** `fallback_providers` in `~/.hermes/config.yaml`
```
CRITICAL: Only report if there is an actual issue — downtime, errors,
elevated latency, or anything abnormal. If everything is normal and
healthy, respond with SILENT (just say "SILENT" and nothing else).
Do NOT send routine "all good" status reports. Only alert on problems.
```

This works because cron jobs with `deliver: origin` only deliver non-empty responses. A "SILENT" response is treated as empty/no-delivery by most platforms.

**Verified fallback chain (June 2026):**
- Primary: `openrouter/owl-alpha`
- Fallback: `nvidia/nemotron-3-ultra-550b-a55b:free` (416B params, 1M context, free on OpenRouter)
- Config: `fallback_providers` in `~/.hermes/config.yaml`

## References

- `references/openrouter-model-monitoring-june2026.md` — Full pattern details, code examples, and pitfalls
