# Audio controls

## Expected behaviour

- The header provides FX and Music toggles above the canvas. The main menu provides Sound effects and Music toggles for the same settings.
- Each pair shares one saved preference. Changing either button updates both labels and pressed states immediately. The saved choices are restored when the game opens.
- FX controls sound effects and pickup announcements independently of Music.
- Activating a header control during gameplay preserves the current run and keyboard movement and firing.
- Music retains its existing playback and track transitions between the menu, levels and credits.

## Source excerpts

The line ranges refer to the current working copy. Audio implementations are shown as complete functions. The shorter gameplay excerpts show call sites and state assignments. The packet excludes embedded voice data, other sound recipes, and gameplay and rendering outside the audio and keyboard paths.

### Control markup and styles

`index.html:7`

```html
  <link rel="stylesheet" href="style.css">
```

`index.html:11-18`

```html
    <div class="game-stage">
      <header class="game-header">
        <h1>Space Shooter</h1>
        <div class="header-audio-controls" role="group" aria-label="Audio settings">
          <button type="button" data-sound-effects-toggle="FX" aria-label="FX (sound effects)" aria-pressed="false">FX: Off</button>
          <button type="button" data-music-toggle aria-label="Music" aria-pressed="false">Music: Off</button>
        </div>
      </header>
```

`index.html:24-28`

```html
      <div class="play-area">
        <canvas id="game" width="800" height="600" aria-label="Space game area" tabindex="-1"></canvas>
        <div id="main-menu" class="screen-overlay main-menu">
          <section class="neon-panel menu-panel">
            <nav id="menu-options" aria-labelledby="menu-title">
```

`index.html:31-38`

```html
              <div class="menu-controls">
                <button id="start-game" type="button">Start Game</button>
                <button id="show-how-to-play" type="button">How to Play</button>
                <div class="menu-audio-controls" role="group" aria-label="Audio settings">
                  <button type="button" data-music-toggle aria-label="Music" aria-pressed="false">Music: Off</button>
                  <button type="button" data-sound-effects-toggle aria-label="Sound effects" aria-pressed="false">Sound effects: Off</button>
                </div>
              </div>
```

`index.html:153-158`

```html
  <script src="sound-effects-preview/sounds.js"></script>
  <script src="Voices/pickup-voice-data.js"></script>
  <script src="sound-effects.js"></script>
  <script src="Background-Art-Workshop/backgrounds.js"></script>
  <script src="game.js"></script>
  <script src="music.js"></script>
```

`style.css:28-45`

```css
.game-header {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 10px;
  text-align: left;
}

.header-audio-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-inline-start: auto;
}
```

`style.css:95-106`

```css
.game-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  column-gap: 16px;
}

.play-area {
  grid-area: 3 / 1;
  position: relative;
  min-width: 0;
}
```

`style.css:495-506`

```css
button {
  margin-top: 12px;
  padding: 10px 22px;
  border: 1px solid #83e4f6;
  border-radius: 6px;
  background: #17334a;
  color: #d9f6ff;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 0.04em;
  cursor: pointer;
}
```

`style.css:512-515`

```css
button:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}
```

`style.css:534-556`

```css
.header-audio-controls button {
  min-height: 34px;
  margin: 0;
  padding: 6px 10px;
  border: 1px solid #52677e;
  border-radius: 7px;
  background: #0d192d;
  color: #a9bed2;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.2;
  letter-spacing: 0;
}

.header-audio-controls button[aria-pressed="true"] {
  border-color: #63bbcf;
  background: #10253a;
  color: #a1eaf6;
}

.header-audio-controls button:hover {
  filter: brightness(1.15);
}
```

`style.css:598-637`

```css
.menu-audio-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.menu-audio-controls button[aria-pressed] {
  --menu-audio-border: #5b738c;
  --menu-audio-text: #a9bed2;
  min-height: 42px;
  margin: 0;
  padding: 7px 4px;
  border: 1px solid var(--menu-audio-border);
  border-radius: 7px;
  background: #0d192d;
  color: var(--menu-audio-text);
  font-size: clamp(0.7rem, 3.5vw, 0.875rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  box-shadow: none;
  filter: none;
  transform: none;
  transition: background-color 130ms ease;
}

.menu-audio-controls button[aria-pressed="true"] {
  --menu-audio-border: #63bbcf;
  --menu-audio-text: #8beaff;
}

.menu-audio-controls button[aria-pressed]:hover {
  background: #14243c;
}

.menu-audio-controls button[aria-pressed]:focus-visible {
  outline: 2px solid #def7ff;
  outline-offset: 3px;
}
```

