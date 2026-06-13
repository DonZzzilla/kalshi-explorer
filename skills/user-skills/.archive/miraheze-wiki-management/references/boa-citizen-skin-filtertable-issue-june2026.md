# BOA Citizen Skin — FilterTable JS Loading Issue

**Status:** UNRESOLVED (as of June 2, 2026)
**Wiki:** boa.miraheze.org
**Skin:** Citizen (NOT Vector, NOT Cosmos)

## Problem

FilterTable interactive filters work on CSEZ (Vector), GOT (Cosmos), and Silent North (Citizen — partial) wikis, but NOT on BOA. The filter buttons render (HTML/CSS works) but DataTable click handlers don't attach.

## Root Cause

The Citizen skin does not execute `MediaWiki:Common.js` the same way Vector does. Specifically:

- `mw.loader.load("https://cdn.jsdelivr.net/gh/...")` in Common.js does not execute in Citizen skin
- Custom inline JS injected via browser console WORKS (proves the gadget code itself is fine)
- The issue is that `mw.loader` simply doesn't fire in Citizen for externally-loaded gadgets

## Diagnostic Evidence

1. Filter buttons render → Template:FilterTable HTML generation works
2. DataTable initializes (`.DataTable()` returns truthy) → the FilterTable gadget's DataTable init runs
3. BUT column filter click handlers don't respond → the event delegation setup in the gadget didn't run
4. Manually injecting the JS via browser console → everything works

## Possible Fixes (Untested)

1. **MediaWiki:Citizen.js** — Citizen skin may have its own JS loading page. Check if adding the same `mw.loader.load()` call to `MediaWiki:Citizen.js` works.
2. **Common.js skin check** — Some skins use `mw.config.get('skin')` to gate JS. Check if Citizen skin loads Common.js at all.
3. **Inline script in page template** — Add the JS directly to the Citizen skin's template HTML (requires file system access, not just wiki admin).
4. **MutationObserver wrapper** — In Common.js, use a MutationObserver to detect when FilterTable elements are added and manually initialize them, bypassing mw.loader entirely.

## Citizen Skin JS File

The Citizen skin has its own JS loading mechanism. The file would be something like `MediaWiki:Citizen.js` or the skin's `skin.json` resource definitions. Needs investigation with interface-admin rights (which we have).

## Related FilterTable Notes

- Confirmed working on: CSEZ (Vector), GOT (Cosmos), Silent North (Citizen — works?)
- Silent North also uses Citizen skin — if filters work there but not on BOA, the issue may be BOA-specific (different Common.js content, or a conflicting script)
- Compare Silent North Common.js vs BOA Common.js to identify the difference
