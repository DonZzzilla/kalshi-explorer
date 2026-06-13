# Page Creation via Browser Console API (June 2026)

## Pattern for Creating New Wiki Pages

When the browser is already logged into a Miraheze wiki (ZeroSkills session):

### Step 1: Navigate to the Edit URL
```
browser_navigate to: https://WIKI_DOMAIN/wiki/NewPageName?action=edit
```
This opens the edit form for a non-existent page and establishes the CSRF token.

### Step 2: Get CSRF Token
In `browser_console`:
```javascript
fetch('https://WIKI_DOMAIN/w/api.php?action=query&meta=tokens&type=csrf&format=json', {credentials: 'include'})
  .then(r => r.json())
  .then(d => d.query.tokens.csrftoken)
```

### Step 3: POST the Edit
```javascript
// Build content as a single string (use \n for newlines in wikitext)
var pageContent = "==Section==\nContent here\n\n[[Category:Example]]";

var p = new URLSearchParams();
p.append('action', 'edit');
p.append('title', 'NewPageName');
p.append('text', pageContent);
p.append('token', 'CSRF_TOKEN_HERE');
p.append('summary', 'Create page with content');
p.append('format', 'json');

fetch('https://WIKI_DOMAIN/w/api.php', {
  method: 'POST',
  body: p,
  credentials: 'include'
}).then(r => r.json()).then(d => console.log(d.edit));
```

## Key Pitfalls

1. **FormData not available**: Hermes browser console doesn't have `FormData.append`. Use `URLSearchParams` instead.
2. **Variable collision**: Running multiple `browser_console` expressions in the same page session causes `SyntaxError: Identifier 'token' has already been declared` if you reuse `const token`. Use `var token2` or different names.
3. **Large content**: Wiki pages can be very large (100KB+). Build the content string carefully — test with a small stub first, then do a second edit to expand.
4. **Cross-origin blocked**: Can only edit the wiki domain you're currently on. Navigate to each wiki separately.
5. **Session loss**: If browser navigates away (e.g., `about:blank`), session is lost. Re-login before editing.

## Example: Creating a Trader Page

From the Quests page, we extracted the full wikitext to understand the table structure, then created a dedicated trader page with:
- Trader infobox
- Quest tables (Early/Mid/Late sections)
- Quest progression notes
- Rewards overview
- Tips section
- External guide links
- Categories

The page was created in two edits:
1. Small stub (to verify the page could be created)
2. Full content (all tables, sections, categories)
