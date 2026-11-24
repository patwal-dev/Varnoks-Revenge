# Space Shooter sound effects preview

## Requirements and references

Task 10 in `TODO.md` calls for sound effects. `PLANS.md` and `PROTOTYPE_SUBMISSION.md` also call for sound effects and leave the cue list open. Task 11 separately covers spoken pickup names. This page is for listening and approval.

| Preview | Existing event inspected in `game.js` | Design decision |
| --- | --- | --- |
| Player shot | `updateShots()` emits a standard, Double shot or Spread shot volley | One soft falling tone per volley |
| Machinegun burst | `updateShots()` uses the 0.40-second Machinegun interval | Four quieter pulses at the game cadence for auditioning |
| Enemy shot | `fireAlienShot()` and the Boss 1 and Boss 3 firing functions | One low rising chirp for enemy projectiles |
| Enemy destroyed | `handleShotCollisions()` removes a shot-down alien or supply ship | One shared crackle |
| Boss hit | `applyBossDamage()` records damage | A short metallic tick for a hit that leaves the boss alive |
| Shield absorbs a shot | `damagePlayerFromProjectile()` consumes a shield charge | A hollow rising ping |
| Player loses a life | `losePlayerLife()` reduces the life count | A low impact and falling tail for a non-final life loss |
| Supply pickup | `updateLevel2Pickups()` applies the collected reward | Two rising notes shared by the four crate contents |
| Boss defeated | `applyBossDamage()` resolves the defeat | A short low burst and a rising three-note cue |
| Game over | `finishGame("loss")` enters the result screen | A short descending phrase |

The shot cues use lower levels than impact and result cues. Matching projectile variants share cues to keep the palette small. The preview plays one selected cue at a time with a short fade when replacing it.

## Tools and verification

- OpenAI Codex authored the HTML, CSS and vanilla JavaScript. The exact session model identifier and reasoning setting were unavailable.
- JavaScript synthesizes each sound from sine and triangle tones and filtered deterministic noise. Web Audio plays the generated buffers after a Play click. The preview has no libraries, downloaded samples, or voice recordings.
- Shell tools and Ripgrep supported source inspection. Node checked syntax and rendered sample arrays for duration, peak levels, and the Machinegun cadence without starting browser audio. Python checked the page's local references and Play buttons. Git checked whitespace.
- Browser listening and sound approval are pending. Task 10 remains open for integration.
