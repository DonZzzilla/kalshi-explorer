# Serving Static Sites for Remote Access

## Quick Serve with Python

When you need to make a static site (HTML/CSS/JS) accessible remotely from a Linux box:

```bash
# Kill anything on the desired port first
fuser -k 8080/tcp 2>/dev/null; sleep 1

# Serve a directory (background, so it survives terminal close)
# Use terminal(background=true) in Hermes:
cd /path/to/site && python3 -m http.server 8080 --bind 0.0.0.0
```

Then verify:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
```

Public URL: `http://<server-ip>:8080/`

## Finding the Server IP

```bash
hostname -I          # all IPs
curl -s https://api.ipify.org  # public IP
```

## Port Selection

| Port | Common Use |
|------|-----------|
| 80 | HTTP (often Pi-hole or other services) |
| 443 | HTTPS (often Pi-hole or other services) |
| 3000 | React dev server |
| 8080 | Common alt HTTP |
| 8090 | Hermes agent docs |
| 9120 | Zzzilla dashboard |

Check what's already listening: `ss -tlnp`

## Making It Permanent

For a systemd service that auto-restarts:

```ini
# /etc/systemd/system/boa-site.service
[Unit]
Description=BOA Partnership Site
After=network.target

[Service]
Type=simple
User=donzzz
WorkingDirectory=/home/donzzz/boa-partnership/docs
ExecStart=/usr/bin/python3 -m http.server 8080 --bind 0.0.0.0
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now boa-site
sudo systemctl status boa-site
```

## Verification Checklist

After serving a site:
1. `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/` → 200
2. Open in browser, check console for JS errors
3. Verify external accessibility: `curl -s http://<public-ip>:<port>/ | head`
4. Check all subresources load (images, diagrams, etc.)
