# HAMK AI Project – Space Shooter

## About

An individual HAMK AI course project to build a small, single-player browser game while learning and documenting AI-assisted software development. It is intended for people who want a short, keyboard-controlled game in a desktop browser.

## Technology

The game uses HTML, CSS, vanilla JavaScript and HTML Canvas. It has no game engine, backend, database or runtime AI. Playing does not require an API key or AI subscription.

## Implemented one-level prototype

- One playable level
- Left/right movement and shooting
- Enemies, enemy fire and collisions
- Score and lives
- Win/loss states and restart

## Current final-version direction — planned, not started

- Add a menu and review keyboard controls.
- Extend gameplay to three levels, each with a unique boss.
- Add sound effects, particle effects and transitions.
- Test and balance the game, then complete final documentation and demonstration.

Upgrade choices and difficulty options from the earlier plan will be reconsidered after the teacher's target features have been implemented. These plans do not indicate completed work. Multiplayer, a shop, a skill tree, saved progress and mobile controls were outside the earlier scope.

## AI-assisted development

- **OpenAI Codex in VS Code:** implementation assistance, explanations, debugging and self-review. The model was displayed as “6 Luna”; Codex reported session identifier `gpt-6-luna` from this conversation's session log. Medium reasoning effort was used during initial prototype implementation.
- **Perplexity:** planning, explanations, development guidance and review of project documents. The exact underlying model is not verified.
- **LM Studio:** local Gemma 4 E4B was used for a focused review of restart-related code; it was not used to implement the prototype.

**Demonstration production:** ElevenLabs generated the narration, and iMovie was used to combine it with actual gameplay footage. These are video-production tools, separate from game technologies and AI development/review tools.

I approve requirements and changes, manually playtest the game, and decide which suggestions to accept.

**Perplexity source review:** Perplexity reviewed `game.js` and `index.html` from GitHub without running the game or automated tests. It found no blocking gameplay issue and noted the existing rectangular player hitbox, that winning takes priority over enemy-shot damage in the frame the last enemy is destroyed, and that the Space shooting instruction was missing. The instruction is now present above the game. This review is not a runtime test or a claim that the game is bug-free.

## Current status

The one-level prototype and its five gameplay milestones are implemented. User-reported manual checks cover the recorded movement, shooting, enemy, score/lives, win/loss and restart behaviors. The original unnamed checks once described as Milestone 3's “newest checks pending” could not be identified; later enemy-shot checks are recorded but do not establish completion of that unknown checklist. Manual reports are not agent-run or automated tests.

The visual polish pass is implemented. The user reported that visual and gameplay regression checks passed; these were user-reported manual checks, not agent-run tests.

The user reported that the shortened 248-word prototype forum post is live in Moodle as of 15 November 2026. This is not agent verification. The post links to the [1 minute 14 second YouTube demonstration](https://youtu.be/-NcNaK1Du_Q) and [GitHub repository](https://github.com/patwal-dev/hamk-ai-space-shooter). The user also reported successfully pushing commit `e16891c80e38957b7288df9cdf33404712eea258` to `origin/main`.

## Known prototype limitation

The player is drawn as a triangle but uses a rectangular hitbox. Shots in the rectangle's corners may count as hits even when they miss the visible ship; this gameplay impact has not been specifically tested.

To open the game, open `index.html` in a desktop browser. No installation is required.
