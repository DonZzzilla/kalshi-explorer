# Page Creation via Browser Console

## Wikitext Newline Construction

When building wikitext content in `browser_console` JavaScript, you cannot use template literals (backtick strings) if the wikitext contains backticks or triple-quote markup. Use `String.fromCharCode(10)` for newlines:

```javascript
var NL = String.fromCharCode(10);
var content = 'First line';
content += NL;
content += 'Second line';
content += NL + NL;  // blank line = new paragraph in wikitext
content += '== Section ==';
content += NL;
```

## Table Construction

Tables are particularly sensitive to newline placement. Each row MUST be on its own line:

```javascript
var NL = String.fromCharCode(10);
var table = '{| class="wikitable sortable"' + NL;
table += '! Col1 !! Col2 !! Col3' + NL;
table += '|-' + NL;
table += '| val1 || val2 || val3' + NL;
table += '|-' + NL;
table += '| val4 || val5 || val6' + NL;
table += '|}' + NL;
```

## Avoid These Patterns

- `var text = "Line1\nLine2"` — `\n` inside JS strings becomes a real newline ONLY if the string parser interprets it. In browser console eval context, this works but is fragile with complex wikitext.
- `uuu` or `\\n` as newline placeholders — these DON'T create actual newlines in the wikitext. Will produce broken tables and formatting.
- Triple-quoted strings (`'''`) in content — these conflict with wikitext bold markup. Escape or build content piece by piece.

## Creating the Page

```javascript
var token = /* get from query&meta=tokens&type=csrf */;
var NL = String.fromCharCode(10);
var content = 'Page intro text.';
content += NL + NL;
content += '== Section ==';
content += NL;
content += 'Content here.';
content += NL + NL;
content += '[[Category:MyCategory]]';

var body = new URLSearchParams();
body.append('action', 'edit');
body.append('title', 'PageName');
body.append('text', content);
body.append('token', token);
body.append('summary', 'Create page description');
body.append('format', 'json');
fetch('/w/api.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: body.toString()
}).then(r=>r.json()).then(d=>console.log(d.edit && d.edit.result));
```

## Community Directory Table Pattern

For the GoT Community Portal-style directory tables:

```javascript
var NL = String.fromCharCode(10);
var c = 'Intro text paragraph.';
c += NL + NL;
c += '== Community Directory ==';
c += NL + NL;
c += '{| class="wikitable sortable"';
c += NL;
c += '! Community !! Language !! Description !! Discord';
c += NL;
c += '|-';
c += NL;
c += '| Name || Language || Description text || [https://discord.gg/INVITE Join Button]';
c += NL;
c += '|-';
c += NL;
c += '| Name2 || Language2 || Description2 || [https://discord.gg/INVITE2 Join Button 2]';
c += NL;
c += '|}';
c += NL + NL;
c += '[[Category:Community]]';
```
