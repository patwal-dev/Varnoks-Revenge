const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const bossFlashCanvas = document.createElement("canvas");
bossFlashCanvas.width = canvas.width;
bossFlashCanvas.height = canvas.height;
const bossFlashContext = bossFlashCanvas.getContext("2d");
const bossHitFlashDuration = 100;
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const gameStatus = document.getElementById("game-status");
const mainMenu = document.getElementById("main-menu");
const menuOptions = document.getElementById("menu-options");
const howToPlay = document.getElementById("how-to-play");
const howToPlayButton = document.getElementById("show-how-to-play");
const menuBackButton = document.getElementById("menu-back");
const musicToggle = document.getElementById("music-toggle");
const restartButton = document.getElementById("restart");
const level2Button = document.getElementById("level-2");
const level3Button = document.getElementById("level-3");
const developerTestingPanel = document.getElementById("developer-testing");
const developerBankEffect = document.getElementById("developer-bank-effect");
const developerMeasureCanvasButton = document.getElementById("developer-measure-canvas");
const developerCanvasReadout = document.getElementById("developer-canvas-readout");
const developerLevelButtons = document.querySelectorAll("[data-developer-level]");
const developerBossButtons = document.querySelectorAll("[data-developer-boss]");
const developerRewardButtons = document.querySelectorAll("[data-developer-reward]");
const bossShotReadout = document.getElementById("boss-shot-readout");
const gameMain = document.querySelector("main");
const DEVELOPER_MODE = true;
let developerBossTestLevel = null;
let developerForcedSupplyReward = null;
let tracedBoss = null;
let developerShotNumber = 0;
const developerShotLog = [];

const playerSpawnY = canvas.height - 52;
const playerMinY = playerSpawnY - 60;
const playerMaxY = playerSpawnY;
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

const kestrelImage = new Image();
let kestrelFlashImage = null;
let kestrelWingShades = [];
kestrelImage.addEventListener("load", () => {
  const flashCanvas = document.createElement("canvas");
  flashCanvas.width = 232;
  flashCanvas.height = 204;
  const flashContext = flashCanvas.getContext("2d");
  if (flashContext === null) return;

  flashContext.drawImage(kestrelImage, 0, 0, flashCanvas.width, flashCanvas.height);
  // Color only the visible parts of the ship for the existing white hit flash.
  flashContext.globalCompositeOperation = "source-in";
  flashContext.fillStyle = "#ffffff";
  flashContext.fillRect(0, 0, flashCanvas.width, flashCanvas.height);
  kestrelFlashImage = flashCanvas;

  // Shade each wing from the same unflipped alpha mask to preserve the engine outlines.
  kestrelWingShades = [0, flashCanvas.width].map((edgeX) => {
    const shadeCanvas = document.createElement("canvas");
    shadeCanvas.width = flashCanvas.width;
    shadeCanvas.height = flashCanvas.height;
    const shadeContext = shadeCanvas.getContext("2d");
    if (shadeContext === null) return null;
    shadeContext.drawImage(flashCanvas, 0, 0);
    shadeContext.globalCompositeOperation = "source-in";
    const shade = shadeContext.createLinearGradient(edgeX, 0, shadeCanvas.width / 2, 0);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.24)");
    shade.addColorStop(1, "transparent");
    shadeContext.fillStyle = shade;
    shadeContext.fillRect(0, 0, shadeCanvas.width, shadeCanvas.height);
    return shadeCanvas;
  });
});
kestrelImage.src = "ship-workshop/assets/kestrel.svg";

const vesperImage = new Image();
let vesperImageReady = false;
vesperImage.addEventListener("load", () => {
  vesperImageReady = true;
});
vesperImage.addEventListener("error", () => {
  console.error("Could not load the Vesper supply-ship artwork:", vesperImage.src);
}, { once: true });
vesperImage.src = "ship-workshop/assets/vesper.svg";

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

