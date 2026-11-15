# Development Log

This retrospective separates facts visible in Git history, summaries recorded in the project documents, and user-reported manual checks.

## Git history — direct evidence

- `268ea8e97884aa7c6e2328acf798aa132286dd0a` — **Complete playable one-level prototype**. This root commit contains the game files and project documents together. Git history does not provide a separate implementation commit for each gameplay milestone.
- `5bedeba6bbf11f98dae088e10e4eed121be08310` — **Document AI-assisted development and review status**. Documentation changes.
- `528b866cdc51babfa7600b481586752505b1c0f0` — **Document source review and clarify shooting controls**. Updated the visible Space shooting instruction and recorded source-review information.
- `53230935877090c848ce7d6af0cf3da3165480e9` — **Polish prototype visuals and record manual checks**. Updated `game.js`, `style.css` and project documentation for the visual polish.

## Gameplay development — retrospective from README and PLANS

The documented milestone order is:

1. Canvas and player movement using the arrow keys or A/D.
2. Player shooting with Space.
3. Moving enemy formation, player-shot collisions, enemy fire and player-hit feedback.
4. Score, lives, one-second hit protection and a game-over state at zero lives.
5. Win/loss states and restart.

The initial Git commit saved the playable one-level prototype as a whole, so the history cannot show when each milestone was implemented.

The later visual polish added code-drawn stars, enemy silhouettes and a more detailed ship, plus coordinated page, HUD, ending-message and button styling. Gameplay rules were intended to remain unchanged.

## Tools and roles — from project documentation

- **OpenAI Codex in VS Code:** implementation assistance, explanations, debugging and self-review. The existing project documentation records the displayed model as ‘6 Luna,’ the session identifier as `gpt-6-luna`, and Medium reasoning effort during initial implementation. These identifiers have not been independently verified.
- **Perplexity:** planning, explanations, development guidance, document review and a source review of `game.js` and `index.html` from GitHub. Its exact underlying model is not verified. The source review did not run the game or automated tests.
- **LM Studio:** used for the first local-model review recorded below; it was not used to implement the prototype.
- **User:** approves requirements and changes, manually playtests the game, and decides which suggestions to accept.

## User-reported manual checks

The user reports that the visual and gameplay regression checks after the polish pass all looked and behaved correctly. These were manual checks reported by the user, not agent-run tests.

On 15 November 2026, the user manually checked the prototype's win/loss and restart flows. Winning and restarting passed. Losing and restarting, repeated three times, passed. After restart, score returned to 0 and lives to 3, the player and full enemy formation returned to their starting states, and no old shots remained. The user observed no unexpected increase in movement or firing speed. These are user-performed manual checks, not agent-run or automated tests.

Also on 15 November 2026, the user manually checked enemy-shot behavior. On a hit, the shot disappeared, lives dropped from 3 to 2, the player briefly flashed and remained visible, and movement and shooting still worked afterward. When the player was not hit, several enemy shots travelled off the bottom and disappeared while lives stayed at 3. These are user-performed manual observations, not agent-run or automated tests.

## Prototype demonstration — user-reported, 15 November 2026

The user reported screen-recording actual prototype gameplay. ElevenLabs generated the narration with the Roger voice and Eleven v4 model; its duration was 1 minute 11 seconds. The narration file, `ElevenLabs Prototype Narration.mp3`, was saved in the game project folder. iMovie was used to combine the gameplay footage and narration, and the exported demonstration was saved in the game project folder. The YouTube video is 1 minute 14 seconds long: https://youtu.be/-NcNaK1Du_Q.

The user confirmed playback with narration in a private window. This is a user-performed access check, not agent verification. No Moodle submission has yet been confirmed.

## Local-model code review — 15 November 2026

The first local-model review used `google/gemma-4-e4b` in LM Studio with MLX 4-bit. Settings were: context 8192; temperature 1.0; Top K 64; Top P 0.95 enabled; repeat penalty 1.1 enabled; response-length limit unchecked; context overflow set to Truncate Middle. The review used a beginner-focused, evidence-based code-review system prompt.

The task was a read-only review of the supplied restart-related `game.js` excerpt and HTML. The model did not execute the game or run automated tests. Gemma found no confirmed defects in the explicitly reset variables, summarized those resets correctly, and correctly identified omitted update functions as a review limitation. It did not explicitly assess animation-loop duplication as requested, and raised a speculative listener re-initialization concern unsupported by the complete restart function shown.

Human assessment of the excerpt: listener registration is outside `restartGame()`; `restartGame()` neither registers listeners nor starts another loop; the shown loop starts once and schedules its next frame. No code change is justified by this review. This is a useful but incomplete review requiring human evaluation, not a successful automated test. It does not prove the full game defect-free. The user's separately reported manual tests remain separate evidence.

## Decisions and limitations recorded in the project

- The prototype uses HTML, CSS, vanilla JavaScript and Canvas, with no engine, backend, database, runtime AI, external assets or dependencies.
- The player’s visible ship shape and its rectangular collision hitbox do not match exactly; hits near the corners of that rectangle may count. This specific edge case has not been separately tested.
- The Perplexity review noted that winning takes priority over enemy-shot damage in the frame the last enemy is destroyed.
- Three levels, upgrade choices and difficulty selection remain planned final-version work. Multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls are out of scope.

## Evidence gaps

- The initial prototype features were saved together, so Git cannot establish per-milestone implementation dates or intermediate commit IDs.
- The original unnamed checks referred to by Milestone 3's former “newest checks pending” wording could not be identified. The user's later, specific enemy-shot observations are recorded, but they do not reconstruct or prove completion of that unknown checklist. The broader visual/gameplay regression report also does not specify individual checks. Milestone 5's restart checks were reported passed by the user on 15 November 2026.
- The exact Perplexity model is not verified.
