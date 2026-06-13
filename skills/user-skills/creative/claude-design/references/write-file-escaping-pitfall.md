# write_file Escaping Pitfall

## Problem

The `write_file` tool double-escapes backslash sequences in string content:
- `\n` (newline escape in JSON/regex) becomes `\\n` (literal backslash + n)
- `\"` (escaped quote in JSON) becomes `\\\"` (double-escaped)
- Leading/trailing whitespace on lines may be stripped

This corrupts any file containing:
- JSON with string values (`.excalidraw`, `.json`, `.theme`)
- Regular expressions
- Complex string literals with escape sequences
- Large HTML files with embedded CSS/JS

## Reproduction

```python
# This JSON written via write_file:
{"text": "Hello\nWorld"}

# Becomes on disk:
{"text": "Hello\\nWorld"}

# Which JSON parsers read as literal backslash-n, not a newline
```

## Solution

**For any file containing JSON, regex, or complex strings, use Python's `open().write()` via `execute_code`:**

```python
import json

data = {"type": "excalidraw", "elements": [...]}
with open("/path/to/output.excalidraw", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Verify
with open("/path/to/output.excalidraw") as f:
    json.load(f)  # Will raise if corrupted
```

**For large HTML files (>10KB), write a Python generator script:**

```python
# Write generator to /tmp/
with open("/tmp/gen_site.py", "w") as f:
    f.write('''
lines = []
def L(s=""): lines.append(s)
# ... build HTML ...
with open("/path/to/output.html", "w") as out:
    out.write("\\n".join(lines))
''')

# Then run it
import subprocess
subprocess.run(["python3", "/tmp/gen_site.py"])
```

## Verification

Always verify after writing:
1. For JSON: `json.load()` the file
2. For HTML: open in browser, check console for errors
3. For excalidraw: open at excalidraw.com

## Affected File Types

- `.excalidraw` — ALWAYS use Python `json.dump()`
- `.json` — ALWAYS use Python `json.dump()`
- `.html` — Use Python generator if >10KB or contains complex JS/CSS
- `.css` — Generally safe with `write_file` unless contains regex
- `.md` — Generally safe with `write_file`
- `.py` — Generally safe with `write_file` unless contains regex strings
