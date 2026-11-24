# Background workshop tools and design log

## Request and references

Task 12 in `TODO.md` calls for distinct, subtle backgrounds for the menu, each level and credits, using elements such as blinking stars, suns, moons and nebulas. Earlier Level 2 and 3 design notes in `PLANS.md` mention scrolling backgrounds. This workshop proposes one background per scene for approval, with slow star twinkle as the only motion.

The game canvas is **800 × 600** in `index.html`. The current `drawStarfield()` in `game.js` fills it with `#07111f` and 90 seeded static stars. The game uses that backdrop under the menu, combat and the perspective credits crawl. The workshop canvas uses the same pixel dimensions and presents them at 1× CSS size.

## Proposals

| Scene | Design | Readability decision |
| --- | --- | --- |
| Main menu | Cropped blue gas giant and faint upper-left haze | The sky and planet frame the centered neon panel. |
| Level 1 | Cratered slate moon at the upper right | Most of the formation and the barrier row sit in dark space. A sample enemy bolt crosses the moon to show the contrast. |
| Level 2 | Muted amber sun low on the left | The upper flight area stays dark. A sample bolt and crate sit near the warm glow. |
| Level 3 | Faint diagonal violet nebula | Soft cloud detail and sparse stars keep the crimson formation and shots distinct. |
| Credits | Teal haze near both lower corners | A dim central corridor keeps sample credits legible at several apparent distances. |

Only a few stars change brightness, on independent 5–9 second cycles. The pause button freezes the twinkle, and the workshop starts paused when the browser requests reduced motion.

## Artwork, tools and checks

- OpenAI Codex authored the HTML, CSS and vanilla JavaScript Canvas drawings. The exact session model identifier and reasoning setting were unavailable. The five backgrounds are procedural, using gradients, seeded stars and noise. No generated raster assets, external libraries, fonts or downloads are needed.
- The workshop includes local copies of the existing Kestrel player sprite, Vesper supply sprite and Clack, Anvil and Rift sprites. Combat samples reuse the game's sprite sizes, projectile paths and colors, and supply crate paths. The menu and HUD are representative. Credits use one fixed sample of the current placeholder wording and projection. The workshop has no link to gameplay state or to the music and credits timers.
- Ripgrep and shell tools supported source inspection and file copying. Node checked JavaScript syntax. Python checked local references and canvas dimensions, and `xmllint` checked copied SVG syntax. The game and original assets were left in place. Browser layout and visual approval are pending.
