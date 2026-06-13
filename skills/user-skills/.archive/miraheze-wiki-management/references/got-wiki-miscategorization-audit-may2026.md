# Got Wiki Miscategorization Audit — May 26, 2026

## Pattern: Finding Miscategorized Pages Across Categories

### Problem
Quest pages were found tagged with `[[Category:Items]]` alongside `[[Category:Quests]]`. Some had ONLY `[[Category:Items]]` with the `Quests` category missing entirely (e.g., Honor The Deal?).

### Detection Method
1. Get all page IDs in the suspect category (e.g., `Category:Quests`):
   ```
   action=query&list=categorymembers&cmtitle=Category:Quests&cmlimit=500
   ```
2. Batch-fetch categories for all pages in groups of 50:
   ```
   action=query&pageids=ID1|ID2|...|ID50&prop=categories
   ```
3. Filter for pages that have the WRONG category alongside or instead of the right one

### Fix Pattern
For each affected page:
1. Fetch current wikitext: `action=query&pageids=X&prop=revisions&rvprop=content`
2. Remove the wrong category: `text.replace(/\n?\[\[Category:Items\]\]/g, '')`
3. If a required category is missing, append it: `text.trimEnd() + '\n[[Category:Quests]]'`
4. Submit edit via `action=edit` with CSRF token

### Pages Fixed (May 26, 2026)
11 quest pages had `[[Category:Items]]` incorrectly applied:
- Cache Cracker, Battle Tested, Into the Depths, Honor The Deal?, AdvantRECORD, Echoes of AdvantEDGE, Erase Their Hold, Grit and Grind, Frame of Horror, Ghost Tracker, Hit List
