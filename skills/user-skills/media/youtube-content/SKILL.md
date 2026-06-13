---
name: youtube-content
description: "YouTube transcripts to summaries, threads, blogs."
platforms: [linux, macos, windows]
---

# YouTube Content Tool

## When to use

Use when the user shares a YouTube URL or video link, asks to summarize a video, requests a transcript, or wants to extract and reformat content from any YouTube video. Transforms transcripts into structured content (chapters, summaries, threads, blog posts).

Extract transcripts from YouTube videos and convert them into useful formats.

## Setup

```bash
pip install youtube-transcript-api
```

## Helper Script

`SKILL_DIR` is the directory containing this SKILL.md file. The script accepts any standard YouTube URL format, short links (youtu.be), shorts, embeds, live links, or a raw 11-character video ID.

```bash
# JSON output with metadata
python3 SKILL_DIR/scripts/fetch_transcript.py "https://youtube.com/watch?v=VIDEO_ID"

# Plain text (good for piping into further processing)
python3 SKILL_DIR/scripts/fetch_transcript.py "URL" --text-only

# With timestamps
python3 SKILL_DIR/scripts/fetch_transcript.py "URL" --timestamps

# Specific language with fallback chain
python3 SKILL_DIR/scripts/fetch_transcript.py "URL" --language tr,en
```

## Output Formats

After fetching the transcript, format it based on what the user asks for:

- **Chapters**: Group by topic shifts, output timestamped chapter list
- **Summary**: Concise 5-10 sentence overview of the entire video
- **Chapter summaries**: Chapters with a short paragraph summary for each
- **Thread**: Twitter/X thread format — numbered posts, each under 280 chars
- **Blog post**: Full article with title, sections, and key takeaways
- **Quotes**: Notable quotes with timestamps

### Example — Chapters Output

```
00:00 Introduction — host opens with the problem statement
03:45 Background — prior work and why existing solutions fall short
12:20 Core method — walkthrough of the proposed approach
24:10 Results — benchmark comparisons and key takeaways
31:55 Q&A — audience questions on scalability and next steps
```

## Workflow

1. **Fetch** the transcript using the helper script with `--text-only --timestamps`.
2. **Validate**: confirm the output is non-empty and in the expected language. If empty, retry without `--language` to get any available transcript. If still empty, tell the user the video likely has transcripts disabled.
3. **Chunk if needed**: if the transcript exceeds ~50K characters, split into overlapping chunks (~40K with 2K overlap) and summarize each chunk before merging.
4. **Transform** into the requested output format. If the user did not specify a format, default to a summary.
5. **Verify**: re-read the transformed output to check for coherence, correct timestamps, and completeness before presenting.

## Error Handling

- **Transcript disabled**: tell the user; suggest they check if subtitles are available on the video page.
- **Private/unavailable video**: relay the error and ask the user to verify the URL.
- **No matching language**: retry without `--language` to fetch any available transcript, then note the actual language to the user.
- **Dependency missing**: run `pip install youtube-transcript-api` and retry.

### IP-Blocked by YouTube (HTTP 429 / "blocking requests from your IP")

YouTube aggressively rate-limits automated transcript requests from datacenter and some residential IPs. Symptoms:
- `youtube-transcript-api` returns "YouTube is blocking requests from your IP"
- `yt-dlp --write-auto-sub` returns `HTTP Error 429: Too Many Requests`
- Empty transcripts for videos that definitely have captions

**Workaround priority order:**

1. **yt-dlp with android player client** (bypasses some blocks):
   ```bash
   yt-dlp --write-auto-sub --sub-lang ru,en --sub-format vtt --skip-download \
     --extractor-args "youtube:player_client=android" \
     -o "/tmp/yt_%(id)s" "https://youtube.com/watch?v=VIDEO_ID"
   ```
   Still may get 429 on heavily flagged IPs. Add sleep 10-30 between requests.

2. **Cookie export** (most reliable): Log into YouTube on a desktop browser, then:
   ```bash
   # Export cookies using browser extension (e.g., "Get cookies.txt LOCALLY" for Chrome)
   # Save to ~/youtube_cookies.txt
   yt-dlp --cookies ~/youtube_cookies.txt --write-auto-sub --sub-lang en --sub-format vtt \
     --skip-download -o "/tmp/yt_%(id)s" "URL"
   ```

3. **Invidious fallback** (unreliable — most instances disable captions):
   ```bash
   curl -s "https://inv.nadeko.net/api/v1/videos/VIDEO_ID/captions"
   ```

4. **Desktop download**: Run yt-dlp on a non-flagged PC and transfer `.vtt`/`.srt` files to the Pi.

5. **Mobile hotspot**: Temporarily route Pi through a phone hotspot for a different IP.

**Rate limiting mitigation:** Even with workarounds, add delays:
- 30+ seconds between requests for youtube-transcript-api
- 3-5 seconds between requests for yt-dlp (but still may 429 in bulk)
- Fetch ≤20 videos per session; split large batches across multiple runs

