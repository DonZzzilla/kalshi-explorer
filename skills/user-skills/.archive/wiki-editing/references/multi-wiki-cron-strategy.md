# Multi-Wiki Cron Job Strategy

## Active Wikis (as of May 2026)

| Wiki | URL | Articles | Cron Jobs |
|---|---|---|---|
| BOA Hub | boa.miraheze.org | 32+ | 3 (Builder 2h, Tactics 2h, Review 4h) |
| GoT | got.miraheze.org | 881 | 4 (Categorizer 30m, Scout 2h, Updater 2h, Links 3h) |
| CSEZ | csez.miraheze.org | 71+ | 3 (Categorizer 30m, Updater 1h, Links 3h) |
| Silent North | silentnorth.miraheze.org | 33+ | 2 (Builder 2h, Expander 3h) |

## Total: 12 cron jobs across 4 wikis

## Frequency Guidelines

### High Frequency (30min-1h)
Use for: Batch operations on large wikis (categorization, link fixing)
- GoT Categorizer: 30m (600+ pages need categories)
- CSEZ Categorizer: 30m (63 pages, will finish fast)
- CSEZ Content Updater: 1h (small wiki, fast runs)

### Medium Frequency (2h)
Use for: Content creation and maintenance on medium wikis
- BOA Wiki Builder: 2h
- BOA Tactics Wiki Builder: 2h
- GoT Content Updater: 2h
- SN Wiki Builder: 2h

### Low Frequency (3h-6h)
Use for: Heavy analysis tasks (link checking, content review)
- GoT Link Checker: 3h
- CSEZ Link Checker: 3h
- SN Content Expander: 3h
- BOA Content Review: 4h
- GoT Maintenance Scout: 2h (but runs for 14 days)

## Overlap Management
- Stagger jobs so no two jobs for the same wiki run at the same time
- Heavy jobs (link checking, content expansion) should run at different times than light jobs (categorization)
- If a job errors, it will retry on the next cycle — no manual intervention needed

## Job Lifecycle
- All jobs set to 48-84 runs (2-7 days of coverage)
- Jobs naturally wind down as work completes
- Create new jobs as needed when wikis grow or new tasks emerge
