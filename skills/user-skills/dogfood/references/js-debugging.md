# JS Debugging Reference for Web App QA

## Common Silent Failure Modes

### 1. Unbalanced Braces in Chart.js Config

Chart.js config objects are deeply nested and easy to miscount. Count opens: options(1) + plugins(1) + scales(1) = 3. You need 3 closing braces `}}}` before the `);`.

**Verification:** Always run `node --check file.js` after writing JS.

### 2. `</` Sequences Inside `<script>` Blocks

The HTML parser can treat `</` inside inline `<script>` blocks as closing tags, silently truncating the script. **Fix:** Move JS to external `.js` files, or escape as `<\/`.

### 3. Function Defined But `typeof` Returns `undefined`

A JS parse error earlier in the file stopped execution before the function was defined. Check `browser_console()` for SyntaxError. The reported error location may be misleading.

### 4. Event Listeners Not Firing

Test programmatically: `document.querySelector('.tab').click()`. If programmatic click works but manual doesn't, the event listener may not be attached yet.

### 5. `write_file` Tool Corruption

The `write_file` tool can strip `{{`/`}}` in template literals and mangle long strings. For JS/HTML files, write via Python `open().write()` through the terminal tool, then verify with `node --check`.

### 6. Brace Counting Verification

```bash
node --check file.js
```

Count opens and closes excluding strings to find imbalances.
