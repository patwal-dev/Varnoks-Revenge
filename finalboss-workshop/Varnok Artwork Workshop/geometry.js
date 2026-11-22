(() => {
  'use strict';
  const art = Object.freeze({ width: 200, height: 110, centerX: 100, centerY: 55 });
  const eyes = Object.freeze([48, 152].map(cx => Object.freeze({ cx, cy: 41, x: cx - 15, y: 28, width: 30, height: 26 })));
  const origin = Object.freeze({ x: 100, y: 0 });
  const duration = 6000;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ease = t => t * t * (3 - 2 * t);

  function rectIntersection(a, b) {
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    return { x, y, width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x), height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y) };
  }

  function sample(milliseconds) {
    const t = clamp(milliseconds, 0, duration);
    const phase = t < 2000 || t === duration ? 'Closed' : t < 2500 ? 'Opening' : t < 5500 ? 'Fully open' : 'Closing';
    let p = 0;
    if (phase === 'Opening') p = ease((t - 2000) / 500);
    if (phase === 'Fully open') p = 1;
    if (phase === 'Closing') p = ease((6000 - t) / 500);
    const width = 45 * p;
    const y = 54 - 26 * p;
    const passages = eyes.map(eye => ({ x: eye.cx - width / 2, y, width, height: art.height - y }));
    return { t, phase, p, passages, exposedEyes: eyes.map((eye, i) => rectIntersection(eye, passages[i])) };
  }

  globalThis.VarnokGeometry = Object.freeze({ art, eyes, origin, duration, sample });
})();
