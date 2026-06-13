# AppendText Duplicate Category Pitfall — May 2026

## What Happened

During a bulk categorization run on got.miraheze.org, 36 new uncategorized pages were given categories via `appendtext`. The `prop=categories` API returned empty for all of them, confirming "no categories."

After editing, raw wikitext verification revealed that many pages **already had categories** (the API cache was stale/empty due to the known `prop=categories` bug). The `appendtext` edits added **duplicate** categories at the end of the page.

Example — `Krtek Mask` after appendtext:
```
...content...[[Category:Boss drops]][[Category:Helmets]][[Category:Bosses]][[Category:Helmets]]
```
`[[Category:Helmets]]` appeared twice (once from existing, once from appendtext).

27 out of 35 pages that were "categorized" this way had duplicates.

## Root Cause

Two interacting bugs/limitations:

1. **`prop=categories` API bug**: Returns empty/no categories for pages that have `[[Category:]]` tags in raw wikitext. This is a known Miraheze/MediaWiki caching limitation.
2. **`appendtext` position**: Always appends at the very end of the page, AFTER any existing categories at the bottom.

Combined: you check `prop=categories` → see "no cats" (false negative) → use `appendtext` → create duplicate.

## Prevention

**Always verify via raw wikitext, not the categories API:**

```javascript
// Correct check:
const r = await fetch('/w/api.php?action=parse&page=Title&prop=wikitext&format=json');
const text = r.parse.wikitext['*'];
const hasCats = /\[\[Category:/i.test(text);
if (!hasCats) {
  // Safe to add category
}
```

**Even better:** use the full rebuild pattern instead of `appendtext` for categories:

```javascript
// Safe pattern for adding categories to uncategorized pages:
const text = wikitext.replace(/\[\[Category:[^\]]+\]\]\s*/g, ''); // strip existing
const newText = text + '\n[[Category:NewCategory]]'; // append exactly once
// Then use 'text' param (full replace), not 'appendtext'
```

## Fix Pattern for Existing Duplicates

When you've already created duplicates:

1. Fetch raw wikitext for all affected pages
2. Extract all `[[Category:X]]` tags
3. Deduplicate preserving order (keep first occurrence)
4. Strip ALL category tags from content
5. Append deduplicated category block at end
6. Write back via `text` param (full content replace)

```javascript
var cats = text.match(/\[\[Category:[^\]]+\]\]/g) || [];
var seen = {};
var unique = cats.filter(c => !seen[c] && (seen[c] = true));
var main = text.replace(/\[\[Category:[^\]]+\]\]\s*/g, '');
var fixed = main + '\n' + unique.join('\n');
```

## Scope of Impact (May 29, 2026)

- 36 pages received categories via `appendtext`
- 27 of those had pre-existing categories masked by API bug
- All 27 were subsequently deduplicated via full-content replace
- Net result: all pages now have exactly one instance of each category
