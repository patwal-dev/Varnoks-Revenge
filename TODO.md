# TODO – Space Shooter final game
Updated: 24 November 2026. Source: Patrik's list, reordered into build order.
The user considers the game done at the 24 November 2026 checkpoint. This checklist separates implementation, automated checks and focused user browser checks. The independent local-model reviews are next. Residual checks and unchecked optional or delivery items are recorded for reference.

## Phase 1: Quick fixes
- [x] 1. Keep an already-flying supply ship moving during wave entrances without advancing the countdown for a new ship. (applied, explicit browser verification pending)
  - The user will watch for problems during later play.
- [x] 2. Remove the original boss dialogue (applied, browser tested by user). The revised Varnok introduction below is the sole exception.
- [x] 3. Add a Restart button to the Game over screen (applied, explicit browser verification pending)
  - The user will watch for problems during later play.

## Phase 2: Screen look and player ship
- [x] 4. Give the menus, result panels and buttons the game's graphics style (applied, overall appearance accepted by user)
  - The later button styling, panel seam, in-panel next-level buttons and clear-screen copy lack individual browser verification.
  - The user visually approved the revised side-by-side Music and Sound effects controls in the main menu.
- [x] 5. Bank the player ship's graphics left and right when moving (applied, 84% full-bank width accepted by user)
  - The shading-mask mismatch was fixed. The user reported motion blur in both bank modes on low battery and chose to move on after frame intervals improved on power. No further ship-rendering fix is requested.
- [x] Add ship selection after the main menu (core feature implemented).
  - Start Game opens a ship-selection screen before gameplay starts.
  - Let the player choose Kestrel, Vesper, or Bastion.
  - Use Kestrel as the supply ship when the player chooses Vesper. Use Vesper as the supply ship for all other choices.
  - Keep the choice visual. Preserve the existing ship stats, difficulty, and gameplay balance.
  - User-reported browser checks. All three options appear, the game stays idle, reopening defaults to Kestrel, and a fresh run starts at 0 score and 3 lives.
  - User-reported browser checks. Vesper and Bastion look fine as player ships. In Level 2, Vesper pairs with Kestrel as supply, and Bastion pairs with Vesper as supply. Bastion stays selected after life loss and Restart. Restart resets the score to 0 and lives to 3.
  - Browser verification pending for the Kestrel player and Vesper supply pairing, Back button, ship retention across level transitions, banking, firing alignment, and hit flashes.

## Phase 3: Weapons
- [x] 6. Add Double shot and Spread shot to the supply drop, with a per-volley damage rule for bosses (applied, focused browser checks only)
  - The user verified Shield, Machinegun and Spread shot, including Spread hits on Varnok's eyes. Double shot and broader replacement, expiry and reset checks remain pending.
  - The new 10-second Shield expiry and two-second fade still need browser verification.
- [x] 7. Show "Double shot!" and "Spread shot!" pickup text, same logic as the other supply items (applied, Double shot message still needs a browser check)

## Phase 4: Audio
- [x] 8. Music (implemented, broader credits browser verification pending).
      Menu, How to Play, ship selection, Level 1, Boss 1 and Level 1 clear summary: S&H (Scorched Earth Remix).mp3
      Level 2 and Boss 2: Log Entry_ Ship Clock 2230.mp3
      Level 3 and Bosses 3–4: Voyage Home (Extraterrestrial Reprise).mp3
      Credits: Rogue Transmission (Switch The Frequency Mix).mp3
  - Loop the menu and gameplay tracks. Crossfade into the one-shot credits track over about one second. Music Off mutes playback while it advances. The flat roll follows the track and uses a timed fallback on audio failure or 20 seconds without progress. After the song and roll finish, Afterlight holds for five seconds before the idle menu returns. The user accepted the credits ending. Muted and fallback completion were checked in Node.
  - Keep the same playback position through the menu, How to Play, ship selection, and the start of Level 1. Restart and direct Level 1 or Boss 1 tests select this track. Keep it progressing if it is already playing.
  - Keep the current level music playing after its boss is defeated and throughout the level-clear summary.
  - On the Level 2 or Level 3 button, start gameplay immediately and crossfade to that level's track over about one second. Stop the outgoing track at the end of the fade.
  - Keep playback continuous between encounters that share a track, including Zhur-Kai and Varnok.
  - After user-activated playback begins, Music Off mutes all tracks while playback and fades continue. Music On restores sound at the current position. This supersedes stopping tracks or canceling fades on Music Off.
  - Keep the controls synchronized and save the preference. Default to Off. With Music saved as On, the first menu or developer control click after refresh starts the appropriate track. Muting and unmuting must leave a finished credits track ended.
  - Normal volume is 18%. Voyage to Aether Nova.mp3 remains on disk and is unassigned. Weightless (Ambient Mix).mp3 and We Fight for Our Right to Party!.mp3 were removed.
  - User-reported browser checks. Start Game starts music after a Chrome refresh with On saved. Menu to Level 1 plays continuously. The Level 1 to Level 2 and Level 2 to Level 3 crossfades work, and Level 2 music continues on its clear summary. Unmuting after a muted transition into Level 2 reveals the track already in progress.
