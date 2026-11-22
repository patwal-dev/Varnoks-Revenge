# Varnok Artwork Workshop: Tools and Prompt Log

## Open the workshop

Extract the complete ZIP and open `index.html` in a modern browser. Keep `assets/`, both stylesheets, and both scripts beside `index.html`. The workshop runs offline without installing anything. It starts paused at the closed state; select **Play cycle**, scrub the timeline, or choose one of the three inspection states.

## Tools and outputs

- **Perplexity Computer:** Retrieved the copyable Codex specification from the earlier HAMK conversation. Only the project conversation and previous standalone artwork were used. The working game and its files were not opened, run, or modified.
- **SVG:** Drew the components directly as SVG vector paths and gradients. Spore Choir informed the use of soft internal membranes and fleshy nodes, while Bud, Hook, and Crown informed the amethyst family, shell highlights, hooks, and warm eye accents. Kestrel and Vesper were used to check arcade-scale readability and visual separation between player and alien art. No previous artwork was copied into the new assets. No image or video model was used, so there are no image or video generation settings to record.
- **HTML, CSS and vanilla JavaScript:** Built an offline comparison page showing enlarged and 200 × 110 CSS-pixel versions of each concept. `geometry.js` defines a single reference cycle; `workshop.js` composites the SVG layers and runs the controls. No game movement, spawning, attacks, collision tests or integration are implemented.
- **Chromium / Playwright, ZIP and Perplexity website deployment:** Checked the represented geometry and transparent passages, control behavior, mobile layouts, extracted offline ZIP, and hosted preview.

| Concept | Directory | Visual identity |
| --- | --- | --- |
| Brood Mantle | `assets/brood-mantle/` | Ray-like membrane, side curls and tapered keel. |
| Rooted Crown | `assets/rooted-crown/` | Horned split crest, faceted carapace and forked tendrils. |
| Veil Nautilus | `assets/veil-nautilus/` | Asymmetric shell curl, soft right lobe and dissimilar trailing tendrils. |

## Layering and animation reference

All twelve SVGs are transparent and share `width="200"`, `height="110"` and `viewBox="0 0 200 110"`. Coordinates start at the top left and increase downward. The body anchor remains `(100, 55)` for every layer. The SVG files contain no guides, collision outlines, or text.

| Back to front | SVG or runtime layer | Compositing rule |
| --- | --- | --- |
| 1 | `tentacles.svg` | Decorative only. Authored to stay inside the artboard and outside both fully open passages. |
| 2 | `body.svg` | Draw at `(0, 0)` relative to the artboard. |
| 3 | `seals.svg` | Draw on the body. In the preview, separate shaded rim folds appear outside the active aperture, inside the same mask group as the body and seals. The folds are optional presentation in `workshop.js`, not separate exported SVGs. |
| 4 | `eyes.svg` | Draw at `(0, 0)`, clipped independently to the intersection of each eye hitbox and its active passage. At zero progress, both intersections are empty. |
| Workshop only | Guide overlays | Optional and hidden by default; never part of the exported layer files. |

**Mask body and sealing tissue together** with a luminance mask: white across the full artboard, black inside the two active passage rectangles. Do not use the unmasked body or seal layers as an open-state sprite. The mask leaves the active corridors genuinely transparent except for the exposed eye artwork within the specified hitboxes.

The cycle lasts 6,000 ms: closed `[0, 2000)`, opening `[2000, 2500)`, fully open `[2500, 5500)`, and closing `[5500, 6000)`. Opening and closing use smoothstep, `t²(3 − 2t)`, over a normalized phase. Both eyes use the same progress `p`. For each eye, the passage starts at `x = eyeCenterX − (45p)/2`, `y = 54 − 26p`, has width `45p`, and ends at `y = 110`. The eye clipping rectangle is the passage intersected with that eye’s hitbox, so there is no conventional moving eyelid. Guides use the exact same passage rectangles as the mask.

| Example | Time | Passage width | Top | Eye exposure height |
| --- | ---: | ---: | ---: | ---: |
| Closed | 0.000 s | 0 px | 54 px | 0 px |
| Half open | 2.250 s | 22.5 px | 41 px | 13 px |
| Fully open | 2.500 s | 45 px | 28 px | 26 px |
| Half closed | 5.750 s | 22.5 px | 41 px | 13 px |

## Original workshop request

