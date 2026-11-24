"use strict";

const arcadeSounds = (() => {
  function tone(start, duration, fromHz, toHz, level, shape = "sine") {
    return { start, duration, fromHz, toHz, level, shape };
  }

  function noise(start, duration, cutoffHz, level) {
    return { start, duration, cutoffHz, level, shape: "noise" };
  }

  const machinegunPulse = [
    tone(0, 0.051, 900, 330, 0.025, "triangle"),
    noise(0, 0.026, 1700, 0.018),
  ];

  const effects = {
    playerShot: [
      tone(0, 0.105, 1020, 390, 0.049, "triangle"),
      tone(0.004, 0.061, 1740, 880, 0.011),
    ],
    machinegun: machinegunPulse,
    enemyShot: [
      tone(0, 0.135, 270, 490, 0.045, "triangle"),
      tone(0.012, 0.087, 560, 760, 0.012),
    ],
    enemyDestroyed: [
      noise(0, 0.160, 1200, 0.12),
      tone(0, 0.110, 225, 80, 0.074, "triangle"),
    ],
    bossHit: [
      tone(0, 0.068, 490, 220, 0.048, "triangle"),
      tone(0.003, 0.084, 1210, 1050, 0.022),
      noise(0, 0.035, 1850, 0.027),
    ],
    shieldAbsorb: [
      tone(0, 0.190, 580, 770, 0.078),
      tone(0.010, 0.155, 935, 1190, 0.036),
      tone(0.018, 0.105, 370, 510, 0.016),
    ],
    lifeLost: [
      noise(0, 0.186, 620, 0.088),
      tone(0, 0.275, 415, 102, 0.105, "triangle"),
      tone(0.018, 0.195, 285, 72, 0.04),
    ],
    pickup: [
      tone(0, 0.140, 659, 659, 0.068, "triangle"),
      tone(0.080, 0.220, 988, 988, 0.08, "triangle"),
      tone(0.083, 0.135, 1976, 1976, 0.013),
    ],
    bossDefeated: [
      noise(0, 0.285, 870, 0.145),
      tone(0, 0.230, 168, 58, 0.11, "triangle"),
      tone(0.160, 0.180, 392, 392, 0.077, "triangle"),
      tone(0.270, 0.180, 494, 494, 0.081, "triangle"),
      tone(0.380, 0.300, 659, 659, 0.086, "triangle"),
    ],
    gameOver: [
      tone(0, 0.195, 392, 392, 0.071, "triangle"),
      tone(0.145, 0.210, 330, 330, 0.072, "triangle"),
      tone(0.310, 0.410, 196, 196, 0.081, "triangle"),
      tone(0.320, 0.370, 98, 98, 0.033),
    ],
    formationTick: [
      tone(0, 0.035, 720, 560, 0.016, "triangle"),
      noise(0, 0.014, 1900, 0.008),
    ],
    formationTock: [
      tone(0, 0.044, 420, 295, 0.017, "triangle"),
      noise(0, 0.017, 1300, 0.007),
    ],
  };

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

  return { effects, renderEffect };
})();
