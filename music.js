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

  // game.js registers its controls first so level changes select their track before playback.
  for (const control of document.querySelectorAll("button:not([data-sound-effects-toggle]), #ship-selection input")) {
    control.addEventListener("click", handlePlaybackClick);
  }
})();
