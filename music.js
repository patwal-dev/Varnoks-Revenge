(() => {
  const musicButtons = [...document.querySelectorAll("[data-music-toggle]")];
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  const storageKey = "hamk-space-shooter-music";
  let musicEnabled = false;
  let audioContext = null;
  let musicBuffer = null;
  let musicSource = null;

  try {
    musicEnabled = window.localStorage.getItem(storageKey) === "on";
  } catch {
    // Keep the default when the browser blocks access to storage.
  }

  function updateButtons() {
    for (const button of musicButtons) {
      button.textContent = musicEnabled ? "Music: On" : "Music: Off";
      button.setAttribute("aria-pressed", String(musicEnabled));
    }
  }

  function createMusicBuffer() {
    const melody = [
      261.63, 329.63, 392, 329.63,
      293.66, 349.23, 440, 349.23,
      246.94, 293.66, 392, 293.66,
      261.63, 329.63, 392, 523.25,
    ];
    const bass = [130.81, 146.83, 123.47, 130.81];
    const sampleRate = audioContext.sampleRate;
    const samplesPerNote = Math.round(0.48 * sampleRate);
    const buffer = audioContext.createBuffer(1, melody.length * samplesPerNote, sampleRate);
    const samples = buffer.getChannelData(0);

    melody.forEach((frequency, index) => {
      const bassFrequency = bass[Math.floor(index / 4)];
      for (let sample = 0; sample < samplesPerNote; sample += 1) {
        const time = sample / sampleRate;
        const remaining = (samplesPerNote - 1 - sample) / sampleRate;
        const envelope = Math.min(1, time / 0.04, remaining / 0.16);
        const lead = Math.sin(2 * Math.PI * frequency * time) * 0.026;
        const low = Math.sin(2 * Math.PI * bassFrequency * time) * 0.018;
        samples[index * samplesPerNote + sample] = (lead + low) * envelope;
      }
    });
    return buffer;
  }

  async function startMusic() {
    try {
      audioContext ??= new AudioContext();
      if (audioContext.state !== "running") await audioContext.resume();
      // The preference may have changed or another click may have started the loop.
      if (!musicEnabled || musicSource !== null || audioContext.state !== "running") return;

      musicBuffer ??= createMusicBuffer();
      const source = audioContext.createBufferSource();
      source.buffer = musicBuffer;
      source.loop = true;
      source.connect(audioContext.destination);
      source.start();
      musicSource = source;
    } catch {
      // Retry on a later button click if audio could not start.
    }
  }

  if (!AudioContext) {
    for (const button of musicButtons) {
      button.textContent = "Music unavailable";
      button.disabled = true;
    }
    return;
  }

  updateButtons();
  document.addEventListener("click", (event) => {
    if (!event.isTrusted) return;
    const clickedButton = event.target.closest("button");
    if (clickedButton === null) return;
    if (musicButtons.includes(clickedButton)) {
      musicEnabled = !musicEnabled;
      updateButtons();
      try {
        window.localStorage.setItem(storageKey, musicEnabled ? "on" : "off");
      } catch {
        // The toggle still works for the current page.
      }
    }

    if (musicEnabled) {
      startMusic();
    } else if (musicSource !== null) {
      musicSource.stop();
      musicSource.disconnect();
      musicSource = null;
    }
  });
})();
