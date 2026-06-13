# CSEZ YouTube Transcript Workflow

## Purpose
Fetch and parse YouTube video transcripts to extract structured quest data for the CSEZ wiki.

## Prerequisites
- `yt-dlp` installed on the machine doing the download
- `deno` installed for JS challenge solving (install: `curl -fsSL https://deno.land/install.sh | sh`)
- YouTube cookies exported from a browser where user is logged in

## Step 1: Export YouTube Cookies (on user's PC)
1. Install "Get cookies.txt LOCALLY" browser extension (Chrome/Firefox)
2. Log into YouTube in that browser
3. Go to youtube.com, click extension icon, export cookies
4. Save as `youtube_cookies.txt`, copy to Pi

## Step 2: Prepare URL List
Create `urls.txt` with one YouTube URL per line. Known useful channels:

| Channel | Content |
|---------|---------|
| @Orbb_ | 40+ ExfilZone quest guide videos |
| @RadFoxVRUniversity | Complete trader quest guides (all 6 traders), hideout, exchanges |

See `csez_quest_videos.txt` for the curated URL list (62 videos).

## Step 3: Download Transcripts
```bash
yt-dlp --cookies youtube_cookies.txt \
  --write-auto-sub --sub-lang en,ru --sub-format vtt \
  --skip-download \
  --js-runtimes deno --remote-components ejs:github \
  -a urls.txt
```

**⚠️ Without cookies, YouTube blocks from datacenter IPs (HTTP 429).**

## Step 4: Parse VTT Files
Use `scripts/parse_csez_transcripts.py` to:
1. Strip timestamps and HTML tags from VTT
2. Extract quest names, maps, items, POIs
3. Identify walkthrough steps (actionable segments)
4. Output structured JSON

## Step 5: Clean and Rewrite
Auto-generated captions are fragmented — sentences split across segments. Must:
1. Merge related segments into coherent sentences
2. Remove filler ("um", "uh", "[music]")
3. Fix speech-to-text errors ("Coldheart Cash" → "Cold Hard Cash")
4. Rewrite into clean wiki prose

## Step 6: Update Wiki
Match extracted data to existing wiki quest pages:
- Fill missing objectives/locations
- Add walkthrough notes
- Create new quest pages for missing quests
- Add "Walkthrough" links from quest tables

## Known Pitfalls
- `youtube-transcript-api` Python library is blocked by YouTube from datacenter IPs — use yt-dlp instead
- JS challenge requires `deno` + `--remote-components ejs:github`
- Web client requires PO tokens for subtitles — use `android` or `tv` client
- Russian creators may have RU captions only — fetch both `en` and `ru`
- VTT files are small (few KB each) — no storage concern
- Discord has 2000 char/message limit — split long posts into multiple messages
