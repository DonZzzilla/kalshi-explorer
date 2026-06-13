# Browser Console Batch Edit Pattern — Timestamped Video Links

Created 2026-06-04 after adding RadFox timestamps to 55 Maggie quest pages.

## Scenario

You have a list of wiki pages that need the same type of update: replacing non-timestamped YouTube URLs with timestamped ones (e.g., `watch?v=XXX` → `watch?v=XXX&t=153s`).

## Pattern: Fetch → Transform → Save Loop

```javascript
(async () => {
  // Fresh token for each batch
  const token = (await (await fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json', {credentials:'include'})).json()).query.tokens.csrftoken;
  
  const pagesToUpdate = [
    {title: 'Page Name', vid: 'VIDEO_ID', secs: 123},
    // ...
  ];
  
  const results = [];
  for (const p of pagesToUpdate) {
    // Fetch
    const gr = await fetch(`/w/api.php?action=query&titles=${encodeURIComponent(p.title)}&prop=revisions|info&rvprop=content&rvslots=main&format=json`, {credentials:'include'});
    const gj = await gr.json();
    const pg = gj.query.pages;
    const pid = Object.keys(pg)[0];
    if (pid === '-1') { results.push({title: p.title, error: 'not found'}); continue; }
    
    let content = pg[pid].revisions[0].slots.main['*'];
    const newUrl = `https://www.youtube.com/watch?v=${p.vid}&t=${p.secs}s`;
    
    // Skip if already has exact timestamp
    if (content.includes(newUrl)) { results.push({title: p.title, status: 'already done'}); continue; }
    
    // Update infobox video field
    if (content.includes('|video =')) {
      content = content.replace(/\|video = .*/, `|video = ${newUrl}`);
    }
    
    // Replace non-timestamped links (negative lookahead for &t=)
    content = content.replace(
      new RegExp(`https://www\\.youtube\\.com/watch\\?v=${p.vid}(?!&t=)`, 'g'),
      newUrl
    );
    
    // Save
    const sr = await fetch('/w/api.php?action=edit&format=json', {
      method: 'POST',
      body: new URLSearchParams({title: p.title, text: content, token, summary: 'Add timestamped video link', minor: '1'}),
      credentials: 'include'
    });
    const sj = await sr.json();
    results.push({title: p.title, status: sj.edit ? sj.edit.result : 'error'});
  }
  return results;
})()
```

## Batch Size Limit

**Max ~10 pages per `browser_console` call** before hitting the 30-second timeout. For larger batches, split into groups of 10 with separate calls.

## Timestamp Extraction from VTT Files

When YouTube auto-generated captions are available via VTT files (downloaded with `yt-dlp --write-auto-sub`):

1. Parse VTT files to extract `(timestamp, text)` pairs
2. Search for quest name mentions in the text
3. Use the first matching timestamp as the quest's start time
4. Convert `HH:MM:SS.mmm` to seconds for YouTube URL: `&t=SECONDSs`

**RadFox long-form videos** cover multiple quests each. Quest names are typically mentioned when the guide transitions to that quest. Some quests are NOT mentioned by exact name in captions (approx 50% find rate).

**Orbb_ single-quest videos** cover exactly one quest at timestamp 0:00. These don't need VTT parsing — just use `&t=0s`.

## Common Pitfalls

1. **CSRF token expires** — Get fresh token per batch, not per page
2. **Cross-origin blocked** — Navigate to wiki domain first, then use relative URLs
3. **Pages that don't exist** — Check `pageId !== '-1'` before editing
4. **Already-has-timestamp check** — Always check before replacing to avoid `nochange` saves
5. **Infobox + Video Guides mismatch** — Update both in the same edit call
6. **Parentheses in page titles** — Don't URL-encode the `titles` parameter, the API handles it
