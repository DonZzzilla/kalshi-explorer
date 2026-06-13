# Wiki Page Merge and Redirect Pattern (June 2026)

## When to Merge Pages

When a wiki has an orphaned page (not linked from sidebar, not reachable from main navigation) that covers a subtopic of a broader page, merge the content and redirect.

**Example from June 2026:** The `Healing` page on CSEZ wiki had a detailed medical items table but was not in the sidebar. The `Consumables` page had empty Food, Drinks, and Medicine sections. Solution: merge Healing's medical table into Consumables under a Medicine section, then redirect Healing to Consumables#Medicine.

## Step-by-Step Process

### 1. Audit the Orphaned Page

```python
r = session.get(api, params={"action":"parse","page":"Healing","prop":"wikitext","format":"json"}, timeout=15)
wt = r.json()["parse"]["wikitext"]["*"]
print(f"Length: {len(wt)}")
```

### 2. Identify the Target Page

Find the page that should contain this content. Look for:
- Empty sections that match the orphaned page's topic
- "See also" links pointing to the orphaned page
- Sidebar navigation structure

### 3. Merge Content into Target

```python
# Extract table from orphaned page
table_start = wt.find("{| class=\"sortable wikitable\"")
table_end = wt.find("|}", table_start) + 2
table_content = wt[table_start:table_end]

# Insert into target page before the "See also" section
insert_marker = "== See also =="
pos = target_wt.find(insert_marker)
new_target = target_wt[:pos] + "== Medicine ==\n\n" + table_content + "\n\n" + target_wt[pos:]
```

### 4. Create the Redirect

Use the **Ballistics redirect style** (lowercase `#redirect`, no categories):

```python
redirect_wt = "#redirect [[Consumables#Medicine]]"
```

### 5. Update the Sidebar

```python
old_line = "***Consumables|🍖Consumables"
new_lines = "***Consumables|🍖Consumables\n***Healing|💊Healing"
sidebar_new = sidebar_wt.replace(old_line, new_lines)
```

### 6. Verify

```python
r = session.get(api, params={"action":"parse","page":"Healing","prop":"wikitext","format":"json"}, timeout=15)
wt = r.json()["parse"]["wikitext"]["*"]
assert wt.startswith("#redirect"), "Redirect not set!"
```

## Key Principles

1. **Never leave orphaned pages** — merge or redirect
2. **Merge, don't delete** — preserve content
3. **Match the Ballistics redirect style** — lowercase `#redirect`, no categories
4. **Update the sidebar** if the topic deserves its own navigation entry
5. **Check for empty sections** — fill or remove them
