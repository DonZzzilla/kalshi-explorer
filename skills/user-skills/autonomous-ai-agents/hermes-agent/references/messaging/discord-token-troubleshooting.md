# Discord Token Locations and Troubleshooting

## Token Files

| File | Path | Used By |
|------|------|---------|
| Gateway token | `~/.hermes/discord_bot_token.txt` | Hermes gateway process (authoritative) |
| Legacy/agent token | `~/.hermes/hermes-agent/.discord_bot_token` | Legacy/alternative; NOT used by gateway |

Both files contain 72-character ASCII strings. If they differ, the gateway token file is the one that matters.

## Common Failure: 403 Error 1010

Both tokens returning `{"error code": 1010}` on `GET /api/v10/users/@me` means:
- Token is expired or was regenerated at discord.com/developers
- Bot was removed from the target server
- Token was copied incorrectly (extra whitespace, missing characters)

**Fix:**
1. Go to https://discord.com/developers/applications → your bot → Bot tab
2. Click "Regenerate Token" (or copy the existing one)
3. Paste into `~/.hermes/discord_bot_token.txt` (overwrite, no trailing newline issues — but strip whitespace)
4. Ensure bot has been invited to the server with `bot` scope + `Send Messages` permission
5. Restart gateway: `hermes gateway run --replace`
6. Verify: `curl -H "Authorization: Bot $(cat ~/.hermes/discord_bot_token.txt | tr -d '[:space:]')" https://discord.com/api/v10/users/@me`

## Channel Discovery

Even with a valid token, `hermes send` requires channel discovery:
- Check `~/.hermes/channel_directory.json` — if `discord: []`, the gateway hasn't discovered channels
- The gateway must be running AND connected to Discord for discovery to populate
- `hermes send --list discord` will show "No messaging platforms configured" if discovery is empty

## send_message Tool (Preferred for Cron Jobs)

For cron jobs posting to Discord:
1. Add `hermes-discord` to the job's `enabled_toolsets` in `~/.hermes/cron/jobs.json`
2. Ensure `~/.hermes/config.yaml` has `platforms.discord.enabled: true` and a token
3. Agent calls `send_message(target="discord:CHANNEL_ID", message="...")`
4. This is more reliable than `hermes send` or raw REST API
