# HAMK AI Project – Space Shooter

## About

An individual HAMK AI course project to build a small, single-player browser game while learning and documenting AI-assisted software development. It is intended for people who want a short, keyboard-controlled game in a desktop browser.

## Technology

The game uses HTML, CSS, vanilla JavaScript and HTML Canvas. It has no game engine, backend, database or runtime AI. Playing does not require an API key or AI subscription.

## Planned prototype

- One playable level
- Left/right movement and shooting
- Enemies, enemy fire and collisions
- Score and lives
- Win/loss states and restart

## Planned final version

- Three levels, with upgrade choices after levels 1 and 2
- Easy, Hard and Ridiculous difficulty options selected before play

Exact upgrades and balancing are not decided yet. Multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls are out of scope.

## AI-assisted development

- **OpenAI Codex in VS Code:** implementation assistance, explanations, debugging and self-review. The model was displayed as “6 Luna”; Codex reported session identifier `gpt-6-luna` from this conversation's session log. Medium reasoning effort was used during initial prototype implementation.
- **Perplexity:** planning, explanations, development guidance and review of project documents. The exact underlying model is not verified.
- **LM Studio:** local models are planned tools; they were not used in this prototype session.

I approve requirements and changes, manually playtest the game, and decide which suggestions to accept. A separate-tool review of the gameplay source code is still pending.

## Current status

Milestones 1–4 and their manual checks have been reported passed. Milestone 5, win/loss states and in-page restart, is implemented; its manual checks are pending.

## Known prototype limitation

The player is drawn as a triangle but uses a rectangular hitbox. Shots in the rectangle's corners may count as hits even when they miss the visible ship; this gameplay impact has not been specifically tested.

To open the game, open `index.html` in a desktop browser. No installation is required.
