# JS Debugging for Web App Development

## Quick Verification

```bash
node --check file.js
```

If clean, no output. If there's an error, it reports the line number and the problematic token.

## Common Silent Failure Modes

### 1. Unbalanced Braces (Most Common)

**Chart.js configs** are the #1 trap. The nesting is:
```
new Chart(ctx, {        // config open
  options: {            // options open
    plugins: { ... },   // plugins open/close = net 0
    scales: {           // scales open
      y: { ... },       // y open/close = net 0
      x: { ... }        // x open/close = net 0
    }                   // scales close
  }                     // options close
);                      // config close + function call close
```

You need `}}}` (3 closing braces) before the `);`. Count: options(1) + scales(1) + config(1) = 3 opens that need closing.

**Debug method:** Use Python to count braces excluding strings:
```python
import re
with open('file.js') as f: js = f.read()
js_no_strings = re.sub(r'"[^"]*"', '', js)
js_no_strings = re.sub(r"'[^']*'", '', js_no_strings)
print(f'Opens: {js_no_strings.count("{")}, Closes: {js_no_strings.count("}")}')
```

### 2. `</` in Inline `<script>` Blocks

HTML parser sees `</span>`, `</div>` etc. inside JS strings and may interpret them as actual closing tags, truncating the script.

**Fix:** Move all JS to external `.js` files. If you must use inline, escape as `<\/span>`.

### 3. Function Defined But `typeof` Returns `undefined`

A parse error earlier in the file stopped execution before the function was defined. Check `browser_console()` for SyntaxError. The reported error location may be misleading — the actual error could be much earlier.

### 4. Event Listeners / Tab Switching Not Working

Test programmatically: `document.querySelector('.tab').click()`. If programmatic works but manual doesn't, the listener may not be attached yet.

For tab switching: verify with `window.getComputedStyle(el).display` not `el.style.display` (only shows JS-set inline styles).

### 5. Brace Binary Search

When you know there's a mismatch but can't find it:

```javascript
// In Node.js:
function findBraceError(js) {
  let depth = 0, inStr = false, sc = '';
  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === sc) inStr = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; sc = ch; }
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth < 0) return { char: i, line: js.substring(0,i).split('\n').length };
      }
    }
  }
  return depth > 0 ? { error: `Missing ${depth} closing brace(s)` } : { error: 'Extra closing brace(s)' };
}
```
