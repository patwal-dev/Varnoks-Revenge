# Xal’Gorath Boss Art Workshop: Tools and Prompt Log

## Tools and workflow

- **Perplexity Computer and SVG:** Inspected Kestrel and Vesper from the player-ship workshop, and Clack, Anvil and Rift from the alien-art workshop. The earlier assets served as visual references only; no artwork was copied into the new sprites. Drew three alternatives directly with SVG paths, mirrored components and fill gradients. No image or video generation tool was used; there are no image-generation model settings to record.
- **HTML and CSS:** Built the standalone comparison page. It displays the same asset at both scales. Two unchecked-by-default controls independently show the 112 × 58 px artwork boundary and the nominal bottom-center firing point at `(56, 58)` in preview coordinates. The guides and charge halo are not in the artwork. This is an artwork area, not a collision specification.
- **Chromium and Playwright:** Checked actual CSS dimensions, center guide alignment, visibility, transparency, and desktop and narrow mobile layouts. Perplexity’s website deployment tool served the standalone preview. No game access or integration was needed.

## Outputs

| Output | Contents |
| --- | --- |
| `assets/crown-maw.svg` | Hooked crimson crescent, plated face and lower central jaw. |
| `assets/iron-sepulchre.svg` | Stepped bronze fortress, recessed visor and lower central port. |
| `assets/spore-choir.svg` | Rounded three-lobed organism, ochre nodes and lower central mouth. |
| `index.html`, `base.css`, `style.css` | Single comparison page with actual-size and enlarged previews and independent guide controls. |
| `Tools-and-prompt-log.md` | Original prompt, tools, workflow and outputs. |

Each SVG uses `width="112"`, `height="58"` and `viewBox="0 0 112 58"`. All face down. No concept was selected or integrated, and no gameplay, collision, attack or timing changes were proposed.

## Original user prompt

> Create a graphics concept workshop for Xal’Gorath, the first boss in my single-player, top-down Space Shooter game.
>
> Scope:
> Create three distinct artwork alternatives for review. Do not modify the game or integrate any artwork yet.
>
> Technical requirements:
> - Each design must fit centered within a 112 × 58 px artwork area.
> - The boss faces downward, toward the player.
> - Place the firing point at the bottom center.
> - Use a transparent background.
> - Keep the existing cyan charge halo separate: do not bake it into the artwork.
> - Make the silhouette and important details readable at actual gameplay size.
> - Do not propose changes to gameplay, collision geometry, attacks or timing.
>
> Design direction:
> Xal’Gorath is an alien boss. Explore three clearly different silhouettes and visual identities, rather than three minor variations of one design. Keep the artwork suitable for a cohesive top-down arcade space shooter.
>
> Deliverables:
> - Three clearly named alternatives as SVG files.
> - A comparison page showing each concept at actual size and enlarged.
> - Show the 112 × 58 px boundary and bottom-center firing point as optional preview guides, not as part of the exported artwork.
> - If existing ship-workshop and alien-workshop assets are available, use them as visual references for consistency.
> - Keep the workshop separate from the game.
> - Include a Tools-and-prompt-log.md recording the prompt, tools used and outputs. Record exact model settings only if known.
>
> Stop after creating the concepts so I can review them before choosing a design.
