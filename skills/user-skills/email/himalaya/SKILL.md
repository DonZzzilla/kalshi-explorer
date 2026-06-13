---
name: himalaya
description: "Himalaya CLI: IMAP/SMTP email from terminal."
version: 1.1.0
author: community
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Email, IMAP, SMTP, CLI, Communication]
    homepage: https://github.com/pimalaya/himalaya
prerequisites:
  commands: [himalaya]
---

# Himalaya Email CLI

Himalaya is a CLI email client that lets you manage emails from the terminal using IMAP, SMTP, Notmuch, or Sendmail backends.

## References

- `references/configuration.md` (config file setup + IMAP/SMTP authentication)
- `references/message-composition.md` (MML syntax for composing emails)

## Prerequisites

1. Himalaya CLI installed (`himalaya --version` to verify)
2. A configuration file at `~/.config/himalaya/config.toml`
3. IMAP/SMTP credentials configured (password stored securely)

> **Pre-flight check.** Always verify `himalaya` is actually on PATH before
> attempting any operation: `which himalaya` or `himalaya --version`. The
> skill readiness check can report "available" even when the binary is
> missing — treat it as advisory, not authoritative. If the binary is
> missing, either install it (see below) or fall back to `msmtp`.

### Installation

> **Security note.** The `curl | sh` install pattern is blocked by Hermes
> security policy on most installations. Prefer one of these alternatives:
>
> ```bash
> # Option A: Download, inspect, then run manually
> curl -sSL -o /tmp/himalaya-install.sh \
>   https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh
> # Review the script, then:
> PREFIX=~/.local bash /tmp/himalaya-install.sh
>
> # Option B: cargo (requires Rust toolchain)
> cargo install himalaya --locked
>
> # Option C: Homebrew (macOS)
> brew install himalaya
> ```

```bash
# Pre-built binary (Linux/macOS — may be blocked by security policy)
curl -sSL https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh | PREFIX=~/.local sh
```

### Fallback: msmtp

If himalaya is unavailable and cannot be installed, `msmtp` (already
present on many systems) can send emails directly via SMTP. Check for
an existing config at `~/.msmtprc` or `/etc/msmtprc`:

```bash
# Check if msmtp is configured
cat ~/.msmtprc 2>/dev/null
```

If configured, send HTML email via msmtp:

```bash
cat << 'EOF' | msmtp -t recipient@example.com
To: recipient@example.com
From: you@example.com
Subject: Your Subject
Content-Type: text/html

<h2>Hello</h2>
<p>Email body here.</p>
EOF
```

Or pipe from a file (avoids heredoc issues with special characters):

```bash
cat /tmp/email.txt | msmtp -t recipient@example.com
```

> **When to use msmtp vs himalaya.** Use `msmtp` for simple sends when
> himalaya is unavailable. Use `himalaya` when you need IMAP operations
> (listing, searching, reading, moving emails) or advanced composition
> (MML attachments, replies with threading).

## Configuration Setup

Run the interactive wizard to set up an account:

```bash
himalaya account configure
```

Or create `~/.config/himalaya/config.toml` manually:

```toml
[accounts.personal]
email = "you@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.example.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "you@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "pass show email/smtp"

# Folder aliases (himalaya v1.2.0+ syntax). Required whenever the
# server's folder names don't match himalaya's canonical names
# (inbox/sent/drafts/trash). Gmail is the common case — see
# `references/configuration.md` for the `[Gmail]/Sent Mail` mapping.
folder.aliases.inbox = "INBOX"
folder.aliases.sent = "Sent"
folder.aliases.drafts = "Drafts"
folder.aliases.trash = "Trash"
```

> **Heads up on the alias syntax.** Pre-v1.2.0 docs used a
> `[accounts.NAME.folder.alias]` sub-section (singular `alias`).
> v1.2.0 silently ignores that form — TOML parses fine, but the
> alias resolver never reads it, so every lookup falls through to
> the canonical name. On Gmail this means save-to-Sent fails *after*
> SMTP delivery succeeds, and `himalaya message send` exits non-zero.
> Any caller (agent, script, user) that retries on that exit code
> will re-run the entire send — including SMTP — producing duplicate
> emails to recipients. Always use `folder.aliases.X` (plural, dotted
> keys, directly under `[accounts.NAME]`).

