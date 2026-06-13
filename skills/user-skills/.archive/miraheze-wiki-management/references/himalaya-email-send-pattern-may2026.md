# Himalaya Email Send Pattern (Updated May 2026)

## ⚠️ himalaya `template send` Is Unreliable

The documented `himalaya template send` pattern **does not work reliably** in practice. Symptoms:
- "cannot parse template" error even with valid `From:`/`To:`/`Subject:` headers
- "cannot send message without a sender" error even with `From:` header present
- Behavior varies by himalaya version and config

**Use `msmtp` as the primary send method instead.**

## Working Pattern: msmtp via Python subprocess

```python
import subprocess

email_content = f"""From: donzzzilla@gmail.com
To: donzzzilla@gmail.com
Subject: {subject}

{body}"""

result = subprocess.run(
    ['msmtp', '-a', 'gmail', 'donzzzilla@gmail.com'],
    input=email_content,
    capture_output=True, text=True, timeout=30
)
# result.returncode == 0 means success
```

## Working Pattern: msmtp via file

```python
import tempfile, os

with tempfile.NamedTemporaryFile(mode='w', suffix='.eml', delete=False) as f:
    f.write(email_content)
    tmpfile = f.name

result = subprocess.run(
    ['msmtp', '-a', 'gmail', 'donzzzilla@gmail.com'],
    input=open(tmpfile).read(),
    capture_output=True, text=True, timeout=30
)
os.unlink(tmpfile)
```

## msmtp Config

Check `~/.msmtprc` or `/etc/msmtprc` for existing config. The Pi's config uses:
- Account: `gmail`
- Host: `smtp.gmail.com`
- Port: `587`
- Auth: `on`
- User: `donzzzilla@gmail.com`

## Cron Job Context

The daily animal fact emails (BOA Fauna Intel) use msmtp for delivery.
Three categories per email: spider, snake, creepy animal. No rotation — all 3 every day.
Format: Latin name, 1-3 sentences, GoT/BOA tactical connection. "The creepier the better."

## Key Points

- msmtp sends immediately (no draft step)
- Returns exit code 0 on success, nonzero on failure
- Pipe via stdin: `msmtp -a gmail recipient@example.com` with email content as stdin
- Headers required: `From:`, `To:`, `Subject:`
- Empty line after subject (separates headers from body)
