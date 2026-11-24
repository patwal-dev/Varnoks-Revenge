const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");

const noop = () => {};
const canvasContext = new Proxy({}, {
  get(target, key) {
    return target[key] ?? noop;
  },
});
const elements = new Map();

function makeElement() {
  return {
    width: 800,
    height: 600,
    style: {},
    dataset: {},
    parentElement: {},
    classList: { add: noop, toggle: noop },
    getContext: () => canvasContext,
    addEventListener: noop,
    setAttribute: noop,
    append: noop,
    focus: noop,
    querySelectorAll: () => [],
  };
}

let layoutRoll = 0;
const game = vm.createContext({
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement());
      return elements.get(id);
    },
    createElement: makeElement,
    querySelector: makeElement,
    querySelectorAll: () => [],
    dispatchEvent: noop,
    addEventListener: noop,
  },
  window: { addEventListener: noop, localStorage: { getItem: () => null } },
  crypto: { getRandomValues: values => values.fill(layoutRoll) },
  Image: class { addEventListener() {} },
  Path2D: class {},
  CustomEvent: class {},
  requestAnimationFrame: noop,
  performance: { now: () => 0 },
});
vm.runInContext(readFileSync(join(__dirname, "../game.js"), "utf8"), game);
const run = code => vm.runInContext(code, game);

module.exports = { game, run, setLayoutRoll(value) { layoutRoll = value; } };
