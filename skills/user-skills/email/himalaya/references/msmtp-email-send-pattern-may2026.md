# himalaya template send — Unreliable, Use msmtp Instead

**Status:** Broken as of May-June 2026. `himalaya template send` fails with "cannot parse template" even on minimal valid email with proper `From:`, `To:`, `Subject:` headers. `himalaya message send` crashes with `index out of bounds: the len is 0 but the index is 0` panic.

**Use `msmtp` instead:**

```python
import subprocess

email_text = """From: you@gmail.com
To: recipient@gmail.com
Subject: Subject line

Body text here."""

result = subprocess.run(
    ['msmtp', '-a', 'gmail', 'recipient@gmail.com'],
    input=email_text,
    capture_output=True, text=True, timeout=30
)
# exit code 0 = sent successfully
```

**Requirements:**
- msmtp installed (`apt install msmtp`)
- `~/.config/himalaya/config.toml` configured with Gmail SMTP credentials under `[accounts.gmail]`
- Gmail app password in `backend.auth.raw`

**Why this works:** msmtp reads the SMTP config directly from himalaya's config.toml (they share the same account name). The `-a gmail` flag selects the account.

**Verified working (June 2026):** Successfully sent multi-section email with emoji, Unicode characters, and formatted text to donzzzilla@gmail.com using this pattern.

**⚠️ Do NOT use `himalaya template send` for cron jobs.** It will silently fail or produce errors. Always use msmtp via subprocess.