### FX preferences and keyboard handling

`game.js:1`

```js
const canvas = document.getElementById("game");
```

`game.js:20-38`

```js
const mainMenu = document.getElementById("main-menu");
const menuOptions = document.getElementById("menu-options");
const startGameButton = document.getElementById("start-game");
const shipSelection = document.getElementById("ship-selection");
const shipSelectionBackButton = document.getElementById("ship-selection-back");
const howToPlay = document.getElementById("how-to-play");
const howToPlayButton = document.getElementById("show-how-to-play");
const menuBackButton = document.getElementById("menu-back");
const headerAudioButtons = document.querySelectorAll(".header-audio-controls button");
const soundEffectsToggles = document.querySelectorAll("[data-sound-effects-toggle]");
const soundEffectsStorageKey = "hamk-space-shooter-sound-effects";
let soundEffectsEnabled = false;
const restartButton = document.getElementById("restart");
const level2Button = document.getElementById("level-2");
const level3Button = document.getElementById("level-3");
const varnokDialogue = document.getElementById("varnok-dialogue");
const varnokFightButton = document.getElementById("varnok-fight");
const developerTestingPanel = document.getElementById("developer-testing");
const developerBankEffect = document.getElementById("developer-bank-effect");
```

`game.js:40`

```js
const developerExaggerateAnimation = document.getElementById("developer-exaggerate-animation");
```

`game.js:47`

```js
const developerCreditsButton = document.getElementById("developer-test-credits");
```

`game.js:50-51`

```js
const DEVELOPER_MODE = true;
let developerBossTestLevel = null;
```

`game.js:296`

```js
const keysDown = new Set();
```

`game.js:609`

```js
let gameState = "menu";
```

`game.js:2694-2737`

```js
for (const button of headerAudioButtons) {
  button.addEventListener("click", () => {
    if (gameState === "playing" || gameState === "bossIntro") canvas.focus({ preventScroll: true });
  });
}

function updateSoundEffectsToggles() {
  for (const button of soundEffectsToggles) {
    const label = button.dataset.soundEffectsToggle || "Sound effects";
    button.textContent = `${label}: ${soundEffectsEnabled ? "On" : "Off"}`;
    button.setAttribute("aria-pressed", String(soundEffectsEnabled));
  }
}

function playSoundEffect(name) {
  if (soundEffectsEnabled) gameSoundEffects.play(name);
}

function unlockSoundEffects(event) {
  if (soundEffectsEnabled && event.isTrusted && !event.repeat) gameSoundEffects.unlock();
}

try {
  soundEffectsEnabled = window.localStorage.getItem(soundEffectsStorageKey) === "on";
} catch {
  // Keep the default when storage is unavailable.
}
updateSoundEffectsToggles();
document.addEventListener("click", unlockSoundEffects, true);
document.addEventListener("keydown", unlockSoundEffects, true);
function toggleSoundEffects(event) {
  soundEffectsEnabled = !soundEffectsEnabled;
  updateSoundEffectsToggles();
  if (soundEffectsEnabled) unlockSoundEffects(event);
  else gameSoundEffects.silence();
  try {
    window.localStorage.setItem(soundEffectsStorageKey, soundEffectsEnabled ? "on" : "off");
  } catch {
    // Keep the new value for the current page.
  }
}
for (const button of soundEffectsToggles) {
  button.addEventListener("click", toggleSoundEffects);
}
```

`game.js:2782-2850`

