"use strict";

const canvas = document.querySelector("#preview-canvas");
const ctx = canvas.getContext("2d");
const sceneTitle = document.querySelector("#scene-title");
const sceneDescription = document.querySelector("#scene-description");
const hud = document.querySelector("#preview-hud");
const sceneButtons = [...document.querySelectorAll("[data-scene]")];
const overlayToggle = document.querySelector("#show-overlay");
const motionToggle = document.querySelector("#motion-toggle");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const sceneCache = new Map();
let currentScene = "menu";
let playing = !motionPreference.matches;
let lastFrame = null;
let frameId = null;
let elapsed = 0;

function loadArt(path) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = path;
  return image;
}

const artwork = {
  player: loadArt("./assets/kestrel.svg"),
  supply: loadArt("./assets/vesper-supply.svg"),
  level1: loadArt("./assets/level-1-clack.svg"),
  level2: loadArt("./assets/level-2-anvil.svg"),
  level3: loadArt("./assets/level-3-rift.svg"),
};

const boltShell = new Path2D("M3.5 0 6.5 2.5 7 7 5.5 10.5 3.5 13 1.5 10.5 0 7 0.5 2.5Z");
const boltCore = new Path2D("M3.5 2 5.1 4 5 7.5 3.5 11 2 7.5 1.9 4Z");
const boltColors = {
  level1: ["#61773c", "#d6e89b"],
  level2: ["#a65740", "#f3b37c"],
  level3: ["#92364e", "#ffaca0"],
};
const crate = [
  ["#9bafb9", "M3 0H19L22 3V19L19 22H3L0 19V3Z"],
  ["#263c4e", "M4 1H18L21 4V18L18 21H4L1 18V4Z"],
  ["#68849a", "M3 5 5 3H17L19 5V8H3Z"],
  ["#455f73", "M3 10H19V17L17 19H5L3 17Z"],
  ["#1b2b3b", "M3 8H19V10H3ZM8 11H14V16H8ZM5 16H7V18H5ZM15 16H17V18H15Z"],
  ["#b8c8cd", "M3 1H7V3H4L3 4V7H1V3ZM15 1H19L21 3V7H19V4L18 3H15ZM1 15H3V18L4 19H7V21H3L1 19ZM19 15H21V19L19 21H15V19H18L19 18Z"],
  ["#89e6e0", "M9 12H13V14H9Z"],
].map(([color, path]) => [color, new Path2D(path)]);

function centered(image, x, y, width, height) {
  if (image.naturalWidth) ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
}

function roundedBox(x, y, width, height, radius, fill, outline) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.stroke();
}

function menuOverlay() {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.shadowColor = "#1cc5f06b";
  ctx.shadowBlur = 18;
  const outline = ctx.createLinearGradient(82, 156, 716, 449);
  outline.addColorStop(0, "#21edff");
  outline.addColorStop(1, "#ff3bd4");
  roundedBox(80, 153, 640, 294, 16, "#091123", outline);
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 44px Arial, sans-serif";
  ctx.fillStyle = "#f1f7ff";
  ctx.fillText("SPACE SHOOTER", 400, 198);

  const actions = ["START GAME", "How to Play", "Music: Off", "Sound effects: Off"];
  actions.forEach((label, index) => {
    const y = 234 + index * 47;
    const isStart = index === 0;
    const fill = ctx.createLinearGradient(250, y, 550, y + 40);
    fill.addColorStop(0, "#42faff");
    fill.addColorStop(1, "#ff64d9");
    roundedBox(250, y, 300, 39, 6, isStart ? fill : "#142239", isStart ? "#76f4ff" : "#52677e");
    ctx.fillStyle = isStart ? "#170d1c" : "#d1e4f5";
    ctx.font = isStart ? "900 18px Arial, sans-serif" : "bold 15px Arial, sans-serif";
    ctx.fillText(label, 400, y + 20);
  });
  centered(artwork.level1, 160, 283, 44, 44);
  centered(artwork.level3, 192, 333, 40, 40);
  centered(artwork.level2, 137, 360, 38, 38);
  centered(artwork.player, 638, 318, 92, 81);
  ctx.restore();
}

