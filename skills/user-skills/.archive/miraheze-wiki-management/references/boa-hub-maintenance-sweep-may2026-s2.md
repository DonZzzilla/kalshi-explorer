# BOA Hub Wiki — Maintenance Sweep, May 29, 2026 (Session 2)

Follow-up sweep of boa.miraheze.org after the May 28 session.

## Results Summary

| Issue | Pages Affected | Fix Applied |
|-------|---------------|-------------|
| Pages missing from sidebar | 3 | Added Krtek Boss Guide, Silo Map Guide, Miest Map Guide to sidebar |
| Duplicate sidebar entry | 1 | Removed duplicate `Guide:Getting_Started` from New Players section |
| Categories before `== See Also ==` | 7 | Moved categories after See Also on all affected pages |
| Categories before `== See Also ==` (Guide:Getting Started) | 1 | Fixed (1 category before See Also) |

## Sidebar Fixes

### Pages Missing from Sidebar (3)

Three content pages existed with full content but had no sidebar entry:

| Page | Section Added To |
|------|-----------------|
| `Krtek_Boss_Guide` | *Boss Guides* (after Mamba) |
| `Silo_Map_Guide` | *Map Guides* (after Mall PvP) |
| `Miest_Map_Guide` | *Map Guides* (after Silo) |

### Duplicate Removed (1)

The sidebar had `** Guide:Getting_Started|Getting Started` in both the *navigation* section and the *New Players* section. Removed the *New Players* copy since *navigation* section already provides it.

## Categories-Before-See-Alsos Pattern

### What to Check For

When `[[Category:...]]` lines appear **before** the `== See Also ==` section on a page, the categories render in the page body instead of at the bottom. The correct wiki order is:

    ... page content ...

    == See Also ==

    [[Category:X]]
    [[Category:Y]]

NOT:

    ... page content ...

    [[Category:X]]        <- wrong position
    == See Also ==

### Affected Pages

- `About`
- `BOA Discord Rules & Policies`
- `BOA Hall of Fame`
- `BOA Player Reviews`
- `Rations and Supply System` (5 categories before See Also)
- `Solo Play Guide` (3 categories before See Also)
- `The Story of the BOA Hub Discord`
- `Guide:Getting Started`

### Python Fix Pattern

```python
import re

# Extract all categories
cats = re.findall(r'\[\[Category:[^\]]+\]\]', content)
cats_text = '\n'.join(cats)

# Remove all category lines
new_content = re.sub(r'\n?\[\[Category:[^\]]+\]\]\n?', '\n', content)
new_content = re.sub(r'\n{3,}', '\n\n', new_content)

# Place categories at end (after See Also)
new_content = new_content.rstrip('\n') + '\n\n' + cats_text + '\n'
```

## Corruption Scan Results

All corruption checks passed (no issues found):

- No literal backslash-n in content
- No Image=File: double prefix
- No broken table classes
- No duplicate categories
- No excessive trailing newlines
- All sidebar-linked pages exist
- All redirects resolve correctly
- All pages have [[Category:BOA Hub]]
- No stub pages (all non-redirect pages have >200 chars of content)

## Uncategorized Pages Check

prop=categories API flagged 3 pages as uncategorized:
- `Island of Tabor Guide` -> redirect to `Island_Map_Guide`
- `Loadout Guide` -> redirect to `Weapon_and_Loadout_Guide`
- `Matka Miest Guide` -> redirect to `Matka_Map_Guide`

All three are redirects. Per the "never edit redirects" rule, these were NOT modified. The API's prop=categories does not assign categories to redirect targets -- this is expected MediaWiki behavior, not a bug.

## Notes

- Foxtrot AI Guide is a redirect page (redirects to AI Enemies Guide). Redirects should not be edited even if they appear to have suboptimal categories.
- The wiki had 45 non-redirect articles and 5 redirects in the main namespace, totaling 51 pages
