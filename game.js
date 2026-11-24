const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const sceneBackgrounds = new Map(Object.entries(globalThis.BackgroundPlates ?? {}).map(([scene, plate]) => {
  const image = new Image();
  image.addEventListener("error", () => {
    console.warn("Using the default starfield after background load failure:", image.src);
  }, { once: true });
  image.src = `Background-Art-Workshop/${plate.src}`;
  return [scene, image];
}));
const bossFlashCanvas = document.createElement("canvas");
bossFlashCanvas.width = canvas.width;
bossFlashCanvas.height = canvas.height;
const bossFlashContext = bossFlashCanvas.getContext("2d");
const bossHitFlashDuration = 100;
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const difficultyDisplay = document.getElementById("difficulty");
const gameStatus = document.getElementById("game-status");
const mainMenu = document.getElementById("main-menu");
const menuOptions = document.getElementById("menu-options");
const startGameButton = document.getElementById("start-game");
const shipSelection = document.getElementById("ship-selection");
const shipSelectionBackButton = document.getElementById("ship-selection-back");
const howToPlay = document.getElementById("how-to-play");
const howToPlayButton = document.getElementById("show-how-to-play");
const menuBackButton = document.getElementById("menu-back");
const musicToggle = document.getElementById("music-toggle");
const soundEffectsToggle = document.querySelector("[data-sound-effects-toggle]");
const soundEffectsStorageKey = "hamk-space-shooter-sound-effects";
let soundEffectsEnabled = false;
const restartButton = document.getElementById("restart");
const level2Button = document.getElementById("level-2");
const level3Button = document.getElementById("level-3");
const varnokDialogue = document.getElementById("varnok-dialogue");
const varnokFightButton = document.getElementById("varnok-fight");
const developerTestingPanel = document.getElementById("developer-testing");
const developerBankEffect = document.getElementById("developer-bank-effect");
const developerBossAnimationPanel = document.getElementById("developer-boss-animation");
const developerExaggerateAnimation = document.getElementById("developer-exaggerate-animation");
const developerBossAnimationReadout = document.getElementById("developer-boss-animation-readout");
const developerMeasureCanvasButton = document.getElementById("developer-measure-canvas");
const developerCanvasReadout = document.getElementById("developer-canvas-readout");
const developerWaveEntranceReadout = document.getElementById("developer-wave-entrance");
const developerLevelButtons = document.querySelectorAll("[data-developer-level]");
const developerBossButtons = document.querySelectorAll("[data-developer-boss]");
const developerCreditsButton = document.getElementById("developer-test-credits");
const developerRewardButtons = document.querySelectorAll("[data-developer-reward]");
const gameMain = document.querySelector("main");
const DEVELOPER_MODE = true;
let developerBossTestLevel = null;
let developerForcedSupplyReward = null;

const playerSpawnY = canvas.height - 52;
const playerMinY = playerSpawnY - 60;
const playerMaxY = playerSpawnY;
const playerShotMuzzleOffset = 5;
const playerFullBankWidthScale = 0.84;
const playerMaxBankSkew = 0.12;
const playerMaxBankRotation = 2 * Math.PI / 180;
const playerBankEaseSpeed = 12;
const playerBankDeadZoneSpeed = 6;
let playerBank = 0;
const player = {
  x: canvas.width / 2,
  y: playerSpawnY,
  width: 42,
  height: 34,
  speed: 300,
};

function loadShipArtwork(id, width, height) {
  const image = new Image();
  const artwork = { image, width, height, ready: false, flashImage: null, wingShades: [] };
  image.addEventListener("load", () => {
    artwork.ready = true;
    const flashCanvas = document.createElement("canvas");
    flashCanvas.width = width;
    flashCanvas.height = height;
    const flashContext = flashCanvas.getContext("2d");
    if (flashContext === null) return;

    flashContext.drawImage(image, 0, 0, width, height);
    // Color only the visible parts of the ship for the existing white hit flash.
    flashContext.globalCompositeOperation = "source-in";
    flashContext.fillStyle = "#ffffff";
    flashContext.fillRect(0, 0, width, height);
    artwork.flashImage = flashCanvas;

    // Shade each wing from the same unflipped alpha mask to preserve the engine outlines.
    artwork.wingShades = [0, width].map((edgeX) => {
      const shadeCanvas = document.createElement("canvas");
      shadeCanvas.width = width;
      shadeCanvas.height = height;
      const shadeContext = shadeCanvas.getContext("2d");
      if (shadeContext === null) return null;
      shadeContext.drawImage(flashCanvas, 0, 0);
      shadeContext.globalCompositeOperation = "source-in";
      const shade = shadeContext.createLinearGradient(edgeX, 0, width / 2, 0);
      shade.addColorStop(0, "rgba(0, 0, 0, 0.24)");
      shade.addColorStop(1, "transparent");
      shadeContext.fillStyle = shade;
      shadeContext.fillRect(0, 0, width, height);
      return shadeCanvas;
    });
  });
  image.addEventListener("error", () => {
    console.error("Could not load ship artwork:", image.src);
  }, { once: true });
  image.src = `ship-workshop/assets/${id}.svg`;
  return artwork;
}

const defaultShipId = "kestrel";
const defaultDifficulty = "easy";
// Each wave shot timing lists the full-wave value first and the depleted-wave limit second.
const enemyDifficultySettings = {
  hard: {
    movementMultiplier: 1.15,
    waveKillSpeedBonus: 0.55,
    waveShotMinimum: [700, 480],
    waveShotJitter: [400, 240],
    level2WaveSpeedScale: 1.12,
    boss1SpeedScale: 1.12,
    boss1AttackInterval: 1350,
    boss1SpreadChargeDuration: 0.45,
    boss2MovementScale: 1.08,
    boss2PatrolDuration: 1.85,
  },
  ridiculous: {
    movementMultiplier: 1.2,
    waveKillSpeedBonus: 1,
    waveShotMinimum: [560, 360],
    waveShotJitter: [340, 190],
  },
};
const shipArtwork = {
  kestrel: loadShipArtwork("kestrel", 232, 204),
  vesper: loadShipArtwork("vesper", 232, 248),
  bastion: loadShipArtwork("bastion", 232, 159),
};
const playerLifeBurstPalettes = {
  kestrel: ["#98a8bc", "#ff846a", "#fff6df"],
  vesper: ["#c7e4e7", "#7de4d7", "#f3ffff"],
  bastion: ["#dbc4a9", "#f8af66", "#ffe2ad"],
};

const clackImage = new Image();
let clackImageReady = false;
clackImage.addEventListener("load", () => {
  clackImageReady = true;
});
clackImage.addEventListener("error", () => {
  console.error("Could not load the Clack alien artwork:", clackImage.src);
}, { once: true });
clackImage.src = "alien-workshop/Alien Art Workshop (complete ZIP)/assets/level-1-clack.svg";

const anvilImage = new Image();
let anvilImageReady = false;
anvilImage.addEventListener("load", () => {
  anvilImageReady = true;
});
anvilImage.addEventListener("error", () => {
  console.error("Could not load the Anvil alien artwork:", anvilImage.src);
}, { once: true });
anvilImage.src = "alien-workshop/Alien Art Workshop (complete ZIP)/assets/level-2-anvil.svg";

const riftImage = new Image();
let riftImageReady = false;
riftImage.addEventListener("load", () => {
  riftImageReady = true;
});
riftImage.addEventListener("error", () => {
  console.error("Could not load the Rift alien artwork:", riftImage.src);
}, { once: true });
riftImage.src = "alien-workshop/Alien Art Workshop (complete ZIP)/assets/level-3-rift.svg";

function loadAlienFormationPose(name) {
  const image = new Image();
  const artwork = { image, ready: false };
  image.addEventListener("load", () => {
    artwork.ready = true;
  }, { once: true });
  image.addEventListener("error", () => {
    console.error("Could not load alien formation pose:", image.src);
  }, { once: true });
  image.src = `assets/aliens/${name}-formation-pose-2.svg`;
  return artwork;
}

const regularAlienPose2 = ["clack", "anvil", "rift"].map(loadAlienFormationPose);

const hatchlingArtwork = ["bud", "hook", "crown"].map((name) => {
  const image = new Image();
  const artwork = { image, ready: false, pose2: loadAlienFormationPose(`hatchling-${name}`) };
  image.addEventListener("load", () => {
    artwork.ready = true;
  });
  image.addEventListener("error", () => {
    console.error("Could not load the hatchling alien artwork:", image.src);
  }, { once: true });
  image.src = `alien-workshop/Alien Art Workshop (complete ZIP)/assets/hatchling-${name}.svg`;
  return artwork;
});
const hatchlingVisualChoices = new WeakMap();
const hatchlingLaunchVisualTimes = new WeakMap();
const hatchlingReturnBatches = new WeakMap();
const hatchlingReturnVisuals = new WeakMap();
const hatchlingReturnPatterns = ["split", "sweep", "stagger"];
const alienAngles = new WeakMap();
const alienBurstPalettes = [
  ["#a2c259", "#8da743", "#e5f9c2"], // Clack
  ["#e49c61", "#d27654", "#ffe1a6"], // Anvil
  ["#ed7184", "#d35b73", "#ffaca0"], // Rift
];
const hatchlingBurstPalette = ["#aa78d7", "#cfa5ee", "#f9b8da"];
const alienBurstFragmentCount = 12;
const supplyShipBurstFragmentCount = 16;
const playerLifeBurstFragmentCount = 16;
const playerDeathBurstFragmentCount = 40;
const playerDeathDurationMs = 700;
const destructionFragmentLimit = 144;
const destructionFragments = [];

const sporeChoirImage = new Image();
let sporeChoirImageReady = false;
sporeChoirImage.addEventListener("load", () => {
  sporeChoirImageReady = true;
});
sporeChoirImage.addEventListener("error", () => {
  console.error("Could not load the Spore Choir boss artwork:", sporeChoirImage.src);
}, { once: true });
sporeChoirImage.src = "boss-workshop/Xal’Gorath Boss Art Workshop/assets/spore-choir.svg";

const ironSepulchreImage = new Image();
let ironSepulchreImageReady = false;
ironSepulchreImage.addEventListener("load", () => {
  ironSepulchreImageReady = true;
});
ironSepulchreImage.addEventListener("error", () => {
  console.error("Could not load the Iron Sepulchre boss artwork:", ironSepulchreImage.src);
}, { once: true });
ironSepulchreImage.src = "boss-workshop/Xal’Gorath Boss Art Workshop/assets/iron-sepulchre.svg";

const [sporeChoirSac, sporeChoirMembrane, sporeChoirFace,
  ironSepulchreArmour, ironSepulchreVents, ironSepulchreCenter] = [
  "spore-choir-base", "spore-choir-membrane", "spore-choir-face",
  "iron-sepulchre-base", "iron-sepulchre-seams", "iron-sepulchre-center",
].map((name) => {
  const image = new Image();
  const artwork = { image, ready: false, failed: false };
  image.addEventListener("load", () => {
    artwork.ready = true;
  }, { once: true });
  image.addEventListener("error", () => {
    artwork.failed = true;
    console.error("Could not load boss animation layer:", image.src);
  }, { once: true });
  image.src = `assets/bosses/${name}.svg`;
  return artwork;
});

// Use the SVG interiors as masks and paint the centre oval separately from its socket.
const sporeChoirSacInterior = new Path2D("M44 17c-6-9-15-12-23-8C12 12 7 18 6 26c-1 6 2 12 9 15 4 5 10 8 17 8 10 0 15-8 15-13 6-6 3-14-3-19Z");
const sporeChoirMembraneInterior = new Path2D("M56 4c11 0 21 7 21 20 0 8-4 14-10 16l-1 7c-2 5-6 9-10 9s-8-4-10-9l-1-7c-6-2-10-8-10-16C35 11 45 4 56 4Z");
const sporeChoirSideOval = new Path2D("M20 24c4-3 9-3 11 0-1 3-4 5-8 5-3 0-4-2-3-5Z");
const sporeChoirCentreOval = new Path2D("M50 28c3-1 9-1 12 0-1 2-4 3-6 3s-5-1-6-3Z");
const sporeChoirBlinkDuration = 0.62;

const [crownMawBody, crownMawCore, crownMawJaw] = ["body", "core", "jaw"].map((part) => {
  const image = new Image();
  const artwork = { image, ready: false };
  image.addEventListener("load", () => {
    artwork.ready = true;
  });
  image.addEventListener("error", () => {
    console.error("Could not load the Crown Maw boss artwork:", image.src);
  }, { once: true });
  image.src = `assets/bosses/crown-maw-${part}.svg`;
  return artwork;
});

// Choose decorative aliens once per menu load, independently of gameplay randomness.
const menuAlienImages = [clackImage, anvilImage, riftImage, ...hatchlingArtwork.map(({ image }) => image)];
const menuAliens = document.getElementById("menu-aliens");
const menuRandom = crypto.getRandomValues(new Uint32Array(4));
for (const [index, random] of menuRandom.entries()) {
  const choice = index + Math.floor((random / 0x100000000) * (menuAlienImages.length - index));
  [menuAlienImages[index], menuAlienImages[choice]] = [menuAlienImages[choice], menuAlienImages[index]];
  const image = document.createElement("img");
  image.src = menuAlienImages[index].src;
  image.alt = "";
  menuAliens.append(image);
}

const keysDown = new Set();
const shots = [];
const enemyShots = [];
let pendingEnemyRepeats = [];
const varnokMinionShots = new WeakSet();
const enemies = [];
// Keep the artwork in the existing projectile and pickup footprints.
function createCombatArtwork(layers) {
  return layers.map(([color, path]) => [color, new Path2D(path)]);
}

const rapidFireShotArtwork = createCombatArtwork([
  ["#277496", "M2.5 0 5 5.4 4.3 11.6 2.5 14 0.7 11.6 0 5.4Z"],
  ["#4ad8f6", "M2.5 1.4 4.2 5.8 3.7 11 2.5 13 1.3 11 0.8 5.8Z"],
  ["#dcfaff", "M2.5 2.8 3.35 6.1 3.1 10.6 2.5 11.9 1.9 10.6 1.65 6.1Z"],
]);

const alienBoltShell = new Path2D("M3.5 0 6.5 2.5 7 7 5.5 10.5 3.5 13 1.5 10.5 0 7 0.5 2.5Z");
const alienBoltCore = new Path2D("M3.5 2 5.1 4 5 7.5 3.5 11 2 7.5 1.9 4Z");
const alienShotArtwork = [
  ["#61773c", "#d6e89b"], // Clack
  ["#a65740", "#f3b37c"], // Anvil
  ["#92364e", "#ffaca0"], // Rift
  ["#aa78d7", "#dec0f4"], // Bud, Hook and Crown share these colors.
].map(([shell, core]) => [[shell, alienBoltShell], [core, alienBoltCore]]);

const sporeShotArtwork = createCombatArtwork([
  ["#65704a", "M3.5 0C5.5 1.7 7 4.5 7 7.3 7 10.6 5.6 13 3.5 13S0 10.6 0 7.3C0 4.5 1.5 1.7 3.5 0Z"],
  ["#d9dc8e", "M3.5 2.5C5.1 4.7 5.8 6.5 5.5 8.5 5.3 10.4 4.6 11.3 3.5 11.3S1.7 10.4 1.5 8.5C1.2 6.5 1.9 4.7 3.5 2.5Z"],
]);
const sporeBombArtwork = createCombatArtwork([
  ["#65704a", "M12 1 16 3 18 5 22 4 21 9 24 12 22 16 21 20 16 21 12 24 8 21 3 20 2 16 0 12 3 9 2 4 6 5 8 3Z"],
  ["#acb261", "M12 3 17 5 20 10 20 15 17 19 12 22 7 19 4 15 4 10 7 5Z"],
  ["#53633e", "M6 8 9 9 9 15 7 18 5 14ZM18 8 19 14 17 18 15 15 15 9Z"],
  ["#edf0ac", "M12 6 16 9 17 13 15 17 12 19 9 17 7 13 8 9Z"],
  ["#d89962", "M12 9 14 11 14 14 12 16 10 14 10 11Z"],
]);
const crownMawVolleyArtwork = createCombatArtwork([
  ["#a34562", "M1 0H6L7 4 5 10 3.5 13 2 10 0 4Z"],
  ["#d58095", "M2 2H5L5.4 5 3.5 10.5 1.6 5Z"],
]);
const crownMawAimedArtwork = createCombatArtwork([
  ["#7c3953", "M3.5 0 6.8 3.5 6.7 9 3.5 13 0.3 9 0.2 3.5Z"],
  ["#f3a5a7", "M3.5 2.3 5.4 5 5 8.8 3.5 11.1 2 8.8 1.6 5Z"],
  ["#a74e6b", "M3.5 2.3V11.1L2 8.8 1.6 5Z"],
]);
const supplyCrateArtwork = createCombatArtwork([
  ["#9bafb9", "M3 0H19L22 3V19L19 22H3L0 19V3Z"],
  ["#263c4e", "M4 1H18L21 4V18L18 21H4L1 18V4Z"],
  ["#68849a", "M3 5 5 3H17L19 5V8H3Z"],
  ["#455f73", "M3 10H19V17L17 19H5L3 17Z"],
  ["#1b2b3b", "M3 8H19V10H3ZM8 11H14V16H8ZM5 16H7V18H5ZM15 16H17V18H15Z"],
  ["#b8c8cd", "M3 1H7V3H4L3 4V7H1V3ZM15 1H19L21 3V7H19V4L18 3H15ZM1 15H3V18L4 19H7V21H3L1 19ZM19 15H21V19L19 21H15V19H18L19 18Z"],
  ["#89e6e0", "M9 12H13V14H9Z"],
]);

const shotSpeed = 420;
const shotInterval = 0.80;
const rapidFireShotInterval = 0.40;
const level2WeaponDuration = 10;
const doubleShotSpacing = 14;
const spreadShotAngle = 12 * Math.PI / 180;
const straightShotPattern = [[0, 0]];
const playerWeapons = {
  machinegun: {
    message: "Machinegun!",
    pattern: straightShotPattern,
    artwork: rapidFireShotArtwork,
    interval: rapidFireShotInterval,
  },
  double: {
    message: "Double shot!",
    pattern: [[-doubleShotSpacing / 2, 0], [doubleShotSpacing / 2, 0]],
    color: "#527dff",
  },
  spread: {
    message: "Spread shot!",
    pattern: [[0, -spreadShotAngle], [0, 0], [0, spreadShotAngle]],
    color: "#20f58a",
  },
};
const supplyRewards = ["shield", ...Object.keys(playerWeapons)];
const level2PickupMessageDuration = 2;
const enemyShotSpeed = 210;
const enemyShotIntervalMin = 900;
const enemyShotIntervalRange = 600;
const enemyRepeatGap = 0.15;
const bossAttackInterval = 1600;
const bossWideShotChance = 0.5;
const bossChargeDuration = 0.5;
const bossWideShotWidth = 24;
const bossSpreadHorizontalSpeed = 150;
const bossIntroSlideDuration = 0.8;
const varnokRevealDuration = 1.5;
const bossDisplayNames = {
  xalGorath: "Xal’Gorath, the Devourer",
  kaezarVhul: "Lord Kaezar Vhul",
  zhurKai: "Zhur-Kai, Matriarch of the Swarm",
  varnok: "Varnok, Destroyer of Worlds",
};
const level1BossHealth = 15;
const level1BossDefeatBonus = 100;
const level2BossHealth = 20;
const level2BossDefeatBonus = 200;
const level3BossHealth = level2BossHealth;
const level3BossDefeatBonus = 300;
const level3BossClosedDuration = 2;
const level3BossOpeningDuration = 0.5;
const level3BossVulnerableDuration = 2;
const level3BossClosingDuration = 0.5;
const level3BossCoreWidth = 36;
const level3BossCoreHeight = 30;
const level3BossVolleyInterval = 0.6;
const level3BossVolleyCount = 3;
const level3BossAimedShotInterval = 0.3;
const level3BossAimedShotCount = 3;
const level3BossProjectileOffset = 50;
const level3BossProjectileWidth = 7;
const level3BossHorizontalMargin = 18;
const level3BossTopMargin = 44;
const level3BossBottomMargin = 12;
const level3BossMinMoveDuration = 2;
const level3BossMaxMoveDuration = 4;
const level3BossLowHealthThreshold = 0.25;
const level3BossLowHealthMovementMultiplier = 1.15;
const varnokBossHealth = 19;
const varnokBossDefeatBonus = 300;
const varnokBossWidth = 200;
const varnokBossHeight = 110;
const varnokAlienBatchMinSize = 4;
const varnokAlienBatchMaxSize = 8;
const varnokAlienPopulationLimit = 12;
const varnokAlienLaunchDelay = 2;
const varnokAlienLaunchInterval = 0.3;
const varnokAlienReturnDelay = 0.5;
const varnokAlienLaunchSpeed = 180;
const varnokAlienReturnSpeed = 180;
const varnokHatchLeadTime = 0.28;
const varnokHatchOpenDuration = 0.24;
const varnokHatchCloseDuration = 0.28;
const varnokHatchEmergenceDuration = 0.22;
const varnokReinforcementMinDelay = 15;
const varnokReinforcementMaxDelay = 20;
const varnokReinforcementRetryDelay = 3;
const varnokFormationShapes = ["row", "block", "v", "invertedV"];
const varnokFormationColumnSpacing = 42;
const varnokFormationRowSpacing = 35;
const varnokEyeWidth = 30;
const varnokEyeHeight = 26;
const varnokEyePassageWidth = varnokEyeWidth * 1.5;
const varnokEyeOffsetX = 52;
const varnokEyeOffsetY = -14;
const varnokEyeClosedDuration = 2;
const varnokEyeOpeningDuration = 0.5;
const varnokEyeOpenDuration = 3;
const varnokEyeClosingDuration = 0.5;
const level2BossMoveDuration = 2;
const level2BossPrepareDuration = 0.8;
const level2BossMovementSpeed = 150;
const level2BossChargeSpeed = 616;
const level2BossPullbackDistance = 28;
const level2BossOvershootDistance = 20;
const level2BossRetreatDuration = 0.8;
const level2BossLaneOpacity = 0.12;
const level2BossLaneFadeDuration = 0.2;
const enemySize = 30;
const formationBeatIntervalMs = 450;
const enemySpeed = 65;
const formationColumns = 6;
const defaultFormationRows = 2;
const level2FormationRows = 3;
const level3FormationRows = 4;
const regularFormationShapes = ["Grid", "Chevron", "Staggered"];
const level3FormationDescentStep = 55;
const level3FormationDescentDuration = 0.35;
const level3DestructionBonusMultiplier = 1.15;
const wave2SpeedMultiplier = 1.15;
const level2BomberDelay = 2.5;
const level2BomberCooldown = 2;
const level2BomberSpeed = 260;
const level2BonusShipDelayMin = 7;
const level2BonusShipDelayMax = 15;
const level2BonusShipSpeed = 162;
const level2BonusShipWidth = 52.8;
const vesperArtWidth = 49.5;
// Preserve the on-screen height of the original rotated Vesper artwork.
const vesperArtHeight = vesperArtWidth * 232 / 248;
const level2BonusShipHeight = vesperArtHeight;

function loadSupplyShipArtwork(id, width, burstPalette) {
  const image = new Image();
  const artwork = { image, width, burstPalette, ready: false };
  image.addEventListener("load", () => {
    artwork.ready = true;
  }, { once: true });
  image.addEventListener("error", () => {
    console.error("Could not load supply ship artwork:", image.src);
  }, { once: true });
  image.src = `supply-ship-workshop/level-flight/assets/${id}.svg`;
  return artwork;
}

