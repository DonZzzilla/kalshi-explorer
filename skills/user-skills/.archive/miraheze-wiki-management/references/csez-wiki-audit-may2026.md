# CSEZ Wiki Audit — May 27 2026

Results of the May 27 2026 cron maintenance pass on csez.miraheze.org.

## Edits Made

| # | Page | Change | Rev |
|---|------|--------|-----|
| 1 | Barricade | Created new boss page (was missing, linked from Resort) | 2432 |
| 2 | Hyder Town Police Station | Fixed `[[Category:Items]]` → `[[Category:Locations]]` | 2433 |
| 3 | Dam | Deduplicated categories (4× repeated), added Maps cat + See Also | 2434 |
| 4 | Smuggling Tunnel | Removed stray `</div>`, merged duplicate Quests, added `[[Category:Locations]]` + See Also | 2435 |
| 5 | Task:Handshake | Updated from bare infobox to `{{Task}}` template format + See Also | 2440 |
| 6 | Suburbs | Cleaned duplicate categories, added See Also + `[[Category:Maps]]` | 2441 |
| 7 | Metro | Deduplicated categories, added `[[Category:Maps]]` + See Also | 2438 |
| 8 | Resort | Deduplicated categories, added/fixed See Also | 2439 |
| 9 | Template:Attachment + Tempate:Attachment | Created proper template, redirected misspelled page | 2436/2437 |

## Issues Found but Not Actionable

- **Language subpages** (`9x19mm/en`, `9x19mm/zh`, `Boulder Forge/en`, `Boulder Forge/zh`) exist in main namespace — they're functional translation subpages using `<language/>` and `<translate>` tags. No action needed.
- **`IMAP:Suburb`** (pageid 117) — custom interactive map page in main namespace with Leaflet.js. Has `[[Category:Maps]]` already.
- **`Widget:Iframe`** (pageid 922) — iframe widget in main namespace, categorized as `[[Category:Meta]]`. No action needed.
- **`Task: Handshake`** (pageid 1027) — redirect with space, pointing to `Task:Handshake`. The redirect is intentional.
- **`All pieces together l`** (pageid 1028) — redirect (lowercase L) pointing to `All Pieces Together l`. The redirect is intentional.

## Pattern: Cross-Map Contamination

Suburbs page had Metro extraction points mixed into its extraction point table
(east metro exit, lower central gate, medical base exit, etc.). These were
removed during cleanup. Future audits should cross-check extraction point names
against the correct map.

## API Quirks Observed

- `prop=categories` returned empty `[]` for multiple map pages (Dam, Metro, Resort, Suburbs) even though edits were confirmed successful via `prop=revisions&rvprop=content`. These pages may have protection or cache behavior affecting category queries.
- `rvlimit=1` with `titles=` (multiple) returns `invalidparammix` — same as `pageids=` with `rvlimit`. Fetch without `rvlimit` instead.