## Hermes Integration Notes

- **Reading, listing, searching, moving, deleting** all work directly through the terminal tool
- **Composing/replying/forwarding** — use `cat /tmp/email.txt | himalaya message send --` for sending composed emails. Do NOT use `himalaya template send` (broken). Do NOT pass message content as a command-line argument (panics). Interactive `$EDITOR` mode works with `pty=true` + background + process tool, but requires knowing the editor and its commands.
- Use `--output json` for structured output that's easier to parse programmatically
- The `himalaya account configure` wizard requires interactive input — use PTY mode: `terminal(command="himalaya account configure", pty=true)`

## Common Operations

### List Folders

```bash
himalaya folder list
```

### List Emails

List emails in INBOX (default):

```bash
himalaya envelope list
```

List emails in a specific folder:

```bash
himalaya envelope list --folder "Sent"
```

List with pagination:

```bash
himalaya envelope list --page 1 --page-size 20
```

### Search Emails

```bash
himalaya envelope list from john@example.com subject meeting
```

### Read an Email

Read email by ID (shows plain text):

```bash
himalaya message read 42
```

Export raw MIME:

```bash
himalaya message export 42 --full
```

### Reply to an Email

Build the reply manually and pipe via `himalaya message send --`:

```bash
cat << 'EOF' | himalaya message send --
From: you@gmail.com
To: sender@email.com
Subject: Re: Original Subject
In-Reply-To: <original-message-id>

Your reply here.
EOF
```

### Forward an Email

Build the forward manually and pipe via `himalaya message send --`:

```bash
cat << 'EOF' | himalaya message send --
From: you@gmail.com
To: newrecipient@email.com
Subject: Fwd: Original Subject

---------- Forwarded message ----------
From: original@email.com
Date: Mon, 1 Jan 2026 00:00:00 -0000
Subject: Original Subject

[Original message body here]
EOF
```

### Write a New Email

**Preferred method: pipe via `himalaya message send --`**. `himalaya template send` is broken (fails with "cannot parse template"). `himalaya message send` works when the raw message is piped via stdin — do NOT pass the message as a command-line argument (that panics).

**Step 1:** Compose the email to a temp file:

```bash
cat << 'EOF' > /tmp/composed_email.txt
From: you@gmail.com
To: recipient@gmail.com
Subject: Test Message
Content-Type: text/plain; charset=utf-8

Body text here.
EOF
```

**Step 2:** Pipe to himalaya:

```bash
cat /tmp/composed_email.txt | himalaya message send --
```

This sends via SMTP and saves a copy to Sent via IMAP in one step.

**Alternative: msmtp fallback** (reads SMTP from same `~/.config/himalaya/config.toml`):

```bash
cat /tmp/composed_email.txt | msmtp -t recipient@gmail.com
```

Or with attachment (MIME multipart via Python):

```python
import subprocess, base64

body = '''Content-Type: multipart/mixed; boundary="BDY"

--BDY
Content-Type: text/plain

Email body here.

--BDY
Content-Type: application/pdf; name="file.pdf"
Content-Disposition: attachment; filename="file.pdf"
Content-Transfer-Encoding: base64

''' + base64.b64encode(open('file.pdf','rb').read()).decode() + '''

--BDY--'''

subprocess.run(['msmtp', '-a', 'gmail', 'to@email.com'], input=body, text=True, timeout=30)
```

> **For simple non-interactive sends from Hermes:** Write to `/tmp/email.txt`, then `cat /tmp/email.txt | himalaya message send --` is the most reliable pattern. Never pass message content as a command-line argument to `message send`.

### Move/Copy Emails

Move to folder:

```bash
himalaya message move 42 "Archive"
```

Copy to folder:

```bash
himalaya message copy 42 "Important"
```

### Delete an Email

```bash
himalaya message delete 42
```

### Manage Flags

Add flag:

```bash
himalaya flag add 42 --flag seen
```

Remove flag:

```bash
himalaya flag remove 42 --flag seen
```

## Multiple Accounts

List accounts:

```bash
himalaya account list
```

Use a specific account:

```bash
himalaya --account work envelope list
```

