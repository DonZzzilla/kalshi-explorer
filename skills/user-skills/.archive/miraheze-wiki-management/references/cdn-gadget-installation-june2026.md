# CDN Gadget Installation — June 2026

## Source Repository

[MirahezeDevScripts](https://github.com/ccxtwf/MirahezeDevScripts) — A collection of user-side JS gadgets for MediaWiki wikis, originally ported from Fandom Dev Wiki.

CDN base URL: `https://cdn.jsdelivr.net/gh/ccxtwf/MirahezeDevScripts@master/gadgets/`

## Gadget Dependency Map

### Library Gadgets (install FIRST — no rights needed)
| Gadget | CSS? | Dependencies |
|--------|------|-------------|
| FandoomUtilsI18nLoader | Yes | None |
| FandoomUiUtilsModal | Yes | FandoomUtilsI18nLoader |
| FandoomUiUtilsDorui | Yes | FandoomUtilsI18nLoader |
| FandoomUiUtilsQdmodal | Yes | FandoomUtilsI18nLoader |
| FandoomUiUtilsUijs | No | None |
| PowertoolsPlacement | Yes | None |

### Functional Gadgets — General Use
| Gadget | CSS? | Dependencies |
|--------|------|-------------|
| FilterTable | Yes | None |
| CollapseJump | No | None |
| Countdown | Yes | FandoomUtilsI18nLoader |
| DynamicCategories | Yes | None (uses mediawiki.api) |
| Tab | Yes | None |
| AjaxUndo | No | FandoomUtilsI18nLoader |
| PreloadTemplates | Yes | FandoomUtilsI18nLoader |
| ViewSource | Yes | FandoomUtilsI18nLoader |
| MassCopyUpload | No | None |

### Functional Gadgets — Restricted (require specific rights)
| Gadget | CSS? | Dependencies | Rights |
|--------|------|-------------|--------|
| AjaxBatchDelete | Yes | Modal, Powertools, I18n | delete |
| AjaxBatchUndelete | Yes | Modal, Powertools, I18n | undelete |
| AjaxBatchRedirect | Yes | Modal, Powertools, I18n | move |
| MassCategorization | Yes | Modal, Dorui, Powertools, I18n | edit |
| MassNullEdit | Yes | Qdmodal, Powertools, I18n | edit |
| MassProtect | Yes | Modal, Powertools, I18n | protect |
| MassRename | Yes | Modal, Powertools, I18n | move |
| PageRenameAuto-update | Yes | Powertools, I18n | move |

## Gadget Counts After Installation

| Wiki | Existing | New | Total |
|------|----------|-----|-------|
| got | 3 | 23 | 26 |
| csez | 2 | 23 | 25 |
| silentnorth | 1 | 23 | 24 |
| boa | 0 | 23 | 23 |

## Definition Line Format

```
* Name[ResourceLoader|dependencies=ext.gadget.X|rights=delete|default]|CDN_URL|Gadget-Name.css
```

## Notes

- CDN approach: if the GitHub repo goes down, JS stops working. CSS is safe (stored locally).
- Fandom-originated gadgets may need CSS tweaks for Miraheze skins (Cosmos, Citizen).
- Gadgets appear in user preferences — users can enable/disable individually.