```js
varnokFightButton.addEventListener("click", () => {
  if (gameState !== "varnokDialogue") return;
  varnokDialogue.hidden = true;
  keysDown.clear();
  gameState = "playing";
  previousFrameTime = 0;
  canvas.focus({ preventScroll: true });
});

window.addEventListener("keydown", (event) => {
  if (gameState === "menu" || gameState === "playerDeath") return;
  if (boss?.level === 4 && (gameState === "bossIntro" || gameState === "varnokDialogue")) {
    if (event.target === varnokFightButton && event.repeat
      && (event.code === "Space" || event.key === "Enter")) event.preventDefault();
    return;
  }
  // A key held through the reveal needs a fresh press to control the player.
  const ignoreHeldInput = boss?.level === 4 && developerBossTestLevel !== 4 && event.repeat;
  const key = event.key.toLowerCase();
  if (key === "k" && !event.repeat && DEVELOPER_MODE
    && developerBossTestLevel === 4 && gameState === "playing" && boss?.level === 4) {
    event.preventDefault();
    applyBossDamage(boss.health);
  } else if (event.code === "Space") {
    if (event.target === developerBankEffect || event.target === developerExaggerateAnimation
      || event.target === developerCreditsButton
      || event.target === continueToCreditsButton) return;
    if (event.target.matches?.("[data-music-toggle], [data-sound-effects-toggle]")
      || (gameState === "loss" && event.target === restartButton)) return;
    event.preventDefault();
    if (gameState !== "credits" && !ignoreHeldInput) keysDown.add("space");
  } else if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
    event.preventDefault();
    if (gameState !== "credits" && !ignoreHeldInput) keysDown.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.code === "Space" ? "space" : event.key.toLowerCase());
});

window.addEventListener("blur", () => {
  keysDown.clear();
});

function updatePlayer(deltaSeconds) {
  let direction = 0;
  if (keysDown.has("arrowleft") || keysDown.has("a")) direction -= 1;
  if (keysDown.has("arrowright") || keysDown.has("d")) direction += 1;

  let verticalDirection = 0;
  if (keysDown.has("arrowup") || keysDown.has("w")) verticalDirection -= 1;
  if (keysDown.has("arrowdown") || keysDown.has("s")) verticalDirection += 1;

  const previousX = player.x;
  player.x += direction * player.speed * deltaSeconds;
  player.y += verticalDirection * player.speed * deltaSeconds;
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  player.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, player.x));
  player.y = Math.max(playerMinY, Math.min(playerMaxY, player.y));
  player.y = Math.max(halfHeight, Math.min(canvas.height - halfHeight, player.y));

  const horizontalMovement = player.x - previousX;
  const targetBank = Math.abs(horizontalMovement) > playerBankDeadZoneSpeed * deltaSeconds
    ? Math.sign(horizontalMovement)
    : 0;
  playerBank += (targetBank - playerBank) * (1 - Math.exp(-playerBankEaseSpeed * deltaSeconds));
}
```

### FX playback and pickup collection

`game.js:2853-2873`

```js
  if (keysDown.has("space") && frameTime >= nextShotTime) {
    const weapon = playerWeapons[level2ActiveWeapon?.type];
    const pattern = weapon?.pattern ?? straightShotPattern;
    const damagedBosses = pattern.length > 1 ? new WeakSet() : null;
    for (const [offsetX, angle] of pattern) {
      const shot = {
        x: player.x + offsetX,
        y: player.y - player.height / 2 - playerShotMuzzleOffset,
        width: 5,
        height: 14,
        vx: shotSpeed * Math.sin(angle),
        vy: -shotSpeed * Math.cos(angle),
        artwork: weapon?.artwork ?? null,
        color: weapon?.color ?? "#ffe08a",
        damagedBosses,
      };
      shots.push(shot);
    }
    nextShotTime = frameTime + (weapon?.interval ?? shotInterval) * 1000;
    playSoundEffect(level2ActiveWeapon?.type === "machinegun" ? "machinegun" : "playerShot");
  }
```

`game.js:3253-3277`

