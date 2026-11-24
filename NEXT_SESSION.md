# Next Session Handover

## Current checkpoint — 24 November 2026

The user considers the game done. The next session starts with independent local Qwen and Gemma reviews of the current code. The remaining browser coverage notes document verification limits and do not reopen implementation.

**Task 12 complete.** The user confirmed background appearance and readability on the remaining routes in focused browser checks.

**Task 13 complete.** The user visually accepted both boss animations.

**Task 14 complete.** The focused user checks for alien, supply-ship and player effects are recorded below. The reports cover the tested cases and leave other ship palettes, difficulties and encounter routes unverified.

**Task 15 implementation complete.** Wave entrances allow player movement while incoming enemies settle. The focused checks and remaining verification limits are recorded below.

**Task 18 complete.** The user accepted the credit content, artwork, box-free styling, full-height roll, thank-you timing, **Villains** heading before Gary and five-second Afterlight hold after the song and roll finish. The flat roll has 15 cast entries. Its text remains editable in `game.js`, where the Gemma/Qwen credit is provisional until the final reviews run.

**Task 15 first step.** Level 1 Wave 2 chooses a split entry, sweeping curve or alternating columns using presentation-only randomness. The developer panel shows the chosen pattern. The user visually accepted one unspecified pattern. Variant-by-variant browser coverage remains unconfirmed.

**Task 15 Varnok follow-up.** In normal progression and **Test Boss 4**, each initial or reinforcement batch chooses a split approach, sweeping curve or staggered descent using presentation-only randomness. Choreography affects only the drawing during return. Hatchlings still emerge from Varnok, wait offscreen, return to their reserved slots and become combat-active when they settle. Batch size, formation shape, population cap and reinforcement timing use the existing rules. The player, Varnok and active hatchlings continue during arrivals. Initial and reinforcement arrivals lack separate variant-by-variant visual confirmation.

**Task 15 crate follow-up.** The user liked the wave entrances but reported a falling crate briefly freezing during Level 2 Wave 2 → Boss 2. The boss-intro branch advanced only the reveal. It now shares the wave-entrance update for falling crates and ships already in flight. Crates stay collectible and expire offscreen. New ships still wait for combat and the Boss 2 reveal timing is unchanged. The audit also found that Boss 3's immediate start discarded falling crates, which now carry over while its existing ship and countdown reset still applies. Level 1 has no supply drops, and Varnok's separate reveal retains its existing encounter cleanup. The crate fixes are implemented and `node tests/supply-transitions.cjs` passed for both boss transitions, wave-to-wave entry and one update per frame. The latest boss-transition fix awaits visual confirmation through normal play. The user declined a dedicated crate-transition test.

**Task 15 regular formations.** Level 1 Wave 2 and both waves in Levels 2 and 3 choose one grid, shallow chevron or staggered layout per wave using presentation-only randomness. The developer panel reports the formation. Existing paths land in the selected slots, and Level 1 Wave 1 stays unchanged. Level 2 and 3 movement keeps the full slot layout in bounds so divers can return to vacant slots. Level 3 descent still starts on right-edge contact, now measured against the full layout. Formations hold their shape during combat. The playthrough did not identify which formation variants appeared, so individual layout coverage remains unconfirmed.

**Ordinary-wave difficulty.** Hard and Ridiculous gain speed after each alien is eliminated and fire more often as the wave thins. The targeted Hard checks are recorded below. Broader Ridiculous balance and formation-variant coverage remain residual verification notes.

**Level 3 progression fix.** The user reported on Ridiculous that one alien vanished below the player and the wave stalled. The wave number was not recorded. A Node reproduction showed that the old descent cap let the lowest slot fall below the player's firing reach. An alien could dive upward from there, leave the screen, and stay counted as a survivor because the return logic only handled bottom exits. Ordinary Level 3 now stops descent above the lowest player muzzle, starts dives only above the player, and returns missed divers through vacant slots after any edge exit. Direct formation contact still causes Game over. The fix applies to all difficulties. `node tests/level3-progression.cjs` covers both waves, all layouts and difficulties, multiple survivor slots, long frames and progression. The user visually accepted the fix and reported the aliens behaved correctly.

**Targeted Hard follow-up accepted.** The user previously visually accepted ordinary Level 1 waves and now also accepted the tuning for Boss 1, Level 2 ordinary waves and Boss 2. Boss 1 moves at 141.68 px/s, waits 1.35 s between attacks and charges its spread for 0.45 s. Level 2 formations move 12% faster on Hard. Boss 2 moves 8% faster during patrol, pullback, charge and retreat, with a 1.85 s patrol window and 0.80 s warning. Level 3 and its boss retain their balance settings.

