# BOA Hub Wiki Review — May 2026 Run 4

## Scope
Full review of 43 pages on boa.miraheze.org. Fixed duplicate page, updated main page stats/navigation, added missing categories, expanded stub.

## Edits Made (17 total)

### 1. Duplicate Page → Redirect
- `BOA_Ranks_and_Structure` (with "and") was a full duplicate of `BOA_Ranks_%26_Structure` (with "&")
- The duplicate had 4× "Ghost of Tabor" (wrong game name)
- Replaced with `#REDIRECT [[BOA Ranks & Structure]]`

### 2. Main Page Updates
- Article count: "15 Articles" → "43 Articles"
- Edit count: "160+ Edits" → "220+ Edits"
- Added new Quick Navigation row for 6 newer guides missing from nav:
  Combat Tips, Keycard Farming Guide, Solo Play Guide, PvP Combat Guide, Gear Fear Guide, Quest Stacking Guide

### 3. BOA Hub Category Added to 14 Pages
Aim and Recoil Guide, Armor and Equipment Guide, Combat Tips, Foxtrot AI Guide, Friend or Foe Guide, Insurance Guide, Inventory and Backpack Management, Island Map Guide, Keycard Farming Guide, Mall PvP Guide, Matka Map Guide, Rations and Supply System, Solo Play Guide, Suppressor Guide

### 4. Insurance Guide Expanded
Added insurance cost mechanics, player theft clarification, specific guidance per tier, more mentor tips, cross-reference to Trader Leveling Guide.

## Key Patterns Used

### Detecting Duplicate Pages
When `list=allpages` returns pages with similar names (e.g., "BOA Ranks & Structure" and "BOA Ranks and Structure"), check if one is a redirect:
```javascript
// Check if page is a redirect
const text = data.parse.wikitext['*'];
if (text.startsWith('#REDIRECT')) { /* it's a redirect, safe */ }
else { /* it's a duplicate full page — replace with redirect */ }
```

### Updating Main Page Navigation Tables
When a wiki grows beyond its original navigation grid:
1. Fetch current Main Page wikitext
2. Identify the Quick Navigation table structure
3. Add new rows before the table closing `|}`
4. Keep link format consistent: `[[PageName|'''Display Text'''<br><small>Description</small>]]`
5. Update article/edit counts in the stats box

### Batch Category Addition Pattern
```javascript
// For each page missing the category:
const text = data.parse.wikitext['*'];
if (text.indexOf('[[Category:BOA Hub]]') < 0) {
  text = text.trim() + '\n\n[[Category:BOA Hub]]';
  // Edit via API
}
```

## Notes
- "Ghost of Tabor Game Info" page title uses singular "Ghost of Tabor" — this is the established page name, all internal links are correct. Renaming would break 12+ links.
- Wiki now has 43 articles, all properly categorized.