```js
function updateLevel2Pickups(deltaSeconds) {
  for (let index = level2Pickups.length - 1; index >= 0; index -= 1) {
    const pickup = level2Pickups[index];
    pickup.y += level2ShieldPickupSpeed * deltaSeconds;
    const touchingPlayer = pickup.x + pickup.width / 2 >= player.x - player.width / 2
      && pickup.x - pickup.width / 2 <= player.x + player.width / 2
      && pickup.y + pickup.height / 2 >= player.y - player.height / 2
      && pickup.y - pickup.height / 2 <= player.y + player.height / 2;
    if (touchingPlayer) {
      if (pickup.type === "shield") {
        level2ShieldCharges = level2ShieldChargesMax;
        level2ShieldTimeRemaining = level2ShieldDuration;
        level2PickupMessageText = "Shield!";
      } else {
        level2ActiveWeapon = { type: pickup.type, timeRemaining: level2WeaponDuration };
        level2PickupMessageText = playerWeapons[pickup.type].message;
      }
      level2PickupMessageTimeRemaining = level2PickupMessageDuration;
      level2Pickups.splice(index, 1);
      if (soundEffectsEnabled) gameSoundEffects.playPickup(pickup.type);
    } else if (pickup.y - pickup.height / 2 > canvas.height) {
      level2Pickups.splice(index, 1);
    }
  }
}
```

`game.js:3329-3332`

```js
function updateSuppliesDuringEntrance(deltaSeconds) {
  if (level2BonusShip !== null) updateLevel2BonusShip(deltaSeconds);
  updateLevel2Pickups(deltaSeconds);
}
```

`game.js:4836-4848`

```js
  } else if (gameState === "bossIntro") {
    updateBossIntro(deltaSeconds);
    updateSuppliesDuringEntrance(deltaSeconds);
  } else if (gameState === "playing") {
    updatePlayer(deltaSeconds);
    updateLevel2PickupTimers(deltaSeconds);
    if (waveEntrance !== null) {
      updateWaveEntrance(deltaSeconds, frameTime);
      updateSuppliesDuringEntrance(deltaSeconds);
    } else {
      combatElapsed += deltaSeconds;
      updateDestructionFragments();
      updateShots(deltaSeconds, frameTime);
```

`game.js:4856-4860`

```js
      } else if (boss === null) {
        const formationBreached = updateEnemies(deltaSeconds, frameTime);
        if (gameState === "bossIntro" || (gameState === "playing" && waveEntrance !== null)) {
          updateSuppliesDuringEntrance(deltaSeconds);
        }
```

`game.js:4869-4872`

```js
      if (gameState === "playing" && (currentLevel === 2 || currentLevel === 3)) {
        updateLevel2BonusShip(deltaSeconds);
        updateLevel2Pickups(deltaSeconds);
      }
```

`sound-effects.js:1-136`