**Diagnostic status at this save.** The developer sidebar still reports each artwork layer's load status, the draw path, Boss 1's animation clock, and Boss 2's live phase and elapsed time. **Exaggerate animation** affects drawing and starts Off for each test.

**Checkpoint.** The user accepted the supply ships in both reported pairings, the Sound effects control and generated cues, the pickup voices, the regular-alien and settled hatchling animations with shared tick-tock, and the matching menu audio controls. The background set is integrated. The standalone set and The Veil in the menu screenshot are approved. Other in-game scene checks are listed below.

## Artwork and supply ships

- **Ship selection is implemented.** Start Game opens an idle ship-selection screen with Kestrel, Vesper, and Bastion. Kestrel is the default each time it opens. Vesper as player uses Kestrel supply artwork. Kestrel and Bastion as player use Vesper supply artwork. Direct developer tests default to Kestrel as player and Vesper as supply.
- Kestrel’s artwork is centered at about **38.67 × 34 px** at rest within the **42 × 34 px** hitbox. The user accepted the bank at **84%** of full width. Separate wing-shading masks fix the mirrored-mask mismatch.
- On 24 November, the user visually reviewed the standalone workshop and approved both designs for integration. The supply renderer now loads the approved right-facing SVGs, centers each at the existing fractional position, and mirrors the artwork horizontally for leftward travel. Kestrel draws at **40.717742 × 46.306452 px** and Vesper at **49.5 × 46.306452 px**. Both use the existing **52.8 × 46.306452 px** shot hitbox.
- The supply ship appears during Level 2 and 3 waves and Bosses 2–4, including standalone tests. The shared **7–15 second** spawn countdown pauses during intros and wave entrances. An already-flying ship continues through the wave entrance. Destroying it awards **50 points** and drops one identical crate containing Shield, Machinegun, Double shot or Spread shot with equal odds.
- The shield retains two charges and its **54 × 50 px** and **74 × 66 px** rings. It now expires after **10 seconds** with a **two-second** fade. A new Shield pickup refreshes the timer. Protection already granted by an absorbed hit keeps its original end time.
- A new weapon replaces the current one for **10 seconds**. Losing a life clears the active weapon, including Machinegun. Shield is independent of the weapon slot. Notifications are **Shield!**, **Machinegun!**, **Double shot!** and **Spread shot!**. Each volley can damage the same boss once, including across both of Varnok’s eyes.
- **Pickup announcements accepted.** All four collected rewards use prerecorded ElevenLabs clips and the existing pickup chime. The existing Sound effects preference controls both independently of Music. A new collection replaces the active announcement, and turning effects Off stops it. The original MP3s are in `Voices/` and the local PCM bundle supports direct opening of `index.html`. The user said “voices are good” after listening in the game. Task 11 is complete.
- Clack (Level 1), Anvil (Level 2), Rift (Level 3) and Varnok’s Bud, Hook and Crown hatchlings are integrated. Level 2 and 3 regular aliens and hatchlings turn visually in flight while gameplay geometry stays the same. Hatchlings get one variant at creation from a separate visual random source and keep it through launch, offscreen wait, return, formation, dives and slot changes.
- **Formation animation and sound.** Clack, Anvil and Rift switch poses on a shared 450 ms beat. The user accepted Anvil and Rift’s strengthened poses in the browser. Clack remains accepted and unchanged.
- **Varnok hatchlings.** Bud, Hook and Crown join that beat when settled in active combat, in normal progression and Test Boss 4. They use their original poses during emergence, launch, offscreen waiting, return and dives. Each formation switch plays one tick or tock through Sound effects, independently of Music. The user accepted the settled animations, shared cue and original dive appearance in a focused browser check. The animation and tick-tock task is complete.
- **Task 14 alien bursts.** A player shot that destroys a regular alien or a Varnok hatchling creates 12 colour-matched fragments at its last position, including on a dive. The fragments scatter, tumble and fade behind ships and shots over 0.25–0.45 seconds of combat time. An immediate wave or boss transition clears the final alien's burst before it appears.
- **Task 14 supply-ship burst.** Shooting down a supply ship creates 16 fragments in the displayed Kestrel or Vesper colours, with brighter highlights. The fragments draw behind ships, shots and the dropped crate. Alien and supply-ship bursts share the 144-fragment cap, combat clock and reset behaviour.
- **Task 14 player life-loss effects.** A non-final life loss still creates the local 16-fragment burst for 0.25–0.35 seconds alongside the existing hit flash. A final hit hides the ship and triggers one larger 40-fragment explosion in the selected ship's colours. The scene stays visible with combat frozen for 0.7 seconds before Game over. Final death takes priority over a same-frame encounter clear. Restart restores the ship and controls and clears the effect and its timer.

