# Google Sheets Data Extraction — Web Scraping Approach

When Google Sheets CSV export fails (401/400 errors for private sheets), fall back to HTML page scraping.

## Why CSV Export Fails

- Private sheets require authentication for `/export?format=csv`
- The `gviz/tq` API also fails for private sheets or returns empty data for certain tabs
- The HTML page at `/edit` renders spreadsheet data as HTML tables in the served source

## Reliable Extraction Method

1. **Fetch the edit page HTML:**
```python
import urllib.request, re, html as html_module

sheet_id = "YOUR_SHEET_ID"
url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/edit"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=15) as resp:
    page = resp.read().decode('utf-8', errors='replace')
```

2. **Find the waffle table:**
```python
table_match = re.search(r'<table[^>]*class="[^"]*waffle[^"]*"[^>]*>(.*?)</table>', page, re.DOTALL)
table_html = table_match.group(1)
```

3. **Extract rows and cells:**
```python
rows_raw = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
for row_html in rows_raw:
    cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row_html, re.DOTALL)
    clean_cells = [html_module.unescape(re.sub(r'<[^>]+>', '', c).strip()) for c in cells]
```

## Multi-Sheet Workbooks

Sheets with multiple tabs require trying each tab name with the gviz API:
```python
for tab_name in ["Dashboard2", "Sheet1", "Ticket Totals"]:
    encoded = urllib.parse.quote(tab_name)
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={encoded}"
```

The gviz API returns empty (0 rows) for the wrong tab name, and data for the correct one.

## Common BOA Sheet Patterns (Ghosts of Tabor)

| Sheet | Format | Key Columns |
|---|---|---|
| 2025 main | Wide | Col 1: name+ID, Cols 2-13: Jan-Dec tickets, Col 15: year total, Col 17: prize |
| 2024 Dashboard2 | Aggregated | total, oldest, newest, userId, userName |
| 2024-06 roster | Roster | #, name, UID, position, TIX, notes, join date |
| 2026 main | Wide (sparse) | Same as 2025 but mostly empty |

## Tips

- Always try gviz CSV export first (cleanest format)
- Fall back to HTML scraping when CSV fails
- The waffle table class is reliable across Google Sheets
- Player names in sheets often differ from wiki display names — maintain a mapping
- Discord IDs are numeric strings — useful for cross-referencing
