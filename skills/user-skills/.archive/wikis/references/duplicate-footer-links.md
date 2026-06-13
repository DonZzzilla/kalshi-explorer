# Duplicate Footer Link Detection and Fix Pattern

## Problem

Wiki pages often accumulate duplicate wiki-link lines in the footer area. Common pattern:

```
== Some Section ==
Content here.

[[Game Mechanics]]          ← first occurrence (in body or as nav link)
[[Category:Game Mechanics]]
[[Category:Items]]
```

Or worse:

```
[[Game Mechanics]]
[[Game Mechanics]]          ← duplicate in footer
[[Category:Game Mechanics]]
[[Category:Items]]
```

## Detection (Python)

```python
import re

def find_footer_dup_links(content):
    lines = content.split("\n")
    cat_start = None
    for i in range(len(lines) - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped.startswith("[[Category:"):
            cat_start = i
        elif cat_start is not None and stripped != "":
            break
    if cat_start is None:
        return [], []
    footer_start = cat_start
    for i in range(cat_start - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped == "" or (stripped.startswith("[[") and stripped.endswith("]]")
                               and not stripped.startswith("[[File:")
                               and not stripped.startswith("[")):
            footer_start = i
        else:
            break
    footer_lines = lines[footer_start:cat_start]
    link_counts = {}
    for line in footer_lines:
        stripped = line.strip()
        if stripped.startswith("[[") and stripped.endswith("]]") and not stripped.startswith("[[File:"):
            link_counts[stripped] = link_counts.get(stripped, 0) + 1
    dup_links = {link for link, count in link_counts.items() if count > 1}
    return dup_links, footer_lines
```

## Fix Strategy

1. Skip redirect pages (content starts with `#REDIRECT`)
2. Skip pages with no categories
3. Identify the footer block (between last content and first `[[Category:`)
4. For each duplicated link in the footer, remove the **later** occurrence (keep the first)
5. Clean up excessive blank lines (3+ → 2)

```python
def fix_footer_dup_links(content):
    lines = content.split("\n")
    cat_start = None
    for i in range(len(lines) - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped.startswith("[[Category:"):
            cat_start = i
        elif cat_start is not None and stripped != "":
            break
    if cat_start is None:
        return None, "no categories"
    footer_start = cat_start
    for i in range(cat_start - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped == "" or (stripped.startswith("[[") and stripped.endswith("]]")
                               and not stripped.startswith("[[File:")):
            footer_start = i
        else:
            break
    if footer_start >= cat_start:
        return None, "no footer links"
    link_counts = {}
    for line in lines[footer_start:cat_start]:
        stripped = line.strip()
        if stripped.startswith("[[") and stripped.endswith("]]") and not stripped.startswith("[[File:"):
            link_counts[stripped] = link_counts.get(stripped, 0) + 1
    dup_links = {link for link, count in link_counts.items() if count > 1}
    if not dup_links:
        return None, "no duplicates in footer"
    seen = set()
    new_lines = lines[:footer_start]
    removed = []
    for line in lines[footer_start:]:
        stripped = line.strip()
        if stripped in dup_links:
            if stripped in seen:
                removed.append(stripped)
                continue
            seen.add(stripped)
        new_lines.append(line)
    if not removed:
        return None, "nothing to remove"
    new_content = "\n".join(new_lines)
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)
    new_content = new_content.rstrip("\n") + "\n"
    return new_content, f"Removed: {removed}"
```

## Related Patterns

- **Duplicate categories:** `re.findall(r'\[\[Category:[^\]]+\]\]', content)` — compare len vs len(set)
- **Concatenated links:** `[[Currency]][[Suppressor]]` on one line — the whole line is the duplicate
- **Mass duplicates (10+ copies):** Use `re.finditer` to find all, remove all but first in reverse order
- **Table-internal duplicates:** Flag for manual review, don't auto-fix complex table rows
