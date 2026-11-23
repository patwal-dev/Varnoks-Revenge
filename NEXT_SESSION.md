# Next Session Handover

## Artwork and supply ships

- Kestrel’s artwork is centered at about **38.67 × 34 px** at rest within the **42 × 34 px** hitbox. The user accepted the bank at **84%** of full width. Separate wing-shading masks fix the mirrored-mask mismatch.
- Vesper draws at its precise position after removal of the pixel-snapping trial. Its rotated artwork is **49.5 × 46.306452 px** and its shot hitbox is **52.8 × 46.306452 px**. The planned level flight orientation still needs implementation.
- Vesper appears during Level 2 and 3 waves and Bosses 2–4, including standalone tests. The shared **7–15 second** spawn countdown pauses during intros and wave entrances. An already-flying ship continues through the wave entrance. Destroying it awards **50 points** and drops one identical crate containing Shield, Machinegun, Double shot or Spread shot with equal odds.
- The shield retains two charges and its **54 × 50 px** and **74 × 66 px** rings. It now expires after **10 seconds** with a **two-second** fade. A new Shield pickup refreshes the timer. Protection already granted by an absorbed hit keeps its original end time.
- A new weapon replaces the current one for **10 seconds**. Losing a life clears the active weapon, including Machinegun. Shield is independent of the weapon slot. Notifications are **Shield!**, **Machinegun!**, **Double shot!** and **Spread shot!**. Each volley can damage the same boss once, including across both of Varnok’s eyes.
- Clack (Level 1), Anvil (Level 2), Rift (Level 3) and Varnok’s Bud, Hook and Crown hatchlings are integrated. Level 2 and 3 regular aliens and hatchlings turn visually in flight while gameplay geometry stays the same. Hatchlings get one variant at creation from a separate visual random source and keep it through launch, offscreen wait, return, formation, dives and slot changes.

## Boss artwork decisions

- **Boss 1, Xal’Gorath.** The user visually accepted Spore Choir. It is integrated at a centered **112 × 58 px** in normal progression and **Test Boss 1**.
- **Boss 2, Lord Kaezar Vhul.** The user visually accepted Iron Sepulchre and the corrected warning-lane clipping. The artwork is integrated at a centered **132 × 68 px** in normal Level 2 progression and **Test Boss 2**. The existing **76.56 × 42.16 px** shot and ram collision footprint stays centered within the body.
- **Boss 3, Zhur-Kai.** The user visually accepted Crown Maw’s current artwork and mouth animation. Preserve the compact pointed closed jaw, the dropping lower jaw that reveals the recessed yellow target, and the twin firing organs.
- **Boss 4, Varnok.** The user visually approved the integrated Rooted Crown animation in Safari. Normal progression and **Test Boss 4** use the same **200 × 110 px** artwork with downward amber slit eyes, normal-strength cheek breathing, a hinged lower jaw with attached fangs, and eight sweeping dark plum tentacles. The eyelids still use the existing vulnerability progress.

## Current implementation

