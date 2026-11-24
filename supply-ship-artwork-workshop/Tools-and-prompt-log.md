# Supply Ship Artwork Workshop · Tools and prompt log

## User prompt

> Read NEXT_SESSION.md and follow its latest supply-ship artwork priority.
>
> Create a standalone supply-ship artwork workshop for Kestrel and Vesper. Do not integrate it into the game yet.
>
> First inspect:
> - The existing Kestrel and Vesper SVG artwork and workshop files.
> - drawLevel2BonusShip() and the supply-ship hitbox in game.js.
> - Any relevant project instructions.
>
> Then create one proposed design for each ship:
> - Right-facing side or shallow three-quarter view, suitable for level horizontal flight.
> - Mirror the design for leftward travel.
> - Keep the hull centered, with transparent artwork backgrounds.
> - Preserve recognizable details and each ship’s visual identity.
> - Design for readability at the actual in-game draw size. Derive that size from the code rather than assuming the hitbox and artwork dimensions are identical.
>
> The standalone workshop should:
> - Work when opened directly in a browser.
> - Show both ships facing left and right.
> - Include actual-game-size previews and enlarged previews.
> - Include a simple horizontal-flight preview to judge appearance in motion.
> - Clearly distinguish artwork bounds from the current game hitbox, with an optional overlay.
>
> Scope restrictions:
> - Do not modify game.js, game assets, existing workshop originals, or gameplay behavior.
> - Do not change player artwork, banking, firing alignment, hitboxes, movement, rewards, or skin-selection rules.
> - Do not run browser tests.
> - Do not commit or push.
> - Keep the new workshop self-contained and record the prompt, tools used, and design decisions in a provenance log. Record model identifiers only if known.
>
> Stop after creating the workshop. Report the files created, the game geometry you found, and how I can open the preview. Artwork requires my approval before any

The received message ends after “before any.” The handoff specifies approval before game integration. Approval is pending.

## Tools and references

OpenAI Codex inspected the handoff, project instructions, player-ship workshop and source SVGs, and the game renderer and collision code. Codex drew two new SVGs directly and wrote the local HTML, CSS and vanilla JavaScript. Shell tools, Python, Node.js, xmllint and SHA-256 checks were used for file creation and static or isolated verification. The exact model identifier and active reasoning setting were unavailable. The player-ship workshop credits Perplexity Computer for the original artwork.

## Geometry and design

- The draw function fits the upright asset into a 46.3064516 × 49.5 px area, then rotates it 90°. Both originals are 232 units wide. At that fit, Kestrel’s source height of 204 gives a horizontal draw width of `49.5 × 204 / 248`. Vesper’s source height of 248 gives `49.5` px. Both draw rectangles are `49.5 × 232 / 248` px tall.
- The game centers both rectangles on the same position as the 52.8 × 46.3064516 px shot hitbox. The dashed cyan outline shows each SVG’s full draw rectangle, including transparent padding. The solid amber outline shows the current hitbox. Their top and bottom edges coincide.
- Kestrel keeps its angular swept wings, ivory hull, coral-red panels, blue canopy and twin rectangular exhausts. Broad red panels and bright exhaust blocks help it read at 40.72 px wide.
- Vesper keeps its slender pearl hull, curved crescent foils, teardrop canopy and mint markings. Its long curves and continuous mint stripe give it a distinct silhouette at 49.5 px wide.
- Each artwork has a right-facing horizontal spine and a nearer wing visible below it. The SVG viewBoxes match the current rotated draw aspect ratios, with clear padding around the centered silhouettes. CSS mirrors each image around its center for leftward flight.
- The moving previews use the game’s 162 px/s speed and a 42 px centerline. The workshop runs both ships in parallel lanes and alternates direction once they clear the edges. It starts paused for inspection.

Static checks confirmed SVG parsing and local references. Isolated Node.js checks verified centered draw dimensions, flight speed, offscreen reversal, pause and resume. Checksums confirmed the inspected game and player workshop files were preserved. Native PNG conversion did not complete. Browser behavior and visual approval are pending manual review. Open `index.html` directly, toggle **Show bounds**, then select **Play flight** and watch one full pass in each direction.
