---
name: cloudflare-tunnel-expose
description: Expose local services (dashboards, APIs, web apps) to the internet through an existing Cloudflare tunnel — reverse proxy patterns, token-managed tunnel constraints, CGNAT pitfalls, and path-based routing for multiple services behind one tunnel hostname.
---

# Cloudflare Tunnel — Expose Local Services

When you need to make a local service (dashboard, API, etc.) accessible from the internet and the Pi/host already has a Cloudflare tunnel (`cloudflared`).

## Key Constraints

### Token-Managed Tunnels
- If `cloudflared.service` runs with `--token <JWT>`, the tunnel ingress rules are managed in the **Cloudflare Zero Trust dashboard** — not locally.
- `cloudflared tunnel list` and `cloudflared tunnel info` **do not work** with token-based tunnels.
- You **cannot** add hostname-to-origin mappings from the CLI. The user must do it in the Cloudflare dashboard.
- The local config may be at `/etc/cloudflared/config.yml` but is often absent for token-managed tunnels.

### CGNAT Detection
- Check "public" IP with `curl https://api.ipify.org` — if it starts with `100.`, `10.`, `172.16-31.`, or `192.168.`, it's behind CGNAT.
- Direct port forwarding from the internet **will not work** through CGNAT — Cloudflare tunnel is the correct solution.

## Common Pattern: Multi-Service Reverse Proxy

When a tunnel points to one origin port (e.g., `http://127.0.0.1:9119`) but you need to expose multiple services:

1. Move the existing service on the tunneled port to a new internal port (e.g., `9118`)
2. Write a lightweight reverse proxy on the original tunneled port that routes by URL path
3. The existing cloudflared config doesn't change — it still points to the same port

### Proxy: Use aiohttp (NOT http.server)

**Pitfall:** Many local dashboards (especially Hermes) use WebSocket connections for real-time features (chat tabs, live logs). Python's `http.server` proxy cannot handle WebSocket upgrades. Use `aiohttp` instead.

**Critical:** `aiohttp` is NOT available in the Raspberry Pi's system Python. You MUST use the Hermes venv Python for the proxy service:

```
ExecStart=/home/donzzz/.hermes/hermes-agent/venv/bin/python3 /path/to/proxy.py
```

NOT `/usr/bin/python3` — it will crash with `ModuleNotFoundError: No module named 'aiohttp'`.

Save the proxy script to `/home/donzzz/scripts/dashboard-proxy/proxy.py` and save the systemd unit to `/etc/systemd/system/dashboard-proxy.service`. See `templates/` for both files.

### Templates

- `templates/proxy.py` — aiohttp reverse proxy with WebSocket support, routes `/` to service A and `/status` to service B
- `templates/dashboard-proxy.service` — systemd unit using the venv Python

## Service Port Reference (Zzzilla Pi)

| Port | Service | Service File |
|------|---------|-------------|
| 9119 | Cloudflare tunnel target (reverse proxy) | `/etc/systemd/system/dashboard-proxy.service` |
| 9118 | Hermes dashboard (behind proxy) | `/etc/systemd/system/hermes-dashboard.service` |
| 9120 | Zzzilla status dashboard | `/etc/systemd/system/zzzilla-dashboard.service` |
| 3000 | Unknown — investigate if needed | - |
| 8090 | Unknown Python service | - |

## Adding a New Service to the Tunnel

1. **Stop** the service on the tunneled port (e.g., `sudo systemctl stop hermes-dashboard`)
2. **Check `ss -tlnp`** — confirm the port is free
3. Update the moved service's port (e.g., in its `ExecStart` arg) and restart it
4. Update the proxy to route a new path prefix to the new backend port
5. Restart the proxy: `sudo systemctl restart dashboard-proxy`
6. **Verify** by curling each port locally, then test the public URL

## Sudo Required for Systemd Files in /etc/systemd/system/

Writing to `/etc/systemd/system/` requires sudo. The agent's terminal tool blocks sudo commands — the user must run them manually. Provide the commands clearly, one at a time, and ask the user to copy-paste them. Example workflow:

```bash
sudo cp /home/donzzz/dashboard-proxy.service /etc/systemd/system/dashboard-proxy.service
sudo systemctl daemon-reload
sudo systemctl restart dashboard-proxy
```

## Troubleshooting

| Symptom | Check |
|---------|-------|
| `ERR_CONNECTION_REFUSED` from cloudflared | The origin service on that port is down — `sudo systemctl status <service>` |
| `502 Bad Gateway` from proxy | Backend service (9118/9120) is not running |
| Proxy crashes with `ModuleNotFoundError` | Wrong Python — use venv Python, not `/usr/bin/python3` |
| WebSocket features broken (chat tab, live logs) | Proxy doesn't support WS — must use `aiohttp` proxy, not `http.server` |
| Cloudflared keeps restarting | Token may be invalid or network is down — check `journalctl -u cloudflared` |
| Public URL works locally but not externally | CGNAT — tunnel is the only way; verify cloudflared is connected in its logs |
| Service not starting after reboot | Check `sudo systemctl is-active <service>` and `journalctl -u <service>` |

## See Also

For full Cloudflare tunnel setup docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