## Attachments

Save attachments from a message:

```bash
himalaya attachment download 42
```

Save to specific directory:

```bash
himalaya attachment download 42 --dir ~/Downloads
```

## Output Formats

Most commands support `--output` for structured output:

```bash
himalaya envelope list --output json
himalaya envelope list --output plain
```

## Debugging

Enable debug logging:

```bash
RUST_LOG=debug himalaya envelope list
```

Full trace with backtrace:

```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

### Troubleshooting: "cannot send message without a sender"

`himalaya template send` does **not** auto-populate the `From:` header from your
account config. If you omit it from the piped message, the send fails:

```
Error: cannot send message without a sender
```

**Fix:** Always include an explicit `From:` header in the piped message body:

```bash
cat << 'EOF' | himalaya template send
From: you@example.com
To: recipient@example.com
Subject: Test

Message body here.
EOF
```

This applies to composed messages, not just `template send`/`message send` —
any piped message without `From:` will fail even if your account config has the
email address set.

### Troubleshooting: "cannot add message" on send

`template send` and `message send` do two things: SMTP-deliver the message **and**
save a copy to the Sent folder via IMAP. If the IMAP backend is not configured
at the account level (`[accounts.NAME].backend.*`), SMTP succeeds but the IMAP
save fails:

```
Error: cannot add message: feature not available, or backend configuration
for this functionality is not set
```

**Fix:** Add an IMAP `backend.*` block directly under `[accounts.NAME]`:

```toml
[accounts.NAME]
# ... email, default, etc ...

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.raw = "your-app-password"
```

See `references/` for a full working Gmail config and discussion of folder alias
gotchas.

---

### ⚠️ KNOWN BUG (June 2026): himalaya send commands crash when passed as argument — use stdin pipe

**`himalaya message send` panics when the message is passed as a command-line argument**, but **works correctly when piped via stdin**:

```bash
# ❌ CRASHES — argument-based (panics with index-out-of-bounds)
himalaya message send "$(cat /tmp/email.txt)"

# ✅ WORKS — stdin pipe (verified June 2026)
cat /tmp/email.txt | himalaya message send --
```

The `--` after `send` is important — it tells himalaya to read the raw message from stdin.

**`himalaya template send`** remains broken (fails with `cannot parse template`). Do not use.

**`himalaya send -s "subject" recipient@email`** does NOT work for composing messages with a body — the `-s` flag only sets headers on an empty template. Do not use.

#### Reliable send methods (in preference order)

**Method 1: himalaya message send via stdin pipe (preferred for full RFC 2822 messages)**

Compose a raw email with headers + body, save to file, then pipe:

```bash
cat << 'EOF' > /tmp/email.txt
From: you@gmail.com
To: recipient@gmail.com
Subject: Subject line
Content-Type: text/plain; charset=utf-8

Body text here.
EOF

cat /tmp/email.txt | himalaya message send --
```

This handles SMTP delivery AND saves to Sent folder via IMAP in one step.

**Method 2: msmtp (fallback when himalaya message send is unavailable)**

`msmtp` reads SMTP credentials from the same `~/.config/himalaya/config.toml`:

```bash
cat /tmp/composed_email.txt | msmtp -t recipient@gmail.com
```

Or via Python subprocess:

```python
import subprocess

email_text = """From: you@gmail.com
To: recipient@gmail.com
Subject: Subject line

Body text here."""

result = subprocess.run(
    ['msmtp', '-t', 'recipient@gmail.com'],
    input=email_text,
    capture_output=True, text=True, timeout=30
)
# exit code 0 = sent successfully
```

> **For cron jobs:** Use `cat /tmp/email.txt | himalaya message send --` for the most reliable automated send. Always write the composed email to a temp file first, then pipe. Never pass the message content as a command-line argument.

**Format**: Use plain text with markdown-style headers (e.g., `## Header`) for readability. Himalaya sends as plain text by default. For HTML email, add `Content-Type: text/html` header and use HTML formatting in the body.
- Message IDs are relative to the current folder; re-list after folder changes.
- For composing rich emails with attachments, use MML syntax (see `references/message-composition.md`).
- Store passwords securely using `pass`, system keyring, or a command that outputs the password.
