# CSEZ Wiki: Creating Quest Pages from Trader Tables — May 2026

Batch-creating missing quest pages by extracting data from individual trader page wikitext tables.

## When to Use

The wiki has individual trader pages (ARK, Boulder Forge, NTG, Regiment, TRUPIK'S) each with a `{| class="wikitable sortable"` quest table listing all quests, objectives, and rewards. When a quest page is missing but the data exists in a trader table, create it.

This is DIFFERENT from `csez-wiki-stub-enrichment-may2026.md` which parses the master `Quests` page. Trader pages are the better source when:
- The master Quests page still has stale data (e.g., Korunas not yet converted to EZD)
- You need the full objective text with `<br>` sub-objectives intact
- The trader page is more recently updated than the master page

## Extraction Pattern (Python)

```python
import re

# Fetch trader page wikitext
r = s.get(base, params={'action':'parse','page':'ARK','prop':'wikitext','format':'json'}).json()
content = r['parse']['wikitext']['*']

# Find the quest table
table_start = content.find('{| class="wikitable sortable"')
table_end = content.find('|}', table_start)
table_content = content[table_start:table_end+2]

# Split into rows (rows separated by \n|-)
rows = table_content.split('\n|-')

# Parse each quest row
quests = []
for row in rows[3:]:  # skip header rows (!Name, !Requirements, !Reward, !Prerequisites)
    lines = [l.strip() for l in row.split('\n') if l.strip()]
    if len(lines) < 4:
        continue
    
    # Cell 1: quest name (may be wikilinked: [[Quest Name]] or [[Quest Name|Display]])
    name_raw = lines[0].lstrip('| ')
    name_clean = re.sub(r'\[\[([^\]|]+)(?:\|([^]]*))?\]\]', 
                        lambda m: m.group(2) or m.group(1), name_raw).strip()
    
    # Skip non-quest rows (seasonal/NOT AVAILABLE, section headers)
    if not name_clean or name_clean.startswith('!') or 'NOT AVAILABLE' in name_clean:
        continue
    
    # Cell 2: objectives
    obj_raw = lines[1].lstrip('| ')
    
    # Cell 3: rewards  
    rew_raw = lines[2].lstrip('| ')
    
    # Cell 4: prerequisites
    prereq_raw = lines[3].lstrip('| ')
    
    quests.append({
        'name': name_clean,
        'objective': obj_raw,
        'reward': rew_raw,
        'prerequisites': prereq_raw
    })
```

## Quest Page Standard Format

```
{{Task
| name = Quest Name
| giver = Trader Name ([[TraderPage]])
| location = [[MapName]]
| objective = <full objective text with <br> separators>
| reward = <full reward text with <br> separators>
| prerequisites = None
}}

Quest description sentence.

== Walkthrough ==

# Step 1
# Step 2
# Extract successfully

== Tips ==

* Tip 1
* Tip 2

== See Also ==

* [[TraderName Quests]]
* [[Quests]]

[[Category:TraderName Quests]]
[[Category:Quests]]
```

## Category Mapping

| Trader | Category |
|--------|----------|
| ARK (Tommy) | `[[Category:ARK Quests]]` |
| Boulder Forge (Maximilian) | `[[Category:Boulder Forge Quests]]` |
| NTG (Maggie) | `[[Category:NTG Quests]]` |
| Regiment (Igor) | `[[Category:Regiment Quests]]` |
| TRUPIK'S (Johnny) | `[[Category:TRUPIK'S Quests]]` |

## Batch Creation Loop

```python
for quest in quests:
    # Check if page already exists
    check = s.get(base, params={'action':'parse','page':quest['name'],'prop':'format','format':'json'}).json()
    if 'parse' in check:
        print(f"SKIP: {quest['name']} already exists")
        continue
    
    # Build page content
    content = build_quest_page(quest)  # use format above
    
    # Create with createonly=true
    resp = s.post(base, data={
        'action': 'edit',
        'title': quest['name'],
        'text': content,
        'token': csrf,
        'summary': f"Create {quest['name']} quest page",
        'format': 'json',
        'bot': '1',
        'createonly': '1'
    })
    result = resp.json()
    # Refresh CSRF token after each edit
    csrf = s.get(base, params={'action':'query','meta':'tokens','format':'json'}).json()['query']['tokens']['csrftoken']
```

## Naming Pitfalls

- **"All Pieces Together l"**: Lowercase L (letter) = Roman numeral 1 (Notebooks quest). The wiki had a null-content stub. Fixed by creating `All Pieces Together 1` page and making `All Pieces Together l` a redirect to it.
- **"Task:" prefix**: Some trader tables link as `[[Task:QuestName]]` but actual quest pages use just `[[QuestName]]`. The `Task:` prefix is used for redirect pages (e.g., `Task:Handshake` → `Task:Handshake`).
- **"Battle Of" vs "Battle of"**: Wiki convention uses title case. Be consistent with existing page names. Check before creating.

## Session Results (May 30, 2026)

9 quest pages created in one run:
- Lost and Found, Friendly Reminder, Recon I, Tracking Device (ARK)
- Where Did the ARK Trucks Go, Imposter, Inviting Troubles, The Saboteur (ARK)
- All Pieces Together 1 (Boulder Forge)

All verified with walkthrough, tips, see also, and proper categories.