const supplyShipArtwork = {
  kestrel: loadSupplyShipArtwork("kestrel", vesperArtHeight * 204 / 232, ["#95a7bc", "#ff886c", "#fff5d9"]),
  vesper: loadSupplyShipArtwork("vesper", vesperArtWidth, ["#bedce4", "#64ccc2", "#f3ffff"]),
};
const supplyShipFallbackBurstPalette = ["#72d9ed", "#4aabd7", "#fff0c2"];

const level2ShieldPickupSpeed = 150;
const level2ShieldChargesMax = 2;
const level2ShieldDuration = 10;
const level2ShieldFadeDuration = 2;
const maxEnemySpeedMultiplier = 1.75;
const level1WaveCount = 2;
const level2WaveCount = 2;
const level3WaveCount = 2;
const waveEntranceDuration = 1.5;
const wave2ColumnEntryOrder = [0, 2, 4, 1, 3, 5];
const level1Wave2Entrances = [
  {
    name: "Split entry",
    duration: 1.62,
    getPath(enemy, index) {
      const column = index % formationColumns;
      const fromLeft = column < formationColumns / 2;
      const columnFromEdge = fromLeft ? column : formationColumns - 1 - column;
      return { startX: enemy.x + (fromLeft ? -195 : 195), delay: columnFromEdge * 0.12 };
    },
  },
  {
    name: "Sweeping curve",
    duration: 1.45,
    getPath(enemy, index) {
      const column = index % formationColumns;
      return {
        startX: 105 + column * 25,
        startY: -enemy.height / 2 - 8,
        delay: index * 0.065,
        bendX: 110,
        bendY: -38,
      };
    },
  },
  {
    name: "Alternating columns",
    duration: 1.45,
    getPath(_enemy, index) {
      const column = index % formationColumns;
      return { delay: wave2ColumnEntryOrder.indexOf(column) * 0.14 };
    },
  },
];
// Local MP3 duration reported by afinfo. The media clock uses its runtime duration when available.
const creditsTrackDuration = 188.304;
const creditsClosingHold = 5.5;
const creditsClosingFade = 4;
const creditsBackgroundTail = 7;
const creditsPostSongHold = 5;
const creditsEntryHeight = 218;
const creditsEntryPitch = 525;
const creditsBodyFont = "21px Arial, sans-serif";
const creditsNameFont = "bold 32px Arial, sans-serif";
const endingFadeDuration = 0.6;
const barrierWidth = 110;
const barrierHeight = 28;
const barrierHitPoints = 3;
let startingEnemyCount = 0;
let level2FormationOffsetX = 0;
let level3FormationDescentOffset = 0;
let level3RightBoundaryContacts = 0;
let level3DescentAnimation = null;
let level2Bomber = null;
let level2BomberTimer = 0;
let varnokAlienFormation = null;
let varnokHatchProgress = 0;
let varnokHatchLastRelease = null;
let level2BonusShip = null;
let level2BonusShipTimer = 0;
const level2Pickups = [];
let level2ShieldCharges = 0;
let level2ShieldTimeRemaining = 0;
let level2ActiveWeapon = null;
let level2PickupMessageText = "";
let level2PickupMessageTimeRemaining = 0;
let barriers = [];
let enemyDirection = 1;
let currentLevel = 1;
let selectedShipId = defaultShipId;
let selectedDifficulty = defaultDifficulty;
let currentWave = 1;
let waveEntrance = null;
let regularFormation = null;
let formationBeatElapsedMs = 0;
let formationAlternatePose = false;
let boss = null;
const level2Bosses = [];
let level2AttackOwner = null;
let nextLevel2Attacker = null;
let level2DefeatBonusTotal = 0;
let bossChargeElapsed = null;
let nextBossAttackTime = null;
let bossIntroElapsed = null;
let bossIntroStartY = null;
let bossIntroTargetY = null;
let score = 0;
let lives = 3;
let nextShotTime = 0;
let nextEnemyShotTime = null;
let combatElapsed = 0;
let sporeChoirBlink = null;
let playerInvulnerableUntil = 0;
let playerShieldProtectedUntil = 0;
let playerDeathStartedAt = null;
let gameState = "menu";
let summaryFadeElapsed = null;
let creditsRun = null;
let previousFrameTime = 0;
const stars = [];
let starSeed = 74821;

for (let index = 0; index < 90; index += 1) {
  starSeed = (starSeed * 48271) % 2147483647;
  const x = (starSeed / 2147483647) * canvas.width;
  starSeed = (starSeed * 48271) % 2147483647;
  const y = (starSeed / 2147483647) * canvas.height;
  stars.push({
    x,
    y,
    radius: index % 9 === 0 ? 1.3 : 0.65,
    alpha: index % 4 === 0 ? 0.8 : 0.45,
  });
}

function createEnemies() {
  destructionFragments.length = 0;
  formationBeatElapsedMs = 0;
  formationAlternatePose = false;
  const formationRows = getFormationRowCount();
  const useVariety = currentLevel !== 1 || currentWave !== 1;
  const roll = useVariety ? crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000 : 0;
  const shape = useVariety ? regularFormationShapes[Math.floor(roll * regularFormationShapes.length)] : null;
  const slots = [];
  if (currentLevel === 3) {
    resetLevel3Descent();
  }
  for (let row = 0; row < formationRows; row += 1) {
    for (let column = 0; column < formationColumns; column += 1) {
      const chevronDepth = shape === "Chevron" ? Math.min(column, formationColumns - 1 - column) * 16 : 0;
      const staggered = shape === "Staggered";
      const slot = {
        x: 230 + column * (staggered ? 59 : 65) + (staggered ? (row % 2) * 30 : 0),
        y: 90 + row * 55 + chevronDepth,
      };
      const enemy = {
        ...slot,
        width: enemySize,
        height: enemySize,
      };
      if (currentLevel === 2 || currentLevel === 3) {
        enemy.formationSlot = slots.length;
      }
      slots.push(slot);
      enemies.push(enemy);
    }
  }
  regularFormation = useVariety ? {
    shape,
    slots,
    left: Math.min(...slots.map((slot) => slot.x)) - enemySize / 2,
    right: Math.max(...slots.map((slot) => slot.x)) + enemySize / 2,
    bottom: Math.max(...slots.map((slot) => slot.y)) + enemySize / 2,
  } : null;
  updateWaveReadout();
  startingEnemyCount = enemies.length;
}

function resetLevel3Descent() {
  level3FormationDescentOffset = 0;
  level3RightBoundaryContacts = 0;
  level3DescentAnimation = null;
}

function getFormationRowCount() {
  if (currentLevel === 2) return level2FormationRows;
  if (currentLevel === 3) return level3FormationRows;
  return defaultFormationRows;
}

function isRegularFormationAlien(enemy) {
  return !enemy.isVarnokAlien && (enemy.bomberState === undefined || enemy.bomberState === "formation");
}

function updateFormationBeat(deltaSeconds) {
  if (gameState !== "playing" || waveEntrance !== null) return;
  const hasFormation = boss?.level === 4
    ? varnokAlienFormation?.aliens.some(isSettledVarnokAlien)
    : boss === null && level2Bosses.length === 0 && enemies.some(isRegularFormationAlien);
  if (!hasFormation) return;

  formationBeatElapsedMs += deltaSeconds * 1000;
  if (formationBeatElapsedMs < formationBeatIntervalMs) return;

  formationBeatElapsedMs -= formationBeatIntervalMs;
  formationAlternatePose = !formationAlternatePose;
  playSoundEffect(formationAlternatePose ? "formationTick" : "formationTock");
}

function updateWaveReadout(pattern = null) {
  if (!DEVELOPER_MODE) return;
  const lines = [];
  if (pattern) lines.push(`Wave 2 entrance: ${pattern.name}`);
  if (regularFormation) lines.push(`Formation: ${regularFormation.shape}`);
  developerWaveEntranceReadout.textContent = lines.join("\n");
  developerWaveEntranceReadout.hidden = lines.length === 0;
}

function clearWaveEntrance() {
  waveEntrance = null;
  regularFormation = null;
  updateWaveReadout();
}

function startWaveEntrance() {
  pendingEnemyRepeats.length = 0;
  let pattern = null;
  if (currentLevel === 1 && currentWave === 2) {
    const roll = crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
    pattern = level1Wave2Entrances[Math.floor(roll * level1Wave2Entrances.length)];
  }
  updateWaveReadout(pattern);

  const lowestEdge = Math.max(...enemies.map((enemy) => enemy.y + enemy.height / 2));
  const entranceOffset = -lowestEdge - 1;
  const paths = enemies.map((enemy, index) => {
    const path = {
      startX: enemy.x,
      startY: enemy.y + entranceOffset,
      targetX: enemy.x,
      targetY: enemy.y,
      delay: 0,
      bendX: 0,
      bendY: 0,
      duration: pattern?.duration ?? waveEntranceDuration,
      ...pattern?.getPath(enemy, index),
    };
    enemy.x = path.startX;
    enemy.y = path.startY;
    return path;
  });
  const duration = Math.max(waveEntranceDuration, ...paths.map((path) => path.delay + path.duration));
  waveEntrance = { paths, duration, elapsed: 0 };
  nextEnemyShotTime = null;
}

function updateWaveEntrance(deltaSeconds, frameTime) {
  waveEntrance.elapsed = Math.min(waveEntrance.elapsed + deltaSeconds, waveEntrance.duration);
  const finished = waveEntrance.elapsed === waveEntrance.duration;
  enemies.forEach((enemy, index) => {
    const { startX, startY, targetX, targetY, delay, duration, bendX, bendY } = waveEntrance.paths[index];
    if (finished || waveEntrance.elapsed >= delay + duration) {
      enemy.x = targetX;
      enemy.y = targetY;
      return;
    }
    const progress = Math.max(0, (waveEntrance.elapsed - delay) / duration);
    const easedProgress = progress * progress * (3 - 2 * progress);
    // At the midpoint, the bend is at its maximum offset from the straight path.
    const curve = 4 * easedProgress * (1 - easedProgress);
    enemy.x = startX + (targetX - startX) * easedProgress + bendX * curve;
    enemy.y = startY + (targetY - startY) * easedProgress + bendY * curve;
  });

  if (finished) {
    waveEntrance = null;
    nextEnemyShotTime = frameTime + getOrdinaryWaveShotTiming().minimum;
    if (currentLevel === 2 || currentLevel === 3) {
      level2BomberTimer = level2BomberDelay;
    }
  }
}

function startBossFight() {
  clearWaveEntrance();
  destructionFragments.length = 0;
  pendingEnemyRepeats.length = 0;
  shots.length = 0;
  enemyShots.length = 0;
  boss = {
    level: 1,
    x: canvas.width / 2,
    y: 100,
    width: 112,
    height: 58,
    speed: 110,
    direction: 1,
    health: level1BossHealth,
    maxHealth: level1BossHealth,
  };
  sporeChoirBlink = { organ: -1, startedAt: combatElapsed, nextStart: combatElapsed };
  bossChargeElapsed = null;
  nextBossAttackTime = null;
}

function startLevel2BossFight() {
  if (currentLevel !== 2 || boss !== null || level2Bosses.length > 0
    || enemies.length !== 0 || lives <= 0) return;

  clearWaveEntrance();
  destructionFragments.length = 0;
  pendingEnemyRepeats.length = 0;
  shots.length = 0;
  enemyShots.length = 0;
  level2DefeatBonusTotal = 0;
  if (selectedDifficulty === "ridiculous") {
    level2Bosses.push(
      createLevel2Boss(200, -1, { minX: 66, maxX: 302 }),
      createLevel2Boss(600, 1, { minX: 498, maxX: 734 }),
    );
  } else {
    level2Bosses.push(createLevel2Boss(canvas.width / 2, 1));
  }
  nextLevel2Attacker = level2Bosses[0];
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = 0;
  bossIntroStartY = -level2Bosses[0].height / 2;
  bossIntroTargetY = level2Bosses[0].y;
  for (const targetBoss of level2Bosses) targetBoss.y = bossIntroStartY;
  gameState = "bossIntro";
  keysDown.clear();
}

function createLevel2Boss(x, direction, patrolBounds = null) {
  return {
    level: 2,
    x,
    y: 104,
    width: 132,
    height: 68,
    speed: level2BossMovementSpeed,
    direction,
    patrolBounds,
    health: level2BossHealth,
    maxHealth: level2BossHealth,
    attackPhase: "move",
    attackPhaseElapsed: 0,
    chargePath: null,
    ramHitApplied: false,
  };
}

function clearLevel2BossEncounter() {
  level2Bosses.length = 0;
  level2AttackOwner = null;
  nextLevel2Attacker = null;
}

function startLevel3BossFight() {
  if (currentLevel !== 3 || currentWave !== level3WaveCount || enemies.length !== 0
    || lives <= 0 || gameState !== "playing") return;

  destructionFragments.length = 0;
  pendingEnemyRepeats.length = 0;
  clearDiveBomberState();
  enemies.length = 0;
  shots.length = 0;
  enemyShots.length = 0;
  barriers = [];
  level2BonusShip = null;
  level2BonusShipTimer = randomLevel2BonusShipDelay();
  // Boss 3 starts a fresh supply-ship countdown while dropped crates keep falling.
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  level2FormationOffsetX = 0;
  resetLevel3Descent();
  enemyDirection = 1;
  nextEnemyShotTime = null;
  clearWaveEntrance();
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  boss = {
    level: 3,
    x: canvas.width / 2,
    y: 120,
    width: 132,
    height: 68,
    health: level3BossHealth,
    maxHealth: level3BossHealth,
    armorPhase: "closed",
    armorPhaseElapsed: 0,
    openingAmount: 0,
    vulnerable: false,
    attackType: null,
    nextAttackShotIndex: 0,
    targetMarker: null,
    movement: null,
  };
  chooseNextLevel3BossDestination();
  nextShotTime = 0;
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
}

function startVarnokBossFight(showIntro = false) {
  if (currentLevel !== 3 || lives <= 0 || boss !== null || gameState !== "playing") return;

  destructionFragments.length = 0;
  pendingEnemyRepeats.length = 0;
  clearVarnokAlienFormation();
  clearDiveBomberState();
  enemies.length = 0;
  startingEnemyCount = 0;
  shots.length = 0;
  enemyShots.length = 0;
  barriers = [];
  level2BonusShip = null;
  level2BonusShipTimer = randomLevel2BonusShipDelay();
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerInvulnerableUntil = 0;
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  level2FormationOffsetX = 0;
  resetLevel3Descent();
  enemyDirection = 1;
  nextEnemyShotTime = null;
  clearWaveEntrance();
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  boss = {
    type: "varnok",
    level: 4,
    x: canvas.width / 2,
    y: 150,
    width: varnokBossWidth,
    height: varnokBossHeight,
    health: varnokBossHealth,
    maxHealth: varnokBossHealth,
    eyePhase: "closed",
    eyePhaseElapsed: 0,
    eyeOpeningAmount: 0,
    movement: null,
  };
  varnokAlienFormation = {
    elapsed: 0,
    nextBatchTime: varnokAlienLaunchDelay,
    previousShape: null,
    initialBatchSettled: false,
    nextLaunchSlot: 0,
    nextLaunchTime: null,
    slots: [],
    aliens: [],
    formationDirection: 1,
    descentAnimation: null,
  };
  formationBeatElapsedMs = 0;
  formationAlternatePose = false;
  level2BomberTimer = level2BomberDelay;
  chooseNextRandomizedBossDestination(boss);
  if (showIntro) {
    bossIntroElapsed = 0;
    bossIntroStartY = -boss.height;
    bossIntroTargetY = boss.y;
    boss.y = bossIntroStartY;
  }
  nextShotTime = 0;
  currentWave = level3WaveCount;
  keysDown.clear();
  gameState = showIntro ? "bossIntro" : "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
}

function advanceLevel2Formation() {
  if (currentLevel !== 2 || level2Bosses.length > 0 || enemies.length !== 0 || lives <= 0
    || gameState !== "playing") return;

  if (currentWave < level2WaveCount) {
    currentWave += 1;
    shots.length = 0;
    enemyShots.length = 0;
    enemies.length = 0;
    level2FormationOffsetX = 0;
    clearDiveBomberState();
    enemyDirection = 1;
    createEnemies();
    startWaveEntrance();
    return;
  }

  startLevel2BossFight();
}

function startBossIntro() {
  startBossFight();
  bossIntroElapsed = 0;
  bossIntroStartY = -boss.height / 2;
  bossIntroTargetY = boss.y;
  boss.y = bossIntroStartY;
  gameState = "bossIntro";
  keysDown.clear();
}

function updateBossIntro(deltaSeconds) {
  const isVarnok = boss?.level === 4;
  const introDuration = isVarnok ? varnokRevealDuration : bossIntroSlideDuration;
  bossIntroElapsed = Math.min(bossIntroElapsed + deltaSeconds, introDuration);
  const progress = bossIntroElapsed / introDuration;
  const slide = isVarnok ? progress * progress * (3 - 2 * progress) : progress;
  const y = bossIntroStartY + (bossIntroTargetY - bossIntroStartY) * slide;
  if (boss !== null) boss.y = y;
  for (const targetBoss of level2Bosses) targetBoss.y = y;

  if (progress === 1) {
    bossIntroElapsed = null;
    bossIntroStartY = null;
    bossIntroTargetY = null;
    gameState = isVarnok ? "varnokDialogue" : "playing";
    previousFrameTime = 0;
    if (isVarnok) {
      varnokDialogue.hidden = false;
      varnokFightButton.focus({ preventScroll: true });
    }
  }
}

function startLevel2() {
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  playerBank = 0;
  developerBossTestLevel = null;
  currentLevel = 2;
  currentWave = 1;
  barriers = [];
  shots.length = 0;
  enemyShots.length = 0;
  enemies.length = 0;
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  clearWaveEntrance();
  enemyDirection = 1;
  level2FormationOffsetX = 0;
  level2Bomber = null;
  level2BomberTimer = level2BomberDelay;
  level2BonusShip = null;
  level2BonusShipTimer = randomLevel2BonusShipDelay();
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  nextEnemyShotTime = null;
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
  createEnemies();
}

function startLevel3() {
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  playerBank = 0;
  developerBossTestLevel = null;
  currentLevel = 3;
  currentWave = 1;
  resetLevel3Descent();
  barriers = [];
  shots.length = 0;
  enemyShots.length = 0;
  enemies.length = 0;
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  clearWaveEntrance();
  enemyDirection = 1;
  level2FormationOffsetX = 0;
  level2Bomber = null;
  level2BomberTimer = level2BomberDelay;
  level2BonusShip = null;
  level2BonusShipTimer = randomLevel2BonusShipDelay();
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  nextEnemyShotTime = null;
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
  createEnemies();
}

function showLevel1ClearedScreen() {
  pendingEnemyRepeats.length = 0;
  gameState = "level1Cleared";
  keysDown.clear();
  shots.length = 0;
  enemyShots.length = 0;
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  restartButton.hidden = false;
  level2Button.hidden = false;
  level3Button.hidden = true;
}

function showLevel2ClearedScreen() {
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  gameState = "level2Cleared";
  keysDown.clear();
  shots.length = 0;
  enemyShots.length = 0;
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  restartButton.hidden = false;
  level2Button.hidden = true;
  level3Button.hidden = false;
}

function showLevel3BossDefeatedScreen() {
  pendingEnemyRepeats.length = 0;
  gameState = "level3BossDefeated";
  boss = null;
  clearDiveBomberState();
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  keysDown.clear();
  shots.length = 0;
  enemyShots.length = 0;
  restartButton.hidden = false;
  level2Button.hidden = true;
  level3Button.hidden = true;
}

function clearCombatForEnding() {
  destructionFragments.length = 0;
  playerDeathStartedAt = null;
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  clearVarnokAlienFormation();
  enemies.length = 0;
  clearVarnokBossEncounterState();
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  clearDiveBomberState();
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  keysDown.clear();
  shots.length = 0;
  enemyShots.length = 0;
  nextShotTime = 0;
  nextEnemyShotTime = null;
}

function finishVarnokEncounter() {
  const isBossTest = developerBossTestLevel === 4;
  gameState = isBossTest ? "varnokBossDefeated" : "endingSummary";
  clearCombatForEnding();
  restartButton.hidden = !isBossTest;
  level2Button.hidden = true;
  level3Button.hidden = true;
}

function startCredits(fadeIn = false) {
  gameState = "credits";
  summaryFadeElapsed = null;
  clearCombatForEnding();
  developerBossTestLevel = null;
  clearWaveEntrance();
  resetLevel3Descent();
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  playerInvulnerableUntil = 0;
  mainMenu.hidden = true;
  varnokDialogue.hidden = true;
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  const layout = createCreditsLayout();
  const run = {
    elapsed: 0, layout, audioPosition: 0, readPlayback: null, audioFinished: false,
    postSongElapsed: 0, fadeIn,
  };
  creditsRun = run;
  previousFrameTime = 0;
  notifyMusicTrack("credits", true, {
    setClock(readPlayback) {
      run.readPlayback = readPlayback;
    },
    finish(ended) {
      syncCreditsToAudio(run);
      if (ended && run.layout.duration - run.elapsed < 0.15) run.elapsed = run.layout.duration;
      run.audioFinished = true;
    },
  });
  if (!run.readPlayback) run.audioFinished = true;
}

function syncCreditsToAudio(run) {
  if (!run.readPlayback) return;
  const { position, duration } = run.readPlayback();
  if (!Number.isFinite(position) || position <= run.audioPosition) return;
  const audioDuration = Number.isFinite(duration) && duration > 0 ? duration : creditsTrackDuration;
  const elapsedAudio = position - run.audioPosition;
  const remainingAudio = audioDuration - run.audioPosition;
  const remainingRoll = run.layout.duration - run.elapsed;
  // Retime only the remaining roll when metadata arrives. Keep the current position intact.
  const advance = remainingAudio > 0
    ? remainingRoll * Math.min(1, elapsedAudio / remainingAudio)
    : elapsedAudio;
  run.elapsed = Math.min(run.elapsed + advance, run.layout.duration);
  run.audioPosition = position;
}

function updateCredits(deltaSeconds) {
  const run = creditsRun;
  if (!run.audioFinished) {
    syncCreditsToAudio(run);
    return;
  }
  const rollStep = Math.min(deltaSeconds, run.layout.duration - run.elapsed);
  run.elapsed += rollStep;
  run.postSongElapsed += deltaSeconds - rollStep;
  if (run.postSongElapsed < creditsPostSongHold) return;

  creditsRun = null;
  gameState = "menu";
  gameStatus.hidden = true;
  resetStartSelection();
  shipSelection.hidden = true;
  howToPlay.hidden = true;
  menuOptions.hidden = false;
  mainMenu.hidden = false;
  notifyMusicTrack(1);
}

function advanceLevel3Formation() {
  if (currentLevel !== 3 || enemies.length !== 0 || lives <= 0
    || gameState !== "playing") return;

  if (currentWave < level3WaveCount) {
    currentWave += 1;
    shots.length = 0;
    enemyShots.length = 0;
    enemies.length = 0;
    clearDiveBomberState();
    level2FormationOffsetX = 0;
    enemyDirection = 1;
    previousFrameTime = 0;
    createEnemies();
    startWaveEntrance();
    return;
  }

  startLevel3BossFight();
}

function clearDiveBomberState() {
  if (level2Bomber !== null) {
    delete level2Bomber.bomberState;
    delete level2Bomber.diveVelocityX;
    delete level2Bomber.diveVelocityY;
    delete level2Bomber.contactingPlayer;
  }
  level2Bomber = null;
  level2BomberTimer = 0;
}

function getEnemyMovementMultiplier() {
  return enemyDifficultySettings[selectedDifficulty]?.movementMultiplier ?? 1;
}

