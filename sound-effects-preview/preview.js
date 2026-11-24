"use strict";

const { effects, renderEffect } = arcadeSounds;
const machinegunBurst = [0, 0.4, 0.8, 1.2].flatMap((offset) =>
  effects.machinegun.map((layer) => ({ ...layer, start: offset + layer.start })));

const playbackStatus = document.querySelector("#playback-status");
const buffers = new Map();
let audio;
let activeVoice;
let latestRequest = 0;

async function playEffect(button) {
  const request = ++latestRequest;
  const effect = button.dataset.effect;
  const label = button.getAttribute("aria-label").slice("Play ".length);

  try {
    audio ??= new AudioContext();
    if (audio.state !== "running") await audio.resume();
    if (request !== latestRequest) return;

    if (!buffers.has(effect)) {
      const layers = effect === "machinegun" ? machinegunBurst : effects[effect];
      const samples = renderEffect(layers, audio.sampleRate);
      const buffer = audio.createBuffer(1, samples.length, audio.sampleRate);
      buffer.copyToChannel(samples, 0);
      buffers.set(effect, buffer);
    }

    const now = audio.currentTime;
    if (activeVoice) {
      activeVoice.volume.gain.setValueAtTime(1, now);
      activeVoice.volume.gain.linearRampToValueAtTime(0, now + 0.015);
      activeVoice.source.stop(now + 0.015);
    }

    const source = audio.createBufferSource();
    const volume = audio.createGain();
    source.buffer = buffers.get(effect);
    source.connect(volume);
    volume.connect(audio.destination);
    activeVoice = { source, volume };
    source.onended = () => {
      source.disconnect();
      volume.disconnect();
      if (activeVoice?.source === source) {
        activeVoice = undefined;
        if (latestRequest === request) playbackStatus.textContent = "Choose a sound to play.";
      }
    };
    source.start(now);
    playbackStatus.textContent = `Playing ${label}.`;
  } catch {
    if (request === latestRequest) {
      playbackStatus.textContent = "Audio could not start. Select Play to try again.";
    }
  }
}

for (const button of document.querySelectorAll("button[data-effect]")) {
  button.addEventListener("click", () => playEffect(button));
}
