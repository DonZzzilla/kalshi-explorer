# GoT Wiki Audit Run 6 — May 26, 2026

**Session type:** Anonymous (read-only, login failed)
**Wiki:** https://got.miraheze.org
**Stats at time of audit:** 749 content pages, 3,625 total pages, 476 registered users, 17 active

## BOA Content Check — CLEAN

- No BOA program pages found (searched: BOA About, BOA Ranks, BOA Discord, BOA Team, BOA Hall of Fame, BOA Recruitment)
- "BOA Hub" search returned zero results
- Only BOA page: "BOA Supply Drop" (legitimate quest name)
- No "Category:BOA Hub" in categories list

## Key Findings

### 1. Widespread Duplicate Category Tags (HIGH)
- **164 of 200 sampled pages (82%)** have duplicate `[[Category:X]]` tags
- 311 redundant category tags total across 200 pages
- Most commonly duplicated: `[[Category:Items]]` (appears 3-4× on many item pages)
- Root cause: Batch categorization scripts append without checking for existing tags
- Examples: AK (3× Items), ASVAL (3× Items), AWM Magazine (3× Magazines, 2× Ammo), Barrett M107A1 (3× Currency), FN P90 (2× Items)

### 2. `prop=categories` API Cache Stale (MEDIUM — Known MW Bug)
- API returns empty/no categories for pages that DO have `[[Category:]]` tags in raw wikitext
- Verified: 5 "uncategorized" pages all had valid categories in raw wikitext
- Always verify by fetching raw wikitext before taking action on "uncategorized" pages

### 3. Minor Content Issues (LOW)
- "Arty's Game bord" — typos: "bord" should be "board", "gamebord" should be "Gameboy"; has `\\n\\n` literal at bottom
- GoT Wiki Hub page says "750+" articles but Special:Statistics shows 749
- "CategoryTest" page exists as legitimate tech support page (confusing name)
- "Magical-Fix-Game-Button" page — unusual name, verify content

### 4. Active Maintenance Observed
- ZeroSkills was editing at 03:44-03:46 UTC on May 26, adding categories and Wipe 9 notices
- Recent changes show active categorization work in progress

## Session Notes

- `async/await` fetch pattern failed with `TypeError: Failed to fetch` on first API call after page load
- Required `browser_navigate` to restore session, then relative URLs worked
- `const` collision hit when mixing `var`-style and `async IIFE` patterns — use `var` or unique names
- Docker terminal unavailable (timeout) — all work done via browser tools
- Login as ZeroSkills failed via API (wrongpassword) — read-only audit only

## Recommended Actions (require admin session)

1. **Deduplicate category tags** across ~164 pages (large batch job)
2. **Update GoT Hub** article count from "750+" to "749"
3. **Fix typos** on "Arty's Game bord" page
4. **Consider renaming** "CategoryTest" to "Tech Support"