function getLevel2BossMovementMultiplier() {
  return getEnemyMovementMultiplier() * (enemyDifficultySettings[selectedDifficulty]?.boss2MovementScale ?? 1);
}

function getLevel2BossPatrolDuration() {
  return enemyDifficultySettings[selectedDifficulty]?.boss2PatrolDuration ?? level2BossMoveDuration;
}

function getWaveEliminatedFraction() {
  return startingEnemyCount > 0 ? 1 - enemies.length / startingEnemyCount : 0;
}

function getOrdinaryWaveShotTiming() {
  const tuning = enemyDifficultySettings[selectedDifficulty];
  if (!tuning) return { minimum: enemyShotIntervalMin, jitter: enemyShotIntervalRange };

  const fraction = getWaveEliminatedFraction();
  const [fullMinimum, depletedMinimum] = tuning.waveShotMinimum;
  const [fullJitter, depletedJitter] = tuning.waveShotJitter;
  return {
    minimum: fullMinimum + (depletedMinimum - fullMinimum) * fraction,
    jitter: fullJitter + (depletedJitter - fullJitter) * fraction,
  };
}

function scheduleEnemyRepeat(shooter, fire, shotsRemaining = 1, shotInterval = 0) {
  if (selectedDifficulty !== "ridiculous") return;

  pendingEnemyRepeats.push({
    shooter,
    encounterBoss: boss,
    fire,
    shotsRemaining,
    shotInterval,
    nextShotTime: combatElapsed + enemyRepeatGap,
  });
}

function updateEnemyRepeats() {
  if (pendingEnemyRepeats.length === 0) return false;
  let firedRepeat = false;

  // Recheck the original shooter after player-shot collisions and before firing.
  pendingEnemyRepeats = pendingEnemyRepeats.filter((repeat) => {
    const { shooter, encounterBoss } = repeat;
    if (encounterBoss !== boss) return false;
    if (shooter !== boss && (!enemies.includes(shooter)
      || (shooter.isVarnokAlien && !isSettledVarnokAlien(shooter)))) return false;
    if (combatElapsed + 1e-9 < repeat.nextShotTime) return true;

    repeat.fire();
    firedRepeat = true;
    repeat.shotsRemaining -= 1;
    repeat.nextShotTime += repeat.shotInterval;
    return repeat.shotsRemaining > 0;
  });
  return firedRepeat;
}

function fireBossWideShot() {
  enemyShots.push({
    x: boss.x,
    y: boss.y + boss.height / 2,
    width: bossWideShotWidth,
    height: 24,
    vy: enemyShotSpeed,
    isBossShot: true,
    artwork: sporeBombArtwork,
  });
  playSoundEffect("enemyShot");
}

function fireBossSpread() {
  const shotY = boss.y + boss.height / 2;
  const shotWidth = 7;
  const shotHeight = 13;
  enemyShots.push(
    {
      x: boss.x,
      y: shotY,
      width: shotWidth,
      height: shotHeight,
      vx: 0,
      vy: enemyShotSpeed,
      isBossShot: true,
      artwork: sporeShotArtwork,
    },
    {
      x: boss.x,
      y: shotY,
      width: shotWidth,
      height: shotHeight,
      vx: -bossSpreadHorizontalSpeed,
      vy: enemyShotSpeed,
      isBossShot: true,
      bounceAtWalls: true,
      artwork: sporeShotArtwork,
    },
    {
      x: boss.x,
      y: shotY,
      width: shotWidth,
      height: shotHeight,
      vx: bossSpreadHorizontalSpeed,
      vy: enemyShotSpeed,
      isBossShot: true,
      bounceAtWalls: true,
      artwork: sporeShotArtwork,
    },
  );
  playSoundEffect("enemyShot");
}

function updateBoss(deltaSeconds, frameTime) {
  if (boss.level === 3) {
    updateLevel3BossMovement(deltaSeconds);
    updateLevel3BossArmor(deltaSeconds);
    return;
  }
  if (boss.level === 4) {
    updateVarnokBossMovement(deltaSeconds);
    updateVarnokEyeCycle(deltaSeconds);
    updateVarnokAlienFormation(deltaSeconds, frameTime);
    return;
  }
  const halfWidth = boss.width / 2;
  const minX = halfWidth;
  const maxX = canvas.width - halfWidth;
  const tuning = enemyDifficultySettings[selectedDifficulty];
  const attackInterval = tuning?.boss1AttackInterval ?? bossAttackInterval;
  const chargeDuration = tuning?.boss1SpreadChargeDuration ?? bossChargeDuration;
  const nextX = boss.x + boss.direction * boss.speed * deltaSeconds
    * getEnemyMovementMultiplier() * (tuning?.boss1SpeedScale ?? 1);
  if (nextX < minX || nextX > maxX) boss.direction *= -1;
  boss.x = Math.max(minX, Math.min(maxX, nextX));

  if (bossChargeElapsed !== null) {
    bossChargeElapsed = Math.min(bossChargeElapsed + deltaSeconds, chargeDuration);
    if (bossChargeElapsed >= chargeDuration) {
      fireBossSpread();
      scheduleEnemyRepeat(boss, fireBossSpread);
      bossChargeElapsed = null;
      nextBossAttackTime = frameTime + attackInterval;
    }
  } else if (nextBossAttackTime === null) {
    nextBossAttackTime = frameTime + attackInterval;
  } else if (frameTime >= nextBossAttackTime) {
    if (Math.random() < bossWideShotChance) {
      fireBossWideShot();
      scheduleEnemyRepeat(boss, fireBossWideShot);
      nextBossAttackTime = frameTime + attackInterval;
    } else {
      bossChargeElapsed = 0;
      nextBossAttackTime = null;
    }
  }
}

function chooseNextLevel3BossDestination() {
  chooseNextRandomizedBossDestination(boss);
}

function chooseNextRandomizedBossDestination(targetBoss) {
  const bounds = getRandomizedBossMovementBounds(targetBoss);
  const currentX = targetBoss.x;
  const currentY = targetBoss.y;
  let destination = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (Math.random() < 0.5) {
      const distance = 80 + Math.random() * 100;
      const angle = Math.random() * Math.PI * 2;
      const candidate = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, currentX + Math.cos(angle) * distance)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, currentY + Math.sin(angle) * distance)),
      };
      if (Math.hypot(candidate.x - currentX, candidate.y - currentY) >= 80) {
        destination = candidate;
        break;
      }
    } else {
      const candidate = {
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      };
      if (Math.hypot(candidate.x - currentX, candidate.y - currentY) >= 180) {
        destination = candidate;
        break;
      }
    }
  }

  if (destination === null) {
    destination = [
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.minX, y: bounds.maxY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
    ].reduce((farthest, candidate) => (
      Math.hypot(candidate.x - currentX, candidate.y - currentY)
        > Math.hypot(farthest.x - currentX, farthest.y - currentY)
        ? candidate
        : farthest
    ));
  }
  targetBoss.movement = {
    startX: currentX,
    startY: currentY,
    destinationX: destination.x,
    destinationY: destination.y,
    elapsed: 0,
    duration: level3BossMinMoveDuration
      + Math.random() * (level3BossMaxMoveDuration - level3BossMinMoveDuration),
  };
}

function getRandomizedBossMovementBounds(targetBoss) {
  return {
    minX: targetBoss.width / 2 + level3BossHorizontalMargin,
    maxX: canvas.width - targetBoss.width / 2 - level3BossHorizontalMargin,
    minY: targetBoss.height / 2 + level3BossTopMargin,
    maxY: canvas.height / 2 - targetBoss.height / 2 - level3BossBottomMargin,
  };
}

function updateLevel3BossMovement(deltaSeconds) {
  const healthRatio = boss.health / boss.maxHealth;
  const speedMultiplier = healthRatio <= level3BossLowHealthThreshold
    ? level3BossLowHealthMovementMultiplier
    : 1;
  updateRandomizedBossMovement(deltaSeconds, boss, speedMultiplier);
}

function updateVarnokBossMovement(deltaSeconds) {
  updateRandomizedBossMovement(deltaSeconds, boss, 0.945);
}

function updateRandomizedBossMovement(deltaSeconds, targetBoss, speedMultiplier) {
  if (targetBoss.movement === null || deltaSeconds <= 0) return;
  const movement = targetBoss.movement;
  movement.elapsed = Math.min(
    movement.elapsed + deltaSeconds * speedMultiplier * getEnemyMovementMultiplier(),
    movement.duration,
  );
  const progress = movement.elapsed / movement.duration;
  const easedProgress = progress * progress * (3 - 2 * progress);
  targetBoss.x = movement.startX + (movement.destinationX - movement.startX) * easedProgress;
  targetBoss.y = movement.startY + (movement.destinationY - movement.startY) * easedProgress;
  if (progress >= 1) {
    targetBoss.x = movement.destinationX;
    targetBoss.y = movement.destinationY;
    chooseNextRandomizedBossDestination(targetBoss);
  }
}

function updateVarnokEyeCycle(deltaSeconds) {
  const phaseDurations = {
    closed: varnokEyeClosedDuration,
    opening: varnokEyeOpeningDuration,
    open: varnokEyeOpenDuration,
    closing: varnokEyeClosingDuration,
  };
  const nextPhases = {
    closed: "opening",
    opening: "open",
    open: "closing",
    closing: "closed",
  };
  let remainingTime = deltaSeconds;
  while (remainingTime > 0) {
    const phaseDuration = phaseDurations[boss.eyePhase];
    const elapsedThisStep = Math.min(
      remainingTime,
      phaseDuration - boss.eyePhaseElapsed,
    );
    boss.eyePhaseElapsed += elapsedThisStep;
    remainingTime -= elapsedThisStep;
    if (boss.eyePhaseElapsed >= phaseDuration) {
      boss.eyePhase = nextPhases[boss.eyePhase];
      boss.eyePhaseElapsed = 0;
    }
  }

  const progress = Math.min(
    1,
    boss.eyePhaseElapsed / (phaseDurations[boss.eyePhase] || 1),
  );
  const easedProgress = progress * progress * (3 - 2 * progress);
  if (boss.eyePhase === "opening") boss.eyeOpeningAmount = easedProgress;
  else if (boss.eyePhase === "open") boss.eyeOpeningAmount = 1;
  else if (boss.eyePhase === "closing") boss.eyeOpeningAmount = 1 - easedProgress;
  else boss.eyeOpeningAmount = 0;
}

function updateVarnokAlienFormation(deltaSeconds, frameTime) {
  const formation = varnokAlienFormation;
  if (boss?.level !== 4 || formation === null) return;

  const movementDelta = deltaSeconds * getEnemyMovementMultiplier();
  formation.elapsed += deltaSeconds;
  if (formation.nextBatchTime !== null && formation.elapsed >= formation.nextBatchTime) {
    reserveVarnokAlienBatch(formation);
  }
  while (formation.nextLaunchSlot < formation.slots.length
    && formation.elapsed >= formation.nextLaunchTime) {
    const body = getCenteredBounds(boss);
    const alien = {
      x: boss.x,
      y: body.top,
      width: enemySize,
      height: enemySize,
      isVarnokAlien: true,
      varnokState: "launching",
      returnWait: 0,
      launchX: boss.x,
      formationSlot: formation.nextLaunchSlot,
    };
    // Choose artwork independently of the random draws that control combat.
    const visualRandom = crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
    hatchlingVisualChoices.set(alien, hatchlingArtwork[Math.floor(visualRandom * hatchlingArtwork.length)]);
    hatchlingLaunchVisualTimes.set(alien, formation.elapsed);
    const batch = hatchlingReturnBatches.get(formation);
    if (batch) hatchlingReturnVisuals.set(alien, { batch, index: alien.formationSlot - batch.firstSlot });
    varnokHatchLastRelease = formation.elapsed;
    formation.aliens.push(alien);
    enemies.push(alien);
    formation.nextLaunchSlot += 1;
    formation.nextLaunchTime += varnokAlienLaunchInterval;
  }

  for (const alien of formation.aliens) {
    if (alien.varnokState === "launching") {
      alien.y -= varnokAlienLaunchSpeed * movementDelta;
      if (alien.y + alien.height / 2 < 0) {
        alien.varnokState = "waitingToReturn";
        alien.returnWait = varnokAlienReturnDelay;
      }
    } else if (alien.varnokState === "waitingToReturn") {
      alien.returnWait = Math.max(0, alien.returnWait - deltaSeconds);
      if (alien.returnWait === 0) {
        alien.x = alien.launchX;
        alien.y = -alien.height / 2;
        alien.varnokState = "returning";
        const arrival = hatchlingReturnVisuals.get(alien);
        const slot = formation.slots[alien.formationSlot];
        if (arrival) arrival.startDistance = Math.hypot(slot.x - alien.x, slot.y - alien.y);
      }
    } else if (alien.varnokState === "returning") {
      const slot = formation.slots[alien.formationSlot];
      const dx = slot.x - alien.x;
      const dy = slot.y - alien.y;
      const distance = Math.hypot(dx, dy);
      const step = varnokAlienReturnSpeed * movementDelta;
      if (distance <= step || distance === 0) {
        alien.x = slot.x;
        alien.y = slot.y;
        alien.varnokState = "formation";
      } else {
        alien.x += dx / distance * step;
        alien.y += dy / distance * step;
      }
    }
  }

  if (formation.nextBatchTime === null && formation.nextLaunchSlot === formation.slots.length
    && formation.aliens.every((alien) => alien.varnokState === "formation")) {
    formation.initialBatchSettled = true;
    const delayRange = varnokReinforcementMaxDelay - varnokReinforcementMinDelay;
    formation.nextBatchTime = formation.elapsed + varnokReinforcementMinDelay + Math.random() * delayRange;
  }
  if (formation.initialBatchSettled && formation.aliens.length > 0) {
    updateVarnokFormation(formation, deltaSeconds);
    updateLevel2Bomber(deltaSeconds, frameTime);
    if (gameState !== "playing") return;
  }
  updateAlienAngles(formation.aliens, deltaSeconds, formation);
  updateVarnokHatch(formation, deltaSeconds);
}

function updateVarnokHatch(formation, deltaSeconds) {
  const launchExpected = formation.nextBatchTime !== null
    && formation.nextBatchTime - formation.elapsed <= varnokHatchLeadTime
    && varnokAlienPopulationLimit - formation.aliens.length >= varnokAlienBatchMinSize;
  const batchLaunching = formation.nextLaunchTime !== null
    && formation.nextLaunchSlot < formation.slots.length;
  const hatchlingEmerging = varnokHatchLastRelease !== null
    && formation.elapsed - varnokHatchLastRelease < varnokHatchEmergenceDuration;
  if (launchExpected || batchLaunching || hatchlingEmerging) {
    varnokHatchProgress = Math.min(1, varnokHatchProgress + deltaSeconds / varnokHatchOpenDuration);
  } else {
    varnokHatchProgress = Math.max(0, varnokHatchProgress - deltaSeconds / varnokHatchCloseDuration);
  }
}

function reserveVarnokAlienBatch(formation) {
  const maxSize = Math.min(varnokAlienBatchMaxSize, varnokAlienPopulationLimit - formation.aliens.length);
  formation.nextBatchTime = formation.elapsed + varnokReinforcementRetryDelay;
  if (maxSize < varnokAlienBatchMinSize) return;

  const size = varnokAlienBatchMinSize
    + Math.floor(Math.random() * (maxSize - varnokAlienBatchMinSize + 1));
  const shapes = varnokFormationShapes.filter((shape) => shape !== formation.previousShape);
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const occupiedSlots = formation.aliens.map((alien) => formation.slots[alien.formationSlot]);
  const newSlots = occupiedSlots.length === 0
    ? getVarnokFormationSlots(boss.x, boss.y, size, shape)
    : getVarnokReinforcementSlots(occupiedSlots, formation.descentAnimation, size, shape);
  if (newSlots === null) return;

  // Keep every living alien's slot and reclaim old vacancies before appending reservations.
  formation.aliens.forEach((alien, index) => { alien.formationSlot = index; });
  formation.slots = occupiedSlots.concat(newSlots);
  formation.nextLaunchSlot = occupiedSlots.length;
  formation.nextLaunchTime = formation.elapsed;
  formation.nextBatchTime = null;
  formation.previousShape = shape;
  const roll = crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
  hatchlingReturnBatches.set(formation, {
    pattern: hatchlingReturnPatterns[Math.floor(roll * hatchlingReturnPatterns.length)],
    firstSlot: occupiedSlots.length,
    size,
  });
  if (occupiedSlots.length === 0) formation.descentAnimation = null;
}

function isSettledVarnokAlien(alien) {
  return alien.varnokState === "formation" && alien.bomberState === undefined;
}

function updateVarnokFormation(formation, deltaSeconds) {
  const aliens = formation.aliens.filter(isSettledVarnokAlien);
  if (deltaSeconds <= 0 || aliens.length === 0) return;

  const movementDelta = deltaSeconds * getEnemyMovementMultiplier();
  // Keep both active aliens and all incoming reservations inside the canvas.
  const occupiedSlots = formation.aliens.map((alien) => formation.slots[alien.formationSlot])
    .concat(formation.slots.slice(formation.nextLaunchSlot));
  let descentThisFrame = 0;
  const animation = formation.descentAnimation;
  if (animation !== null) {
    const previousElapsed = animation.elapsed;
    animation.elapsed = Math.min(
      animation.elapsed + movementDelta,
      level3FormationDescentDuration,
    );
    descentThisFrame = animation.distance
      * (animation.elapsed - previousElapsed) / level3FormationDescentDuration;
    if (animation.elapsed >= level3FormationDescentDuration) formation.descentAnimation = null;
  }

  const halfSize = enemySize / 2;
  const leftEdge = Math.min(...occupiedSlots.map((slot) => slot.x - halfSize));
  const rightEdge = Math.max(...occupiedSlots.map((slot) => slot.x + halfSize));
  let sidewaysStep = formation.formationDirection * enemySpeed * movementDelta;
  if (formation.formationDirection > 0 && rightEdge + sidewaysStep >= canvas.width) {
    sidewaysStep = canvas.width - rightEdge;
    formation.formationDirection = -1;
    if (formation.descentAnimation === null) {
      const bottomEdge = Math.max(...occupiedSlots.map((slot) => slot.y + halfSize));
      const distance = Math.min(
        level3FormationDescentStep,
        canvas.height - bottomEdge - descentThisFrame,
      );
      if (distance > 0) formation.descentAnimation = { distance, elapsed: 0 };
    }
  } else if (formation.formationDirection < 0 && leftEdge + sidewaysStep <= 0) {
    sidewaysStep = -leftEdge;
    formation.formationDirection = 1;
  }

  for (const slot of formation.slots) {
    slot.x += sidewaysStep;
    slot.y += descentThisFrame;
  }
  for (const slot of occupiedSlots) {
    slot.y = Math.min(slot.y, canvas.height - halfSize);
  }
  for (const alien of aliens) {
    const slot = formation.slots[alien.formationSlot];
    alien.x = slot.x;
    alien.y = slot.y;
  }
}

function getVarnokFormationOffsets(size, shape) {
  const rowSizes = shape === "block" ? [Math.ceil(size / 2), Math.floor(size / 2)] : [size];
  const slope = shape === "v" ? 1 : shape === "invertedV" ? -1 : 0;
  const offsets = [];
  for (const [row, rowSize] of rowSizes.entries()) {
    for (let column = 0; column < rowSize; column += 1) {
      const stepsFromEdge = Math.min(column, rowSize - 1 - column);
      offsets.push({
        x: (column - (rowSize - 1) / 2) * varnokFormationColumnSpacing,
        y: (row + slope * stepsFromEdge) * varnokFormationRowSpacing,
      });
    }
  }
  return offsets;
}

function getVarnokFormationSlots(centerX, centerY, size, shape) {
  const offsets = getVarnokFormationOffsets(size, shape);
  // Fit the entire layout at once to keep its spacing when Varnok is near an edge.
  const halfSize = enemySize / 2;
  const halfWidth = Math.max(...offsets.map((slot) => slot.x));
  const top = Math.min(...offsets.map((slot) => slot.y));
  const bottom = Math.max(...offsets.map((slot) => slot.y));
  const minCenterX = halfSize + halfWidth;
  const maxCenterX = canvas.width - halfSize - halfWidth;
  const minOriginY = halfSize - top;
  const maxOriginY = canvas.height / 2 - halfSize - bottom;
  const bodyTop = centerY - varnokBossHeight / 2;
  const originAboveBoss = bodyTop - 37 - bottom;
  const originX = Math.max(minCenterX, Math.min(maxCenterX, centerX));
  const originY = Math.max(minOriginY, Math.min(maxOriginY, originAboveBoss));
  return offsets.map((slot) => ({
    x: originX + slot.x,
    y: originY + slot.y,
  }));
}

function getVarnokReinforcementSlots(occupiedSlots, descent, size, shape) {
  const offsets = getVarnokFormationOffsets(size, shape);
  const halfSize = enemySize / 2;
  const halfWidth = Math.max(...offsets.map((slot) => slot.x));
  const top = Math.min(...offsets.map((slot) => slot.y));
  const bottom = Math.max(...offsets.map((slot) => slot.y));
  const leftOccupied = Math.min(...occupiedSlots.map((slot) => slot.x));
  const rightOccupied = Math.max(...occupiedSlots.map((slot) => slot.x));
  const topOccupied = Math.min(...occupiedSlots.map((slot) => slot.y));
  const bottomOccupied = Math.max(...occupiedSlots.map((slot) => slot.y));
  const preferredX = (leftOccupied + rightOccupied) / 2;
  const preferredY = (topOccupied + bottomOccupied - top - bottom) / 2;
  const maxY = canvas.height - halfSize - bottom - getRemainingVarnokDescent(descent);
  let nearestSlots = null;
  let nearestDistance = Infinity;

  // Search translations of the whole shape near the formation's current center.
  for (let x = halfSize + halfWidth; x <= canvas.width - halfSize - halfWidth; x += halfSize) {
    const left = Math.min(leftOccupied, x - halfWidth);
    const right = Math.max(rightOccupied, x + halfWidth);
    if (right - left >= canvas.width - enemySize) continue;
    for (let y = halfSize - top; y <= maxY; y += halfSize) {
      const distance = (x - preferredX) ** 2 + (y - preferredY) ** 2;
      if (distance >= nearestDistance) continue;
      const slots = offsets.map((offset) => ({ x: x + offset.x, y: y + offset.y }));
      const overlaps = slots.some((slot) => occupiedSlots.some((occupied) => (
        Math.abs(slot.x - occupied.x) < varnokFormationRowSpacing
        && Math.abs(slot.y - occupied.y) < varnokFormationRowSpacing
      )));
      if (overlaps) continue;
      nearestSlots = slots;
      nearestDistance = distance;
    }
  }
  return nearestSlots;
}

function getRemainingVarnokDescent(descent) {
  return descent === null ? 0
    : descent.distance * (1 - descent.elapsed / level3FormationDescentDuration);
}

function clearVarnokAlienFormation() {
  if (varnokAlienFormation !== null) {
    enemyShots.length = 0;
    nextEnemyShotTime = null;
  }
  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    if (enemies[index].isVarnokAlien) enemies.splice(index, 1);
  }
  varnokAlienFormation = null;
  varnokHatchProgress = 0;
  varnokHatchLastRelease = null;
}

