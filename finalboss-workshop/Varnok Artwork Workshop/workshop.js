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

  function createView(slot, index) {
    const tag = `varnok-view-${index}`;
    const svg = node('svg', { width: art.width, height: art.height, viewBox: '0 0 200 110', focusable: 'false' }, slot);
    if (slot.dataset.alt) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', slot.dataset.alt);
    } else svg.setAttribute('aria-hidden', 'true');
    const defs = node('defs', {}, svg);
    const mask = node('mask', { id: `${tag}-tissue`, x: 0, y: 0, width: art.width, height: art.height, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', 'mask-type': 'luminance' }, defs);
    node('rect', { x: 0, y: 0, width: art.width, height: art.height, fill: 'white' }, mask);
    const holes = eyes.map(() => node('rect', { fill: 'black', 'data-part': 'mask-hole' }, mask));
    const clip = node('clipPath', { id: `${tag}-eyes`, clipPathUnits: 'userSpaceOnUse' }, defs);
    const reveals = eyes.map(() => node('rect', { 'data-part': 'eye-reveal' }, clip));
    const directions = [['left', 1, 0, false], ['right', 1, 0, true], ['roof', 0, 1, false]];
    directions.forEach(([name, x2, y2, reverse]) => addShadow(defs, `${tag}-${name}`, x2, y2, reverse));

    function artImage(layer, parent, extra = {}) {
      return node('image', { href: `./assets/${slot.dataset.concept}/${layer}.svg`, width: art.width, height: art.height, 'data-layer': layer, ...extra }, parent);
    }
    artImage('tentacles', svg);
    const tissue = node('g', { mask: `url(#${tag}-tissue)` }, svg);
    artImage('body', tissue);
    artImage('seals', tissue);
    const folds = node('g', { 'data-part': 'rim-folds' }, tissue);
    const rims = eyes.map(() => directions.map(([name]) => node('path', { fill: `url(#${tag}-${name})` }, folds)));
    artImage('eyes', svg, { 'clip-path': `url(#${tag}-eyes)` });

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
    return { holes, reveals, rims, folds, passageLines, groups: { bounds: boundsGroup, eyes: eyeGroup, passages: passageGroup, origin: originGroup } };
  }

  const views = Array.from(document.querySelectorAll('.slot'), createView);
  const play = document.querySelector('#play');
  const slider = document.querySelector('#timeline');
  const position = document.querySelector('#position');
  const phase = document.querySelector('#phase');
  const aperture = document.querySelector('#aperture');
  const presets = [...document.querySelectorAll('button[data-time]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let time = 0;
  let running = false;
  let frame = 0;
  let lastTime = null;

  function draw() {
    const model = sample(time);
    const rimGeometry = model.passages.map(rimPaths);
    for (const view of views) {
      view.folds.setAttribute('opacity', Math.min(1, model.p * 2.8));
      model.passages.forEach((rect, i) => {
        setRect(view.holes[i], rect);
        setRect(view.passageLines[i], rect);
        view.passageLines[i].style.visibility = rect.width > 0 ? 'visible' : 'hidden';
        setRect(view.reveals[i], model.exposedEyes[i]);
        rimGeometry[i].forEach((path, j) => view.rims[i][j].setAttribute('d', path));
      });
    }
    const seconds = (model.t / 1000).toFixed(3);
    slider.value = Math.round(model.t);
    slider.setAttribute('aria-valuetext', `${seconds} seconds, ${model.phase.toLowerCase()}`);
    position.textContent = `${seconds} s / 6.000 s`;
    if (phase.textContent !== model.phase) phase.textContent = model.phase;
    aperture.textContent = `${(45 * model.p).toFixed(1)} px passage width`;
  }

  function animate(now) {
    if (!running) return;
    if (lastTime !== null) time = (time + now - lastTime) % duration;
    lastTime = now;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function setPlayback(next) {
    running = next;
    lastTime = null;
    cancelAnimationFrame(frame);
    play.textContent = running ? 'Pause cycle' : 'Play cycle';
    if (running) frame = requestAnimationFrame(animate);
  }

  function seek(ms) {
    setPlayback(false);
    time = ms;
    draw();
  }

  play.addEventListener('click', () => setPlayback(!running));
  slider.addEventListener('input', () => seek(Number(slider.value)));
  for (const control of presets) control.addEventListener('click', () => seek(Number(control.dataset.time)));
  for (const control of document.querySelectorAll('[data-guide]')) {
    const updateGuide = () => views.forEach(view => view.groups[control.dataset.guide].classList.toggle('on', control.checked));
    control.addEventListener('change', updateGuide);
    updateGuide();
  }
  document.addEventListener('visibilitychange', () => { lastTime = null; });
  reduced.addEventListener('change', event => { if (event.matches) setPlayback(false); });
  draw();
  for (const control of [play, slider, ...presets]) control.disabled = false;
})();
