# Alien Art Workshop: Tools and Prompt Log

This workshop is an offline visual study for Space Shooter. Unzip the complete workshop, then open `index.html` in a browser. Choose **Play motion** to start the demonstration. No installation, build command, login, or network connection is needed. Keep `assets/`, both stylesheets and `motion.js` next to `index.html` in the unzipped folder.

## Tools and production notes

- **Perplexity Computer and SVG:** I inspected only the Kestrel and Vesper workshop artwork as visual reference. I drew six new transparent sprites directly with SVG paths on 30 × 30 viewBoxes. No external artwork or image-generation model was used. I used short, dense, creature-like silhouettes instead of the friendly ships’ long hulls and swept wings. The three hatchlings share an amethyst shell, paired eyes and a gold lower-center mouth, with rounded, hooked, and crested silhouettes.
- **HTML and CSS:** One comparison page displays each sprite at 120 × 120 and 30 × 30 CSS pixels. It also displays a formation row and down/left/right poses for every sprite, and a mixed hatchling arrangement with a 42 px horizontal pitch and 35 px vertical row step. The starfield and captions are outside the SVGs.
- **JavaScript:** `requestAnimationFrame` drives the same SVGs. Visible flight rotation follows the tangent of cubic Bézier paths, using the shortest signed angle between headings. All pivots are at (15, 15). The regular formation drifts without turning, the offscreen wrap resets orientation while hidden, and the hatchlings turn upward before taking off and curve back into the downward pose. This demonstrates rotation, not random spawning, collisions, or attacks.
- **Chromium / Playwright and ZIP:** The comparison page is checked on desktop and mobile; geometry checks use CSS-pixel measurements. ZIP packages the page, source files, six SVGs, and this log. Perplexity website deployment provides an optional preview.

No working game files or game build were opened or modified. No boss artwork was created. No winner was selected.

## Original user prompt

> Create an alien-art workshop for my Space Shooter game, separate from the working game. Use the previous Kestrel and Vesper designs as visual context, but make enemies clearly distinguishable from friendly ships.
>
> Do not access or modify the working game. Do not create the four bosses yet.
>
> CREATE SIX ALIEN DESIGNS
> - One distinct regular alien for Level 1.
> - One distinct regular alien for Level 2.
> - One distinct regular alien for Level 3.
> - Three visually related but distinct hatchling variants for the final boss, Varnok, to spawn randomly.
>
> ARTWORK REQUIREMENTS
> - Each design uses a centered 30 × 30 px canvas with a transparent background.
> - Face downward at rest, toward the player.
> - Give each a readable front at bottom center, where shots originate.
> - Differentiate silhouettes, not just colours.
> - Keep details readable at actual 30 × 30 px size.
> - Keep the silhouette compact and close to its square collision footprint when rotated.
> - Keep the artwork centered so it does not wobble during rotation.
> - Do not bake text, backgrounds, firing-point markers or collision outlines into the SVG assets.
>
> TURNING AND DIVING PREVIEW
> Create a lightweight code-animated preview using the SVG artwork—not a generated video.
>
> Show aliens smoothly turning into diagonal divebombs, following the dive direction, turning along a return path, and settling back into a downward-facing formation pose.
>
> - Use the shortest turn between angles.
> - Sideways formation movement keeps the downward-facing pose.
> - An offscreen wrap from bottom to top must not cause a visible spin.
> - Show Varnok's hatchlings facing upward during launch, turning along their return, then settling into downward-facing formation.
> - This preview demonstrates visual rotation only. It does not define new game movement, attacks or collision rules.
>
> COMPARISON PAGE
> Show every design:
> - Enlarged.
> - At actual 30 × 30 CSS pixels.
> - Against a dark space-like background.
> - In a formation row.
> - Straight-on and rotated into left and right diagonal diving poses.
>
> Also show Varnok's three hatchling variants together at 42 px horizontal × 35 px vertical center-to-center formation spacing.
>
> Include pause/play controls for the motion preview and keep the static comparisons visible.
>
> DELIVERABLES
> - A standalone HTML/CSS/JavaScript workshop.
> - Six separate transparent SVG assets.
> - Downloadable attachments and a ZIP containing the complete workshop.
> - A tools and prompt log recording this request and how the artwork was created.
>
> Do not integrate anything into the game, choose designs on my behalf or change gameplay. Stop for my review.
