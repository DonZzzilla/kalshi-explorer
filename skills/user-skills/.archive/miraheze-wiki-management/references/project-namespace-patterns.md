# Project Namespace Pages — Patterns and Templates

## Overview

Every Miraheze wiki should have a set of standard Project namespace pages. These provide legal info, help resources, and organizational structure. This reference covers the 8 standard pages built for the GoT, BOA, SilentNorth, and CSEZ wikis (June 2026).

## The 8 Standard Pages

### 1. Project:Copyrights
- Explains CC BY-SA 4.0 license in plain language
- Written for a younger audience (teenage playerbase)
- Clarifies what the wiki owns vs. what the game developer owns
- Links to full license text on creativecommons.org
- Wiki-specific: game name, developer name, trademark ownership

### 2. Project:General_disclaimer
- Content accuracy disclaimer (not guaranteed 100%)
- Not-official notice (fan-run, not affiliated with developer)
- Use-at-your-own-risk for in-game decisions
- Third-party links disclaimer
- Points to Copyrights for licensing details

### 3. Project:About
- What the wiki is and what it covers
- Who runs it (fan-run, community-operated)
- Links to Volunteers, User Groups, Help Center
- What content can be found on the wiki
- How to contribute (4-step: account, start small, learn, join)
- Legal stuff (trademarks, licensing)
- Wiki-specific: game name, developer, key content pages

### 4. Project:Help_center
- Hub page linking to all other Project pages
- Getting started section (FAQ, How-to, About)
- Contributing section (Volunteers, User Groups, Copyrights)
- Policies section (Disclaimer, Copyrights)
- Contact info (talk pages, Discord, administrators)

### 5. Project:FAQ
- General questions (what is it, is it official, who writes it)
- Editing questions (how to edit, need account, undo mistakes)
- Content questions (can I use it, upload images, report problems)
- Account questions (forgot password, change username, get promoted)

### 6. Project:How-to_guides
- Account creation, page editing, page creation, talk page usage
- Wiki markup reference table
- Advanced: templates, redirects, reverting vandalism, references
- Tips: preview, summaries, be bold, cite sources

### 7. Project:Volunteers
- Call to action (no experience needed)
- How to get involved (4 steps)
- Volunteer roles table
- What help is needed

### 8. Project:User_groups
- Role overview table
- Current team listing with user links
- Organized by hierarchy
- How to get promoted

## Wiki-Specific Customization

| Element | GoT | BOA | SilentNorth | CSEZ |
|---------|-----|-----|-------------|------|
| Game | Ghost of Tabor | Ghost of Tabor (BOA) | Silent North | CSEZ |
| Developer | Combat Waffle | Combat Waffle | Combat Waffle | Caveman Studios |
| Steward | DonZzzilla | — | — | — |
| Bureaucrats | 9 | 4 | 3 | 8 |

## Tone Guidelines

- **Copyrights**: Explain like talking to a teenager. Simple language, bullet points.
- **Disclaimer**: Friendly but clear. "We want to be upfront."
- **About**: Welcoming and informative.
- **Help pages**: Step-by-step, encouraging. "No experience necessary!"
- **User Groups**: Factual and organized.

## Research Steps Before Building

1. Check existing Project pages via API
2. Get user groups: `meta=siteinfo&siprop=usergroups`
3. Get group members: `list=allusers&augroup=GROUPNAME`
4. Get wiki stats and general info
5. Get main page content for context
6. Check categories