function updateLevel3BossArmor(deltaSeconds) {
  const phaseDurations = {
    closed: level3BossClosedDuration,
    opening: level3BossOpeningDuration,
    vulnerable: level3BossVulnerableDuration,
    closing: level3BossClosingDuration,
  };
  const nextPhases = {
    closed: "opening",
    opening: "vulnerable",
    vulnerable: "closing",
    closing: "closed",
  };
  let remainingTime = deltaSeconds;

  while (remainingTime > 0) {
    const phaseDuration = phaseDurations[boss.armorPhase];
    const phaseTimeLeft = phaseDuration - boss.armorPhaseElapsed;
    const elapsedThisStep = Math.min(remainingTime, phaseTimeLeft);
    boss.armorPhaseElapsed += elapsedThisStep;
    remainingTime -= elapsedThisStep;
    if (boss.armorPhaseElapsed >= phaseDuration) {
      boss.armorPhase = nextPhases[boss.armorPhase];
      boss.armorPhaseElapsed = 0;
      if (boss.armorPhase === "opening") {
        boss.attackType = boss.attackType === null
          ? (Math.random() < 0.5 ? "twinStreams" : "aimedBurst")
          : boss.attackType === "twinStreams" ? "aimedBurst" : "twinStreams";
        boss.nextAttackShotIndex = 0;
        boss.targetMarker = boss.attackType === "aimedBurst"
          ? { x: player.x, y: player.y, locked: false }
          : null;
      } else if (boss.armorPhase === "vulnerable") {
        boss.nextAttackShotIndex = 0;
        if (boss.attackType === "aimedBurst" && boss.targetMarker !== null) {
          boss.targetMarker.x = player.x;
          boss.targetMarker.y = player.y;
          boss.targetMarker.locked = true;
        }
      }
    }
  }

  if (boss.armorPhase === "opening" && boss.targetMarker !== null
    && !boss.targetMarker.locked) {
    boss.targetMarker.x = player.x;
    boss.targetMarker.y = player.y;
  }
  boss.vulnerable = boss.armorPhase === "vulnerable";
  const attackShotCount = boss.attackType === "aimedBurst"
    ? level3BossAimedShotCount
    : level3BossVolleyCount;
  const attackShotInterval = boss.attackType === "aimedBurst"
    ? level3BossAimedShotInterval
    : level3BossVolleyInterval;
  while (boss.vulnerable && boss.nextAttackShotIndex < attackShotCount
    && boss.armorPhaseElapsed >= boss.nextAttackShotIndex * attackShotInterval) {
    if (boss.attackType === "aimedBurst") fireLevel3BossAimedShot();
    else fireLevel3BossVolley();
    boss.nextAttackShotIndex += 1;
    if (boss.nextAttackShotIndex === attackShotCount) {
      if (boss.attackType === "aimedBurst") {
        const lockedTarget = boss.targetMarker;
        if (lockedTarget !== null) {
          scheduleEnemyRepeat(boss, () => fireLevel3BossAimedShot(lockedTarget), attackShotCount, attackShotInterval);
        }
        boss.targetMarker = null;
      } else {
        scheduleEnemyRepeat(boss, fireLevel3BossVolley, attackShotCount, attackShotInterval);
      }
    }
  }
  const phaseProgress = Math.min(
    1,
    boss.armorPhaseElapsed / (phaseDurations[boss.armorPhase] || 1),
  );
  const easedProgress = phaseProgress * phaseProgress * (3 - 2 * phaseProgress);
  if (boss.armorPhase === "opening") boss.openingAmount = easedProgress;
  else if (boss.armorPhase === "vulnerable") boss.openingAmount = 1;
  else if (boss.armorPhase === "closing") boss.openingAmount = 1 - easedProgress;
  else boss.openingAmount = 0;
}

function fireLevel3BossVolley() {
  const shotY = boss.y + boss.height / 2 - 4;
  enemyShots.push(
    {
      x: boss.x - level3BossProjectileOffset,
      y: shotY,
      width: level3BossProjectileWidth,
      height: 13,
      vy: enemyShotSpeed,
      isBossShot: true,
      artwork: crownMawVolleyArtwork,
    },
    {
      x: boss.x + level3BossProjectileOffset,
      y: shotY,
      width: level3BossProjectileWidth,
      height: 13,
      vy: enemyShotSpeed,
      isBossShot: true,
      artwork: crownMawVolleyArtwork,
    },
  );
  playSoundEffect("enemyShot");
}

function fireLevel3BossAimedShot(target = boss.targetMarker) {
  if (target === null) return;
  const shotX = boss.x;
  const shotY = boss.y + boss.height / 2 - 4;
  const dx = target.x - shotX;
  const dy = target.y - shotY;
  const distance = Math.hypot(dx, dy) || 1;
  enemyShots.push({
    x: shotX,
    y: shotY,
    width: level3BossProjectileWidth,
    height: 13,
    vx: dx / distance * enemyShotSpeed,
    vy: dy / distance * enemyShotSpeed,
    isBossShot: true,
    artwork: crownMawAimedArtwork,
  });
  playSoundEffect("enemyShot");
}

function getLevel3BossCoreBounds(targetBoss) {
  const bottom = targetBoss.y + targetBoss.height / 2;
  return {
    left: targetBoss.x - level3BossCoreWidth / 2,
    right: targetBoss.x + level3BossCoreWidth / 2,
    top: bottom - level3BossCoreHeight,
    bottom,
  };
}

function getCenteredBounds({ x, y, width, height }) {
  return {
    left: x - width / 2,
    right: x + width / 2,
    top: y - height / 2,
    bottom: y + height / 2,
  };
}

function getPlayerShotBounds(shot) {
  return {
    left: shot.x - shot.width / 2,
    right: shot.x + shot.width / 2,
    top: shot.y,
    bottom: shot.y + shot.height,
  };
}

function getLevel3BossProjectilePassageBounds(targetBoss) {
  const progress = targetBoss.openingAmount;
  if (progress <= 0) return null;
  const core = getLevel3BossCoreBounds(targetBoss);
  const halfWidth = level3BossCoreWidth * progress / 2;
  return {
    left: targetBoss.x - halfWidth,
    right: targetBoss.x + halfWidth,
    top: core.bottom - level3BossCoreHeight * progress,
    bottom: core.bottom,
  };
}

function getLevel3BossArmorCollisionRegions(targetBoss) {
  const body = getCenteredBounds(targetBoss);
  const passage = getLevel3BossProjectilePassageBounds(targetBoss);
  if (passage === null) return [body];
  return subtractCollisionBounds(body, passage);
}

function collisionBoundsOverlap(first, second) {
  return first.right >= second.left && first.left <= second.right
    && first.bottom >= second.top && first.top <= second.bottom;
}

function getShotContactTime(shot, target) {
  if (shot.previousX === undefined) {
    return collisionBoundsOverlap(getPlayerShotBounds(shot), target) ? 0 : Infinity;
  }

  // Expand the rectangle by the bullet's footprint and sweep its top center through it.
  let entry = 0;
  let exit = 1;
  for (const [start, end, min, max] of [
    [shot.previousX, shot.x, target.left - shot.width / 2, target.right + shot.width / 2],
    [shot.previousY, shot.y, target.top - shot.height, target.bottom],
  ]) {
    const distance = end - start;
    if (distance === 0) {
      if (start < min || start > max) return Infinity;
      continue;
    }
    const first = (min - start) / distance;
    const last = (max - start) / distance;
    entry = Math.max(entry, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (entry > exit) return Infinity;
  }
  return entry;
}

function getVarnokEyeGeometry(targetBoss) {
  const body = getCenteredBounds(targetBoss);
  const openingAmount = Math.max(0, Math.min(1, targetBoss.eyeOpeningAmount));
  return [-varnokEyeOffsetX, varnokEyeOffsetX].map((offsetX) => {
    const centerX = targetBoss.x + offsetX;
    const centerY = targetBoss.y + varnokEyeOffsetY;
    const bounds = {
      left: centerX - varnokEyeWidth / 2,
      right: centerX + varnokEyeWidth / 2,
      top: centerY - varnokEyeHeight / 2,
      bottom: centerY + varnokEyeHeight / 2,
    };
    const openingWidth = varnokEyePassageWidth * openingAmount;
    const exposedHeight = varnokEyeHeight * openingAmount;
    const opening = {
      left: centerX - openingWidth / 2,
      right: centerX + openingWidth / 2,
      top: bounds.bottom - exposedHeight,
      bottom: bounds.bottom,
    };
    const exposed = {
      left: Math.max(bounds.left, opening.left),
      right: Math.min(bounds.right, opening.right),
      top: opening.top,
      bottom: opening.bottom,
    };
    const passage = openingAmount > 0
      ? { left: opening.left, right: opening.right, top: opening.top, bottom: body.bottom }
      : null;
    return { bounds, opening, exposed, passage };
  });
}

function getVarnokProjectilePassages(targetBoss) {
  return getVarnokEyeGeometry(targetBoss)
    .map((eye) => eye.passage)
    .filter((passage) => passage !== null);
}

function subtractCollisionBounds(source, hole) {
  const left = Math.max(source.left, hole.left);
  const right = Math.min(source.right, hole.right);
  const top = Math.max(source.top, hole.top);
  const bottom = Math.min(source.bottom, hole.bottom);
  if (right <= left || bottom <= top) return [source];

  const regions = [];
  if (source.top < top) regions.push({ left: source.left, right: source.right, top: source.top, bottom: top });
  if (bottom < source.bottom) regions.push({ left: source.left, right: source.right, top: bottom, bottom: source.bottom });
  if (source.left < left) regions.push({ left: source.left, right: left, top, bottom });
  if (right < source.right) regions.push({ left: right, right: source.right, top, bottom });
  return regions;
}

function getVarnokArmorCollisionRegions(targetBoss) {
  return getVarnokProjectilePassages(targetBoss).reduce((regions, passage) => (
    regions.flatMap((region) => subtractCollisionBounds(region, passage))
  ), [getCenteredBounds(targetBoss)]);
}

function clearLevel3BossEncounterState() {
  if (boss?.level !== 3) return;
  boss.armorPhase = null;
  boss.armorPhaseElapsed = 0;
  boss.openingAmount = 0;
  boss.vulnerable = false;
  boss.attackType = null;
  boss.nextAttackShotIndex = 0;
  boss.targetMarker = null;
  boss.movement = null;
}

function clearVarnokBossEncounterState() {
  if (boss?.level !== 4) return;
  boss.eyePhase = null;
  boss.eyePhaseElapsed = 0;
  boss.eyeOpeningAmount = 0;
  boss.movement = null;
}

function prepareLevel2BossCharge(bossState) {
  const hitWidth = bossState.width * 0.58;
  const hitHeight = bossState.height * 0.62;
  const halfWidth = bossState.width / 2;
  const halfHeight = bossState.height / 2;
  const initialX = bossState.x;
  const initialY = bossState.y;
  let dx = player.x - initialX;
  let dy = player.y - initialY;
  let distance = Math.hypot(dx, dy) || 1;
  let directionX = dx / distance;
  let directionY = dy / distance;
  const clampX = (x) => Math.max(halfWidth, Math.min(canvas.width - halfWidth, x));
  const clampY = (y) => Math.max(halfHeight, Math.min(canvas.height - halfHeight, y));
  const launchX = clampX(initialX - directionX * level2BossPullbackDistance);
  const launchY = clampY(initialY - directionY * level2BossPullbackDistance);

  dx = player.x - launchX;
  dy = player.y - launchY;
  distance = Math.hypot(dx, dy) || 1;
  directionX = dx / distance;
  directionY = dy / distance;
  const endX = clampX(player.x + directionX * level2BossOvershootDistance);
  const endY = clampY(player.y + directionY * level2BossOvershootDistance);
  const pathLength = Math.hypot(endX - launchX, endY - launchY);

  bossState.chargePath = {
    startX: initialX,
    startY: initialY,
    targetX: player.x,
    targetY: player.y,
    launchX,
    launchY,
    endX,
    endY,
    retreatX: launchX,
    retreatY: 104,
    duration: pathLength / level2BossChargeSpeed,
  };
  bossState.attackPhase = "prepare";
  bossState.attackPhaseElapsed = 0;
  bossState.ramHitApplied = false;
}

function segmentIntersectsRectangle(x1, y1, x2, y2, left, right, top, bottom) {
  let minProgress = 0;
  let maxProgress = 1;
  for (const [start, delta, minimum, maximum] of [
    [x1, x2 - x1, left, right],
    [y1, y2 - y1, top, bottom],
  ]) {
    if (Math.abs(delta) < 0.000001) {
      if (start < minimum || start > maximum) return false;
      continue;
    }
    const first = (minimum - start) / delta;
    const second = (maximum - start) / delta;
    minProgress = Math.max(minProgress, Math.min(first, second));
    maxProgress = Math.min(maxProgress, Math.max(first, second));
    if (minProgress > maxProgress) return false;
  }
  return true;
}

function updateLevel2BossEncounter(deltaSeconds, frameTime) {
  for (const targetBoss of level2Bosses) {
    const canStartAttack = level2AttackOwner === null && targetBoss === nextLevel2Attacker;
    updateLevel2Boss(targetBoss, deltaSeconds, frameTime, canStartAttack);
    if (gameState !== "playing") return;

    if (canStartAttack && targetBoss.attackPhase === "prepare") {
      level2AttackOwner = targetBoss;
      nextLevel2Attacker = level2Bosses.find((candidate) => candidate !== targetBoss) ?? targetBoss;
    } else if (level2AttackOwner === targetBoss && targetBoss.attackPhase === "move") {
      level2AttackOwner = null;
    }
  }
}

function updateLevel2Boss(bossState, deltaSeconds, frameTime, canStartAttack) {
  bossState.attackPhaseElapsed += deltaSeconds;
  const movementMultiplier = getLevel2BossMovementMultiplier();

  if (bossState.attackPhase === "move") {
    const halfWidth = bossState.width / 2;
    const minX = bossState.patrolBounds?.minX ?? halfWidth;
    const maxX = bossState.patrolBounds?.maxX ?? canvas.width - halfWidth;
    const step = bossState.speed * deltaSeconds * movementMultiplier;
    const laneX = Math.max(minX, Math.min(maxX, bossState.x));
    if (laneX !== bossState.x) {
      // Keep the original retreat endpoint and move back into the lane before attacking.
      bossState.direction = Math.sign(laneX - bossState.x);
      bossState.x += bossState.direction * Math.min(step, Math.abs(laneX - bossState.x));
      return;
    }
    const nextX = bossState.x + bossState.direction * step;
    if (nextX < minX || nextX > maxX) {
      bossState.direction *= -1;
    }
    bossState.x = Math.max(minX, Math.min(maxX, nextX));
    if (canStartAttack && bossState.attackPhaseElapsed >= getLevel2BossPatrolDuration()) {
      prepareLevel2BossCharge(bossState);
    }
    return;
  }

  const movementElapsed = bossState.attackPhaseElapsed * movementMultiplier;
  if (bossState.attackPhase === "prepare") {
    const path = bossState.chargePath;
    const progress = Math.min(movementElapsed / level2BossPrepareDuration, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    bossState.x = path.startX + (path.launchX - path.startX) * easedProgress;
    bossState.y = path.startY + (path.launchY - path.startY) * easedProgress;
    // Movement can finish before the warning window closes.
    if (bossState.attackPhaseElapsed >= level2BossPrepareDuration) {
      bossState.attackPhase = "charge";
      bossState.attackPhaseElapsed = 0;
    }
    return;
  }

  if (bossState.attackPhase === "charge") {
    const path = bossState.chargePath;
    const previousX = bossState.x;
    const previousY = bossState.y;
    const progress = Math.min(movementElapsed / path.duration, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    bossState.x = path.launchX + (path.endX - path.launchX) * easedProgress;
    bossState.y = path.launchY + (path.endY - path.launchY) * easedProgress;

    const hitHalfWidth = bossState.width * 0.58 / 2;
    const hitHalfHeight = bossState.height * 0.62 / 2;
    const touchingPlayer = segmentIntersectsRectangle(
      previousX,
      previousY,
      bossState.x,
      bossState.y,
      player.x - player.width / 2 - hitHalfWidth,
      player.x + player.width / 2 + hitHalfWidth,
      player.y - player.height / 2 - hitHalfHeight,
      player.y + player.height / 2 + hitHalfHeight,
    );
    if (touchingPlayer && !bossState.ramHitApplied && damagePlayer(frameTime)) {
      clearLevel2Shield();
      bossState.ramHitApplied = true;
      if (gameState !== "playing") return;
    }

    if (progress === 1) {
      bossState.attackPhase = "retreat";
      bossState.attackPhaseElapsed = 0;
      bossState.retreatStartX = bossState.x;
      bossState.retreatStartY = bossState.y;
    }
    return;
  }

  if (bossState.attackPhase === "retreat") {
    const path = bossState.chargePath;
    const progress = Math.min(movementElapsed / level2BossRetreatDuration, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    bossState.x = bossState.retreatStartX
      + (path.retreatX - bossState.retreatStartX) * easedProgress;
    bossState.y = bossState.retreatStartY
      + (path.retreatY - bossState.retreatStartY) * easedProgress;
    if (progress === 1) {
      bossState.attackPhase = "move";
      bossState.attackPhaseElapsed = 0;
      bossState.chargePath = null;
    }
  }
}

function createBarriers() {
  barriers = [0.2, 0.5, 0.8].map((position) => ({
    x: canvas.width * position,
    y: canvas.height * 0.62,
    width: barrierWidth,
    height: barrierHeight,
    hitPoints: barrierHitPoints,
  }));
}

function damageBarrierWithShot(shot, targetBarriers = barriers) {
  const barrierIndex = targetBarriers.findIndex((barrier) =>
    getShotContactTime(shot, getCenteredBounds(barrier)) < Infinity);

  if (barrierIndex === -1) return false;

  targetBarriers[barrierIndex].hitPoints -= 1;
  if (targetBarriers[barrierIndex].hitPoints === 0) {
    targetBarriers.splice(barrierIndex, 1);
  }
  return true;
}

function finishGame(result) {
  if (result === "loss" && gameState !== "loss") playSoundEffect("gameOver");
  destructionFragments.length = 0;
  playerDeathStartedAt = null;
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  gameState = result;
  clearWaveEntrance();
  resetLevel3Descent();
  clearDiveBomberState();
  clearVarnokAlienFormation();
  clearLevel3BossEncounterState();
  clearVarnokBossEncounterState();
  if (currentLevel === 2) {
    boss = null;
    bossChargeElapsed = null;
    nextBossAttackTime = null;
    bossIntroElapsed = null;
    bossIntroStartY = null;
    bossIntroTargetY = null;
  }
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  keysDown.clear();
  restartButton.hidden = false;
  level2Button.hidden = true;
  level3Button.hidden = true;
}

function damagePlayer(frameTime) {
  if (gameState !== "playing" || frameTime < playerInvulnerableUntil) return false;
  return losePlayerLife(frameTime);
}

function damagePlayerFromProjectile(frameTime) {
  if (gameState !== "playing" || frameTime < playerShieldProtectedUntil) return false;
  if ((currentLevel === 2 || currentLevel === 3) && level2ShieldCharges > 0) {
    level2ShieldCharges -= 1;
    if (level2ShieldCharges === 0) level2ShieldTimeRemaining = 0;
    playerShieldProtectedUntil = frameTime + 1000;
    playerInvulnerableUntil = Math.max(playerInvulnerableUntil, playerShieldProtectedUntil);
    playSoundEffect("shieldAbsorb");
    return false;
  }

  return losePlayerLife(frameTime);
}

function losePlayerLife(frameTime) {
  const { x, y } = player;
  const palette = playerLifeBurstPalettes[selectedShipId];
  pendingEnemyRepeats.length = 0;
  level2ActiveWeapon = null;
  lives = Math.max(0, lives - 1);
  livesDisplay.textContent = lives;
  playerInvulnerableUntil = frameTime + 1000;
  if (lives === 0) {
    gameState = "playerDeath";
    playerDeathStartedAt = frameTime;
    keysDown.clear();
    destructionFragments.length = 0;
    spawnDestructionBurst(x, y, palette, playerDeathBurstFragmentCount, {
      minDuration: 0.48,
      durationRange: 0.22,
      speedScale: 1.4,
      sizeScale: 1.55,
      startedAt: frameTime / 1000,
    });
  } else {
    playSoundEffect("lifeLost");
    spawnDestructionBurst(x, y, palette, playerLifeBurstFragmentCount, { durationRange: 0.10 });
  }
  return true;
}

function restartGame() {
  clearLevel2BossEncounter();
  pendingEnemyRepeats.length = 0;
  combatElapsed = 0;
  playerDeathStartedAt = null;
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  playerBank = 0;
  developerBossTestLevel = null;
  summaryFadeElapsed = null;
  creditsRun = null;
  score = 0;
  lives = 3;
  currentLevel = 1;
  level2FormationOffsetX = 0;
  resetLevel3Descent();
  clearDiveBomberState();
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  currentWave = 1;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  difficultyDisplay.textContent = selectedDifficulty;

  player.x = canvas.width / 2;
  player.y = playerSpawnY;
  shots.length = 0;
  enemyShots.length = 0;
  enemies.length = 0;
  clearVarnokAlienFormation();
  boss = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = null;
  bossIntroStartY = null;
  bossIntroTargetY = null;
  createEnemies();
  createBarriers();

  enemyDirection = 1;
  clearWaveEntrance();
  nextShotTime = 0;
  nextEnemyShotTime = null;
  playerInvulnerableUntil = 0;
  playerShieldProtectedUntil = 0;
  keysDown.clear();
  gameState = "playing";
  mainMenu.hidden = true;
  shipSelection.hidden = true;
  varnokDialogue.hidden = true;
  gameStatus.hidden = false;
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
}

function notifyMusicTrack(track, crossfade = false, creditsTimeline) {
  document.dispatchEvent(new CustomEvent("game-music-track", {
    detail: { track, crossfade, creditsTimeline },
  }));
}

function setDeveloperSupplyReward(reward) {
  developerForcedSupplyReward = reward;
  for (const button of developerRewardButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.developerReward === reward));
  }
}

function measureDeveloperCanvas() {
  if (developerMeasureCanvasButton.disabled) return;
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  const pixels = (property) => Number.parseFloat(style[property]) || 0;
  const width = rect.width - pixels("borderLeftWidth") - pixels("borderRightWidth")
    - pixels("paddingLeft") - pixels("paddingRight");
  const height = rect.height - pixels("borderTopWidth") - pixels("borderBottomWidth")
    - pixels("paddingTop") - pixels("paddingBottom");
  const ratio = (bitmap, display) => display > 0 ? (bitmap / display).toFixed(3) : "—";
  const sampleDuration = 3000;
  const summary = [
    `Bitmap ${canvas.width} × ${canvas.height} px`,
    `Display content ${width.toFixed(2)} × ${height.toFixed(2)} CSS px`,
    `Device pixel ratio ${window.devicePixelRatio}`,
    `Bitmap px per CSS px  X ${ratio(canvas.width, width)}  Y ${ratio(canvas.height, height)}`,
    "",
    "Browser animation-frame intervals",
  ].join("\n");

  developerMeasureCanvasButton.disabled = true;
  developerCanvasReadout.textContent = `${summary}\nMeasuring for 3 s…`;
  const intervals = [];
  let startTime;
  let previousTime;
  function sample(frameTime) {
    if (startTime === undefined) startTime = frameTime;
    if (previousTime !== undefined) intervals.push(frameTime - previousTime);
    previousTime = frameTime;
    if (frameTime - startTime < sampleDuration) {
      requestAnimationFrame(sample);
      return;
    }

    intervals.sort((a, b) => a - b);
    const middle = Math.floor(intervals.length / 2);
    const median = intervals.length % 2 === 0
      ? (intervals[middle - 1] + intervals[middle]) / 2
      : intervals[middle];
    developerCanvasReadout.textContent = `${summary}\nMedian ${median.toFixed(2)} ms\nLongest ${intervals.at(-1).toFixed(2)} ms`;
    developerMeasureCanvasButton.disabled = false;
  }
  requestAnimationFrame(sample);
}

function updateDeveloperBossAnimationReadout(boss1DrawPath, boss2DrawPaths) {
  const layerStatus = (artwork) => artwork.ready ? "Loaded" : artwork.failed ? "Failed" : "Loading";
  const lines = developerBossTestLevel === 1 ? [
    `Sacs: ${layerStatus(sporeChoirSac)}`,
    `Membrane: ${layerStatus(sporeChoirMembrane)}`,
    `Face: ${layerStatus(sporeChoirFace)}`,
    "",
    "Renderer",
    boss1DrawPath,
    `Clock: ${combatElapsed.toFixed(1)} s`,
  ] : [
    `Armour: ${layerStatus(ironSepulchreArmour)}`,
    `Vents: ${layerStatus(ironSepulchreVents)}`,
    `Center: ${layerStatus(ironSepulchreCenter)}`,
  ];
  level2Bosses.forEach((targetBoss, index) => {
    let label = "Renderer";
    if (targetBoss.patrolBounds !== null) {
      label = targetBoss.patrolBounds.maxX < canvas.width / 2 ? "Left renderer" : "Right renderer";
    }
    lines.push("", label, boss2DrawPaths[index],
      `Phase: ${targetBoss.attackPhase}`,
      `Elapsed: ${targetBoss.attackPhaseElapsed.toFixed(1)} s`);
  });
  const readout = lines.join("\n");
  if (developerBossAnimationReadout.textContent !== readout) {
    developerBossAnimationReadout.textContent = readout;
  }
}

function startDeveloperTestLevel(level) {
  if (!DEVELOPER_MODE) return;
  selectedShipId = defaultShipId;
  restartGame();
  if (level === 2) startLevel2();
  else if (level === 3) startLevel3();
  notifyMusicTrack(currentLevel);
}

function startDeveloperTestBoss(level) {
  if (!DEVELOPER_MODE || level < 1 || level > 4) return;

  selectedShipId = defaultShipId;
  restartGame();
  if (level === 2) startLevel2();
  else if (level === 3 || level === 4) startLevel3();

  enemies.length = 0;
  clearDiveBomberState();
  shots.length = 0;
  enemyShots.length = 0;
  level2BonusShip = null;
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  nextEnemyShotTime = null;
  clearWaveEntrance();
  currentWave = level === 1 ? level1WaveCount
    : level === 2 ? level2WaveCount : level3WaveCount;

  if (level === 1) {
    startBossFight();
    gameState = "playing";
  } else if (level === 2) {
    startLevel2BossFight();
  } else if (level === 3) {
    startLevel3BossFight();
  } else {
    startVarnokBossFight();
  }
  developerBossTestLevel = level;
  if (level === 1 || level === 2) developerExaggerateAnimation.checked = false;
  previousFrameTime = 0;
  notifyMusicTrack(currentLevel);
}

function resetStartSelection() {
  shipSelection.reset();
  selectedDifficulty = defaultDifficulty;
}

startGameButton.addEventListener("click", () => {
  resetStartSelection();
  menuOptions.hidden = true;
  shipSelection.hidden = false;
  shipSelection.querySelector('input[name="ship"]:checked').focus();
});
shipSelectionBackButton.addEventListener("click", () => {
  resetStartSelection();
  shipSelection.hidden = true;
  menuOptions.hidden = false;
  startGameButton.focus();
});
shipSelection.addEventListener("change", (event) => {
  if (event.target.name === "difficulty") selectedDifficulty = event.target.value;
});
shipSelection.addEventListener("submit", (event) => {
  event.preventDefault();
  if (gameState !== "menu") return;
  selectedShipId = shipSelection.elements.namedItem("ship").value;
  selectedDifficulty = shipSelection.elements.namedItem("difficulty").value;
  restartGame();
  notifyMusicTrack(currentLevel);
  canvas.focus({ preventScroll: true });
});
howToPlayButton.addEventListener("click", () => {
  menuOptions.hidden = true;
  howToPlay.hidden = false;
  menuBackButton.focus();
});
menuBackButton.addEventListener("click", () => {
  howToPlay.hidden = true;
  menuOptions.hidden = false;
  howToPlayButton.focus();
});
musicToggle.addEventListener("click", (event) => {
  if (gameState === "playing" && event.detail > 0) canvas.focus({ preventScroll: true });
});

function updateSoundEffectsToggle() {
  soundEffectsToggle.textContent = soundEffectsEnabled ? "Sound effects: On" : "Sound effects: Off";
  soundEffectsToggle.setAttribute("aria-pressed", String(soundEffectsEnabled));
}

function playSoundEffect(name) {
  if (soundEffectsEnabled) gameSoundEffects.play(name);
}

function unlockSoundEffects(event) {
  if (soundEffectsEnabled && event.isTrusted && !event.repeat) gameSoundEffects.unlock();
}

try {
  soundEffectsEnabled = window.localStorage.getItem(soundEffectsStorageKey) === "on";
} catch {
  // Keep the default when storage is unavailable.
}
updateSoundEffectsToggle();
document.addEventListener("click", unlockSoundEffects, true);
document.addEventListener("keydown", unlockSoundEffects, true);
soundEffectsToggle.addEventListener("click", (event) => {
  soundEffectsEnabled = !soundEffectsEnabled;
  updateSoundEffectsToggle();
  if (soundEffectsEnabled) unlockSoundEffects(event);
  else gameSoundEffects.silence();
  try {
    window.localStorage.setItem(soundEffectsStorageKey, soundEffectsEnabled ? "on" : "off");
  } catch {
    // Keep the new value for the current page.
  }
});

restartButton.addEventListener("click", () => {
  restartGame();
  notifyMusicTrack(currentLevel);
});
if (DEVELOPER_MODE) {
  gameMain.classList.add("developer-mode");
  developerTestingPanel.hidden = false;
  developerMeasureCanvasButton.addEventListener("click", measureDeveloperCanvas);
  developerBankEffect.addEventListener("click", (event) => {
    if (gameState === "playing" && event.detail > 0) canvas.focus({ preventScroll: true });
  });
  developerExaggerateAnimation.addEventListener("click", (event) => {
    if (gameState === "playing" && event.detail > 0) canvas.focus({ preventScroll: true });
  });
  developerLevelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startDeveloperTestLevel(Number(button.dataset.developerLevel));
    });
  });
  developerBossButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startDeveloperTestBoss(Number(button.dataset.developerBoss));
    });
  });
  developerCreditsButton.addEventListener("click", () => startCredits());
  developerRewardButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDeveloperSupplyReward(button.dataset.developerReward);
    });
  });
}
level2Button.addEventListener("click", () => {
  if (gameState !== "level1Cleared") return;
  startLevel2();
  notifyMusicTrack(currentLevel, true);
});
level3Button.addEventListener("click", () => {
  if (gameState !== "level2Cleared") return;
  startLevel3();
  notifyMusicTrack(currentLevel, true);
});

