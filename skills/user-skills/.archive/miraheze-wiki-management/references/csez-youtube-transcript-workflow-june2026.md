# YouTube Transcript Workflow — Lessons Learned (June 2026)

## The Cookie Approach Works — With Caveats

**What works:**
1. User exports cookies from browser using "Get cookies.txt LOCALLY" extension
2. Saves as `youtube_cookies.txt`, copies to Pi
3. yt-dlp uses cookies: `yt-dlp --cookies youtube_cookies.txt --write-auto-sub ...`
4. JS challenge solver needed: install `deno` + enable `--remote-components ejs:github`

**Setup on Pi:**
```bash
# Install deno for JS challenge solving
curl -fsSL https://deno.land/install.sh | sh
# Add to PATH: export PATH="$HOME/.deno/bin:$PATH"

# Test with one video
yt-dlp --cookies youtube_cookies.txt \
  --write-auto-sub --sub-lang en --sub-format vtt --skip-download \
  --js-runtimes deno --remote-components ejs:github \
  -o "/tmp/test_%(id)s" \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

## What Doesn't Work

### fetch_transcript.py Bug
The `fetch_transcript.py` script at `~/.hermes/skills/media/youtube-content/scripts/fetch_transcript.py` has a bug:
```python
# BUG: result is a CompletedProcess, not a string
if result.returncode == 0 and result.strip():  # TypeError!
# FIX:
if result.returncode == 0 and result.stdout.strip():
```
Even after fixing, youtube-transcript-api gets **429 blocked** from the Pi's IP regardless of cookies.

### YouTube IP Blocking
YouTube blocks automated requests from datacenter/residential IPs. Even with valid cookies:
- Initial page request may authenticate
- Actual subtitle download returns **429 Too Many Requests**
- n-challenge requires JS runtime (deno) + remote solver components
- PO tokens now required for `web` client subtitles

## Recommended Workflow: Download on PC

The simplest approach that actually works:

1. On PC: Install yt-dlp (`pip install yt-dlp` or `brew install yt-dlp`)
2. Create `urls.txt` with one YouTube URL per line
3. Run: `yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download -a urls.txt`
4. Copy resulting `.vtt` files to the Pi
5. Parse with custom scripts

## Auto-Generated Caption Quality

YouTube auto-generated English captions are decent for quest guides:
- Quest names: usually accurate
- Map names: accurate (Suburb, Dam, Resort, etc.)
- Step-by-step instructions: fragmented but useful
- Proper nouns: sometimes garbled (e.g., "Coldheart Cash" instead of "Cold Hard Cash")
- Noise markers: `[music]`, `[sound effects]` need stripping

## URLs.txt Format for Batch Download

One URL per line:
```
https://www.youtube.com/watch?v=HvtEwmyPAWY
https://www.youtube.com/watch?v=byQDb-qvWCg
```

Usage: `yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download -a urls.txt`
