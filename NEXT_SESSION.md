# Next Session Handover

## Artwork and supply ships

- Kestrel is the player ship, centered at about **38.67 × 34 px** within the existing **42 × 34 px** player hitbox. Vesper is the supply ship. Its artwork is **49.5 × 46.306452 px** after rotation, and its shot hitbox is **52.8 × 46.306452 px**. The cyan supply-ship debug rectangle was removed.
- Supply ships are implemented during Level 2 and 3 waves and Bosses 2–4, including standalone developer tests. The shared initial and repeat delay is **7–15 seconds** of active combat. Intros and wave entrances pause the countdown. The existing reward is **50 points** and a shield or rapid-fire pickup.
- Player shield rings now measure **54 × 50 px** and **74 × 66 px**. Shield protection and the player hitbox retain their existing behavior. Pickup notifications display exactly **Machinegun!** and **Shield!**.
- Clack (Level 1), Anvil (Level 2), Rift (Level 3) and Varnok’s Bud, Hook and Crown hatchlings are integrated. Level 2 and 3 regular aliens and hatchlings turn visually in flight while gameplay geometry stays the same. Hatchlings get one variant at creation from a separate visual random source and keep it through launch, offscreen wait, return, formation, dives and slot changes.

## Current implementation

- The project is a single-player HTML/CSS/vanilla JavaScript Canvas game. Level 1 remains accepted as-is: two waves, then Xal’Gorath, a separate 100-point defeat bonus, and a paused clear screen before Level 2. Preserve the accepted gameplay.
- The game opens at an idle Space Shooter menu. **Start Game** uses the existing reset for Level 1 with 3 lives and 0 score. **How to Play** lists the movement, firing and objective, with a Back button. Developer Mode tools remain in a separate panel.
- **Music On/Off** is available inside the central menu below How to Play and in the header during gameplay. Both buttons share one preference and one quiet Web Audio placeholder loop. Music defaults to Off, remembers the setting when local storage is available, and starts after a user clicks a button with music enabled. Turning music off stops the loop.
- Level 2 has two regular waves of 18 aliens each (3 × 6), followed by Lord Kaezar Vhul. The supply ship drops shield or rapid-fire pickups. Kaezar’s accepted warning-lane, locked-path ram and smooth retreat remain in place; the forward charge speed is 616 px/s. His separate defeat bonus is 200 points. Defeat leads to a paused Level 2 clear screen and Level 3 button.
- Level 3 has two waves of 24 aliens each (4 × 6), with a 1.15 Wave 2 horizontal formation multiplier, gradual destruction-based acceleration, 55 px smooth descent on every distinct right-edge contact, and actual individual-formation-alien contact loss. It has one diver at a time, supply ship and pickups. Wave 2 leads to Zhur-Kai.
- Wave 2 slides in from above over about 1.5 seconds in Levels 1–3. Player movement stays available, and the formation's movement, collision and attack timers start when it settles.
- Zhur-Kai is accepted for now; later balancing may happen. She has smooth randomized X/Y movement, smooth opening/closing armour and core damage only when shots physically pass the animated gap. Shots can damage during opening, fully open and closing when unobstructed. Her twin streams and aimed burst retain their timing and aim lock. The cyan targeting crosshair was removed. Movement is 15% faster at or below 25% HP. The invisible-body projectile-blocking bug was fixed. The temporary diagnostic text and hit counter were removed; developer collision outlines remain.
- Player projectile hits each remove one life despite the preceding hit-flash interval. Temporary shields remain protective, and boss ram/contact cooldowns remain separate. The user confirmed the projectile-damage fix worked.
- In normal Level 3 progression, defeating Zhur-Kai clears her attacks and projectiles, then shows Varnok’s threat in the existing speech bubble for 4.5 seconds. Combat is paused during the threat, and Varnok’s fight starts automatically. Remaining lives and total score carry over, including 10 points for the final hit and a separate 300-point defeat bonus.
- Defeating Varnok in normal Level 3 clears combat and starts placeholder rolling credits. The credits lead to a static victory screen with the final score and Restart, which starts a fresh Level 1 run.
- **Test Boss 4** still starts Varnok directly and ends at its standalone encounter-complete screen. **Test Boss 3** retains its standalone checkpoint. Varnok’s own dive and bomb barrage are no longer planned because the user considers his current difficulty sufficient.
- Varnok’s randomized X/Y boss-body movement uses a multiplier of **0.945 at every HP level**. His 200 × 110 px body has two 30 × 26 px eye hitboxes sharing **19 HP**, which supersedes 30 HP, 24 HP and the proposed 22 HP. Both encounter routes use 19 HP for the starting health and health bar maximum. The 45 px passages follow a 2 s closed, 0.5 s opening, 3 s open and 0.5 s closing cycle. A successful eye hit deals 1 HP and awards 10 points. Defeat awards a separate 300-point bonus once.
- The initial batch is a random 4–8 aliens in a row, two-row block, V or inverted V. Launch begins after 2 seconds, at 0.3-second intervals. Each alien launches upward at 180 px/s, waits 0.5 seconds off-screen and returns at 180 px/s. The formation starts moving after the initial survivors settle. It moves independently of Varnok at 65 px/s and descends 55 px over 0.35 seconds on each distinct right-edge contact, limited by the bottom boundary.
- Settled aliens share one firing cadence, with a first shot after 0.9 seconds and 0.9–1.5 seconds between later shots. One alien at a time can dive and return. A settled alien must be above the player to start. A missed dive exits below and returns from above to a vacant formation slot.
- Reinforcements are due 15–20 seconds after each batch settles, even with earlier aliens alive. Each batch uses a different shape from its predecessor and takes 4–8 of the available places. The 12-alien cap counts every lifecycle state. Fewer than four available places trigger a 3-second retry. Incoming aliens use reserved slots in the moving formation, and surviving aliens keep their positions.
- During active **Test Boss 4** gameplay with Developer Mode enabled, **K** applies lethal damage through the same handler as an eye hit, even with closed eyes. Defeat clears the encounter’s aliens, projectiles and reinforcement scheduling. The shortcut awards 10 points for the hit and the 300-point defeat bonus once.