- [x] 9. Add a Sound effects On/Off button in the menu (implemented, user confirmed the control works in the browser). It defaults to Off and saves its own preference.
- [x] 10. Create the sound effects (standalone set approved, integrated, and confirmed working in-game by the user). Individual cues, encounter coverage, and all mute and persistence paths remain outside the reported check.
- [x] 11. Announce the collected supply reward using prerecorded ElevenLabs clips for Shield, Machinegun, Double shot and Spread shot (complete, user approved the in-game voices).

## Phase 5: Visual polish
- [x] 12. Add distinct, subtle backgrounds for the menu, each level and credits. The user accepted background appearance and readability in the focused browser checks recorded in [NEXT_SESSION.md](NEXT_SESSION.md).
- [x] 13. Add animation to Boss 1 and Boss 2. The user accepted Boss 1's randomised organ blinking with Exaggerate animation Off and Boss 2's stronger armour and vent animation.
- [x] 14. Create particle effects and animations for aliens and good guys. Focused user checks cover the recorded alien and supply-ship bursts, the final-life sequence, and the Level 1 non-final hit and Restart checks in [NEXT_SESSION.md](NEXT_SESSION.md).
- [x] Add an arcade-inspired two-pose movement animation and synchronized tick-tock for Clack, Anvil and Rift in Level 1–3 formations. The user accepted the strengthened Anvil and Rift poses in the browser. Clack remains accepted and unchanged.
  - One shared pose change and alternating quiet cue every 450 ms. The beat pauses outside active formation play and stops when the formation is empty. Sound effects Off mutes the cue while the animation continues.
  - The existing artwork remains pose 1 and the dive/return sprite. Bosses and gameplay retain their existing behaviour.
- [x] Extend the shared formation beat to settled Bud, Hook and Crown hatchlings in normal Varnok progression and Test Boss 4. The user accepted the settled animation, shared tick-tock and original dive appearance in a focused browser check. Full coverage of all variants, lifecycle states and encounter routes remains unconfirmed.
- [x] 15. Make waves enter in creative ways before the fight starts. The player can move while waiting.
  - Entrance patterns, regular formation variety and Varnok's returning hatchling choreography are implemented. Residual verification of individual variants is recorded in [NEXT_SESSION.md](NEXT_SESSION.md).
  - Crate-transition fixes passed automated checks. The latest boss-transition fix has no separate visual confirmation. Observe it during normal play.
- [x] Give both supply-ship skins a level-flight pose with their noses pointing along travel. Both designs are integrated, and the user verified their appearance in the browser.

## Phase 6: Ending and credits
- [x] Animate the normal Zhur-Kai to Varnok transition (implemented, focused intro accepted by user in the browser).
  - Reveal Varnok over about 1.5 seconds with a slide down and a fade-in. Keep his artwork animated and the Level 3 track playing while combat is paused.
  - Show the game's first and only planned dialogue in a rectangular neon panel. Wait for Fight before starting the encounter. Keep Test Boss 4 direct.
  - “You thought you had won??? You will never defeat Varnok, Destroyer of Worlds!”
  - The user accepted the reveal and panel after defeating Zhur-Kai. Full encounter and ending verification remain open.
