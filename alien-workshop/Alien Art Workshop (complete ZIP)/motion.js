(() => {
  const button = document.querySelector('#toggle');
  const regularStage = document.querySelector('#regular-stage');
  const hatchStage = document.querySelector('#hatch-stage');
  const regularLabel = document.querySelector('#regular-phase');
  const hatchLabel = document.querySelector('#hatch-phase');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const period = 7200;
  const makeActors = stage => Array.from(stage.querySelectorAll('img'), img => ({ img, angle: 0, phase: '' }));
  const regularActors = makeActors(regularStage);
  const hatchActors = makeActors(hatchStage);
  let elapsed = 0;
  let lastTime = null;
  let frame = 0;
  let playing = false;

  const shortest = (from, to) => ((to - from + 180) % 360 + 360) % 360 - 180;
  const smooth = t => t * t * (3 - 2 * t);
  const drift = t => Math.sin(2 * Math.PI * t) * Math.sin(Math.PI * t) ** 2;

  // The painted front is at the bottom (0°). A positive CSS rotation
  // turns that front left, so the screen-space tangent uses -dx.
  function curve(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const pos = i => u ** 3 * p0[i] + 3 * u ** 2 * t * p1[i] + 3 * u * t ** 2 * p2[i] + t ** 3 * p3[i];
    const speed = i => 3 * (u ** 2 * (p1[i] - p0[i]) + 2 * u * t * (p2[i] - p1[i]) + t ** 2 * (p3[i] - p2[i]));
    return { x: pos(0), y: pos(1), angle: Math.atan2(-speed(0), speed(1)) * 180 / Math.PI };
  }

  function regularPose(t, index, width, height) {
    const direction = index === 0 ? -1 : 1;
    const reach = Math.min(84, width * .145) * direction;
    const rest = 61;
    const outside = height + 25;
    if (t < 1500) {
      return { phase: 'Sideways formation', x: 18 * drift(t / 1500), y: rest, angle: 0 };
    }
    if (t < 3420) {
      const u = ((t - 1500) / 1920) ** 1.22;
      return { phase: 'Diagonal dive', ...curve([0, rest], [0, rest + 37], [reach * .28, outside - 44], [reach, outside], u) };
    }
    if (t < 3740) {
      return { phase: 'Offscreen wrap', x: -reach * .62, y: -24, angle: 0, hidden: true };
    }
    if (t < 5500) {
      const u = 1 - (1 - (t - 3740) / 1760) ** 1.35;
      return { phase: 'Curved return', ...curve([-reach * .62, -24], [-reach * .27, 3], [0, 33], [0, rest], u) };
    }
    return { phase: 'Settled formation', x: 0, y: rest, angle: 0 };
  }

  function hatchPose(t, index, width) {
    const direction = index === 0 ? -1 : 1;
    const reach = Math.min(63, width * .114) * direction;
    const rest = 160;
    if (t < 900) return { phase: 'Formation', x: 0, y: rest, angle: 0 };
    if (t < 1600) {
      return { phase: 'Turn to launch', x: 0, y: rest, angle: -direction * 180 * smooth((t - 900) / 700) };
    }
    if (t < 3330) {
      const u = ((t - 1600) / 1730) ** 1.15;
      return { phase: 'Upward launch', ...curve([0, rest], [0, 79], [reach * .27, 37], [reach * .72, 37], u) };
    }
    if (t < 5490) {
      const u = 1 - (1 - (t - 3330) / 2160) ** 1.23;
      return { phase: 'Turn and return', ...curve([reach * .72, 37], [reach * 1.50, 37], [0, 105], [0, rest], u) };
    }
    return { phase: 'Settled formation', x: 0, y: rest, angle: 0 };
  }

  function paint(actor, pose, rest) {
    // Reseed while hidden, and on the first return frame in case a browser
    // skipped the hidden interval. No visible tween across the teleport.
    const comesFromWrap = pose.phase === 'Curved return' && actor.phase !== pose.phase;
    actor.angle = pose.hidden || comesFromWrap ? pose.angle : actor.angle + shortest(actor.angle, pose.angle);
    actor.phase = pose.phase;
    actor.img.style.visibility = pose.hidden ? 'hidden' : 'visible';
    actor.img.style.transform = `translate(${pose.x.toFixed(3)}px, ${(pose.y - rest).toFixed(3)}px) rotate(${actor.angle.toFixed(3)}deg)`;
  }

  function draw() {
    const t = elapsed % period;
    const rw = regularStage.clientWidth;
    const rh = regularStage.clientHeight;
    const hw = hatchStage.clientWidth;
    const regular = regularActors.map((_, i) => regularPose(t, i, rw, rh));
    const hatch = hatchActors.map((_, i) => hatchPose(t, i, hw));
    regularActors.forEach((actor, i) => paint(actor, regular[i], 61));
    hatchActors.forEach((actor, i) => paint(actor, hatch[i], 160));
    if (regularLabel.textContent !== regular[0].phase) regularLabel.textContent = regular[0].phase;
    if (hatchLabel.textContent !== hatch[0].phase) hatchLabel.textContent = hatch[0].phase;
  }

  function tick(now) {
    if (!playing) return;
    if (lastTime !== null) elapsed += Math.min(now - lastTime, 70);
    lastTime = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function setPlaying(next) {
    playing = next;
    lastTime = null;
    button.textContent = playing ? 'Pause motion' : 'Play motion';
    cancelAnimationFrame(frame);
    if (playing) frame = requestAnimationFrame(tick);
  }

  button.addEventListener('click', () => setPlaying(!playing));
  document.addEventListener('visibilitychange', () => { lastTime = null; });
  reducedMotion.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  window.addEventListener('resize', draw, { passive: true });
  draw();
  button.disabled = false;
})();
