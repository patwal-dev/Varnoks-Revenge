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

In the Level 1 speed-up playtest, Patrik reported that enemies moved a little faster as their numbers fell and that this felt appropriate for a practice level. Patrik also reported completing the follow-up browser check for edge reversal, victory and restart. These are user-reported manual checks, not automated or Codex-run tests.

Patrik manually tried the destructible barriers in the current build and reported that they worked well. This was a user-reported browser playtest, not a Codex-run or automated test. The current plan places barriers in Level 1 only.

## Prototype demonstration — user-reported, 15 November 2026

The user reported screen-recording actual prototype gameplay. ElevenLabs generated the narration with the Roger voice and Eleven v4 model; its duration was 1 minute 11 seconds. The narration file, `ElevenLabs Prototype Narration.mp3`, was saved in the game project folder. iMovie was used to combine the gameplay footage and narration, and the exported demonstration was saved in the game project folder. The YouTube video is 1 minute 14 seconds long: https://youtu.be/-NcNaK1Du_Q.

The user confirmed playback with narration in a private window. This is a user-performed access check, not agent verification. No Moodle submission had yet been confirmed at the time of this entry.

## Prototype submission and repository push — user-reported, 15 November 2026

This later same-day report supersedes the preceding status note: the user confirmed that the prototype forum post was live in Moodle. Moodle's editor displayed 248 words. The submitted version was shortened from the earlier repository draft to meet the 300-word maximum; the exact submitted text is preserved in `PROTOTYPE_SUBMISSION.md`. This confirmation is user-reported and is not agent verification of Moodle.

The submitted post linked to the YouTube demonstration at https://youtu.be/-NcNaK1Du_Q, which the user reported is 1 minute 14 seconds long, and to the repository at https://github.com/patwal-dev/hamk-ai-space-shooter. The user reported successfully pushing commit `e16891c80e38957b7288df9cdf33404712eea258` to `origin/main` from the VS Code terminal. The push is recorded as user-reported, not independently verified here.

## Local-model code review — 15 November 2026

The first local-model review used `google/gemma-4-e4b` in LM Studio with MLX 4-bit. Settings were: context 8192; temperature 1.0; Top K 64; Top P 0.95 enabled; repeat penalty 1.1 enabled; response-length limit unchecked; context overflow set to Truncate Middle. The review used a beginner-focused, evidence-based code-review system prompt.

The task was a read-only review of the supplied restart-related `game.js` excerpt and HTML. The model did not execute the game or run automated tests. Gemma found no confirmed defects in the explicitly reset variables, summarized those resets correctly, and correctly identified omitted update functions as a review limitation. It did not explicitly assess animation-loop duplication as requested, and raised a speculative listener re-initialization concern unsupported by the complete restart function shown.

Human assessment of the excerpt: listener registration is outside `restartGame()`; `restartGame()` neither registers listeners nor starts another loop; the shown loop starts once and schedules its next frame. No code change is justified by this review. This is a useful but incomplete review requiring human evaluation, not a successful automated test. It does not prove the full game defect-free. The user's separately reported manual tests remain separate evidence.

## Decisions and limitations recorded in the project

- The prototype uses HTML, CSS, vanilla JavaScript and Canvas, with no engine, backend, database, runtime AI, external assets or dependencies.
- The player’s visible ship shape and its rectangular collision hitbox do not match exactly; hits near the corners of that rectangle may count. This specific edge case has not been separately tested.
- The Perplexity review noted that winning takes priority over enemy-shot damage in the frame the last enemy is destroyed.
- At the time of the earlier project plan, three levels, upgrade choices and difficulty selection remained planned final-version work, while multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls were out of scope.

## Evidence gaps

- The initial prototype features were saved together, so Git cannot establish per-milestone implementation dates or intermediate commit IDs.
- The original unnamed checks referred to by Milestone 3's former “newest checks pending” wording could not be identified. The user's later, specific enemy-shot observations are recorded, but they do not reconstruct or prove completion of that unknown checklist. The broader visual/gameplay regression report also does not specify individual checks. Milestone 5's restart checks were reported passed by the user on 15 November 2026.
- The exact Perplexity model is not verified.

## Current direction update — 15 November 2026

The submitted post's current final-version direction includes a menu and keyboard-control review, three levels with a unique boss each, sound effects, particle effects, transitions, testing and balancing, and final documentation and demonstration. This supersedes the earlier scope note above where they conflict: bosses are now part of the submitted plan. Upgrade choices and difficulty settings will be reconsidered after the teacher's target features have been implemented.

