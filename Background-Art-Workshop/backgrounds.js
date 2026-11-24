(() => {
  'use strict';
  // Artwork manifest only: no overlay, UI references, or game logic.
  const dir = './assets/backgrounds/';
  const scenes = [
    { id: 'menu', label: '01 / Main menu', name: 'The Veil', file: 'menu-the-veil.webp', alt: 'Slate-blue dust at the upper left fades into dark central space.', note: 'A thin shelf of slate-blue dust drifts in from the upper left. The central and right areas are left open for the menu.' },
    { id: 'level-1', label: '02 / Level 1', name: 'Outer Debris', file: 'level-1-outer-debris.webp', alt: 'Distant charcoal fragments cluster near the lower-right corner of an open navy starfield.', note: 'The first combat space stays open. A few cold basalt fragments in the lower right suggest the edge of a distant debris belt.' },
    { id: 'level-2', label: '03 / Level 2', name: 'Wreck Tide', file: 'level-2-wreck-tide.webp', alt: 'The broken ribs of an orbital truss enter dark space from the upper right.', note: 'A broken orbital truss replaces the amber sun. Cold jade-grey reflections pick out the wreckage at the upper right, away from the main combat area.' },
    { id: 'level-3', label: '04 / Level 3 and boss', name: 'Hollow Reach', file: 'level-3-hollow-reach.webp', alt: 'Dim violet geological folds enter from the left while most of the field remains dark navy.', note: 'An alien fold presses in from the left. The top center stays dark so Varnok’s purple body can read separately from the quieter violet geology.' },
    { id: 'credits', label: '05 / Credits', name: 'Afterlight', file: 'credits-afterlight.webp', alt: 'Faint blue dust is confined to the lower-left corner, leaving a quiet dark center.', note: 'The menu’s slate-blue dust appears again, farther away and lower in the frame. The central column is kept quiet from top to bottom for scrolling credits.' }
  ];
  globalThis.BackgroundPlates = Object.freeze(Object.fromEntries(scenes.map(scene => [scene.id, Object.freeze({ ...scene, src: dir + scene.file, width: 800, height: 600 })])));
})();
