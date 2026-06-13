# Silent North Wiki — Light Mode Background Image Fix (June 2026)

## Problem
The Silent North wiki's light mode was not displaying the intended background image. Instead of showing the Swiss Alps scenery, it was showing a blank/default background.

## Root Cause
In `MediaWiki:Common.css`, the `--wiki-bg-image` variable was pointing to an incorrect file:
```css
--wiki-bg-image: url("https://static.wikitide.net/silentnorthwiki/d/de/SN_Meta_Store_LightMode_Invert.jpg");
```
Note the `_Invert` suffix in the filename. This file either doesn't exist or returns a transparent/blank image.

## Solution
Remove the `_Invert` suffix to point to the correct background image file:
```css
--wiki-bg-image: url("https://static.wikitide.net/silentnorthwiki/d/de/SN_Meta_Store_LightMode.jpg");
```

## Verification
After making this change, hard refresh the page (Ctrl+Shift+R) to bypass CDN cache. The light mode should now display the intended Swiss Alps background image from silentnorth.com's design.

## Related Files
- `MediaWiki:Common.css` - Contains the `--wiki-bg-image` variable definition
- `MediaWiki:Cosmos.css` - Dark mode theme (unaffected by this change)

## Context
This fix was applied as part of aligning the Silent North wiki's visual design with silentnorth.com's aesthetic, using dark mode as the default appearance while preserving a nice light mode alternative.