## Boss artwork decisions

- **Boss 1, Xal’Gorath, the Devourer.** The user visually accepted the original Spore Choir artwork. The base drawing size is **112 × 58 px** in normal progression and **Test Boss 1**.
- **Boss 2, Lord Kaezar Vhul.** The user visually accepted the original Iron Sepulchre artwork and the corrected warning-lane clipping. The base drawing size is **132 × 68 px** in normal Level 2 progression and **Test Boss 2**. The existing **76.56 × 42.16 px** shot and ram collision footprint stays centered within the body.
- **Task 13, Boss 1.** The user rejected the stronger breathing and visually accepted the spore reactor's randomised organ blinking with **Exaggerate animation** Off. Its silhouette and sac positions stay fixed. Each yellow-green pulse lasts 0.62 seconds. The next organ is chosen at random without consecutive repeats, with a roughly 0.12–0.32 second pause between blinks. The centre oval narrows and reopens during its blink. Normal progression and **Test Boss 1** share the animation.
- **Task 13, Boss 2.** The user accepted the stronger animation. The armour slides up to 11 logical canvas pixels per side over fixed rails. The amber vent bars pulse in patrol, brighten in prepare, fade through charge and sweep during retreat. Preserve this animation.
- **Boss 3, Zhur-Kai, Matriarch of the Swarm.** The user visually accepted Crown Maw’s current artwork and mouth animation. Preserve the compact pointed closed jaw, the dropping lower jaw that reveals the recessed yellow target, and the twin firing organs.
- **Boss 4, Varnok, Destroyer of Worlds.** The user visually approved the integrated Rooted Crown animation in Safari. Normal progression and **Test Boss 4** use the same **200 × 110 px** artwork with downward amber slit eyes, normal-strength cheek breathing, a hinged lower jaw with attached fangs, and eight sweeping dark plum tentacles. The eyelids still use the existing vulnerability progress.

## Backgrounds

- The user visually approved all five static 800 × 600 plates in the standalone `Background-Art-Workshop/`. The game loads the original plates directly through that workshop’s manifest. The older `background-workshop/` proposals were superseded, and both workshops and provenance logs are preserved.
- **The Veil** covers the main menu, How to Play and ship selection. **Outer Debris** covers Level 1 and Boss 1. **Wreck Tide** covers Level 2 and Boss 2. **Hollow Reach** covers Level 3 and Bosses 3–4. Clear and result screens retain their level plate, including standalone tests. **Afterlight** covers credits and remains while the crawl and track finish. The original static starfield is the fallback when a plate is loading or unavailable. Existing scene fades retain their timing and draw order.
- Perplexity Computer used the Perplexity image generator to produce opaque 4:3 sources and ImageMagick to export the approved WebP plates. The underlying model and sampling settings were unspecified. The workshop’s readability overlays stay in the workshop.
- **User-reported menu approval.** The Veil looked great in the main-menu screenshot. The user also visually approved Music and Sound effects as a matching pair in the revised menu.

## Music

| Scene | Assigned file in `backstageriot/` |
| --- | --- |
| Menu, How to Play, ship selection, Level 1, Boss 1, and clear summary | `S&H (Scorched Earth Remix).mp3` |
| Level 2 and Boss 2 | `Log Entry_ Ship Clock 2230.mp3` |
| Level 3 and Bosses 3–4 | `Voyage Home (Extraterrestrial Reprise).mp3` |
| Credits | `Rogue Transmission (Switch The Frequency Mix).mp3` |

