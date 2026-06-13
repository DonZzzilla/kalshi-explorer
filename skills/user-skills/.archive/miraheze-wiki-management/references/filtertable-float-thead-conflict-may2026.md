# FilterTable + FloatThead Conflict (May 2026)

## Symptom

After deploying FilterTable on GOT wiki (Cosmos skin), users reported:
- "Cannot reinitialise DataTable" alert popups when opening source editor
- Table headers vanishing or appearing in wrong location
- `<thead>` containing empty rows while actual header content moved to `<tfoot>`

## Root Cause

GOT wiki's `MediaWiki:Common.js` loaded **two conflicting table libraries**:

1. **FloatThead** (`MediaWiki:FloatThead-Combined.js`) — makes table headers sticky on scroll
2. **FilterTable's DataTables** (`gadget-impl.js`) — initializes DataTable on filter tables

Both try to manipulate `<thead>`. FloatThead wraps tables in `.dataTables_wrapper` divs. When FilterTable's gadget then calls `.DataTable()` on the same table, DataTables throws "Cannot reinitialise" because FloatThead already initialized it.

## The Wrong Fix: destroy(true)

Calling `DataTable().destroy(true)` to clean up before re-initializing **corrupts the DOM**:
- Header cells get moved out of `<thead>` entirely
- `<tfoot>` gets populated with the actual header content
- Result: empty `<thead>` with 0 `<th>` elements → DataTables throws `Cannot set properties of undefined (setting 'nTf')`

## The Correct Fix

**Remove FloatThead entirely.** Edit `MediaWiki:Common.js` and delete both lines:
```javascript
// Sticky Table Header (Combined Library + Initializer)
mw.loader.load( '/w/index.php?title=MediaWiki:FloatThead-Combined.js&action=raw&ctype=text/javascript&v=4' );
```

FloatThed is not needed — FilterTable's `dom: 't'` option already removes paging/info, and sticky headers aren't critical for wiki tables.

## Verification After Fix

1. Open a page with FilterTable (e.g., GOT Loot page)
2. Open source editor — no alert popup should appear
3. Check browser console: `jQuery.fn.dataTable.isDataTable('tableId')` should return `true`
4. Filter buttons and search should work without errors
