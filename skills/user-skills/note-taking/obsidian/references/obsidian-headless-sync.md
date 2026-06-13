# Obsidian Headless Sync — Cloud Vault on Headless Server

**Use case:** User has a paid Obsidian Sync subscription and wants Hermes to access their cloud-backed vault on a headless Pi/server.

## Why obsidian-headless

- Obsidian Sync has **no public REST/WebSocket API** — you can't call it directly.
- `obsidian-headless` is the **official CLI from `obsidianmd`** that syncs via the same protocol as the desktop app, without a GUI.
- Requires Node.js 22+ and a paid Sync subscription.

## Setup Steps

```bash
# 1. Install
npm install -g obsidian-headless

# 2. Login (interactive — prompts for email + password)
ob login

# 3. List your remote vaults
ob sync-list-remote

# 4. Create local vault directory
mkdir -p ~/obsidian-vault

# 5. Connect local dir to your remote vault
cd ~/obsidian-vault
ob sync-setup --vault "Your Vault Name"

# 6. Initial sync (downloads all cloud notes)
ob sync

# 7. Set OBSIDIAN_VAULT_PATH in Hermes config
echo 'OBSIDIAN_VAULT_PATH=/home/donzzz/obsidian-vault' >> ~/.hermes/.env
```

## Continuous Sync

### Option A: Background process
```bash
ob sync --continuous &
```

### Option B: Systemd service (recommended for servers)
```ini
# ~/.config/systemd/user/obsidian-sync.service
[Unit]
Description=Obsidian Sync
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/home/donzzz/.nvm/versions/node/v22.22.3/bin/ob sync --continuous
WorkingDirectory=/home/donzzz/obsidian-vault
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```
```bash
systemctl --user daemon-reload
systemctl --user enable --now obsidian-sync
sudo loginctl enable-linger $USER  # survive logout
```

## Alternative: Obsidian Desktop App on Pi 5

Already partially set up on this Pi (launcher exists at `~/apps/launch-obsidian.sh`). Requires `DISPLAY=:0` and is slower (Electron on ARM).

1. Run `/home/donzzz/apps/launch-obsidian.sh`
2. Sign in → Settings → Obsidian Sync → Sign in
3. Select vault → notes sync to local directory
4. Set `OBSIDIAN_VAULT_PATH` to that vault's path

## Hermes reads/writes the local directory

Once synced, Hermes's `obsidian` skill operates purely on the local `.md` files:
- `read_file`, `write_file`, `patch`, `search_files` — all work on the synced directory
- Changes made by Hermes → `ob sync --continuous` pushes them to cloud → appear on all devices
- Changes made on phone/desktop → Sync pulls them down → Hermes sees them on next read

No special API or cloud integration needed — it's just filesystem access + background sync.
