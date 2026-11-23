# TODO – Space Shooter final game
Updated: 23 November 2026. Source: Patrik's list, reordered into build order.
The checklist records implementation and focused browser verification separately. Do one task at a time, top to bottom.

## Phase 1: Quick fixes
- [x] 1. Keep an already-flying supply ship moving during wave entrances without advancing the countdown for a new ship. (applied, explicit browser verification pending)
  - The user will watch for problems during later play.
- [x] 2. Remove all boss dialogue (applied, browser tested by user)
- [x] 3. Add a Restart button to the Game over screen (applied, explicit browser verification pending)
  - The user will watch for problems during later play.

## Phase 2: Screen look and player ship
- [x] 4. Give the menus, result panels and buttons the game's graphics style (applied, overall appearance accepted by user)
  - The later button styling, panel seam, in-panel next-level buttons and clear-screen copy lack individual browser verification.
- [x] 5. Bank the player ship's graphics left and right when moving (applied, 84% full-bank width accepted by user)
  - The shading-mask mismatch was fixed. The user reported motion blur in both bank modes on low battery and chose to move on after frame intervals improved on power. No further ship-rendering fix is requested.

## Phase 3: Weapons
- [x] 6. Add Double shot and Spread shot to the supply drop, with a per-volley damage rule for bosses (applied, focused browser checks only)
  - The user verified Shield, Machinegun and Spread shot, including Spread hits on Varnok's eyes. Double shot and broader replacement, expiry and reset checks remain pending.
  - The new 10-second Shield expiry and two-second fade still need browser verification.
- [x] 7. Show "Double shot!" and "Spread shot!" pickup text, same logic as the other supply items (applied, Double shot message still needs a browser check)

## Phase 4: Audio
- [ ] 8. Music: assign tracks and wire them in.
      Menu: S&H (Scorched Earth Remix)
      Level 1 and Boss 1: Voyage to Aether Nova
      Level 2 and Boss 2: Log Entry_ Ship Clock 2230
      Level 3, Boss 3 and Boss 4: Voyage Home (Extraterrestrial Reprise)
      Credits: Weightless (Ambient Mix)
- [ ] 9. Add a Sound effects On/Off button in the menu (separate from Music).
- [ ] 10. Create the sound effects.
- [ ] 11. Add a voice that says the weapon's name on supply pickup (decide: audio files or browser speech).

## Phase 5: Visual polish
- [ ] 12. Add subtle backgrounds (blinking stars, suns, moons, nebulas), different for menu, each level and credits.
- [ ] 13. Add animation to Boss 1 and Boss 2.
- [ ] 14. Create particle effects and animations for aliens and good guys.
- [ ] 15. Make waves enter in creative ways before the fight starts. The player can move while waiting.
- [ ] Make Vesper fly level rather than on its side. Confirm the intended artwork orientation before changing its rendering; preserve its movement and collision footprint.

## Phase 6: Ending and credits
- [ ] 16. Add a Developer button that starts the credits directly.
- [ ] 17. After Boss 4 is defeated: Credits, with a fade out and fade in.
  - After Boss 4 is defeated, show one summary screen covering Zhur-Kai and Varnok (bonuses, score, lives) with a Continue button, then fade out into the credits. No separate screen after Boss 3, so Varnok stays a surprise.
- [ ] 18. Credits page presents all aliens, bosses, the supply ship and the player's ship, each with a short bio.

## Phase 7: Finish
- [ ] 19. Create Easy, Hard and Ridiculous versions (tuning not agreed yet).
- [ ] 20. Remove all developer buttons.
  - Remove the forced supply reward buttons, boss-shot readout, Bank effect checkbox, and Measure Canvas button and readout.
- [ ] 21. Final testing, then the post mortem and the YouTube video.