document.getElementById("varnok-dialogue-name").textContent = bossDisplayNames.varnok;
varnokFightButton.addEventListener("click", () => {
  if (gameState !== "varnokDialogue") return;
  varnokDialogue.hidden = true;
  keysDown.clear();
  gameState = "playing";
  previousFrameTime = 0;
  canvas.focus({ preventScroll: true });
});

window.addEventListener("keydown", (event) => {
  if (gameState === "menu" || gameState === "playerDeath") return;
  if (boss?.level === 4 && (gameState === "bossIntro" || gameState === "varnokDialogue")) {
    if (event.target === varnokFightButton && event.repeat
      && (event.code === "Space" || event.key === "Enter")) event.preventDefault();
    return;
  }
  // A key held through the reveal needs a fresh press to control the player.
  const ignoreHeldInput = boss?.level === 4 && developerBossTestLevel !== 4 && event.repeat;
  const key = event.key.toLowerCase();
  if (key === "k" && !event.repeat && DEVELOPER_MODE
    && developerBossTestLevel === 4 && gameState === "playing" && boss?.level === 4) {
    event.preventDefault();
    applyBossDamage(boss.health);
  } else if (event.code === "Space") {
    if (event.target === developerBankEffect || event.target === developerExaggerateAnimation
      || event.target === developerCreditsButton
      || event.target === continueToCreditsButton) return;
    if (event.target === musicToggle || event.target === soundEffectsToggle
      || (gameState === "loss" && event.target === restartButton)) return;
    event.preventDefault();
    if (gameState !== "credits" && !ignoreHeldInput) keysDown.add("space");
  } else if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
    event.preventDefault();
    if (gameState !== "credits" && !ignoreHeldInput) keysDown.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.code === "Space" ? "space" : event.key.toLowerCase());
});

window.addEventListener("blur", () => {
  keysDown.clear();
});

function updatePlayer(deltaSeconds) {
  let direction = 0;
  if (keysDown.has("arrowleft") || keysDown.has("a")) direction -= 1;
  if (keysDown.has("arrowright") || keysDown.has("d")) direction += 1;

  let verticalDirection = 0;
  if (keysDown.has("arrowup") || keysDown.has("w")) verticalDirection -= 1;
  if (keysDown.has("arrowdown") || keysDown.has("s")) verticalDirection += 1;

  const previousX = player.x;
  player.x += direction * player.speed * deltaSeconds;
  player.y += verticalDirection * player.speed * deltaSeconds;
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  player.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, player.x));
  player.y = Math.max(playerMinY, Math.min(playerMaxY, player.y));
  player.y = Math.max(halfHeight, Math.min(canvas.height - halfHeight, player.y));

  const horizontalMovement = player.x - previousX;
  const targetBank = Math.abs(horizontalMovement) > playerBankDeadZoneSpeed * deltaSeconds
    ? Math.sign(horizontalMovement)
    : 0;
  playerBank += (targetBank - playerBank) * (1 - Math.exp(-playerBankEaseSpeed * deltaSeconds));
}

function updateShots(deltaSeconds, frameTime) {
  if (keysDown.has("space") && frameTime >= nextShotTime) {
    const weapon = playerWeapons[level2ActiveWeapon?.type];
    const pattern = weapon?.pattern ?? straightShotPattern;
    const damagedBosses = pattern.length > 1 ? new WeakSet() : null;
    for (const [offsetX, angle] of pattern) {
      const shot = {
        x: player.x + offsetX,
        y: player.y - player.height / 2 - playerShotMuzzleOffset,
        width: 5,
        height: 14,
        vx: shotSpeed * Math.sin(angle),
        vy: -shotSpeed * Math.cos(angle),
        artwork: weapon?.artwork ?? null,
        color: weapon?.color ?? "#ffe08a",
        damagedBosses,
      };
      shots.push(shot);
    }
    nextShotTime = frameTime + (weapon?.interval ?? shotInterval) * 1000;
    playSoundEffect(level2ActiveWeapon?.type === "machinegun" ? "machinegun" : "playerShot");
  }

  for (const shot of shots) {
    if (shot.vx) {
      shot.previousX = shot.x;
      shot.previousY = shot.y;
      shot.x += shot.vx * deltaSeconds;
    }
    shot.y += (shot.vy ?? -shotSpeed) * deltaSeconds;
  }

  for (let index = shots.length - 1; index >= 0; index -= 1) {
    const shot = shots[index];
    if (!shot.vx && shot.y + shot.height < 0) {
      shots.splice(index, 1);
    }
  }
}

function level3FormationCollidesWithPlayer(formationEnemies = enemies, movementPaths = null) {
  if (currentLevel !== 3) return false;
  const playerHalfWidth = player.width / 2;
  const playerHalfHeight = player.height / 2;
  return formationEnemies.some((enemy) => {
    if (enemy.bomberState !== undefined && enemy.bomberState !== "formation") return false;
    const movementPath = movementPaths?.get(enemy) ?? [enemy];
    const bounds = {
      left: player.x - playerHalfWidth - enemy.width / 2,
      right: player.x + playerHalfWidth + enemy.width / 2,
      top: player.y - playerHalfHeight - enemy.height / 2,
      bottom: player.y + playerHalfHeight + enemy.height / 2,
    };
    let previousX = enemy.x;
    let previousY = enemy.y;
    for (const position of movementPath) {
      if (segmentIntersectsRectangle(
        previousX,
        previousY,
        position.x,
        position.y,
        bounds.left,
        bounds.right,
        bounds.top,
        bounds.bottom,
      )) return true;
      previousX = position.x;
      previousY = position.y;
    }
    return false;
  });
}

function updateEnemies(deltaSeconds, frameTime) {
  if (level3FormationCollidesWithPlayer()) {
    finishGame("loss");
    return true;
  }

  const movementMultiplier = getEnemyMovementMultiplier();
  let level3DescentThisFrame = 0;
  if (currentLevel === 3 && level3DescentAnimation !== null) {
    const animation = level3DescentAnimation;
    const previousOffset = level3FormationDescentOffset;
    animation.elapsed = Math.min(
      animation.elapsed + deltaSeconds * movementMultiplier,
      level3FormationDescentDuration,
    );
    const progress = animation.elapsed / level3FormationDescentDuration;
    level3FormationDescentOffset = animation.startOffset
      + (animation.targetOffset - animation.startOffset) * progress;
    level3DescentThisFrame = level3FormationDescentOffset - previousOffset;
    if (progress >= 1) level3DescentAnimation = null;
  }

  const hasDiveBombers = currentLevel === 2 || currentLevel === 3;
  if (hasDiveBombers) {
    updateLevel2Bomber(deltaSeconds, frameTime);
    if (waveEntrance !== null || boss !== null) return false;
  }
  if (gameState !== "playing") return true;
  const formationEnemies = hasDiveBombers
    ? enemies.filter((enemy) => enemy.bomberState === undefined || enemy.bomberState === "formation")
    : enemies;
  if (level3FormationCollidesWithPlayer(formationEnemies)) {
    finishGame("loss");
    return true;
  }
  const destroyedFraction = getWaveEliminatedFraction();
  const waveSpeedMultiplier = currentWave === 2
    && (currentLevel === 1 || currentLevel === 2 || currentLevel === 3)
    ? wave2SpeedMultiplier
    : 1;
  const destructionSpeedBonus = (maxEnemySpeedMultiplier - 1)
    * (currentLevel === 3 ? level3DestructionBonusMultiplier : 1);
  const tuning = enemyDifficultySettings[selectedDifficulty];
  const difficultyRamp = 1 + destroyedFraction * (tuning?.waveKillSpeedBonus ?? 0);
  const levelSpeedScale = currentLevel === 2 ? (tuning?.level2WaveSpeedScale ?? 1) : 1;
  const formationSpeed = enemySpeed * waveSpeedMultiplier
    * (1 + destroyedFraction * destructionSpeedBonus) * movementMultiplier * difficultyRamp * levelSpeedScale;
  // Keep vacant diver return slots within the playfield as well as occupied slots.
  const nextLeftEdge = hasDiveBombers
    ? regularFormation.left + level2FormationOffsetX + enemyDirection * formationSpeed * deltaSeconds
    : formationEnemies.length
      ? Math.min(...formationEnemies.map((enemy) => enemy.x - enemy.width / 2))
        + enemyDirection * formationSpeed * deltaSeconds
      : 0;
  const nextRightEdge = hasDiveBombers
    ? regularFormation.right + level2FormationOffsetX + enemyDirection * formationSpeed * deltaSeconds
    : formationEnemies.length
      ? Math.max(...formationEnemies.map((enemy) => enemy.x + enemy.width / 2))
        + enemyDirection * formationSpeed * deltaSeconds
      : canvas.width;

  const hitLeftBoundary = formationEnemies.length > 0 && nextLeftEdge < 0;
  const hitRightBoundary = formationEnemies.length > 0 && (currentLevel === 3
    ? nextRightEdge >= canvas.width
    : nextRightEdge > canvas.width);
  if (hitLeftBoundary || hitRightBoundary) {
    enemyDirection *= -1;
    if (currentLevel === 3 && hitRightBoundary && formationEnemies.length > 0) {
      level3RightBoundaryContacts += 1;
      if (level3DescentAnimation === null) {
        // Leave room to shoot from the player's lowest position without touching the formation.
        const lowestMuzzleY = playerMaxY - player.height / 2 - playerShotMuzzleOffset;
        const maximumDescent = lowestMuzzleY - regularFormation.bottom;
        const targetOffset = level3FormationDescentOffset + Math.min(
          level3FormationDescentStep,
          Math.max(0, maximumDescent - level3FormationDescentOffset),
        );
        if (targetOffset > level3FormationDescentOffset) {
          level3DescentAnimation = {
            startOffset: level3FormationDescentOffset,
            targetOffset,
            elapsed: 0,
          };
        }
      }
    }
  }

  if (currentLevel === 3) {
    const movementPaths = new Map(formationEnemies.map((enemy) => {
      const horizontalDestination = {
        x: enemy.x + enemyDirection * formationSpeed * deltaSeconds,
        y: enemy.y + level3DescentThisFrame,
      };
      return [enemy, [horizontalDestination]];
    }));
    if (level3FormationCollidesWithPlayer(formationEnemies, movementPaths)) {
      finishGame("loss");
      return true;
    }
    for (const [enemy, movementPath] of movementPaths) {
      const destination = movementPath[movementPath.length - 1];
      enemy.x = destination.x;
      enemy.y = destination.y;
    }
  } else {
    for (const enemy of formationEnemies) {
      enemy.x += enemyDirection * formationSpeed * deltaSeconds;
    }
  }
  if (hasDiveBombers && formationEnemies.length > 0) {
    level2FormationOffsetX += enemyDirection * formationSpeed * deltaSeconds;
  }
  if (hasDiveBombers) updateAlienAngles(enemies, deltaSeconds);
  return false;
}

function updateAlienAngles(aliens, deltaSeconds, formation = null) {
  const turnFraction = 1 - Math.exp(-12 * deltaSeconds);
  for (const enemy of aliens) {
    if (enemy.varnokState === "launching" || enemy.varnokState === "waitingToReturn") {
      alienAngles.set(enemy, Math.PI);
      continue;
    }

    const currentAngle = alienAngles.get(enemy) ?? 0;
    let targetAngle = 0;
    if (enemy.bomberState === "dive") {
      targetAngle = Math.atan2(-enemy.diveVelocityX, enemy.diveVelocityY);
    } else if (enemy.bomberState === "return" || enemy.varnokState === "returning") {
      const slot = getDiveBomberReturnPosition(enemy.formationSlot, formation);
      targetAngle = Math.atan2(enemy.x - slot.x, slot.y - enemy.y);
      if (enemy.y <= -enemy.height / 2) {
        // Reset the pose while the returning sprite is still above the canvas.
        alienAngles.set(enemy, targetAngle);
        continue;
      }
    } else if (currentAngle === 0) {
      continue;
    }

    const difference = targetAngle - currentAngle;
    const shortestTurn = Math.atan2(Math.sin(difference), Math.cos(difference));
    const angle = currentAngle + shortestTurn * turnFraction;
    if (targetAngle === 0 && Math.abs(angle) < 0.001) {
      alienAngles.delete(enemy);
    } else {
      alienAngles.set(enemy, angle);
    }
  }
}

function updateLevel2Bomber(deltaSeconds, frameTime) {
  const varnokFormation = boss?.level === 4 ? varnokAlienFormation : null;
  const ordinaryLevel3 = currentLevel === 3 && varnokFormation === null;
  let bomber = level2Bomber;
  if (bomber === null) {
    level2BomberTimer -= deltaSeconds;
    if (level2BomberTimer <= 0) {
      const eligibleEnemies = varnokFormation === null
        ? enemies.filter((enemy) => enemy.formationSlot !== null && enemy.bomberState === undefined
          && (!ordinaryLevel3 || enemy.y < player.y))
        : varnokFormation.aliens.filter((alien) => isSettledVarnokAlien(alien) && alien.y < player.y);
      if (eligibleEnemies.length > 0) {
        bomber = eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
        level2Bomber = bomber;
        if (varnokFormation === null) bomber.formationSlot = null;
        bomber.bomberState = "dive";
        const dx = player.x - bomber.x;
        const dy = player.y - bomber.y;
        const distance = Math.hypot(dx, dy) || 1;
        bomber.diveVelocityX = dx / distance * level2BomberSpeed;
        bomber.diveVelocityY = dy / distance * level2BomberSpeed;
        bomber.contactingPlayer = false;
      } else if (varnokFormation !== null) {
        level2BomberTimer = level2BomberCooldown;
      }
    }
  }
  if (bomber === null) return;
  if (!enemies.includes(bomber)) {
    level2Bomber = null;
    level2BomberTimer = level2BomberCooldown;
    return;
  }
  const movementDelta = deltaSeconds * getEnemyMovementMultiplier();
  if (bomber.bomberState === "dive") {
    bomber.x += bomber.diveVelocityX * movementDelta;
    bomber.y += bomber.diveVelocityY * movementDelta;
    const touchingPlayer = bomber.x + bomber.width / 2 >= player.x - player.width / 2
      && bomber.x - bomber.width / 2 <= player.x + player.width / 2
      && bomber.y + bomber.height / 2 >= player.y - player.height / 2
      && bomber.y - bomber.height / 2 <= player.y + player.height / 2;
    if (touchingPlayer && !bomber.contactingPlayer && damagePlayer(frameTime)) {
      clearLevel2Shield();
      removeEnemy(bomber);
      level2Bomber = null;
      level2BomberTimer = gameState === "playing" ? level2BomberCooldown : 0;
      if (varnokFormation === null && enemies.length === 0 && lives > 0) {
        if (currentLevel === 2) advanceLevel2Formation();
        else if (currentLevel === 3) advanceLevel3Formation();
      }
      return;
    }
    bomber.contactingPlayer = touchingPlayer;
    const exitedBottom = bomber.y - bomber.height / 2 > canvas.height;
    const exitedOtherEdge = ordinaryLevel3 && (bomber.x + bomber.width / 2 < 0
      || bomber.x - bomber.width / 2 > canvas.width || bomber.y + bomber.height / 2 < 0);
    if (exitedBottom || exitedOtherEdge) {
      const availableSlots = getDiveBomberReturnSlots(bomber, varnokFormation);
      const selectedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      bomber.formationSlot = selectedSlot;
      bomber.x = getDiveBomberReturnPosition(selectedSlot, varnokFormation).x;
      bomber.y = -bomber.height / 2;
      bomber.bomberState = "return";
      bomber.contactingPlayer = false;
    }
  } else if (bomber.bomberState === "return") {
    const { x: targetX, y: targetY } = getDiveBomberReturnPosition(bomber.formationSlot, varnokFormation);
    const dx = targetX - bomber.x;
    const dy = targetY - bomber.y;
    const distance = Math.hypot(dx, dy);
    const step = level2BomberSpeed * movementDelta;
    if (distance <= step || distance === 0) {
      bomber.x = targetX;
      bomber.y = targetY;
      delete bomber.bomberState;
      level2Bomber = null;
      level2BomberTimer = level2BomberCooldown;
    } else {
      bomber.x += dx / distance * step;
      bomber.y += dy / distance * step;
    }
  }
}

function getDiveBomberReturnSlots(bomber, varnokFormation) {
  const occupiedSlots = new Set(enemies
    .filter((enemy) => enemy !== bomber && enemy.formationSlot !== null)
    .map((enemy) => enemy.formationSlot));
  if (varnokFormation === null) {
    return regularFormation.slots.map((_, slot) => slot)
      .filter((slot) => !occupiedSlots.has(slot));
  }

  const halfSize = enemySize / 2;
  const maxY = canvas.height - halfSize - getRemainingVarnokDescent(varnokFormation.descentAnimation);
  return varnokFormation.slots
    .map((_, index) => index)
    .filter((index) => {
      if (index === bomber.formationSlot) return true;
      const { x, y } = varnokFormation.slots[index];
      return index < varnokFormation.nextLaunchSlot && !occupiedSlots.has(index)
        && x >= halfSize && x <= canvas.width - halfSize
        && y >= halfSize && y <= maxY;
    });
}

