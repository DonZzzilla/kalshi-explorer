# execute_code Output Truncation — June 2026

## Problem

`execute_code` silently truncates large stdout output. When a Python script prints more than ~2000-3000 characters, the output is cut off with no warning. This makes it appear the script produced no output at all.

## Symptoms

- Script runs successfully but output is empty or truncated
- `print()` statements with large strings are cut off mid-sentence
- JSON output is truncated, causing parse errors
- No error message — just missing output

## Workarounds

### 1. Write to File, Then Read Back

```python
# In execute_code, write results to a file
with open("/tmp/result.json", "w") as f:
    json.dump(large_data, f)
print("Wrote to /tmp/result.json")
```

Then read the file:
```bash
python3 -c "import json; print(json.load(open('/tmp/result.json')))"
```

Or use `read_file` tool on `/tmp/result.json`.

### 2. Use Subprocess grep/count

Instead of printing large output, count or grep:
```python
# Instead of printing all matches
result = subprocess.run(["grep", "-c", "pattern", "/tmp/file"], capture_output=True, text=True)
print(result.stdout.strip())
```

### 3. Print Summary Stats Only

```python
# Instead of printing all 500 results
print(f"Found {len(results)} matches, first: {results[0] if results else 'none'}")
```

### 4. Chunk Large Outputs

```python
# Print in chunks
for i in range(0, len(data), 500):
    print(data[i:i+500])
```

## Related: write_file Quoting Issues

`write_file` also has issues with certain characters:
- `'''` (triple quotes) — interpreted as markdown
- `|` in unquoted strings — interpreted as table delimiters
- `&mdash;` and HTML entities — parsed as special characters

For large scripts, prefer:
1. Write script to `/tmp/script.py` via `write_file`
2. Run via `python3 /tmp/script.py` in terminal
3. If `write_file` mangles the script, use terminal heredoc:
```bash
python3 -c "open('/tmp/script.py','w').write(open('/dev/stdin').read())" << 'EOF'
# script here
EOF
```
