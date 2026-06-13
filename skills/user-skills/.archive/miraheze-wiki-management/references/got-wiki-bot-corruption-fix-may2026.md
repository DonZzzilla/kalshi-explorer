# GoT Wiki Bot Corruption Fix — May 26, 2026

## Problem

Pages on got.miraheze.org were corrupted by a bot (ZeroSkills) that saved wikitext with:
1. **Literal `\n` characters** instead of actual newlines (showing as visible `\n\n` text on pages)
2. **Stray wiki-links to category names** (`[[Items]]`, `[[Weapons]]`, etc.) appearing as visible links above the Categories footer
3. **Duplicate categories** — `[[Category:Magazines]]` appearing 4-6 times on magazine pages
4. **Concatenated links** — `[[Magazines]][[Ammunition]]` showing as "MagazinesAmmunition" red text

## Pages Affected

- 190 pages with literal `\n\n` and/or duplicate categories
- 248 pages with stray category-name links (`[[Items]]` etc.)
- Includes: KRISS, Honey Badger Magazine, BAR Magazine, AK74 Magazine, Water pump, VigorX, Alphabet Blocks, Air Drop, Ammo Can, and 247 more

## Root Cause

The bot editing tool saved content with escaped newlines (`\\n`) and stray wiki-links instead of clean wikitext with proper `[[Category:X]]` footers.

## Fix Applied

Three-pass approach:
1. **Pass 1**: Fixed literal `\n\n` and duplicate categories (190 pages)
2. **Pass 2**: Removed stray `[[Magazines]][[Ammunition]]` links (38 pages)
3. **Pass 3**: Removed all stray category-name links and deduplicated categories (248 pages)

### Comprehensive Fix Script

```javascript
const strayRe = /\[\[(Items|Weapons|Attachments|Grips|Magazines|Ammunition|Loot|Equipment|Containers)\]\](\\n|\n)/g;
const strayLineRe = /^\[\[(Items|Weapons|Attachments|Grips|Magazines|Ammunition|Loot|Equipment|Containers)\]\]$/gm;

let text = d.parse.wikitext['*'];
text = text.replace(strayRe, '');
text = text.replace(strayLineRe, '');
text = text.replace(/\\n/g, '\n');
const cats = [...new Set((text.match(/\[\[Category:[^\]]+\]\]/g)||[]))];
text = text.replace(/\n?\[\[Category:[^\]]+\]\]/g, '');
text = text.replace(/\n{3,}/g, '\n\n');
text = text.trimEnd();
cats.forEach(c => text += '\n' + c);
```

## Key Lessons

- Always strip ALL categories and re-add unique set (don't try in-place dedup)
- Batch edits in groups of 10-15 per browser_console call
- Re-login after every browser_navigate (session expires ~every 5-10 minutes)
- Verify fixes by re-fetching a sample after each batch
- The `[[X]]` links are category-name matches — they serve no purpose since categories already handle navigation

## Verification

Final scan confirmed 0 pages with stray links and 0 pages with duplicate categories across all 530 pages.
