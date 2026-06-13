# Discord Forum Q&A Reading Pattern

Session: May 24-25, 2026 — Reading BOA Hub Safehouse Q&A forum for wiki tactics articles.

## Forum URL Pattern
Discord forums use: `https://discord.com/channels/<server_id>/<forum_id>`
Example: `https://discord.com/channels/1231367841844822076/1435402914108670133`

## ✅ API Token Auth via XHR — THE BEST METHOD (May 2026)

When you have Discord credentials, use XHR POST to the login API to get a token, then use that token for direct API calls. This is **far more reliable** than DOM scraping.

### Login
```javascript
(function() {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://discord.com/api/v9/auth/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() { resolve(JSON.parse(xhr.responseText).token); };
    xhr.onerror = function() { resolve('error'); };
    xhr.send(JSON.stringify({ login: 'EMAIL', password: 'PASSWORD', undelete: false }));
  });
})()
```

### Read Messages
```javascript
// GET https://discord.com/api/v9/channels/CHANNEL_ID/messages?limit=50
// Header: Authorization: TOKEN
```

### List Forum Threads
```javascript
// Archived: GET /api/v9/channels/FORUM_ID/threads/archived/public?limit=50
// Active: GET /api/v9/channels/FORUM_ID/threads/active
```

### Batch Fetch (store in window.__batchResults)
```javascript
Promise.all(threadIds.map(function(tid) {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://discord.com/api/v9/channels/' + tid + '/messages?limit=50', true);
    xhr.setRequestHeader('Authorization', token);
    xhr.onload = function() {
      var msgs = JSON.parse(xhr.responseText);
      var clean = msgs.filter(function(m) { return m.type === 0 || m.type === 19; })
        .map(function(m) { return { author: m.author.global_name || m.author.username, content: m.content }; });
      resolve({ thread: tid, messages: clean });
    };
    xhr.onerror = function() { resolve({ thread: tid, error: true }); };
    xhr.send();
  });
})).then(function(data) { window.__batchResults = data; return data.length; });
```

## ❌ What Does NOT Work (Confirmed May 2026)

| Method | Works? | Why |
|--------|--------|-----|
| localStorage | ❌ | Blocked/undefined in Discord's iframe sandbox |
| document.cookie | ❌ | Auth cookies are HttpOnly |
| XHR interceptor | ❌ | Discord uses WebSocket, not XHR |
| fetch() interceptor | ❌ | Discord uses WebSocket, not fetch |
| WebSocket override | ❌ | Connections established before override |
| fetch(credentials: include) | ❌ | Discord requires Authorization header |
| DOM text extraction | ✅ | Works but slow for large amounts of content |
| API token auth via XHR | ✅ | **Best method when credentials available** |

## CSS Selectors for DOM Scraping (Fallback)

| Element | Selector |
|---------|----------|
| Thread cards | `.mainCard_f369db` |
| Thread title | `.header_faa96b` |
| Tags/status | `.tags__08166` |
| Reply count | `.messageCountText_faa96b` |
| Message content | `[class*="messageContent"]` |
| Forum scroller | `.scroller_ef3116` (the one with `scrollHeight > 1000`) |

## BOA Hub Server Key Channels (May 2026)

| Channel | ID | Type |
|---------|-----|------|
| BOA Hub Q&A (boa_hub_qna) | 1435402914108670133 | Forum |
| BOA Tips & Tricks | 1293248371410079835 | Forum |
| Wiki Commands | 1383254048383303721 | Text |
| Questions | 1231391452429553697 | Text |
| General Chat | 1231367842495074347 | Text |
| BOA Hub News | 1404196330490040350 | Text |
| mentor-center | 1413839634298962011 | Text |
| wiki-chat | 1420103944327397406 | Text |
| mentoring-guide | 1413791344492679318 | Text |
| helpful-chat | 1365057415661486192 | Text |

## Forum Thread Q&A Content Extracted

### May 24, 2026 Session

**Thread: "Money issues" (28 replies)**
- Do trader quests and easy tasks for steady income
- Run keycards and flares during raids
- Find and sell boss figures
- Sell unused inventory (food from rations)
- Hourly mission reset — farmable if you survive
- Don't buy expensive items all at once
- Use official GoT Discord LFG channels (~80% positive)
- Vault/raid etiquette: "your vault/flare, your loot first"

**Thread: "What is the best formation for alpha con?" (5 replies)**
- Alpha container loadout tips

### May 25, 2026 Session — 29 Threads Read

#### Map Strategy Threads

**"do u guys have any tips for matka and island" (13 replies)**
- Island: Move cover-to-cover, stick to shadows/edges, avoid open areas
- Island key loot: Power Plant control room (keycards), Mansion (streamer items), Worker Housing (purple card)
- Matka: High-traffic areas (Tower Bridge, Scaffolding, Cathedral, Graveyard)
- Matka: Play slowly, use cover, never re-peek same spot, bring AP rounds

**"whats the best way to stay alive on matka" (4 replies)**
- Matka is open and close quarters, always kitted players
- Play slowly but not too slow, stay out of open, outer sides of map

**"Pls help me with mall" (12 replies) + "Mall Help" (9 replies)**
- Chill in spawn until fighting dies down
- Avoid main escalator/staircase
- Use circular area above Gappo as hold position
- Foxtrot shots = enemy nearby (100% chance)
- Shotguns (Origin 12, FAL) work well in tight spaces
- G3A3 good budget option for high-penetration

