# Miraheze Gadget Creation — June 2026 (Updated)

## How the Gadgets Extension Actually Works

The Miraheze Gadgets extension uses a **legacy pipe-separated format** in `MediaWiki:Gadgets-definition`, NOT modern JSON files.

### Correct Registration Method

Edit `MediaWiki:Gadgets-definition` with one gadget per line:

```
* GadgetFriendlyName|ScriptPage.js|dependencies=|default
```

Example:
```
* TranslateButton|TranslateButton.js|default
* tabor-map|Gadget-tabor-map.js
```

- The `*` prefix marks an active gadget (comment with `#` to disable)
- `|default` flag auto-enables for all users (omit for opt-in)
- Script page is relative to `MediaWiki:` namespace

### JSON Definition Pages

JSON definition pages (`MediaWiki:Gadget-*.json`) CAN supplement the legacy format. The API `list=gadgets` shows gadgets registered via either method. The legacy pipe format is authoritative.

### ⚠️ CRITICAL: Auto-Loading Timing Issue

**ResourceLoader modules (including gadgets) execute BEFORE page content is rendered.**

- `document.querySelector('.my-class')` at module scope returns `null`
- `mw.hook('wikipage.content')` registered from a gadget fires BEFORE content is added
- `$(document).ready` / `DOMContentLoaded` fire before RL modules complete

**The gadget IIFE runs at page load, but wikitext content hasn't been rendered yet.**

#### What Does NOT Work

```javascript
// ❌ Returns null — content not rendered yet
var container = document.querySelector('.tabor-map-container');

// ❌ Hook fires before content exists (from gadget scope)
mw.hook('wikipage.content').add(init);
```

#### What Might Work (Polling Approach)

```javascript
function tryInit() {
    var c = document.querySelector('.tabor-map-container');
    if (!c) return false;
    initMap(c);
    return true;
}
if (!tryInit()) {
    var interval = setInterval(function() {
        if (tryInit()) clearInterval(interval);
    }, 500);
    setTimeout(function() { clearInterval(interval); }, 10000);
}
```

### ⚠️ CRITICAL: Anonymous Users Don't Get User Gadgets

**Gadgets enabled in user preferences only load for that user.** Anonymous visitors do NOT get gadgets, even with `|default` flag.

Verified: `mw.user.getName()` returns `null` and `mw.user.isAnon()` returns `true` for anonymous visitors.

**Workaround: Use `MediaWiki:Common.js` instead of a gadget** — Common.js loads for ALL users via the `site` ResourceLoader module group. This is the approach that actually works for anonymous visitors.

### ✅ Common.js Loading Pattern (WORKING — June 2026)

`MediaWiki:Common.js` loads via ResourceLoader's `site` module group, which executes AFTER page content is rendered. This means:

1. `document.querySelector('.my-class')` WORKS from Common.js
2. `mw.hook('wikipage.content')` DOES fire from Common.js (confirmed working)
3. `DOMContentLoaded` may have already fired — use as backup, not primary

**Working pattern:**
```javascript
(function() {
    'use strict';
    
    function loadMap() {
        var container = document.querySelector('.tabor-map-container');
        if (!container) return false;
        if (window.__taborMapLoaded) return true;
        window.__taborMapLoaded = true;
        // ... init map ...
        return true;
    }
    
    // Primary: mw.hook fires after content renders
    if (typeof mw !== 'undefined' && mw.hook) {
        mw.hook('wikipage.content').add(loadMap);
    }
    // Backup: DOMContentLoaded (may have already fired, but safe to add)
    document.addEventListener('DOMContentLoaded', loadMap);
    // Fallback: setTimeout for edge cases
    setTimeout(loadMap, 100);
})();
```

**Key insight:** The `mw.hook('wikipage.content')` registered from Common.js DOES fire correctly. The old reference said it "may never fire" — this was incorrect. It fires because Common.js (via `site` module group) loads after the content is already in the DOM.

### ⚠️ CRITICAL: Script Tags Always Stripped

MediaWiki sanitizer strips ALL `<script>` tags from wikitext, templates, and Scribunto output. **ONLY ResourceLoader modules can load custom JS.**

### Loading External JS/CSS from Gadgets or Common.js

From within a gadget or Common.js RL module, you CAN load external scripts:

```javascript
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js';
script.onload = function() { /* use L */ };
document.head.appendChild(script);
```

jsdelivr CDN works without CSP issues on Miraheze.

### Pitfall: jsdelivr + Private GitHub Repos

