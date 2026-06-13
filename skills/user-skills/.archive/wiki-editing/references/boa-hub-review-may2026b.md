# BOA Hub Wiki — Content Review (May 2026, Run 2)

## Wiki Facts
- **URL**: https://boa.miraheze.org
- **Skin**: Citizen
- **Account**: ZeroSkills (sysop)
- **Stats at review time**: 15 articles, 6 files, 160+ edits

## Changes Made (8 edits across 7 pages)

1. **GoT Wiki Hub** — Updated article count "744" → "747" (×2 occurrences: body text and external links "695+" → "747+")
2. **Main Page** — Updated article count "744" → "747" in External Links
3. **BOA Ranks & Structure** — Updated article count "744" → "747" in See Also
4. **Tactics Guide** — Added `{{#seo:...}}` template; updated "744" → "747"
5. **Money Making Guide** — Fixed 5 broken wikilinks to non-existent pages:
   - `[[Quest Stacking Guide]]` → link to GOT Wiki Quests page
   - `[[AI Enemies Guide]]` → link to GOT Wiki AI page
   - `[[Boss Guides]]` → `[[Mall Boss Guide]]` + `[[Ghost of Tabor Game Info]]`
   - `[[PvP Combat Guide]]` → removed (no equivalent, reworked sentence)
   - `[[Gear Fear Guide]]` → removed (no equivalent, reworked sentence)
   - Added `{{#seo:...}}` template
6. **Map Guides** — Added `{{#seo:...}}` template
7. **Mall Boss Guide** — Added `{{#seo:...}}` template
8. **Team Map** — Added `{{:seo:...}}` template

## Key Learnings

### Edit Reversion / Stale Cache
- Edits to GoT Wiki Hub appeared successful (API returned `result: Success`) but the page content still showed old values when re-fetched
- Cause: likely Miraheze's MediaWiki job queue delay or edit moderation cache
- Mitigation: Always re-fetch page content after editing to verify changes stuck; if not, re-edit

### SEO Template Pattern
Adding `{{#seo:...}}` templates to wiki pages improves search discoverability. Format:
```
{{#seo:
|title       = Page Title - BOA Hub Wiki
|description = Concise description of page content for search engines.
}}
```
- Place at the very top of the wikitext (before any content)
- `title` should include the wiki name suffix ("- BOA Hub Wiki")
- `description` should be 1-2 sentences summarizing the page

### Broken Wikilink Audit Pattern
When reviewing wiki pages for broken links:
1. Fetch all page wikitext via `action=parse&prop=wikitext`
2. Search for `[[PageName]]` patterns (internal wikilinks)
3. For each linked page, check if it exists via `action=parse&page=PageName` — if `data.parse` is missing, the page doesn't exist
4. Replace broken links with either:
   - A link to an existing page that covers the same topic
   - An external link to the relevant GOT Wiki page
   - Plain text (remove the link entirely)

### Session Management
- Session expired when navigating between boa.miraheze.org and got.miraheze.org (different domains)
- Re-login required after cross-domain navigation
- Use full URLs (`https://boa.miraheze.org/w/api.php`) not relative URLs (`/w/api.php`) when making API calls from browser_console, as the browser may be on a different domain

### Article Count Tracking
- GoT Wiki article count is displayed on multiple BOA wiki pages
- When updating, check: Main Page, GoT Wiki Hub, BOA Ranks & Structure, Tactics Guide, and any "See Also" sections
- Use `action=query&meta=siteinfo&siprop=statistics` on the GoT Wiki to get the current count

## Content Accuracy Status
- No incorrect references to BOA as a game found
- "Ghosts of Tabor" plural usage consistent across all pages
- Game version 0.13.0 current (Wipe 9)
- Boss schedule current (all bosses active as of May 15, 2026)
- GoT Wiki now at 747 articles (up from 744 at last review)
