# Next Session Handover

## Current implementation

- The project is a single-player HTML/CSS/vanilla JavaScript Canvas game. Level 1 remains accepted as-is: two waves, then Xal’Gorath, a separate 100-point defeat bonus, and a paused clear screen before Level 2. Preserve the accepted gameplay.
- Level 2 has two regular waves of 18 aliens each (3 × 6), followed by Lord Kaezar Vhul. The supply ship drops shield or rapid-fire pickups. Kaezar’s accepted warning-lane, locked-path ram and smooth retreat remain in place; the forward charge speed is 616 px/s. His separate defeat bonus is 200 points. Defeat leads to a paused Level 2 clear screen and Level 3 button.
- Level 3 has two waves of 24 aliens each (4 × 6), with a 1.15 Wave 2 horizontal formation multiplier, gradual destruction-based acceleration, 55 px smooth descent on every distinct right-edge contact, and actual individual-formation-alien contact loss. It has one diver at a time, supply ship and pickups. Wave 2 leads to Zhur-Kai.
- Zhur-Kai is accepted for now; later balancing may happen. She has smooth randomized X/Y movement, smooth opening/closing armour and core damage only when shots physically pass the animated gap. Shots can damage during opening, fully open and closing when unobstructed. Her attacks are twin streams and a telegraphed aimed burst. Movement is 15% faster at or below 25% HP. The invisible-body projectile-blocking bug was fixed. The temporary diagnostic text and hit counter were removed; developer collision outlines remain.
- Player projectile hits each remove one life despite the preceding hit-flash interval. Temporary shields remain protective, and boss ram/contact cooldowns remain separate. The user confirmed the projectile-damage fix worked.
- Varnok is accessible through developer-only **Test Boss 4**. Normal progression ends at Zhur-Kai’s temporary checkpoint, and Varnok’s defeat shows the temporary encounter-complete screen. His own dive, bomb barrage, progression connection and final victory are still planned.
- Varnok’s randomized X/Y boss-body movement uses a multiplier of **0.945 at every HP level**, accepted by the user for now. His 200 × 110 px body has two 30 × 26 px eye hitboxes sharing 30 HP. The 45 px passages follow a 2 s closed, 0.5 s opening, 3 s open and 0.5 s closing cycle. A successful eye hit deals 1 HP and awards 10 points. Defeat awards a separate 300-point bonus once.
- The initial batch is a random 4–8 aliens in a row, two-row block, V or inverted V. Launch begins after 2 seconds, at 0.3-second intervals. Each alien launches upward at 180 px/s, waits 0.5 seconds off-screen and returns at 180 px/s. The formation starts moving after the initial survivors settle. It moves independently of Varnok at 65 px/s and descends 55 px over 0.35 seconds on each distinct right-edge contact, limited by the bottom boundary.
- Settled aliens share one firing cadence, with a first shot after 0.9 seconds and 0.9–1.5 seconds between later shots. One alien at a time can dive and return. A settled alien must be above the player to start. A missed dive exits below and returns from above to a vacant formation slot.
- Reinforcements are due 15–20 seconds after each batch settles, even with earlier aliens alive. Each batch uses a different shape from its predecessor and takes 4–8 of the available places. The 12-alien cap counts every lifecycle state. Fewer than four available places trigger a 3-second retry. Incoming aliens use reserved slots in the moving formation, and surviving aliens keep their positions.
- During active **Test Boss 4** gameplay with Developer Mode enabled, **K** applies lethal damage through the same handler as an eye hit, even with closed eyes. Defeat clears the encounter’s aliens, projectiles and reinforcement scheduling. The shortcut awards 10 points for the hit and the 300-point defeat bonus once.

## Verification at this checkpoint

- **User browser checks.** Formation movement and right-edge descent, shooting and projectile damage, loss-screen cleanup and fresh-run firing eligibility worked. The user observed diving, missed-dive return and continued formation activity. A shot-down diver awarded 10 points. Diver collision cost one life, consumed the diver and awarded no points. Random initial formations worked in the user’s trials, and reinforcements joined while earlier aliens remained.
- The user defeated Varnok normally at **0.9** and accepted **0.945** as the current difficulty. A normal victory at 0.945 has not been reported. The **K** test showed the defeat screen, removed visible aliens and projectiles, and produced no reinforcements during an extended wait. From 0, the score became 310 and stayed there on a second press.
- **Agent checks.** Static syntax and whitespace checks and focused Node simulations are recorded separately in `DEVELOPMENT_LOG.md`. Browser coverage for shield interaction, the population cap, every cleanup path and all 20 count-and-shape combinations remains unverified.

## Next session

Review the saved checkpoint with the user and agree on one small gameplay task before editing. Preserve the accepted balance and the other bosses. Discuss Varnok’s remaining attacks and any progression connection before choosing settings or implementing either.

## Tool and model notes

- The user reported the earlier VS Code Codex label as “Luna6-medium.” After purchasing a subscription, the user saw “GPT-6.2 Sol” and could no longer select the earlier model. These are reported UI labels. The switch has no established effect on implementation quality.
- Perplexity discussions use Best/automatic selection. The underlying model is unspecified.

## Graphics workshop direction

- Finish gameplay first. Use Perplexity Computer as a separate visual workshop, starting with player-ship concepts enlarged and at in-game size.
- Get the user’s approval before broader redesign. Keep experiments outside the working game.
- Integrate approved art incrementally while preserving gameplay and hitboxes. Prepare separate animated body, eye and mouth parts where needed.
- Record tools, prompts, outputs and user decisions. Record the exact Codex model/reasoning only if known. Perplexity uses Best/automatic selection; do not attribute its discussions to a specific model.

## Working and verification preferences

- Implement one small gameplay step at a time. The user manually tests in the browser. Do not run browser tests unless specifically authorized.
- Keep code checks, simulations, user-reported checks and unverified behavior distinct. No broad regression or acceptance should be inferred from a focused check.
- Preserve accepted bosses and unrelated work. Prioritize gameplay, progression, scoring and win/loss behavior; defer cosmetics.
- Commit or push only on direct request. This checkpoint is a local save.

## Historical context

The prototype demonstration and Moodle submission were reported by the user on 15 November 2026; details and earlier user-reported checks remain in `DEVELOPMENT_LOG.md`. Level 1 is accepted as-is. The current status above supersedes older planning notes that describe Levels 2–3 or their bosses as unimplemented.