function getDiveBomberReturnPosition(slot, varnokFormation) {
  if (varnokFormation !== null) return varnokFormation.slots[slot];

  const level3DescentOffset = currentLevel === 3 ? level3FormationDescentOffset : 0;
  const position = regularFormation.slots[slot];
  return {
    x: position.x + level2FormationOffsetX,
    y: position.y + level3DescentOffset,
  };
}

function removeEnemy(enemy) {
  const enemyIndex = enemies.indexOf(enemy);
  if (enemyIndex !== -1) {
    enemies.splice(enemyIndex, 1);
    if (gameState === "playing") playSoundEffect("enemyDestroyed");
  }
  if (enemy.isVarnokAlien && varnokAlienFormation !== null) {
    const batchIndex = varnokAlienFormation.aliens.indexOf(enemy);
    if (batchIndex !== -1) varnokAlienFormation.aliens.splice(batchIndex, 1);
  }
  return enemyIndex !== -1;
}

function spawnAlienBurst(enemy) {
  const palette = enemy.isVarnokAlien ? hatchlingBurstPalette : alienBurstPalettes[currentLevel - 1];
  spawnDestructionBurst(enemy.x, enemy.y, palette, alienBurstFragmentCount);
}

function spawnDestructionBurst(x, y, palette, fragmentCount, {
  minDuration = 0.25,
  durationRange = 0.20,
  speedScale = 1,
  sizeScale = 1,
  startedAt = combatElapsed,
} = {}) {
  const rolls = crypto.getRandomValues(new Uint32Array(fragmentCount * 4));
  const overflow = destructionFragments.length + fragmentCount - destructionFragmentLimit;
  if (overflow > 0) destructionFragments.splice(0, overflow);

  for (let index = 0; index < fragmentCount; index += 1) {
    const offset = index * 4;
    const angle = (index + rolls[offset] / 0x100000000) * 2 * Math.PI / fragmentCount;
    const speed = (55 + 65 * rolls[offset + 1] / 0x100000000) * speedScale;
    destructionFragments.push({
      x,
      y,
      vx: speed * Math.cos(angle),
      vy: speed * Math.sin(angle),
      angle,
      size: (1.6 + 1.5 * rolls[offset + 2] / 0x100000000) * sizeScale,
      duration: minDuration + durationRange * rolls[offset + 3] / 0x100000000,
      startedAt,
      color: palette[index % 4 === 0 ? 2 : index % 2],
    });
  }
}

function updateDestructionFragments(visualTime = combatElapsed) {
  for (let index = destructionFragments.length - 1; index >= 0; index -= 1) {
    const fragment = destructionFragments[index];
    if (visualTime - fragment.startedAt >= fragment.duration) destructionFragments.splice(index, 1);
  }
}

function clearLevel2Shield() {
  level2ShieldCharges = 0;
  level2ShieldTimeRemaining = 0;
}

function updateLevel2Pickups(deltaSeconds) {
  for (let index = level2Pickups.length - 1; index >= 0; index -= 1) {
    const pickup = level2Pickups[index];
    pickup.y += level2ShieldPickupSpeed * deltaSeconds;
    const touchingPlayer = pickup.x + pickup.width / 2 >= player.x - player.width / 2
      && pickup.x - pickup.width / 2 <= player.x + player.width / 2
      && pickup.y + pickup.height / 2 >= player.y - player.height / 2
      && pickup.y - pickup.height / 2 <= player.y + player.height / 2;
    if (touchingPlayer) {
      if (pickup.type === "shield") {
        level2ShieldCharges = level2ShieldChargesMax;
        level2ShieldTimeRemaining = level2ShieldDuration;
        level2PickupMessageText = "Shield!";
      } else {
        level2ActiveWeapon = { type: pickup.type, timeRemaining: level2WeaponDuration };
        level2PickupMessageText = playerWeapons[pickup.type].message;
      }
      level2PickupMessageTimeRemaining = level2PickupMessageDuration;
      level2Pickups.splice(index, 1);
      if (soundEffectsEnabled) gameSoundEffects.playPickup(pickup.type);
    } else if (pickup.y - pickup.height / 2 > canvas.height) {
      level2Pickups.splice(index, 1);
    }
  }
}

function updateLevel2PickupTimers(deltaSeconds) {
  if (currentLevel !== 2 && currentLevel !== 3) return;
  if (level2ShieldTimeRemaining > 0) {
    level2ShieldTimeRemaining -= deltaSeconds;
    if (level2ShieldTimeRemaining < 0.000001) clearLevel2Shield();
  }
  if (level2ActiveWeapon !== null) {
    level2ActiveWeapon.timeRemaining -= deltaSeconds;
    if (level2ActiveWeapon.timeRemaining < 0.000001) level2ActiveWeapon = null;
  }
  level2PickupMessageTimeRemaining = Math.max(
    0,
    level2PickupMessageTimeRemaining - deltaSeconds,
  );
  if (level2PickupMessageTimeRemaining < 0.000001) {
    level2PickupMessageTimeRemaining = 0;
  }
}

function randomLevel2BonusShipDelay() {
  return level2BonusShipDelayMin
    + Math.random() * (level2BonusShipDelayMax - level2BonusShipDelayMin);
}

function updateLevel2BonusShip(deltaSeconds) {
  if (level2BonusShip !== null) {
    level2BonusShip.x += level2BonusShip.direction * level2BonusShipSpeed * deltaSeconds;
    const hasExited = level2BonusShip.direction > 0
      ? level2BonusShip.x - level2BonusShip.width / 2 > canvas.width
      : level2BonusShip.x + level2BonusShip.width / 2 < 0;
    if (hasExited) {
      level2BonusShip = null;
      level2BonusShipTimer = randomLevel2BonusShipDelay();
    }
    return;
  }

  level2BonusShipTimer -= deltaSeconds;
  if (level2BonusShipTimer <= 0) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    level2BonusShip = {
      x: direction > 0 ? -level2BonusShipWidth / 2 : canvas.width + level2BonusShipWidth / 2,
      y: 42,
      width: level2BonusShipWidth,
      height: level2BonusShipHeight,
      direction,
    };
  }
}

function updateSuppliesDuringEntrance(deltaSeconds) {
  if (level2BonusShip !== null) updateLevel2BonusShip(deltaSeconds);
  updateLevel2Pickups(deltaSeconds);
}

function getLevel2BossShotTarget(shot, deltaSeconds) {
  // Compare both contact times even for straight shots, which usually test only the current position.
  const contactShot = level2Bosses.length > 1 && shot.previousX === undefined
    ? { ...shot, previousX: shot.x, previousY: shot.y - (shot.vy ?? -shotSpeed) * deltaSeconds }
    : shot;
  let target = null;
  let earliestContact = Infinity;
  for (const candidate of level2Bosses) {
    const bounds = getCenteredBounds({
      x: candidate.x, y: candidate.y,
      width: candidate.width * 0.58, height: candidate.height * 0.62,
    });
    const contact = getShotContactTime(contactShot, bounds);
    if (contact === Infinity) continue;
    // From below, the lower boss wins a tie. Equal heights keep the existing list order.
    if (target === null || contact < earliestContact
      || (contact === earliestContact && candidate.y > target.y)) {
      target = candidate;
      earliestContact = contact;
    }
  }
  return target;
}

function handleShotCollisions(deltaSeconds, frameTime) {
  for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
    const shot = shots[shotIndex];
    const shotBounds = getPlayerShotBounds(shot);
    let hitEnemyIndex = -1;

    if (damageBarrierWithShot(shot)) {
      shots.splice(shotIndex, 1);
      continue;
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      if (enemy.isVarnokAlien && enemy.varnokState !== "formation") continue;
      if (getShotContactTime(shot, getCenteredBounds(enemy)) < Infinity) {
        hitEnemyIndex = enemyIndex;
        break;
      }
    }

    if (hitEnemyIndex !== -1) {
      const clearsWave = enemies.length === 1 && lives > 0 && level2Bosses.length === 0 && boss?.level !== 4;
      if (clearsWave && resolveFinalHitBeforeClear(deltaSeconds, frameTime)) return;
      if (enemies[hitEnemyIndex] === level2Bomber) {
        level2Bomber = null;
        level2BomberTimer = level2BomberCooldown;
      }
      const destroyedEnemy = enemies[hitEnemyIndex];
      if (removeEnemy(destroyedEnemy) && gameState === "playing") spawnAlienBurst(destroyedEnemy);
      shots.splice(shotIndex, 1);
      score += 10;
      scoreDisplay.textContent = score;
      if (clearsWave) {
        if (currentLevel === 1 && currentWave < level1WaveCount) {
          currentWave += 1;
          shots.length = 0;
          enemyShots.length = 0;
          enemies.length = 0;
          createEnemies();
          enemyDirection = 1;
          startWaveEntrance();
        } else if (currentLevel === 1) {
          startBossIntro();
        } else if (currentLevel === 2) {
          advanceLevel2Formation();
        } else {
          advanceLevel3Formation();
        }
        return;
      }
    } else if ((currentLevel === 2 || currentLevel === 3) && level2BonusShip !== null
      && getShotContactTime(shot, getCenteredBounds(level2BonusShip)) < Infinity) {
      const pickupX = level2BonusShip.x;
      const pickupY = level2BonusShip.y;
      shots.splice(shotIndex, 1);
      score += 50;
      scoreDisplay.textContent = score;
      level2BonusShip = null;
      playSoundEffect("enemyDestroyed");
      level2BonusShipTimer = randomLevel2BonusShipDelay();
      const reward = developerForcedSupplyReward
        ?? supplyRewards[Math.floor(Math.random() * supplyRewards.length)];
      if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
      level2Pickups.push({
        x: pickupX,
        y: pickupY,
        width: 22,
        height: 22,
        type: reward,
      });
      if (gameState === "playing") {
        const artwork = getActiveSupplyShipArtwork();
        const palette = artwork.ready ? artwork.burstPalette : supplyShipFallbackBurstPalette;
        spawnDestructionBurst(pickupX, pickupY, palette, supplyShipBurstFragmentCount);
      }
    } else if (level2Bosses.length > 0) {
      const target = getLevel2BossShotTarget(shot, deltaSeconds);
      if (target !== null) {
        shots.splice(shotIndex, 1);
        if (!shot.damagedBosses?.has(target)) {
          shot.damagedBosses?.add(target);
          if (applyBossDamage(1, frameTime, target, deltaSeconds)) return;
        }
      }
    } else if (boss !== null) {
      const bossBounds = getCenteredBounds(boss);
      let damagesBoss = false;
      let hitsArmour = false;
      if (shot.previousX !== undefined && (boss.level === 3 || boss.level === 4)) {
        const armour = boss.level === 3
          ? getLevel3BossArmorCollisionRegions(boss)
          : getVarnokArmorCollisionRegions(boss);
        const targets = boss.level === 3
          ? [getLevel3BossCoreBounds(boss)]
          : getVarnokEyeGeometry(boss).map((eye) => eye.exposed);
        const armourTime = Math.min(...armour.map((region) => getShotContactTime(shot, region)));
        const targetTime = Math.min(...targets.map((region) => getShotContactTime(shot, region)));
        // Armour wins ties, but armour behind a vulnerable target cannot stop its hit.
        damagesBoss = targetTime < armourTime;
        hitsArmour = armourTime < Infinity;
        if (damagesBoss || hitsArmour) shots.splice(shotIndex, 1);
      } else if (boss.level === 3) {
        if (collisionBoundsOverlap(shotBounds, bossBounds)) {
          const core = getLevel3BossCoreBounds(boss);
          // Check the entry point before a fast shot can cross the shallow opening in one frame.
          const entersFromBelow = shot.y < bossBounds.bottom
            && shot.y + shotSpeed * deltaSeconds >= bossBounds.bottom;
          const contactBounds = entersFromBelow ? {
            ...shotBounds,
            top: bossBounds.bottom,
            bottom: bossBounds.bottom + shot.height,
          } : shotBounds;
          hitsArmour = getLevel3BossArmorCollisionRegions(boss)
            .some((region) => collisionBoundsOverlap(contactBounds, region));
          damagesBoss = !hitsArmour && collisionBoundsOverlap(contactBounds, core);
          if (hitsArmour || damagesBoss) {
            shots.splice(shotIndex, 1);
          }
        }
      } else if (boss.level === 4) {
        if (collisionBoundsOverlap(shotBounds, bossBounds)) {
          hitsArmour = getVarnokArmorCollisionRegions(boss)
            .some((region) => collisionBoundsOverlap(shotBounds, region));
          const hitsEye = getVarnokEyeGeometry(boss)
            .some((eye) => collisionBoundsOverlap(shotBounds, eye.bounds)
              && collisionBoundsOverlap(shotBounds, eye.exposed));
          damagesBoss = !hitsArmour && hitsEye;
          if (hitsArmour || damagesBoss) shots.splice(shotIndex, 1);
        }
      } else {
        damagesBoss = getShotContactTime(shot, bossBounds) < Infinity;
        if (damagesBoss) shots.splice(shotIndex, 1);
      }

      if (damagesBoss && !shot.damagedBosses?.has(boss)) {
        shot.damagedBosses?.add(boss);
        if (applyBossDamage(1, frameTime, boss, deltaSeconds)) return;
      }
    }

    // Check the last angled segment for collisions before removing an offscreen bullet.
    if (shot.previousX !== undefined && shots[shotIndex] === shot
      && (shot.y + shot.height < 0 || shotBounds.right < 0 || shotBounds.left > canvas.width)) {
      shots.splice(shotIndex, 1);
    }
  }
}

function applyBossDamage(damage, frameTime = performance.now(), targetBoss = boss, deltaSeconds = null) {
  if (gameState !== "playing" || targetBoss === null || targetBoss.health <= 0) return false;
  const level2BossIndex = targetBoss.level === 2 ? level2Bosses.indexOf(targetBoss) : -1;
  if (targetBoss.level === 2 && level2BossIndex === -1) return false;

  const healthBefore = targetBoss.health;
  const clearsEncounter = damage >= healthBefore && (targetBoss.level !== 2 || level2Bosses.length === 1);
  if (clearsEncounter && deltaSeconds !== null && resolveFinalHitBeforeClear(deltaSeconds, frameTime)) return true;
  targetBoss.health -= damage;
  if (targetBoss.health < healthBefore) {
    targetBoss.hitFlashUntil = frameTime + bossHitFlashDuration;
    playSoundEffect(targetBoss.health > 0 ? "bossHit" : "bossDefeated");
  }
  score += 10;
  scoreDisplay.textContent = score;
  if (targetBoss.health > 0) return false;

  if (targetBoss.level === 2) {
    level2Bosses.splice(level2BossIndex, 1);
    if (level2AttackOwner === targetBoss) level2AttackOwner = null;
    if (nextLevel2Attacker === targetBoss) nextLevel2Attacker = level2Bosses[0] ?? null;
    level2DefeatBonusTotal += level2BossDefeatBonus;
    score += level2BossDefeatBonus;
    scoreDisplay.textContent = score;
    if (level2Bosses.length > 0) return false;
    showLevel2ClearedScreen();
  } else if (targetBoss.level === 3) {
    score += level3BossDefeatBonus;
    scoreDisplay.textContent = score;
    if (developerBossTestLevel === 3) {
      showLevel3BossDefeatedScreen();
    } else {
      clearLevel3BossEncounterState();
      boss = null;
      startVarnokBossFight(true);
    }
  } else if (targetBoss.level === 4) {
    score += varnokBossDefeatBonus;
    scoreDisplay.textContent = score;
    finishVarnokEncounter();
  } else {
    score += level1BossDefeatBonus;
    scoreDisplay.textContent = score;
    showLevel1ClearedScreen();
  }
  return true;
}

function fireAlienShot(shooter) {
  const shot = {
    x: shooter.x,
    y: shooter.y + shooter.height / 2,
    width: 7,
    height: 13,
    artwork: alienShotArtwork[shooter.isVarnokAlien ? 3 : currentLevel - 1],
  };
  if (shooter.isVarnokAlien) varnokMinionShots.add(shot);
  enemyShots.push(shot);
  playSoundEffect("enemyShot");
}

function updateAlienFiring(shooters, frameTime, ordinaryWave = false) {
  if (shooters.length === 0) {
    nextEnemyShotTime = null;
    return;
  }
  if (nextEnemyShotTime !== null && frameTime < nextEnemyShotTime) return;

  const { minimum, jitter } = ordinaryWave
    ? getOrdinaryWaveShotTiming()
    : { minimum: enemyShotIntervalMin, jitter: enemyShotIntervalRange };
  if (nextEnemyShotTime === null) {
    nextEnemyShotTime = frameTime + minimum;
    return;
  }
  const shooter = shooters[Math.floor(Math.random() * shooters.length)];
  fireAlienShot(shooter);
  scheduleEnemyRepeat(shooter, () => fireAlienShot(shooter));
  nextEnemyShotTime = frameTime + minimum + Math.random() * jitter;
}

function updateEnemyShots(deltaSeconds, frameTime) {
  const firedRepeat = updateEnemyRepeats();
  if (boss === null && level2Bosses.length === 0) {
    // Keep a Ridiculous repeat and the next primary shot apart even after a slow frame.
    if (firedRepeat && nextEnemyShotTime !== null) {
      nextEnemyShotTime = Math.max(nextEnemyShotTime, frameTime + enemyRepeatGap * 1000);
    }
    if (pendingEnemyRepeats.length === 0) updateAlienFiring(enemies, frameTime, true);
  } else if (boss?.level === 4 && varnokAlienFormation !== null) {
    const settledAliens = varnokAlienFormation.aliens.filter(isSettledVarnokAlien);
    updateAlienFiring(settledAliens, frameTime);
  }
  updateEnemyProjectiles(deltaSeconds, frameTime);
}

function advanceEnemyProjectile(shot, deltaSeconds) {
  shot.y += (shot.vy ?? enemyShotSpeed) * deltaSeconds;
  if (shot.vx !== undefined) shot.x += shot.vx * deltaSeconds;
}

function getEnemyProjectileOutcome(shot, playerBounds, targetBarriers = barriers) {
  if (shot.bounceAtWalls) {
    const minX = shot.width / 2;
    const maxX = canvas.width - minX;
    if (shot.x < minX) {
      shot.x = minX;
      shot.vx = Math.abs(shot.vx);
    } else if (shot.x > maxX) {
      shot.x = maxX;
      shot.vx = -Math.abs(shot.vx);
    }
  }
  const isBelowCanvas = shot.isBossShot ? shot.y >= canvas.height : shot.y > canvas.height;
  if (isBelowCanvas || damageBarrierWithShot(shot, targetBarriers)) return "remove";
  return collisionBoundsOverlap(getPlayerShotBounds(shot), playerBounds) ? "hit" : "keep";
}

function updateEnemyProjectiles(deltaSeconds, frameTime) {
  for (const shot of enemyShots) advanceEnemyProjectile(shot, deltaSeconds);

  const playerBounds = getCenteredBounds(player);
  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const outcome = getEnemyProjectileOutcome(enemyShots[index], playerBounds);
    if (outcome !== "keep") enemyShots.splice(index, 1);
    if (outcome === "hit") {
      damagePlayerFromProjectile(frameTime);
      if (gameState !== "playing") break;
    }
  }
}

function resolveFinalHitBeforeClear(deltaSeconds, frameTime) {
  if (lives !== 1 || enemyShots.length === 0 || frameTime < playerShieldProtectedUntil
    || ((currentLevel === 2 || currentLevel === 3) && level2ShieldCharges > 0)) return false;

  // Check the projectiles the clear would discard, with the usual collision order.
  const predictedBarriers = barriers.map((barrier) => ({ ...barrier }));
  const playerBounds = getCenteredBounds(player);
  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const shot = { ...enemyShots[index] };
    advanceEnemyProjectile(shot, deltaSeconds);
    if (getEnemyProjectileOutcome(shot, playerBounds, predictedBarriers) === "hit") {
      updateEnemyProjectiles(deltaSeconds, frameTime);
      return true;
    }
  }
  return false;
}

