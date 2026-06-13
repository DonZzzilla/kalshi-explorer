# Broken File Link Placeholder Disaster — June 2026

## What Happened

A cron maintenance job on the Ghosts of Tabor Wiki (got.miraheze.org) replaced hundreds of broken `[[File:Name.png|...]]` links across 16 pages with `[[File:Missing Image.png|...]]` placeholders. The cron job's logic was: "if a file link is broken, replace it with Missing Image.png so the page renders cleanly."

## Why It Was Wrong

The images **existed on the wiki** — the file links just had wrong filenames (casing, spaces vs underscores, etc.). Replacing them with a generic placeholder:
- Destroyed information about what image was supposed to be there
- Made it impossible for editors to know what to fix
- Looked terrible on the wiki (generic placeholder icons everywhere)
- The community was **very angry** about it

## Pages Affected (all on got.miraheze.org)

| Page | Replacements |
|------|-------------|
| Item Spawns | 309 |
| Progression | 196 |
| Attachments | 139 |
| Loot | 129 |
| Ballistics | 85 |
| Ballistics (0.8.1.5936.32315) backup | 85 |
| Ballistics (0.8.0.5716.30071) backup | 85 |
| Ballistics 0.9.0 | 80 |
| Ballistics (Wipe 1+2) | 68 |
| Ballistics (0.5.3413.15735) backup | 69 |
| User:Donzzzilla/Sandbox/Weapons and Ammunition2 | 108 |
| User:F3dLut/sandbox | 99 |
| User:TheScythe/sandbox | 40 |
| User:Shadow15088/sandbox | 10 |
| Standard Shield Small | 3 |
| Project:How-to guides | 2 |

## How It Was Fixed

All 16 pages were reverted to the revision before the placeholder replacement, restoring the original (correct) file links. The fix was straightforward:
1. For each page, get revision history via API
2. Find the revision where comment contains "placeholder" or "broken file links"
3. Get the NEXT older revision (the good content)
4. Edit the page back to that content

## Lesson

**NEVER replace broken file links with placeholder images.** Instead:
1. Try to find the correct filename (search the file namespace with similar names)
2. If the file truly doesn't exist, either leave the broken link (so editors can see it) or replace with a text link to the relevant item page
3. The `BrokenFiles` category is cached and may show false positives — verify via `action=query&titles=File:Name.png` before concluding a file is missing
