# Reference: BOA Hub Wiki Cleanup (May 2026)

## Context
The BOA Hub Wiki (https://boa.miraheze.org) was set up using a copy of a Project Sekai wiki (Citizen skin on Miraheze). It was never adapted for its actual purpose — documenting the BOA (Battlefield Observation & Awareness) Team for Ghost of Tabor. All templates pointed to non-existent pages, and only 5 pages existed.

## What Was Done

### Main Page Redesign
Replaced the entire Main Page content. The old version had 10+ broken `{{Main Page news}}`, `{{Main Page timers}}`, `{{Main Page/Challenge Live}}`, `{{Main Page FAQ}}`, `{{Main Page official links}}`, `{{Main Page social links}}`, `{{Main Page resources}}`, `{{Main Page contributing}}` template calls — all from Project Sekai.

New Main Page uses direct wikitext with inline CSS for layout (dark gradient boxes, flex layout). No template dependencies.

### Deleted Broken Templates
These templates were deleted entirely (they referenced Project Sekai pages that don't exist):
- `Template:Main Page news`
- `Template:Main Page timers`
- `Template:Main Page/Challenge Live`
- `Template:Main Page FAQ`
- `Template:Main Page official links`
- `Template:Main Page social links`
- `Template:Main Page resources`
- `Template:Main Page contributing`

### Kept and Updated Templates
- `Template:Main Page/styles.css` — cleaned up, kept for Main Page section layout
- `Template:Main Page about` — kept but no longer used on Main Page (content inlined)
- `Template:Main Page about/styles.css` — kept
- `Template:Main Page navigation` — updated to point to BOA pages (was Characters/Songs/Events/Virtual Lives/Gachas/Cards/etc.)
- `Template:Main Page navigation/styles.css` — kept as-is

### New Pages Created
- `Guide:Getting Started` — step-by-step guide for new BOA users
- `BOA Ranks and Structure` — rank system and organization

### Updated Pages
- `About` — rewritten from "About page in progress" to full content
- `BOA Hall of Fame` — reformatted table, removed missing image references, added highlights column
- `Guide:FAQ` — fixed heading syntax (# to ==), added categories

### Skin Configuration
- `MediaWiki:Sidebar` — updated with BOA Hub navigation
- `MediaWiki:Cosmos-navigation` — created top navigation bar (Citizen skin specific)
- `MediaWiki:Common.css` — full dark theme overhaul
- `MediaWiki:Citizen-footer-desc` — updated
- `MediaWiki:Citizen-footer-tagline` — updated

## Page Count Before/After
- Before: 5 pages (Main, About, Hall of Fame, FAQ, Team Map)
- After: 7 pages (+ Getting Started, Ranks & Structure)

## Footer Revert Incident
During the session, the footer-tagline was accidentally changed to "Powered by volunteers. Built for the community." The user asked for a revert. Fixed by:
1. Using `action=query&prop=revisions&rvdir=older` to find the original revision
2. Fetching the original content via `rvstartid=<rid>&rvprop=content`
3. Restoring via `action=edit`

The session counter went from 59 to 76 edits during cleanup.

## Remaining Work
- Team Map page still renders `{{Map:TeamMap}}` which likely doesn't work
- Only 6 files uploaded (3 logos, 1 map base, 1 example image, 1 icon)
- No BOA member profile pages yet
- No game mechanics pages yet

### Skin Configuration — ORIGINAL (DonZzzilla's setup)
- `MediaWiki:Sidebar` — proper Citizen format with sections: navigation, BOA Hub, Guides, Resources, Wiki, SEARCH, TOOLBOX, LANGUAGES
- `MediaWiki:Cosmos-navigation` — set to `{{int:Sidebar}}` (renders sidebar content in top nav)
- `MediaWiki:Common.css` — full dark theme overhaul
- `MediaWiki:Citizen-footer-desc` — "{{SITENAME}} is the official wiki dedicated to the BOA (Battlefield Observation & Awareness Team) Hub discord server of Ghost of Tabor, sanctioned by Combat Waffle Studios and started by Scott Albright. This wiki aims to provide the most comprehensive information about all BOA content..."
- `MediaWiki:Citizen-footer-tagline` — "BOA Hub Discord: https://discord.gg/taborboahub <br> Ghost of Tabor Discord: https://discord.gg/ghostsoftabor"

**Important:** Do NOT change footer/social elements. CWS specifically designed these icons and links.

## Lessons
- Citizen skin's `MediaWiki:Cosmos-navigation` should be `{{int:Sidebar}}` — do NOT replace with custom nav
- `MediaWiki:Sidebar` must use `* section` / `** link|display` format — flattening to bullet list breaks the drawer
- "Toggle menu" in Citizen skin opens the sidebar drawer — separate from search, notifications, personal menu toggles
- Do NOT modify CWS (Combat Waffle Studios) footer/social elements without explicit permission
- TemplateStyles errors auto-categorize pages; removing broken calls fixes it
- When a wiki is a copy of another game's wiki, assume ALL templates are wrong until verified
- Inlining Main Page content (instead of templates) is more resilient for small wikis
