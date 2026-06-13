# Multi-Wiki Cron Job Strategy

When maintaining multiple Miraheze wikis, create paired cron jobs per wiki:

1. Categorizer (every 30min-1h) — batch-add categories
2. Content Updater (every 2-6h) — fix outdated content  
3. Link Checker (every 3h) — fix broken links, add cross-references

Wiki registry (May 2026):
- got.miraheze.org: Ghosts of Tabor, 881 pages, v0.13.0, admin perms
- boa.miraheze.org: BOA Hub, 32+ pages, admin perms, DO NOT modify footer
- csez.miraheze.org: CSEZ, 71 pages, v1.6.5.0, basic user perms