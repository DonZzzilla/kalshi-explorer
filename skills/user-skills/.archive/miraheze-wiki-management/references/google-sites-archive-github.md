# Google Sites → GitHub Archive Pattern

Archiving a Google Sites (Classic) website to a GitHub private repository for preservation, migration, or domain transfer.

## Overview

Google Sites Classic serves pages with inline CSS/JS from Google's CDNs. A `wget` mirror captures the HTML structure and inlines resources, then pushes to a GitHub repo for version-controlled hosting.

## Step 1: Mirror the Site with wget

```bash
mkdir -p /home/donzzz/projects/<repo-name> && cd "$_"

wget \
  --mirror \
  --page-requisites \
  --adjust-extension \
  --no-parent \
  --convert-links \
  --wait=0.5 \
  --random-wait \
  --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  --domains=<yourdomain.org>,googleusercontent.com,gstatic.com,googleapis.com,google.com \
  --exclude-domains=accounts.google.com,apis.google.com,payments.google.com,ogs.google.com \
  --no-check-certificate \
  -e robots=off \
  --no-host-directories \
  --cut-dirs=0 \
  https://www.<yourdomain.org>/
```

### Flag Explanations

| Flag | Purpose |
|------|---------|
| `--mirror` | Recursive download with infinite depth |
| `--page-requisites` | Downloads CSS, JS, images needed to render pages |
| `--adjust-extension` | Adds `.html` to extensionless URLs |
| `--no-parent` | Doesn't ascend to parent directories |
| `--convert-links` | Rewrites links for offline/local viewing |
| `--wait=0.5 --random-wait` | Polite scraping (0.5s + random jitter) |
| `--domains=...` | Restrict to these domains + Google CDNs |
| `--exclude-domains=...` | Skip auth/payment/social domains |
| `-e robots=off` | Ignore robots.txt (archival use) |
| `--no-host-directories` | Flatten directory structure |

### Key Google CDN Domains to Include

Google Sites loads resources from:
- `googleusercontent.com` — user-uploaded images/files
- `gstatic.com` — Google's static asset CDN (fonts, icons, JS runtime)
- `googleapis.com` — Google APIs (auth, analytics, fonts)
- `google.com` — some cross-origin resources

### Google Analytics

The site may reference `googletagmanager.com` (gtag.js). This isn't needed for the static archive — it calls home to Google and won't work offline. It's fine to leave its JS tag in the HTML as-is; it degrades gracefully.

## Step 2: Check What Was Downloaded

```bash
find /home/donzzz/projects/<repo-name> -type f | sort
```

Typical output for a Google Sites site:
```
boa.html
boa/2024-05.html
boa/intro_v2.html
cdn-cgi/scripts/.../email-decode.min.js   # Cloudflare email obfuscation
crypto-calculator.html
index.html
nrs-calculator.html
timestamp-generator.html
```

**Google Sites inlines nearly everything** — CSS and JS are embedded directly in the HTML (typically 150-240KB per page). You won't see separate `.css` or `.js` files from Google Sites' runtime.

## Step 3: Check for External Resource References

```python
import os, re

project_dir = "/home/donzzz/projects/<repo-name>"
html = open(os.path.join(project_dir, "index.html")).read()

externals = set()
for attr in ['src="', 'href="']:
    for m in re.finditer(f'{attr}([^"]+)', html):
        url = m.group(1)
        if url.startswith('http') and '<yourdomain>' not in url and 'cdn-cgi' not in url:
            externals.add(url.split('?')[0])

for url in sorted(externals):
    print(f"  {url}")
```

Expected external resources for a Google Sites site:
- `https://apis.google.com/js/client.js` — Google APIs JS client
- `https://fonts.googleapis.com/css` — Google Fonts
- `https://www.googletagmanager.com/gtag/js` — Google Analytics
- `https://www.gstatic.com/_/atari/...` — Google Sites runtime JS/CSS
- External links (PayPal, Streamlabs, etc.) — user-added, not resources

## Step 4: Create GitHub Repo (Private)

```python
import urllib.request, json, os

# Read token from ~/.git-credentials
cred_file = os.path.expanduser("~/.git-credentials")
with open(cred_file) as f:
    line = f.read().strip().split('\n')[0]
    token = line.split('://')[1].split('@')[0].split(':')[-1]

repo_name = "<repo-name>"
repo_data = {
    "name": repo_name,
    "description": "...",
    "private": True,
    "auto_init": True,  # Creates initial README.md, .gitignore, LICENSE
    "has_issues": True,
    "has_wiki": False,
}

req = urllib.request.Request(
    "https://api.github.com/user/repos",
    data=json.dumps(repo_data).encode(),
    headers={
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "HermesAgent/1.0"
    }
)

with urllib.request.urlopen(req, timeout=15) as resp:
    response = json.loads(resp.read().decode())
    print(f"Repo created: {response.get('html_url')}")
    print(f"Clone URL: {response.get('clone_url')}")
```

## Step 5: Initialize Git and Push

```bash
cd /home/donzzz/projects/<repo-name>

# Initialize git
git init
git remote add origin https://github.com/<user>/<repo>.git

# Fetch the auto-init commit (if auto_init=True)
git fetch origin
git checkout -b main

# Stage and commit all site files
git add -A
git commit -m "Initial commit: archive of <domain> from Google Sites"

# Rebase on top of auto-init (preserves README, .gitignore, LICENSE)
git rebase origin/main

# Push
git push -u origin main
```

### Why Rebase?

With `auto_init=True`, GitHub creates an initial commit with `README.md`, `.gitignore`, and `LICENSE`. Our local commit has the site files but diverges from the remote. `git rebase origin/main` replays our commit on top of the remote's initial commit, so both sets of files coexist.

## Step 6: Enable GitHub Pages (Optional)

Pages requires the repo to be **public** for free accounts (GitHub Pro needed for private). Once public, enable Pages in Settings → Pages → Deploy from `main` branch → `/` (root).

For custom domain: add a `CNAME` record at your DNS provider pointing to `<user>.github.io`, then set the custom domain in GitHub Pages settings.

## Pitfalls

### 1. Google Sites CDN Cache
Google Sites resources are served from Google's CDN. The HTML you download might reference specific versioned URLs (hashed filenames). These won't change retroactively, so the archive remains valid, but re-running wget later might get different versioned files.

### 2. Inline Resources
Google Sites inlines most CSS/JS — the HTML files are self-contained for styling but won't be editable in a normal HTML editor. The inline `<style>` blocks are huge (thousands of lines).

### 3. Google Analytics / Tracking
The gtag.js script in the HTML phones home to Google. Remove it from the HTML if you want a fully standalone archive:
```python
html = re.sub(
    r'<script[^>]*async[^>]*src="https://www.googletagmanager.com/gtag/js[^"]*"[^>]*></script>',
    '',
    html
)
html = re.sub(r'<script[^>]*>\s*window\.dataLayer\s*=.*?</script>', '', html, flags=re.DOTALL)
```

### 4. Git Credentials
The script reads the token from `~/.git-credentials`. The credential helper must be set to `store` (`git config --global credential.helper store`) with the token already saved. The token type should be a classic PAT (`ghp_...`) with `repo` scope for private repos.

### 5. Merge Conflicts
If you don't use `auto_init=True`, the remote will be empty and you can `git push -u origin main` without rebasing. With `auto_init=True`, the rebase step is essential.

### 6. Token Visibility
The token is stored in plaintext in `~/.git-credentials`. Be careful not to expose it in tool output. The `write_file` tool strips token-like sequences — reading from the file at runtime via Python is safer.
