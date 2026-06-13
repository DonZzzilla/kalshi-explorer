# CSEZ Wiki: Data Source & Scraping

## Primary Data Source

URL: https://www.exfil-zone-assistant.app/items
Game version: 1.14.0.2

## JSON API Endpoints

The site loads data from individual JSON files. Discover endpoints via browser console:
var s=performance.getEntriesByType('resource'); var xhr=s.filter(function(e){return e.initiatorType==='fetch'}); xhr.map(function(e){return e.name})

Then fetch all 15 categories via browser console:
var files=['weapons','ammunition','magazines','attachments','grenades','armor','helmets','face-shields','backpacks','holsters','medical','provisions','task-items','keys','misc']; var results={}; function fetchAll(i){if(i>=files.length)return Promise.resolve(JSON.stringify(results)); var f=files[i]; return fetch('https://www.exfil-zone-assistant.app/data/'+f+'.json').then(function(r){return r.json()}).then(function(d){results[f]=d;return fetchAll(i+1)})} fetchAll(0)

Categories: weapons(69), ammunition(39), magazines(57), attachments(93), grenades(9), armor(24), helmets(30), face-shields(6), backpacks(11), holsters(7), medical(18), provisions(16), task-items(43), keys(33), misc(150). Total: 605 items.

## Key Fields Per Item

name, description, category, subcategory
stats.rarity (Common/Uncommon/Rare/Epic/Legendary/Ultimate)
stats.price (integer EZD)
stats.weight (float kg)
stats.caliber, stats.fireRate (RPM), stats.ergonomics (0-1), stats.MOA, stats.penetration

## Wiki Page Mapping

Weapons: single Weapons page with sortable wikitable (columns: Image, Name, Caliber/Trader/Price/Rails/FireModes/Weight/Recoil/Ergo/Firepower-MOA/RPM)
Ammunition: per-caliber pages with ammo charts (penetration, damage, velocity)
Barter: per-trader pages (Boulder Forge, Regiment, TRUPIK'S, ARK, NTG, Neumann)
Quests: individual Task:Page_Name pages

## Critical Rules

1. All prices in EZD, never Koruna
2. Never credit exfil-zone-assistant.app on the wiki - use data silently
3. Quest display text: [[Scavs|Scav]] for scav runs, [[PMC|PMC]] for PMC runs
4. Priority order: Weapons page first (single page, biggest impact), then ammo pages, then armor/equipment, then barter price updates

---
Last updated: May 2026 - game v1.14.0.2