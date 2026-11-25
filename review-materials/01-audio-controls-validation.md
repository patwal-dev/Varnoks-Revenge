# Audio controls review validation

## Evidence and checks

I compared the [Qwen response](01-audio-controls-qwen-response.md) and [Gemma response](01-audio-controls-gemma-response.md) with the [saved source packet](01-audio-controls.md) and the current working copy. All 51 labeled excerpts matched the current files exactly. The packet contains the four button declarations, FX and input handlers, all of `music.js` and `sound-effects.js`, the synthesis function and pickup recipe, and selected game-loop and music-transition call sites. It excludes embedded media data, other sound recipes, and most gameplay and rendering. The saved packet records the source available for review. The responses do not establish which excerpts fit in each model's active context.

Both existing Node regression suites passed using `node --test tests/supply-transitions.cjs tests/level3-progression.cjs`. They cover supply transitions and Level 3 progression. I also ran a focused Node simulation with the current source, mocked DOM events, storage, and audio APIs. That check exercised synchronization, restored settings, focus and input handlers, FX unlock and voice replacement, and music activation and track routing. Browser keyboard dispatch, actual audio playback and timing, and screen-reader output were outside this validation.

## Deduplicated claims

### 1. Header and menu Music fail to synchronize

**Raised by Qwen (findings 1 and 5, later withdrawn). Classification — unsupported claim.** Both buttons have `data-music-toggle` (`index.html:14-17,34-37`). One list contains both (`music.js:1-2`), each receives the same click handler (`music.js:169-189`), and `applyMusicPreference()` updates both labels and pressed states (`music.js:38-45`). The listeners are attached to individual controls. Qwen's reference to a document-level music click listener is inaccurate.

**Verification and change decision.** Simulated clicks in both directions updated both Music buttons and the shared key. No change is justified.

### 2. Music and FX require a shared setting or storage key

**Raised by Qwen and Gemma. Classification — intended behaviour.** The FX pair shares `soundEffectsEnabled` and one saved key (`game.js:28-31,2700-2706,2716-2737`). The Music pair shares another preference (`music.js:21-45,169-189`). The two preferences are intentionally independent.

**Verification and change decision.** The Node simulation changed each preference while preserving the other, then initialized a new instance with the saved values. No change is justified.

### 3. The menu pressed states are wrong on load

**Raised by Qwen (finding 4, later withdrawn). Classification — unsupported claim.** The HTML starts all four buttons at Off (`index.html:14-17,34-37`). The scripts run after the controls are declared (`index.html:153-158`). Each script reads its preference and applies it to both buttons at initialization (`game.js:2700-2706,2716-2721`; `music.js:32-45,132`).

**Verification and change decision.** Fresh simulated instances with opposite saved preferences restored matching text and `aria-pressed` on all four buttons. No change is justified.

### 4. Music cannot be activated with the keyboard

