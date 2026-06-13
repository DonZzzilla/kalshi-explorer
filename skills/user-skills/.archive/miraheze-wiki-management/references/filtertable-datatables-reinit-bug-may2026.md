# FilterTable "Cannot reinitialise DataTable" Bug

## Symptom
When opening the source editor (or any action that triggers `wikipage.content` hook), alert popup: "DataTables warning: table id=XXX — Cannot reinitialise DataTable." Table headers may also appear to vanish.

## Root Cause
The FilterTable gadget (`gadget-impl.js`) uses `mw.hook('wikipage.content').add()` to call `.DataTable()`. This hook fires on every content reload (source editor preview, VisualEditor save, etc.). The gadget has no `$.fn.dataTable.isDataTable()` guard. DataTables throws `alert()` via `setTimeout` which can't be caught by try/catch.

## WRONG FIX: destroy(true)

A `DataTable().destroy(true)` call corrupts the table DOM: it moves header cells from thead into tfoot, leaving empty thead rows. This causes a secondary error: "Cannot set properties of undefined (setting 'nTf')".

Evidence: After destroy(true), the eq_glasses table had:
- thead: 1 row, 0 cells (empty tr)
- tfoot: 2 rows with header content moved here
- tbody: empty

Never use destroy(true) as the fix.

## CORRECT FIX: Idempotent Monkey-Patch

Patch jQuery.fn.DataTable to be idempotent - if already initialized, return the existing instance:

```javascript
(function() {
    function patchDataTable() {
        if (typeof jQuery === 'undefined' || typeof jQuery.fn.DataTable === 'undefined') {
            setTimeout(patchDataTable, 100);
            return;
        }
        var orig = jQuery.fn.DataTable;
        var api = jQuery.fn.dataTable;
        if (!orig || !api) return;
        jQuery.fn.DataTable = function(opts) {
            var initialized = false;
            this.each(function() { if (api.isDataTable(this)) { initialized = true; return false; } });
            if (initialized) { try { return api.Api(this[0]); } catch(e) { return this; } }
            try { return orig.apply(this, arguments); } catch(err) {
                if (err.message && err.message.indexOf('reinitialise') !== -1) { try { return api.Api(this[0]); } catch(e2) { return this; } }
                throw err;
            }
        };
        for (var p in orig) { if (orig.hasOwnProperty(p)) jQuery.fn.DataTable[p] = orig[p]; }
    }
    patchDataTable();
})();
```

The patch intercepts .DataTable() calls. If the table already has DataTables, it returns the existing API instance. If init fails with "reinitialise" error, it catches and returns existing. New tables initialize normally.

## Deployment

MediaWiki:Common.js is PROTECTED - only bureaucrats/editors can edit it. Bot accounts get permissiondenied. The wiki admin must apply this manually. Add right before the mw.loader.load("...gadget-impl.js") line.

## Debugging

- Check: jQuery.fn.dataTable.isDataTable(document.getElementById('tableId'))
- Inspect thead for empty rows (DOM corruption indicator)
- Count: document.querySelectorAll('.filter-wrapper').length
- Test: jQuery('#tableId').DataTable().column(0).search('text').draw()

## Status
- Identified: May 31, 2026
- destroy(true) confirmed WRONG (causes DOM corruption)
- Idempotent patch confirmed WORKING
- Fix requires manual edit by wiki admin
