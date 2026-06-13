# Bulk Wiki Audit & Organization — June 2026

## Audit Workflow

When doing a comprehensive audit of a Miraheze wiki, check these querypage reports in order:

### 1. Run These Checks (Python)

```python
checks = [
    ('Uncategorizedpages', 'uncategorized'),
    ('BrokenFiles', 'broken_files'),  # Note: categorymembers on 'Category:Pages with broken file links'
    ('DoubleRedirects', 'double_redirects'),
    ('Deadendpages', 'dead_end_pages'),
    ('Lonelypages', 'lonely_pages'),
    ('Shortpages', 'short_pages'),
    ('Wantedcategories', 'wanted_categories'),
    ('PagesWithScriptErrors', 'script_errors'),
    ('PagesWithTemplateStylesErrors', 'templatestyles_errors'),
]

for qppage, label in checks:
    r = s.get(API, params={
        'action': 'query', 'list': 'querypage',
        'qppage': qppage, 'qplimit': 50, 'format': 'json'
    })
    # Also check category for broken files:
    # r = s.get(API, params={'action': 'query', 'list': 'categorymembers',
    #     'cmtitle': 'Category:Pages with broken file links', 'cmlimit': 50, 'format': 'json'})
    # And outdated category:
    # r = s.get(API, params={'action': 'query', 'list': 'categorymembers',
    #     'cmtitle': 'Category:Outdated', 'cmlimit': 50, 'format': 'json'})
```

### 2. Additional Checks

- **Candidates for deletion**: `cmtitle='Category:Candidates for deletion'`
- **Missing categories**: Cross-reference `Wantedcategories` querypage with existing categories to find categories that should be created
- **Existing categories**: `list=allcategories&aclimit=100`

## Fix Patterns

### Broken File Links (Bulk)

When hundreds of `File:` references point to missing images:

1. Find a placeholder image on the wiki: check `File:Missing Image.png`, `File:Placeholder.png`, `File:No image.png`
2. If no placeholder exists, the substitution will use whatever is found
3. Replace ALL `[[File:Name.png|...]]` references with `[[File:Missing Image.png|...]]`:

```python
import re

# Find all file references
broken_files = re.findall(r'\[\[(?:File|Image):([^\]|#]+)(?:\|[^\]]*?)?\]\]', content)

# Replace with placeholder
def replace_with_placeholder(m):
    caption = re.search(r'\|([^\]]+)$', m.group(0))
    if caption:
        return f"[[File:Missing Image.png|{caption.group(1)}]]"
    return "[[File:Missing Image.png]]"

new_content = re.sub(
    r'\[\[(?:File|Image):([^\]|#]+)(?:\|[^\]]*?)?\]\]',
    replace_with_placeholder,
    content
)
```

4. **The `BrokenFiles` category is CACHED by MediaWiki.** It will clear automatically when the job queue runs (usually within hours). Don't panic if pages still appear in the category after fixing.
5. Verify fix: check that no non-placeholder file references remain using `re.findall`.

### Dead-End Pages (No Outgoing Links)

Pages with no `[[links]]` to other content pages:

```python
# Check if page has outgoing links
links = re.findall(r'\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]', content)
non_cat_links = [l for l in links
    if not l.startswith('Category:')
    and not l.startswith('File:')
    and not l.startswith('Image:')]
if not non_cat_links:
    # Add See also section based on content type
    see_also = infer_see_also(content, page_title)
    new_content = content.rstrip() + '\n' + see_also
```

Categories for "See also" sections:
- Weapon/attachment pages → `[[Attachments]]`, `[[Weapons]]`
- Ammo pages → `[[Ammunition]]`, `[[Equipment]]`
- Armor/equipment → `[[Equipment]]`, `[[Armor]]`
- Quest pages → `[[Quests]]`, `[[QuestName Quests]]`
- Map/location → `[[Locations]]`, `[[Maps]]`
- Trades → `[[Traders]]`, `[[Items]]`
- Generic → `[[Weapons]]`, `[[Equipment]]` or `[[Items]]`, `[[Gameplay]]`

### Lonely Pages (No Incoming Links)

Same fix pattern as dead-end pages — add "See also" sections. Lonely pages are often quest sub-pages, location pages, or item pages that just need navigation links added.

### Double Redirects

```python
# 1. Find the redirect chain
content1 = get_page(title1)  # e.g., "All pieces together l"
redirect1 = re.search(r'#REDIRECT\s*\[\[([^\]]+)\]\]', content1, re.I).group(1)

content2 = get_page(redirect1)  # e.g., "All Pieces Together l"
redirect2 = re.search(r'#REDIRECT\s*\[\[([^\]]+)\]\]', content2, re.I).group(1)

# 2. Fix: make the first redirect point directly to the final target
new_content = f"#REDIRECT [[{redirect2}]]"
edit(title1, new_content, summary=f'Fixed double redirect: now points directly to {redirect2}')
```

### Creating Missing Categories

When `Wantedcategories` shows categories that pages reference but don't exist:

```python
# Create each missing category with a parent
for cat_name, parent_cat, description in wanted_categories:
    content = f"[[Category:{parent_cat}]]"
    edit(f"Category:{cat_name}", content,
         summary=f'Created missing category: {cat_name}',
         createonly=1)  # Don't overwrite if exists
```

### Marking Outdated Pages

For pages with old game data that shouldn't be deleted but should be flagged:

```python
notice = "{{Outdated|This page contains outdated game data. For current information, see the main article.}}\n\n"
new_content = notice + content
edit(title, new_content, summary='Added outdated notice to page with old game data')
```

## Multi-Wiki Audit Results (June 2026)

### Issues Found Per Wiki

| Wiki | Uncategorized | Broken Files | Double Redirects | Dead-End | Lonely | Outdated | Wanted Cats |
|------|--------------|-------------|-----------------|----------|--------|----------|-------------|
| GOT | 1 | 16 pages (943+ links) | 0 | 10 | 20 | 8 | 15 |
| CSEZ | 4 | 1 | 1 | 10 | 20 | 0 | 50 |
| SilentNorth | 0 | 2 | 0 | 2 | 10 | 0 | 40 |
| BOA | 0 | 1 | 0 | 1 | 2 | 0 | 11 |

### Fixes Applied

- **GOT**: Fixed 16 pages with broken file links, marked 9 outdated pages, categorized 1 page, added See also to 9 dead-end pages, created 6 categories
- **CSEZ**: Fixed 1 double redirect, added See also to 13 dead-end/lonely pages, created 10 categories
- **SilentNorth**: Added See also to 2 dead-end pages, created 20 categories
- **BOA**: Added navigation to 1 dead-end page, created 2 categories
- **All**: Installed 23 MirahezeDevScripts gadgets, created Project:Gadgets docs, updated Help Center

## Key Pitfalls

1. **Don't skip sandbox/backup pages** — they also have broken file links that should be fixed
2. **Check for existing links before adding See also** — some "dead-end" pages already have links you can't see at first glance
3. **Wanted categories vs. existing categories** — always cross-reference before creating; some wanted categories already exist under different names
4. **Cache delays** — `BrokenFiles` category, `Wantedcategories`, and other querypage reports are cached. Changes may take hours to reflect.
5. **Multi-wiki efficiency** — when fixing the same issue across 4 wikis, write one script that loops through all wikis rather than running 4 separate scripts
