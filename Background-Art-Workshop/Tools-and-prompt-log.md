# Background Art Workshop: Tools and Prompt Log

## Open the workshop

Extract the ZIP and open `index.html` directly in a modern browser. Keep `assets/`, the scripts, and the stylesheets next to the HTML file. There is no install step, web server, network dependency, or build step.

Select a scene, then turn on **Readability overlay** to test a representative menu, formation, final boss, or credits layout. The Level 3 background is shared by the formation and final boss samples. The credits overlay represents a single position in a credit scroll. All scenes and overlays are static.

## Approach and tools

- **Perplexity Computer:** Reviewed the four provided screenshots as readability references: regular formations in green, amber and crimson, plus the purple final boss and hatchlings. Used them to identify where bright sprites, small shots and darker purple forms need separation. No screenshot was sent to image generation, copied into the workshop, or used as an output asset. No working game was opened or changed.
- **Perplexity image generator:** One distinct plate per scene, generated with `aspect_ratio: "4:3"` and `background: "opaque"`. No specific model was selected or returned in the tool result, so the exact model name and sampling settings are not recorded. The returned source PNGs were 1448 × 1086 pixels. The shared art direction and five scene briefs are recorded below.
- **ImageMagick:** Exported each full composition at 800 × 600 using Lanczos resizing with no crop, sRGB, 94% saturation, gamma 1.06, and a 9% blue-black `#101a29` color blend. Metadata was stripped and the files exported as WebP at quality 91.
- **HTML, CSS and vanilla JavaScript:** `backgrounds.js` lists the five static plates. The image files can be used independently. `readability.js` draws illustrative placeholders on a separate, transparent 800 × 600 canvas. `workshop.js` owns the selector, overlay state and display scale. No placeholder shapes or test text are baked into the backgrounds.
- **Chromium / Playwright, ZIP, and Perplexity website deployment:** Used to inspect desktop and mobile layouts, check source resolution and scene controls, test the extracted workshop offline, and verify the hosted preview.

## Outputs

| Slot | Name | Background file |
| --- | --- | --- |
| Main menu | The Veil | `assets/backgrounds/menu-the-veil.webp` |
| Level 1 | Outer Debris | `assets/backgrounds/level-1-outer-debris.webp` |
| Level 2 | Wreck Tide | `assets/backgrounds/level-2-wreck-tide.webp` |
| Level 3 and final boss | Hollow Reach | `assets/backgrounds/level-3-hollow-reach.webp` |
| Credits | Afterlight | `assets/backgrounds/credits-afterlight.webp` |

`index.html`, `base.css`, `style.css`, `backgrounds.js`, `readability.js`, `workshop.js`, and this log complete the standalone package. Nothing was integrated into the game.

## Original user request

> Design a standalone background artwork workshop for my browser-based space-shooter game, a solo HAMK AI course project.
>
> The previous proposals felt too basic and visually unappealing, especially an amber sun for Level 2. I want a fresh, more polished art direction—not minor adjustments to those concepts.
>
> Create five related but distinct backgrounds:
> 1. Main menu.
> 2. Level 1.
> 3. Level 2.
> 4. Level 3, including the final boss.
> 5. Credits.
>
> Visual direction:
> - Atmospheric, ominous deep space with a polished arcade/sci-fi character.
> - A coherent artistic style across all five scenes.
> - Progress from relatively open space toward a stranger, more threatening final level.
> - Use considered composition, depth, restrained colour palettes and subtle texture.
> - Avoid generic coloured gradients with a large circle standing in for a planet or sun.
> - Avoid excessive stars, bright central objects, busy detail or distracting motion.
> - Keep the central combat area mostly dark and low-contrast.
> - Place the strongest decorative details toward the edges without making them look like a frame.
> - Menu and credits should feel related, but credits must remain especially quiet behind scrolling text.
>
> Technical requirements:
> - Each background is 800 × 600 pixels.
> - Build a self-contained HTML/CSS/JavaScript workshop that opens directly through index.html.
> - No external dependencies, remote assets or build step.
> - Provide a selector for the five scenes.
> - Include a toggleable readability overlay with representative bright arcade ships, aliens, small projectiles, pickups, HUD text and credits text.
> - Clearly identify any representative overlay artwork as placeholders, not proposed replacements for existing game artwork.
> - Static backgrounds are fine. If using animation, keep it subtle and provide Pause.
> - Keep background rendering separate from preview controls so later game integration is straightforward.
> - Do not build or modify gameplay.
>
> Produce a complete downloadable workshop folder or ZIP, including all assets and a tools-and-prompt log. Document the approach and any generated artwork. Record exact tools and model names only when known.
>
> The output is for visual approval only. Do not claim it has been integrated into the game.

