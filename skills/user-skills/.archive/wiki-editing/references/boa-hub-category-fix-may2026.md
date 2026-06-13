# BOA Hub Wiki — Category Corruption Fix, May 29, 2026

## Scope
Full audit of 51 pages on boa.miraheze.org. Found 5 pages with duplicate/malformed category blocks at the bottom of their wikitext.

## Corruption Pattern
All five pages had the same pattern — a duplicate category block where some categories lost their `]]` closing brackets:

```
[[Category:Tactics]]
[[Category:Guides]]
[[Category:Weapons]]

[[Category:BOA Hub]]
[[Category:Combat      ← missing ]]
[[Category:BOA Hub]]   ← duplicate
[[Category:Combat]]    ← duplicate
```

Variant with `[[Category:Money` missing `]]`:
```
[[Category:BOA Hub]]
[[Category:Money       ← missing ]]
[[Category:BOA Hub]]   ← duplicate
[[Category:Items]]
```

## Root Cause
Repeated batch categorization runs that appended `[[Category:X]]` to pages that already had a category block, sometimes mid-edit corrupting the previous line's closing brackets.

## Pages Fixed

| Page | Extra/Malformed Categories | Clean Category Count |
|------|---------------------------|---------------------|
| Grenade Guide | `[[Combat` missing `]]`, dupes | 5 |
| Insurance Guide | `[[Category:Money` missing `]]`, dupes | 6 |
| PvP Combat Guide | `[[Combat` missing `]]`, dupes | 5 |
| Quest Stacking Guide | `[[Category:Money` missing `]]`, dupes | 4 |
| Trader Leveling Guide | `[[Category:Money` missing `]]`, dupes | 5 |

## Fix Technique (JavaScript browser_console)
```javascript
// 1. Get current content
const r = await fetch('/w/api.php?action=parse&page=' + encodeURIComponent(title) + '&prop=wikitext&format=json');
const text = (await r.json()).parse.wikitext['*'];

// 2. Find first [[Category: and strip everything from there
const catIdx = text.indexOf('[[Category:');
const cleanEnd = text.substring(0, catIdx);

// 3. Build clean category block
const cats = '[[Category:Tactics]]\n[[Category:Guides]]\n[[Category:Weapons]]\n[[Category:BOA Hub]]\n[[Category:Combat]]';

// 4. Submit full replacement
const newText = cleanEnd + '\n' + cats;
```

## Verification Pattern
After fixing, re-fetch wikitext and confirm:
- `text.match(/\[\[Category:[^\]]+\]\]/g)` has no duplicates
- No lines match `/^\[\[Category:.+[^\]\]]$/` (unclosed category)
- Last line of page ends with `]]`

## Scan for Remaining Issues (full wiki)
Full scan of all 51 pages confirmed **0 remaining malformed categories** after the 5 fixes.

## Notes
- The Main Page stores `[[Category:BOA Hub]]` at the TOP of its wikitext (unusual but intentional). Scanning scripts that split on `\n` and check "does line end with `]]`?" will false-positive on multi-line string literals in the API response. Always verify by regex-matching the full `[[Category:X]]` pattern.
- The `prop=categories` API returned empty results for 17 pages (13 content + 4 redirects). Raw wikitext confirmed all 13 content pages DO have categories — this is the known Miraheze `prop=categories` stale cache issue. Always verify with raw wikitext, never trust `prop=categories` alone.
