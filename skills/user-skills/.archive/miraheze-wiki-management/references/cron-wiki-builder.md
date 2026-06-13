# Cron Job Pattern: Recurring Wiki Maintenance from Discord

## Use Case
When the user wants ongoing automated wiki building from a Discord source, create a cron job that:
1. Logs into Discord and reads specified channels
2. Extracts useful information
3. Creates/updates wiki pages via the MediaWiki API
4. Reports what was created/updated

## Cron Job Template

```
Name: BOA Wiki Builder (or similar descriptive name)
Schedule: every 2h (or as needed)
Repeat: 84 times (≈7 days for 2h interval)
Deliver: origin (reports back to the conversation)

Prompt should include:
- Discord login credentials and server name
- List of channels to read
- Wiki login credentials and domain
- Specific pages to create/update
- Instructions to report what was done
```

## Key Parameters
- **schedule**: 'every 2h' for frequent updates, 'every 6h' for less frequent
- **repeat**: 84 × 2h = 7 days; adjust as needed
- **deliver**: 'origin' to report back to the current conversation
- **enabled_toolsets**: ['browser'] to reduce token overhead (Discord + wiki both need browser)

## Important Notes
- Cron jobs run in a FRESH session with no context from the current conversation
- The prompt must be SELF-CONTAINED — include all credentials, URLs, and steps
- Discord login is fragile — include fallback instructions
- Wiki edits should be batched per-page to avoid context reset
- The job should report what it accomplished so the user can track progress

## Example Prompt Structure
1. Log into Discord → navigate to server → read channels
2. Extract information organized by channel
3. Log into wiki → get CSRF token → create/update pages
4. Update sidebar if new pages added
5. Report summary of all changes made
