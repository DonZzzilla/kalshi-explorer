# Obsidian on Raspberry Pi 5 (ARM64)

Installing Obsidian desktop app on Raspberry Pi 5 (aarch64/Raspberry Pi OS).

## Requirements

- Raspberry Pi 5 with desktop environment (X11/Wayland)
- DISPLAY=:0 available
- ~200MB disk space (112MB AppImage + extracted files)

## Installation Steps

```bash
# Create apps directory
mkdir -p /home/donzzz/apps

# Download ARM64 AppImage via Python (write_file strips URLs)
python3 -c "
import urllib.request, os
url = 'https://github.com/obsidianmd/obsidian-releases/releases/download/v1.8.7/Obsidian-1.8.7-arm64.AppImage'
out = '/home/donzzz/apps/Obsidian.AppImage'
urllib.request.urlretrieve(url, out)
print('Done:', os.path.getsize(out), 'bytes')
"

# Extract AppImage (faster than running compressed every time)
mkdir -p /home/donzzz/apps/obsidian-extracted
cd /home/donzzz/apps/obsidian-extracted
/home/donzzz/apps/Obsidian.AppImage --appimage-extract

# Create launcher script
cat > /home/donzzz/apps/launch-obsidian.sh << 'EOF'
#!/bin/bash
export ELECTRON_DISABLE_GPU=1
export ELECTRON_DISABLE_HARDWARE_ACCELERATION=1
export DISPLAY=:0
cd /home/donzzz/apps/obsidian-extracted/squashfs-root
./obsidian --no-sandbox --disable-gpu "$@" 2>/dev/null &
EOF
chmod +x /home/donzzz/apps/launch-obsidian.sh
```

## GPU Errors (Expected)

On Pi 5, you'll see many `gbm_wrapper.cc` errors like:
```
Failed to get fd for plane: No such file or directory
Failed to export buffer to dma_buf: No such file or directory
```
These are **normal** — the Pi's GPU doesn't support all GBM operations Electron expects. The `--disable-gpu` and `ELECTRON_DISABLE_GPU=1` flags mitigate this. Obsidian will still work but uses software rendering (slower).

## First Launch

First launch takes 30-60 seconds on Pi 5. Obsidian creates config at `~/.config/obsidian/obsidian.json`.

If the app hangs on "Loading updated app package", ensure that file exists:
```bash
mkdir -p ~/.config/obsidian
echo '{"updateDisabled":true}' > ~/.config/obsidian/obsidian.json
```

## Obsidian Sync

Obsidian Sync is a paid subscription. Once the app opens:
1. Settings → Obsidian Sync → Sign in
2. Select vault / create new vault
3. Sync will download all cloud-backed notes

Notes are stored as plain Markdown files in the vault directory. The vault path becomes the integration point for Hermes's `obsidian` skill.

## Performance

Expect 2-4 second lag on UI interactions. This is normal for Electron on Pi 5. Avoid graph view with large vaults.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Window never appears | Check `DISPLAY` env var; try `DISPLAY=:0` explicitly |
| Crashes on launch | Add `--disable-gpu --disable-software-rasterizer` flags |
| Black/corrupted window | Remove `--disable-software-rasterizer` flag |
| "Loading app package" hangs | Create `~/.config/obsidian/obsidian.json` manually |
| Slow to launch | Pre-extract AppImage; use launcher script instead of running .AppImage directly |