**Raised by Qwen. Classification — unsupported claim.** Both Music controls are native `button` elements (`index.html:16,35`). In gameplay, Space on either audio control returns before the firing branch calls `preventDefault()`. In the menu the gameplay handler returns at entry. Enter on an audio control also has no cancellation branch (`game.js:2791-2817)). Native button activation via Enter or Space dispatches a click, which the Music handler accepts when browser-generated and trusted (`music.js:169-189`). The header click listener restores canvas focus during play or a boss intro (`game.js:2694-2698`). [WHATWG activation behaviour](https://html.spec.whatwg.org/multipage/interaction.html#activation-behavior) and [W3C UI Events keydown](https://www.w3.org/TR/uievents/#event-type-keydown).

**Verification and change decision.** The Node simulation verified that the source left Space and Enter uncancelled on header controls, that the click handler restored focus in the mock, and that subsequent movement and firing keys reached the input set. The simulation supplied the click directly. No custom key handler is justified by the claim.

### 5. The developer Boss 4 route mishandles held Space

**Raised by Qwen (finding 2 and summary). Classification — intended behaviour.** Developer Boss 4 enters without the normal introduction, which is why the held-through-reveal guard excludes that test. Normal progression explicitly requests the introduction and the Fight button clears held keys. The same repeat guard controls adding Space and movement keys (`game.js:908,970-981,2645-2649,2782-2817,3532-3541`).

**Verification and change decision.** With Boss 4 active in the simulation, repeated Space entered the input set on the developer route and was ignored in normal play. No change is justified.

### 6. A new pickup interrupts the previous voice

**Raised by Qwen. Classification — intended behaviour.** Collection invokes `playPickup()` only with FX enabled (`game.js:3253-3277`). The function stops the active voice before starting the new pickup's decoded clip and calls the chime. If the new clip is unavailable, it still calls the chime. The previous voice's completion handler only clears the active reference if it still owns that reference. Turning FX off stops the active voice and other sound sources (`sound-effects.js:64-107`).

**Verification and change decision.** In the simulation a second pickup stopped the first voice, and turning FX off stopped the replacement. Voice replacement is the specified behaviour. No queue or other change is justified.

### 7. A non-audio click can turn FX on unexpectedly

**Raised by Qwen. Classification — intended behaviour for context unlock.** Trusted clicks and non-repeated key events can unlock the context only while FX is already enabled. Only initialization and the toggle handler assign the preference, and only the toggle handler saves changes. `unlock()` initializes or resumes audio without starting an effect source. Playback is a separate call (`game.js:2708-2737`; `sound-effects.js:25-62,84-129`).

**Verification and change decision.** A simulated non-audio click left saved Off unchanged and created no context. With saved On it initialized the context without changing the setting. No change is justified.

### 8. Repeated unlock calls reset resources or cause a race

**Raised by Gemma. Classification — unsupported claim.** Context creation and the decision to start voice decoding sit inside `if (!audio)`. The context reference is assigned before decoding is started, and `unlock()` builds the effects buffer map synchronously when absent. A second gesture can request `resume()` while the context still reports suspended. Once running, calls skip that work. No reset or race follows from the repeated calls shown (`game.js:2712-2728`; `sound-effects.js:15-62`).

**Verification and change decision.** Repeated mocked interactions reused the context and buffers and did not relaunch voice decoding. A suspended mock permitted another resume request. A running mock skipped it. No change is justified by the proposed race.

### 9. Canvas focus and audio readiness may cause audible delays

**Raised by Gemma. Classification — unresolved for audible timing.** The handlers have separate responsibilities. The document capture listener can unlock FX, the header listener restores focus, and turning FX On invokes unlock after changing the preference. No audio-readiness check depends on canvas focus. Audio resume and voice decoding are asynchronous, and playback checks the running state (`game.js:2694-2698,2712-2737`; `sound-effects.js:15-62,84-112`).

**Verification and change decision.** The source and mocks show independent focus and unlock paths. Audible latency in a real browser was not measured, and the review recorded no reproduction. No change is justified without an observed failure.

### 10. The header and menu have inconsistent accessible labels

**Raised by Gemma. Classification — unsupported claim.** Each location contains one Music and one FX control with the corresponding data attributes. Music has the same accessible label in both locations. Header FX has the label “FX (sound effects)” and menu FX has “Sound effects”. The toggle code updates text and `aria-pressed` while preserving those accessible names (`index.html:14-17,34-37`; `game.js:2700-2706`; `music.js:38-45`).

**Verification and change decision.** Source inspection contradicted the claim that both header buttons have the FX attribute. The simulated states matched the preferences. Screen-reader announcement was not verified. No change is justified on this evidence.

### 11. Only a Music toggle click sets `playbackActivated`

**Raised by Gemma. Classification — unsupported claim.** The flag starts false and its only later assignment, `if (musicEnabled) playbackActivated = true`, is outside the Music-toggle branch. A trusted click on a registered non-FX control such as Start Game can activate playback when Music was restored On. FX controls are excluded. The flag is never reset after initialization. Regular track requests use the gate, while credits use their own playback path and apply the mute preference directly (`music.js:21-36,78-91,93-129,158-189`; `index.html:31-36`).

**Verification and change decision.** With saved Music On, the simulated Start Game click requested playback. A track transition after toggling Off still requested the new track while muted. The credits route requested muted playback even without prior regular-track activation. No change is justified.

### 12. Missing playback code and unverified transition coverage

**Raised by Gemma. Classification — unsupported claim for the missing playback implementation.** The packet contains the complete `gameSoundEffects.play()` function and context initialization (`sound-effects.js:25-62,109-136`), the `renderEffect(layers, sampleRate)` implementation, and the pickup recipe and its helpers (`sound-effects-preview/sounds.js:4-10,46-50,74-110`). The rest of the recipe table, the encoded voice data, and most gameplay lifecycle code are outside the packet. No change is justified by an evidence coverage observation.

**Raised by Gemma. Classification — unresolved for complete transition coverage.** Source inspection confirmed that `notifyMusicTrack()` sends the track, crossfade flag, and optional credits callbacks. Regular fades use the selected audio tracks, playback state, and elapsed time. The credits branch supplies and consumes the clock and completion callbacks (`game.js:1225-1243,1261-1281,2519-2523,2770-2779`; `music.js:52-76,93-129,133-167`). The Node simulation exercised track selection, the credits clock callback, muting, and cleanup on returning to a regular track. It did not time an audible fade or exercise every gameplay route. Gemma supplied no failing transition. No change is justified on this evidence.

## Teacher-facing summary

Qwen and Gemma suggested issues with synchronization, keyboard access, pickup announcements, and audio startup. Source inspection and targeted Node checks established that the shared settings and the tested input and playback paths behave as designed. Neither review yielded a confirmed defect. Audible timing, full transition coverage, and screen-reader output remain unverified. Both existing regression suites passed. The only change made in this validation was adding this report. Runtime source, the source packet, and both raw responses were preserved.
