# GoT Wiki Miscategorization Audit — May 26, 2026 (Session 2)

## Pattern: Currency Category on Non-Currency Pages

### Problem
The `[[Category:Currency]]` was incorrectly applied to weapon pages, attachments, and magazines. The bot had added it during bulk categorization.

### Detection Method
1. Get all pages in `Category:Currency`:
   ```
   action=query&list=categorymembers&cmtitle=Category:Currency&cmlimit=500
   ```
2. Batch-fetch categories for all Currency pages
3. Flag pages that have Currency + weapon/attachment/ammunition categories

### Pages Fixed
| Page | Wrong Category | Correct Categories |
|------|---------------|-------------------|
| Barrett M107A1 | Currency | Sniper, Weapons, Skins |
| Barrett Suppressor | Currency | Attachments, Suppressor |
| Barret Magazine | Currency | Ammunition |
| Gear for Gold | Currency | Quests |
| Koruna King | Currency | Quests |
| Golden AK-74 | Currency (only) | Weapons, Skins |
| Luty(Gold) | Currency (only) | Weapons, Skins, Items |

### Legitimate Currency Pages
- Silver Bar — correctly categorized as Currency (it's a junk item used as currency)

## Pattern: Domain-Specific Category Mismatches

When auditing for miscategorizations, check these common mismatch patterns:

| Category A | Category B | Likely Wrong | Notes |
|-----------|-----------|-------------|-------|
| Currency | Weapons | Currency | Guns aren't currency |
| Currency | Sniper/Rifle/Pistol | Currency | Guns aren't currency |
| Currency | Attachments | Currency | Attachments aren't currency |
| Currency | Ammunition | Currency | Ammo isn't currency |
| Currency | Quests | Currency | Quests aren't currency |
| Items | Quests | Items | Quests aren't items |
| Items | Enemies | Items | Enemies aren't items |
| Items | Locations | Items | Locations aren't items |

### Legitimate Multi-Category Combinations
- Game Mechanics + Items = OK (e.g., Equipment, Loot are both)
- Enemies + Items = OK only if it's a boss that drops items
- Weapons + Skins = OK (weapon skin variants)

## In-Game Spelling Reference
- Ma5on Burrito — correct in-game spelling (with a 5, not Mason)
- Arty's Game bord — correct in-game spelling (intentional typo)
- Foxtrot AI should redirect to ZERO FOXTROT

## Page Title Gotchas

### Spectre / Sean Naming
- "Spectre Guns & Accessories" (with `&`) — **does NOT exist** as a page. Any redirect pointing here is broken.
- "Spectre Guns and Accessories" (with `and`) — exists but is itself a redirect to the actual article.
- "Sean - Spectre Guns and Accessories" — the **canonical article** (trader page). Use this as the redirect target.
- The `&` character in page titles causes API issues: `titles=` parameter doesn't match, and the page genuinely doesn't exist on this wiki. Always use `and` or the `Sean -` prefixed title.

### BOA: In-Game Faction vs. Community Program
- **In-game "BOA"** = Bureau of Acquisition, an NPC faction in Ghosts of Tabor. Pages like "BOA Supply Drop" (a quest) are legitimate game content that belong on got.miraheze.org.
- **Community "BOA program"** = the clan/community program (About BOA, Ranks, Discord Rules, etc.). These pages belong ONLY on boa.miraheze.org and should be redirected to GoT Wiki Hub if they appear on got.
- When auditing for BOA program content, search for "About BOA", "BOA Ranks", "Discord Rules", "Hall of Fame", "Team Map" — NOT "BOA Supply Drop" or other in-game references.
