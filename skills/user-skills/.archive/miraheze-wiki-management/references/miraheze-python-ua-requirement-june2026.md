# Miraheze Python requests User-Agent Requirement

Miraheze blocks the default Python `requests` User-Agent. Any API call without a custom UA returns HTTP 403.

Fix: Always set a custom User-Agent:
```python
s = requests.Session()
s.headers.update({"User-Agent": "HermesAgent/1.0 (wiki editing bot)"})
```

Without this, ALL API calls (login, fetch, edit) fail with empty responses or 403.

Also applies to curl: use `curl -A "HermesAgent/1.0"`
browser_console fetch() does NOT need this.