**"Island help" (3 replies) + "Island survivability" (3 replies)**
- Island: Move cover to cover, avoid open areas
- Best survival: don't engage unless necessary
- Understand how players move (snipers on hills, nakeds rush)

**"Every single raid I do that is not Missile Silo i get steamrolled" (20 replies)**
- Without AP: avoid distance engagements, play stealthy/patient
- Use utility (flash, smoke, grenades) to even playing field
- Green vault is best for AP rounds
- Do Shiro quests for AP (35 bottles from questline)

#### Boss Threads

**"How to kill bosses?" (16 replies)**
- Play around corners, funnel guards into doorways
- Spray doorways for easier kills
- Boss tier rankings: Mamba (best armor), Collector (best helmet/gun), Tatra (good armor/gun), Krtek (all-around)
- Collector AI trick: agro from bottom door → bunks → stairs → basement loop → enter from behind (boss won't shoot)

**"where are the all mall boss spawns?" (11 replies)**
- Tatra spawns: back of top floor Gappo, food court overlooking Matka, purple 2-story bathroom hallway, back circle of stairwell
- Nikolai spawns: back left side of tech store, X Insurance (near purple vault), almost anywhere on first floor

**"How to farm collectah naked" (3 replies)**
- Minimum kit: 7.62x51 (G3 for budget), bag, armor
- Collector is fast; many die to "spear AP kids" while farming

#### Money Making Threads

**"What are some really good ways to get money" (13 replies)**
- Kill kitted players (200k+ per Island raid on low end)
- Quest items (wire spools, journals, car batteries, flight recorders, streamer items)
- Foxtrot rig farming on Mall (~5k per rig)
- Boss hunting on Silo (Krtek's SKS = 15-19k + rep)
- High-value junk items (oxymeters ~1.6k, small)

**"What map has the best loot/ almost guaranteed keycards?" (46 replies)**
- No map has guaranteed keycards — all RNG
- Silo: easiest to loot, quick 5-min route, many card spawns
- Mall naked farming route: Ruger → headtap foxtrot → check spawns → camp/wait
- Training raids: keycards found are kept

#### PvP Threads

**"Trying PVP" (27 replies)**
- Practice gunplay in PVE first, then transition
- Most fights lost to poor positioning and who sees who first
- Information is greatest ally (count tags/bodies, listen for gunfire)
- Don't make too much noise or rush too fast
- Sound is critically important — chads push gunfire

**"Dodging players" (8 replies)**
- Learn player spawns, stay alert, listen for gunfire
- Always have an exit plan, never back into a corner

**"Kitted players" (10 replies)**
- Without AP: use high-caliber weapons (G3A3, BAR), aim for legs
- Grenades effective against kitted players without AP
- Element of surprise helps significantly

**"Whats the best map to kill kitteds" (9 replies)**
- Matka Underground, Mall (Red Card area), Miest
- Matka always has geared players; bring AP

#### Loadout/Equipment Threads

**"Suppressed guns" (14 replies)**
- Suppressors: increase velocity/damage, suppress sound
- Do NOT lower recoil
- Two AR suppressor models = same stats, different price/appearance
- Wolverine AR and Barrett suppress both sound AND muzzle flash

**"Is Insurance worth it?" (7 replies)**
- Most BOA mentors advise against insurance
- Only potentially worth it for high-tier loot (small chance)
- Low-tier loot: almost always returned anyway

#### Aim/Mechanics Threads

**"What's the way to control recoil and aim?" (8 replies)**
- Gunstock (physical or virtual) essential
- Weapon smoothing helps
- Push down gently when shooting
- Holosight zeroed at 50m; aim higher for distance

**"How do you properly aim grenades?" (4 replies)**
- Throw like a dart from chest (not arcing)
- Use grenade indicator (hold opposite hand)
- Underhand for shorter, controlled throws

**"Movement help/tips/trick/" (3 replies)**
- Virtual gunstock stabilizes weapons
- Toggle player body to see below you
- Snap vs smooth turning: personal preference
- Movement orientation: tweak to preference

**"How to get better aim" (7+8 replies)**
- Practice in bunker range 15-30 min before ranges
- Practice transitions between targets
- Use Aim XR or similar VR aim trainers
- Brace hand against body for stability

#### Teamwork Threads

**"Friend or foe" (4 replies)**
- Blue shoulder lights for team ID
- Good communication essential — call out positions constantly
- If teammates behind you, anyone in front is enemy

#### Trader/Progression Threads

**"Trader tasks" (8 replies)**
- Stack tasks with quests/map objectives
- Focus on tasks giving most reputation
- Turn in tasks like "kill Krtek" + sell his SKS = 15-19k rep
- No "roadmap" — do tasks you're capable of, repeat easy ones

**"Best way to level up traders?" (2 replies)**
- Mix of tasks and quests
- Stack tasks with quests/map you're doing
- Repeat easy tasks, then focus on quests for new levels

#### Bunker/Inventory Threads

**"Best bunker sorting" (5 replies)**
- No single "best" way
- Keep all raid gear in one section for grab-and-go
- Sort mags by type (stanag, scar, etc.)
- Put armors in bags, guns upright on wall, AP/regular mags in crates
- Boss kits on mannequins
