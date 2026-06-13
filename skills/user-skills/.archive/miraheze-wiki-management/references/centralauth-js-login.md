# Miraheze CentralAuth Login: JavaScript Fill Pattern

## The Problem

Miraheze uses SUL3 unified login at `auth.miraheze.org`. The login form has username and password fields that are React-controlled inputs. Using `browser_type` on each field individually causes the OTHER field to clear due to React re-rendering between separate tool calls. The fields also clear between `browser_type` → `browser_snapshot` → `browser_type` sequences.

## The Solution: JavaScript Fill

After navigating to `Special:UserLogin` (which redirects to `auth.miraheze.org`), fill both fields simultaneously via `browser_console`:

```javascript
var u = document.querySelector('input[name="wpName"]');
var p = document.querySelector('input[name="wpPassword"]');
if (u && p) {
  u.value = 'ZeroSkills';
  p.value = 'ForkedT2000';
  var evt = new Event('input', { bubbles: true });
  u.dispatchEvent(evt);
  p.dispatchEvent(evt);
}
```

Then immediately `browser_click` the login button (use snapshot to find its ref).

## Why This Works

Setting `.value` directly on the DOM element bypasses React's controlled input system. Dispatching the `input` event triggers React's onChange handler to sync its internal state. Because both fields are set in the same JS evaluation (no intermediate renders), neither field clears.

## Login-to-Edit Sequence

1. `browser_navigate` to `https://WIKI_DOMAIN/wiki/Special:UserLogin` → redirects to `auth.miraheze.org`
2. `browser_console` JS fill both fields (pattern above)
3. `browser_click` the login button (no snapshot between fill and click)
4. Browser redirects back to wiki
5. **NOW** do all API work via `browser_console` with absolute URLs
6. Do NOT navigate away until all edits are complete

## Post-Login Session Notes

- Use **absolute URLs** (`https://WIKI_DOMAIN/w/api.php`) in all fetch calls
- Relative URLs may fail because origin context can reference `auth.miraheze.org`
- Sessions expire fast — if fetch returns HTML instead of JSON, re-login immediately
- Each Miraheze wiki has its own session — logging into one does not log into others