```js
"use strict";

const gameSoundEffects = (() => {
  const voiceLimit = 4;
  const priorityEffects = new Set(["pickup", "lifeLost", "bossDefeated", "gameOver"]);
  const voices = new Map();
  const pickupVoiceBuffers = new Map();
  let buffers;
  let audio;
  let output;
  let pickupChimeOutput;
  let pickupVoiceOutput;
  let activePickupVoice = null;

  async function decodePickupVoice(type, encoded) {
    try {
      const bytes = Uint8Array.from(atob(encoded), (byte) => byte.charCodeAt(0));
      const buffer = await audio.decodeAudioData(bytes.buffer);
      pickupVoiceBuffers.set(type, buffer);
    } catch {
      // The chime remains available when an announcement cannot be decoded.
    }
  }

  function unlock() {
    try {
      if (!audio) {
        const context = new AudioContext();
        const gain = context.createGain();
        const chime = context.createGain();
        const speech = context.createGain();
        gain.gain.value = 0.75;
        speech.gain.value = 0.55;
        gain.connect(context.destination);
        chime.connect(gain);
        speech.connect(gain);
        audio = context;
        output = gain;
        pickupChimeOutput = chime;
        pickupVoiceOutput = speech;

        if (typeof pickupVoiceData !== "undefined") {
          // Decode only. Pickups never queue playback while a clip is loading.
          for (const [type, encoded] of Object.entries(pickupVoiceData)) {
            decodePickupVoice(type, encoded);
          }
        }
      }

      if (audio.state !== "running") audio.resume().catch(() => {});
      if (!buffers) {
        buffers = new Map(Object.entries(arcadeSounds.effects).map(([name, layers]) => {
          const samples = arcadeSounds.renderEffect(layers, audio.sampleRate);
          const buffer = audio.createBuffer(1, samples.length, audio.sampleRate);
          buffer.copyToChannel(samples, 0);
          return [name, buffer];
        }));
      }
    } catch {
      // Audio can be unavailable while the game remains playable.
    }
  }

  function stopVoice(name) {
    const source = voices.get(name);
    voices.delete(name);
    source.disconnect();
    source.stop();
  }

  function silence() {
    stopPickupVoice();
    for (const name of voices.keys()) stopVoice(name);
  }

  function stopPickupVoice() {
    if (activePickupVoice === null) return;
    const source = activePickupVoice;
    activePickupVoice = null;
    source.disconnect();
    source.stop();
  }

  function playPickup(type) {
    stopPickupVoice();
    if (audio?.state !== "running") return;

    const buffer = pickupVoiceBuffers.get(type);
    if (buffer) {
      try {
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.connect(pickupVoiceOutput);
        source.onended = () => {
          source.disconnect();
          if (activePickupVoice === source) activePickupVoice = null;
        };
        source.start();
        activePickupVoice = source;
      } catch {
        // The reward has already been applied. Keep its pickup chime.
      }
    }

    pickupChimeOutput.gain.value = activePickupVoice === null ? 1 : 0.32;
    play("pickup");
  }

  function play(name) {
    const isFormationCue = name === "formationTick" || name === "formationTock";
    const voiceKey = isFormationCue ? "formation" : name;
    if (audio?.state !== "running" || !buffers?.has(name) || voices.has(voiceKey)) return;
    try {
      // The quiet formation beat has one slot of its own, leaving combat voices available.
      if (!isFormationCue && voices.size - Number(voices.has("formation")) >= voiceLimit) {
        if (!priorityEffects.has(name)) return;
        const names = [...voices.keys()].filter((key) => key !== "formation");
        const ordinaryCue = names.find((key) => !priorityEffects.has(key));
        stopVoice(ordinaryCue ?? names[0]);
      }
      const source = audio.createBufferSource();
      source.buffer = buffers.get(name);
      source.connect(name === "pickup" ? pickupChimeOutput : output);
      source.onended = () => {
        source.disconnect();
        if (voices.get(voiceKey) === source) voices.delete(voiceKey);
      };
      source.start();
      voices.set(voiceKey, source);
    } catch {
      // A playback failure must not interrupt a gameplay event.
    }
  }

  return { unlock, silence, play, playPickup };
})();
```

`sound-effects-preview/sounds.js:4-10`

```js
  function tone(start, duration, fromHz, toHz, level, shape = "sine") {
    return { start, duration, fromHz, toHz, level, shape };
  }

  function noise(start, duration, cutoffHz, level) {
    return { start, duration, cutoffHz, level, shape: "noise" };
  }
```

`sound-effects-preview/sounds.js:46-50`

```js
    pickup: [
      tone(0, 0.140, 659, 659, 0.068, "triangle"),
      tone(0.080, 0.220, 988, 988, 0.08, "triangle"),
      tone(0.083, 0.135, 1976, 1976, 0.013),
    ],
```

`sound-effects-preview/sounds.js:74-110`

```js
  function renderEffect(layers, sampleRate) {
    const duration = Math.max(...layers.map((layer) => layer.start + layer.duration));
    const samples = new Float32Array(Math.ceil(duration * sampleRate) + 1);
    let seed = 42;

    for (const layer of layers) {
      const startFrame = Math.round(layer.start * sampleRate);
      const length = Math.round(layer.duration * sampleRate);
      const attackFrames = Math.min(Math.round(0.005 * sampleRate), length / 4);
      const noiseSmoothing = layer.shape === "noise"
        ? 1 - Math.exp(-2 * Math.PI * layer.cutoffHz / sampleRate)
        : 0;
      let phase = 0;
      let filteredNoise = 0;

      for (let index = 0; index < length; index += 1) {
        const progress = index / length;
        const envelope = Math.min(1, index / attackFrames) * (1 - progress) ** 2;
        let signal;

        if (layer.shape === "noise") {
          seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
          const whiteNoise = seed / 0x80000000 - 1;
          filteredNoise += (whiteNoise - filteredNoise) * noiseSmoothing;
          signal = filteredNoise;
        } else {
          const frequency = layer.fromHz * (layer.toHz / layer.fromHz) ** progress;
          const sine = Math.sin(phase);
          signal = layer.shape === "triangle" ? 2 * Math.asin(sine) / Math.PI : sine;
          phase += 2 * Math.PI * frequency / sampleRate;
        }
        samples[startFrame + index] += signal * envelope * layer.level;
      }
    }

    return samples;
  }
```

