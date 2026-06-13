# GoT Wiki Bot Corruption Fix & Cloudflare Tunnel Setup (May 26, 2026)

## Session Summary

Two major tasks completed in this session:

### 1. got.miraheze.org Wiki Content Fix

Fixed 190 pages with bot-induced content corruption on the Ghosts of Tabor wiki.
Three types of issues: literal `\n\n` text, `[[Magazines]][[Ammunition]]` duplicate links,
and duplicate `[[Category:X]]` tags. All pages verified clean after fix.

**Fix pattern:** Strip ALL categories from page bottom, extract unique set via `Set`,
rebuild footer: `text.replace(/\n?\[\[Category:[^\]]+\]\]/g, '')` then append unique cats.

**Key insight:** Use `text.replace(/\\n/g, '\n')` FIRST to fix literal backslash-n
before doing any category manipulation. The order matters.

### 2. Hermes Dashboard Cloudflare Tunnel Setup

User set up Cloudflare Zero Trust tunnel for Hermes dashboard access.
Dashboard (port 9119) was managed by PM2 which kept auto-restarting with old flags.
Fixed by: `pm2 stop hermes-dash && pm2 delete hermes-dash`, then starting with
`hermes dashboard --port 9119 --host 0.0.0.0 --insecure`.

**Key gotcha:** Hermes dashboard defaults to `--host 127.0.0.1` and rejects
requests with non-matching Host headers. Cloudflare tunnel forwards with the
public hostname, so the dashboard returns 400 "Invalid Host header".
The `--insecure` flag binds to 0.0.0.0 and accepts any Host header.
But `--insecure` flag requires killing the PM2-managed process first.
