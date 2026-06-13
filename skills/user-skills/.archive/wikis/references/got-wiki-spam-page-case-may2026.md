# GoT Wiki Spam/Joke Page Case — May 2026

## Magical-Fix-Game-Button

### What happened
- Page created by anonymous user, contained only a YouTube link styled as a "🔧 Fix Game Button" with fake links to Magazines, Ammunition, Tech Support
- Page was deleted, then restored by admin ZeroSkills as a "community joke page (per DonZzzilla)"
- Cron maintenance pass identified it as genuinely spam-like (no wiki content, just a YouTube redirect)
- **Resolution**: Replaced content with `#REDIRECT [[Ghosts of Tabor Wiki]]` to clean up while preserving link integrity

### Pattern: Spam/Joke Pages
- Look for pages with only external links, no wiki content, no infobox
- Check `Special:Contributions/<username>` for the creator's other edits
- If a page was previously deleted and restored as a "joke", evaluate whether it has any actual wiki value
- When in doubt, redirect to the wiki main page rather than leaving spam content

### Detection
- Pages with only HTML `<div>` styling and external links
- Pages with no categories, no infobox, no wiki markup
- Pages whose titles don't match any in-game item/location/mechanic
