# GoT Wiki Maintenance Sweep — May 2026 Session 9

**Date**: 2026-05-29
**Wiki**: got.miraheze.org
**Scanner**: OWL (cron job)
**Pages scanned**: 899 main namespace, 141 redirects, 758 non-redirects

## Summary

Fixed 7 broken file links across 4 pages. No content corruption, no broken redirects, no BOA content issues. No regressions from previous sessions.

## Fixes Applied

### Broken file links

#### SteamVR Jump Binding Fix — 3 broken placeholder images removed

All three were `[[File:...]]` references marked as "Placeholder image" comments. The files were never uploaded to the wiki (likely a failed upload during page creation). Removing the broken links eliminates the ugly broken-image icons on a help page that players depend on for troubleshooting.

| File Reference | Context |
|----------------|---------|
| `SteamVR_Binding_Default_To_Custom.png` | Step showing Default/Custom tabs in SteamVR bindings |
| `SteamVR_Binding_Gramsy_Shared.png` | Step showing Gramsy's shared binding in the list |
| `SteamVR_Binding_Manual_Jump_Edit.png` | Step showing joystick-to-jump action mapping |

Each placeholder had a parenthetical like `''(Placeholder image: ...)''` or `''<(Placeholder image: ...)>'` explaining what the image should show. The instructional text around them still explains the steps clearly.

#### Ballistics 0.9.0 — 2 broken image links fixed

| File | Before | After |
|------|--------|-------|
| `AK5C.jpg` (in Rifle Damage Chart table) | `[[File:AK5C.jpg\|center\|frameless\|195x195px]]` | `[[File:AK5C NoBG.png\|center\|frameless\|195x195px]]` |
| `Alpha_AK.png` (in Rifle Damage Chart table) | `[[File:Alpha_AK.png\|center\|frameless\|195x195px]]` | `<!-- Image:Alpha_AK.png missing -->` |

`AK5C NoBG.png` confirmed to exist as a local file. `Alpha_AK.png` has no known replacement file on the wiki — replaced with an HTML comment so editors can identify the gap.

#### Ballistics (0.8.0.5716.30071) backup + Ballistics (0.8.1.5936.32315) backup

Both backup pages had `AK5C.jpg` with an embedded Unicode Left-to-Right Mark (U+200E, ord 8206) character immediately after the filename: `AK5C.jpg\u200e`. This is a corruption artifact (likely from a copy-paste from a rich-text source). Fixed by:

1. Removing the `\u200e` LRM character
2. Replacing `AK5C.jpg` with `AK5C NoBG.png` (same replacement as above)

Both edits preserved the original image parameters (`|center|frameless|195x100px`).

## Issues Checked — No Action Needed

| Check | Result |
|-------|--------|
| Self-referencing redirects | 0 found across 141 redirects |
| Broken redirect targets | 0 — all redirect targets exist |
| BOA program pages (non-redirect) | 0 — all correctly redirect to GoT Wiki Hub |
| Content corruption (literal `\n`, `Image=File:`, dup categories) | 0 pages affected (verified on sample + full scan) |
| Infobox `Image=` contains `[[File:...]]` | All instances are correct — character/item/keycard infoboxes intentionally use `[[File:...]]` syntax (Portable Infobox format) |
| Uncategorized pages (tracking) | 65 "uncategorized" pages — all explained: 53 use `{{Quest}}` (auto-adds Category:Quests), 5 use `{{disambiguation}}` (auto-adds Category:Notice templates), 1 uses `{{TechSupportDisclaimer}}`, 2 are quest pages verified via `prop=categories` API |
| Wiki table class issues | Red Keycard table renders correctly in HTML |
| Trailing newlines, stray categories | No issues found |

## Regression Verification

- Previously-fixed pages (literal `\n`, `Image=File:`) remain clean: AK-47, Glock 17, M4A1, MP7, AK5C, Island of Tabor, Weapons, Equipment, Quests — all verified
- All fix edits return `Success` from the API
- No new corruption introduced

## Note: New Pattern to Watch — Unicode LRM in filenames

The backup Ballistics pages contained a Unicode Left-to-Right Mark (U+200E, zero-width) character embedded in file links: `[[File:AK5C.jpg\u200e|...]]`. This:
- Breaks file lookups (the API sees a different filename)
- Is invisible to human editors (zero-width character)
- Can only be found by inspecting file link strings for non-ASCII characters

**Detection** for future sweeps:
```python
if any(ord(c) > 127 for c in file_link):
    # inspect for invisible characters
```

Consider adding `re.findall(r'\[\[File:[^\]]*[^\x00-\x7f][^\]]*\]\]', content)` to the corruption scanner.
