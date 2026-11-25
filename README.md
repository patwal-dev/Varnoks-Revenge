#Varnok's Revenge

## About

An individual HAMK AI course project to build a small, single-player browser game while learning and documenting AI-assisted software development. It is intended for people who want a short, keyboard-controlled game in a desktop browser.

## How to play

Open `index.html` in a desktop browser. No installation is required. Use **WASD** or the **arrow keys** to move and hold **Space** to fire. Vertical movement is limited to the bottom of the play area. The main menu's **How to Play** screen also lists these controls.

## Technology

The game uses HTML, CSS, vanilla JavaScript and HTML Canvas. It has no game engine, backend, database or runtime AI. Playing does not require an API key or AI subscription.

## Implemented one-level prototype

- One playable level
- Left/right movement and shooting
- Enemies, enemy fire and collisions
- Score and lives
- Win/loss states and restart

## Current final-game build

The final build has a menu, ship and difficulty selection, three playable levels, four boss encounters, and a full-height cast credits roll that returns to the menu. Implementation closed on 25 November 2026. The layout and behavior have focused browser checks, and the proposed final playthrough has no reported result.

The user accepted the final credits. The handover distinguishes reported browser acceptance, automated checks and verification limits. [Checklist](TODO.md) · [Handover](NEXT_SESSION.md)

## Tools and assets

- **OpenAI Codex in VS Code** supported design, implementation, debugging and verification. The project records Luna 6 and GPT-6.2 Sol. [Development log](DEVELOPMENT_LOG.md)
- **Perplexity** supported planning, development guidance, document review and a source review of the prototype. The underlying model is unverified.
- **LM Studio** ran independent focused reviews of the audio controls using `qwen/qwen3.5-9b` and `google/gemma-4-e4b`. Those reviews covered audio controls only. Validation checked 12 deduplicated claims and confirmed no defects within that scope. The development log also records an earlier focused Gemma review of restart code. [Audio-controls validation](review-materials/01-audio-controls-validation.md) · [Development log](DEVELOPMENT_LOG.md)
- **Perplexity Computer** generated workshop artwork for ships, aliens and bosses, and used Perplexity's image generator for the background plates. The provenance records also identify later Codex adaptations. [Workshop provenance](NEXT_SESSION.md#workshop-provenance)
- **Suno** was used by **@backstageriot** to create the music for the menu, levels and credits. [Backstage Riot on Suno](https://suno.com/@backstageriot)
- **ElevenLabs** supplied the spoken announcements for Shield, Machinegun, Double shot and Spread shot. [Voice provenance](DEVELOPMENT_LOG.md#task-11--prerecorded-pickup-announcements--24-november-2026)
- **Firjar Bold** styles the page heading and main-menu title. It is licensed under SIL OFL 1.1. The font and copyright notice are included locally. [Font license](Fonts/Firjar/OFL.txt)

Redistribution terms for the Suno music and ElevenLabs pickup voices were not independently reproduced in the repository. This project is a school submission.

**Demonstration production:** ElevenLabs generated the narration, and iMovie was used to combine it with actual gameplay footage. These are video-production tools, separate from game technologies and AI development/review tools.

I approve requirements and changes, manually playtest the game, and decide which suggestions to accept.

**Perplexity prototype source review.** Perplexity reviewed `game.js` and `index.html` from GitHub without running the game or automated tests. It found no blocking gameplay issue and noted the existing rectangular player hitbox, the priority of victory over enemy-shot damage in the frame the last enemy is destroyed, and the missing Space instruction. The final game lists the shooting instruction under **How to Play**.

## Prototype submission status

The one-level prototype and its five gameplay milestones are implemented. User-reported manual checks cover the recorded movement, shooting, enemy, score/lives, win/loss and restart behaviors. The original unnamed checks once described as Milestone 3's “newest checks pending” could not be identified; later enemy-shot checks are recorded but do not establish completion of that unknown checklist. Manual reports are not agent-run or automated tests.

The visual polish pass is implemented. The user reported that visual and gameplay regression checks passed; these were user-reported manual checks, not agent-run tests.

The user reported that the shortened 248-word prototype forum post is live in Moodle as of 15 November 2026. This is not agent verification. The post links to the [1 minute 14 second YouTube demonstration](https://youtu.be/-NcNaK1Du_Q) and the GitHub repository, now named [Varnoks-Revenge](https://github.com/patwal-dev/Varnoks-Revenge). The user also reported successfully pushing commit `e16891c80e38957b7288df9cdf33404712eea258` to `origin/main`.

## Known prototype limitation

The player is drawn as a triangle but uses a rectangular hitbox. Shots in the rectangle's corners may count as hits even when they miss the visible ship; this gameplay impact has not been specifically tested.