- [x] 16. Add **Test Credits** to the Developer testing panel. It clears combat and starts or restarts the shared credits and track directly. The user confirmed Boss 2 cleanup, credits entry, and restart with the prior crawl.
- [x] 17. Add the normal-progression ending after Varnok (implemented, full browser verification pending).
  - The combined Zhur-Kai and Varnok panel shows both already-awarded 300-point bonuses, total score, lives, and Continue. Continue fades the panel out and the credits in. Zhur-Kai leads directly to Varnok's reveal, dialogue, and Fight. Standalone boss results remain separate.
  - Credits return to the idle main menu after the roll, track and five-second hold finish. The final Victory screen was removed. The user accepted the final credits presentation and ending.
  - Detailed combined-panel scoring, lives carryover, muting and fallback browser coverage remain residual verification notes.
- [x] Apply the canonical full boss names to existing named references. The expanded credits reuse these names. Full-name layout still needs a browser check.
- [x] 18. Credits page presents all aliens, bosses, the supply ships and the playable ships, each with a short bio.
  - The user accepted the full-height cast roll, content, box-free styling, **Villains** heading and five-second post-song Afterlight hold. The editable Gemma/Qwen credit remains provisional until the final reviews run.

## Phase 7: Finish
- [x] 19. Implement Easy, Hard, and Ridiculous (focused browser checks only).
  - Choose difficulty in ship selection. Easy is the default on opening the menu or ship selection. The HUD shows the active in-memory choice, which persists across life loss, level changes, and Restart. Developer tests use the current choice. Back resets it to Easy.
  - Easy uses baseline movement. Hard starts at 1.15× base movement and Ridiculous at 1.20× before level-specific tuning. Ordinary waves gain additional horizontal speed and fire more often as the wave thins. The user accepted Hard Level 1 waves, Boss 1, Level 2 waves and Boss 2. The user also accepted the Level 3 progression fix. Broader Ridiculous balance remains a residual verification note.
  - In Ridiculous, eligible aliens and hatchlings repeat their shots, Xal’Gorath repeats wide shots and spreads, and Zhur-Kai repeats both complete attack patterns. The repeat begins 150 ms after the last original shot. Ordinary waves keep repeat and primary shots spaced after slow frames. The aimed repeat keeps its target lock and the final twin-stream pair may fire 50 ms after armor closes. Pending repeats clear on shooter or encounter exit and life loss. A shield absorption keeps them scheduled. Easy and boss firing, including hatchling cadence, retain their existing settings.
  - Ridiculous has two independent 20-HP Lord Kaezar Vhul bosses in normal progression and Test Boss 2. They alternate warning, charge, and retreat in split patrol lanes with the full 800 ms warning. Each awards 200 points once. Hits still award 10 points. The first defeat leaves the survivor active, and the Level 2 clear panel shows 400 total bonus after both defeats. Easy and Hard have one boss and show 200. Only Ridiculous hides the red lanes. Easy and Hard retain their clipping and fade.
  - User-reported browser checks cover difficulty choice controls, a Hard HUD in Test Boss 2, Zhur-Kai's Ridiculous repeats, the focused two-boss appearance/play check, and the difficulty-specific warning lanes. Exact movement ratios, full repeat and cleanup coverage, difficulty persistence, collisions, scoring, and full regression remain pending in the browser.
- [ ] Add high scores.
  - Record high scores with optional player-name entry. Save the score even when the name is blank.
  - Let players view high scores from the main menu.
  - Store high scores locally in the browser for this version.
  - Exclude developer and test encounters from high-score records.
- [ ] 20. Remove all developer buttons.
  - Remove the remaining developer controls, including level and boss tests, Test Credits, forced supply rewards, Bank effect, and Measure Canvas and its readout.
  - The boss shooting-statistics readout and its exclusive logging code are already removed. Browser verification in both encounter routes remains pending.
- [ ] 21. Final testing, then the post mortem and the YouTube video.
  - Next session, give the same current project code to the locally installed Qwen and Gemma in independent reviews. Each should report up to 10 substantiated security flaws and up to 10 substantiated bugs, with code locations, impact, reasoning and verification steps. Report fewer if warranted. Compare only after both reviews finish, then deduplicate, verify and prioritize the findings. See `NEXT_SESSION.md` for the record-keeping plan.
