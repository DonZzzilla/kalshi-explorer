# Fandom Migration Cleanup Pattern (May 2026)

## Context
Pages migrated from Fandom wikis carry Fandom-specific artifacts that don't render correctly on Miraheze (Citizen skin). Common on game wikis that moved from Fandom to Miraheze.

## Artifacts Found and Fixed

### 1. `fandom-table` CSS Class
**Symptom:** Tables with `class="sortable fandom-table"` or `class="fandom-table wikitable sortable"` — the `fandom-table` class is ignored by Citizen skin, breaking intended styling.
**Fix:** Remove `fandom-table` from class attribute, keep `wikitable sortable`.
```python
content = re.sub(r'\s*fandom-table\s*', ' ', content)
content = content.replace('class="  ', 'class="')  # clean double spaces
```
**Pages affected on Silent North:** Tech Support, Locations

### 2. Fandom Interwiki Links
**Symptom:** Links like `[[w:c:community:Help:Getting Started]]` or bare URLs to `fandom.com`/`fandom-stars.fandom.com` — these point to wrong wiki.
**Fix:** Remove the entire line or replace with equivalent local page link (e.g., `[[Getting Started]]`, `[[Wiki Rules]]`).
```python
# Remove Fandom interwiki links
content = re.sub(r'\[\[w:c:[^\]]+\]\]', '', content)
# Remove bare Fandom URLs
content = re.sub(r'\[?https?://[^\]\s]*fandom[^\]\s]*\]?[^\n]*', '', content, flags=re.IGNORECASE)
```
**Pages affected on Silent North:** Main Page (3 Fandom links in Helpful Resources section), Silent North Wiki (2 Fandom links)

### 3. "Helpful Resources" Section
**Symptom:** Post-migration pages often have a `== Helpful Resources ==` section linking to Fandom Community Central and Fandom editing guides.
**Fix:** Remove the entire section. Replace with a single `[[Getting Started]]` or `[[Wiki Rules]]` link if desired.

### 4. Fandom Infobox Syntax
**Symptom:** Infoboxes using Fandom-specific syntax like `{{Infobox}}` with non-standard parameters.
**Fix:** Standardize to Portable Infobox syntax. (Not yet encountered on Silent North, but common on GoT/CSEZ wikis.)

## Detection
Scan all pages:
```python
fandom_artifacts = []
for title, content in all_content.items():
    has_fandom = 'fandom' in content.lower()
    has_fandom_table = bool(re.search(r'fandom-table', content, re.IGNORECASE))
    has_wc = bool(re.search(r'w:c:', content))
    if has_fandom or has_fandom_table or has_wc:
        fandom_artifacts.append((title, {
            'fandom_refs': has_fandom,
            'fandom_table': has_fandom_table,
            'wc_links': has_wc
        }))
```
