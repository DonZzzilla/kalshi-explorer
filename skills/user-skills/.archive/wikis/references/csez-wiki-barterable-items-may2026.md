---

## Lessons Learned (2026-05-28)

### ⚠️ Table `|`/`}` Escaping When Building Wikitext in Python

**The problem:** When building wiki table wikitext via Python string operations, the `|}` table closing sequence is dangerous:
- In f-strings, `}` is a delimiter — `"text |}"` causes `SyntaxError`
- Appending `"|"}` and `"}"` as separate list entries creates `|\n}` (two lines), which the wiki parser does NOT recognize as a table closing
- Cell data extracted from source pages can contain embedded `|}` that bleeds into your new table

**Safe patterns for table closings:**
```python
# SAFEST: single combined string
closing = "|" + "}"
table_lines.append(closing)

# ALSO SAFE: chr() escape
table_lines.append("|" + chr(125))
```

**ALWAYS validate after building:**
```python
content = '\n'.join(table_lines)
lines = content.split('\n')
opens = sum(1 for l in lines if l.strip().startswith('{|'))
closes = sum(1 for l in lines if l.strip() == '|}')
assert opens == closes, "MISMATCH: %d opens vs %d closes" % (opens, closes)
```

### ⚠️ Cell Data Sanitization When Parsing Wiki Tables

When splitting rows by `\n|-\n` and cells by `||`, the `|}` closing marker from adjacent rows/table end can bleed into cell values. Example: a map cell containing `"Metro \n|}"` will prematurely close any table it's inserted into.

**Sanitize every extracted cell:**
```python
cells = [c.replace('|}', '').replace('\n|}', '').strip() for c in cells]
```

### ⚠️ Data Validation for Extracted Trades

Source pages can have copy-paste errors. Neumann's page had:
- `S.D Protector Full Body Armor` listed as **Ammo** type (should be Gear)
- 7 level-1 ammo rows all with identical trade cost `"S.D Protector Full Body , Armor"` (copy-paste from the armor row)

**Validate before using data:**
```python
# Type consistency
if b['type'] == 'Ammo' and any(kw in b['item'].lower() for kw in ['armor', 'helmet', 'vest', 'protector']):
    print("WARNING: armor listed as Ammo — check source page")

# Trade cost sanity
if b['type'] == 'Ammo' and any(kw in b['trade'].lower() for kw in ['armor', 'protector', 'full body']):
    print("WARNING: copy-paste error in ammo trade cost")

# Rarity consistency
if b['rarity'] == 'ULTIMATE' and float(b['level']) < 3.0:
    print("WARNING: ULTIMATE rarity at low level — may be data error")
```

Flag bad rows with `<!-- FIXME: correct trade cost unknown -->` on the source page instead of silently dropping them, so the user knows to verify.

### Trade Counts (Post-Repair)

After removing 8 bad Neumann rows (armor-as-ammo + copy-paste errors):

| Trader | Valid Trades |
|--------|-------------|
| Regiment (Igor) | 17 |
| NTG (Maggie) | 17 |
| TRUPIK'S (Johnny) | 3 |
| ARK (Tommy) | 18 |
| Boulder Forge (Maximilian) | 9 |
| Neumann (Anna) | 22 |
| **Total** | **86** |

Neumann's level 1 ammo trade costs still need verification — marked with FIXME tags on the Neumann page.

## Summary

The `Barterable Items` master page was completely rewritten on 2026-05-28. The old page only had ~22 trades from 4 traders (IGOR, MAGGIE, TOMMY, Maximilian) with wrong color names and missing traders.

## New Page Structure

1. Intro paragraph explaining barter trades
2. **Traders section** — summary table with links to all 6 trader pages + trade counts
3. **All Barter Trades section** — single master table with all 94 trades, sorted by trader then level
4. See also links (Traders, Junk, ALL AMMO_TRADES)
5. Categories: `[[Category:Items]]`, `[[Category:Gameplay]]`

## Trader Mapping

| Page Name | Display Name | Trades | Has Exfil/Map |
|-----------|-------------|--------|---------------|
| Regiment | Igor | 17 | No |
| NTG | Maggie | 17 | Yes (keys) |
| TRUPIK'S | Johnny | 3 | No |
| ARK | Tommy | 18 | No |
| Boulder Forge | Maximilian | 9 | Yes (keys) |
| Neumann | Anna | 30 | No |
| **Total** | | **94** | |

## Old Page Issues Fixed

- Used `darkbrown`/`darkblue`/`darkred`/`darkgreen` inline styles instead of proper hex rarity colors
- Missing TRUPIK'S and Neumann entirely
- Used old names (IGOR, MAGGIE, TOMMY) instead of page links
- Only 22 trades vs actual 94

## Wiki Page ID

- Page: `Barterable_Items` (pageid: 698)
- Last edit: revid 2493, 2026-05-28T18:37:32Z
