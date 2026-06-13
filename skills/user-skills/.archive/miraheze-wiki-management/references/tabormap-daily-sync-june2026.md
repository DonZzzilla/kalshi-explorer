# Tabormap.com Daily Sync — June 2026

## What It Does

Daily cron job (job ID `c661f8ff0397`) that syncs marker data from tabormap.com to the GoT wiki.

**Script:** `/home/donzzz/.hermes/scripts/tabormap_sync.py`

## Tabormap.com API

**Base URL:** `https://tabormap.com/api/map`

| Endpoint | Description |
|----------|-------------|
| `GET /api/map/maps` | List all maps — returns `image_width`, `image_height`, `image_url`, `marker_count` per map |
| `GET /api/map/markers?map=SLUG` | List markers for a map — returns pixel coords (`latitude`, `longitude`), `title`, `description`, `images`, `category_name`, `category_color`, etc. |
| `GET /api/map/categories?map=SLUG` | Marker categories |

**Coordinate system:** Tabormap returns pixel coordinates in the map image's pixel space:
- `latitude` = Y pixels from top (grows downward)
- `longitude` = X pixels from left
- These map **directly 1:1** to Leaflet `CRS.Simple` — no flip, no scale transform needed

**Images:** Stored as server-side paths (e.g., `/uploads/suggestions/xxx.webp`). Not served via a dedicated API endpoint. Prepend `https://tabormap.com` for absolute URLs. Images may fail to load due to CSP/hotlink protection — always use `onerror` handling.

## Maps Configured

| Map | Tabormap ID | Wiki JSON Page | Markers | Leaflet Bounds | Transform |
|-----|-------------|----------------|---------|----------------|-----------|
| Island of Tabor | `island` | `MediaWiki:Gadget-taborama-map-data-island-markers.json` | 184 | `[[0,0],[919,1635]]` | `direct` |
| Chodov Mall | `chodov-mall` | `MediaWiki:Gadget-taborama-map-data-chodov-mall.json` | 125 | `[[0,0],[984,1454]]` | `direct` |
| Matka Miest | `matka` | `MediaWiki:Gadget-taborama-map-data-matka-miest.json` | 153 | `[[0,0],[1265,2192]]` | `direct` |

**Bounds source:** From tabormap.com `/api/map/maps` endpoint — `image_width` → bounds[1][1], `image_height` → bounds[1][0].

**Mall:** Tabormap ID is `chodov-mall` (not `mall`). 125 markers with categories including PC Spawns, Exfill, Keycards, High Value Items, Boss Spawns, Equipment, Player Spawns, Flare, Keycard Vaults, Streamer Items, POI, and Junk Items. Bounds `[[0,0],[984,1454]]` match tabormap image dimensions (1454w x 984h).

## Coordinate Transforms

- **`direct`** (Island, Mall, Matka): Tabormap pixel coords → Leaflet CRS.Simple 1:1. `lat = tab_lat`, `lng = tab_lng`.

**⚠️ Do NOT use `flip_y` or `scale` transforms.** Tabormap Y already grows downward (same as Leaflet CRS.Simple). The old `flip_y` and `scale` transforms caused markers to appear in wrong positions (e.g., in the water).

## Marker Data Format

```json
{
  "id": "uuid",
  "category_id": 2,
  "category_name": "Streamer Items",
  "title": "Reaper Bobble Head Spawn",
  "description": "On the corner of the fallen pew...",
  "latitude": "318.500000",
  "longitude": "1142.500000",
  "is_pinned": false,
  "images": ["https://tabormap.com/uploads/suggestions/xxx.webp"]
}
```

**Note:** All markers have titles (tabormap doesn't allow empty). No "Unnamed marker" fallback needed.

## How Change Detection Works

The script computes a fingerprint from sorted marker IDs + titles + count. Only uploads when the fingerprint changes.

## Image Handling

- Tabormap stores relative paths (`/uploads/suggestions/xxx.webp`)
- Script prepends `https://tabormap.com` to create absolute URLs
- Images stored in marker `images` array (not separate `image` field)
- Images may fail to load (CSP/hotlink) — Common.js handles with `popupopen` event + `onerror` listener

## Adding a New Map

1. Fetch map info from `GET /api/map/maps` to get `image_width` × `image_height`
2. Add entry to `MAPS` in script with `coord_transform: "direct"` and bounds `[[0,0],[height,width]]`
3. Create wiki JSON page for marker data
4. Upload map image to wiki, get `static.wikitide.net` URL
5. Add container div to wiki page with `data-map-id`
6. Add entry to `MAP_CONFIGS` in Common.js
7. Purge Common.js and page cache

## Troubleshooting

- **"Existing: 0"**: Wiki JSON page empty/wrong format. Re-run script.
- **Markers in wrong position**: Check bounds match tabormap image dimensions. Ensure `direct` transform (not `flip_y` or `scale`).
- **Markers not rendering**: Purge Common.js, hard refresh, use `?debug=true`.
- **Images not loading**: Expected for some images (CSP/hotlink). Handler hides broken images gracefully.
- **Mall showing old data**: Tabormap ID changed from `mall` to `chodov-mall`. Fixed in June 2026 — Mall now pulls 125 markers directly from tabormap.com.