## Image-generation prompts

Each generation combined shared art direction with a scene-specific brief. The text below reconstructs those briefs for the project record; it is not a verified verbatim transcript of the generator inputs.

### Common text

> Create a single opaque 4:3 environmental background plate, designed for a top-down 2D arcade space shooter at 800 by 600. It is an unlettered painted science-fiction matte painting, not a UI mockup. Artist direction for the set: velvet deep navy-black vacuum, restrained cool colour, slate-dark textures, broad masses with spare crisp details, layered in depth, and tiny sparse subdued star points. The artwork should be polished, physically evocative and legible at small scale. Use non-symmetric compositions and one subordinate motif localized to one edge or corner, declining toward the dark open void. The central 60 percent by 70 percent of the screen must be genuinely dark and low-detail, so small bright bullets and purple ships stand out. Make the edge motif visible, not black-on-black: paint it with delicate reflected light, medium-low contrast, a sense of depth, and occasional purposeful highlights, with no solid bright mass. Avoid strong vignette rings, symmetrical frames, circles/planets/suns, terrain filling the center, glow explosions, saturated colors, lens flares, giant light sources, excessive star fields, diagonal streaks through combat space, giant lines across the scene, ships, sprites, UI, lettering, logos and borders. No sepia or orange. Use faint tonal variation and softly textured unlit space instead of a flat digitally smooth gradient.

### Main menu: The Veil

> Plate 01, The Veil, for the main menu. A finely layered, distant interstellar dust shelf drifts into composition entirely from the left and upper-left edge. A few softly broken pale slate-blue filaments sweep slightly downward and fade gently before mid-frame. Layered translucent smoke and subtle paperlike midnight-blue grain, with one folded sheet of cold light visible near the left edge. Keep the central and right portion profoundly quiet for menu text. No foreground rocks, no big planet. The shelf should look like a thin torn remnant or worn velvet membrane in far deep space, never a glowing wave across the middle.

### Level 1: Outer Debris

> Plate 02, Outer Debris, the relatively open first combat level. Give a sense of distance rather than danger: one side of a distant belt of jagged basalt shards is concentrated off the lower-right edge, with an open composition above and to the left. The few main shards have beautifully rendered roughened charcoal faces and fine low-saturation ultramarine reflected rims. Farther back, small granular dust dissolves within the bottom-right quadrant. The belt must not cut across the frame or look like UI. Use a black-blue vacuum, more open than other combat levels.

### Level 2: Wreck Tide

> Plate 03, The Wreck Tide. No sun, no orange, no round orb. A portion of a broken, immense industrial orbital truss drifts in from the upper-right, rendered as overlapping silhouettes of fracture-cut metal plates, fine cold jade reflections, a ribbed backbone and a little particulate haze all localized to the right. Only a cropped disintegrating piece of what was once an orbital structure, no recognizable spacecraft or city skyline. Graceful oblique composition, fractured geometric forms emerging from lower-contrast layers, not bright electronics. Let it fall off before the center and leave open dark combat space across the rest of the screen.

### Level 3 and final boss: Hollow Reach

> Plate 04, Hollow Reach. The final boss is purple with golden eyes, so keep the top-center and center dark navy rather than purple. Along the left edge and lower-left corner only, suggest a massive alien geological fold, layered ink-black mauve stone and arc-shaped striations like an eroded shell or collapsed rift, fading into a faint desaturated violet residue. Use varied scales from wide folded mineral sheets to a small amount of dust. Unsettling and deep, not a creature or tentacle, no eyes, no glowing center, no pink lightning or brightly lit edge. The left-side intrusion should suggest the universe changes here while the central and upper gameplay area remain clearly open.

### Credits: Afterlight

> Plate 05, Afterlight, a minimal reprise of the main menu's soft folded dust shelf, now lower-left and much farther away. Just a small, barely illuminated sheet of silver-blue dust grazes the bottom-left corner; an even fainter breath of diffuse blue texture beyond it gives depth. The upper 80% and entire central vertical column from top to bottom must be almost-black navy and exceptionally quiet for scrolling small white credits. Sparse dim stars, delicate grain. The dust sheet should be detectable, subtle and quieter than the main menu. No rocks, bright spot, or horizon traversing the screen.
