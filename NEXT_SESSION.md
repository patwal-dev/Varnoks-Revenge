# Next Session Handover

## Current implementation

- The project is a single-player HTML/CSS/vanilla JavaScript Canvas game. Level 1 remains accepted as-is: two waves, then Xal’Gorath, a separate 100-point defeat bonus, and a paused clear screen before Level 2. Preserve the accepted gameplay.
- Level 2 has two regular waves of 18 aliens each (3 × 6), followed by Lord Kaezar Vhul. The supply ship drops shield or rapid-fire pickups. Kaezar’s accepted warning-lane, locked-path ram and smooth retreat remain in place; the forward charge speed is 616 px/s. His separate defeat bonus is 200 points. Defeat leads to a paused Level 2 clear screen and Level 3 button.
- Level 3 has two waves of 24 aliens each (4 × 6), with a 1.15 Wave 2 horizontal formation multiplier, gradual destruction-based acceleration, 55 px smooth descent on every distinct right-edge contact, and actual individual-formation-alien contact loss. It has one diver at a time, supply ship and pickups. Wave 2 leads to Zhur-Kai.
- Zhur-Kai is accepted for now; later balancing may happen. She has smooth randomized X/Y movement, smooth opening/closing armour and core damage only when shots physically pass the animated gap. Shots can damage during opening, fully open and closing when unobstructed. Her attacks are twin streams and a telegraphed aimed burst. Movement is 15% faster at or below 25% HP. The invisible-body projectile-blocking bug was fixed. The temporary diagnostic text and hit counter were removed; developer collision outlines remain.
- Player projectile hits each remove one life despite the preceding hit-flash interval. Temporary shields remain protective, and boss ram/contact cooldowns remain separate. The user confirmed the projectile-damage fix worked.
- Varnok is a separate encounter reachable through developer-only **Test Boss 4**; normal progression still stops at Zhur-Kai’s temporary checkpoint. Varnok has a 200 × 110 px placeholder body, smooth randomized X/Y movement, and two 30 × 26 px eye hitboxes sharing 30 HP. The 45 px passages and visible eyelids use shared geometry; the 2s closed / 0.5s opening / 3s open / 0.5s closing cycle controls physical access during opening and closing. A successful hit deals 1 HP and 10 points; defeat gives a separate 300-point bonus once. The user accepted eye targeting, wider passages and reduced HP for now.
- Varnok launches one batch of four aliens after 2 seconds, 0.3 seconds apart. They launch upward at 180 px/s, fully leave the screen, wait 0.5 seconds, return at 180 px/s, then settle. Their lifecycle states are explicit; only settled aliens are targetable. The user observed four aliens settled in the upper-left and confirmed that they stay independent of Varnok. Do not claim the user checked every launch timing, scoring, cleanup or defeat case.
- No Varnok formation movement, downward stepping, shooting or diving is implemented. The most recent prompt to implement Varnok formation movement was not authorized; the user chose to stop and save instead. No aliens spawn in repeated batches, and Varnok has no dive or bomb barrage yet. Varnok is not connected to normal progression; final victory is not implemented.

## Next implementation step

Add independent sideways formation movement and downward stepping for Varnok’s settled aliens. Inspect and reuse earlier-level behavior without invoking normal wave progression. Add alien shooting and diving later, as separate testable steps. Revisit repeated spawning and balance only after approval. Varnok’s planned dive/bomb barrage and normal progression connection are later work; do not invent their settings.

## Graphics workshop direction

- Finish gameplay first. Use Perplexity Computer as a separate visual workshop, starting with player-ship concepts enlarged and at in-game size.
- Get the user’s approval before broader redesign. Keep experiments outside the working game.
- Integrate approved art incrementally while preserving gameplay and hitboxes. Prepare separate animated body, eye and mouth parts where needed.
- Record tools, prompts, outputs and user decisions. Record the exact Codex model/reasoning only if known. Perplexity uses Best/automatic selection; do not attribute its discussions to a specific model.

## Working and verification preferences

- Implement one small gameplay step at a time. The user manually tests in the browser. Do not run browser tests unless specifically authorized.
- Keep code checks, simulations, user-reported checks and unverified behavior distinct. No broad regression or acceptance should be inferred from a focused check.
- Preserve accepted bosses and unrelated work. Prioritize gameplay, progression, scoring and win/loss behavior; defer cosmetics.
- Do not commit or push without a direct request. This handover update is part of the user-requested local save and commit.

## Historical context

The prototype demonstration and Moodle submission were reported by the user on 15 November 2026; details and earlier user-reported checks remain in `DEVELOPMENT_LOG.md`. Level 1 is accepted as-is. The current status above supersedes older planning notes that describe Levels 2–3 or their bosses as unimplemented.