function drawPlayer(frameTime) {
  if ((currentLevel === 2 || currentLevel === 3) && level2ShieldCharges > 0) {
    context.save();
    context.globalAlpha *= Math.min(1, level2ShieldTimeRemaining / level2ShieldFadeDuration);
    context.lineWidth = 3;
    if (level2ShieldCharges >= 2) {
      context.strokeStyle = "rgba(112, 232, 255, 0.9)";
      context.beginPath();
      context.ellipse(player.x, player.y, 37, 33, 0, 0, Math.PI * 2);
      context.stroke();
    }
    context.strokeStyle = "rgba(220, 250, 255, 0.95)";
    context.beginPath();
    context.ellipse(player.x, player.y, 27, 25, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
  const isFlashing = frameTime < playerInvulnerableUntil
    && Math.floor(frameTime / 75) % 2 === 0;
  const bankEffect = !DEVELOPER_MODE || developerBankEffect.checked;
  const bankAmount = Math.abs(playerBank);
  context.save();
  if (bankEffect) {
    const widthScale = 1 - (1 - playerFullBankWidthScale) * bankAmount;
    context.translate(player.x, player.y);
    context.rotate(playerBank * playerMaxBankRotation);
    context.transform(widthScale, playerBank * playerMaxBankSkew, 0, 1, 0, 0);
  }
  const artwork = shipArtwork[selectedShipId];
  if (artwork.flashImage !== null) {
    const height = Math.min(player.height, player.width * artwork.height / artwork.width);
    const width = height * artwork.width / artwork.height;
    const centerX = bankEffect ? 0 : player.x;
    const centerY = bankEffect ? 0 : player.y;
    // Align each nose with the existing firing point, even when the sprite is shorter.
    const top = centerY - player.height / 2;
    context.drawImage(isFlashing ? artwork.flashImage : artwork.image,
      centerX - width / 2, top, width, height);
    const farWingShade = artwork.wingShades[playerBank < 0 ? 1 : 0];
    if (bankEffect && !isFlashing && farWingShade && bankAmount > 0) {
      context.globalAlpha *= bankAmount;
      context.drawImage(farWingShade, -width / 2, top, width, height);
    }
    context.restore();
    return;
  }

  if (bankEffect) context.translate(-player.x, -player.y);
  context.fillStyle = isFlashing ? "#ffffff" : "#48c9ef";
  context.beginPath();
  context.moveTo(player.x, player.y - player.height / 2);
  context.lineTo(player.x + player.width * 0.22, player.y - player.height * 0.16);
  context.lineTo(player.x + player.width / 2, player.y + player.height * 0.22);
  context.lineTo(player.x + player.width * 0.31, player.y + player.height * 0.3);
  context.lineTo(player.x + player.width * 0.17, player.y + player.height / 2);
  context.lineTo(player.x, player.y + player.height * 0.34);
  context.lineTo(player.x - player.width * 0.17, player.y + player.height / 2);
  context.lineTo(player.x - player.width * 0.31, player.y + player.height * 0.3);
  context.lineTo(player.x - player.width / 2, player.y + player.height * 0.22);
  context.lineTo(player.x - player.width * 0.22, player.y - player.height * 0.16);
  context.closePath();
  context.fill();

  context.fillStyle = isFlashing ? "#ffffff" : "#d7f8ff";
  context.beginPath();
  context.ellipse(player.x, player.y - player.height * 0.03, 3.2, 6.2, 0, 0, Math.PI * 2);
  context.fill();

  if (!isFlashing) {
    context.fillStyle = "#ffb26b";
    context.fillRect(player.x - 3, player.y + player.height * 0.31, 2, 3);
    context.fillRect(player.x + 1, player.y + player.height * 0.31, 2, 3);
  }
  context.restore();
}

function drawBackground() {
  const scene = gameState === "menu" || gameState === "credits" ? gameState : `level-${currentLevel}`;
  const image = sceneBackgrounds.get(scene);
  if (image?.complete && image.naturalWidth === canvas.width && image.naturalHeight === canvas.height) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return;
  }
  drawStarfield();
}

function drawStarfield() {
  context.fillStyle = "#07111f";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of stars) {
    context.fillStyle = `rgba(190, 220, 255, ${star.alpha})`;
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawDestructionFragments(visualTime = combatElapsed) {
  if (destructionFragments.length === 0) return;
  context.save();
  for (const fragment of destructionFragments) {
    const age = visualTime - fragment.startedAt;
    const progress = age / fragment.duration;
    const travel = (age + 0.025) * (1 - 0.40 * progress);
    const x = fragment.x + fragment.vx * travel;
    const y = fragment.y + fragment.vy * travel;
    const spin = fragment.angle + 11 * age;
    const dx = Math.cos(spin) * fragment.size;
    const dy = Math.sin(spin) * fragment.size;
    context.globalAlpha = 1 - progress;
    context.fillStyle = fragment.color;
    context.beginPath();
    context.moveTo(x + dx, y + dy);
    context.lineTo(x - dy * 0.7, y + dx * 0.7);
    context.lineTo(x - dx, y - dy);
    context.lineTo(x + dy * 0.7, y - dx * 0.7);
    context.closePath();
    context.fill();
  }
  context.restore();
}

function drawEnemy(enemy, index, x = enemy.x, y = enemy.y) {
  const halfWidth = enemy.width / 2;
  const halfHeight = enemy.height / 2;
  const alternatePose = formationAlternatePose && isRegularFormationAlien(enemy)
    ? regularAlienPose2[currentLevel - 1]
    : null;
  const alternateImage = alternatePose?.ready ? alternatePose.image : null;
  if (currentLevel === 1 && clackImageReady) {
    context.drawImage(alternateImage ?? clackImage, x - halfWidth, y - halfHeight, enemy.width, enemy.height);
    return;
  }
  let alienImage = null;
  if (enemy.isVarnokAlien) {
    const artwork = hatchlingVisualChoices.get(enemy);
    if (artwork?.ready) {
      const usePose2 = formationAlternatePose && (gameState === "playing" || gameState === "playerDeath")
        && boss?.level === 4 && isSettledVarnokAlien(enemy) && artwork.pose2.ready;
      alienImage = usePose2 ? artwork.pose2.image : artwork.image;
    }
  } else if (currentLevel === 2 && anvilImageReady) {
    alienImage = alternateImage ?? anvilImage;
  } else if (currentLevel === 3 && riftImageReady) {
    alienImage = alternateImage ?? riftImage;
  }
  if (alienImage !== null) {
    context.save();
    context.translate(x, y);
    context.rotate(alienAngles.get(enemy) ?? 0);
    context.drawImage(alienImage, -halfWidth, -halfHeight, enemy.width, enemy.height);
    context.restore();
    return;
  }

  const warmVariant = index % 2 === 0;

  context.fillStyle = warmVariant ? "#df6685" : "#ef8b63";
  context.beginPath();
  context.moveTo(x, y - halfHeight);
  context.lineTo(x + halfWidth * 0.68, y - halfHeight * 0.28);
  context.lineTo(x + halfWidth, y + halfHeight * 0.18);
  context.lineTo(x + halfWidth * 0.68, y + halfHeight * 0.48);
  context.lineTo(x + halfWidth * 0.48, y + halfHeight);
  context.lineTo(x + halfWidth * 0.12, y + halfHeight * 0.65);
  context.lineTo(x - halfWidth * 0.12, y + halfHeight * 0.65);
  context.lineTo(x - halfWidth * 0.48, y + halfHeight);
  context.lineTo(x - halfWidth * 0.68, y + halfHeight * 0.48);
  context.lineTo(x - halfWidth, y + halfHeight * 0.18);
  context.lineTo(x - halfWidth * 0.68, y - halfHeight * 0.28);
  context.closePath();
  context.fill();

  context.fillStyle = "#fff0c2";
  context.beginPath();
  context.arc(x - halfWidth * 0.23, y + halfHeight * 0.05, 1.7, 0, Math.PI * 2);
  context.arc(x + halfWidth * 0.23, y + halfHeight * 0.05, 1.7, 0, Math.PI * 2);
  context.fill();
}

function drawReturningVarnokHatchling(enemy, index, formation) {
  const arrival = hatchlingReturnVisuals.get(enemy);
  if (!arrival?.startDistance) {
    drawEnemy(enemy, index);
    return;
  }

  // Offset the drawing only. The existing return step still decides when the slot is reached.
  const slot = formation.slots[enemy.formationSlot];
  const remaining = Math.hypot(slot.x - enemy.x, slot.y - enemy.y);
  const progress = Math.max(0, 1 - remaining / arrival.startDistance);
  let { x, y } = enemy;
  if (arrival.batch.pattern === "split") {
    const entryX = arrival.index < Math.ceil(arrival.batch.size / 2) ? 64 : canvas.width - 64;
    x += (entryX - enemy.launchX) * (1 - progress) ** 2;
  } else if (arrival.batch.pattern === "sweep") {
    const arc = Math.sin(Math.PI * progress) ** 2;
    const direction = enemy.launchX < canvas.width / 2 ? 1 : -1;
    x += direction * 120 * arc;
    y -= 30 * arc;
  } else {
    const delay = 0.10 + (arrival.index % 3) * 0.14;
    const descent = Math.max(0, (progress - delay) / (1 - delay));
    y += (descent - progress) * (slot.y + enemy.height / 2);
  }

  const halfWidth = enemy.width / 2;
  x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, x));
  drawEnemy(enemy, index, x, y);
}

function drawVarnokHatchlings(emerging, hatchOpening) {
  const body = getCenteredBounds(boss);
  const gap = getRootedCrownHatchGap(hatchOpening);
  context.save();
  context.beginPath();
  context.rect(0, 0, canvas.width, body.top);
  context.moveTo(boss.x - gap, body.top);
  context.lineTo(boss.x + gap, body.top);
  context.lineTo(boss.x + gap, body.top + 20);
  context.lineTo(boss.x + gap * 0.78, body.top + rootedCrownHatchLipY);
  context.lineTo(boss.x - gap * 0.78, body.top + rootedCrownHatchLipY);
  context.lineTo(boss.x - gap, body.top + 20);
  context.closePath();
  context.clip();

  for (const { enemy, index, age } of emerging) {
    // Start behind the crown's foreground lip and ease into the existing flight path.
    const inside = (1 - age / varnokHatchEmergenceDuration) ** 2;
    const startY = body.top + rootedCrownHatchLipY + enemy.height * 0.3;
    const x = enemy.x + (boss.x - enemy.x) * inside;
    const y = enemy.y + (startY - enemy.y) * inside;
    drawEnemy(enemy, index, x, y);
  }
  context.restore();
}

function getActiveSupplyShipArtwork() {
  return selectedShipId === "vesper" ? supplyShipArtwork.kestrel : supplyShipArtwork.vesper;
}