function gameplayOverlay(scene) {
  const rows = { level1: 2, level2: 3, level3: 4 };
  ctx.save();
  for (let row = 0; row < rows[scene]; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      if (row === 1 && column === 4) continue;
      centered(artwork[scene], 230 + 65 * column, 90 + 55 * row, 30, 30);
    }
  }

  const enemyShotPositions = {
    level1: [[652, 145], [353, 323], [505, 477]],
    level2: [[255, 313], [129, 443], [541, 423]],
    level3: [[314, 346], [566, 290], [676, 116]],
  };
  for (const [x, y] of enemyShotPositions[scene]) {
    ctx.save();
    ctx.translate(x - 3.5, y);
    ctx.fillStyle = boltColors[scene][0];
    ctx.fill(boltShell);
    ctx.fillStyle = boltColors[scene][1];
    ctx.fill(boltCore);
    ctx.restore();
  }
  ctx.fillStyle = "#ffe08a";
  ctx.fillRect(393, 443, 5, 14);
  ctx.fillRect(460, 318, 5, 14);

  const playerHeight = 34;
  centered(artwork.player, 400, 548, playerHeight * 232 / 204, playerHeight);
  if (scene === "level1") {
    ctx.fillStyle = "#65bd83";
    [160, 400, 640].forEach((x) => ctx.fillRect(x - 55, 358, 110, 28));
  } else {
    centered(artwork.supply, 641, 42, 49.5, 49.5 * 232 / 248);
    ctx.save();
    ctx.translate(129, 458);
    for (const [color, path] of crate) {
      ctx.fillStyle = color;
      ctx.fill(path);
    }
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(5, 11, 21, 0.95)";
    ctx.fillStyle = "#ffe08a";
    const message = scene === "level2" ? "Machinegun!" : "Shield!";
    ctx.strokeText(message, 400, 582);
    ctx.fillText(message, 400, 582);
  }
  ctx.restore();
}

function creditsOverlay() {
  const lines = ["Victory", "Game Design", "Development", "Playtesting"];
  const sampleTime = 8.75;
  lines.forEach((line, index) => {
    const progress = (sampleTime - index * 2.3) / 20;
    const scale = 1 / (1 + 5 * progress);
    ctx.save();
    ctx.translate(400, 90 + (645 - 90) * scale);
    ctx.scale(scale, scale * (0.82 - 0.24 * progress));
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = index === 0 ? "#ffffff" : "#bfd0e3";
    ctx.font = index === 0 ? "bold 54px Arial, sans-serif" : "40px Arial, sans-serif";
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
}

function render() {
  const metadata = backgroundScenes.scenes[currentScene];
  if (!sceneCache.has(currentScene)) {
    sceneCache.set(currentScene, backgroundScenes.makeLayer(metadata, canvas.width, canvas.height));
  }
  backgroundScenes.draw(ctx, metadata, sceneCache.get(currentScene), elapsed);
  if (!overlayToggle.checked) return;

  if (currentScene === "menu") menuOverlay();
  else if (currentScene === "credits") creditsOverlay();
  else gameplayOverlay(currentScene);
}

function updateScene() {
  const isLevel = Object.hasOwn(boltColors, currentScene);
  const sceneButton = sceneButtons.find((button) => button.dataset.scene === currentScene);
  const metadata = backgroundScenes.scenes[currentScene];
  sceneTitle.textContent = metadata.title;
  sceneDescription.textContent = metadata.description;
  hud.hidden = !(isLevel && overlayToggle.checked);
  for (const button of sceneButtons) {
    button.setAttribute("aria-pressed", String(button === sceneButton));
  }
  const foreground = overlayToggle.checked ? " with representative foreground" : "";
  canvas.setAttribute("aria-label", sceneButton.textContent + " background" + foreground);
  render();
}

function frame(now) {
  if (lastFrame !== null) elapsed += Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  render();
  frameId = requestAnimationFrame(frame);
}

function updateMotion() {
  motionToggle.textContent = playing ? "Pause twinkle" : "Resume twinkle";
  if (playing && frameId === null) {
    frameId = requestAnimationFrame(frame);
  } else if (!playing && frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
    lastFrame = null;
  }
}

for (const button of sceneButtons) {
  button.addEventListener("click", () => {
    currentScene = button.dataset.scene;
    updateScene();
  });
}
overlayToggle.addEventListener("change", updateScene);
motionToggle.addEventListener("click", () => {
  playing = !playing;
  updateMotion();
});
motionPreference.addEventListener("change", (event) => {
  playing = !event.matches;
  updateMotion();
});

updateScene();
updateMotion();
