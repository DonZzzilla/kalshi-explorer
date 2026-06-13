# CSEZ Wiki Stub Enrichment Pattern — May 2026

Enriching stub game-content pages using data extracted from a master "Quests" table page.

## Strategy

Many task/quest/gear pages start as bare template stubs (`{{Task}}` with empty fields). A master page (like `Quests`) contains the full data in wikitext table cells. By parsing line-by-line around quest names, you can extract:
- Trader/giver name
- Full objectives text (often with `<br>`-separated sub-objectives)
- Location(s)
- Player type (PMC/Scav/Any)
- Rewards (Korunas, XP, Reputation, items)
- Notes/walkthrough tips

## Execution Pattern

```python
# Step 1: Fetch wikitext of the master page
resp = s.get(base, params={'action':'parse','page':'Quests','prop':'wikitext','format':'json'}).json()
content = resp['parse']['wikitext']['*']

# Step 2: Find context around a quest name
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'TargetQuestName' in line:
        start = max(0, i-2)       # lines before (headers etc)
        end = min(len(lines), i+12)  # lines after (objectives, rewards, notes)
        for j in range(start, end):
            print(j, lines[j])
```

## Key Details

- Quest tables use `| style="background-color:..." |Quest Name` format
- Trader name is embedded in section headers like `== ARK (Tommy) Quests==`
- Objectives use `<br>` to separate multi-part objectives within a single cell
- Rewards use `<br>` to list Korunas, XP, Reputation, and items
- Notes cells contain italic walkthrough hints prefixed with `''...''`
- Prerequisites aren't in the table — infer from quest numbering/order

## Applied To
- 12+ task pages (On The Trail, Recon II, Battle Of The Dam, Undercurrents, etc.)
- All pieces together quests (I–IV)
- Boulder Forge quest chain (Secret Stash 1&2, Better Safe Than Sorry 1, Covert Evacuation, Purge the Ranks)

## Naming Pitfall: "All pieces together"
The letter-L (`l`) and Roman numeral-I (`I`) look identical in many fonts. Wiki had:
- `All Pieces Together l` (letter L) — should be I (Notebooks quest)
- `All Pieces Together 2` — should be II (Old Phones quest)
- Missing: III (Cassette Tapes), IIII (Cameras)
Verify by checking the objective content matches the expected quest number.