jsdelivr cannot serve from private GitHub repos (returns 404). Host assets on the wiki instead.

### ✅ Reliable Data Fetching for Anonymous Users

**⚠️ `fetch()` with `action=parse` returns HTML for anonymous users in some contexts.** The response starts with `<!DOCTYPE` instead of JSON. Same issue affects `mw.Api()` when called during early page load.

**✅ Use `jQuery.get()` with `action=raw` + `ctype` — most reliable pattern:**

```javascript
jQuery.get('/w/index.php', {
    title: 'MediaWiki:Gadget-tabor-map-data-island-markers.json',
    action: 'raw',
    ctype: 'application/json'
}, function(raw) {
    // raw is the plain text content of the page
    var markers = JSON.parse(raw);
    console.log('Loaded', markers.length, 'markers');
    renderMap(container, markers);
}, 'text').fail(function(xhr) {
    console.error('XHR failed:', xhr.status, xhr.statusText);
});
```

**Why this works:** The `action=raw` endpoint returns the raw page content without any API wrapper. The `ctype` parameter ensures proper content type. `jQuery.get()` with `'text'` dataType avoids automatic JSON parsing that would fail on HTML error pages.

**Alternative using `mw.Api()` (works when called AFTER RL modules are ready, e.g., from within `mw.hook`):**
```javascript
var api = new mw.Api();
api.get({
    action: 'query',
    titles: 'MediaWiki:DataPage.json',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    format: 'json'
}).done(function(data) {
    var content = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0].slots.main['*'];
    var markers = JSON.parse(content);
});
```

### Coordinate System for Leaflet Image Maps

- Use `L.CRS.Simple`
- Image bounds: `[[0, 0], [image_height, image_width]]`
- Markers at pixel coordinates: `[lat, lng]`

### Scribunto extensionTag Limitations

`frame:extensionTag('script', ...)` outputs tags that are **stripped by the sanitizer**. Does NOT work for JS injection.

### ResourceLoader Cache Propagation Delay

**⚠️ Edits to `MediaWiki:Common.js` are cached by ResourceLoader.** Changes may take several minutes to propagate to users.

**Workarounds:**
1. **Purge the page:** Use `action=purge` on the Common.js page via API
2. **Use `?debug=true`:** Append to URL to bypass RL cache during testing
3. **Hard refresh:** Users must Ctrl+Shift+R to see JS changes

**Purge via API:**
```python
r = s.post(API, data={
    "action": "purge",
    "titles": "MediaWiki:Common.js",
    "format": "json"
})
```

### Working Pattern for Interactive Maps (Complete)

1. **For anonymous users:** Put loader in `MediaWiki:Common.js` (not a gadget)
2. **For logged-in-only:** Register in `MediaWiki:Gadgets-definition` as `* map-name|Gadget-map.js|default`
3. **Data loading:** Use `jQuery.get()` with `action=raw` + `ctype` to fetch JSON data from wiki pages
4. **External libraries:** Load via `document.createElement('script')` from jsdelivr CDN
5. **Container detection:** Use `mw.hook('wikipage.content')` + `setTimeout` fallback
6. **Host assets on wiki:** Upload images to wiki, reference via `static.wikitide.net` URLs
7. **Cache management:** Purge Common.js after edits, use `?debug=true` for testing

### PetraMagna's Approach (T15046 — March 2026)

From Miraheze issue tracker T15046, PetraMagna suggested:
- Host assets on GitHub (public repo) + serve via jsdelivr CDN
- Use a MediaWiki gadget to load the map JS
- Avoid iframes (CSP blocks them on Miraheze)

**Our adaptation:** Since the GitHub repo was private (jsdelivr returns 404), we hosted assets directly on the wiki instead. The Common.js approach works for all users without requiring gadget opt-in.

### Verified Working Example (June 2026)

**Island of Tabor interactive map** — 184 markers, 15 categories:
- `MediaWiki:Common.js` — Self-contained loader with `jQuery.get()` + `action=raw`
- `MediaWiki:Gadget-tabor-map-data-island-markers.json` — 184 marker records (186KB)
- `MediaWiki:Gadgets-definition` — `* tabor-map|Gadget-tabor-map.js|default` (registered but loader is in Common.js)
- Map image: `https://static.wikitide.net/gotwiki/9/95/Tabor-Island-map.webp`
- Leaflet: `https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js`
- Sandbox: `https://got.miraheze.org/wiki/User:DonZzzilla/sandbox5`

**Result:** 184 markers rendered, 0 errors, works for anonymous users.
