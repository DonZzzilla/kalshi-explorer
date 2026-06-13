# Pitfalls Discovered — May 2026 Session 10

## 1. Unicode LRM in File Links Is Often a False Positive

The corruption scanner detects non-ASCII characters (including U+200E Left-to-Right Mark) in `[[File:...]]` links. **However**, MediaWiki resolves both the LRM-containing filename and the clean filename to the same file when they have identical content.

**Diagnostic:** Before "fixing," verify by checking the file's `pageid` and `sha1`:
```
action=query&titles=File:Filename.png|File:Filename.png%e2%80%8e&prop=imageinfo&iiprop=sha1
```
- If both resolve to the same `pageid` and `sha1` → the file links work. **Cosmetic only — skip.**
- If different or one is missing → genuine broken file link.

**Also:** Emoji characters (✅, ❌, 💬, ・) in filenames are valid on Miraheze and do NOT break file resolution. Don't flag these either.

## 2. WantedCategories Cache Doesn't Update Immediately

After creating category pages, the `Special:WantedCategories` tracking category **does not update in real time**. It can take hours or a MediaWiki job queue run.

**Diagnostic:** Don't re-query `list=querypage&qppage=Wantedcategories` to verify creation. Instead, directly check each created category:
```
action=query&titles=Category:X&format=json
```
If `missing` property is absent, the category page exists — regardless of what WantedCategories reports.

**Also:** The WantedCategories API returns names WITH the "Category:" prefix already included (e.g., `Category:Category:Quests`). The actual category name is the string after the first `Category:`.

## 3. System/Tracking Categories Must Not Be Created

Auto-generated MediaWiki tracking categories (prefixed with "Pages with...", "Pages using...", "Pages including...", "Candidates for...", "Stubs", "Outdated", "Hatnote templates with errors") are **extension-generated** and should never be manually created. Creating them causes duplicate/confusing entries.

**Rule:** From the WantedCategories list, SKIP any category that starts with:
- `Pages with`
- `Pages using`
- `Pages including`
- `Candidates for`
- `Hatnote templates with errors`

These will clear automatically once the source issues are resolved or the cache rebuilds.

## 4. Category Page Creation — Structural Dependency Ordering

When creating many category pages in bulk, **check parent category pages exist first**. If Category:B wants parent Category:A, but Category:A doesn't have a page either, create Category:A first.

**Pattern:** Always do a pre-flight pass:
1. Collect all (category → parent) pairs
2. Check which parent category pages already exist
3. Create missing intermediate parents first
4. Then create the target categories

**Standard content format for a category page:**
```
Brief description of [[Topic X]].

[[Category:ParentCategory]]
```
Minimal. No infobox, no complex templates. Just text + parent category assignment.

## 5. Category-Namespace Redirects in BrokenRedirects Tracking

Category-namespace redirects (e.g., `Category:BOA Hub` → `#REDIRECT [[GoT Wiki Hub]]`) often appear as "broken" in the BrokenRedirects tracking category. **Check before acting:**

1. Fetch the redirect page content — extract the `#REDIRECT [[Target]]`
2. Verify the target exists via `action=query&titles=X&format=json`
3. Check it resolves via `action=query&titles=Source&redirects=1`

If the redirect resolves correctly, it's a **false positive** — don't edit. The tracking system doesn't handle category-namespace-to-main-namespace redirects well.

## 6. BOA Keyword False Matches

Searching for "BOA" in page titles catches legitimate game content:
- "BOA Supply Drop" → A quest (legitimate)
- "Circuit Board" → A junk item (legitimate)
- "Motherboard" → A junk item (legitimate)

Only actual BOA program pages (About BOA, BOA Program, BOA Ranks, Discord Rules) should be redirected to GoT Wiki Hub.