- All four bosses keep their HP internal in normal progression and standalone tests. The player sees no boss health bar, HP number, percentage or replacement indicator.
- Xal’Gorath’s visible cyan charge halo was removed in both encounter routes, superseding the earlier requirement to preserve it. His internal charge timing and spread shots still use the existing code.
- The project is a single-player HTML/CSS/vanilla JavaScript Canvas game with all three gameplay levels implemented. Level 1 has two waves followed by Xal’Gorath, a separate 100-point defeat bonus, and a paused clear screen before Level 2.
- The game opens at an idle Space Shooter menu. **Start Game** uses the existing reset for Level 1 with 3 lives and 0 score. **How to Play** lists the movement, firing and objective, with a Back button. Developer Mode tools remain in a separate panel.
- The Developer testing panel retains its level and boss buttons. Task 20 will also remove the forced supply reward buttons, boss-shot readout, **Bank effect** checkbox, and **Measure Canvas** button and readout.
- Neon styling covers the start menu, clear screens, Victory, Game over, and standalone boss-test results. The next-level buttons sit inside the clear panels. Game over uses the existing Restart action, with keyboard focus on the button in the panel.
- **Music On/Off** is available inside the central menu below How to Play and in the header during gameplay. Both buttons share one preference and one quiet Web Audio placeholder loop. Music defaults to Off, remembers the setting when local storage is available, and starts after a user clicks a button with music enabled. Turning music off stops the loop.
- The user renamed `BRR-Music/` to `backstageriot/` and created the seven tracks in Suno. The assignments are recorded in Task 8 of `TODO.md`. In-game track integration is pending. [Backstage Riot on Suno](https://suno.com/@backstageriot)
- Level 2 has two regular waves of 18 aliens each (3 × 6), followed by Lord Kaezar Vhul. His warning-lane, locked-path ram and smooth retreat remain in place. The forward charge speed is 616 px/s. His separate defeat bonus is 200 points. Defeat leads to a paused Level 2 clear screen and Level 3 button.
- Boss 2’s warning lane is clipped below and ahead of his moving center in both encounter routes. The lane starts under Iron Sepulchre and follows the existing locked path toward the player.
- Level 3 has two waves of 24 aliens each (4 × 6), with a 1.15 Wave 2 horizontal formation multiplier, gradual destruction-based acceleration, 55 px smooth descent on every distinct right-edge contact, and actual individual-formation-alien contact loss. It has one diver at a time, supply ship and pickups. Wave 2 leads to Zhur-Kai.
- Wave 2 slides in from above over about 1.5 seconds in Levels 1–3. Player movement stays available, and the formation's movement, collision and attack timers start when it settles.
- Zhur-Kai has smooth randomized X/Y movement. Her **36 × 30 px** core is centered **19 px below** the body center, flush with the lower edge. The existing vulnerability cycle drives the animated lips and the rectangular projectile opening. The yellow interior marks the center of the target, and the decorative silhouette can overlap its corners. Shots can damage during opening, fully open and closing if they physically reach the target. Her twin streams and aimed burst retain their timing and aim lock. Movement is 15% faster at or below 25% HP.
- Player projectile hits each remove one life despite the preceding hit-flash interval. Temporary shields remain protective, and boss ram/contact cooldowns remain separate. The user confirmed the projectile-damage fix worked.
- All boss dialogue was removed. The user reported that Task 2 works. Boss 1 retains its 0.8-second slide-in in normal progression. Boss 2 retains its 0.8-second slide-in in normal progression and Test Boss 2.
- In normal Level 3 progression, defeating Zhur-Kai clears her attacks and projectiles. Varnok appears and his artwork animates during a 1-second silent pause before combat starts automatically. Remaining lives and total score carry over, including 10 points for the final hit and a separate 300-point defeat bonus.
- Defeating Varnok in normal Level 3 clears combat and starts placeholder rolling credits. The credits lead to a static victory screen with the final score and Restart, which starts a fresh Level 1 run. Task 17 still calls for one combined Zhur-Kai and Varnok summary after Varnok, showing bonuses, score and lives, with Continue fading into the credits. Normal progression has no separate summary after Zhur-Kai.
- **Test Boss 4** still starts Varnok directly and ends at its standalone encounter-complete screen. **Test Boss 3** retains its standalone checkpoint. Varnok’s own dive and bomb barrage are no longer planned because the user considers his current difficulty sufficient.
- Varnok’s randomized X/Y boss-body movement uses a multiplier of **0.945 at every HP level**. His 200 × 110 px body has two 30 × 26 px eye hitboxes sharing **19 HP**, which supersedes 30 HP, 24 HP and the proposed 22 HP. Both encounter routes use 19 HP for the internal starting and maximum health. The 45 px passages follow a 2 s closed, 0.5 s opening, 3 s open and 0.5 s closing cycle. A successful eye hit deals 1 HP and awards 10 points. Defeat awards a separate 300-point bonus once.
- The initial batch is a random 4–8 aliens in a row, two-row block, V or inverted V. Launch begins after 2 seconds, at 0.3-second intervals. Each alien launches upward at 180 px/s, waits 0.5 seconds off-screen and returns at 180 px/s. The formation starts moving after the initial survivors settle. It moves independently of Varnok at 65 px/s and descends 55 px over 0.35 seconds on each distinct right-edge contact, limited by the bottom boundary.
- Settled aliens share one firing cadence, with a first shot after 0.9 seconds and 0.9–1.5 seconds between later shots. One alien at a time can dive and return. A settled alien must be above the player to start. A missed dive exits below and returns from above to a vacant formation slot.
- Reinforcements are due 15–20 seconds after each batch settles, even with earlier aliens alive. Each batch uses a different shape from its predecessor and takes 4–8 of the available places. The 12-alien cap counts every lifecycle state. Fewer than four available places trigger a 3-second retry. Incoming aliens use reserved slots in the moving formation, and surviving aliens keep their positions.
- During active **Test Boss 4** gameplay with Developer Mode enabled, **K** applies lethal damage through the same handler as an eye hit, even with closed eyes. Defeat clears the encounter’s aliens, projectiles and reinforcement scheduling. The shortcut awards 10 points for the hit and the 300-point defeat bonus once.

## Verification at this checkpoint

### User browser checks

- The user accepted the overall menu, result panel and button appearance. The later arcade button styling, panel seam, in-panel next-level buttons and clear-screen copy lack individual browser verification.
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
- The user also previously observed the **Shield!** and **Machinegun!** pickup notifications in the browser. Coverage across every encounter route remains pending.
- The user accepted Clack’s appearance, Anvil’s appearance and dive/return turning, and Rift’s appearance and turning. The Rift report did not specify Wave 2. The user said Varnok’s hatchling visuals “looks good.” These are focused visual checks.
- Earlier checks covered formation movement and right-edge descent, shooting and projectile damage, loss-screen cleanup and fresh-run firing eligibility. The user observed diving, missed-dive return and continued formation activity. A shot-down diver awarded 10 points. Diver collision cost one life, consumed the diver and awarded no points. Random initial formations worked in the user’s trials, and reinforcements joined while earlier aliens remained.
- In earlier testing, the user defeated Varnok without the shortcut at **0.9** and accepted **0.945** as the current movement multiplier. The earlier **K** test showed the defeat screen, removed visible aliens and projectiles, and produced no reinforcements during an extended wait. From 0, the score became 310 and stayed there on a second press.
- **User browser check of the boss transition.** The user saw Zhur-Kai’s defeat lead to Varnok, who became playable and summoned aliens. Exact timing, scoring, lives carryover and shortcut restrictions still need individual browser checks.
- **User browser feedback on Wave 2.** The user liked the entrance in a focused visual check. The report did not specify which levels were checked.
- **User browser check at 19 HP.** The user beat Varnok in **Test Boss 4** and saw its expected standalone checkpoint. That route ends at the checkpoint by design. Normal-progression credits still need a browser check.
- **User screenshot.** The main menu was visible with the original header-only music control. The later central-menu button, synchronization between the two buttons, and audible playback remain pending browser checks.

### Agent source checks and simulations

- JavaScript syntax and diff whitespace checks and focused Node simulations are recorded in `DEVELOPMENT_LOG.md`. Earlier simulations covered the boss transition, both Varnok routes at 19 HP, credits and restart, Wave 2 entrances, and menu and music behavior with stubbed browser APIs.
- Earlier simulations covered supply-ship scheduling and drawing, shield geometry and protection, regular-alien turning, and hatchling variant persistence and gameplay RNG parity through both Varnok routes. Canvas and image events were stubbed.
- For Rooted Crown, syntax and source comparison checks passed. Canvas-stub checks matched the workshop tentacle outlines and checked the body anchor, eye clipping, and image fallback. The browser was not used for this integration.
- For the maw and plum palette revision, syntax and source checks verified the workshop asset references and matched the eye clipping, body placement and all eight tentacle paths to the earlier renderer.
- At the 22 November save, Node syntax checks passed for nine scripts, and the game and workshop links and all 16 embedded SVG sources matched. Focused stub checks passed for both Varnok launch routes and rapid-fire visuals, including expiry and resets. Git diff whitespace checks passed. There is no configured build step.

### Pending browser checks

- Tasks 1 and 3 are applied without explicit browser verification. The user chose to watch for Vesper’s movement through wave entrances and Game over Restart during later play.
- Check Double shot and its pickup text, weapon replacement and expiry, clearing on life loss, restart and level changes, and the new 10-second Shield expiry and fade.
- Check Iron Sepulchre and the warning-lane clip in normal Level 2 progression.
- Check the player’s lives and shield display when active, supply-ship spawning in remaining encounter routes, and the **50-point** reward. Kestrel’s firing alignment and hit flash remain pending.
- Check Rift’s Wave 2 entrance and full hatchling lifecycle and reinforcement visuals in both routes. The population cap, cleanup paths and all 20 count-and-shape combinations still lack full browser coverage.
- Verify Zhur-Kai’s crosshair removal, the exact boss transition timing, scoring, lives carryover and shortcut restrictions. Verify the normal Level 3 ending from Varnok’s defeat through cleanup, credits, final score and Restart. The credits wording remains placeholder text.
- Check the central-menu and header music controls for synchronized labels and audible playback.

## Next session

- Briefly check the outstanding weapon and Shield behavior in the browser, then continue `TODO.md` in order, one task at a time. Record the checks actually observed.
- Supply-ship rewards are the upgrade system. A separate between-level upgrade-choice screen requires a new request.
- Future menu difficulty choices are **Easy**, **Hard**, and **Ridiculous**. The user has yet to agree on tuning, and the difficulty menu remains unimplemented.

## Tool and model notes

- The user reported the earlier VS Code Codex label as “Luna6-medium.” After purchasing a subscription, the user saw “GPT-6.2 Sol” and could no longer select the earlier model. These are reported UI labels. The switch has no established effect on implementation quality.
- Perplexity discussions use Best/automatic selection. The underlying model is unspecified.

## Workshop provenance

- Perplexity Computer’s `ship-workshop/` contains Kestrel, Vesper and the unselected Bastion. `alien-workshop/Alien Art Workshop (complete ZIP)/` contains the three level designs, three hatchlings, turning previews and `Tools-and-prompt-log.md`. The workshop motion paths are demonstrations and stay separate from the game.
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
