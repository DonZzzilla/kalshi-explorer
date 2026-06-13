# Sidebar Cache Propagation

## Issue
After editing `MediaWiki:Sidebar` via the API, new links may NOT appear in the rendered sidebar immediately. The raw wikitext will show the correct content, but the parse API may return stale HTML.

## Cause
Miraheze/MediaWiki caches the rendered sidebar. Cache invalidates after a few minutes or when any page is edited.

## Verification
Always verify sidebar edits by checking the RAW wikitext, not the rendered HTML:

```
fetch('/w/api.php?action=query&titles=MediaWiki:Sidebar&prop=revisions&rvprop=content&format=json')
```

## Sidebar Syntax
```
* navigation              <- section header
** mainpage|Home           <- link
** Page Name|Display Text  <- custom link
** https://discord.gg/xxx|Discord  <- external URL
*#| Section Title          <- collapsible section
```

## Common Sections (GoT wiki)
- Locations (with Interactive Maps subsection)
- Systems (Factions & NPCs, Quests, Tasks, Items)
- Community Hub
- SEARCH / TOOLBOX / LANGUAGES