`sound-effects-preview/sounds.js:112`

```js
  return { effects, renderEffect };
```

### Music preferences, playback and track events

`music.js:1-190`

```js
(() => {
  const musicButtons = [...document.querySelectorAll("[data-music-toggle]")];
  const volume = 0.18;
  const fadeDuration = 1000;
  const creditsFilename = "Rogue Transmission (Switch The Frequency Mix).mp3";
  const creditsStallTimeout = 20_000;
  function createTrack(filename, loop = true) {
    const track = new Audio();
    track.preload = "none";
    track.src = `backstageriot/${filename}`;
    track.loop = loop;
    track.volume = volume;
    return track;
  }

  const tracks = {
    1: createTrack("S&H (Scorched Earth Remix).mp3"),
    2: createTrack("Log Entry_ Ship Clock 2230.mp3"),
    3: createTrack("Voyage Home (Extraterrestrial Reprise).mp3"),
  };
  const storageKey = "hamk-space-shooter-music";

  let musicEnabled = false;
  let playbackActivated = false;
  // The menu starts with the same player used for Level 1.
  let selectedTrack = tracks[1];
  let playRequest = null;
  let fade = null;
  let fadeFrame = null;
  let creditsPlayback = null;

  try {
    musicEnabled = window.localStorage.getItem(storageKey) === "on";
  } catch {
    // Keep the default when the browser blocks access to storage.
  }

  function applyMusicPreference() {
    for (const track of Object.values(tracks)) track.muted = !musicEnabled;
    if (creditsPlayback !== null) creditsPlayback.track.muted = !musicEnabled;
    for (const button of musicButtons) {
      button.textContent = musicEnabled ? "Music: On" : "Music: Off";
      button.setAttribute("aria-pressed", String(musicEnabled));
    }
  }

  function stopTrack(track) {
    if (!track.paused) track.pause();
    if (track.currentTime !== 0) track.currentTime = 0;
  }

  function cancelFade() {
    if (fadeFrame !== null) cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
    fade = null;
  }

  function crossfadeTracks(transition) {
    const { outgoing, incoming } = transition;
    const outgoingVolume = outgoing.volume;
    const startedAt = performance.now();
    function animate(now) {
      if (fade !== transition) return;
      const progress = Math.min(1, (now - startedAt) / fadeDuration);
      outgoing.volume = outgoingVolume * (1 - progress);
      incoming.volume = volume * progress;
      if (progress < 1) {
        fadeFrame = requestAnimationFrame(animate);
      } else {
        stopTrack(outgoing);
        fadeFrame = null;
        fade = null;
      }
    }
    fadeFrame = requestAnimationFrame(animate);
  }

  async function playSelectedTrack() {
    const track = selectedTrack;
    if (!playbackActivated || !track.paused || (track.ended && !track.loop)
      || playRequest?.track === track) return;
    const request = { track };
    playRequest = request;
    try {
      await track.play();
    } catch {
      // A later user click can retry if playback was blocked or interrupted.
    } finally {
      if (playRequest === request) playRequest = null;
    }
  }

  function watchCreditsPlayback(track, { setClock, finish: onComplete }) {
    const listeners = new AbortController();
    const { signal } = listeners;
    let lastPosition = track.currentTime;
    let lastProgressAt = performance.now();
    // Allow buffering and slow starts, but stop waiting if playback stops advancing.
    const progressCheck = setInterval(() => {
      if (track.currentTime > lastPosition) {
        lastPosition = track.currentTime;
        lastProgressAt = performance.now();
      } else if (performance.now() - lastProgressAt >= creditsStallTimeout) {
        fail();
      }
    }, 1000);

    function cancel() {
      listeners.abort();
      clearInterval(progressCheck);
    }

    function finish(ended) {
      if (signal.aborted) return;
      cancel();
      onComplete(ended);
    }

    function fail() {
      if (signal.aborted) return;
      finish(false);
      track.pause();
    }

    setClock(() => ({ position: track.currentTime, duration: track.duration }));
    track.addEventListener("ended", () => finish(true), { signal });
    track.addEventListener("error", fail, { signal });
    track.play().catch(fail);
    return cancel;
  }

  applyMusicPreference();
  document.addEventListener("game-music-track", ({ detail }) => {
    const previousTrack = selectedTrack;
    cancelFade();
    if (creditsPlayback !== null) {
      const { track, cancel } = creditsPlayback;
      cancel();
      track.pause();
      track.removeAttribute("src");
      track.load();
      creditsPlayback = null;
    }
    const isCredits = detail.track === "credits";
    selectedTrack = isCredits ? createTrack(creditsFilename, false) : tracks[detail.track];
    if (selectedTrack !== previousTrack) playRequest = null;
    const outgoing = detail.crossfade && previousTrack !== selectedTrack
      && !previousTrack.paused ? previousTrack : null;
    for (const track of Object.values(tracks)) {
      if (track !== selectedTrack && track !== outgoing) stopTrack(track);
    }
    selectedTrack.volume = outgoing === null ? volume : 0;
    if (outgoing !== null) {
      // Stop the old track on schedule even if the incoming file is still loading.
      fade = { outgoing, incoming: selectedTrack };
      crossfadeTracks(fade);
    }
    if (isCredits) {
      selectedTrack.muted = !musicEnabled;
      creditsPlayback = {
        track: selectedTrack,
        cancel: watchCreditsPlayback(selectedTrack, detail.creditsTimeline),
      };
    } else {
      playSelectedTrack();
    }
  });

  function handlePlaybackClick(event) {
    if (!event.isTrusted) return;
    if (musicButtons.includes(event.currentTarget)) {
      musicEnabled = !musicEnabled;
      applyMusicPreference();
      try {
        window.localStorage.setItem(storageKey, musicEnabled ? "on" : "off");
      } catch {
        // The toggle still works for the current page.
      }
      if (!musicEnabled) return;
    }

    if (musicEnabled) playbackActivated = true;
    if (creditsPlayback === null) playSelectedTrack();
  }

  // game.js registers the control handlers first, so developer entry has selected its track.
  for (const control of document.querySelectorAll("button:not([data-sound-effects-toggle]), #ship-selection input")) {
    control.addEventListener("click", handlePlaybackClick);
  }
})();
```

