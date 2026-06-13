# GoT Wiki AMA Archive — June 2026

## What Was Built

Created an AMA Archive on got.miraheze.org (Ghosts of Tabor Wiki) to catalog community-cataloged "Ask Me Anything" sessions with Combat Waffle Studios developers.

## Page Structure

| Page | Title | Purpose |
|------|-------|---------|
| `AMA` | Master page | Kanban overview + session index + contribution guidelines |
| `YYYY-MM-DD AMA` | Individual sessions | Full kanban + detailed notes per AMA |
| `AMA/Contributing` | Guidelines | How to add new AMAs, update kanban, move cards |
| `Category:AMA` | Category | Groups all AMA pages |
| `Category:YYYY AMAs` | Year categories | Sub-group pages by year |
| `Template:AMA Archive nav` | Nav template | Cross-linking breadcrumb on all AMA pages |

## Naming Convention

Individual AMA sessions: `YYYY-MM-DD AMA` (e.g., `2025-12-12 AMA`)

For AMAs without a clear date, use a descriptive name like `2024 Discord Roadmap AMA` or `2025 New Bunker AMA`.

## Kanban Structure

4 columns using wikitable with inline background colors:
- **Teased** (gold `#f5f0d8` header, `#faf8f0` body)
- **In Progress** (blue `#d8e4f5` header, `#f0f4fa` body)
- **Delivered** (green `#d8edd0` header, `#f0f8f0` body)
- **Scrapped** (red `#f5d8d8` header, `#faf0f0` body)

Each card: `; Title` (bold) + `: Description` (indented) + source note.

## Key Technical Notes

- **GoT wiki skin is Cosmos** (NOT Citizen, NOT Vector).
- **BOA wiki skin is Citizen** — different from GoT's Cosmos.
- **No custom CSS needed for wiki articles** — kanban works with standard wikitable + inline styles.
- **Categories must be at the very end** of the page.
- **No `{{#expr:...}}`** on Miraheze wikis — ParserFunctions not available.
- **No `{{Tmbox}}`** — use inline styled divs instead.
- **Wiki-native markup only** — no custom CSS on wikis unless explicitly asked.

## Sessions (21 total as of June 10, 2026)

| # | Date | Page | Platform |
|---|------|------|----------|
| 1 | 2022-11-04 | 2022-11-04 AMA | Discord |
| 2 | 2022-12-11 | 2022-12-11 AMA | Discord |
| 3 | 2023-03-24 | 2023-03-24 AMA | Discord |
| 4 | 2023-05-12 | 2023-05-12 AMA | Discord |
| 5 | 2023-07-27 | 2023-07-27 AMA | Discord |
| 6 | 2023-09-15 | 2023-09-15 AMA | Discord |
| 7 | 2023-10-12 | 2023-10-12 AMA | Discord |
| 8 | 2023-12-07 | 2023-12-07 AMA | Discord |
| 9 | 2024-03-26 | 2024-03-26 AMA | Discord/YouTube |
| 10 | 2024-05-01 | 2024-05-01 AMA | YouTube |
| 11 | 2024 | 2024 Discord Roadmap AMA | Discord |
| 12 | 2025-01-22 | 2025-01-22 AMA | Discord |
| 13 | 2025 | 2025 Wipe Soon AMA | Discord |
| 14 | 2025 | 2025 Dev AMA Recap | Discord |
| 15 | 2025-07-16 | 2025-07-16 AMA | Discord/YouTube |
| 16 | 2025 | 2025 Behind the Scenes AMA | Discord |
| 17 | 2025 | 2025 New Bunker AMA | Discord |
| 18 | 2025-12-08 | 2025-12-08 AMA | YouTube |
| 19 | 2025-12-12 | 2025-12-12 AMA | YouTube |
| 20 | 2026-03-13 | 2026-03-13 AMA | YouTube |
| 21 | 2026-06-08 | 2026-06-08 AMA | Twitch |

## Adding New AMAs — Data Source

When the user provides gotboa.com AMA URLs, the data is available as a static JSON file:

```
https://gotboa.com/ama/data.json
```

This returns a JSON object with:
- `amas[]` — Array of AMA sessions, each with `id`, `title`, `dateLabel`, `columns` (teased/progress/delivered/scrapped), `notes`
- `topics[]` — Array of topic definitions
- `categories{}` — Category mapping

Each card in `ama.columns[col]` has:
- `title` — Card title
- `body` — Quote/description text
- `topicId` — Optional link to master topic

**Do NOT scrape the HTML pages** — they're SPAs with no server-side rendering. Use the JSON API directly.

## Game Name

The game is **Ghost of Tabor** — never "Ghost of Yōtarō" or similar variants. Developer: Combat Waffle Studios (CWS), CEO Scott Albright.

## Community Editing

The page is designed for community editing:
- Clear contributing guidelines on `AMA/Contributing`
- Simple table-based kanban that any wiki editor can update
- Cards link to individual AMA pages for detailed notes
- Edit history is automatically tracked by Miraheze (no separate log needed)
