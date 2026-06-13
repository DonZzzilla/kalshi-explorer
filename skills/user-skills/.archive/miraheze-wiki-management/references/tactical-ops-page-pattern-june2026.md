# Tactical Operations Page Pattern (June 2026)

## Structure

When building a multi-page tactical operations section on a Miraheze wiki, use MediaWiki's subpage feature (`/`) to create a parent page with child pages:

```
Tactical BOA Operations          (parent/main hub)
Tactical BOA Operations/Entry Techniques
Tactical BOA Operations/Areas of Responsibility
Tactical BOA Operations/Breaching Techniques
Tactical BOA Operations/Field Manuals
Tactical BOA Operations/Callouts & SOP
```

## Parent Page Template

The main hub page should include:
- `{{DISPLAYTITLE:...}}` for clean title rendering
- `{{BOA Navbox}}` (or wiki-specific navbox)
- Brief overview explaining the section's purpose
- Core principles (bulleted list)
- Constraints specific to the game/platform
- Navigation table linking to all sub-pages with descriptions
- "See Also" section linking to related existing pages
- Categories at the very end

## Sub-Page Template

Each child page should:
- Link back to parent: `< [[Tactical BOA Operations]]`
- Include `{{BOA Navbox}}`
- Use `== Section ==` for major sections, `=== Subsection ===` for details
- Use `{| class="wikitable"` for reference tables
- Use `[[File:...]]` for diagrams (verify file exists FIRST)
- End with "See Also" section and categories

## Image Verification

Before publishing any page that references images, verify every `[[File:...]]` reference exists:

```python
import requests, re, json

base_url = 'https://WIKI_DOMAIN/w/api.php'
s = requests.Session()
s.headers.update({'User-Agent': 'OWL-Bot/1.0'})

# Get page content
r = s.get(base_url, params={'action':'parse','page':title,'prop':'wikitext','format':'json'}).json()
content = r['parse']['wikitext']['*']

# Find all file references
files = re.findall(r'\[\[(?:File|Image):([^\]|]+)', content)

# Check each one exists
for fname in files:
    r2 = s.get(base_url, params={
        'action': 'query', 'titles': f'File:{fname}',
        'prop': 'imageinfo', 'iiprop': 'url', 'format': 'json'
    }).json()
    for pid, pinfo in r2['query']['pages'].items():
        if 'missing' in pinfo:
            print(f'MISSING: {fname}')
```

## Lesson: Verify Before Publishing

The Breaching Techniques page was published with references to 7 breach technique images. All happened to exist because Don had uploaded them previously, but there was no verification step. **Always verify image references before publishing pages.**

## Lesson: Image Style Consistency

When community members upload tactical diagram images (typically dark background #24241B with amber highlights #FFBB27), maintain that style for any new images. Key characteristics:
- Dark tactical background
- Amber/yellow for highlights and callouts
- Clean sans-serif text
- Minimal, functional design — no decorative elements
- Consistent canvas sizes within a set (e.g., all breach images 793px tall)