- Menu and gameplay tracks loop at **18%** normal volume. The credits track plays once at 18%. The menu returns after the crawl and the track both finish. If the text finishes first, the starfield remains visible. Music Off mutes the track while it advances. On load or playback failure, or 20 seconds without progress, the game waits for the crawl and then returns to the menu. Level changes and credits entry crossfade over about one second. The menu and Level 1 share one uninterrupted track.
- Both **Music On/Off** controls share a saved preference and default to Off. Off mutes while playback and transitions continue. With On saved, playback starts on the first suitable click after refresh.
- `Voyage to Aether Nova.mp3` remains on disk and is unassigned. `Weightless (Ambient Mix).mp3` and `We Fight for Our Right to Party!.mp3` were removed. The user created the soundtrack in Suno. [Backstage Riot on Suno](https://suno.com/@backstageriot)

## Current implementation

- All four bosses keep their HP internal in normal progression and standalone tests. The player sees no boss health bar, HP number, percentage or replacement indicator.
- Xal’Gorath’s visible cyan charge halo was removed in both encounter routes, superseding the earlier requirement to preserve it. His internal charge timing and spread shots still use the existing code.
- The project is a single-player HTML/CSS/vanilla JavaScript Canvas game with all three gameplay levels implemented. Level 1 has two waves followed by Xal’Gorath, a separate 100-point defeat bonus, and a paused clear screen before Level 2.
- The game opens at an idle Space Shooter menu. **Start Game** opens ship selection. **Start** uses the Level 1 reset with 3 lives and 0 score. **How to Play** lists the movement, firing and objective, with a Back button. Developer Mode tools remain in a separate panel.
- The boss shooting-statistics readout and its exclusive logging code were removed. **Test Credits** clears the active encounter and starts the shared credits directly. Clicking it again restarts both the crawl and the track. Task 20 still covers removal of the remaining developer controls.
- Neon styling covers the start menu, clear screens, the combined ending panel, Game over, and standalone boss-test results. The next-level buttons sit inside the clear panels. Game over uses the existing Restart action, with keyboard focus on the button in the panel.
- Level 2 has two regular waves of 18 aliens each (3 × 6), followed by Lord Kaezar Vhul. Each boss uses the existing locked-path ram and retreat, with a base forward charge speed of 616 px/s and a 200-point defeat bonus. See the difficulty section for the paired encounter and clear-panel rules.
- Boss 2’s warning lane is clipped below and ahead of his moving center on Easy and Hard in both encounter routes. Ridiculous hides both visual lanes and preserves the full 800 ms warning phase. The lane starts under Iron Sepulchre and follows the existing locked path toward the player.
- Level 3 has two waves of 24 aliens each (4 × 6), with a 1.15 Wave 2 horizontal formation multiplier, gradual destruction-based acceleration, 55 px smooth descent on every distinct right-edge contact, and actual individual-formation-alien contact loss. It has one diver at a time, supply ship and pickups. Wave 2 leads to Zhur-Kai.
- Level 1 Wave 2 enters in about 1.9–2.2 seconds and settles into the 12 slots selected for that wave. Levels 2 and 3 still use the 1.5-second vertical slide for Wave 2. Their first waves start in their selected layouts. Players can move during entrances. Formation movement, firing, collisions and damage begin after the whole wave settles.
- Zhur-Kai has smooth randomized X/Y movement. Her **36 × 30 px** core is centered **19 px below** the body center, flush with the lower edge. The existing vulnerability cycle drives the animated lips and the rectangular projectile opening. The yellow interior marks the center of the target, and the decorative silhouette can overlap its corners. Shots can damage during opening, fully open and closing if they physically reach the target. Her twin streams and aimed burst retain their timing and aim lock. Movement is 15% faster at or below 25% HP.
- Player projectile hits each remove one life despite the preceding hit-flash interval. Temporary shields remain protective, and boss ram/contact cooldowns remain separate. The user confirmed the projectile-damage fix worked.
- The original boss dialogue was removed. Varnok's revised introduction is the game's first and only planned dialogue. Boss 1 retains its 0.8-second slide-in in normal progression. Boss 2 retains its 0.8-second slide-in in normal progression and Test Boss 2.
- In normal Level 3 progression, defeating Zhur-Kai clears her attacks and projectiles. Varnok slides down and fades in over about 1.5 seconds with his artwork animated. The rectangular neon panel reads “You thought you had won??? You will never defeat Varnok, Destroyer of Worlds!” Combat waits for **Fight** while Level 3 music continues. Remaining lives and total score carry over, including 10 points for the final hit and a separate 300-point defeat bonus.
- Defeating Varnok in normal progression clears combat and shows the combined Zhur-Kai and Varnok summary with their already-awarded 300-point bonuses, total score, lives, and **Continue**. Continue fades the panel out and the credits in. Zhur-Kai's defeat still goes directly to Varnok's reveal and dialogue. Standalone boss results remain separate.
- The credits MP3 reports **188.304 seconds** locally via `afinfo`. The full-height roll reaches the centred family thank-you at **171.804 seconds**. The thank-you holds for **5.5 seconds**, then fades as it scrolls above the top edge from **177.304 to 181.304 seconds**. Afterlight remains alone through the last **7 seconds** of music and for **5 more seconds** after the song ends. Healthy playback drives the roll from the media position and runtime duration, including while muted. Late metadata adjusts the remaining pace without jumping the current position. Playback failure or a stalled track switches to the timed finish from the current position, followed by the same five-second hold. Test Credits restarts the music and roll together and clears the hold timer.
- **Test Boss 4** still starts Varnok directly and ends at its standalone encounter-complete screen. **Test Boss 3** retains its standalone checkpoint. Varnok’s own dive and bomb barrage are no longer planned because the user considers his current difficulty sufficient.
- Varnok’s randomized X/Y boss-body movement uses a multiplier of **0.945 at every HP level**. His 200 × 110 px body has two 30 × 26 px eye hitboxes sharing **19 HP**, which supersedes 30 HP, 24 HP and the proposed 22 HP. Both encounter routes use 19 HP for the internal starting and maximum health. The 45 px passages follow a 2 s closed, 0.5 s opening, 3 s open and 0.5 s closing cycle. A successful eye hit deals 1 HP and awards 10 points. Defeat awards a separate 300-point bonus once.
- The initial batch is a random 4–8 aliens in a row, two-row block, V or inverted V. Launch begins after 2 seconds, at 0.3-second intervals. Each alien launches upward at 180 px/s, waits 0.5 seconds off-screen and returns at 180 px/s. The formation starts moving after the initial survivors settle. It moves independently of Varnok at 65 px/s and descends 55 px over 0.35 seconds on each distinct right-edge contact, limited by the bottom boundary.
- Settled aliens share one firing cadence, with a first shot after 0.9 seconds and 0.9–1.5 seconds between later shots. One alien at a time can dive and return. A settled alien must be above the player to start. A missed dive exits below and returns from above to a vacant formation slot.
- Reinforcements are due 15–20 seconds after each batch settles, even with earlier aliens alive. Each batch uses a different shape from its predecessor and takes 4–8 of the available places. The 12-alien cap counts every lifecycle state. Fewer than four available places trigger a 3-second retry. Incoming aliens use reserved slots in the moving formation, and surviving aliens keep their positions.
- During active **Test Boss 4** gameplay with Developer Mode enabled, **K** applies lethal damage through the same handler as an eye hit, even with closed eyes. Defeat clears the encounter’s aliens, projectiles and reinforcement scheduling. The shortcut awards 10 points for the hit and the 300-point defeat bonus once.

## Verification at this checkpoint

### User browser checks

- **Task 14 focused alien burst acceptance.** The user visually accepted the bursts for a Level 1 formation alien, a Level 2 diving alien and a settled Varnok hatchling in **Test Boss 4**. The report covers those three cases.
- **Task 14 focused supply-ship burst acceptance.** The user visually accepted the destruction burst in **Test Boss 2**. This report covers the design shown in that test.
- **Task 14 focused final-life acceptance.** The user visually accepted the final-life explosion, brief frozen scene and handoff to **Game over**.
- **Task 14 focused Level 1 checks.** The user accepted the small burst from a non-final unshielded hit and confirmed that gameplay continued normally. After the final-life explosion and **Game over**, **Restart** restored the ship, movement and firing with no leftover explosion fragments.
- The user accepted the overall menu, result panel and button appearance. The focused Test Boss 2 check below covers its Level 3 button. The later arcade button styling, panel seam, other next-level buttons and clear-screen copy still lack individual browser verification.
- **Task 12 focused background checks.** The user accepted background appearance and readability in these browser scenes.
  - The Veil in **How to Play** and ship selection.
  - Levels 1, 2 and 3 during brief gameplay.
  - **Test Boss 3** and **Test Boss 4** during the encounters.
  - **Test Credits**, including the background and scrolling text.
  - **Test Boss 1** encounter-complete screen, **Test Boss 2** clear screen and its **Level 3** button, and the Level 3 **Game over** screen.
- **Task 12 follow-up background checks.** The user also accepted background appearance and readability on these routes.
  - **Test Boss 1** and **Test Boss 2** fights, and the **Test Boss 3** and **Test Boss 4** encounter-complete screens.
  - Level 1 and Level 2 **Game over** screens.
  - Normal progression from **Start Game** through Level 1, Boss 1 and the Level 1 clear screen, then through Level 2, its boss and its clear screen.
  - Continuing into Level 3, Boss 3, Varnok's introduction and fight, and the combined ending panel.
  - **Continue** from the ending panel into credits, including the visual transition, credits background and scrolling-text readability.
- **Task 12 verification scope.** The focused checks establish background presentation and readability. Scoring, difficulty coverage, audio synchronization, reset-state correctness and broader gameplay regression are outside their scope.
- **Level 3 Restart check.** The user clicked **Restart** from the Level 3 **Game over** screen and confirmed that the panel disappeared, gameplay restarted, and the controls worked again. This check covered the panel and resumed play.
- The user verified Shield, Machinegun and Spread shot and later confirmed Spread hits on Varnok’s exposed eyes.
- The user reported Kestrel sharp at rest and blurry or stuttering in horizontal motion with banking both on and off. On the low-battery Mac, the measured browser animation-frame intervals were **33.30 ms median and 34.30 ms longest**. After connecting power, they were **8.30 ms median and 10.60 ms longest**. The user attributed the issue to power behavior and chose to move on. The exact OS or browser mechanism was not established. No further ship-rendering fix is requested.

- The user accepted these visuals in Safari at the session checkpoint:
  - Varnok’s integrated Rooted Crown artwork, breathing and hinged jaw, including the attached lower teeth and muted plum cheek tissue.
  - The **100 ms** damaging-hit flashes on all four bosses.
  - Color-matched shots for Level 1–3 aliens, Xal’Gorath’s spore spread and bomb pod, Zhur-Kai’s twin volleys and aimed burst, and Varnok’s minions.
  - Identical space crates for the shield and rapid-fire supply rewards.
  - Varnok’s crown hatch opening, minion emergence and closing. His minion shots pass behind the shell, and player shots remain visible over it.
  - Cyan machine-gun darts during rapid fire, yellow shots after expiry, and the retained appearance of shots already in flight.

- The user accepted Spore Choir’s appearance in a focused Boss 1 browser check. This check covered the artwork only.
- The user confirmed in the browser that Xal’Gorath’s cyan halo was removed and all four boss health bars were hidden. This feedback covered those visual changes only.
- The user confirmed in a focused Boss 2 browser check that the warning-lane clipping fix works and accepted Iron Sepulchre’s current appearance.
- The user accepted Zhur-Kai’s Crown Maw artwork and mouth animation in a focused visual check. Full gameplay and regression verification remain separate.
- The user accepted the in-game appearance of Kestrel and Vesper. They confirmed a supply ship spawned and displayed Vesper in **Test Boss 2** and subsequently accepted its appearance after the cyan rectangle was removed.
- **Supply-artwork browser checks.** The user reported that Kestrel supply looked correct with Vesper as the player ship and that Vesper supply looked correct with Kestrel or Bastion as the player ship. The supply-artwork task is complete. The checks cover appearance. Rewards, collisions, full spawn coverage, and unrelated gameplay fall outside this check.
- **Task 9 browser check.** The user confirmed the sound-effects control works. The visible labels now read **Sound effects: Off** and **Sound effects: On**, matching Music punctuation.
- **Task 10 approval and in-game check.** The user first approved all ten cues in the standalone preview, then confirmed that the integrated sound effects work in-game. Task 10 is complete.
- The user also previously observed the **Shield!** and **Machinegun!** pickup notifications in the browser. Coverage across every encounter route remains pending.
- The user accepted Clack’s appearance, Anvil’s appearance and dive/return turning, and Rift’s appearance and turning. The Rift report did not specify Wave 2. The user said Varnok’s hatchling visuals “looks good.” These are focused visual checks.
- Earlier checks covered formation movement and right-edge descent, shooting and projectile damage, loss-screen cleanup and fresh-run firing eligibility. The user observed diving, missed-dive return and continued formation activity. A shot-down diver awarded 10 points. Diver collision cost one life, consumed the diver and awarded no points. Random initial formations worked in the user’s trials, and reinforcements joined while earlier aliens remained.
- In earlier testing, the user defeated Varnok without the shortcut at **0.9** and accepted **0.945** as the current movement multiplier. The earlier **K** test showed the defeat screen, removed visible aliens and projectiles, and produced no reinforcements during an extended wait. From 0, the score became 310 and stayed there on a second press.
- **Earlier boss transition check.** The user saw Zhur-Kai’s defeat lead to Varnok, who became playable and summoned aliens. The user later accepted the revised animated reveal and rectangular dialogue panel after Zhur-Kai in normal progression. The latest acceptance covers the intro visuals and panel only.
- **User browser feedback on Wave 2.** The user liked the entrance in a focused visual check. The report did not specify which levels were checked.
- **User browser check at 19 HP.** The user beat Varnok in **Test Boss 4** and saw its expected standalone checkpoint. Before the ending changes in this checkpoint, the user saw credits followed by the now-removed eyeless portrait.
- **Ship-selection browser checks.** All three options appear, gameplay stays idle, reopening defaults to Kestrel, and a fresh run starts at 0 score and 3 lives. Vesper and Bastion look fine as player ships. In Level 2, Vesper uses Kestrel supply artwork and Bastion uses Vesper supply artwork. Bastion persists through life loss and Restart. Restart restores 0 score and 3 lives.
- **Music browser checks.** The buttons stayed synchronized, and music continued through How to Play and ship selection. With On saved in Chrome, refresh stayed silent until Start Game was clicked, and that click started music. The user confirmed uninterrupted menu-to-Level 1 playback, both level crossfades, and Level 2 music continuing on its clear summary. Muting on the Boss 1 clear screen and unmuting after entering Level 2 revealed the Level 2 track already in progress.

- **24 November focused ending checks.** Test Credits cleared an active Boss 2 fight and started credits. The user saw repeated Test Credits restart the crawl and also answered yes to the combined crawl/music restart question. The user confirmed the return to menu and accepted the approximately 115.3-second crawl.
- **24 November focused difficulty checks.** The user saw the difficulty choices, saw Hard in the Test Boss 2 HUD, and initially noticed little movement difference. The user confirmed Zhur-Kai's Ridiculous repeat patterns and the difficulty-specific warning-lane fix. The two-boss encounter “looks good” was a focused visual/play report.

### Agent source checks and simulations

- The supply artwork integration passed JavaScript syntax, SVG and local-reference checks, geometry comparison with the previous renderer and workshop, and a focused source comparison. The game was not opened in a browser.
- JavaScript syntax and diff whitespace checks and focused Node simulations are recorded in `DEVELOPMENT_LOG.md`. Earlier simulations covered the boss transition, both Varnok routes at 19 HP, credits and restart, Wave 2 entrances, and menu and music behavior with stubbed browser APIs.
- Earlier simulations covered supply-ship scheduling and drawing, shield geometry and protection, regular-alien turning, and hatchling variant persistence and gameplay RNG parity through both Varnok routes. Canvas and image events were stubbed.
- For Rooted Crown, syntax and source comparison checks passed. Canvas-stub checks matched the workshop tentacle outlines and checked the body anchor, eye clipping, and image fallback. The browser was not used for this integration.
- For the maw and plum palette revision, syntax and source checks verified the workshop asset references and matched the eye clipping, body placement and all eight tentacle paths to the earlier renderer.
- At the 22 November save, Node syntax checks passed for nine scripts, and the game and workshop links and all 16 embedded SVG sources matched. Focused stub checks passed for both Varnok launch routes and rapid-fire visuals, including expiry and resets. Git diff whitespace checks passed. There is no configured build step.
- At this local save, `git diff --check` passed. The session's reported syntax checks and simulations are recorded in `DEVELOPMENT_LOG.md`.

### Residual browser verification notes

- **Pickup voice regression coverage.** Immediate mute, interruption between pickups, failure fallback and full encounter coverage remain unconfirmed by the user’s listening check.
- **Hatchling regression coverage.** Full coverage of every hatchling variant, lifecycle state and encounter route remains unconfirmed after the focused acceptance check.
- **Sound effects regression coverage.** The user’s in-game check confirms the integration works. Individual cue and encounter coverage, mute independence, and persistence remain unconfirmed by that report.
- Task 1 is applied without explicit browser verification. The user chose to watch for supply-ship movement through wave entrances during later play.
- Check Double shot and its pickup text, weapon replacement and expiry, clearing on life loss, restart and level changes, and the new 10-second Shield expiry and fade.
- Check Iron Sepulchre and the warning-lane clip in normal Level 2 progression.
- Check the player’s lives and shield display when active, supply-ship spawning in remaining encounter routes, and the **50-point** reward. Kestrel’s firing alignment and hit flash remain pending.
- Check Rift’s Wave 2 entrance and full hatchling lifecycle and reinforcement visuals in both routes. The population cap, cleanup paths and all 20 count-and-shape combinations still lack full browser coverage.
- Verify Zhur-Kai’s crosshair removal, exact boss transition timing, scoring, lives carryover, Fight input handling, and shortcut restrictions. Check the combined summary's bonuses, score, lives and full-name layout. The final credits ending was accepted. Muted timing and audio fallback were exercised in Node, with no separate user browser confirmations for those paths.
- For ship selection, the Kestrel player and Vesper supply pairing, Back button, retention across level transitions, banking, firing alignment, and hit flashes lack specific browser verification. First-click developer music entry also remains pending.
- Verify the boss shot readout is absent in normal and standalone fights. Check exact movement ratios, difficulty persistence, other enemies' repeated attacks, repeat and encounter cleanup, scoring, collisions, and broader regressions.

## Difficulty implemented

- Ship selection offers Easy, Hard, and Ridiculous. Easy is the default on opening the menu or ship selection. The in-memory choice appears in the HUD and persists across lives, levels, and Restart. Developer tests use the current choice. Back resets to Easy.
- Hard starts at 1.15× base alien movement and Ridiculous at 1.20×. Ordinary-wave horizontal speed now also multiplies by `1 + eliminatedFraction × 0.55` on Hard or `1 + eliminatedFraction × 1.00` on Ridiculous. The extra speed factor resets each wave and stacks with the existing destruction bonus and Wave 2 multiplier. Hard Level 2 formations and Bosses 1–2 have the targeted speed adjustments recorded above. Hatchling and diver speeds retain their previous settings.
- Hard ordinary primary shots start at 700–1,100 ms apart and ramp toward 480–720 ms as the wave thins. The user accepted the targeted Hard pace in Boss 1, Level 2 ordinary waves and Boss 2.
- **Ridiculous playtest pending.** Ordinary primary shots start at 560–900 ms apart and ramp toward 360–550 ms. The existing repeat still follows after 150 ms, with a guard that keeps the next primary at least 150 ms after the repeat if a frame runs late. Check that the faster end-of-wave pressure remains avoidable.
- Ridiculous also repeats eligible hatchling shots, Xal’Gorath's wide shot and spread, and Zhur-Kai's complete aimed burst and twin streams. Repeats begin 150 ms after the original's final shot, preserve cadence and aim lock, and cancel on shooter or encounter exit or life loss. The approved last twin-stream pair can fire 50 ms after armor closes. A shield absorption alone keeps a repeat scheduled. Boss firing retains its existing settings apart from the Hard Boss 1 timing changes above.
- Ridiculous starts two independent 20-HP Lord Kaezar Vhul bosses in normal and Test Boss 2. Split patrol lanes and alternating ownership keep warning, charge, and retreat sequential. Each damaging hit awards 10 points and each boss gives 200 once. The first defeat leaves the survivor active. After both defeats, the existing Level 2 clear panel displays 400 bonus points and offers Level 3 in both routes. Easy and Hard retain one boss and a 200-point bonus.

## Next session — independent local-model reviews

Give the locally installed Qwen and Gemma the same snapshot of the actual current project code and requirements in separate sessions. Ask each for up to 10 substantiated security flaws and up to 10 substantiated bugs relevant to this browser game, with code locations, impact, reasoning and verification steps. Fewer findings are welcome when warranted. Keep the prompts and results independent until both reviews finish. Then deduplicate, verify and prioritize the combined findings for the final checklist. Record exact model identifiers and settings where known, prompts and responses, and which findings were accepted or rejected and why. The final reviews have not run. The local-model credit stays provisional until they do.

## Tool and model notes

- The user reported the earlier VS Code Codex label as “Luna6-medium.” After purchasing a subscription, the user saw “GPT-6.2 Sol” and could no longer select the earlier model. These are reported UI labels. The switch has no established effect on implementation quality.
- Perplexity discussions use Best/automatic selection. The underlying model is unspecified.

## Workshop provenance

- The game loads the approved supply SVGs directly from `supply-ship-workshop/level-flight/assets/`. The standalone preview and its `Tools-and-prompt-log.md` remain intact.
- Perplexity Computer’s `ship-workshop/` contains Kestrel, Vesper and Bastion. `alien-workshop/Alien Art Workshop (complete ZIP)/` contains the three level designs, three hatchlings, turning previews and `Tools-and-prompt-log.md`. The workshop motion paths are demonstrations and stay separate from the game.
- `boss-workshop/Xal’Gorath Boss Art Workshop/` contains Spore Choir, Iron Sepulchre, Crown Maw and the original `Tools-and-prompt-log.md`. The game loads Spore Choir and Iron Sepulchre directly from the workshop’s `assets/` directory.
- `assets/bosses/` holds the adapted Crown Maw body, mouth interior and lower jaw SVGs. The original workshop SVG and provenance log remain in the workshop folder.
- The accepted offline Varnok revision is under `finalboss-workshop/Varnok Artwork Workshop (complete ZIP)/`. Its `Tools-and-prompt-log.md` records the approval, and `artwork.js` embeds the SVGs for direct file opening. The original workshop and its provenance are preserved under `finalboss-workshop/Varnok Artwork Workshop/` and in `finalboss-workshop/Varnok Artwork Workshop  Tools and Prompt Log.md`.
- Keep the workshop source and provenance with the artwork. Record tools, prompts, outputs and user decisions. Record exact model and reasoning settings only when known.

## Working and verification preferences

- Implement one small gameplay step at a time. The user manually tests in the browser. Do not run browser tests unless specifically authorized.
- Keep code checks, simulations, user-reported checks and unverified behavior distinct. No broad regression or acceptance should be inferred from a focused check.
- Preserve accepted bosses and unrelated work. Prioritize gameplay, progression, scoring and win/loss behavior; defer cosmetics.
- Commit or push only on direct request. This checkpoint is a local save.

## Historical context

The prototype demonstration and Moodle submission were reported by the user on 15 November 2026; details and earlier user-reported checks remain in `DEVELOPMENT_LOG.md`. Level 1 is accepted as-is. The current status above supersedes older planning notes that describe Levels 2–3 or their bosses as unimplemented.
