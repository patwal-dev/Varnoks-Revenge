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

## Final game — level design

This section records the current multi-level implementation and the remaining final-game design. Planned features are not marked implemented or tested.

### Current build

- **Formation speed-up — implemented:** The formation speeds up gently as enemies are cleared. Patrik reported that it moved a little faster as enemy numbers fell and felt appropriate for a practice level. He also reported completing the follow-up browser check for edge reversal, victory and restart. These are user-reported manual checks, not automated or Codex-run tests.
- **Stationary barriers — implemented in the current build:** Three destructible barriers are present and Patrik manually tried them. In the final game, they are planned for Level 1 only.
- **Level 1.** Two waves lead to Xal’Gorath, the Devourer. His reveal slides into combat. Boss hits award 10 points and defeat awards 100 once. The clear panel offers Level 2 and carries score and lives forward.
- **Level 2.** Two regular waves of 18 aliens each lead to Lord Kaezar Vhul. One diver can be active at a time. Supply ships drop Shield, Machinegun, Double shot, or Spread shot. Easy and Hard have one 20-HP boss and an on-screen warning lane. Ridiculous has two 20-HP bosses with split patrol lanes and alternating attacks. The 800 ms warning stays active while the lanes are hidden on Ridiculous. Each damaging hit awards 10 points, and each boss awards 200 on defeat. The clear panel offers Level 3 only after all bosses fall.
- **Level 3.** Two waves of 24 aliens lead to Zhur-Kai, Matriarch of the Swarm. Her moving core and armor cycle govern damage, and her firing patterns are twin streams and an aimed burst. Normal defeat reveals Varnok, Destroyer of Worlds, whose dialogue waits for Fight. Varnok's two eyes share 19 HP and his hatchlings spawn in recurring batches. Varnok's defeat shows both 300-point bonuses, score, and lives before Continue fades into credits. Standalone boss results remain separate.
- **Credits and difficulty.** The user accepted the flat, full-height cast credits, the Villains heading and the five-second Afterlight hold after the song and roll finish. The game then returns to the idle menu. The HUD shows Easy, Hard, or Ridiculous, chosen in ship selection. Alien and boss movement is 1.00×, 1.15×, or 1.20× Easy. Ridiculous repeats eligible alien and boss shots with the approved 150 ms gap. Check the handover and development log for the full behavior and evidence limits.

### Teacher feedback

- The stationary barriers address the teacher's shield feedback. In the final game, barriers are planned for Level 1 only; Levels 2 and 3 will have no stationary barriers.

### Earlier gameplay design notes

These notes retain earlier design ideas. The current-build section records the decisions in use.

#### Shared rules

- All three levels will support WASD and arrow-key controls with limited vertical movement, multiple enemy waves, formation speed-up as enemies are cleared, and a unique end boss. Keep Level 1 gentle and tune later levels during playtesting.
- Make Levels 2 and 3 longer experiences with distinct waves, escalating enemy patterns, pickups, and different boss fights. Consider adding an extra Level 2 wave; leave both later-level wave counts undecided until playtesting.
- In Levels 2 and 3, a dive-bomber that misses will exit at the bottom, reappear at the top and rejoin the formation at a random position.
- Game-wide additions: a start menu, sound effects, music, particles, and clear wave and level transitions.

#### Level 1 — Learn the basics with cover

- Teach the basics of movement, shooting and dodging with stationary barrier cover. Keep Level 1 as a short practice level with two waves and a boss.
- **Pre-tuning playtime report (user-reported):** Patrik reported clearing the current Level 1 in roughly 30–40 seconds before this tuning change.
- Leave the wave counts for Levels 2 and 3 undecided until their designs are developed.
- No dive-bombers in the final Level 1.
- Keep the current gentle formation speed-up.
- End with Xal’Gorath the Devourer, a unique boss whose attack pattern is easy to read.

#### Level 2 — Learn to dodge without cover

- Introduce dodging without stationary barriers.
- Introduce distinct aliens, a scrolling background, one dive-bomber at a time, and a collectible alternate weapon.
- End with Lord Kaezar Vhul, a different boss.

#### Level 3 — Survive without cover

- No stationary barriers. Keep the alternate weapon available.
- Use distinct aliens and a different scrolling background. Allow two simultaneous dive-bombers and occasional harder paths such as loops.
- Add Patrik's rare temporary shield pickup, dropped by defeated enemies. This pickup is separate from the stationary barriers proposed in response to the teacher's feedback.
- End with Zhur-Kai, Matriarch of the Swarm. After Zhur-Kai is defeated, the player briefly thinks they have won; then reveal Varnok Dral, the Hollow Emperor, who has come to take care of the player personally. This surprise encounter follows the Level 3 boss and is not a fourth level. True victory follows Varnok's defeat.

### Balance and delivery

- Balance and test the game, verify progression, the ending, and restart, then prepare the final demo and post-mortem.
- Supply pickups are the current upgrade system. Difficulty settings are implemented. The earlier between-level upgrade choice remains deferred.
- Prioritize gameplay, progression, scoring and win/loss behavior. Use placeholder visuals where needed; defer graphics and cosmetic polish unless a visual issue makes the game hard to read or test.

### Implementation closeout and submission

The user closed implementation on 25 November 2026. The independent local Qwen and Gemma reviews covered audio controls only. The user considered that evaluation sufficient and superseded the earlier plan for additional or whole-game local-model reviews. The post-mortem, actual hours worked and demonstration video remain pending. The earlier design ideas above remain historical context. [Closeout and submission handover](NEXT_SESSION.md)

### Late polish

- Add a “3, 2, 1, FIGHT!” countdown at the start of each level, not between waves. Defer implementation until near the end so it does not slow development playtests.

## Earlier final-version plan — retained for history, subject to reconsideration

1. **Three-level progression — Not started:** Build on the prototype to provide three levels.  
2. **Upgrade choices — Not started:** Offer a choice after levels 1 and 2; decide the exact upgrades and balancing during planning.
3. **Difficulty options — Not started:** Add Easy, Hard and Ridiculous choices before play.

The earlier plan excluded multiplayer, bosses, a shop, a skill tree, saved progress and mobile controls. The submitted post now includes unique bosses in its planned direction; the remaining earlier scope assumptions are subject to teacher requirements.

## Review task

- Separate-tool source-code review — **Complete**. Perplexity reviewed `game.js` and `index.html` from GitHub without running the game or automated tests.

## Visual polish

- Code-drawn starfield, enemy silhouettes, clearer player ship, and coordinated page/HUD/ending/button styling — **Implemented**. Visual and gameplay regression checks were reported passed by the user; these were not agent-run tests.