const hatchlingArtwork = ["bud", "hook", "crown"].map((name) => {
  const image = new Image();
  const artwork = { image, ready: false };
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
const alienAngles = new WeakMap();

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
const bossAttackInterval = 1600;
const bossWideShotChance = 0.5;
const bossChargeDuration = 0.5;
const bossWideShotWidth = 24;
const bossSpreadHorizontalSpeed = 150;
const bossIntroSlideDuration = 0.8;
const varnokTransitionDuration = 1;
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
const enemySpeed = 65;
const formationColumns = 6;
const defaultFormationRows = 2;
const level2FormationRows = 3;
const level3FormationRows = 4;
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
// The rotated 232 × 248 SVG uses its original width as the on-screen height.
const vesperArtHeight = vesperArtWidth * 232 / 248;
const level2BonusShipHeight = vesperArtHeight;
const level2ShieldPickupSpeed = 150;
const level2ShieldChargesMax = 2;
const level2ShieldDuration = 10;
const level2ShieldFadeDuration = 2;
const maxEnemySpeedMultiplier = 1.75;
const level1WaveCount = 2;
const level2WaveCount = 2;
const level3WaveCount = 2;
const waveEntranceDuration = 1.5;
const creditsScrollSpeed = 100;
const creditsLineSpacing = 32;
const creditsLines = ["Game Design", "Development", "Playtesting"];
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
let currentWave = 1;
let waveEntranceElapsed = null;
let waveEntrancePositions = null;
let boss = null;
let bossChargeElapsed = null;
let nextBossAttackTime = null;
let bossIntroElapsed = null;
let bossIntroStartY = null;
let bossIntroTargetY = null;
let score = 0;
let lives = 3;
let nextShotTime = 0;
let nextEnemyShotTime = null;
let playerInvulnerableUntil = 0;
let playerShieldProtectedUntil = 0;
let gameState = "menu";
let creditsY = null;
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
  const formationRows = getFormationRowCount();
  if (currentLevel === 3) {
    resetLevel3Descent();
  }
  for (let row = 0; row < formationRows; row += 1) {
    for (let column = 0; column < formationColumns; column += 1) {
      const enemy = {
        x: 230 + column * 65,
        y: 90 + row * 55,
        width: enemySize,
        height: enemySize,
      };
      if (currentLevel === 2 || currentLevel === 3) {
        enemy.formationSlot = row * formationColumns + column;
      }
      enemies.push(enemy);
    }
  }
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

function startWaveEntrance() {
  const lowestEdge = Math.max(...enemies.map((enemy) => enemy.y + enemy.height / 2));
  const entranceOffset = -lowestEdge - 1;
  waveEntrancePositions = enemies.map((enemy) => {
    const targetY = enemy.y;
    const startY = targetY + entranceOffset;
    enemy.y = startY;
    return { startY, targetY };
  });
  waveEntranceElapsed = 0;
  nextEnemyShotTime = null;
}

function updateWaveEntrance(deltaSeconds, frameTime) {
  waveEntranceElapsed = Math.min(
    waveEntranceElapsed + deltaSeconds,
    waveEntranceDuration,
  );
  const progress = waveEntranceElapsed / waveEntranceDuration;
  const easedProgress = progress * progress * (3 - 2 * progress);

  enemies.forEach((enemy, index) => {
    const { startY, targetY } = waveEntrancePositions[index];
    enemy.y = progress === 1
      ? targetY
      : startY + (targetY - startY) * easedProgress;
  });

  if (progress === 1) {
    waveEntranceElapsed = null;
    waveEntrancePositions = null;
    nextEnemyShotTime = frameTime + enemyShotIntervalMin;
    if (currentLevel === 2 || currentLevel === 3) {
      level2BomberTimer = level2BomberDelay;
    }
  }
}

function startBossFight() {
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
  bossChargeElapsed = null;
  nextBossAttackTime = null;
}

function startLevel2BossFight() {
  if (currentLevel !== 2 || boss !== null || enemies.length !== 0 || lives <= 0) return;

  shots.length = 0;
  enemyShots.length = 0;
  boss = {
    level: 2,
    x: canvas.width / 2,
    y: 104,
    width: 132,
    height: 68,
    speed: level2BossMovementSpeed,
    direction: 1,
    health: level2BossHealth,
    maxHealth: level2BossHealth,
    attackPhase: "move",
    attackPhaseElapsed: 0,
    chargePath: null,
    ramHitApplied: false,
  };
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = 0;
  bossIntroStartY = -boss.height / 2;
  bossIntroTargetY = boss.y;
  boss.y = bossIntroStartY;
  gameState = "bossIntro";
  keysDown.clear();
}

function startLevel3BossFight() {
  if (currentLevel !== 3 || currentWave !== level3WaveCount || enemies.length !== 0
    || lives <= 0 || gameState !== "playing") return;

  clearDiveBomberState();
  enemies.length = 0;
  shots.length = 0;
  enemyShots.length = 0;
  barriers = [];
  level2BonusShip = null;
  level2BonusShipTimer = randomLevel2BonusShipDelay();
  level2Pickups.length = 0;
  clearLevel2Shield();
  playerShieldProtectedUntil = 0;
  level2ActiveWeapon = null;
  level2PickupMessageTimeRemaining = 0;
  level2FormationOffsetX = 0;
  resetLevel3Descent();
  enemyDirection = 1;
  nextEnemyShotTime = null;
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
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
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
  bossChargeElapsed = null;
  nextBossAttackTime = null;
  bossIntroElapsed = showIntro ? 0 : null;
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
  level2BomberTimer = level2BomberDelay;
  chooseNextRandomizedBossDestination(boss);
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
  if (currentLevel !== 2 || enemies.length !== 0 || lives <= 0
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
  const slideDuration = bossIntroStartY === null ? 0 : bossIntroSlideDuration;
  const introDuration = boss.level === 4 ? varnokTransitionDuration : slideDuration;
  bossIntroElapsed = Math.min(bossIntroElapsed + deltaSeconds, introDuration);
  if (slideDuration > 0) {
    const slideProgress = Math.min(bossIntroElapsed / slideDuration, 1);
    boss.y = slideProgress === 1
      ? bossIntroTargetY
      : bossIntroStartY + (bossIntroTargetY - bossIntroStartY) * slideProgress;
  }

  if (bossIntroElapsed >= introDuration) {
    bossIntroElapsed = null;
    bossIntroStartY = null;
    bossIntroTargetY = null;
    gameState = "playing";
    previousFrameTime = 0;
  }
}

function startLevel2() {
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  tracedBoss = null;
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
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
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
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  tracedBoss = null;
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
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
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

function finishVarnokEncounter() {
  const isBossTest = developerBossTestLevel === 4;
  gameState = isBossTest ? "varnokBossDefeated" : "credits";
  clearVarnokAlienFormation();
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
  if (!isBossTest) {
    playerInvulnerableUntil = 0;
    creditsY = canvas.height + creditsLineSpacing;
  }
  restartButton.hidden = !isBossTest;
  level2Button.hidden = true;
  level3Button.hidden = true;
}

function updateCredits(deltaSeconds) {
  creditsY -= creditsScrollSpeed * deltaSeconds;
  if (creditsY + (creditsLines.length + 2) * creditsLineSpacing <= 0) {
    creditsY = null;
    gameState = "victory";
    restartButton.hidden = false;
  }
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
  if (boss.level === 2) {
    updateLevel2Boss(deltaSeconds, frameTime);
    return;
  }

  const halfWidth = boss.width / 2;
  const minX = halfWidth;
  const maxX = canvas.width - halfWidth;
  const nextX = boss.x + boss.direction * boss.speed * deltaSeconds;
  if (nextX < minX || nextX > maxX) boss.direction *= -1;
  boss.x = Math.max(minX, Math.min(maxX, nextX));

  if (bossChargeElapsed !== null) {
    bossChargeElapsed = Math.min(bossChargeElapsed + deltaSeconds, bossChargeDuration);
    if (bossChargeElapsed >= bossChargeDuration) {
      fireBossSpread();
      bossChargeElapsed = null;
      nextBossAttackTime = frameTime + bossAttackInterval;
    }
  } else if (nextBossAttackTime === null) {
    nextBossAttackTime = frameTime + bossAttackInterval;
  } else if (frameTime >= nextBossAttackTime) {
    if (Math.random() < bossWideShotChance) {
      fireBossWideShot();
      nextBossAttackTime = frameTime + bossAttackInterval;
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
    movement.elapsed + deltaSeconds * speedMultiplier,
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
    varnokHatchLastRelease = formation.elapsed;
    formation.aliens.push(alien);
    enemies.push(alien);
    formation.nextLaunchSlot += 1;
    formation.nextLaunchTime += varnokAlienLaunchInterval;
  }

  for (const alien of formation.aliens) {
    if (alien.varnokState === "launching") {
      alien.y -= varnokAlienLaunchSpeed * deltaSeconds;
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
      }
    } else if (alien.varnokState === "returning") {
      const slot = formation.slots[alien.formationSlot];
      const dx = slot.x - alien.x;
      const dy = slot.y - alien.y;
      const distance = Math.hypot(dx, dy);
      const step = varnokAlienReturnSpeed * deltaSeconds;
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
  if (occupiedSlots.length === 0) formation.descentAnimation = null;
}

function isSettledVarnokAlien(alien) {
  return alien.varnokState === "formation" && alien.bomberState === undefined;
}

function updateVarnokFormation(formation, deltaSeconds) {
  const aliens = formation.aliens.filter(isSettledVarnokAlien);
  if (deltaSeconds <= 0 || aliens.length === 0) return;

  // Keep both active aliens and all incoming reservations inside the canvas.
  const occupiedSlots = formation.aliens.map((alien) => formation.slots[alien.formationSlot])
    .concat(formation.slots.slice(formation.nextLaunchSlot));
  let descentThisFrame = 0;
  const animation = formation.descentAnimation;
  if (animation !== null) {
    const previousElapsed = animation.elapsed;
    animation.elapsed = Math.min(
      animation.elapsed + deltaSeconds,
      level3FormationDescentDuration,
    );
    descentThisFrame = animation.distance
      * (animation.elapsed - previousElapsed) / level3FormationDescentDuration;
    if (animation.elapsed >= level3FormationDescentDuration) formation.descentAnimation = null;
  }

  const halfSize = enemySize / 2;
  const leftEdge = Math.min(...occupiedSlots.map((slot) => slot.x - halfSize));
  const rightEdge = Math.max(...occupiedSlots.map((slot) => slot.x + halfSize));
  let sidewaysStep = formation.formationDirection * enemySpeed * deltaSeconds;
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
    if (boss.attackType === "aimedBurst"
      && boss.nextAttackShotIndex >= level3BossAimedShotCount) {
      boss.targetMarker = null;
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
}

function fireLevel3BossAimedShot() {
  if (boss.targetMarker === null) return;
  const shotX = boss.x;
  const shotY = boss.y + boss.height / 2 - 4;
  const dx = boss.targetMarker.x - shotX;
  const dy = boss.targetMarker.y - shotY;
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

function updateLevel2Boss(deltaSeconds, frameTime) {
  const bossState = boss;
  bossState.attackPhaseElapsed += deltaSeconds;

  if (bossState.attackPhase === "move") {
    const halfWidth = bossState.width / 2;
    const nextX = bossState.x + bossState.direction * bossState.speed * deltaSeconds;
    if (nextX < halfWidth || nextX > canvas.width - halfWidth) {
      bossState.direction *= -1;
    }
    bossState.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, nextX));
    if (bossState.attackPhaseElapsed >= level2BossMoveDuration) {
      prepareLevel2BossCharge(bossState);
    }
    return;
  }

  if (bossState.attackPhase === "prepare") {
    const path = bossState.chargePath;
    const progress = Math.min(bossState.attackPhaseElapsed / level2BossPrepareDuration, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    bossState.x = path.startX + (path.launchX - path.startX) * easedProgress;
    bossState.y = path.startY + (path.launchY - path.startY) * easedProgress;
    if (progress === 1) {
      bossState.attackPhase = "charge";
      bossState.attackPhaseElapsed = 0;
    }
    return;
  }

  if (bossState.attackPhase === "charge") {
    const path = bossState.chargePath;
    const previousX = bossState.x;
    const previousY = bossState.y;
    const progress = Math.min(bossState.attackPhaseElapsed / path.duration, 1);
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
      if (boss === null) return;
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
    const progress = Math.min(bossState.attackPhaseElapsed / level2BossRetreatDuration, 1);
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

function damageBarrierWithShot(shot) {
  const barrierIndex = barriers.findIndex((barrier) =>
    getShotContactTime(shot, getCenteredBounds(barrier)) < Infinity);

  if (barrierIndex === -1) return false;

  barriers[barrierIndex].hitPoints -= 1;
  if (barriers[barrierIndex].hitPoints === 0) {
    barriers.splice(barrierIndex, 1);
  }
  return true;
}

function finishGame(result) {
  gameState = result;
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
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
  if (frameTime < playerInvulnerableUntil) return false;
  return losePlayerLife(frameTime);
}

function damagePlayerFromProjectile(frameTime) {
  if (frameTime < playerShieldProtectedUntil) return false;
  if ((currentLevel === 2 || currentLevel === 3) && level2ShieldCharges > 0) {
    level2ShieldCharges -= 1;
    if (level2ShieldCharges === 0) level2ShieldTimeRemaining = 0;
    playerShieldProtectedUntil = frameTime + 1000;
    playerInvulnerableUntil = Math.max(playerInvulnerableUntil, playerShieldProtectedUntil);
    return false;
  }

  return losePlayerLife(frameTime);
}

function losePlayerLife(frameTime) {
  level2ActiveWeapon = null;
  lives = Math.max(0, lives - 1);
  livesDisplay.textContent = lives;
  playerInvulnerableUntil = frameTime + 1000;
  if (lives === 0) finishGame("loss");
  return true;
}

function restartGame() {
  if (developerForcedSupplyReward !== null) setDeveloperSupplyReward(null);
  tracedBoss = null;
  playerBank = 0;
  developerBossTestLevel = null;
  creditsY = null;
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
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
  nextShotTime = 0;
  nextEnemyShotTime = null;
  playerInvulnerableUntil = 0;
  playerShieldProtectedUntil = 0;
  keysDown.clear();
  gameState = "playing";
  mainMenu.hidden = true;
  gameStatus.hidden = false;
  restartButton.hidden = true;
  level2Button.hidden = true;
  level3Button.hidden = true;
  previousFrameTime = 0;
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

function startDeveloperTestLevel(level) {
  if (!DEVELOPER_MODE) return;
  restartGame();
  if (level === 2) startLevel2();
  else if (level === 3) startLevel3();
}

function startDeveloperTestBoss(level) {
  if (!DEVELOPER_MODE || level < 1 || level > 4) return;

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
  waveEntranceElapsed = null;
  waveEntrancePositions = null;
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
  previousFrameTime = 0;
}

document.getElementById("start-game").addEventListener("click", () => {
  restartGame();
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
restartButton.addEventListener("click", restartGame);
if (DEVELOPER_MODE) {
  gameMain.classList.add("developer-mode");
  developerTestingPanel.hidden = false;
  developerMeasureCanvasButton.addEventListener("click", measureDeveloperCanvas);
  developerBankEffect.addEventListener("click", (event) => {
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
  developerRewardButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDeveloperSupplyReward(button.dataset.developerReward);
    });
  });
}
level2Button.addEventListener("click", () => {
  if (gameState === "level1Cleared") startLevel2();
});
level3Button.addEventListener("click", () => {
  if (gameState === "level2Cleared") startLevel3();
});

window.addEventListener("keydown", (event) => {
  if (gameState === "menu" || gameState === "victory") return;
  const key = event.key.toLowerCase();
  if (key === "k" && !event.repeat && DEVELOPER_MODE
    && developerBossTestLevel === 4 && gameState === "playing" && boss?.level === 4) {
    event.preventDefault();
    applyBossDamage(boss.health);
  } else if (event.code === "Space") {
    if (event.target === developerBankEffect) return;
    if (event.target === musicToggle || (gameState === "loss" && event.target === restartButton)) return;
    event.preventDefault();
    if (gameState !== "credits") keysDown.add("space");
  } else if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
    event.preventDefault();
    if (gameState !== "credits") keysDown.add(key);
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

function traceDeveloperShot(shot, direction) {
  if (!DEVELOPER_MODE || boss === null) return;
  if (tracedBoss !== boss) {
    tracedBoss = boss;
    developerShotNumber = 0;
    developerShotLog.length = 0;
  }

  const lane = direction < 0 ? "Left" : direction > 0 ? "Right" : "Center";
  shot.developerTrace = { label: `#${++developerShotNumber} ${lane}` };
  developerShotLog.push(shot.developerTrace);
  if (developerShotLog.length > 8) developerShotLog.shift();
  setDeveloperShotOutcome(shot, "In flight");
}

function setDeveloperShotOutcome(shot, outcome) {
  if (!shot.developerTrace) return;
  shot.developerTrace.outcome = outcome;
  const rows = developerShotLog.map((entry) => `${entry.label} · ${entry.outcome}`);
  bossShotReadout.textContent = [`Boss ${tracedBoss.level} shots`, ...rows].join("\n");
}

function updateShots(deltaSeconds, frameTime) {
  if (keysDown.has("space") && frameTime >= nextShotTime) {
    const weapon = playerWeapons[level2ActiveWeapon?.type];
    const pattern = weapon?.pattern ?? straightShotPattern;
    const damagedBosses = pattern.length > 1 ? new WeakSet() : null;
    for (const [offsetX, angle] of pattern) {
      const shot = {
        x: player.x + offsetX,
        y: player.y - player.height / 2 - 5,
        width: 5,
        height: 14,
        vx: shotSpeed * Math.sin(angle),
        vy: -shotSpeed * Math.cos(angle),
        artwork: weapon?.artwork ?? null,
        color: weapon?.color ?? "#ffe08a",
        damagedBosses,
      };
      traceDeveloperShot(shot, angle || offsetX);
      shots.push(shot);
    }
    nextShotTime = frameTime + (weapon?.interval ?? shotInterval) * 1000;
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
      setDeveloperShotOutcome(shot, "Missed");
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

  let level3DescentThisFrame = 0;
  if (currentLevel === 3 && level3DescentAnimation !== null) {
    const animation = level3DescentAnimation;
    const previousOffset = level3FormationDescentOffset;
    animation.elapsed = Math.min(
      animation.elapsed + deltaSeconds,
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
    if (waveEntranceElapsed !== null) return false;
  }
  if (currentLevel === 3 && gameState !== "playing") return true;
  const formationEnemies = hasDiveBombers
    ? enemies.filter((enemy) => enemy.bomberState === undefined || enemy.bomberState === "formation")
    : enemies;
  if (level3FormationCollidesWithPlayer(formationEnemies)) {
    finishGame("loss");
    return true;
  }
  const destroyedFraction = startingEnemyCount > 0
    ? 1 - enemies.length / startingEnemyCount
    : 0;
  const waveSpeedMultiplier = currentWave === 2
    && (currentLevel === 1 || currentLevel === 2 || currentLevel === 3)
    ? wave2SpeedMultiplier
    : 1;
  const destructionSpeedBonus = (maxEnemySpeedMultiplier - 1)
    * (currentLevel === 3 ? level3DestructionBonusMultiplier : 1);
  const formationSpeed = enemySpeed * waveSpeedMultiplier
    * (1 + destroyedFraction * destructionSpeedBonus);
  // Keep Level 2's full slot grid inside the screen, including vacant return slots.
  const nextLeftEdge = currentLevel === 2
    ? 215 + level2FormationOffsetX + enemyDirection * formationSpeed * deltaSeconds
    : formationEnemies.length
      ? Math.min(...formationEnemies.map((enemy) => enemy.x - enemy.width / 2))
        + enemyDirection * formationSpeed * deltaSeconds
      : 0;
  const nextRightEdge = currentLevel === 2
    ? 570 + level2FormationOffsetX + enemyDirection * formationSpeed * deltaSeconds
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
        const maximumDescent = canvas.height
          - (90 + (level3FormationRows - 1) * level3FormationDescentStep + enemySize / 2);
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
  let bomber = level2Bomber;
  if (bomber === null) {
    level2BomberTimer -= deltaSeconds;
    if (level2BomberTimer <= 0) {
      const eligibleEnemies = varnokFormation === null
        ? enemies.filter((enemy) => enemy.formationSlot !== null && enemy.bomberState === undefined)
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
  if (bomber.bomberState === "dive") {
    bomber.x += bomber.diveVelocityX * deltaSeconds;
    bomber.y += bomber.diveVelocityY * deltaSeconds;
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
    if (bomber.y - bomber.height / 2 > canvas.height) {
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
    const step = level2BomberSpeed * deltaSeconds;
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
    return Array.from({ length: getFormationRowCount() * formationColumns }, (_, slot) => slot)
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
  return {
    x: 230 + (slot % formationColumns) * 65 + level2FormationOffsetX,
    y: 90 + Math.floor(slot / formationColumns) * 55 + level3DescentOffset,
  };
}

function removeEnemy(enemy) {
  const enemyIndex = enemies.indexOf(enemy);
  if (enemyIndex !== -1) enemies.splice(enemyIndex, 1);
  if (enemy.isVarnokAlien && varnokAlienFormation !== null) {
    const batchIndex = varnokAlienFormation.aliens.indexOf(enemy);
    if (batchIndex !== -1) varnokAlienFormation.aliens.splice(batchIndex, 1);
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

function handleShotCollisions(deltaSeconds, frameTime) {
  for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
    const shot = shots[shotIndex];
    const shotBounds = getPlayerShotBounds(shot);
    let hitEnemyIndex = -1;

    if (damageBarrierWithShot(shot)) {
      setDeveloperShotOutcome(shot, "Hit barrier");
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
      if (enemies[hitEnemyIndex] === level2Bomber) {
        level2Bomber = null;
        level2BomberTimer = level2BomberCooldown;
      }
      const destroyedEnemy = enemies[hitEnemyIndex];
      setDeveloperShotOutcome(shot, destroyedEnemy.isVarnokAlien ? "Hit minion" : "Hit alien");
      removeEnemy(destroyedEnemy);
      shots.splice(shotIndex, 1);
      score += 10;
      scoreDisplay.textContent = score;
      if (enemies.length === 0 && lives > 0 && boss?.level !== 4) {
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
      setDeveloperShotOutcome(shot, "Hit Vesper");
      shots.splice(shotIndex, 1);
      score += 50;
      scoreDisplay.textContent = score;
      level2BonusShip = null;
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
        const hitWidth = boss.level === 2 ? boss.width * 0.58 : boss.width;
        const hitHeight = boss.level === 2 ? boss.height * 0.62 : boss.height;
        const hitBounds = getCenteredBounds({ x: boss.x, y: boss.y, width: hitWidth, height: hitHeight });
        damagesBoss = getShotContactTime(shot, hitBounds) < Infinity;
        if (damagesBoss) shots.splice(shotIndex, 1);
      }

      if (damagesBoss) {
        const target = boss.level === 4 ? "eye" : boss.level === 3 ? "mouth" : "boss";
        if (shot.damagedBosses?.has(boss)) {
          setDeveloperShotOutcome(shot, `Volley capped (${target})`);
        } else {
          setDeveloperShotOutcome(shot, `Hit ${target}`);
          shot.damagedBosses?.add(boss);
          if (applyBossDamage(1, frameTime)) return;
        }
      } else if (hitsArmour) {
        setDeveloperShotOutcome(shot, "Hit armor");
      }
    }

    // Check the last angled segment for collisions before removing an offscreen bullet.
    if (shot.previousX !== undefined && shots[shotIndex] === shot
      && (shot.y + shot.height < 0 || shotBounds.right < 0 || shotBounds.left > canvas.width)) {
      setDeveloperShotOutcome(shot, "Missed");
      shots.splice(shotIndex, 1);
    }
  }
}

function applyBossDamage(damage, frameTime = performance.now()) {
  if (gameState !== "playing" || boss === null || boss.health <= 0) return false;

  const healthBefore = boss.health;
  boss.health -= damage;
  if (boss.health < healthBefore) boss.hitFlashUntil = frameTime + bossHitFlashDuration;
  score += 10;
  scoreDisplay.textContent = score;
  if (boss.health > 0) return false;

  if (boss.level === 2) {
    score += level2BossDefeatBonus;
    scoreDisplay.textContent = score;
    showLevel2ClearedScreen();
  } else if (boss.level === 3) {
    score += level3BossDefeatBonus;
    scoreDisplay.textContent = score;
    if (developerBossTestLevel === 3) {
      showLevel3BossDefeatedScreen();
    } else {
      clearLevel3BossEncounterState();
      boss = null;
      startVarnokBossFight(true);
    }
  } else if (boss.level === 4) {
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

function updateAlienFiring(shooters, frameTime) {
  if (shooters.length === 0) {
    nextEnemyShotTime = null;
  } else if (nextEnemyShotTime === null) {
    nextEnemyShotTime = frameTime + enemyShotIntervalMin;
  } else if (frameTime >= nextEnemyShotTime) {
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    const shot = {
      x: shooter.x,
      y: shooter.y + shooter.height / 2,
      width: 7,
      height: 13,
      artwork: alienShotArtwork[shooter.isVarnokAlien ? 3 : currentLevel - 1],
    };
    if (shooter.isVarnokAlien) varnokMinionShots.add(shot);
    enemyShots.push(shot);
    nextEnemyShotTime = frameTime + enemyShotIntervalMin
      + Math.random() * enemyShotIntervalRange;
  }
}

function updateEnemyShots(deltaSeconds, frameTime) {
  if (boss === null) {
    updateAlienFiring(enemies, frameTime);
  } else if (boss.level === 4 && varnokAlienFormation !== null) {
    const settledAliens = varnokAlienFormation.aliens.filter(isSettledVarnokAlien);
    updateAlienFiring(settledAliens, frameTime);
  }

  for (const shot of enemyShots) {
    shot.y += (shot.vy ?? enemyShotSpeed) * deltaSeconds;
    if (shot.vx !== undefined) shot.x += shot.vx * deltaSeconds;
  }

  const playerLeft = player.x - player.width / 2;
  const playerRight = player.x + player.width / 2;
  const playerTop = player.y - player.height / 2;
  const playerBottom = player.y + player.height / 2;

  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const shot = enemyShots[index];
    if (shot.bounceAtWalls) {
      const halfWidth = shot.width / 2;
      const minX = halfWidth;
      const maxX = canvas.width - halfWidth;
      if (shot.x < minX) {
        shot.x = minX;
        shot.vx = Math.abs(shot.vx);
      } else if (shot.x > maxX) {
        shot.x = maxX;
        shot.vx = -Math.abs(shot.vx);
      }
    }

    const isBelowCanvas = shot.isBossShot
      ? shot.y >= canvas.height
      : shot.y > canvas.height;
    if (isBelowCanvas) {
      enemyShots.splice(index, 1);
    } else if (damageBarrierWithShot(shot)) {
      enemyShots.splice(index, 1);
    } else if (shot.x + shot.width / 2 >= playerLeft
      && shot.x - shot.width / 2 <= playerRight
      && shot.y + shot.height >= playerTop && shot.y <= playerBottom) {
      enemyShots.splice(index, 1);
      damagePlayerFromProjectile(frameTime);
      if (gameState !== "playing") break;
    }
  }
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
  if (kestrelFlashImage !== null) {
    const height = 34;
    const width = height * kestrelFlashImage.width / kestrelFlashImage.height;
    const centerX = bankEffect ? 0 : player.x;
    const centerY = bankEffect ? 0 : player.y;
    context.drawImage(isFlashing ? kestrelFlashImage : kestrelImage,
      centerX - width / 2, centerY - height / 2, width, height);
    const farWingShade = kestrelWingShades[playerBank < 0 ? 1 : 0];
    if (bankEffect && !isFlashing && farWingShade && bankAmount > 0) {
      context.globalAlpha *= bankAmount;
      context.drawImage(farWingShade, -width / 2, -height / 2, width, height);
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

function drawEnemy(enemy, index, x = enemy.x, y = enemy.y) {
  const halfWidth = enemy.width / 2;
  const halfHeight = enemy.height / 2;
  if (currentLevel === 1 && clackImageReady) {
    context.drawImage(clackImage, x - halfWidth, y - halfHeight, enemy.width, enemy.height);
    return;
  }
  let alienImage = null;
  if (enemy.isVarnokAlien) {
    const artwork = hatchlingVisualChoices.get(enemy);
    if (artwork?.ready) alienImage = artwork.image;
  } else if (currentLevel === 2 && anvilImageReady) {
    alienImage = anvilImage;
  } else if (currentLevel === 3 && riftImageReady) {
    alienImage = riftImage;
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

function drawLevel2BonusShip() {
  if (level2BonusShip === null) return;
  context.save();
  context.translate(level2BonusShip.x, level2BonusShip.y);
  if (vesperImageReady) {
    context.rotate(level2BonusShip.direction * Math.PI / 2);
    context.drawImage(vesperImage, -vesperArtHeight / 2, -vesperArtWidth / 2,
      vesperArtHeight, vesperArtWidth);
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

function drawLevel2BossChargeLane() {
  if (boss === null || boss.level !== 2 || boss.chargePath === null) return;
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

function drawBoss(frameTime, hatchOpening = 0) {
  if (boss === null) return;

  const remaining = (boss.hitFlashUntil ?? 0) - frameTime;
  if (remaining <= 0 || bossFlashContext === null) {
    drawBossArtwork(context, frameTime, hatchOpening);
    return;
  }

  bossFlashContext.clearRect(0, 0, bossFlashCanvas.width, bossFlashCanvas.height);
  bossFlashContext.save();
  drawBossArtwork(bossFlashContext, frameTime, hatchOpening);
  // Tint only the pixels of this frame's artwork, keeping its transparency and detail.
  bossFlashContext.globalCompositeOperation = "source-atop";
  bossFlashContext.globalAlpha = 0.28 * Math.min(1, remaining / bossHitFlashDuration);
  bossFlashContext.fillStyle = "#fff0d4";
  bossFlashContext.fillRect(0, 0, bossFlashCanvas.width, bossFlashCanvas.height);
  bossFlashContext.restore();
  context.drawImage(bossFlashCanvas, 0, 0);
}

function drawBossArtwork(context, frameTime, hatchOpening) {
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

  if (boss.level === 2) {
    const top = boss.y - boss.height / 2;
    if (ironSepulchreImageReady) {
      const left = boss.x - boss.width / 2;
      context.drawImage(ironSepulchreImage, left, top, boss.width, boss.height);
      return;
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
    return;
  }

  const left = boss.x - boss.width / 2;
  const top = boss.y - boss.height / 2;
  if (sporeChoirImageReady) {
    context.drawImage(sporeChoirImage, left, top, boss.width, boss.height);
  } else {
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
  }
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

const varnokPortrait = "finalboss-workshop/Varnok Artwork Workshop (complete ZIP)/assets/rooted-crown/body-maw.svg";
const resultViews = {
  level1Cleared: {
    title: "Level 1 cleared",
    details: "You defeated Xal'Gorath!\nA new enemy formation awaits in Level 2.",
    bonus: level1BossDefeatBonus,
    art: sporeChoirImage.src,
    theme: "clear",
    nextButton: level2Button,
  },
  level2Cleared: {
    title: "Level 2 cleared",
    details: "You defeated Lord Kaezar Vhul!\nGet ready for the final battle!\nChoose Level 3 to continue.",
    bonus: level2BossDefeatBonus,
    art: ironSepulchreImage.src,
    theme: "clear",
    nextButton: level3Button,
  },
  victory: { title: "Victory", art: varnokPortrait, theme: "victory" },
  loss: { title: "Game over", theme: "loss" },
  win: { title: "You win", details: "Choose Restart to play again", theme: "clear" },
  level3BossDefeated: {
    title: "Zhur-Kai defeated",
    details: "Encounter complete. Choose Restart to play again.",
    art: crownMawBody.image.src,
    theme: "clear",
  },
  varnokBossDefeated: {
    title: "Varnok defeated",
    details: "Encounter complete. Choose Restart to play again.",
    art: varnokPortrait,
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
  resultOverlay.hidden = view === null;
  if (view === null) return;

  resultPanel.dataset.theme = view.theme;
  resultTitle.textContent = view.title;
  resultDetails.textContent = view.details ?? "";
  resultBonus.textContent = view.bonus ? `Boss defeat bonus: +${view.bonus} points` : "";
  resultScore.textContent = view.bonus ? `Score: ${score}   •   Lives: ${lives}` : "";
  if (gameState === "victory") resultScore.textContent = `Final score: ${score}`;

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

function drawRollingCredits() {
  const centerX = canvas.width / 2;
  context.save();
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillStyle = "#ffffff";
  context.font = "bold 40px Arial, sans-serif";
  context.fillText("Victory", centerX, creditsY);
  context.fillStyle = "#bfd0e3";
  context.font = "20px Arial, sans-serif";
  creditsLines.forEach((line, index) => {
    context.fillText(line, centerX, creditsY + (index + 2) * creditsLineSpacing);
  });
  context.restore();
}

function drawFrame(frameTime) {
  if (gameState !== "playing") playerBank = 0;
  const showShotReadout = DEVELOPER_MODE && tracedBoss !== null;
  if (bossShotReadout.hidden === showShotReadout) bossShotReadout.hidden = !showShotReadout;
  updateResultPanel();
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield();
  if (gameState === "menu" || gameState === "victory") return;
  if (gameState === "credits") {
    drawRollingCredits();
    return;
  }
  const varnokOnScreen = boss?.level === 4;
  const hatchOpening = varnokHatchProgress * varnokHatchProgress * (3 - 2 * varnokHatchProgress);
  const emerging = [];
  drawLevel2BossChargeLane();
  enemies.forEach((enemy, index) => {
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
  drawBoss(frameTime, hatchOpening);
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
  drawPlayer(frameTime);
  drawLevel2PickupMessage();
}

function gameLoop(frameTime) {
  const deltaSeconds = previousFrameTime === 0
    ? 0
    : Math.min((frameTime - previousFrameTime) / 1000, 0.05);
  previousFrameTime = frameTime;

  if (gameState === "credits") {
    updateCredits(deltaSeconds);
  } else if (gameState === "bossIntro") {
    updateBossIntro(deltaSeconds);
  } else if (gameState === "playing") {
    updatePlayer(deltaSeconds);
    updateLevel2PickupTimers(deltaSeconds);
    if (waveEntranceElapsed !== null) {
      updateWaveEntrance(deltaSeconds, frameTime);
      if (level2BonusShip !== null) {
        updateLevel2BonusShip(deltaSeconds);
      }
    } else {
      updateShots(deltaSeconds, frameTime);
      if (boss === null) {
        const formationBreached = updateEnemies(deltaSeconds, frameTime);
        if (formationBreached || waveEntranceElapsed !== null) {
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
      handleShotCollisions(deltaSeconds, frameTime);
      if (gameState === "playing" && waveEntranceElapsed === null) {
        updateEnemyShots(deltaSeconds, frameTime);
      }
    }
  }
  drawFrame(frameTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