## Verification at this checkpoint

### User browser checks

- The user accepted the in-game appearance of Kestrel and Vesper. They confirmed a supply ship spawned and displayed Vesper in **Test Boss 2** and subsequently accepted its appearance after the cyan rectangle was removed.
- The user accepted Clack’s appearance, Anvil’s appearance and dive/return turning, and Rift’s appearance and turning. The Rift report did not specify Wave 2. The user said Varnok’s hatchling visuals “looks good.” These are focused visual checks.
- Earlier checks covered formation movement and right-edge descent, shooting and projectile damage, loss-screen cleanup and fresh-run firing eligibility. The user observed diving, missed-dive return and continued formation activity. A shot-down diver awarded 10 points. Diver collision cost one life, consumed the diver and awarded no points. Random initial formations worked in the user’s trials, and reinforcements joined while earlier aliens remained.
- In earlier testing, the user defeated Varnok without the shortcut at **0.9** and accepted **0.945** as the current movement multiplier. The earlier **K** test showed the defeat screen, removed visible aliens and projectiles, and produced no reinforcements during an extended wait. From 0, the score became 310 and stayed there on a second press.
- **User browser check of the boss transition.** The user saw Zhur-Kai’s defeat lead to Varnok, who became playable and summoned aliens. Exact timing, scoring, lives carryover and shortcut restrictions still need individual browser checks.
- **User browser feedback on Wave 2.** The user liked the entrance in a focused visual check. The report did not specify which levels were checked.
- **User browser check at 19 HP.** The user beat Varnok in **Test Boss 4** and saw its expected standalone checkpoint. That route ends at the checkpoint by design. Normal-progression credits still need a browser check.
- **User screenshot.** The main menu was visible with the original header-only music control. The later central-menu button, synchronization between the two buttons, and audible playback remain pending browser checks.

### Agent source checks and simulations

- JavaScript syntax and diff whitespace checks and focused Node simulations are recorded in `DEVELOPMENT_LOG.md`. Earlier simulations covered the boss transition, both Varnok routes at 19 HP, credits and restart, Wave 2 entrances, and menu and music behavior with stubbed browser APIs.
- This session’s simulations covered supply-ship scheduling and drawing, shield geometry and protection, regular-alien turning, and hatchling variant persistence and gameplay RNG parity through both Varnok routes. Canvas and image events were stubbed.

### Pending browser checks

- Check supply-ship spawning in the remaining encounter routes, the **50-point** reward and pickup drops, rapid-fire and shield effects, both notification labels, and the shield rings as charges are spent. Kestrel’s firing alignment and hit flash remain pending.
- Check Rift’s Wave 2 entrance and full hatchling lifecycle and reinforcement visuals in both routes. The population cap, cleanup paths and all 20 count-and-shape combinations still lack full browser coverage.
- Verify Zhur-Kai’s crosshair removal, the exact boss transition timing, scoring, lives carryover and shortcut restrictions. Verify the normal Level 3 ending from Varnok’s defeat through cleanup, credits, final score and Restart. The credits wording remains placeholder text.
- Check the central-menu and header music controls for synchronized labels and audible playback.

## Next session

- Begin the Xal’Gorath concept workshop in Perplexity Computer. The prompt was prepared in this conversation. Its execution has yet to be confirmed.
- Create three alternatives with centered **112 × 58 px** artwork, a downward-facing pose, a bottom-center firing point and the existing cyan charge halo kept separate.
- Review enlarged and actual-size concepts with the user before integration. All four bosses still need new artwork. Continue one scoped implementation and user browser test at a time.

## Tool and model notes

- The user reported the earlier VS Code Codex label as “Luna6-medium.” After purchasing a subscription, the user saw “GPT-6.2 Sol” and could no longer select the earlier model. These are reported UI labels. The switch has no established effect on implementation quality.
- Perplexity discussions use Best/automatic selection. The underlying model is unspecified.

## Workshop provenance

- Perplexity Computer’s `ship-workshop/` contains Kestrel, Vesper and the unselected Bastion. `alien-workshop/Alien Art Workshop (complete ZIP)/` contains the three level designs, three hatchlings, turning previews and `Tools-and-prompt-log.md`. The workshop motion paths are demonstrations and stay separate from the game.
- Keep the workshop source and provenance with the artwork. Record tools, prompts, outputs and user decisions. Record exact model and reasoning settings only when known.

## Working and verification preferences

- Implement one small gameplay step at a time. The user manually tests in the browser. Do not run browser tests unless specifically authorized.
- Keep code checks, simulations, user-reported checks and unverified behavior distinct. No broad regression or acceptance should be inferred from a focused check.
- Preserve accepted bosses and unrelated work. Prioritize gameplay, progression, scoring and win/loss behavior; defer cosmetics.
- Commit or push only on direct request. This checkpoint is a local save.

## Historical context

The prototype demonstration and Moodle submission were reported by the user on 15 November 2026; details and earlier user-reported checks remain in `DEVELOPMENT_LOG.md`. Level 1 is accepted as-is. The current status above supersedes older planning notes that describe Levels 2–3 or their bosses as unimplemented.
