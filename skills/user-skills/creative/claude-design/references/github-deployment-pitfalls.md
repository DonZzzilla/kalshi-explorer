# GitHub Pages Deployment Pitfalls

## Asset Paths
- GitHub Pages serves from a configured folder (e.g., `/docs`). Relative paths in HTML resolve from that folder.
- `assets/logo.png` in `docs/index.html` → `https://user.github.io/repo/assets/logo.png` → maps to `docs/assets/logo.png` on disk.
- Files at repo-root `assets/` are NOT accessible via Pages. Always put assets inside the Pages source folder.
- Verify with: `git ls-tree -r HEAD --name-only | grep assets` and `curl -sI <url>`.

## CDN Cache Busting
- GitHub Pages CDN caches aggressively. After pushing changes, the live site may serve stale content for 10-30+ minutes.
- `Last-Modified` and `etag` headers in `curl -sI` response tell you which version is being served.
- **Symptom: headers update but body stays stale.** After a push, `curl -sI` may show a new `Last-Modified` timestamp and new `etag`, but `curl -s` body still contains old content. This means the origin server has the new file but the CDN edge cache hasn't refreshed. Wait 15-20 minutes or trigger a Pages rebuild.
- To force a refresh: trigger a Pages rebuild via `POST /repos/{owner}/{repo}/pages` with the same source settings. If that returns 409, Pages is already enabled but may still be building. Wait and retry.
- Empty commits and file delete/recreate do NOT reliably bust CDN cache.
- **Verification pattern:** After push, wait 15-20s then `curl -sI <url>` and check `last-modified` and `etag` changed. Then `curl -s <url> | grep 'unique-string-from-change'` to verify body updated. Don't trust headers alone — the CDN can serve new headers with old body.

## Enabling Pages via API
```
POST /repos/{owner}/{repo}/pages
{
  "source": {
    "branch": "main",
    "path": "/docs"
  }
}
```
- Returns 422 if repo has no files yet.
- Returns 409 if Pages already enabled (not an error).
- Build takes ~10-30 seconds. Check status at `GET /repos/{owner}/{repo}/pages/builds/latest`.

## Pushing Files via GitHub API
- Read file content inside `execute_code` from disk: `open(path).read()` — do NOT embed large strings as literals.
- For binary files (PNG/JPG): `base64.b64encode(open(path, 'rb').read()).decode('ascii')`.
- Use `urllib.request` with `Authorization: token {token}` header for authenticated calls.
- Token must be `.strip()`-ed of whitespace. Write to temp file first, read back.

## HTML Structure Verification
- After any `patch` edit near the top of an HTML file, verify: `<!DOCTYPE html>` → `<html>` → `<head>` → `<meta charset>` → `<title>` → `<style>`.
- Missing `<head>` tag causes quirks mode — elements render with wrong box model, flex layouts break, sections get wrong widths.
- Use `curl -s <url> | grep -oP '<!DOCTYPE|<head>|<body>'` to verify structure.
- **The `<head>` tag can be silently removed by `patch` when editing near `<!DOCTYPE>` or `<html>`.** Always re-verify after patching the top 20 lines.

## CSS Duplicate Rule Detection
- After patching CSS, check for duplicate selectors: `curl -s <url> | grep -oP 'selector\{[^}]+\}'`.
- If a selector appears twice, the second occurrence wins (CSS cascade).
- Use `replace_all=True` in `patch` for global CSS find-replace to avoid duplicates.
- **Multiple sequential `patch` calls on CSS can create duplicates or merge rules.** After every 2-3 CSS patches, grep the file for the selector names. If found more than once, consolidate.

## Mobile Nav / Overlay Patterns
- Use `position:fixed` with explicit `background-color:#XXXXXX` (hex, not rgba) for opaque overlays.
- Use BOTH `background:#XXXXXX;background-color:#XXXXXX` — some mobile browsers don't render the shorthand reliably on fixed elements.
- **Do NOT use `opacity:0;visibility:hidden` transitions for mobile nav show/hide.** These are unreliable on mobile browsers. Use simple `display:none` → `display:flex` toggle instead.
- `z-index:10000` for mobile nav (above scanlines/overlays at 9999).
- `overflow-y:auto;-webkit-overflow-scrolling:touch` for scrollable menus.
- Touch targets: `min-height:48px`, full-width links with centered text.
- Add a prominent CTA button at the top of the mobile menu for the primary action.
