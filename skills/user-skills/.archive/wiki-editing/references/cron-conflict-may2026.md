# Cron Conflict Incident — May 25, 2026

## What Happened

During a manual cleanup of BOA program content on got.miraheze.org (redirecting BOA pages, removing BOA Hub category, de-BOA-framing game pages), an active cron job ("BOA Wiki Builder") kept recreating the removed content. Every edit I made was reverted within minutes by the cron job running as the same account (ZeroSkills).

## Root Cause

The cron job `5bba516aabce` ("BOA Wiki Builder") was scoped to build BOA content but didn't have an explicit domain restriction. It was editing got.miraheze.org directly instead of only boa.miraheze.org. Its prompt said "build out the BOA Hub Wiki" but didn't specify the URL, so it treated got.miraheze.org as a valid target.

## How Detected

After the first cleanup pass, RecentChanges showed new "N" (new page) edits by ZeroSkills recreating pages that had just been redirected. The edits had no edit summaries (unlike the manual cleanup edits). Checking `cronjob(action='list')` revealed the active job.

## Fix Applied

1. Paused the conflicting cron job immediately
2. Re-did the cleanup
3. Updated the cron job prompt to explicitly say "ONLY edit boa.miraheze.org, do NOT edit got.miraheze.org"
4. Also paused and updated "GoT Wiki Maintenance Scout" to explicitly state that got.miraheze.org should NEVER contain BOA program content
5. Re-enabled both jobs with corrected scopes

## Lesson: Always Check Cron Jobs Before Manual Edits

**Before doing any manual wiki edits**, especially cleanup or content removal:
1. Run `cronjob(action='list')` to see all active jobs
2. Check if any job edits the same wiki
3. If yes, pause the job first, do the cleanup, then re-enable with corrected scope
4. Failure mode: silent edit war between your manual work and the cron's automated work

## Lesson: Explicit Domain Scoping in Cron Prompts

When creating cron jobs that edit wikis:
- Always include the exact URL (e.g., `https://boa.miraheze.org`)
- Add an explicit negative constraint (e.g., "Do NOT edit got.miraheze.org")
- Without this, the agent may drift across wikis sharing the same account

## Affected Pages

- Main_Page → redirected to Ghosts_of_Tabor_Wiki
- About → redirected to GoT_Wiki_Hub
- Team_Map → redirected to GoT_Wiki_Hub
- BOA_Discord_Rules_&_Policies → redirected to GoT_Wiki_Hub
- BOA_Ranks_&_Structure → redirected to GoT_Wiki_Hub (reverted by cron, re-redirected after fix)
- Ghost_of_Tabor_Game_Info → de-BOA-framed (reverted by cron, re-cleaned after fix)
- Money_Making_Guide → de-BOA-framed, category removed (reverted by cron, re-cleaned after fix)
- Category:BOA_Hub → redirected to Category:Staging
