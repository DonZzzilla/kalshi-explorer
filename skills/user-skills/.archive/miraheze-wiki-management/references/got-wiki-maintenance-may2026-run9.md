# Ghosts of Tabor Wiki — Maintenance Run (May 30, 2026)

Follow-up maintenance sweep after the large May 29 run that added/categorized 50+ new pages.

## Fixes Applied (4 edits, all verified)

| Page | Issue | Fix |
|------|-------|-----|
| `Loot` | `[[Category:Items]]` and `[[Category:Game Mechanics]]` each appeared twice | Stripped all categories from wikitext, rebuilt with unique set via `text` param |
| `Echoes of AdvantEDGE` | Quest page, zero categories | Added `[[Category:Quests]]` |
| `Into the Depths` | Quest page, zero categories | Added `[[Category:Quests]]` |
| `Lost Contact` | Quest page, zero categories | Added `[[Category:Quests]]` |

## Key Observations

### `prop=categories` API Bug — Scale Confirmed
The `prop=categories` titles-batch API returned **429 out of 500 pages (86%) as uncategorized**. Raw wikitext verification of 10 randomly selected "uncategorized" pages confirmed ALL had proper `[[Category:]]` tags. This API is effectively unreliable for bulk categorization audits on this wiki.

**Reliable method**: Fetch raw wikitext via `action=parse&page=Title&prop=wikitext`, then:
```python
cats = re.findall(r'\[\[Category:([^\]]+)\]\]', text)
```

### Duplicate Category Detection
Full wiki scan of 500 pages found only 1 page (`Loot`) with duplicate categories. Previous session's deduplication work was thorough.

### Special Page Names
- `Special:PageswithBrokenFileLinks` — "No such special page" on got.miraheze.org. Do not navigate to this URL in the browser.
- `Special:BrokenRedirects` — Works, but cache was stale (listed `GoT Wiki Hub` as a broken target even though page exists at pageid 4080)
- QueryPage API `list=querypage&qppage=BrokenRedirects` returns `[]` (more reliable than the special page)

### Stale Cache on Special:BrokenRedirects
The Broken Redirects special page showed cached data from May 28 listing `GoT Wiki Hub` as a broken redirect target. `GoT Wiki Hub` exists as a content page (pageid 4080). Multiple BOA program redirects (`About BOA`, `BOA Ranks`, `BOA Program`, `Discord Rules`, `Hall of Fame`) all correctly redirect to it.

### BOA Program Content Status
All clean. Pages redirecting to GoT Wiki Hub:
- `About BOA` ✓
- `BOA Ranks` ✓
- `BOA Program` ✓
- `Discord Rules` ✓
- `Hall of Fame` ✓

New page `BOA Supply Drop` is a legitimate in-game quest (not BOA program content) — no action needed.

### Known Issues Requiring Human Review
- `Arty's Game bord` — Title typo ("bord" should be "board"). `Arty's Game board` doesn't exist. Correctly-spelled rename requires history preservation.
- 9 pages with bare Fandom URLs — Content quality issue, not breaking. Would need editorial rewrite.

## Wiki Stats (May 30, 2026)
- Articles: 737
- Edits: 20,421
- Users: 480
