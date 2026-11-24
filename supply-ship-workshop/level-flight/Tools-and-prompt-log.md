# Supply Ship Artwork Workshop

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
> Stop after creating the workshop. Report the files created, the game geometry you found, and how I can open the preview. Artwork requires my approval before any integration.

## Tools and references

- OpenAI Codex drew both proposals directly in SVG and authored the local HTML, CSS and vanilla JavaScript. The exact session model identifier and reasoning setting were unavailable.
- Shell tools and Ripgrep supported source inspection. Node checked JavaScript syntax. `xmllint` checked SVG syntax. Python checked local references and dimensions. Git supplied working-tree and whitespace checks.
- Artwork references were the original top-down Kestrel and Vesper in `ship-workshop/assets/` and the existing level-flight drafts found at the start of the session under `supply-ship-workshop/assets/`. Later inspection found the same draft files by checksum under `supply-ship-artwork-workshop/assets/`.

## Design and preview decisions

- **Kestrel** keeps swept ivory armor, red nose and wing flashes, a blue canopy, and two rectangular blue-lit thrusters. The darker far wing and the brighter near wing show a shallow three-quarter view.
- **Vesper** keeps a pearl spine, swept crescent foils, a teardrop canopy and mint accents. Its continuous curves and broad mint stripe distinguish it from Kestrel at small sizes.
- Each transparent SVG has a right-facing hull centered on the horizontal travel axis. The workshop mirrors the image about its center for leftward travel. The larger previews use 4× the same draw footprint.
- The optional dashed cyan outline marks the full SVG rectangle, including transparent margins. The solid amber outline marks the centered shot hitbox. The horizontal preview runs at 162 canvas px/s, with centers 42 px below the lane top. Alternating directions between passes and the pause button support repeatable inspection. Reduced-motion preference starts the preview paused.

## Game geometry

The ready-artwork branch in `drawLevel2BonusShip()` fits the original 232 × 204 Kestrel and 232 × 248 Vesper images before rotating them 90 degrees. In screen coordinates, the width is the smaller of 49.5 and `(49.5 × 232 / 248) × originalHeight / 232`. The height is that width multiplied by `232 / originalHeight`.

| Screen-space rectangle | Width × height in canvas px |
| --- | --- |
| Kestrel artwork | 40.717742 × 46.306452 |
| Vesper artwork | 49.500000 × 46.306452 |
| Shot hitbox for either ship | 52.800000 × 46.306452 |

The 1× preview maps one canvas pixel to one CSS pixel. The game page can scale its canvas to fit the window.

## Review status

JavaScript syntax, SVG XML, local references and geometry were checked without a browser. An attempted SVG-to-PNG conversion with macOS `sips` produced no images. Visual browser verification and artwork approval are pending. Integration requires the user's approval.
