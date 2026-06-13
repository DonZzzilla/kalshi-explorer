# WikiSEO Extension — Usage & Audit Notes (May 2026)

## Extension Status

WikiSEO is installed and active on all 4 managed wikis:
- CSEZ (csez.miraheze.org)
- GOT (got.miraheze.org)
- BOA Hub (boa.miraheze.org)
- Silent North (silentnorth.miraheze.org)

## Parser Function Syntax

Use the `{{#seo:}}` parser function at the top of wiki pages.

Key parameters:
- `title_mode`: "replace" for main page, "prepend" or "append" for content pages
- `type`: "website" for main page, "article" for content pages
- `description`: Keep under 160 characters (Google truncates at ~155)

## Critical: Building {{ in Browser Console JS

The browser console interprets `{{` as a JS expression. NEVER write `{{#seo:` directly.

Correct approach — build via string concatenation:
  var LB = "{" + "{";
  var RB = "}" + "}";
  var seo = LB + "#seo:\n" +
    "|title=My Title\n" +
    "|description=My description\n" +
    "|keywords=kw1, kw2\n" +
    "|type=article\n|locale=en-US\n" + RB + "\n";

Then prepend to page text: text = seo + "\n" + text;

## SEO Best Practices

1. Description under 160 characters for search snippets
2. Title includes game/wiki name, descriptive
3. 8-12 relevant keywords (game name, topic, search variations)
4. Image parameter for social media previews (Open Graph)
5. Hierarchical categories (every category has a parent)
6. Fix broken red links (wastes Google crawl budget, 100-200 links/page)
7. Sitemap at /sitemap.xml — submit to Google Search Console

## Audit Results (May 31, 2026)

CSEZ Wiki: Main page description was full welcome text (too long). Fixed. Added SEO to Weapons, Equipment, Ammo, Healing.
GOT Wiki: Main page improved. Added SEO to Weapons, Quests, Locations, Loot, Factions, Equipment.
BOA Hub: Most pages already had SEO. Added to Loadout Guide.
Silent North: Added SEO to main page + 7 content pages (Locations, Weapons, Survival, Loot, Getting Started, Infected, Clothing).

Total: ~35 pages across 4 wikis.

## Known Gotchas

- If page already has SEO template, adding a second breaks rendering. Check text.indexOf("seo") >= 0 first.
- Relative URLs fail after navigating to auth domains. Use absolute URLs in fetch calls.
- {{#seo:}} must be at the very top of wikitext (before any content).
- Page names with spaces need encodeURIComponent() in API calls.

## Remaining Work

- Category hierarchy (CSEZ only has 3 categories, needs tree structure)
- Submit sitemaps to Google Search Console
- Add SEO to remaining content pages
- Fix broken internal links (list=querypage&qppage=WantedPages)
- Consider |image= parameter with wiki logos on all templates
