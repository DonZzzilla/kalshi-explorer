# CSEZ Wiki Table Styling Reference

## Table CSS Classes

| Context | Class |
|---------|-------|
| Barter/trade tables | class="wikitable sortable" |
| Ammo ballistics | class="sortable mw-collapsible wikitable floatheader" |
| Armor stats | class="sortable mw-collapsible wikitable floatheader" |

## Dark Mode Color Scheme

### Rarity (barter tables)
COMMON #545f5f, UNUSUAL #3f8a38, RARE #38658a, EPIC #8a3865, LEGENDARY #8a6b38, ULTIMATE #6b388a

Format: | style="background-color:#38658a;" | RARE

### Protection Level (armor tables)
Level 0-1 #00008B, Level 2 #0000CD, Level 3 #008000, Level 4 #228B22, Level 5 #B8860B, Level 6 #8B0000, Price #3f8a38

### Penetration (ammo tables)
<1 #2e2e2e, 1-2 #545f5f, 2-3 #304d3e, 3-4 #194762, 4-5 #51325c, 5-6 #621b1b, >6 #3e0303

## Key Pitfalls
1. Never use FormData for Miraheze API POST — always use URLSearchParams
2. Merged XLSX cells: value in top-left; data column one right of merged header
3. Python requests Session preferred; watch for session timeout between calls
4. Table caption (+|) required for sortable tables
5. Color style before pipe: | style="background-color:#hex;" | value
