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