> Create a standalone Varnok artwork workshop for my Space Shooter game, using the exact technical specification appended below.
>
> Do not access or modify the working game. Create concepts and a preview only.
>
> Design direction:
> - Varnok is the final boss: a living alien with an organic body, two targetable eyes and tentacles.
> - Use Spore Choir as inspiration for organic anatomy, not as a design to enlarge or duplicate.
> - Create three distinct alternatives with different silhouettes and anatomy—not simply different colours.
> - Keep them visually consistent with the existing ship and alien workshops.
> - Make Varnok recognisably related to his Bud, Hook and Crown hatchlings without copying their silhouettes.
> - Keep important features readable at actual 200 × 110 px gameplay size.
>
> Critical visual requirements:
> - Place both eyes exactly at the specified coordinates.
> - Design the anatomy around the two existing shot passages from the lower body edge to the eyes.
> - When open, these routes must visibly read as unobstructed recesses or channels. Do not place opaque flesh, tentacles or decoration across them.
> - When closed, show organic tissue sealing the routes so they do not appear shootable.
> - Follow the specified bottom-up eye reveal and symmetric passage widening. Do not substitute a conventional eyelid animation that contradicts those rules.
> - The eyes must remain distinct targets at the upper ends of the channels.
> - Avoid an exposed mechanical-door or rectangular-panel appearance. Use organic contours, folds and shading around the required geometry.
> - Tentacles remain within the 200 × 110 px footprint and outside active shot passages. They are decorative, not new weapons or targets.
> - If a hatchling release feature is included, place it at the specified top-center origin.
>
> Preview:
> - Show each concept enlarged and at actual 200 × 110 CSS pixels.
> - Provide a code-animated preview of the exact six-second eye cycle.
> - Include play/pause and a cycle scrubber so closed, partly open and fully open states can be inspected.
> - Add optional workshop-only guides for eye hitboxes, current shot passages, body bounds and hatchling origin.
> - Keep guides hidden by default and out of exported artwork.
> - Use the same animation progress to drive both the visual openings and passage guides.
>
> Deliverables:
> - Three clearly named concepts.
> - Separate transparent SVG components suitable for later game integration, with a shared coordinate system and clearly documented layering.
> - A standalone HTML/CSS/JavaScript comparison and animation workshop.
> - A complete downloadable ZIP.
> - Tools-and-prompt-log.md documenting the request, tools, outputs and animation approach. Record exact models/settings only if known.
>
> Do not select a winner, change gameplay or integrate anything.
> Stop for my review.
>
> EXACT TECHNICAL SPECIFICATION:
> [Paste the complete Codex specification here.]

## Exact Codex specification recovered from the earlier HAMK conversation

The pasted request ended with a placeholder. The following is the copyable specification the user had already supplied in the preceding HAMK conversation, with the geometry table restored for readability.

> **Varnok, Boss 4 — Standalone artwork workshop brief**
>
> Design Varnok as a distinct living alien inspired by Spore Choir, with an organic body, tentacles, and two clearly targetable eyes. Give him his own silhouette and anatomy. Create standalone SVG concepts and a preview only. Leave the game code and gameplay untouched.
>
> **Canvas and placement.** Use a 200 × 110 px artboard. All coordinates below are relative to its top-left, with Y increasing downward. The game positions Varnok by his center, (100, 55) in local coordinates, and draws from (boss.x − 100, boss.y − 55). He faces the player below.
>
> | Feature | Left | Right |
> | --- | --- | --- |
> | Eye center | (48, 41) | (152, 41) |
> | 30 × 26 px eye hitbox | X 33–63, Y 28–54 | X 137–167, Y 28–54 |
> | Fully open shot passage | X 25.5–70.5, Y 28–110 | X 129.5–174.5, Y 28–110 |
>
> **Eye animation.** Both eyes share a six-second cycle: 2 s closed → 0.5 s opening → 3 s open → 0.5 s closing. Opening and closing ease smoothly. Each eye reveals from the bottom upward, with its bottom fixed at Y 54, while the passage widens symmetrically around the eye center. At opening amount p from 0 to 1, each passage is 45 × p px wide, starts at Y = 54 − 26 × p, and extends to the body’s bottom edge at Y 110. The visible eye is limited to the intersection of that opening and its 30 × 26 px hitbox. Closing reverses the motion.
>
> **Shot readability.** The entire body rectangle blocks shots while closed. During opening and closing, the body still blocks everywhere outside the two passages. A 5 px-wide player shot must clear the passage walls and overlap an exposed eye to damage Varnok. Make each route visibly clear from the lower edge to the eye, and keep the eyes distinct from the wider channels. Avoid false openings in solid areas or opaque tissue across a live passage. Keep tentacles decorative and within the body footprint, with no implied attack, extra target, or collision area.
>
> **Hatchling origin.** Each 30 × 30 px hatchling spawns centered at (100, 0) on Varnok’s current top edge and travels straight upward at 180 px/s. The first batch begins after 2 s of active combat, with hatchlings launching 0.3 s apart. If the design suggests a release point, put it at the top center. The existing renderer draws hatchlings behind the boss, so they read as emerging over that edge.
>
> **Review deliverable.** Show the concepts at actual gameplay size and enlarged. Preview the full eye cycle, with optional workshop-only guides for the eye hitboxes, shot passages, and hatchling origin. Keep the guides out of the artwork.
