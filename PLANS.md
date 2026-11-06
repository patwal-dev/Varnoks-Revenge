# Project plan

Implementation status reflects code changes. Manual checks are recorded from my reports; unreported checks remain pending.

## One-level prototype

1. **Canvas and player movement — Implemented; manual checks passed (user report)**  
   Show the game area and move the player left and right with the keyboard.  
   **Manual checks passed (user report, including recheck):** Player appears; arrow keys and A/D move it; movement stops on release; player stays inside both edges.

2. **Player shooting — Implemented; manual checks passed (user report)**  
   Space fires upward shots repeatedly while held, including during movement; shots are removed when they leave the game area. Space does not scroll the page.  
   **Manual checks passed (user report):** Space fires upward; holding it fires repeatedly at a controlled rate; shooting works while moving; shots disappear beyond the top edge; Space does not scroll the page.

3. **Enemies, enemy fire and collisions — Partially implemented; newest checks pending**  
   **Manual checks passed (user report):** Formation appears and moves side to side within the game area; player shots remove one enemy and are removed; the formation was cleared; movement and shooting were rechecked.  
   Implemented: living enemies fire occasional downward shots; shots leave the game area or hit the player, then disappear; a hit briefly flashes the player.  
   **Manual checks passed (user report):** Remaining enemies fire at a manageable rate; enemy shots leave the bottom; a hit removes the shot and briefly flashes the player; the player remains visible and controllable afterward; existing shooting and collision checks passed again.

4. **Score and lives — Implemented; manual checks passed (user report)**  
   Start at 0 points and 3 lives. Award 10 points once per destroyed enemy. Each enemy-shot hit removes one life and the shot; one second of invulnerability flashes the player and prevents further life loss. At zero lives, freeze gameplay and show “Game over.”  
   **Manual checks passed (user report):** Initial values, scoring, life loss, one-second invulnerability, zero-life limit and game-over freeze.

5. **Win/loss and restart — Implemented; manual checks pending**  
   The last enemy triggers “You win” while the player is alive; zero lives triggers “Game over.” Both stop gameplay and show a Restart button. Restart resets the player, formation, score, lives, shots, timers, protection and held keys without starting another animation loop or input handler.  
   **Manual checks pending:** Win and restart; lose and restart; confirm each restart restores score 0, lives 3, player starting position, full formation and no old shots; repeat restarts and confirm movement and firing do not speed up.

## Final version

1. **Three-level progression — Not started:** Build on the prototype to provide three levels.  
2. **Upgrade choices — Not started:** Offer a choice after levels 1 and 2; decide the exact upgrades and balancing during planning.
3. **Difficulty options — Not started:** Add Easy, Hard and Ridiculous choices before play.

Final-version milestones remain within the approved scope. Multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls are out of scope.
