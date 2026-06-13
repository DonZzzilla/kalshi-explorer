# AMA Archive — June 2026 Case Study

## What Was Built

Created an AMA Archive on got.miraheze.org (Ghosts of Tabor Wiki) cataloging "Ask Me Anything" sessions with Combat Waffle Studios developers.

## Page Structure

- `AMA` — Master page with kanban overview, session index, contribution guidelines
- `YYYY-MM-DD AMA` — Individual session pages (e.g., `2026-06-08 AMA`, `2025-12-08 AMA`)
- `AMA/Contributing` — Guidelines for community editors
- `Category:AMA` — Category grouping all AMA pages
- `Template:AMA Archive nav` — Cross-linking breadcrumb transcluded on all pages

## Naming Convention

Individual sessions: `YYYY-MM-DD AMA` (sortable, unambiguous)

## Kanban Format

4-column wikitable with inline background colors:
- Teased: gold #f5f0d8 / #faf8f0
- In Progress: blue #d8e4f5 / #f0f4fa
- Delivered: green #d8edd0 / #f0f8f0
- Scrapped: red #f5d8d8 / #faf0f0

Cards use "; Title" + ": Description" list markup inside cells.

## Sessions Added

| Date | Host | Platform |
|------|------|----------|
| 2026-06-08 | Ghost of Yotaro / CWS CEO Scott | Twitch |
| 2025-12-08 | CWS CEO Scott | YouTube |
| 2025-07-16 | CWS CEO Scott | Discord/YouTube |
| 2025-01-22 | CWS CEO Scott | Discord |
| 2024-05-01 | CWS CEO Scott | YouTube |
| 2024-03-26 | CWS CEO Scott | Discord/YouTube |
| Discord AMA | CWS CEO Scott | Discord/YouTube |

## Key Pitfalls

1. Quadruple braces — {{{{TemplateName}}}} renders as raw text. Always use {{TemplateName}}.
2. Extra closing braces — {{About|...}}}} breaks rendering. Proofread template syntax.
3. No custom CSS on wiki pages — Use standard wikitable + inline styles.
4. Light vs dark theme — Match kanban colors to the target wiki's theme.
5. Template availability — Verify templates exist on Miraheze before using them.
