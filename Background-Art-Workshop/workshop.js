(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-scene]')];
  const overlay = document.querySelector('#overlay-toggle');
  const sample = document.querySelector('#sample');
  const sampleLabel = document.querySelector('#sample-label');
  const title = document.querySelector('#active-title');
  const kind = document.querySelector('#active-kind');
  const desc = document.querySelector('#description');
  const background = document.querySelector('#background');
  const canvas = document.querySelector('#readability-overlay');
  const state = document.querySelector('#view-state');
  const scale = document.querySelector('#view-scale');
  let selected = 'menu';

  function setScene(id) {
    const plate = BackgroundPlates[id];
    selected = id;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === id)));
    kind.textContent = plate.label;
    title.textContent = plate.name;
    desc.textContent = plate.note;
    background.alt = plate.alt;
    if (background.getAttribute('src') !== plate.src) background.src = plate.src;
    renderOverlay();
  }
  function renderOverlay() {
    canvas.hidden = !overlay.checked;
    sampleLabel.hidden = selected !== 'level-3' || !overlay.checked;
    state.textContent = overlay.checked ? 'Placeholder overlay on' : 'Artwork only';
    if (!overlay.checked) return;
    const art = selected === 'menu' ? 'sample menu text' : selected === 'credits' ? 'sample credit text at one scroll position' : (selected === 'level-3' && sample.value === 'boss') ? 'representative boss, hatchlings, player ship, HUD, projectiles and pickups' : 'representative alien formation, player ship, HUD, projectiles and pickups';
    canvas.setAttribute('aria-label', `Readability test: ${art}. All are placeholders.`);
    ReadabilitySamples.draw(canvas, selected, sample.value);
  }
  function updateSize() {
    const shown = Math.round(background.getBoundingClientRect().width);
    scale.textContent = shown === 800 ? 'Shown at source size' : `Preview scaled to ${shown} px wide`;
  }
  buttons.forEach(button => button.addEventListener('click', () => setScene(button.dataset.scene)));
  overlay.addEventListener('change', renderOverlay);
  sample.addEventListener('change', renderOverlay);
  if ('ResizeObserver' in window) new ResizeObserver(updateSize).observe(background);
  else window.addEventListener('resize', updateSize, { passive: true });
  overlay.disabled = false;
  setScene(selected);
  updateSize();
})();
