# CSEZ Bot: Changelog Update from Discord (June 2026)

## Problem

When the bot detected a new CSEZ build in `#csez_updates`, it only updated `Template:Version`. It did NOT add patch note details to the `Changelog` page.

## Solution

Added `update_csez_changelog(build, patch_notes)` function that appends entries to the Changelog page via API.

## ⚠️ Pitfall: Changelog Code Must Be Live Before Build Arrives

If the changelog update function is added AFTER a build message was processed, that build's notes will NEVER be auto-added. Recovery:
1. Manually add the missing entry to Changelog via API
2. NEVER test with hardcoded dummy notes against the live wiki

## ⚠️ Pitfall: GoT Hotfix Detection Gap

GoT messages may say "0.13.0 Hotfix 5" instead of full build number `0.13.0.XXXX.XXXXX`. The regex won't match the short form. Fix: check embed fields for full build number, or query Quest Store DB.

## Full Bot Flow

1. Message → extract build from content + all embed parts
2. Compare with last_known_build
3. If new: update Template:Version, append Changelog, write RSS, sync GitHub

## Verification

- Template:Version shows new version
- Changelog has new entry at top of Alpha
- GitHub repo updated
- RSS feed updated
