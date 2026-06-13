# GoT Wiki Deduplication Pass — May 26, 2026

## Problem
344 out of 890 pages on got.miraheze.org had duplicate `[[Category:X]]` tags. Some had up to 18 duplicate categories (e.g., "Secure Container" had 18 tags, 6 unique). Caused by repeated batch categorization runs and cron job edits that appended categories without checking for existing ones.

## Detection Method
Used bulk page content retrieval:
1. Get all page IDs via `list=allpages` (paginated, 500 per batch)
2. Fetch all revisions in bulk: `action=query&pageids=ID1|ID2|...&prop=revisions&rvprop=content`
3. Regex-search each page's wikitext for `\[\[Category:[^\]]+\]\]`
4. Compare total matches vs unique matches per page

## Fix Method
Process in batches of ~20 pages per browser_console evaluation (30s timeout limit). For each page:
1. Get fresh CSRF token
2. Fetch current wikitext via `prop=revisions&rvprop=content`
3. Extract all `[[Category:X]]` tags, deduplicate with `[...new Set(cats)]`
4. Remove all category lines from text, append unique categories at end
5. Submit edit via `FormData` POST

## Results
- Total pages scanned: 890
- Pages with duplicate categories: 344
- Pages fixed: 344 (all)
- Duplicate tags removed: ~1,200
- Worst offenders: Secure Container (18→6), Chodov Mall (16→3), AK5C (9→4)
- Trailing newlines: 0 pages found (already clean)

## Key Learnings
1. Always check for active cron jobs before manual wiki cleanup
2. Browser console 30s timeout limits batch size to ~20 edits
3. Use FormData (not URLSearchParams) for large wikitext edits
4. Session expires frequently — get fresh CSRF token per batch
5. execute_code/Python cannot edit Miraheze (no session cookies)
6. Skip pages per user instruction (e.g., "Arty's Game bord" is correct in-game spelling)
