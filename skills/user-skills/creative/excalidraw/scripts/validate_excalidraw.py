#!/usr/bin/env python3
"""Validate .excalidraw files are parseable JSON."""
import json, sys
ok = True
for p in sys.argv[1:]:
    try:
        d = json.load(open(p))
        print("OK:", p, "-", len(d.get("elements",[])), "elements")
    except Exception as e:
        print("FAIL:", p, "-", e)
        ok = False
sys.exit(0 if ok else 1)