### yt-dlp JS Challenge / PO Token Requirements (2026)

As of mid-2026, YouTube requires JavaScript challenge solving and PO tokens for subtitle downloads:

**Android client (recommended for auto-subs):**
```bash
# Install deno for JS challenge solving
curl -fsSL https://deno.land/install.sh | sh

# Fetch with android client + JS solver
export PATH="$HOME/.deno/bin:$PATH"
yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download \
  --js-runtimes deno --remote-components ejs:github \
  --extractor-args "youtube:player_client=android" \
  -o "/tmp/yt_%(id)s" "URL"
```

**Web client requires PO tokens for subs** — auto-subs are discarded without a PO Token. Use android client instead.

**VTT file naming:** yt-dlp names subtitle files as `output_base.en.vtt` or `output_base.ru.vtt` — the language code is inserted before `.vtt`. Use `glob.glob("*.vtt")` to find the actual file.

**Windows note:** If `yt-dlp` command not found, use `python -m yt_dlp` instead. On the user's Windows Git Bash, `python -m yt_dlp --version` worked but bare `yt-dlp` did not.

### Bulk Transcript Scraping Script

For fetching transcripts from many videos (e.g., all quest guides from a channel), use a Python script with:
- `glob.glob()` to check for existing files (skip already-fetched)
- `time.sleep(3)` between requests
- Error handling per video (don't let one failure stop the batch)
- Output naming: `{creator}_{video_id}_{lang}.vtt`

See `discord-bot-builder` skill's `references/csez-youtube-transcript-workflow-june2026.md` for the full batch script and quest extraction pipeline.

When extracting structured game info (quest steps, locations, POIs) from YouTube guides:

1. **Get video list**: Use `yt-dlp --flat-playlist --print "%(id)s %(title)s"` on the channel's `/videos` page
2. **Filter for relevant videos**: Match titles against known quest/location names (e.g. "Taste of Life", "Signal Supplies", "Coastal Antenna")
3. **Fetch transcripts** (see IP block workarounds above)
4. **Extract structured info** from transcript text:
   - Quest name (from video title)
   - Location names (capitalized proper nouns + map names)
   - Item names + quantities (patterns like "bring 3x" or "find the")
   - POI descriptions ("behind the building", "upstairs", "in the basement")
5. **Output wiki-ready format**: Quest name → Location → Steps → Items needed
6. **Credit the source**: Add `Source: [YouTube title](url) by @CreatorName` in edit notes

**Note:** Russian-speaking creators (e.g. RadFox, Orbb_) have auto-generated captions primarily in Russian. Use `--lang ru,en` with yt-dlp to get Russian captions, then translate if needed.

## Twitch VOD Transcription

Twitch VODs don't have accessible auto-generated subtitles through any API. The only approach is to download the audio and run speech-to-text locally with `faster-whisper`.

### Prerequisites

```bash
pip install --break-system-packages faster-whisper
pip install --break-system-packages yt-dlp
```

### Step 1: Download VOD audio

```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "twitch_vod_%(id)s.%(ext)s" "https://www.twitch.tv/videos/VIDEO_ID"
```

Get VOD info first:
```bash
yt-dlp --no-download --print "%(title)s|%(duration)s" "URL"
```

### Step 2: Transcribe

Use `small` model for speed on CPU. `medium` is 3-4x slower with marginal accuracy gain for conversational speech.

```python
from faster_whisper import WhisperModel

model = WhisperModel('small', device='cpu', compute_type='int8')
segments, info = model.transcribe('twitch_vod_VIDEO_ID.mp3', beam_size=5)

with open('/tmp/transcript.txt', 'w', buffering=1) as f:
    for segment in segments:
        mins, secs = int(segment.start // 60), int(segment.start % 60)
        line = f'[{mins:02d}:{secs:02d}] {segment.text.strip()}'
        print(line, flush=True)
        f.write(line + '\n')
```

**Critical:** Use `buffering=1` in `open()` and `flush=True` in `print()`. Without this, the file stays empty until the process completes, making it appear the transcription isn't working.

### Step 3: Email the transcript

himalaya send commands are broken in 2026. Use msmtp:

```bash
cat /tmp/email_body.txt | msmtp -t recipient@example.com
```

### Performance expectations

| Audio duration | Model | CPU time (approx) |
|---|---|---|
| 10 min | small | 2-3 min |
| 47 min | small | 15-20 min |
| 47 min | medium | 60-90 min |

Run in background with `notify_on_complete=true` for long transcriptions.

### Pitfalls

- **Output buffering**: Always use `buffering=1` and `flush=True` when writing transcription to file in real-time
- **yt-dlp on Pi**: May timeout on very long VODs. Use `--retries 3 --fragment-retries 3`
- **Language**: Twitch VODs with mostly speech detect English reliably. For non-English, pass `--language xx` to `transcribe()`
