# BOA Wiki Tactical Operations & Cron Job Terminology

**Date**: 2026-07-11
**Wiki**: boa.miraheze.org (BOA Hub)

## Terminology Rules (ALL cron jobs and wiki content)
- **GoT** = "Ghosts of Tabor" — the VR tactical shooter by Combat Waffle Studios. NEVER "Game of Tabor".
- **BOA** = "Battlefield Observation & Awareness" — volunteer team teaching GoT, sanctioned by CWS. NEVER "Operation".
- **CWS** = "Combat Waffle Studios" — the developers behind Ghosts of Tabor.

## Cron Jobs Requiring Terminology Fixes (2026-07-11)
- `5bba516aabce` — BOA Wiki Builder: Added GoT/BOA/CWS terminology rules
- `cab2d4512983` — GoT Wiki Maintenance Scout: Added terminology rules
- `9029d230a003` — GoT Wiki Content Updater: Added terminology rules
- `f3c8924f24e2` — Daily Animal Fact Email: Rewritten to be purely about animals, NO wiki/game references. Fauna report format: 3 specimens rotating Spider→Snake→Creepy Crawler with Ghosts of Tabor tactical connection section.

## BOA Tactical Operations Pages Created (2026-07-11)
On boa.miraheze.org, created 6 pages under "Tactical BOA Operations":
1. **Tactical BOA Operations** — Main hub with core principles, VR constraints, nav to sub-pages
2. **Tactical BOA Operations/Entry Techniques** — 3-man stack roles, entry methods (button hook, criss-cross, slice the pie), VR tips
3. **Tactical BOA Operations/Areas of Responsibility** — 360° AOR math, 3-man open/stack configs, 2-man contingency, training drills
4. **Tactical BOA Operations/Breaching Techniques** — Grenade/shot/demo/move/open clears, decision matrix, VR breach tips
5. **Tactical BOA Operations/Field Manuals** — FM-01 through FM-07 (contact, room clear, extract, loot, downed, 2-man, scav)
6. **Tactical BOA Operations/Callouts & SOP** — Community callouts from pastebin, kit/player/tactical terminology, pre-raid/post-raid SOP

Plus 4 SVG tactical diagrams uploaded.

## Wiki Page Creation Pattern
```python
# Create page via API
r = s.post(BASE_URL, data={
    'action': 'edit', 'title': 'Tactical BOA Operations/Entry Techniques',
    'text': content, 'token': csrf, 'summary': '...',
    'format': 'json', 'bot': '1', 'createonly': '1'
})
# If articleexists, update instead (remove createonly, add bot: 1)
```

## Fauna Report Format
```
🦅 **Daily Fauna Report: [Animal Name]**
[2-3 paragraphs: hook, facts, behavior]
**Did You Know?** [one surprising fact]
**🎮 Ghosts of Tabor Tactical Connection:**
[Connect animal behavior to GoT gameplay/BOA doctrine]
```
Rotate: Spider → Snake → Creepy Crawler. Sent via `himalaya message send`.
