# Template:Quest Infobox — CSEZ Wiki

Created 2026-06-03. ParserFunctions-based infobox for individual quest pages.

## Design Notes

- Could NOT use Scribunto `<infobox>` — no Lua module exists on CSEZ wiki
- ParserFunctions `#if` IS available — used for optional fields
- Dark theme matching CSEZ wiki style (#1a1a2e bg, #0f3460 headers)

## Fields

| Field | Required | Default |
|-------|----------|---------|
| name | No | {{PAGENAME}} |
| trader | Yes | — |
| faction | Yes | — |
| type | No | Any |
| location | Yes | — |
| objectives | Yes | — |
| difficulty | No | (empty) |
| rewards | Yes | — |
| previous | No | (hidden if empty) |
| next | No | (hidden if empty) |
| video | No | (hidden if empty) |
| image | No | (hidden if empty) |

## Page Structure Pattern

Each individual quest page follows this structure:

{{Quest
|name = Quest Name (Trader)
|trader = Trader Name
|faction = Faction
|type = PMC
|location = Map Name
|objectives = Objective text
|difficulty = Medium
|rewards = Reward list
|previous = Previous Quest (Trader)
|next = Next Quest (Trader)
|video = https://youtube.com/watch?v=XXX
}}

==Walkthrough==
(walkthrough text sourced from transcript)

==Video Guide==
* [https://youtube.com/watch?v=XXX Creator: Video Title]

==See Also==
* [[Trader Name|Trader's Quests]]
* [[Quests]]

[[Category:Faction Quests]]
[[Category:Trader Quests]]

## Quest Page Naming Convention

Quest Name (Trader) — e.g., "Lost and Found (Tommy)", "Supply Shortage (Maggie)"

## Video Source Links — HARD REQUIREMENT

Every transcript-sourced quest page MUST have:
1. |video= field in the infobox pointing to the specific YouTube video
2. == Video Guide == section with a direct link
3. == Video Walkthroughs == section on the trader page listing all source videos

Never create transcript-sourced pages without video links. User explicitly required this.
