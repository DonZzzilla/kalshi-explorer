# Multi-Map Leaflet System — June 2026

## Architecture Overview

Interactive Leaflet maps embedded in Miraheze wiki pages via `MediaWiki:Common.js`. Auto-loads on pages with `.interactive-map-container` divs using `data-map-id` attribute.

## Container Pattern

```html
<div class="interactive-map-container" data-map-id="island-of-tabor"
     style="width:100%;height:600px;background:#1a1a2e;border:1px solid #333;border-radius:8px;overflow:hidden;position:relative;"></div>
```

On mobile (<768px), height auto-adjusts to `min(65vh, window.innerHeight - top - 20)`.

## Map Configuration (MAP_CONFIGS in Common.js)

Each map entry contains:
- `image`: Wiki-hosted map image URL (`static.wikitide.net`)
- `bounds`: `[[0,0],[height,width]]` — must match tabormap.com image dimensions from `/api/map/maps`
- `markersUrl`: Wiki JSON data page via `action=raw&ctype=application/json`
- `tabormapUrl`: Link to tabormap.com map page
- `title`: Display name

## Coordinate System

**Tabormap CRS.Simple direct mapping.** Tabormap API returns pixel coords where `latitude` = Y from top, `longitude` = X from left. These map 1:1 to Leaflet `CRS.Simple`. **Do NOT use `flip_y` or `scale` transforms.**

**Getting bounds:** Query `GET /api/map/maps` → use `image_height` for bounds[1][0], `image_width` for bounds[1][1].

## Filter Control

### Desktop (>=768px)
- Position: `topright`
- Always visible
- Header shows: `Map Name [HIDE] 184`

### Mobile (<768px)
- Position: `bottomright`
- Header shows: `Map Name [SHOW] 184` (collapsed by default)
- Category list hidden until SHOW is tapped
- `max-height: 50vh` on panel

### Toggle Button
- **Location:** Between map name and marker count in the header bar
- **Style:** Amber/gold (`#d4a853`) bordered button
- **Labels:** `HIDE` (when panel visible) / `SHOW` (when collapsed)
- Toggles visibility of category checkboxes and tabormap footer

### Category Filtering
- Checkboxes with category color dots and marker counts
- Click label or checkbox to toggle category visibility
- Uses `L.featureGroup` per category — `map.addLayer()` / `map.removeLayer()` on toggle

## Marker Popup

```javascript
// Structure:
// Title (always present — tabormap requires titles)
// Description (only if non-empty)
// Images (with error handling)
// Coords + category badge
```

### Image Handling
- **Inline `onerror` is STRIPPED by Leaflet's popup sanitizer** — do not use
- **Use `map.on('popupopen')` event** to attach `addEventListener('error')` after popup renders
- Also check `img.complete && img.naturalWidth === 0` for already-broken images
- Images use `loading="lazy"`
- Tabormap images (`https://tabormap.com/uploads/...`) are server storage, not API endpoint — may fail due to CSP/hotlink

### Fallbacks
- Tabormap doesn't allow empty titles — no "Unnamed marker" fallback needed
- Empty descriptions are omitted (no empty gap in popup)

## Initialization — setTimeout is PRIMARY

`mw.hook('wikipage.content')` fires BEFORE Common.js runs. Always use:
```javascript
setTimeout(initMaps, 300);  // Primary
if (typeof mw !== 'undefined' && mw.hook) mw.hook('wikipage.content').add(initMaps);  // Backup
document.addEventListener('DOMContentLoaded', initMaps);  // Backup
```

## Data Upload — No contentmodel=json

MediaWiki JSON content model rejects raw text. Omit `contentmodel` — upload as wikitext, serve via `action=raw`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 0 markers | Purge, hard refresh, `?debug=true` |
| Empty JSON page after upload | Don't use `contentmodel: "json"` |
| Markers in wrong position | Check bounds match tabormap image dims; use `direct` transform |
| Images not loading | Expected for some (CSP/hotlink); handler hides broken images |
| Mall empty on tabormap | Correct — Mall has 0 tabormap markers, uses wiki data only |
| RL cache delay after edit | Purge page or use `?debug=true` |
| Mobile filter blocks map | Tap SHOW/HIDE toggle in header to collapse |