`game.js:582`

```js
let currentLevel = 1;
```

`game.js:1043`

```js
  currentLevel = 2;
```

`game.js:1083`

```js
  currentLevel = 3;
```

`game.js:2470`

```js
  currentLevel = 1;
```

`game.js:2519-2523`

```js
function notifyMusicTrack(track, crossfade = false, creditsTimeline) {
  document.dispatchEvent(new CustomEvent("game-music-track", {
    detail: { track, crossfade, creditsTimeline },
  }));
}
```

`game.js:2607-2614`

```js
function startDeveloperTestLevel(level) {
  if (!DEVELOPER_MODE) return;
  selectedShipId = defaultShipId;
  restartGame();
  if (level === 2) startLevel2();
  else if (level === 3) startLevel3();
  notifyMusicTrack(currentLevel);
}
```

`game.js:2652`

```js
  notifyMusicTrack(currentLevel);
```

`game.js:2660-2665`

```js
startGameButton.addEventListener("click", () => {
  resetStartSelection();
  menuOptions.hidden = true;
  shipSelection.hidden = false;
  shipSelection.querySelector('input[name="ship"]:checked').focus();
});
```

`game.js:2675-2683`

```js
shipSelection.addEventListener("submit", (event) => {
  event.preventDefault();
  if (gameState !== "menu") return;
  selectedShipId = shipSelection.elements.namedItem("ship").value;
  selectedDifficulty = shipSelection.elements.namedItem("difficulty").value;
  restartGame();
  notifyMusicTrack(currentLevel);
  canvas.focus({ preventScroll: true });
});
```

`game.js:2739-2742`

```js
restartButton.addEventListener("click", () => {
  restartGame();
  notifyMusicTrack(currentLevel);
});
```

`game.js:2753-2763`

```js
  developerLevelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startDeveloperTestLevel(Number(button.dataset.developerLevel));
    });
  });
  developerBossButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startDeveloperTestBoss(Number(button.dataset.developerBoss));
    });
  });
  developerCreditsButton.addEventListener("click", () => startCredits());
```

