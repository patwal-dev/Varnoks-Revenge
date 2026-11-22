(() => {
  'use strict';
  const { art, eyes, origin, duration, sample } = VarnokGeometry;
  const ns = 'http://www.w3.org/2000/svg';
  function node(name, attrs = {}, parent) {
    const item = document.createElementNS(ns, name);
    for (const [k, v] of Object.entries(attrs)) item.setAttribute(k, v);
    if (parent) parent.append(item);
    return item;
  }

  const setRect = (item, geometry) => {
    for (const k of ['x', 'y', 'width', 'height']) item.setAttribute(k, geometry[k]);
  };

  function addShadow(defs, id, x2, y2, reverse) {
    const gradient = node('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs);
    const stops = reverse ? [0.94, 0.71, 0] : [0, 0.71, 0.94];
    [0, .5, 1].forEach((offset, i) => node('stop', { offset, 'stop-color': '#201225', 'stop-opacity': stops[i] }, gradient));
  }

  // Shaded folds follow the outside of the aperture. They are also inside the
  // same tissue mask, so they can never contribute alpha to a live corridor.
  function rimPaths(rect) {
    const { x: l, y, width } = rect;
    const r = l + width;
    const a = y + 2;
    const b = 99;
    return [
      `M${l} ${a}L${l} ${b}Q${l-5} 97 ${l-6} 87C${l-8} 76 ${l-4} 69 ${l-6} 63Q${l-11} 45 ${l} ${a}Z`,
      `M${r} ${a}L${r} ${b}Q${r+5} 97 ${r+6} 87C${r+8} 76 ${r+4} 69 ${r+6} 63Q${r+11} 45 ${r} ${a}Z`,
      `M${l} ${y}Q${l+width*.18} ${y-9} ${l+width*.47} ${y-9}Q${r-width*.18} ${y-8} ${r} ${y}L${l} ${y}Z`
    ];
  }

  function addPassageArtwork(svg, defs, tag, artImage) {
    const mask = node('mask', { id: `${tag}-tissue`, x: 0, y: 0, width: art.width, height: art.height, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', 'mask-type': 'luminance' }, defs);
    node('rect', { x: 0, y: 0, width: art.width, height: art.height, fill: 'white' }, mask);
    const holes = eyes.map(() => node('rect', { fill: 'black', 'data-part': 'mask-hole' }, mask));
    const clip = node('clipPath', { id: `${tag}-eyes`, clipPathUnits: 'userSpaceOnUse' }, defs);
    const reveals = eyes.map(() => node('rect', { 'data-part': 'eye-reveal' }, clip));
    const directions = [['left', 1, 0, false], ['right', 1, 0, true], ['roof', 0, 1, false]];
    directions.forEach(([name, x2, y2, reverse]) => addShadow(defs, `${tag}-${name}`, x2, y2, reverse));

    artImage('tentacles', svg);
    const tissue = node('g', { mask: `url(#${tag}-tissue)` }, svg);
    artImage('body', tissue);
    artImage('seals', tissue);
    const folds = node('g', { 'data-part': 'rim-folds' }, tissue);
    const rims = eyes.map(() => directions.map(([name]) => node('path', { fill: `url(#${tag}-${name})` }, folds)));
    artImage('eyes', svg, { 'clip-path': `url(#${tag}-eyes)` });
    return model => {
      folds.setAttribute('opacity', Math.min(1, model.p * 2.8));
      model.passages.forEach((rect, i) => {
        setRect(holes[i], rect);
        setRect(reveals[i], model.exposedEyes[i]);
        rimPaths(rect).forEach((path, j) => rims[i][j].setAttribute('d', path));
      });
    };
  }

  // Two joined cubic curves per arm, in body coordinates. The right side mirrors these.
  const tentacleShapes = [
    { points: [[27, 47], [10, 42], [-25, 27], [-43, 1], [-55, -17], [-49, -39], [-27, -30]], thickness: 6, phase: 0.4, period: 8100, bend: 1.35, fill: '#8866ad' },
    { points: [[26, 57], [5, 57], [-25, 51], [-53, 39], [-77, 29], [-83, 7], [-62, 14]], thickness: 8, phase: 1.7, period: 9300, bend: 1.35, fill: '#76559e' },
    { points: [[29, 71], [8, 75], [-24, 79], [-59, 90], [-88, 100], [-88, 77], [-69, 69]], thickness: 9, phase: 3.1, period: 8600, bend: 0.9, fill: '#8866ad' },
    { points: [[36, 88], [17, 98], [-4, 112], [-25, 133], [-44, 152], [-68, 155], [-61, 131]], thickness: 7, phase: 4.2, period: 9800, bend: 1.35, fill: '#76559e' }
  ].map(shape => ({ ...shape, segments: sampleTentacle(shape.points) }));

  function sampleTentacle(points) {
    const steps = 16;
    const segments = [];
    let [x, y] = points[0];
    for (const offset of [0, 3]) {
      const [a, b, c, d] = points.slice(offset, offset + 4);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const s = 1 - t;
        const nextX = s ** 3 * a[0] + 3 * s * s * t * b[0] + 3 * s * t * t * c[0] + t ** 3 * d[0];
        const nextY = s ** 3 * a[1] + 3 * s * s * t * b[1] + 3 * s * t * t * c[1] + t ** 3 * d[1];
        const dx = nextX - x;
        const dy = nextY - y;
        segments.push({ length: Math.hypot(dx, dy), direction: Math.atan2(dy, dx) });
        x = nextX;
        y = nextY;
      }
    }
    return segments;
  }

  function waveTentacle({ shape, body, highlight }, elapsed, side) {
    const { segments } = shape;
    const phase = 2 * Math.PI * (elapsed % shape.period) / shape.period + shape.phase + side * 0.85;
    // Rotate successive sections without stretching them. The bend starts near the
    // root and travels outward, with greater rotation and curl farther along.
    const directions = segments.map(({ direction }, i) => {
      const reach = i / (segments.length - 1);
      return direction + Math.sin(reach * Math.PI / 2) * shape.bend * Math.sin(phase - reach * 3.6);
    });
    const edgeA = [], edgeB = [], shine = [];
    let [x, y] = shape.points[0];
    for (let i = 0; i <= segments.length; i++) {
      const before = directions[Math.max(0, i - 1)];
      const after = directions[Math.min(i, segments.length - 1)];
      const direction = before + Math.atan2(Math.sin(after - before), Math.cos(after - before)) / 2;
      const radius = shape.thickness * (1 - i / segments.length);
      const nx = -Math.sin(direction) * radius;
      const ny = Math.cos(direction) * radius;
      edgeA.push([x + nx, y + ny]);
      edgeB.push([x - nx, y - ny]);
      if (i / segments.length < 0.8) shine.push([x + nx * 0.45, y + ny * 0.45]);
      if (i < segments.length) {
        x += Math.cos(after) * segments[i].length;
        y += Math.sin(after) * segments[i].length;
      }
    }
    body.setAttribute('d', `M${edgeA.concat(edgeB.reverse()).join('L')}Z`);
    highlight.setAttribute('d', `M${shine.join('L')}`);
  }

  function addLivingBody(svg, tag) {
    const asset = VarnokArtwork['rooted-crown/body-living'];
    // Each preview needs its own IDs for the imported gradients and mirrored plates.
    const markup = decodeURIComponent(asset.slice(asset.indexOf(',') + 1))
      .replace(/(id="|url\(#|href="#)([\w-]+)/g, `$1${tag}-living-$2`);
    const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const layer = node('g', { 'data-layer': 'body-living' }, svg);
    for (const child of parsed.documentElement.children) layer.append(document.importNode(child, true));
    // Animate visible cheek groups directly instead of updating the source of two SVG <use> instances.
    const platesId = `${tag}-living-plates`;
    const source = layer.querySelector(`[id="${platesId}"]`);
    const cheeks = Array.from(layer.querySelectorAll(`use[href="#${platesId}"]`), (reference) => {
      const panel = source.cloneNode(true);
      panel.removeAttribute('id');
      const mirror = reference.getAttribute('transform');
      if (mirror) panel.setAttribute('transform', mirror);
      reference.replaceWith(panel);
      const tissue = panel.querySelector('[data-motion="tissue"]');
      const plate = panel.querySelector('[data-motion="plate"]');
      return { tissue, plate };
    });
    source.remove();

    const lowerJaw = layer.querySelector('[data-motion="lower-jaw"]');
    let exaggerated = false;
    const pulse = (elapsed, period) => (1 - Math.cos(2 * Math.PI * (elapsed % period) / period)) / 2;

    function setExaggerated(enabled) {
      exaggerated = enabled;
    }

    function draw(elapsed) {
      const breath = exaggerated ? pulse(elapsed, 4800) : pulse(elapsed + 1100, 7600);
      const flex = exaggerated ? breath : 0.73 * breath + 0.27 * pulse(elapsed, 14900) ** 4;
      const width = 1 + (exaggerated ? 0.09 : 0.04) * breath;
      const height = 1 + (exaggerated ? 0.39 : 0.25) * breath;
      for (const { tissue, plate } of cheeks) {
        tissue.setAttribute('transform', `translate(32 82) scale(${width} ${height}) translate(-32 -82)`);
        tissue.setAttribute('opacity', 0.78 + 0.22 * breath);
        plate.setAttribute('transform', `translate(${0.25 * breath} ${(exaggerated ? 1.55 : 0.95) * breath})`);
      }
      // Front view of a jaw pitching around the line through both mouth corners.
      // Preserve a partly open snarl at the smallest projected aperture.
      const angle = exaggerated ? 0.65 - 0.51 * flex : 0.43 - 0.13 * flex;
      const projection = Math.cos(angle) / Math.cos(0.4);
      lowerJaw.setAttribute('transform', `translate(0 71) scale(1 ${projection}) translate(0 -71)`);
    }
    return { layer, draw, setExaggerated };
  }

  function addRootedCrownArtwork(svg, defs, tag, artImage) {
    const tentacleColor = node('linearGradient', {
      id: `${tag}-tentacle-color`, gradientUnits: 'userSpaceOnUse', x1: 34, x2: -92, y1: 0, y2: 0
    }, defs);
    node('stop', { 'stop-color': '#382944' }, tentacleColor);
    node('stop', { offset: .38, 'stop-color': '#513d60' }, tentacleColor);
    node('stop', { offset: .72, 'stop-color': '#3d2c4c' }, tentacleColor);
    node('stop', { offset: 1, 'stop-color': '#483657' }, tentacleColor);

    const tentacles = eyes.map((_, i) => {
      const side = node('g', i === 0 ? {} : { transform: 'translate(200) scale(-1 1)' }, svg);
      return tentacleShapes.map(shape => {
        const body = node('path', { 'stroke-width': 1, 'stroke-linejoin': 'round' }, side);
        const highlight = node('path', { fill: 'none', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, side);
        return { shape, body, highlight };
      });
    });
    const shell = artImage('body-maw', svg);
    const living = addLivingBody(svg, tag);

    function setAppearance(previous, animateBody, exaggerated) {
      const layer = previous ? 'body-predatory' : 'body-maw';
      shell.setAttribute('href', VarnokArtwork[`rooted-crown/${layer}`]);
      shell.setAttribute('data-layer', layer);
      const useLiving = animateBody && !previous;
      shell.style.display = useLiving ? 'none' : '';
      living.layer.style.display = useLiving ? '' : 'none';
      living.setExaggerated(exaggerated);
      for (const { shape, body, highlight } of tentacles.flat()) {
        body.setAttribute('fill', previous ? shape.fill : `url(#${tag}-tentacle-color)`);
        body.setAttribute('stroke', previous ? '#44345f' : '#241a34');
        highlight.setAttribute('stroke', previous ? '#c98bc6' : '#796287');
        highlight.setAttribute('stroke-opacity', previous ? 0.75 : 0.46);
      }
    }

    const clip = node('clipPath', { id: `${tag}-lids`, clipPathUnits: 'userSpaceOnUse' }, defs);
    const lidColor = node('linearGradient', { id: `${tag}-lid-color`, x2: 0, y2: 1 }, defs);
    node('stop', { 'stop-color': '#59446e' }, lidColor);
    node('stop', { offset: 1, 'stop-color': '#2d203e' }, lidColor);
    const sockets = eyes.map((eye, i) => {
      const transform = `translate(${eye.cx} ${eye.cy}) scale(${i === 0 ? 1 : -1} 1)`;
      node('path', {
        transform, d: 'M-18-6-11-14 4-15 14-10 18-2 16 8 7 15-10 14-17 7Z',
        fill: `url(#${tag}-lid-color)`
      }, svg);
      return { transform, reveal: node('path', { transform }, clip) };
    });
    artImage('eyes-predatory', svg, { 'clip-path': `url(#${tag}-lids)` });
    const seams = sockets.map(({ transform }) => node('path', {
      transform, fill: 'none', stroke: '#21152b', 'stroke-width': 1.4, 'stroke-linejoin': 'round'
    }, svg));

    function drawArtwork({ p }, elapsed, tentacleTime) {
      living.draw(elapsed);
      // Two curves share the closed crease, then pull apart into upper and lower lids.
      const lid = `M-15 1C-8 ${-3 - 14.5 * p} 7 ${-1 - 16.5 * p} 15 1`
        + `C7 ${-1 + 18 * p} -8 ${-3 + 20 * p} -15 1Z`;
      sockets.forEach(({ reveal }, i) => {
        reveal.setAttribute('d', lid);
        seams[i].setAttribute('d', lid);
      });
      tentacles.forEach((side, i) => side.forEach(tentacle => waveTentacle(tentacle, tentacleTime, i)));
    }
    return { drawArtwork, setAppearance };
  }

  function createView(slot, index) {
    const tag = `varnok-view-${index}`;
    const rooted = slot.dataset.concept === 'rooted-crown';
    // Only the viewport expands. The original body and guides still use their local coordinates.
    const svg = node('svg', rooted
      ? { width: 420, height: 280, viewBox: '-110 -85 420 280', focusable: 'false' }
      : { width: art.width, height: art.height, viewBox: '0 0 200 110', focusable: 'false' }, slot);
    if (slot.dataset.alt) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', slot.dataset.alt);
    } else svg.setAttribute('aria-hidden', 'true');
    const defs = node('defs', {}, svg);
    function artImage(layer, parent, extra = {}) {
      const href = VarnokArtwork[`${slot.dataset.concept}/${layer}`];
      return node('image', { href, width: art.width, height: art.height, 'data-layer': layer, ...extra }, parent);
    }
    const artwork = rooted
      ? addRootedCrownArtwork(svg, defs, tag, artImage)
      : { drawArtwork: addPassageArtwork(svg, defs, tag, artImage) };

    const overlay = node('g', { class: 'guide-overlay', 'aria-hidden': 'true' }, svg);
    const boundsGroup = node('g', { 'data-overlay': 'bounds', class: 'guide-bounds' }, overlay);
    node('rect', { x: 0, y: 0, width: art.width, height: art.height }, boundsGroup);
    const passageGroup = node('g', { 'data-overlay': 'passages', class: 'guide-passages' }, overlay);
    const passageLines = eyes.map(() => node('rect', {}, passageGroup));
    const eyeGroup = node('g', { 'data-overlay': 'eyes', class: 'guide-eyes' }, overlay);
    eyes.forEach(eye => setRect(node('rect', {}, eyeGroup), eye));
    const originGroup = node('g', { 'data-overlay': 'origin', class: 'guide-origin' }, overlay);
    node('circle', { cx: origin.x, cy: origin.y, r: 3 }, originGroup);
    node('path', { d: 'M100 -6v3m0 6v3m-6-6h3m6 0h3' }, originGroup);
    return { ...artwork, rooted, passageLines, groups: { bounds: boundsGroup, eyes: eyeGroup, passages: passageGroup, origin: originGroup } };
  }

  const views = Array.from(document.querySelectorAll('.slot'), createView);
  const play = document.querySelector('#play');
  const slider = document.querySelector('#timeline');
  const previousRooted = document.querySelector('#rooted-previous');
  const animateRooted = document.querySelector('#rooted-body-motion');
  const exaggerateRooted = document.querySelector('#rooted-exaggerated');
  const freezeRooted = document.querySelector('#rooted-freeze');
  const bodyTimeReadout = document.querySelector('#rooted-body-time');
  const position = document.querySelector('#position');
  const phase = document.querySelector('#phase');
  const aperture = document.querySelector('#aperture');
  const presets = [...document.querySelectorAll('button[data-time]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let time = 0;
  let artworkTime = 0;
  let frozenRooted = null;
  let running = false;
  let frame = 0;
  let lastTime = null;

  function updateBodyTime() {
    const enabled = animateRooted.checked && !previousRooted.checked;
    const status = enabled ? (running ? 'playing' : 'paused') : 'off';
    bodyTimeReadout.textContent = `Body animation ${(artworkTime / 1000).toFixed(2)} s · ${status}`;
  }

  function draw() {
    const model = sample(time);
    for (const view of views) {
      const frozen = view.rooted ? frozenRooted : null;
      const viewModel = frozen ? frozen.model : model;
      view.drawArtwork(viewModel, artworkTime, frozen ? frozen.time : artworkTime);
      viewModel.passages.forEach((rect, i) => {
        setRect(view.passageLines[i], rect);
        view.passageLines[i].style.visibility = rect.width > 0 ? 'visible' : 'hidden';
      });
    }
    const seconds = (model.t / 1000).toFixed(3);
    slider.value = Math.round(model.t);
    slider.setAttribute('aria-valuetext', `${seconds} seconds, ${model.phase.toLowerCase()}`);
    position.textContent = `${seconds} s / 6.000 s`;
    if (phase.textContent !== model.phase) phase.textContent = model.phase;
    aperture.textContent = `${model.passages[0].width.toFixed(1)} px passage guide width`;
    updateBodyTime();
  }

  function animate(now) {
    if (!running) return;
    if (lastTime !== null) {
      const elapsed = now - lastTime;
      time = (time + elapsed) % duration;
      artworkTime += elapsed;
    }
    lastTime = now;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function setPlayback(next) {
    running = next;
    lastTime = null;
    cancelAnimationFrame(frame);
    play.textContent = running ? 'Pause cycle' : 'Play cycle';
    updateBodyTime();
    if (running) frame = requestAnimationFrame(animate);
  }

  function seek(ms) {
    setPlayback(false);
    time = ms;
    artworkTime = ms;
    draw();
  }

  play.addEventListener('click', () => setPlayback(!running));
  slider.addEventListener('input', () => seek(Number(slider.value)));
  const updateRootedAppearance = () => {
    animateRooted.disabled = previousRooted.checked;
    exaggerateRooted.disabled = previousRooted.checked || !animateRooted.checked;
    const exaggerated = !exaggerateRooted.disabled && exaggerateRooted.checked;
    views.forEach(view => view.setAppearance?.(previousRooted.checked, animateRooted.checked, exaggerated));
    draw();
  };
  previousRooted.addEventListener('change', updateRootedAppearance);
  animateRooted.addEventListener('change', updateRootedAppearance);
  exaggerateRooted.addEventListener('change', updateRootedAppearance);
  freezeRooted.addEventListener('change', () => {
    frozenRooted = freezeRooted.checked ? { model: sample(time), time: artworkTime } : null;
    draw();
  });
  if (freezeRooted.checked) frozenRooted = { model: sample(time), time: artworkTime };
  updateRootedAppearance();
  for (const control of presets) control.addEventListener('click', () => seek(Number(control.dataset.time)));
  for (const control of document.querySelectorAll('[data-guide]')) {
    const updateGuide = () => views.forEach(view => view.groups[control.dataset.guide].classList.toggle('on', control.checked));
    control.addEventListener('change', updateGuide);
    updateGuide();
  }
  document.addEventListener('visibilitychange', () => { lastTime = null; });
  reduced.addEventListener('change', event => { if (event.matches) setPlayback(false); });
  for (const control of [play, slider, previousRooted, freezeRooted, ...presets]) control.disabled = false;
})();
