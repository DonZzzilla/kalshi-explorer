# Got Wiki Redirect Preservation — May 26, 2026

## Incident
Community reported that redirect pages were deleted during cleanup passes. Foxtrot AI (should redirect to ZERO FOXTROT) was completely missing. Investigation found:

- ZeroSkills directly deleted only 4 pages (BOA program content, Farming, Magical-Fix-Game-Button) — none were redirects
- Foxtrot AI had no creation/deletion logs — likely deleted in a prior session before log retention
- 6 redirect pages had stray `[[Category:Items]]` and literal `\\n` artifacts added during bot cleanup
  - Consumables, Health, Headphones, Altyn face shield, Blowtorch Head, Dry Fuel
  - These made redirects appear as categorized pages AND redirect pages

## Fixes Applied
1. **Foxtrot AI** — Recreated as `#REDIRECT [[ZERO FOXTROT]]`
2. **6 redirect pages** — Removed stray `[[Category:Items]]` and `\\n` artifacts, preserved redirect content

## Lesson: Redirects Are Sacred
- **Never delete or overwrite redirect pages.** They exist because users search with misspellings, abbreviations, and alternate names.
- **Before editing any page, check if `#REDIRECT` is the first line.** If yes, only fix stray content (categories, artifacts) — never remove the redirect itself.
- **If a known redirect is missing**, recreate it rather than leaving it gone.
- The community explicitly said: "Try not to touch redirect pages unless it truly is wrong."

## Redirect Pages Found with Stray Categories (Fixed)
| Page | Target | Issue |
|------|--------|-------|
| Consumables | Consumables and Health | `[[Category:Items]]` appended |
| Health | Survival mechanics#Health | `[[Category:Items]]` appended |
| Headphones | Equipment#Ear Protection | `[[Category:Items]]` appended |
| Altyn face shield | Altyn Face Mask | `[[Category:Items]]` appended |
| Blowtorch Head | Gas Torch Head | `\\n` + `[[Category:Items]]` |
| Dry Fuel | Solid Fuel | `\\n` + `[[Category:Items]]` |

## Missing Redirects to Monitor
- Foxtrot AI → ZERO FOXTROT (recreated)
- Ask the community for other known missing redirects

## Known Redirect Chains (May 2026)

| Redirect | Target | Final Article | Status |
|----------|--------|--------------|--------|
| Specter | Sean - Spectre Guns and Accessories | Sean - Spectre Guns and Accessories | Fixed 2026-05-27 (was pointing to non-existent "Spectre Guns & Accessories") |
| Consumable | Consumables and Health | Consumables and Health | Fixed 2026-05-27 (was double-redirect via Consumables) |
| Barret | Barrett M107A1 | Barrett M107A1 | Fixed 2026-05-27 (was double-redirect via Barrett) |
| M1SASS | M1A SASS | M1A SASS | Fixed 2026-05-27 (was double-redirect via M1ASASS) |
| Mason Burrito | Ma5on Burrito | Ma5on Burrito | Valid (Ma5on Burrito is a full article) |
| Zero Foxtrot | ZERO FOXTROT | ZERO FOXTROT | Valid (ZERO FOXTROT is a full article) |