function drawLevel2BonusShip() {
  if (level2BonusShip === null) return;
  context.save();
  context.translate(level2BonusShip.x, level2BonusShip.y);
  const artwork = getActiveSupplyShipArtwork();
  if (artwork.ready) {
    const { width } = artwork;
    const height = vesperArtHeight;
    if (level2BonusShip.direction < 0) context.scale(-1, 1);
    context.drawImage(artwork.image, -width / 2, -height / 2, width, height);
    context.restore();
    return;
  }

  context.scale(level2BonusShip.direction * 1.1, 1.1);
  context.fillStyle = "#72d9ed";
  context.beginPath();
  context.moveTo(24, 0);
  context.lineTo(7, -6);
  context.lineTo(-12, -12);
  context.lineTo(-8, -3);
  context.lineTo(-21, 0);
  context.lineTo(-8, 3);
  context.lineTo(-12, 12);
  context.lineTo(7, 6);
  context.closePath();
  context.fill();
  context.fillStyle = "#fff0c2";
  context.beginPath();
  context.ellipse(5, 0, 4, 3, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCombatArtwork(artwork, left, top) {
  context.save();
  context.translate(left, top);
  for (const [color, path] of artwork) {
    context.fillStyle = color;
    context.fill(path);
  }
  context.restore();
}

function drawLevel2Pickups() {
  for (const pickup of level2Pickups) {
    drawCombatArtwork(supplyCrateArtwork, pickup.x - pickup.width / 2, pickup.y - pickup.height / 2);
  }
}

function drawEnemyShot(shot) {
  const left = shot.x - shot.width / 2;
  if (shot.artwork) {
    drawCombatArtwork(shot.artwork, left, shot.y);
  } else {
    context.fillStyle = "#ffb26b";
    context.fillRect(left, shot.y, shot.width, shot.height);
  }
}

function drawLevel2PickupMessage() {
  if ((currentLevel !== 2 && currentLevel !== 3) || level2PickupMessageTimeRemaining <= 0) return;
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 20px Arial, sans-serif";
  context.lineWidth = 4;
  context.strokeStyle = "rgba(5, 11, 21, 0.95)";
  context.fillStyle = "#ffe08a";
  const messageY = canvas.height - 18;
  context.strokeText(level2PickupMessageText, canvas.width / 2, messageY);
  context.fillText(level2PickupMessageText, canvas.width / 2, messageY);
  context.restore();
}

function drawLevel2BossChargeLane(boss) {
  if (boss.chargePath === null) return;
  if (boss.attackPhase !== "prepare" && boss.attackPhase !== "charge") return;

  const path = boss.chargePath;
  const dx = path.endX - path.launchX;
  const dy = path.endY - path.launchY;
  const length = Math.hypot(dx, dy) || 1;
  const width = boss.width * 0.58;
  const height = boss.height * 0.62;
  const sweptWidth = width * Math.abs(dy / length) + height * Math.abs(dx / length);
  const fade = boss.attackPhase === "charge"
    ? Math.max(0, 1 - boss.attackPhaseElapsed / level2BossLaneFadeDuration)
    : 1;

  const clipExtent = Math.hypot(canvas.width, canvas.height);
  const forwardX = dx / length * clipExtent;
  const forwardY = dy / length * clipExtent;

  context.save();
  // Start the visible lane under the sprite and keep it below and ahead of the moving boss.
  context.beginPath();
  context.rect(0, boss.y, canvas.width, canvas.height - boss.y);
  context.clip();
  context.beginPath();
  context.moveTo(boss.x - forwardY, boss.y + forwardX);
  context.lineTo(boss.x + forwardY, boss.y - forwardX);
  context.lineTo(boss.x + forwardY + forwardX, boss.y - forwardX + forwardY);
  context.lineTo(boss.x - forwardY + forwardX, boss.y + forwardX + forwardY);
  context.closePath();
  context.clip();

  context.globalAlpha = level2BossLaneOpacity * fade;
  context.strokeStyle = "#ff7087";
  context.lineWidth = sweptWidth;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(path.launchX, path.launchY);
  context.lineTo(path.endX, path.endY);
  context.stroke();
  context.restore();
}

function drawBoss(boss, frameTime, hatchOpening = 0) {
  if (boss === null) return;

  if (boss.level === 4 && gameState === "bossIntro") {
    context.save();
    context.globalAlpha *= bossIntroElapsed / varnokRevealDuration;
    drawBossArtwork(context, frameTime, hatchOpening, boss);
    context.restore();
    return;
  }

  const remaining = (boss.hitFlashUntil ?? 0) - frameTime;
  if (remaining <= 0 || bossFlashContext === null) {
    return drawBossArtwork(context, frameTime, hatchOpening, boss);
  }

  bossFlashContext.clearRect(0, 0, bossFlashCanvas.width, bossFlashCanvas.height);
  bossFlashContext.save();
  const drawPath = drawBossArtwork(bossFlashContext, frameTime, hatchOpening, boss);
  // Tint only the pixels of this frame's artwork, keeping its transparency and detail.
  bossFlashContext.globalCompositeOperation = "source-atop";
  bossFlashContext.globalAlpha = 0.28 * Math.min(1, remaining / bossHitFlashDuration);
  bossFlashContext.fillStyle = "#fff0d4";
  bossFlashContext.fillRect(0, 0, bossFlashCanvas.width, bossFlashCanvas.height);
  bossFlashContext.restore();
  context.drawImage(bossFlashCanvas, 0, 0);
  return drawPath;
}

function updateSporeChoirBlink() {
  if (combatElapsed < sporeChoirBlink.nextStart) return;

  // Sample only at blink starts, using a source separate from gameplay's Math.random().
  const [organRoll, pauseRoll] = crypto.getRandomValues(new Uint32Array(2));
  const organs = [0, 1, 2].filter((organ) => organ !== sporeChoirBlink.organ);
  const organ = organs[Math.floor(organRoll / 0x100000000 * organs.length)];
  const pause = 0.12 + pauseRoll / 0x100000000 * 0.20;
  sporeChoirBlink = {
    organ,
    startedAt: combatElapsed,
    nextStart: combatElapsed + sporeChoirBlinkDuration + pause,
  };
}

function drawSporeChoirPulse(context, interior, x, y, radius, power) {
  context.save();
  context.clip(interior);
  context.translate(x, y);
  context.scale(1, 0.8);
  const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
  glow.addColorStop(0, "rgba(240, 255, 150, 0.86)");
  glow.addColorStop(0.56, "rgba(214, 248, 94, 0.77)");
  glow.addColorStop(1, "rgba(193, 225, 71, 0)");
  context.globalAlpha *= power;
  context.fillStyle = glow;
  context.fillRect(-radius, -radius, radius * 2, radius * 2);
  context.restore();
}

function drawSporeChoirLayers(context, boss, left, top, exaggerate, blink = sporeChoirBlink, elapsed = combatElapsed) {
  const { organ, startedAt } = blink;
  const progress = Math.min((elapsed - startedAt) / sporeChoirBlinkDuration, 1);
  const power = progress < 1 ? Math.sin(Math.PI * progress) : 0;
  const spread = exaggerate ? 28 : 22;

  context.save();
  context.translate(left, top);
  context.scale(boss.width / 112, boss.height / 58);
  for (const mirrored of [false, true]) {
    context.save();
    if (mirrored) {
      context.translate(112, 0);
      context.scale(-1, 1);
    }
    context.drawImage(sporeChoirSac.image, 0, 0);
    if (organ === (mirrored ? 2 : 0) && power > 0) {
      drawSporeChoirPulse(context, sporeChoirSacInterior, 25, 26, 5 + spread * progress, power);
      context.globalAlpha *= power;
      context.fillStyle = "#f4ffa4";
      context.fill(sporeChoirSideOval);
    }
    context.restore();
  }
  context.drawImage(sporeChoirMembrane.image, 0, 0);
  context.drawImage(sporeChoirFace.image, 0, 0);

  const centreActive = organ === 1 && power > 0;
  if (centreActive) {
    drawSporeChoirPulse(context, sporeChoirMembraneInterior, 56, 29, 5 + spread * progress, power);
    // Pinch briefly, then open the pale oval while the rest of the face stays still.
    const pinchEnd = 0.30;
    const opening = progress < pinchEnd
      ? 1 - 0.68 * Math.sin(Math.PI * progress / pinchEnd)
      : 1 + 0.46 * Math.sin(Math.PI * (progress - pinchEnd) / (1 - pinchEnd));
    context.translate(56, 29);
    context.scale(1, opening);
    context.translate(-56, -29);
  }
  context.fillStyle = "#f7de96";
  context.fill(sporeChoirCentreOval);
  if (centreActive) {
    context.globalAlpha *= power;
    context.fillStyle = "#f4ffa4";
    context.fill(sporeChoirCentreOval);
  }
  context.restore();
}

function drawIronSepulchreLayers(context, boss, left, top, exaggerate) {
  const elapsed = boss.attackPhaseElapsed;
  let deployment = 0;
  let ventPower = 0;
  let retreat = null;
  switch (boss.attackPhase) {
    case "move":
      ventPower = (1 - Math.cos(elapsed * 2 * Math.PI / getLevel2BossPatrolDuration())) / 2;
      break;
    case "prepare":
      deployment = Math.min(elapsed / level2BossPrepareDuration, 1);
      ventPower = deployment;
      break;
    case "charge":
      deployment = 1;
      ventPower = 1 - Math.min(elapsed * getEnemyMovementMultiplier() / boss.chargePath.duration, 1);
      break;
    case "retreat":
      retreat = Math.min(elapsed * getLevel2BossMovementMultiplier() / level2BossRetreatDuration, 1);
      deployment = 1 - retreat;
      break;
  }
  const easedDeployment = deployment * deployment * (3 - 2 * deployment);
  // Translate each plate in the SVG's coordinate space by up to 11 logical pixels.
  const extension = (exaggerate ? 16 : 11) * easedDeployment * 112 / boss.width;
  const idleGlow = exaggerate ? 0.04 : 0.17;
  const bodyAlpha = context.globalAlpha;

  context.save();
  context.translate(left, top);
  context.scale(boss.width / 112, boss.height / 58);
  // Fixed rails bridge the opening behind the sliding plates and fixed centre.
  context.fillStyle = "#4e342f";
  context.fillRect(25, 16, 62, 27);
  context.fillStyle = "#ad7655";
  context.fillRect(25, 17, 62, 3);
  context.fillRect(25, 37, 62, 3);

  for (const mirrored of [false, true]) {
    context.save();
    context.translate(mirrored ? 112 + extension : -extension, 0);
    if (mirrored) context.scale(-1, 1);
    context.drawImage(ironSepulchreArmour.image, 0, 0);
    // Each six-pixel row in the vent SVG is a separate bar.
    for (let bar = 0; bar < 3; bar += 1) {
      const power = retreat === null ? ventPower : Math.max(0, 1 - Math.abs(4 * retreat - (bar + 1)));
      context.globalAlpha = bodyAlpha * (idleGlow + (1 - idleGlow) * power);
      const row = bar * 6;
      context.drawImage(ironSepulchreVents.image, 0, row, 16, 6, 13, 20 + row, 16, 6);
    }
    context.restore();
  }

  context.drawImage(ironSepulchreCenter.image, 0, 0);
  context.restore();
}

function drawBossArtwork(context, frameTime, hatchOpening, boss) {
  if (boss.level === 4) {
    drawVarnokBoss(context, frameTime, hatchOpening);
    return;
  }

  if (boss.level === 3) {
    const body = getCenteredBounds(boss);
    if (!crownMawBody.ready) {
      context.fillStyle = "#89596b";
      context.fillRect(body.left, body.top, boss.width, boss.height);
    }

    const opening = boss.openingAmount;
    const jawDrop = 16 * opening;
    const jawTop = body.top + 44 + jawDrop;
    if (opening > 0) {
      const cavityWidth = 22 + 14 * opening;
      if (crownMawCore.ready) {
        context.drawImage(crownMawCore.image, boss.x - cavityWidth / 2, body.top + 41,
          cavityWidth, 8 + jawDrop);
      } else {
        context.fillStyle = "#ffd850";
        context.beginPath();
        context.moveTo(boss.x - 7, jawTop);
        context.lineTo(boss.x, jawTop - jawDrop / 2);
        context.lineTo(boss.x + 7, jawTop);
        context.closePath();
        context.fill();
      }
    }

    if (crownMawJaw.ready) {
      context.drawImage(crownMawJaw.image, boss.x - 11, jawTop);
    } else {
      context.fillStyle = "#9b4b65";
      context.beginPath();
      context.moveTo(boss.x - 11, jawTop);
      context.lineTo(boss.x + 11, jawTop);
      context.lineTo(boss.x, jawTop + 14);
      context.closePath();
      context.fill();
    }

    // The fixed upper lip is part of the body and covers the top of the cavity.
    if (crownMawBody.ready) {
      context.drawImage(crownMawBody.image, body.left, body.top, boss.width, boss.height);
    }
    return;
  }

  const exaggerate = DEVELOPER_MODE && developerBossTestLevel === boss.level
    && (gameState === "playing" || gameState === "bossIntro" || gameState === "playerDeath")
    && developerExaggerateAnimation.checked;
  if (boss.level === 2) {
    const left = boss.x - boss.width / 2;
    const top = boss.y - boss.height / 2;
    if (ironSepulchreArmour.ready && ironSepulchreVents.ready && ironSepulchreCenter.ready) {
      drawIronSepulchreLayers(context, boss, left, top, exaggerate);
      return "Animated layers";
    }
    if (ironSepulchreImageReady) {
      context.drawImage(ironSepulchreImage, left, top, boss.width, boss.height);
      return "Static SVG fallback";
    }

    context.fillStyle = "#663b91";
    context.beginPath();
    context.moveTo(boss.x, top);
    context.lineTo(boss.x + boss.width * 0.29, top + boss.height * 0.2);
    context.lineTo(boss.x + boss.width * 0.45, top + boss.height * 0.82);
    context.lineTo(boss.x, top + boss.height);
    context.lineTo(boss.x - boss.width * 0.45, top + boss.height * 0.82);
    context.lineTo(boss.x - boss.width * 0.29, top + boss.height * 0.2);
    context.closePath();
    context.fill();
    context.fillStyle = "#dc8cff";
    context.fillRect(boss.x - boss.width * 0.19, top + boss.height * 0.32, boss.width * 0.38, boss.height * 0.4);
    return "Shape fallback";
  }

  const left = boss.x - boss.width / 2;
  const top = boss.y - boss.height / 2;
  if (sporeChoirSac.ready && sporeChoirMembrane.ready && sporeChoirFace.ready) {
    drawSporeChoirLayers(context, boss, left, top, exaggerate);
    return "Animated layers";
  }
  if (sporeChoirImageReady) {
    context.drawImage(sporeChoirImage, left, top, boss.width, boss.height);
    return "Static SVG fallback";
  }

  context.fillStyle = "#9d6be8";
  context.beginPath();
  context.moveTo(boss.x, top);
  context.lineTo(left + boss.width, top + boss.height * 0.3);
  context.lineTo(left + boss.width * 0.82, top + boss.height * 0.82);
  context.lineTo(boss.x, top + boss.height);
  context.lineTo(left + boss.width * 0.18, top + boss.height * 0.82);
  context.lineTo(left, top + boss.height * 0.3);
  context.closePath();
  context.fill();

  context.fillStyle = "#f5e6ff";
  context.fillRect(left + boss.width * 0.27, top + boss.height * 0.38, boss.width * 0.46, 7);
  return "Shape fallback";
}

function drawVarnokBoss(context, frameTime, hatchOpening) {
  const body = getCenteredBounds(boss);
  const eyeGeometry = getVarnokEyeGeometry(boss);
  if (drawRootedCrownArtwork(context, body, eyeGeometry, boss.eyeOpeningAmount, frameTime, hatchOpening)) return;

  // Keep the original artwork as a fallback if an image is unavailable.
  const passages = getVarnokProjectilePassages(boss);

  context.fillStyle = "#4b293e";
  context.fillRect(body.left, body.top, boss.width, boss.height);
  context.strokeStyle = "#c18aa8";
  context.lineWidth = 3;
  context.strokeRect(body.left, body.top, boss.width, boss.height);

  context.fillStyle = "#170f23";
  context.strokeStyle = "#a75d7d";
  context.lineWidth = 2;
  for (const passage of passages) {
    context.fillRect(
      passage.left,
      passage.top,
      passage.right - passage.left,
      passage.bottom - passage.top,
    );
    context.strokeRect(
      passage.left,
      passage.top,
      passage.right - passage.left,
      passage.bottom - passage.top,
    );
  }

  for (const eye of eyeGeometry) {
    const eyeWidth = eye.exposed.right - eye.exposed.left;
    const eyeHeight = eye.exposed.bottom - eye.exposed.top;
    const centerX = (eye.exposed.left + eye.exposed.right) / 2;
    const centerY = (eye.exposed.top + eye.exposed.bottom) / 2;

    context.fillStyle = "#160e1d";
    context.fillRect(
      eye.bounds.left,
      eye.bounds.top,
      eye.bounds.right - eye.bounds.left,
      eye.bounds.bottom - eye.bounds.top,
    );
    if (eyeWidth > 0 && eyeHeight > 0) {
      context.fillStyle = "#fff0df";
      context.beginPath();
      context.ellipse(centerX, centerY, eyeWidth / 2, eyeHeight / 2, 0, 0, Math.PI * 2);
      context.fill();
      if (eyeWidth >= 8 && eyeHeight >= 8) {
        const pupilRadius = Math.min(eyeWidth, eyeHeight) * 0.2;
        context.fillStyle = "#22101b";
        context.beginPath();
        context.arc(centerX, centerY, pupilRadius, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.fillStyle = "#704052";
    const coveredHeight = Math.max(0, eye.exposed.top - eye.bounds.top);
    context.fillRect(
      eye.bounds.left,
      eye.bounds.top,
      eye.bounds.right - eye.bounds.left,
      coveredHeight,
    );
    if (eyeHeight > 0) {
      context.fillRect(eye.bounds.left, eye.exposed.top, eye.exposed.left - eye.bounds.left, eyeHeight);
      context.fillRect(eye.exposed.right, eye.exposed.top, eye.bounds.right - eye.exposed.right, eyeHeight);
    }
    context.strokeStyle = "#e1a6bb";
    context.lineWidth = 2;
    context.strokeRect(
      eye.bounds.left,
      eye.bounds.top,
      eye.bounds.right - eye.bounds.left,
      eye.bounds.bottom - eye.bounds.top,
    );
  }
}

function drawBarriers() {
  for (const barrier of barriers) {
    const left = barrier.x - barrier.width / 2;
    const top = barrier.y - barrier.height / 2;
    context.fillStyle = barrier.hitPoints === 3
      ? "#65bd83"
      : barrier.hitPoints === 2 ? "#c5b95d" : "#d98258";
    context.fillRect(left, top, barrier.width, barrier.height);

    if (barrier.hitPoints < 3) {
      context.strokeStyle = "#253847";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(left + barrier.width * 0.34, top);
      context.lineTo(left + barrier.width * 0.43, top + barrier.height * 0.45);
      context.lineTo(left + barrier.width * 0.35, top + barrier.height);
      if (barrier.hitPoints === 1) {
        context.moveTo(left + barrier.width * 0.72, top);
        context.lineTo(left + barrier.width * 0.64, top + barrier.height * 0.52);
        context.lineTo(left + barrier.width * 0.78, top + barrier.height);
      }
      context.stroke();
    }
  }
}

const resultOverlay = document.getElementById("result-overlay");
const resultPanel = document.getElementById("result-panel");
const resultArt = document.getElementById("result-art");
const resultTitle = document.getElementById("result-title");
const resultDetails = document.getElementById("result-details");
const resultBonus = document.getElementById("result-bonus");
const resultScore = document.getElementById("result-score");
const resultActions = document.getElementById("result-actions");
const continueToCreditsButton = document.getElementById("continue-to-credits");

continueToCreditsButton.addEventListener("click", () => {
  if (gameState !== "endingSummary" || summaryFadeElapsed !== null) return;
  summaryFadeElapsed = 0;
  continueToCreditsButton.disabled = true;
});

const varnokPortrait = "finalboss-workshop/Varnok Artwork Workshop (complete ZIP)/assets/rooted-crown/body-maw.svg";
const resultViews = {
  level1Cleared: {
    title: "Level 1 cleared",
    details: `You defeated ${bossDisplayNames.xalGorath}!\nA new enemy formation awaits in Level 2.`,
    bonus: level1BossDefeatBonus,
    art: sporeChoirImage.src,
    theme: "clear",
    nextButton: level2Button,
  },
  level2Cleared: {
    title: "Level 2 cleared",
    details: `You defeated ${bossDisplayNames.kaezarVhul}!\nGet ready for the final battle!\nChoose Level 3 to continue.`,
    get bonus() { return level2DefeatBonusTotal; },
    art: ironSepulchreImage.src,
    theme: "clear",
    nextButton: level3Button,
  },
  loss: { title: "Game over", theme: "loss" },
  win: { title: "You win", details: "Choose Restart to play again", theme: "clear" },
  level3BossDefeated: {
    title: `${bossDisplayNames.zhurKai} defeated`,
    details: "Encounter complete. Choose Restart to play again.",
    art: crownMawBody.image.src,
    theme: "clear",
  },
  varnokBossDefeated: {
    title: `${bossDisplayNames.varnok} defeated`,
    details: "Encounter complete. Choose Restart to play again.",
    art: varnokPortrait,
    theme: "victory",
  },
  endingSummary: {
    title: `${bossDisplayNames.zhurKai} and ${bossDisplayNames.varnok} defeated`,
    bonusText: [
      `${bossDisplayNames.zhurKai} defeat bonus: ${level3BossDefeatBonus} points`,
      `${bossDisplayNames.varnok} defeat bonus: ${varnokBossDefeatBonus} points`,
    ].join("\n"),
    showTotals: true,
    theme: "victory",
  },
};
let displayedResult = null;

function updateResultPanel() {
  const view = resultViews[gameState] ?? null;
  if (view === displayedResult) return;
  displayedResult = view;
  if (restartButton.parentElement === resultActions) level2Button.before(restartButton);
  if (level2Button.parentElement === resultActions) level3Button.before(level2Button);
  if (level3Button.parentElement === resultActions) level2Button.after(level3Button);
  resultOverlay.style.opacity = "";
  resultOverlay.hidden = view === null;
  continueToCreditsButton.hidden = gameState !== "endingSummary";
  continueToCreditsButton.disabled = false;
  if (view === null) return;

  resultPanel.dataset.theme = view.theme;
  resultTitle.textContent = view.title;
  resultDetails.textContent = view.details ?? "";
  resultBonus.textContent = view.bonusText ?? (view.bonus ? `Boss defeat bonus: +${view.bonus} points` : "");
  resultScore.textContent = view.bonus || view.showTotals ? `Score: ${score}   •   Lives: ${lives}` : "";

  const art = gameState === "loss"
    ? [clackImage, anvilImage, riftImage][currentLevel - 1].src
    : view.art;
  resultArt.parentElement.hidden = !art;
  if (art) resultArt.src = art;

  if (view.nextButton) resultActions.append(view.nextButton);
  if (gameState === "loss") {
    resultActions.append(restartButton);
    restartButton.focus({ preventScroll: true });
  }
}

// Editable credits draft. Portraits point to the same assets used in play.
const creditsOpening = [
  "Congratulations on winning the game! You are a true warrior!",
  "Roll credits!",
];
const creditsCast = [
  { section: "Heroes", name: "Kestrel", image: shipArtwork.kestrel.image,
    bio: "Calls every near miss a shortcut. Keeps a little tally of the good ones." },
  { section: "Heroes", name: "Vesper", image: shipArtwork.vesper.image,
    bio: "Practises dramatic entrances in empty hangars. The echo always applauds." },
  { section: "Heroes", name: "Bastion", image: shipArtwork.bastion.image,
    bio: "Looks gruff, makes excellent tea, and always carries enough for everyone." },
  { section: "Support fleet", name: "Kestrel", subtitle: "Supply configuration", image: supplyShipArtwork.kestrel.image,
    bio: "The same Kestrel, now making deliveries. Every crate is marked ‘Handle with enthusiasm.’" },
  { section: "Support fleet", name: "Vesper", subtitle: "Supply configuration", image: supplyShipArtwork.vesper.image,
    bio: "The same Vesper, bringing spare supplies. Still insists on a dramatic entrance." },
  { heading: "Villains", section: "Invaders · Level 1", name: "Gary", subtitle: "Clack alien", image: clackImage, pose: regularAlienPose2[0],
    bio: "Keeps a houseplant on the bridge. Waters it before every invasion." },
  { section: "Invaders · Level 1", name: bossDisplayNames.xalGorath, bossLevel: 1,
    bio: "Brings enough snacks for the whole invasion, then quietly eats them all." },
  { section: "Invaders · Level 2", name: "Mabel", subtitle: "Anvil alien", image: anvilImage, pose: regularAlienPose2[1],
    bio: "Runs the book club. Has been waiting three invasions for Gary to return her novel." },
  { section: "Invaders · Level 2", name: bossDisplayNames.kaezarVhul, bossLevel: 2,
    bio: "Polishes his armour before every meeting. Calls it a quick once-over and takes an hour." },
  { section: "Invaders · Level 3", name: "Finn", subtitle: "Rift alien", image: riftImage, pose: regularAlienPose2[2],
    bio: "Collects postcards from planets he was supposed to invade." },
  { section: "Invaders · Level 3", name: bossDisplayNames.zhurKai, bossLevel: 3,
    bio: "Knows every hatchling by name and exactly who left crumbs on the command deck." },
  { section: "Invaders · Varnok’s hatchlings", name: "Bob", subtitle: "Bud hatchling",
    image: hatchlingArtwork[0].image, pose: hatchlingArtwork[0].pose2,
    bio: "Enjoys long flights through the void and disappointing his father, Varnok." },
  { section: "Invaders · Varnok’s hatchlings", name: "Jenny", subtitle: "Hook hatchling",
    image: hatchlingArtwork[1].image, pose: hatchlingArtwork[1].pose2,
    bio: "Insists that every dive is carefully planned. The evidence suggests otherwise." },
  { section: "Invaders · Varnok’s hatchlings", name: "Lou", subtitle: "Crown hatchling",
    image: hatchlingArtwork[2].image, pose: hatchlingArtwork[2].pose2,
    bio: "Wears the crown to breakfast. Claims it keeps the cereal humble." },
  { section: "Invaders · Level 3", name: bossDisplayNames.varnok, bossLevel: 4,
    bio: "Destroys worlds for a living. Spends his evenings looking for Bob’s other sock." },
];

const creditsDevelopment = [
  "Perplexity Pro (best model) - Game design, sparring and Codex sanity check",
  "Perplexity Computer - Concept workshops, game graphics, background graphics, artwork, alien and boss designs",
  "VS Code + Codex (ChatGPT Plus, Luna 6 medium and GPT-6.2 Sol medium) - Game design, sound effects, writing code and Perplexity sanity check",
  "ElevenLabs - Voice acting",
  // Provisional draft credit. The planned final local-model reviews have not run.
  "Local models Gemma-4-e4b and Qwen3.5-9b - reviewing code",
];
const creditsMusic = ["Suno - @backstageriot"];
const creditsClosing = ["Last but not least, my family for putting up with my endless tinkering!"];
const creditsVarnokImage = new Image();
creditsVarnokImage.src = varnokPortrait;

function wrapCreditsText(text, font, maxWidth) {
  context.font = font;
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}

function createCreditsLayout() {
  const blocks = [];
  let top = 0;
  function addText(heading, paragraphs) {
    const lines = paragraphs.map((text) => wrapCreditsText(text, creditsBodyFont, 610));
    const height = 64 + (heading ? 46 : 0)
      + lines.reduce((total, paragraph) => total + paragraph.length * 28 + 14, 0);
    blocks.push({ top, height, heading, paragraphs: lines });
    top += height + 94;
  }

  context.save();
  addText("", creditsOpening);
  for (const member of creditsCast) {
    // Place the section heading in the existing gap so the portraits keep their timing.
    if (member.heading) blocks.push({ top: top - 32, height: 24, sectionHeading: member.heading });
    blocks.push({
      top,
      height: creditsEntryHeight,
      member,
      nameLines: wrapCreditsText(member.name, creditsNameFont, 390),
      bioLines: wrapCreditsText(member.bio, creditsBodyFont, 390),
    });
    top += creditsEntryPitch;
  }
  addText("Design & Development", creditsDevelopment);
  addText("Music", creditsMusic);
  addText("", creditsClosing);
  context.restore();
  const [previous, closing] = blocks.slice(-2);
  const closingTop = (canvas.height - closing.height) / 2;
  // The music credit leaves the screen before the family thank-you stops at centre.
  closing.top = Math.max(closing.top, previous.top + previous.height + closingTop);
  const distance = canvas.height + closing.top - closingTop;
  const emptyStart = creditsTrackDuration - creditsBackgroundTail;
  const fadeStart = emptyStart - creditsClosingFade;
  const scrollDuration = fadeStart - creditsClosingHold;
  return { blocks, duration: creditsTrackDuration, scrollDuration, fadeStart, emptyStart, speed: distance / scrollDuration };
}

function drawCreditsImage(image, centerX, centerY, maxWidth, maxHeight) {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, centerX - width / 2, centerY - height / 2, width, height);
}

function drawCreditsPortrait(member, centerX, centerY, elapsed) {
  const { bossLevel, image, pose } = member;
  if (!bossLevel) {
    const alternate = pose?.ready && Math.floor(elapsed * 1000 / formationBeatIntervalMs) % 2 === 1;
    drawCreditsImage(alternate ? pose.image : image, centerX, centerY, 150, 132);
    return;
  }
  const opening = (1 - Math.cos(elapsed * 2)) / 2;
  const width = bossLevel === 1 ? 112 : bossLevel === 4 ? varnokBossWidth : 132;
  const height = bossLevel === 1 ? 58 : bossLevel === 4 ? varnokBossHeight : 68;
  const preview = {
    level: bossLevel, x: 0, y: 0, width, height,
    openingAmount: opening, eyeOpeningAmount: 1,
    attackPhase: "move", attackPhaseElapsed: elapsed,
  };

  context.save();
  context.translate(centerX, centerY);
  const scale = bossLevel === 4 ? 0.56 : 1.35;
  context.scale(scale, scale);
  if (bossLevel === 4) {
    if (!drawRootedCrownArtwork(context, getCenteredBounds(preview), getVarnokEyeGeometry(preview), 1, elapsed * 1000)) {
      drawCreditsImage(creditsVarnokImage, 0, 0, width, height);
    }
  } else if (bossLevel === 1 && sporeChoirSac.ready && sporeChoirMembrane.ready && sporeChoirFace.ready) {
    const pulseIndex = Math.floor(elapsed / 0.85);
    drawSporeChoirLayers(context, preview, -width / 2, -height / 2, false,
      { organ: pulseIndex % 3, startedAt: pulseIndex * 0.85 }, elapsed);
  } else {
    drawBossArtwork(context, elapsed * 1000, 0, preview);
  }
  context.restore();
}

function drawCreditsEntry(block, top, elapsed) {
  const { member } = block;
  if (member) drawCreditsPortrait(member, 174, top + block.height / 2, elapsed);
  context.shadowColor = "rgba(3, 8, 20, 0.95)";
  context.shadowBlur = 5;
  context.shadowOffsetY = 2;
  context.fillStyle = "#b1d6e7";

  if (block.sectionHeading) {
    context.textAlign = "left";
    context.font = "bold 15px Arial, sans-serif";
    context.fillText(block.sectionHeading, 304, top);
    return;
  }

  if (member) {
    const textHeight = 24 + block.nameLines.length * 36 + (member.subtitle ? 23 : 0)
      + 10 + block.bioLines.length * 28;
    let y = top + (block.height - textHeight) / 2;
    const textX = 304;
    context.textAlign = "left";
    context.font = "bold 15px Arial, sans-serif";
    context.fillText(member.section, textX, y);
    y += 24;
    context.fillStyle = "#f1f7ff";
    context.font = creditsNameFont;
    for (const line of block.nameLines) {
      context.fillText(line, textX, y);
      y += 36;
    }
    context.fillStyle = "#b8d3e4";
    if (member.subtitle) {
      context.font = "16px Arial, sans-serif";
      context.fillText(member.subtitle, textX, y);
      y += 23;
    }
    y += 10;
    context.font = creditsBodyFont;
    context.fillStyle = "#edf4fb";
    for (const line of block.bioLines) {
      context.fillText(line, textX, y);
      y += 28;
    }
    return;
  }

  context.textAlign = "center";
  let y = top + 32;
  if (block.heading) {
    context.font = creditsNameFont;
    context.fillText(block.heading, canvas.width / 2, y);
    y += 46;
  }
  context.font = creditsBodyFont;
  context.fillStyle = "#f1f7ff";
  for (const paragraph of block.paragraphs) {
    for (const line of paragraph) {
      context.fillText(line, canvas.width / 2, y);
      y += 28;
    }
    y += 14;
  }
}

function drawRollingCredits() {
  const { layout, elapsed } = creditsRun;
  if (elapsed >= layout.emptyStart) return;
  const closing = layout.blocks.at(-1);
  const closingProgress = Math.max(0, (elapsed - layout.fadeStart) / creditsClosingFade);
  const closingTravel = (canvas.height + closing.height) / 2;
  const origin = canvas.height - Math.min(elapsed, layout.scrollDuration) * layout.speed
    - closingTravel * closingProgress ** 2;

  context.save();
  context.textBaseline = "top";
  for (const block of layout.blocks) {
    const top = origin + block.top;
    if (top >= canvas.height) break;
    if (top + block.height <= 0) continue;
    context.save();
    if (block === closing) context.globalAlpha *= 1 - closingProgress;
    drawCreditsEntry(block, top, elapsed);
    context.restore();
  }
  context.restore();
}

function drawSceneFade(opacity) {
  context.save();
  context.fillStyle = "#000";
  context.globalAlpha = opacity;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

function drawFrame(frameTime) {
  const playerDying = gameState === "playerDeath";
  const sceneFrameTime = playerDying ? playerDeathStartedAt : frameTime;
  if (gameState !== "playing" && !playerDying) playerBank = 0;
  updateResultPanel();
  const showBossAnimationDiagnostics = DEVELOPER_MODE
    && (gameState === "playing" || gameState === "bossIntro" || playerDying)
    && (developerBossTestLevel === 1 ? boss?.level === 1
      : developerBossTestLevel === 2 && level2Bosses.length > 0);
  if (developerBossAnimationPanel.hidden === showBossAnimationDiagnostics) {
    developerBossAnimationPanel.hidden = !showBossAnimationDiagnostics;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  if (gameState === "menu") return;
  if (gameState === "endingSummary") {
    if (summaryFadeElapsed !== null) {
      const progress = summaryFadeElapsed / endingFadeDuration;
      resultOverlay.style.opacity = 1 - progress;
      drawSceneFade(progress);
    }
    return;
  }
  if (gameState === "credits") {
    drawRollingCredits();
    const fadeProgress = creditsRun.elapsed / endingFadeDuration;
    if (creditsRun.fadeIn && fadeProgress < 1) drawSceneFade(1 - fadeProgress);
    return;
  }
  const varnokOnScreen = boss?.level === 4;
  const hatchOpening = varnokHatchProgress * varnokHatchProgress * (3 - 2 * varnokHatchProgress);
  const emerging = [];
  if (selectedDifficulty !== "ridiculous") {
    for (const targetBoss of level2Bosses) drawLevel2BossChargeLane(targetBoss);
  }
  if (playerDying) drawDestructionFragments(frameTime / 1000);
  else if (gameState === "playing" && waveEntrance === null) drawDestructionFragments();
  enemies.forEach((enemy, index) => {
    if (varnokOnScreen && varnokAlienFormation !== null && enemy.varnokState === "returning") {
      drawReturningVarnokHatchling(enemy, index, varnokAlienFormation);
      return;
    }
    if (varnokOnScreen && varnokAlienFormation !== null && enemy.varnokState === "launching") {
      const age = varnokAlienFormation.elapsed - hatchlingLaunchVisualTimes.get(enemy);
      if (age < varnokHatchEmergenceDuration) {
        emerging.push({ enemy, index, age });
        return;
      }
    }
    drawEnemy(enemy, index);
  });
  drawLevel2BonusShip();
  drawLevel2Pickups();
  if (varnokOnScreen) {
    for (const shot of enemyShots) {
      if (varnokMinionShots.has(shot)) drawEnemyShot(shot);
    }
  }
  const boss1DrawPath = drawBoss(boss, sceneFrameTime, hatchOpening);
  const boss2DrawPaths = showBossAnimationDiagnostics ? [] : null;
  for (const targetBoss of level2Bosses) {
    const drawPath = drawBoss(targetBoss, sceneFrameTime);
    boss2DrawPaths?.push(drawPath);
  }
  if (showBossAnimationDiagnostics) {
    updateDeveloperBossAnimationReadout(boss1DrawPath, boss2DrawPaths);
  }
  if (emerging.length > 0) drawVarnokHatchlings(emerging, hatchOpening);
  drawBarriers();
  for (const shot of shots) {
    const left = shot.x - shot.width / 2;
    if (shot.artwork) {
      drawCombatArtwork(shot.artwork, left, shot.y);
    } else {
      context.fillStyle = shot.color ?? "#ffe08a";
      context.fillRect(left, shot.y, shot.width, shot.height);
    }
  }
  for (const shot of enemyShots) {
    if (!varnokOnScreen || !varnokMinionShots.has(shot)) drawEnemyShot(shot);
  }
  if (lives > 0) drawPlayer(frameTime);
  drawLevel2PickupMessage();
}

function gameLoop(frameTime) {
  const deltaSeconds = previousFrameTime === 0
    ? 0
    : Math.min((frameTime - previousFrameTime) / 1000, 0.05);
  previousFrameTime = frameTime;

  if (gameState === "playerDeath") {
    if (frameTime - playerDeathStartedAt >= playerDeathDurationMs) finishGame("loss");
    else updateDestructionFragments(frameTime / 1000);
  } else if (gameState === "endingSummary" && summaryFadeElapsed !== null) {
    summaryFadeElapsed += deltaSeconds;
    if (summaryFadeElapsed >= endingFadeDuration) startCredits(true);
  } else if (gameState === "credits") {
    updateCredits(deltaSeconds);
  } else if (gameState === "bossIntro") {
    updateBossIntro(deltaSeconds);
    updateSuppliesDuringEntrance(deltaSeconds);
  } else if (gameState === "playing") {
    updatePlayer(deltaSeconds);
    updateLevel2PickupTimers(deltaSeconds);
    if (waveEntrance !== null) {
      updateWaveEntrance(deltaSeconds, frameTime);
      updateSuppliesDuringEntrance(deltaSeconds);
    } else {
      combatElapsed += deltaSeconds;
      updateDestructionFragments();
      updateShots(deltaSeconds, frameTime);
      if (level2Bosses.length > 0) {
        updateLevel2BossEncounter(deltaSeconds, frameTime);
        if (gameState !== "playing") {
          drawFrame(frameTime);
          requestAnimationFrame(gameLoop);
          return;
        }
      } else if (boss === null) {
        const formationBreached = updateEnemies(deltaSeconds, frameTime);
        if (gameState === "bossIntro" || (gameState === "playing" && waveEntrance !== null)) {
          updateSuppliesDuringEntrance(deltaSeconds);
        }
        if (formationBreached || waveEntrance !== null) {
          drawFrame(frameTime);
          requestAnimationFrame(gameLoop);
          return;
        }
      } else {
        updateBoss(deltaSeconds, frameTime);
      }
      if (gameState === "playing" && (currentLevel === 2 || currentLevel === 3)) {
        updateLevel2BonusShip(deltaSeconds);
        updateLevel2Pickups(deltaSeconds);
      }
      if (gameState === "playing") handleShotCollisions(deltaSeconds, frameTime);
      if (gameState === "playing" && waveEntrance === null) {
        updateEnemyShots(deltaSeconds, frameTime);
      }
      updateFormationBeat(deltaSeconds);
    }
  }
  if (boss?.level === 1 && gameState === "playing") updateSporeChoirBlink();
  drawFrame(frameTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
