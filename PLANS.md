# Project plan

Implementation status reflects code changes. Manual checks are recorded from my reports; unreported checks remain pending.

## Prototype submission status — complete (user report, 15 November 2026)

The user reports that the shortened 248-word prototype forum post is live in Moodle and that commit `e16891c80e38957b7288df9cdf33404712eea258` was pushed to `origin/main`. Moodle status and the push are user-reported, not independently verified here. The submitted post links to the [YouTube demonstration](https://youtu.be/-NcNaK1Du_Q) (1 minute 14 seconds) and the [GitHub repository](https://github.com/patwal-dev/hamk-ai-space-shooter). The exact submitted text is in `PROTOTYPE_SUBMISSION.md`.

## One-level prototype

1. **Canvas and player movement — Implemented; manual checks passed (user report)**  
   Show the game area and move the player left and right with the keyboard.  
   **Manual checks passed (user report, including recheck):** Player appears; arrow keys and A/D move it; movement stops on release; player stays inside both edges.

2. **Player shooting — Implemented; manual checks passed (user report)**  
   Space fires upward shots repeatedly while held, including during movement; shots are removed when they leave the game area. Space does not scroll the page.  
   **Manual checks passed (user report):** Space fires upward; holding it fires repeatedly at a controlled rate; shooting works while moving; shots disappear beyond the top edge; Space does not scroll the page.
   **Additional visual check (user report):** After refreshing the local game, the updated controls instruction appeared. This was not a full gameplay retest.

3. **Enemies, enemy fire and collisions — Partially implemented; documented enemy-shot manual checks passed (user report, 15 November 2026); original unnamed pending checks unresolved**  
   **Manual checks passed (user report):** Formation appears and moves side to side within the game area; player shots remove one enemy and are removed; the formation was cleared; movement and shooting were rechecked.  
   Implemented: living enemies fire occasional downward shots; shots leave the game area or hit the player, then disappear; a hit briefly flashes the player.  
   **Manual checks passed (user report):** Remaining enemies fire at a manageable rate; enemy shots leave the bottom; a hit removes the shot and briefly flashes the player; the player remains visible and controllable afterward; existing shooting and collision checks passed again.
   **Additional manual checks passed (user report, 15 November 2026):** On an enemy-shot hit, the shot disappeared, lives dropped from 3 to 2, the player briefly flashed and remained visible, and movement and shooting still worked afterward. When not hit, several enemy shots travelled off the bottom and disappeared while lives stayed at 3. These observations are user-performed manual tests, not agent-run or automated tests. The original checks formerly called “newest checks pending” were not named in the records and cannot be identified; these additional checks do not reconstruct or prove completion of that unknown checklist.

4. **Score and lives — Implemented; manual checks passed (user report)**  
   Start at 0 points and 3 lives. Award 10 points once per destroyed enemy. Each enemy-shot hit removes one life and the shot; one second of invulnerability flashes the player and prevents further life loss. At zero lives, freeze gameplay and show “Game over.”  
   **Manual checks passed (user report):** Initial values, scoring, life loss, one-second invulnerability, zero-life limit and game-over freeze.

5. **Win/loss and restart — Implemented; manual checks passed (user report, 15 November 2026)**  
   The last enemy triggers “You win” while the player is alive; zero lives triggers “Game over.” Both stop gameplay and show a Restart button. Restart resets the player, formation, score, lives, shots, timers, protection and held keys without starting another animation loop or input handler.  
   **Manual checks passed (user report):** Winning and restarting; losing and restarting repeated three times; score reset to 0 and lives to 3; player and full formation returned to their starting states; no old shots remained; no unexpected increase in movement or firing speed was observed. These were user-performed manual tests, not agent-run or automated tests.

## Current post-submission final-version direction — planned, not started

As listed in the submitted forum post: add a menu and review keyboard controls; extend gameplay to three levels with a unique boss in each; add sound effects, particle effects and transitions; test and balance the game; then complete final documentation and demonstration. These are plans, not completed work. Upgrade choices and difficulty settings will be reconsidered after the teacher's target features have been implemented.

## Earlier final-version plan — retained for history, subject to reconsideration

1. **Three-level progression — Not started:** Build on the prototype to provide three levels.  
2. **Upgrade choices — Not started:** Offer a choice after levels 1 and 2; decide the exact upgrades and balancing during planning.
3. **Difficulty options — Not started:** Add Easy, Hard and Ridiculous choices before play.

The earlier plan excluded multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls. The submitted post now includes unique bosses in its planned direction; the remaining earlier scope assumptions are subject to teacher requirements.

## Review task

- Separate-tool source-code review — **Complete**. Perplexity reviewed `game.js` and `index.html` from GitHub without running the game or automated tests.

## Visual polish

- Code-drawn starfield, enemy silhouettes, clearer player ship, and coordinated page/HUD/ending/button styling — **Implemented**. Visual and gameplay regression checks were reported passed by the user; these were not agent-run tests.
