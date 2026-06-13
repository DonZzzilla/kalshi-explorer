# VTT Timestamp Extraction for Quest Videos (June 2026)

## Technique

Parse VTT transcript files to find the timestamp where each quest is first mentioned. Creates timestamped YouTube URLs (`?t=SECONDS`) so users jump to the relevant section.

## VTT Parsing with Deduplication

```python
import re

def parse_vtt_with_timestamps(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}[^\n]*\n([^\n]+)'
    matches = re.findall(pattern, content)
    results = []
    for ts, text in matches:
        clean = re.sub(r'<[^>]+>', '', text)
        clean = re.sub(r'&[a-z]+;', '', clean)
        clean = clean.strip()
        parts = ts.split(':')
        seconds = int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
        if clean and len(clean) > 3:
            results.append((seconds, clean))
    # Deduplicate: 65% word overlap threshold
    unique = []
    for sent in [(s, re.sub(r'\s+', ' ', t).strip()) for s, t in results]:
        is_dup = False
        for existing in unique:
            sw = set(sent[1].lower().split())
            ew = set(existing[1].lower().split())
            if len(sw) > 0 and len(sw & ew) / max(len(sw), 1) > 0.65:
                is_dup = True
                break
        if not is_dup and len(sent[1]) > 15:
            unique.append(sent)
    return unique
```

## Timestamp Search

```python
def find_quest_timestamp(segments, search_terms):
    for i, (seconds, text) in enumerate(segments):
        for term in search_terms:
            if term.lower() in text.lower():
                start = max(0, seconds - 5)
                for j in range(i, max(0, i-10), -1):
                    if 'task' in segments[j][1].lower():
                        start = max(0, segments[j][0] - 2)
                        break
                return (int(start), text[:80])
    return None
```

## YouTube URL Format

`https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDSs`

## Wiki Page Format

```wikitext
==Video Guides==

* [https://youtube.com/watch?v=XXX&t=479s Trader - Quest Name] (starts at 07:59)
* [https://youtube.com/watch?v=XXX Trader - Quest Name] (full video)

'''Full Guides:'''
* [https://youtube.com/watch?v=XXX RadFox: Trader's Missions Complete Guide]
```

## Coverage from 62 Transcripts

- Orbb_ dedicated videos: all at 00:00 (one quest per video)
- RadFox long-form: ~50% find rate (captions may not mention exact quest name)
- Total: 55/69 quests with timestamps
