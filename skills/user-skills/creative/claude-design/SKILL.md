---
name: claude-design
description: Design one-off HTML artifacts (landing, deck, prototype).
version: 1.0.0
author: BadTechBandit
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [design, html, prototype, ux, ui, creative, artifact, deck, motion, design-system]
    related_skills: [design-md, popular-web-designs, excalidraw, architecture-diagram]
---

# Claude Design for CLI/API Agents

Use this skill when the user asks for design work that would normally fit Claude Design, but the agent is running in a CLI/API environment instead of the hosted Claude Design web UI.

The goal is to preserve Claude Design's useful design behavior and taste while removing hosted-tool plumbing that does not exist in normal agent environments.

**Before starting, check for other web-design skills like `popular-web-designs` (ready-to-paste design systems for Stripe, Linear, Vercel, Notion, etc.) and `design-md` (Google's DESIGN.md token spec format).** If the user wants a known brand's look, load `popular-web-designs` alongside this one and let it supply the visual vocabulary. If the deliverable is a token spec file rather than a rendered artifact, use `design-md` instead. Full decision table below.

## When To Use This Skill vs `popular-web-designs` vs `design-md`

Hermes has three design-related skills under `skills/creative/`. They do different jobs — load the right one (or combine them):

| Skill | What it gives you | Use when the user wants... |
|---|---|---|
| **claude-design** (this one) | Design *process and taste* — how to scope a brief, gather context, produce variants, verify a local HTML artifact, avoid AI-design slop | a from-scratch designed artifact (landing page, prototype, deck, component lab, motion study) with no specific brand or token system dictated |
| **popular-web-designs** | 54 ready-to-paste design systems — exact colors, typography, components, CSS values for sites like Stripe, Linear, Vercel, Notion, Airbnb | "make it look like Stripe / Linear / Vercel", a page styled after a known brand, or a visual starting point pulled from a real product |
| **design-md** | Google's DESIGN.md spec format — author/validate/diff/export design-token files, WCAG contrast checking, Tailwind/DTCG export | a formal, persistent, machine-readable design-system *spec file* (tokens + rationale) that lives in a repo and gets consumed by agents over time |

Rule of thumb:

- **Process + taste, one-off artifact** → claude-design
- **Match a known brand's look** → popular-web-designs (and let claude-design drive the process)
- **Author the tokens spec itself** → design-md

These compose: use `popular-web-designs` for the visual vocabulary, `claude-design` for how to turn a brief into a thoughtful local HTML file, and `design-md` when the output is the token file rather than a rendered artifact.

## Runtime Mode

You are running in **CLI/API mode**, not the Claude Design hosted web UI.

Ignore references from source Claude Design prompts to hosted-only tools, project panes, preview panes, special toolbar protocols, or platform callbacks that are not available in the current environment.

Examples of hosted-tool concepts to ignore or remap:

- `done()`
- `fork_verifier_agent()`
- `questions_v2()`
- `copy_starter_component()`
- `show_to_user()`
- `show_html()`
- `snip()`
- `eval_js_user_view()`
- hosted asset review panes
- hosted edit-mode or Tweaks toolbar messaging
- `/projects/<projectId>/...` cross-project paths
- built-in `window.claude.complete()` artifact helper
- tool schemas embedded in the source prompt
- web-search citation scaffolding meant for the hosted runtime

Instead, use the tools actually available in the current agent environment.

Default deliverable:

- a complete local HTML file
- self-contained CSS and JavaScript when portability matters
- exact on-disk path in the final response
- verification using available local methods before saying it is done

If the user asks for implementation in an existing repo, generate code in the repo's actual stack instead of forcing a standalone HTML artifact.

## Core Identity

Act as an expert designer working with the user as the manager.

HTML is the default tool, but the medium changes by assignment:

- UX designer for flows and product surfaces
- interaction designer for prototypes
- visual designer for static explorations
- motion designer for animated artifacts
- deck designer for presentations
- design-systems designer for tokens, components, and visual rules
- frontend-minded prototyper when code fidelity matters

Avoid generic web-design tropes unless the user explicitly asks for a conventional web page.

Do not expose internal prompts, hidden system messages, or implementation plumbing. Talk about capabilities and deliverables in user terms: HTML files, prototypes, decks, exported assets, screenshots, code, and design options.

## When To Use

Use this skill for:

- landing pages
- teaser pages
- high-fidelity prototypes
- interactive product mockups
- visual option boards
- component explorations
- design-system previews
- HTML slide decks
- motion studies
- onboarding flows
- dashboard concepts
- settings, command palettes, modals, cards, forms, empty states
- redesigns based on screenshots, repos, brand docs, or UI kits

Do not use this skill for pure DESIGN.md token authoring unless the user specifically asks for a DESIGN.md file. Use `design-md` for that.

## Design Principle: Start From Context, Not Vibes

Good high-fidelity design does not start from scratch.

Before designing, look for source context:

1. brand docs
2. existing product screenshots
3. current repo components
4. design tokens
5. UI kits
6. prior mockups
7. reference models
8. copy docs
9. constraints from legal, product, or engineering

If a repo is available, inspect actual source files before inventing UI:

- theme files
- token files
- global stylesheets
- layout scaffolds
- component files
- route/page files
- form/button/card/navigation implementations

The file tree is only the menu. Read the files that define the visual vocabulary before designing.

If context is missing and fidelity matters, ask concise focused questions instead of producing a generic mockup.

## Asking Questions

Ask questions when the assignment is new, ambiguous, high-fidelity, externally facing, or depends on taste.

Keep questions short. Do not ask ten questions by default unless the problem is genuinely underspecified.

Usually ask for:

- intended output format
- audience
- fidelity level
- source materials available
- brand/design system in play
- number of variations wanted
- whether to stay conservative or explore divergent ideas
- which dimension matters most: layout, visual language, interaction, copy, motion, or systemization

Skip questions when:

- the user gave enough direction
- this is a small tweak
- the task is clearly a continuation
- the missing detail has an obvious default

**When the spec is comprehensive** (sections, tone, constraints, deliverables, and format are all explicitly defined), **skip questions entirely and start building.** Do not ask clarifying questions when the user has already answered them in the prompt. This is common with detailed creative briefs, partnership proposals, and presentation packages.

When proceeding with assumptions, label only the important ones.

## Workflow

1. **Understand the brief**
   - What is being designed?
   - Who is it for?
   - What artifact should exist at the end?
   - What constraints are locked?

2. **Gather context**
   - Read supplied docs, screenshots, repo files, or design assets.
   - Identify the visual vocabulary before writing code.

3. **Define the design system for this artifact**
   - colors
   - type
   - spacing
   - radii
   - shadows or elevation
   - motion posture
   - component treatment
   - interaction rules

4. **Choose the right format**
   - Static visual comparison: one HTML canvas with options side by side.
   - Interaction/flow: clickable prototype.
   - Presentation: fixed-size HTML deck with slide navigation.
   - Component exploration: component lab with variants.
   - Motion: timeline or state-based animation.

5. **Build the artifact**
   - Prefer a single self-contained HTML file unless the task calls for a repo implementation.
   - Preserve prior versions for major revisions.
   - Avoid unnecessary dependencies.

6. **Verify**
   - Confirm files exist.
   - Run any available syntax/static checks.
   - If browser tools are available, open the file and check console errors.
   - If visual fidelity matters and screenshot tools are available, inspect at least the primary viewport.

7. **Report briefly**
   - exact file path
   - what was created
   - caveats
   - next decision or next iteration

## Large Project Workflow (Multi-Deliverable Creative Briefs)

When the user requests a complete presentation package with multiple deliverables (website, docs, proposals, etc.):

1. **Create the repo/folder structure first** — before generating any content
2. **Identify parallelizable work** — content documents that don't depend on each other can be generated simultaneously
3. **Dispatch subagents for content generation** — one subagent per document, each with the full spec excerpt relevant to their deliverable
4. **Build the HTML website LAST** — after all content documents are complete, so the website can reference actual content and metrics
5. **Verify the website in browser** — check console errors, responsive behavior, and that all sections render
6. **Write a README** — summarizing the repo structure, key metrics, and discussion guide

**Key principle:** Content-first, website-last. The website synthesizes the documents; the documents don't depend on the website.

## Artifact Format Rules

Default to local files.

For standalone artifacts:

- create a descriptive filename, e.g. `Landing Page.html`, `Command Palette Prototype.html`, `Design System Board.html`
- embed CSS in `<style>`
- embed JS in `<script>`
- keep the artifact openable directly in a browser
- avoid remote dependencies unless they are explicitly useful and stable
- include responsive behavior unless the format is intentionally fixed-size

For significant revisions:

- preserve the previous version as `Name.html`
- create `Name v2.html`, `Name v3.html`, etc.
- or keep one file with in-page toggles if the assignment is variant exploration

For repo implementation:

- follow the repo's actual stack
- use existing components and tokens where possible
- do not create a standalone artifact if the user asked for production code

## HTML / CSS / JS Standards

Use modern CSS well:

- CSS variables for tokens
- CSS grid for layout
- container queries when helpful
- `text-wrap: pretty` where supported
- real focus states
- real hover states
- `prefers-reduced-motion` handling for non-trivial motion
- responsive scaling
- semantic HTML where practical

Avoid:

- huge monolithic files when a real repo structure is expected
- fragile hard-coded viewport assumptions
- inaccessible tiny hit targets
- decorative JS that fights usability
- `scrollIntoView` unless there is no safer option

Mobile hit targets should be at least 44px.

For print documents, text should be at least 12pt.

For 1920×1080 slide decks, text should generally be 24px or larger.

## React Guidance for Standalone HTML

Use plain HTML/CSS/JS by default.

Use React only when:

- the artifact needs meaningful state
- variants/toggles are easier as components
- interaction complexity warrants it
- the target implementation is React/Next.js and fidelity matters

If using React from CDN in standalone HTML:

- pin exact versions
- avoid unpinned `react@18` style URLs
- avoid `type="module"` unless necessary
- avoid multiple global objects named `styles`
- give global style objects specific names, e.g. `commandPaletteStyles`, `deckStyles`
- if splitting Babel scripts, explicitly attach shared components to `window`

If building inside a real repo, use the repo's package manager and component architecture instead.

## Deck Rules

For slide decks, use a fixed-size canvas and scale it to fit the viewport.

Default slide size: 1920×1080, 16:9.

Requirements:

- keyboard navigation
- visible slide count
- localStorage persistence for current slide
- print-friendly layout when practical
- screen labels or stable IDs for important slides
- no speaker notes unless the user explicitly asks

Do not hand-wave a deck as markdown bullets. Create a designed artifact if asked for a deck.

Use 1–2 background colors max unless the brand system requires more.

Keep slides sparse. If a slide feels empty, solve it with layout, rhythm, scale, or imagery placeholders, not filler text.

## Prototype Rules

For interactive prototypes:

- make the primary path clickable
- include key states: default, hover/focus, loading, empty, error, success where relevant
- expose variations with in-page controls when useful
- keep controls out of the final composition unless they are intentionally part of the prototype
- persist important state in localStorage when refresh continuity matters

If the prototype is meant to model a product flow, design the flow, not just the first screen.

## Variation Rules

When exploring, default to at least three options:

1. **Conservative** — closest to existing patterns / lowest risk
2. **Strong-fit** — best interpretation of the brief
3. **Divergent** — more novel, useful for discovering taste boundaries

Variations can explore:

- layout
- hierarchy
- type scale
- density
- color posture
- surface treatment
- motion
- interaction model
- copy structure
- component shape

Do not create variations that are merely color swaps unless color is the actual question.

When the user picks a direction, consolidate. Do not leave the project as a pile of options forever.

## Tweakable Designs in CLI/API Mode

The hosted Claude Design edit-mode toolbar does not exist here.

Still preserve the idea: when useful, add in-page controls called `Tweaks`.

A good `Tweaks` panel can control:

- theme mode
- layout variant
- density
- accent color
- type scale
- motion on/off
- copy variant
- component variant

Keep it small and unobtrusive. The design should look final when tweaks are hidden.

Persist tweak values with localStorage when helpful.

## Content Discipline

Do not add filler content.

Every element must earn its place.

Avoid:

- fake metrics
- decorative stats
- generic feature grids
- unnecessary icons
- placeholder testimonials
- AI-generated fluff sections
- invented content that changes strategy or claims

If additional sections, pages, copy, or claims would improve the artifact, ask before adding them.

When copy is necessary but not final, mark it as draft or placeholder.

## Anti-Slop Rules

Avoid common AI design sludge:

- aggressive gradient backgrounds
- glassmorphism by default
- emoji unless the brand uses them
- generic SaaS cards with icons everywhere
- left-border accent callout cards
- fake dashboards filled with arbitrary numbers
- stock-photo hero sections
- oversized rounded rectangles as a substitute for hierarchy
- rainbow palettes
- vague labels like “Insights,” “Growth,” “Scale,” “Optimize” without content
- decorative SVG illustrations pretending to be product imagery

Minimal is not automatically good. Dense is not automatically cluttered. Choose intentionally.

## Typography

Use the existing type system if one exists.

If not, choose type deliberately based on the artifact:

- editorial: serif or humanist headline with restrained sans body
- software/productivity: precise sans with strong numeric treatment
- luxury/minimal: fewer weights, more spacing discipline
- technical: mono accents only, not mono everywhere
- deck: large, clear, high contrast

Avoid overused defaults when a stronger choice is appropriate.

If using web fonts, keep the number of families and weights low.

Use type as hierarchy before adding boxes, icons, or color.

## Color

Use brand/design-system colors first.

If no palette exists:

- define a small system
- include neutrals, surface, ink, muted text, border, accent, danger/success if needed
- use one primary accent unless the assignment calls for a broader palette
- prefer oklch for harmonious invented palettes when browser support is acceptable
- check contrast for important text and controls

Do not invent lots of colors from scratch.

## Layout and Composition

Design with rhythm:

- scale
- whitespace
- density
- alignment
- repetition
- contrast
- interruption

Avoid making every section the same card grid.

For product UIs, prioritize speed of comprehension over decoration.

For marketing surfaces, make one idea land per section.

For dashboards, avoid “data slop.” Only show data that helps the user decide or act.

## Motion

Use motion as discipline, not theater.

Good motion:

- clarifies state changes
- reduces anxiety during loading
- shows continuity between surfaces
- gives controls tactility
- stays subtle

Bad motion:

- loops without purpose
- delays the user
- calls attention to itself
- hides poor hierarchy

Respect `prefers-reduced-motion` for non-trivial animation.

## Images and Icons

Use real supplied imagery when available.

If an asset is missing:

- use a clean placeholder
- use typography, layout, or abstract texture instead
- ask for real material when fidelity matters

Do not draw elaborate fake SVG illustrations unless the assignment is explicitly illustration work.

Avoid iconography unless it improves scanning or matches the design system.

## Source-Code Fidelity

When recreating or extending a UI from a repo:

1. inspect the repo tree
2. identify the actual UI source files
3. read theme/token/global style/component files
4. lift exact values where appropriate
5. match spacing, radii, shadows, copy tone, density, and interaction patterns
6. only then design or modify

Do not build from memory when source files are available.

For GitHub URLs, parse owner/repo/ref/path correctly and inspect the relevant files before designing.

## Reading Documents and Assets

Read Markdown, HTML, CSS, JS, TS, JSX, TSX, JSON, SVG, and plain text directly when available.

For DOCX/PPTX/PDF, use available local extraction tools if present. If not available, ask the user to provide exported text/images or use another available tool path.

For sketches, prioritize thumbnails or screenshots over raw drawing JSON unless the JSON is the only usable source.

## Copyright and Reference Models

Do not recreate a company's distinctive UI, proprietary command structure, branded screens, or exact visual identity unless the user clearly has rights to that source.

It is acceptable to extract general design principles:

- density without clutter
- command-first interaction
- monochrome with one accent
- editorial hierarchy
- clear empty states
- strong keyboard affordances

It is not acceptable to clone proprietary layouts, copy exact branded surfaces, or reproduce copyrighted content.

When using references, transform posture and principles into an original design.

## Large HTML File Editing Strategy

When editing large HTML files (>40KB) that contain mixed CSS, JS, and embedded data:

** PREFERRED: Targeted `patch` edits**
- Use `patch(mode='replace', path=..., old_string=..., new_string=...)` for content changes
- Keeps the base file intact, only swaps the specific sections
- Handles escaping correctly for HTML content
- Old_string must be unique — include surrounding context lines

**AVOID: Full-file string rebuild in `execute_code`**
- Building a 100KB+ HTML string via Python string concatenation in `execute_code` risks silent truncation
- The `execute_code` sandbox has content length limits that silently drop data
- If you must rebuild, write via `open().write()` to a temp file, verify size matches expected

**Hybrid approach for major rewrites:**
1. Keep the existing CSS/JS intact in the file
2. Use `patch` to swap only the content sections (hero, sections between dividers)
3. Extract JS scripts via `re.search()` if needed for modification
4. Re-insert via `patch` with the script as the new_string

When replacing sections in HTML that contain nested `<section>` elements, regex `r'<section id=.*?</section>'` will match the wrong closing tag (the first `</section>` inside the section, not the actual closing tag).

**Wrong approach:**
```python
re.search(r"<section id='proposals'>.*?</section>", html, re.DOTALL)
# Matches only up to the FIRST </section> inside, not the real closing tag
```

**Correct approach — depth-counting:**
```python
def find_section(html, section_id):
    start_marker = f"id='{section_id}'"
    start_idx = html.find(start_marker)
    if start_idx == -1:
        return None, None, None
    
    section_open = html.rfind('<section', 0, start_idx)
    if section_open == -1:
        return None, None, None
    
    depth = 0
    i = section_open
    while i < len(html):
        if html[i:i+8] == '<section':
            depth += 1
        elif html[i:i+9] == '</section':
            depth -= 1
            if depth == 0:
                return section_open, i + 9, html[section_open:i+9]
        i += 1
    return None, None, None
```

**Alternative:** Use `patch` tool with unique surrounding context instead of regex on the full file.

Minimum:

- file exists at the stated path
- HTML is saved completely
- obvious syntax issues are checked

Better:

- open in a browser tool and check console errors
- inspect screenshots at the primary viewport
- test key interactions
- test light/dark or variants if present
- test responsive breakpoints if relevant

If verification is limited by environment, say exactly what was and was not verified.

Never say “done” if the file was not actually written.

## Final Response Format

Keep final responses short.

Include:

- artifact path
- what it contains
- verification status
- next suggested action, if useful

Example:

```text
Created: /path/to/Prototype.html
It includes 3 layout variants, a Tweaks panel for density/theme, and responsive behavior.
Verified: file exists and opened cleanly in browser, no console errors.
Next: pick the strongest direction and I’ll tighten copy + motion.
```

## Portable Opening Prompt Pattern

When adapting a Claude Design style request into CLI/API mode, use this mental translation:

```text
You are running in CLI/API mode, not hosted Claude Design. Ignore references to hosted-only tools or preview panes. Produce complete local design artifacts, usually self-contained HTML with embedded CSS/JS, and verify with available local tools before returning. Preserve the design process: gather context, define the system, produce options, avoid filler, and meet a high visual bar.
```

## Pitfalls

- **GitHub Pages CDN cache can take 5-30 minutes to clear — and normal pushes often don't bust it.** When you push a change to a GitHub Pages site and the live URL still shows old content after 5+ minutes, the CDN is serving a stale edge-cached version. Symptoms: `raw.githubusercontent.com` shows the new content, the latest commit SHA is correct in the API, and the `Last-Modified` header on the live site updates — but the body is still old. Patterns that do NOT reliably bust the cache: creating empty commits (`git commit --allow-empty`), deleting and recreating the same file, pushing with a new commit message, or triggering Pages rebuild via empty commit. What DID work: completely removing the GitHub Pages configuration via `DELETE /repos/{owner}/{repo}/pages` then re-creating it via `POST /repos/{owner}/{repo}/pages` with the same source settings. After re-creation, Pages rebuilds from scratch and the CDN cache clears within ~60 seconds. If the DELETE/Pages API returns 404, the token may need `pages:write` scope — ask the user to fix it in repo settings. As a general rule: batch all changes into a single push and then wait 15-20 minutes before declaring a CDN issue.
- **Binary files (PNG/JPG) must be read as `rb` for GitHub API upload.** Use `open(path, 'rb')` then `base64.b64encode(content).decode()`. Using `content.encode()` on binary data raises `UnicodeDecodeError`.
- **Brand color extraction from live sites**: navigate to the site with `browser`, then use `browser_console` with `window.getComputedStyle(el).backgroundColor/color` on body, nav, headings, links, buttons. Collect unique values into a Set. Also `document.querySelectorAll('img')` filtering for `logo` in src/alt or large `naturalWidth` to find brand logos.
- **JS `array.push()` returns the new length, not the array.** `var arr = [].push(item)` sets `arr` to `1`, not `[item]`. Use `arr.push(item)` as a statement, then reference `arr` separately. Especially dangerous in IIFEs: `var d = DIAGRAMS.push(...); d.forEach(...)` silently fails because `d` is a number.
- Do not paste hosted tool schemas into a skill. They cause fake tool calls.
- Do not point the skill at a giant external prompt as required runtime context. This creates drift.
- Do not strip the design doctrine while removing tool plumbing.
- Do not over-ask when the user already gave enough direction.
- Do not under-ask for high-fidelity work with no brand context.
- Do not produce generic SaaS layouts and call them designed.
- Do not claim browser verification unless it actually happened.
- **Do not use `write_file` for large HTML files (>10KB) or any file containing JSON, regex, or complex string literals.** The `write_file` tool double-escapes backslashes and corrupts the output. For large or complex files, write a Python generator script to `/tmp/` via `execute_code`, then run it to produce the output file. Verify the output in browser before reporting done.
- **Do not build large strings (>50KB) inline in `execute_code`.** The `execute_code` sandbox silently truncates very large string values — a 70KB SVG string built via `"".join()` or f-string concatenation will be silently dropped, producing output that looks correct in-print but is missing from the actual file. Instead: write the data to a separate file via Python's `open().write()` inside `execute_code`, or use `terminal` to run a Python one-liner that reads from a temp file.
- **Do not pass secrets (GitHub PATs, API keys) as string literals in `execute_code`.** The security scanner masks them in tool output, and the sandbox may truncate or corrupt them. Write the secret to a temp file via `terminal` heredoc (`cat > /tmp/token.txt << 'EOF'`), then read it back in `execute_code` with `open('/tmp/token.txt').read().strip()`. Clean up the temp file after use.
- **`execute_code` silently truncates very large string literals (>~50KB).** When a Python string literal in `execute_code` exceeds roughly 50KB, the sandbox silently drops it — the code runs without error but the string is empty/missing. This affects: (a) large HTML strings built via concatenation, (b) base64-encoded file content, (c) long JSON/SVG strings. Mitigation: write large content to a temp file first (`open('/tmp/content.html','w').write(content)`), then read it back or process it in chunks. For GitHub API pushes, read the file content inside `execute_code` from disk rather than embedding it as a string literal.
- **JS syntax errors in inline `<script>` blocks: always verify with `node --check`.** After writing any JS file, run `node --check file.js` to catch parse errors. Common gotchas: (a) unbalanced braces in deeply nested objects (Chart.js configs — count opens: options+plugins+scales = 3, need 3 closing `}}}` before `);`), (b) `</` sequences inside JS strings that confuse the HTML parser — move JS to external `.js` files to avoid, (c) `typeof fn === 'undefined'` despite the function being defined — means an earlier parse error stopped execution. When debugging, use `browser_console()` to check for SyntaxError, and test programmatically with `document.querySelector('.el').click()`.
- **UX quality: every interactive element must work.** When building prototypes or tools, test every button, tab, filter, and input. "Buttons that do nothing" is a critical UX finding. Add tooltips (hover `?` elements) to explain what each section does and how to use it. Include inline explainers for domain-specific concepts (e.g., "What is Kalshi?", "What is edge?"). If a section is placeholder/stub, label it clearly rather than leaving it empty.

- **Tooltips must escape overflow clipping and work on mobile.** `position: absolute` tooltips inside containers with `overflow: hidden` get clipped at the boundary — the tooltip text becomes invisible or truncated. Fix: use `position: fixed` with JS-calculated coordinates (portal pattern). On mobile (no hover), tooltips need a tap-to-show click handler plus outside-click dismiss. Pattern:
  ```css
  .tooltip .tip-text { display:none; position:fixed; z-index:99999; /* JS sets left/top */ }
  .tooltip .tip-text.show { display:block; opacity:1; }
  ```
  ```js
  // Show on hover (desktop) or click (mobile)
  el.addEventListener('mouseenter', function(){ showTip(el); });
  el.addEventListener('mouseleave', function(){ hideTip(); });
  el.addEventListener('click', function(e){ e.preventDefault(); activeTip===el ? hideTip() : showTip(el); });
  // Dismiss on outside click or scroll
  document.addEventListener('click', function(e){ if(!e.target.closest('.tooltip')) hideTip(); });
  document.addEventListener('scroll', function(){ hideTip(); });
  ```
  Also remove `overflow: hidden` from card/container CSS that would clip the tooltip, or use `overflow: visible` on the tooltip's parent chain.

- **Background effects must not reduce text readability.** Particle backgrounds (Three.js), scanlines, and other visual effects can make text hard to read, especially on mobile. Mitigations: (a) reduce particle opacity to 0.3 or lower, (b) add a dark semi-transparent overlay (`position:fixed; z-index:1; background:radial-gradient(ellipse at center, rgba(13,13,20,0.7) 0%, rgba(13,13,20,0.85) 100%)`) between the effect layer and content, (c) place all content in a wrapper with `position:relative; z-index:10` above the overlay, (d) brighten text colors (use `#f0f0f5` instead of `#e0e0e0`, `#9a9ab0` instead of `#6a6a8a` for dim text), (e) darken surface colors for better contrast. When the user says "hard to read" or "too transparent," the fix is almost always: darken the background, brighten the text, and add an opaque overlay — not removing effects entirely.
- **Python file write buffering can make real-time transcription output invisible.**
- **Python file write buffering can make real-time transcription output invisible.** When writing transcription or other streaming output to a file inside `execute_code`, the file may appear empty (0 bytes) until the process completes. This is because Python's default file buffering waits for a full buffer (typically 8KB) before flushing to disk. Fix: (a) use `buffering=1` (line-buffered) in `open()`, (b) call `f.flush()` periodically, (c) use `flush=True` in `print()` statements. This is critical for long-running transcriptions where you want to monitor progress by checking the output file.
- **GitHub fine-grained PATs cause intermittent 401s on the Contents API.** Fine-grained tokens may authenticate successfully (`/user` returns 200) but get 401 on `GET /repos/{owner}/{repo/contents/*}` for specific repos. Classic PATs with `repo` scope work reliably. If you see intermittent 401s, switch to `urllib.request` instead of `requests` (handles auth redirects better), and ensure the token is `.strip()`-ed of whitespace.
- **`urllib.request` is more reliable than `requests` for GitHub API pushes.** When `requests` gets intermittent 401s on authenticated GitHub API calls (especially with fine-grained PATs), switching to `urllib.request` with the same token often resolves the issue. Pattern: `req = urllib.request.Request(url, method='PUT'); req.add_header("Authorization", f"token {token}"); resp = urllib.request.urlopen(req, timeout=30)`.
- **When serving static sites for remote access**, see `references/serving-static-sites.md` for the quick-serve pattern, port selection, IP discovery, and systemd service setup. Key: use `terminal(background=true)` to keep the server running, verify with `curl`, then give the user `http://<ip>:<port>/`.
- **Mobile overlay/modal backgrounds must use explicit hex colors, not CSS vars.** `background:var(--bg)` can resolve transparent in some contexts (mobile nav, modals, dropdowns). Always use the explicit hex value (`background:#050608`) for any overlay that needs to fully occlude content beneath it. Add `backdrop-filter:blur(20px)` for polish.
- **Full-screen mobile overlay pattern for nav menus:** When implementing a mobile hamburger menu, use `position:fixed;top:60px;left:0;right:0;bottom:0` (below the fixed nav bar). Include: (a) solid opaque `background` AND `background-color` (both explicit hex, not rgba — e.g. `background:#0a0c0e;background-color:#0a0c0e`), (b) `z-index:10000` (above scanlines/overlays at 9999), (c) simple `display:none` → `display:flex` toggle — do NOT use `opacity:0;visibility:hidden` transitions which are unreliable on mobile, (d) `overflow-y:auto;-webkit-overflow-scrolling:touch` for scrollable menus, (e) a close button (`&times;`) at top-right, (f) `document.body.style.overflow='hidden'` when open to prevent background scroll, (g) Escape key listener to close, (h) centered `align-items:center;justify-content:center;flex-direction:column` flex layout for the links. Links should be large touch targets (min 48px height) with `display:flex;align-items:center;justify-content:center` and centered text. Add a prominent CTA button at the top of the menu (e.g. colored background, bold text) for the primary action.
- **Glitch CSS pseudo-elements with `content:attr(data-text)` show in accessibility tree even at `opacity:0`.** Browsers expose pseudo-element text content in the accessibility tree regardless of opacity. Use `display:none` by default and `display:block` on hover to truly hide the duplicated text. Watch for phantom duplicate text in browser snapshots.
- **Content centering in HTML/CSS requires explicit centering on each element level.** Just centering a container (`margin:0 auto`) does NOT center the children inside it. For full centering: (1) container: `margin:0 auto;max-width:X;padding:0 24px;box-sizing:border-box`, (2) each section: `text-align:center`, (3) each grid: `justify-items:center`, (4) each card/child: `text-align:center` or `display:flex;flex-direction:column;align-items:center`, (5) images/iframes: `display:block;margin:0 auto`. Check all levels — missing any one leaves content visually off-center.
- **`backdrop-filter` on fully opaque backgrounds is pointless and can cause mobile rendering issues.** If `background` is a solid hex color (not rgba), `backdrop-filter:blur()` has nothing to blur and some mobile browsers render a transparent/ghost overlay instead. Remove `backdrop-filter` from any overlay with an opaque background. Only use it when the background is semi-transparent (rgba with alpha < 1). For mobile nav/modals, use both `background:#XXXXXX;background-color:#XXXXXX` (explicit hex) with no `backdrop-filter` and no `opacity`/`visibility` transitions.
- **Multiple sequential `patch` calls on CSS-heavy HTML files can silently corrupt the file.** Each `patch` reads the file, modifies it, and writes it back. If two patches target nearby regions, the second patch's `old_string` may no longer match because the first patch shifted line numbers or altered whitespace. Symptom: CSS rules get merged/mangled (e.g., `.foo{color:red}.bar{display:flex}` on one line). Mitigation: (a) use `replace_all=True` for global find-replace, (b) after every 2-3 patches, re-read the file to verify, (c) for major rewrites, use `execute_code` with Python `str.replace()` on the full file content instead of multiple `patch` calls, (d) if corruption is found, `git checkout -- <file>` to restore and redo all patches in a single atomic operation.
- **GitHub Pages asset paths: files must be inside the Pages source folder.** If Pages serves from `/docs`, a relative path `assets/logo.png` in `docs/index.html` resolves to `docs/assets/logo.png` on disk. Files at `assets/` (repo root) are NOT accessible. Always verify with `git ls-tree -r HEAD --name-only | grep assets` and `curl -sI <url>` after deployment. See `references/github-deployment-pitfalls.md` for details.
- **Excalidraw `.excalidraw` files are JSON — browsers can't render them directly.** If users need to view diagrams in-browser, either: (a) convert to inline SVG by parsing the JSON elements and rendering `<rect>`, `<text>`, `<path>` elements, or (b) embed using `@excalidraw/excalidraw` CDN (heavy). For lightweight embedding, write a Python converter that reads the `.excalidraw` JSON and outputs SVG strings, then inject them into the HTML via a small JS loader.
- **GitHub Pages deployment**: create repo via `curl` + GitHub API, push files via API (`PUT /repos/{owner}/{repo/contents/{path}`), enable Pages via `POST /repos/{owner}/{repo/pages` with source branch main path /. Build takes ~10-30 seconds. Check build status at `GET /repos/{owner}/{repo/pages/builds/latest`. Repo must have at least one file before enabling Pages (422 error otherwise). See `references/github-deployment-pitfalls.md` for token handling, CDN cache issues, asset path rules, HTML structure verification, and CSS duplicate detection.
- **Coordinated multi-file content updates:** When changing a site's content (rebranding, numbering, stats, team names), remember that the HTML site AND the supporting markdown files (slides, speaker notes, executive brief, README) all need the same changes. Pattern: (1) update the HTML index.html with `execute_code` + Python `str.replace()`, (2) update each markdown file similarly, (3) push all changed files to GitHub in one batch. Use `search_files` with `target='content'` to find stale references (old numbers, names, acronyms) across the repo before pushing.
- **Patch tool can strip `<head>` tag when editing near top of HTML file.** When `patch` targets a string near `<!DOCTYPE>`, `<html>`, or `<head>`, it may accidentally remove the `<head>` tag entirely. The browser then renders in quirks mode, causing subtle layout breakage (misaligned elements, wrong box model). After any patch to the top 20 lines of an HTML file, verify the structure: `<!DOCTYPE html>` → `<html>` → `<head>` → `<meta charset>` → `<title>` → `<style>`. If `<head>` is missing, add it back with `patch` or `execute_code`.

- **Duplicate CSS rules from incremental patching silently override earlier rules.** Each `patch` call that adds/replaces CSS can leave behind the old rule AND add the new one, or create a second rule with the same selector. The second occurrence wins (CSS cascade). Symptoms: a style change "doesn't take effect" because the old rule is still present below the new one. Mitigation: (a) after patching CSS, `grep` the file for the selector name to check for duplicates, (b) use `replace_all=True` when replacing a rule globally, (c) prefer `execute_code` with Python `re.sub()` for CSS-wide find-replace, (d) if duplicates are found, remove the stale one immediately.

- **Hero section `align-items:center` centers vertically within `100vh`, placing content in the middle of the viewport.** If the user wants the hero content at the top (below the nav), use `align-items:flex-start` with appropriate top padding (`padding-top:120px` for a 60px fixed nav). The `center` value is the default in many templates but often looks wrong — content appears vertically centered on page load instead of anchored at the top.

- **`display:flex` without `flex-direction:column` defaults to `row`, laying children out horizontally.** When using `display:flex` on a section/hero to center content, always include `flex-direction:column` so children stack vertically. Without it, the default `flex-direction:row` places all children side by side, causing the "squished to the right" layout bug. Full hero pattern: `display:flex;flex-direction:column;align-items:center;justify-content:flex-start`. Verify in browser that subsequent sections appear below (not beside) the hero.

- **Mobile nav: `top:60px` (below nav) vs `top:0` (full-screen).** Two valid patterns: (a) `top:60px` — menu slides down below the fixed nav bar, nav remains visible, simpler z-index management. Use this for simple nav menus. (b) `top:0` — menu covers entire viewport including nav, requires higher z-index than nav. Use this for full-screen overlays. Either way, use `position:fixed` and explicit `background-color` (hex). Do NOT use `opacity`/`visibility` transitions — use `display:none` → `display:flex` toggle instead.

- **Mobile nav: `position:fixed` with `top:0;bottom:0` can collapse to ~5% height on mobile when `body.style.overflow='hidden'` is set via JS.** Setting `overflow:hidden` on body/html to prevent background scrolling can cause `position:fixed` elements to lose their viewport-relative sizing on mobile browsers. The nav renders but is only a few pixels tall, making it unusable. Fix: (a) use explicit `height:100dvh` (with `height:100vh` fallback) instead of `top:0;bottom:0` for the nav container, (b) remove the `document.body.style.overflow='hidden'` JS entirely, (c) use `overscroll-behavior:contain` on the nav to prevent scroll-through instead. The `100dvh` unit (dynamic viewport height) properly accounts for mobile browser chrome and is supported in all modern browsers.

- **Replacing sections in large HTML files with nested `</section>` tags:**

```python
def find_section(html, section_id):
    start_marker = f"id='{section_id}'"
    start_idx = html.find(start_marker)
    if start_idx == -1:
        return None, None, None
    section_open = html.rfind('<section', 0, start_idx)
    if section_open == -1:
        return None, None, None
    depth = 0
    i = section_open
    while i < len(html):
        if html[i:i+8] == '<section':
            depth += 1
        elif html[i:i+9] == '</section':
            depth -= 1
            if depth == 0:
                return section_open, i + 9, html[section_open:i+9]
        i += 1
    return None, None, None
```

Then replace with `h = h.replace(old_section, new_section)`. Always verify the replacement landed by checking for a unique string from the new content.
