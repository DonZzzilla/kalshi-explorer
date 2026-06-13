# FilterTable Common.js Snippet — May 2026

Add this to `MediaWiki:Common.js` on each wiki that uses FilterTable.

**Note**: This JS runs on every page load. It initializes filter button click handlers and row filtering.

```javascript
/* FilterTable: filter table rows by column values */
$(function() {
  $('.filter-wrapper').each(function() {
    var $wrapper = $(this);
    var tableId = $wrapper.data('table-id');
    var $table = $('#' + tableId);
    if (!$table.length) return;

    $wrapper.on('click', '.filter-button', function() {
      var $btn = $(this);
      var $row = $btn.closest('.filter-row');
      var col = $row.data('col');
      var mode = $row.data('mode') || 'exact';
      var query = $btn.data('query') || $btn.text().trim();

      // Toggle selected state within this row
      if ($btn.hasClass('is-all')) {
        $row.find('.filter-button').removeClass('button-selected');
        $btn.addClass('button-selected');
        // Show all rows
        $table.find('tbody tr').show();
        return;
      }

      if ($btn.hasClass('filter-reset')) {
        $wrapper.find('.filter-button').removeClass('button-selected');
        $wrapper.find('.filter-button.is-all').addClass('button-selected');
        $table.find('tbody tr').show();
        return;
      }

      // Deselect "All" if a specific button was clicked
      $row.find('.is-all').removeClass('button-selected');
      $btn.toggleClass('button-selected');

      // Gather all active filters
      var filters = {};
      $wrapper.find('.filter-row').each(function() {
        var $r = $(this);
        var c = $r.data('col');
        $r.find('.filter-button.button-selected').not('.is-all').not('.filter-reset').each(function() {
          filters[c] = filters[c] || [];
          filters[c].push($(this).data('query') || $(this).text().trim());
        });
      });

      // Filter table rows
      $table.find('tbody tr').each(function() {
        var $tr = $(this);
        var show = true;
        for (var col in filters) {
          var cellText = $tr.find('td:nth-child(' + (parseInt(col) + 1) + ')').text().trim();
          var match = false;
          for (var i = 0; i < filters[col].length; i++) {
            if (mode === 'exact') {
              if (cellText === filters[col][i]) match = true;
            } else {
              if (cellText.indexOf(filters[col][i]) >= 0) match = true;
            }
          }
          if (!match) { show = false; break; }
        }
        $tr.toggle(show);
      });
    });

    // Initialize: select all "All" buttons
    $wrapper.find('.filter-button.is-all').addClass('button-selected');
  });
});
```

## Editing Common.js

Since `MediaWiki:Common.js` is an interface page, it requires `editinterface` permission:

```javascript
(async () => {
  var tokenResp = await fetch('/w/api.php?action=query&meta=tokens&type=csrf&format=json', {credentials:'include'});
  var tokenData = await tokenResp.json();
  var token = tokenData.query.tokens.csrftoken;

  // Fetch current content first
  var cur = await (await fetch('/w/api.php?action=parse&page=MediaWiki:Common.js&prop=wikitext&format=json', {credentials:'include'})).json();
  var current = cur.parse ? cur.parse.wikitext['*'] : '';

  // Append FilterTable JS (avoid duplicates)
  if (current.indexOf('FilterTable') >= 0) return {msg: 'already present'};

  var js = '\n\n/* FilterTable */\n' + '...';

  var newContent = current + js;

  var params = new URLSearchParams();
  params.append('action', 'edit');
  params.append('title', 'MediaWiki:Common.js');
  params.append('text', newContent);
  params.append('token', token);
  params.append('summary', 'Add FilterTable JS for interactive table filtering');
  params.append('format', 'json');

  var r = await fetch('/w/api.php', {method:'POST', credentials:'include', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:params.toString()});
  return await r.json();
})()
```

**Important**: Check if FilterTable JS is already present before appending to avoid duplicates.