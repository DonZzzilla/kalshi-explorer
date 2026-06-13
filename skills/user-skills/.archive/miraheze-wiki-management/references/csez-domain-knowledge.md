# CSEZ Domain Knowledge

Game-specific knowledge for editing the Contractors Showdown ExfilZone Wiki (csez.miraheze.org).

## Factions

- **PMC** = Player's main character. Full inventory at risk. AI enemies aggro on sight.
- **Scav** = Free kit run. AI Scavs do NOT aggro the player. Lower stakes.
- **Critical:** `[[Scavs|PMC]]` is WRONG if the player is playing as a Scav. Display text must be "Scav".
- The PMC wiki article covers both PMC and Scav, so linking *to* the PMC page is fine — but the pipe text must match what the player actually is.

## Currency

- **EZD** — the only correct currency name on the wiki. Not Koruna, not Korunas, not C$.

## Maps

Suburbs, Metro, Dam, Resort, Smuggling Tunnel

## Quest Structure

Quest pages use `{{Task}}` template with these key fields:
- `name`, `giver` (trader), `location` (map), `objective`, `reward` (always in EZD), `prerequisites`

Standard sections after the template: Walkthrough (numbered), Tips (bulleted), See Also, Categories.