## Limited vertical movement playtest — user-reported, 19 November 2026

Patrik manually playtested limited vertical movement and reported that it worked great. He expects it to help with dodging future dive-bombers. The 60-pixel movement range remains in place for now. This report does not include individual test cases, and dive-bombers were not tested.

## Wave 2 entrance playtest — user-reported, 19 November 2026

Patrik manually confirmed that Wave 2 spawns and reported that its 0.8-second descending entrance felt better than an instant spawn. This report confirms the spawn and entrance feel only; firing, score and lives carry-over, and restart were not individually reported as verified.

## Level 1 autofire pace playtest — user-reported, 19 November 2026

After the player autofire interval changed to 0.80 seconds, Patrik manually tried Level 1 and liked the new pace. He reported that holding autofire alone no longer made the game too easy. No new clear time was reported. This feedback does not establish that individual boss or restart checks passed.

## Level 1 acceptance and next priorities — user-reported checkpoint, 19 November 2026

Level 1 is accepted as-is for now. After Wave 2, Xal’Gorath the Devourer slides into place and speaks in a bubble before combat. Boss hits award 10 points; defeating him awards a separate 100-point bonus once. The paused clear screen shows “But reinforcements are closing in.” The Level 2 button carries the total score and remaining lives forward. Patrik reported that the Level 1 clear screen and transition to Level 2 passed manual playtesting. No separate boss combat or restart check is claimed from this report.

The Level 2 transition exists, but later bosses and the surprise encounter are planned, not implemented. Next priorities are to build playable Level 2, starting with the first dive-bomber and building toward Lord Kaezar Vhul; build playable Level 3, ending with Zhur-Kai, Matriarch of the Swarm; then stage the surprise Varnok Dral, the Hollow Emperor encounter after Zhur-Kai. It is not a fourth level, and true victory follows Varnok's defeat. Prioritize gameplay, progression, scoring and win/loss behavior; use placeholder visuals and defer cosmetic polish unless it makes playtesting hard to read.

## Level 2 and Kaezar checkpoint — 20 November 2026

The following describes the current implementation in `game.js`; it is a code-status record, not a claim that every behavior passed broad regression testing:

- Living Level 2 formation aliens are randomly selected to dive. Only one can be diving or returning at a time. A surviving diver that misses returns from above into a reserved, unoccupied formation slot; its released slot remains eligible as a fallback.
- Successful dive-bomber contact removes one life, clears all shield charges, and consumes the attacker without collision points. The existing invulnerability rules apply. A formation-boundary drift issue was corrected; Patrik later reported that normal Level 2 play looked good.
- The rare crossing bonus ship awards 50 points when destroyed and drops exactly one random pickup: shield or rapid-fire weapon, selected at 50/50 odds.
- Shield pickups refill to two charges. The HUD renders two, one or no concentric rings rather than a numeric counter.
- The rapid-fire pickup doubles the normal firing rate for 10 seconds of active gameplay. Another pickup refreshes that duration. Collection displays “Machine gun baby!” for two seconds of active gameplay.
- Lord Kaezar Vhul has 20 HP; each projectile hit awards 10 points and defeat awards a separate 200-point bonus once. His former beam has been replaced by a warning lane and a fixed-path physical ram, followed by a smooth retreat. He is shootable during preparation, charge and retreat. A successful ram costs one life, clears all shields and does not consume Kaezar. The boss name is not drawn; the health bar remains.
- Bonus ships and pickups stay active during the boss encounter. Defeating Kaezar currently uses the temporary Level 2 win endpoint. Level 3 progression has not been implemented.

**User-reported normal-play checks:** Patrik reports the dive/return cycle worked; shield collection showed two rings; rapid fire looked good in initial play; formation movement looked good after its boundary fix; and Kaezar's final ram was “spot on.” These reports do not verify every listed mechanic or edge case.

**Agent-run controlled Chrome checks:** Earlier controlled tests exercised boss charge/retreat, fixed targeting and edge bounds, ram contact with/without shields and during invulnerability, shot damage during attack phases, boss win/loss cleanup, and bonus ship/pickup interactions. These controlled checks are distinct from normal play and do not establish broad regression, balance, or completion of every requested check. Some manual and edge-case checks remain pending.

The current local work is not committed or pushed. No actual hours are recorded.
