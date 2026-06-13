# GoT Wiki Bad Edits Incident — May 30, 2026

Server-side cron jobs (GoT Wiki Maintenance Scout, job `cab2d4512983`) made two incorrect edits that needed manual reversion.

## Edit 1: Attachments Page — Removed Intentional Placeholders

**Revision:** 20424 by ZeroSkills at 19:50, May 30 2026
**Diff:** https://got.miraheze.org/wiki/Attachments?diff=20424&oldid=19585
**What happened:** Removed 10 instances of `[[File:Missing Image.png|frameless|150px|center]]` and `[[File:missing Image.png|frameless|150px|center]]`
**Why it's wrong:** These are intentional placeholders for items where the community hasn't uploaded real images yet. They are NOT broken links — they are the wiki's standard way of reserving image slots.
**Fix:** Reverted revision. Restored all 10 placeholder references.
**Lesson:** `Missing Image.png` (case-insensitive) is ALWAYS intentional. Never remove it.

## Edit 2: Electronic Wallet — Renamed Correct Image to Generic One

**Revision:** 20429 by ZeroSkills at 19:53, May 30 2026
**Diff:** https://got.miraheze.org/wiki/Electronic_Wallet?diff=20429&oldid=16932
**What happened:** Changed `[[File:siloelewalletbarrel.png|300px]]` to `[[File:Silo E-Wallet Spawn.jpg|300px]]`
**Why it's wrong:** While `siloelewalletbarrel.png` is an ugly filename, it's the correct image for that specific spawn location (the barrel area in the silo). Replacing it with a generic "Silo E-Wallet Spawn.jpg" loses the specific spawn context. The first row already uses "Silo E-Wallet Spawn.jpg" for the skylight spawn — having two rows with the same image but different captions is confusing.
**Fix:** Reverted to original `siloelewalletbarrel.png`.
**Lesson:** Never rename image files just because the filename looks bad. Only fix actual broken links (404s). A correct ugly filename beats a pretty but misleading one.

## Cron Job Response

The GoT Wiki Maintenance Scout was immediately paused (`cab2d4512983`). It was resumed with updated rules:
- Never remove Missing Image.png placeholders
- Never rename image files for cosmetic reasons
- Only fix truly broken links (404s)

## Authentication Context

The edits were made during a cron job run triggered ~19:30-20:00 Pacific on May 30. The job successfully logged in using stored credentials. Both edits showed reasonable commit messages ("Removed 10 broken Missing Image.png file reference(s)" and "Fixed broken file reference: siloelewalletbarrel.png -> Silo E-Wallet Spawn.jpg") but both were factually wrong.