`game.js:2770-2779`

```js
level2Button.addEventListener("click", () => {
  if (gameState !== "level1Cleared") return;
  startLevel2();
  notifyMusicTrack(currentLevel, true);
});
level3Button.addEventListener("click", () => {
  if (gameState !== "level2Cleared") return;
  startLevel3();
  notifyMusicTrack(currentLevel, true);
});
```

### Credits audio and return to menu

`game.js:548-549`

```js
// Local MP3 duration reported by afinfo. The media clock uses its runtime duration when available.
const creditsTrackDuration = 188.304;
```

`game.js:553`

```js
const creditsPostSongHold = 5;
```

`game.js:558`

```js
const endingFadeDuration = 0.6;
```

`game.js:610-612`

```js
let summaryFadeElapsed = null;
let creditsRun = null;
let previousFrameTime = 0;
```

`game.js:1209-1281`

```js
function startCredits(fadeIn = false) {
  gameState = "credits";
  summaryFadeElapsed = null;
  clearCombatForEnding();
  developerBossTestLevel = null;
  clearWaveEntrance();
  resetLevel3Descent();
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  playerInvulnerableUntil = 0;
  mainMenu.hidden = true;
  varnokDialogue.hidden = true;
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  const layout = createCreditsLayout();
  const run = {
    elapsed: 0, layout, audioPosition: 0, readPlayback: null, audioFinished: false,
    postSongElapsed: 0, fadeIn,
  };
  creditsRun = run;
  previousFrameTime = 0;
  notifyMusicTrack("credits", true, {
    setClock(readPlayback) {
      run.readPlayback = readPlayback;
    },
    finish(ended) {
      syncCreditsToAudio(run);
      if (ended && run.layout.duration - run.elapsed < 0.15) run.elapsed = run.layout.duration;
      run.audioFinished = true;
    },
  });
  if (!run.readPlayback) run.audioFinished = true;
}

function syncCreditsToAudio(run) {
  if (!run.readPlayback) return;
  const { position, duration } = run.readPlayback();
  if (!Number.isFinite(position) || position <= run.audioPosition) return;
  const audioDuration = Number.isFinite(duration) && duration > 0 ? duration : creditsTrackDuration;
  const elapsedAudio = position - run.audioPosition;
  const remainingAudio = audioDuration - run.audioPosition;
  const remainingRoll = run.layout.duration - run.elapsed;
  // Retime only the remaining roll when metadata arrives. Keep the current position intact.
  const advance = remainingAudio > 0
    ? remainingRoll * Math.min(1, elapsedAudio / remainingAudio)
    : elapsedAudio;
  run.elapsed = Math.min(run.elapsed + advance, run.layout.duration);
  run.audioPosition = position;
}

function updateCredits(deltaSeconds) {
  const run = creditsRun;
  if (!run.audioFinished) {
    syncCreditsToAudio(run);
    return;
  }
  const rollStep = Math.min(deltaSeconds, run.layout.duration - run.elapsed);
  run.elapsed += rollStep;
  run.postSongElapsed += deltaSeconds - rollStep;
  if (run.postSongElapsed < creditsPostSongHold) return;

  creditsRun = null;
  gameState = "menu";
  gameStatus.hidden = true;
  resetStartSelection();
  shipSelection.hidden = true;
  howToPlay.hidden = true;
  menuOptions.hidden = false;
  mainMenu.hidden = false;
  notifyMusicTrack(1);
}
```

`game.js:4405-4411`

```js
const continueToCreditsButton = document.getElementById("continue-to-credits");

continueToCreditsButton.addEventListener("click", () => {
  if (gameState !== "endingSummary" || summaryFadeElapsed !== null) return;
  summaryFadeElapsed = 0;
  continueToCreditsButton.disabled = true;
});
```

`game.js:4831-4835`

```js
  } else if (gameState === "endingSummary" && summaryFadeElapsed !== null) {
    summaryFadeElapsed += deltaSeconds;
    if (summaryFadeElapsed >= endingFadeDuration) startCredits(true);
  } else if (gameState === "credits") {
    updateCredits(deltaSeconds);
```
