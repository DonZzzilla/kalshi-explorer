# Tabormap Sync — Dashboard & Status Page Pattern (June 2026)

## What Was Built

A **marker status dashboard** on the GoT wiki that shows current sync state and accumulates a history log, updated automatically by the daily cron sync.

### Pages

| Page | Purpose |
|------|---------|
| `Tabor_Map_Marker_Status` | Main dashboard — overview table, category breakdowns, sync details |
| `Tabor_Map_Marker_Status/Sync_History` | Subpage — table logging each daily sync run |

### Sync Script

`/home/donzzz/.hermes/scripts/tabormap_sync.py` — after syncing markers, calls `update_dashboard()` which:
1. Appends a row to the sync history table (date, per-map counts, total, change notes)
2. Refreshes marker counts on the main status page via regex replacement

## Key Pitfalls

### 1. `{{#expr:...}}` Templates Don't Exist on Miraheze

Miraheze wikis don't have the ParserFunctions `{{#expr:}}` template available by default. Using it produces:
> Expression error: Unrecognized punctuation character "[".

**Fix:** Use plain static numbers in the wikitext. The sync script updates them daily via regex.

### 2. `{{Tmbox}}` Template Doesn't Render

The `{{Tmbox}}` template is not available on Miraheze. It renders as raw template text at the top of the page.

**Fix:** Use an inline styled `<div>` instead:
```html
<div style="background:#1a1a2e;border:1px solid #3a3a5c;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
<span style="font-size:24px;">🗺️</span>
<span style="color:#e0e0e0;font-size:14px;">Notice text here</span>
</div>
```

### 3. Regex for Updating Wiki Table Cells

When updating marker counts in wiki table cells via Python regex, match the full cell including surrounding `||` delimiters:

```python
# Correct — matches "|| COUNT ||" with surrounding pipes
text = re.sub(
    r'(\| \[\[Map:Island of Tabor\|Island of Tabor\]\] \|\|)\s*\d+(\s*\|\|)',
    f'\\1 {new_count}\\2', text)

# Also handle any remaining {{#expr:...}} calls
text = re.sub(r"\{\{#expr:[^}]+\}\}", str(total), text)
```

### 4. Sync History Table Row Insertion

To insert a new row after the header separator (`|-`):
```python
lines = hist_text.split("\n")
insert_idx = 0
for i, line in enumerate(lines):
    if line.strip().startswith("|-"):
        insert_idx = i + 1
        break
lines.insert(insert_idx, new_row)
new_hist = "\n".join(lines)
```

To update an existing row for today (idempotent re-runs):
```python
if today in hist_text:
    lines = hist_text.split("\n")
    new_lines = []
    for line in lines:
        parts = line.split("||")
        if parts and parts[0].strip().lstrip("|-\n").strip() == today:
            new_lines.append(new_row.lstrip("|-\n").rstrip())
        else:
            new_lines.append(line)
    new_hist = "\n".join(new_lines)
```

## Reusable Pattern: Cron-Updatable Dashboard

This pattern works for any cron job that needs a visible status page with history:

1. **Main status page** — overview table with current numbers, static wikitext (no templates that might not exist)
2. **History subpage** — wikitable with date rows, appended/updated by the script
3. **Script's `update_dashboard()` function** — called after the main sync work, reads current page, updates via regex, writes back

The cron job prompt should instruct the agent to run the script and report results — the script itself handles all wiki updates.
