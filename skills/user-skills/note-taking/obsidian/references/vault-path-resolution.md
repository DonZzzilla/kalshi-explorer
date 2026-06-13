# Obsidian Vault Path Resolution

## Common Vault Locations

When `OBSIDIAN_VAULT_PATH` is not set and `~/Documents/Obsidian Vault` does not exist, check these common locations:

| Path | Typical Setup |
|------|---------------|
| `~/obsidian` | Simple manual setup |
| `~/notes` | Common shorthand |
| `~/vault` | Some users prefer this |
| `~/Documents/Obsidian` | Without "Vault" suffix |
| `~/.config/obsidian` | Obsidian config dir (check `obsidian.json` for vault path) |

## Cloud-Only Vaults (Obsidian Sync / Obsidian.net)

If the user pays for Obsidian Sync (cloud backup), the vault may **not be synced to the Pi at all**. In that case:

1. **Don't assume the vault is on this machine.** Ask the user if the vault exists locally and where.
2. If the vault is NOT local, the Obsidian skill cannot access it — tell the user and stop.
3. If the user wants the agent to read their notes, they need either:
   - A local clone of the vault (e.g., via git or Obsidian Sync on the Pi)
   - OR use **Hermes Console for Obsidian** (desktop app) which captures cursor/selection context and sends it to the agent live
4. Obsidian Sync can sync to the Pi if the Obsidian app is installed there — check for the vault path in that case.

## Resolving vault path via `obsidian.json`

Obsidian stores vault metadata in a config file. On Linux:

```bash
cat ~/.config/obsidian/obsidian.json
```

This is a JSON file with a `"vaults"` object. Each key is a vault ID, and each value has a `"path"` field with the absolute vault path. Use this to auto-detect when `OBSIDIAN_VAULT_PATH` is unset.

## Obsidian Context via Hermes Console

When the user has **Hermes Console for Obsidian** installed on their desktop:

- The agent can receive live cursor/selection context via `obsidian_context()`
- This works even when the vault is NOT on the Pi — the context is captured on the desktop and injected into the agent session
- This is the preferred integration path for users whose vaults are on a different machine

## Error Message When Vault Not Found

If you try to read/list/search notes and the vault path doesn't exist, tell the user clearly:

"I couldn't find your Obsidian vault at [path]. Is the vault synced to this machine? If not, you can either:
1. Install Obsidian on this Pi and sync your vault here, or
2. Use Hermes Console for Obsidian on your desktop to share note context directly."
