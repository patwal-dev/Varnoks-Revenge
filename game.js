const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const restartButton = document.getElementById("restart");
const level2Button = document.getElementById("level-2");

const playerSpawnY = canvas.height - 52;
const playerMinY = playerSpawnY - 60;
const playerMaxY = playerSpawnY;
const player = {
  x: canvas.width / 2,
  y: playerSpawnY,
  width: 42,
  height: 34,
  speed: 300,
};

const keysDown = new Set();
const shots = [];
const enemyShots = [];
const enemies = [];
const shotSpeed = 420;
const shotInterval = 0.80;
const rapidFireRateMultiplier = 2;
const level2WeaponDuration = 10;
const level2WeaponMessageDuration = 2;
const enemyShotSpeed = 210;
const enemyShotIntervalMin = 900;
const enemyShotIntervalRange = 600;
const bossAttackInterval = 1600;
const bossWideShotChance = 0.5;
const bossChargeDuration = 0.5;
const bossWideShotWidth = 24;
const bossSpreadHorizontalSpeed = 150;
const bossIntroSlideDuration = 0.8;
const bossDialogueDuration = 4.5;
const level1BossHealth = 15;
const level1BossDefeatBonus = 100;
const level2BossHealth = 20;
const level2BossDefeatBonus = 200;
const level2BossMoveDuration = 2;
const level2BossPrepareDuration = 0.8;
const level2BossMovementSpeed = 150;
const level2BossChargeSpeed = 560;
const level2BossPullbackDistance = 28;
const level2BossOvershootDistance = 20;
const level2BossRetreatDuration = 0.8;
const level2BossLaneOpacity = 0.12;
const level2BossLaneFadeDuration = 0.2;
const enemySize = 30;
const enemySpeed = 65;
const level2BomberDelay = 2.5;
const level2BomberCooldown = 2;
const level2BomberSpeed = 260;
const level2BonusShipDelayMin = 20;
const level2BonusShipDelayMax = 35;
const level2BonusShipSpeed = 180;
const level2BonusShipWidth = 48;
const level2BonusShipHeight = 24;
const level2ShieldPickupSpeed = 150;
const level2ShieldChargesMax = 2;
const maxEnemySpeedMultiplier = 1.75;
const level1WaveCount = 2;
const waveEntranceDuration = 0.8;
const barrierWidth = 110;
const barrierHeight = 28;
const barrierHitPoints = 3;
let startingEnemyCount = 0;
let level2FormationOffsetX = 0;
let level2Bomber = null;
let level2BomberTimer = 0;
let level2BonusShip = null;
let level2BonusShipTimer = 0;
const level2Pickups = [];
let level2ShieldCharges = 0;
let level2WeaponTimeRemaining = 0;
let level2WeaponMessageTimeRemaining = 0;
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
let gameState = "playing";
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
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const enemy = {
        x: 230 + column * 65,
        y: 90 + row * 55,
        width: enemySize,
        height: enemySize,
      };
      if (currentLevel === 2) {
        enemy.formationSlot = row * 6 + column;
      }
      enemies.push(enemy);
    }
  }
  startingEnemyCount = enemies.length;
}

function startWaveEntrance() {
  const lowestEdge = Math.max(...enemies.map((enemy) => enemy.y + enemy.height / 2));
  const entranceOffset = -lowestEdge;
  waveEntrancePositions = enemies.map((enemy) => {
    const targetY = enemy.y;
    const startY = targetY + entranceOffset;
    enemy.y = startY;
    return { startY, targetY };
  });
  waveEntranceElapsed = 0;
}

function updateWaveEntrance(deltaSeconds) {
  waveEntranceElapsed = Math.min(
    waveEntranceElapsed + deltaSeconds,
    waveEntranceDuration,
  );
  const progress = waveEntranceElapsed / waveEntranceDuration;

  enemies.forEach((enemy, index) => {
    const { startY, targetY } = waveEntrancePositions[index];
    enemy.y = progress === 1
      ? targetY
      : startY + (targetY - startY) * progress;
  });

  if (progress === 1) {
    waveEntranceElapsed = null;
    waveEntrancePositions = null;
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
  const dialogueDuration = boss.level === 2 ? 0 : bossDialogueDuration;
  bossIntroElapsed = Math.min(
    bossIntroElapsed + deltaSeconds,
    bossIntroSlideDuration + dialogueDuration,
  );
  const slideProgress = Math.min(bossIntroElapsed / bossIntroSlideDuration, 1);
  boss.y = slideProgress === 1
    ? bossIntroTargetY
    : bossIntroStartY + (bossIntroTargetY - bossIntroStartY) * slideProgress;

  if (bossIntroElapsed >= bossIntroSlideDuration + dialogueDuration) {
    boss.y = bossIntroTargetY;
    bossIntroElapsed = null;
    bossIntroStartY = null;
    bossIntroTargetY = null;
    gameState = "playing";
    previousFrameTime = 0;
  }
}

function startLevel2() {
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
  level2ShieldCharges = 0;
  level2WeaponTimeRemaining = 0;
  level2WeaponMessageTimeRemaining = 0;
  nextEnemyShotTime = null;
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
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
}

function fireBossWideShot() {
  enemyShots.push({
    x: boss.x,
    y: boss.y + boss.height / 2,
    width: bossWideShotWidth,
    height: 24,
    vy: enemyShotSpeed,
    isBossShot: true,
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
    },
  );
}

function updateBoss(deltaSeconds, frameTime) {
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
      level2ShieldCharges = 0;
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
  const shotLeft = shot.x - shot.width / 2;
  const shotRight = shot.x + shot.width / 2;
  const shotBottom = shot.y + shot.height;
  const barrierIndex = barriers.findIndex((barrier) => (
    shotRight >= barrier.x - barrier.width / 2
    && shotLeft <= barrier.x + barrier.width / 2
    && shotBottom >= barrier.y - barrier.height / 2
    && shot.y <= barrier.y + barrier.height / 2
  ));

  if (barrierIndex === -1) return false;

  barriers[barrierIndex].hitPoints -= 1;
  if (barriers[barrierIndex].hitPoints === 0) {
    barriers.splice(barrierIndex, 1);
  }
  return true;
}

function finishGame(result) {
  gameState = result;
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
  level2ShieldCharges = 0;
  level2WeaponTimeRemaining = 0;
  level2WeaponMessageTimeRemaining = 0;
  keysDown.clear();
  restartButton.hidden = false;
  level2Button.hidden = true;
}

function damagePlayer(frameTime) {
  if (frameTime < playerInvulnerableUntil) return false;
  lives = Math.max(0, lives - 1);
  livesDisplay.textContent = lives;
  playerInvulnerableUntil = frameTime + 1000;
  if (lives === 0) finishGame("loss");
  return true;
}

function restartGame() {
  score = 0;
  lives = 3;
  currentLevel = 1;
  level2FormationOffsetX = 0;
  level2Bomber = null;
  level2BomberTimer = 0;
  level2BonusShip = null;
  level2BonusShipTimer = 0;
  level2Pickups.length = 0;
  level2ShieldCharges = 0;
  level2WeaponTimeRemaining = 0;
  level2WeaponMessageTimeRemaining = 0;
  currentWave = 1;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;

  player.x = canvas.width / 2;
  player.y = playerSpawnY;
  shots.length = 0;
  enemyShots.length = 0;
  enemies.length = 0;
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
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  level2Button.hidden = true;
  previousFrameTime = 0;
}

createEnemies();
createBarriers();
restartButton.addEventListener("click", restartGame);
level2Button.addEventListener("click", () => {
  if (gameState === "level1Cleared") startLevel2();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (event.code === "Space") {
    event.preventDefault();
    keysDown.add("space");
  } else if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
    event.preventDefault();
    keysDown.add(key);
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

  player.x += direction * player.speed * deltaSeconds;
  player.y += verticalDirection * player.speed * deltaSeconds;
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  player.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, player.x));
  player.y = Math.max(playerMinY, Math.min(playerMaxY, player.y));
  player.y = Math.max(halfHeight, Math.min(canvas.height - halfHeight, player.y));
}

function updateShots(deltaSeconds, frameTime) {
  if (keysDown.has("space") && frameTime >= nextShotTime) {
    shots.push({
      x: player.x,
      y: player.y - player.height / 2 - 5,
      width: 5,
      height: 14,
    });
    const firingInterval = currentLevel === 2 && level2WeaponTimeRemaining > 0
      ? shotInterval / rapidFireRateMultiplier
      : shotInterval;
    nextShotTime = frameTime + firingInterval * 1000;
  }

  for (const shot of shots) {
    shot.y -= shotSpeed * deltaSeconds;
  }

  for (let index = shots.length - 1; index >= 0; index -= 1) {
    if (shots[index].y + shots[index].height < 0) {
      shots.splice(index, 1);
    }
  }
}

function updateEnemies(deltaSeconds, frameTime) {
  if (currentLevel === 2) {
    updateLevel2Bomber(deltaSeconds, frameTime);
  }
  const formationEnemies = currentLevel === 2
    ? enemies.filter((enemy) => enemy.bomberState === undefined || enemy.bomberState === "formation")
    : enemies;
  const destroyedFraction = startingEnemyCount > 0
    ? 1 - enemies.length / startingEnemyCount
    : 0;
  const formationSpeed = enemySpeed * (
    1 + destroyedFraction * (maxEnemySpeedMultiplier - 1)
  );
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

  if (nextLeftEdge < 0 || nextRightEdge > canvas.width) {
    enemyDirection *= -1;
  }

  for (const enemy of formationEnemies) {
    enemy.x += enemyDirection * formationSpeed * deltaSeconds;
  }
  if (currentLevel === 2 && formationEnemies.length > 0) {
    level2FormationOffsetX += enemyDirection * formationSpeed * deltaSeconds;
  }
}

function updateLevel2Bomber(deltaSeconds, frameTime) {
  let bomber = level2Bomber;
  if (bomber === null) {
    level2BomberTimer -= deltaSeconds;
    if (level2BomberTimer <= 0) {
      const eligibleEnemies = enemies.filter((enemy) => enemy.formationSlot !== null
        && enemy.bomberState === undefined);
      if (eligibleEnemies.length > 0) {
        bomber = eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
        level2Bomber = bomber;
        bomber.formationSlot = null;
        bomber.bomberState = "dive";
        const dx = player.x - bomber.x;
        const dy = player.y - bomber.y;
        const distance = Math.hypot(dx, dy) || 1;
        bomber.diveVelocityX = dx / distance * level2BomberSpeed;
        bomber.diveVelocityY = dy / distance * level2BomberSpeed;
        bomber.contactingPlayer = false;
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
      level2ShieldCharges = 0;
      enemies.splice(enemies.indexOf(bomber), 1);
      level2Bomber = null;
      level2BomberTimer = level2BomberCooldown;
      if (enemies.length === 0 && lives > 0) startLevel2BossFight();
      return;
    }
    bomber.contactingPlayer = touchingPlayer;
    if (bomber.y - bomber.height / 2 > canvas.height) {
      const occupiedSlots = new Set(enemies
        .filter((enemy) => enemy !== bomber && enemy.formationSlot !== null)
        .map((enemy) => enemy.formationSlot));
      const availableSlots = Array.from({ length: 12 }, (_, slot) => slot)
        .filter((slot) => !occupiedSlots.has(slot));
      const selectedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      bomber.formationSlot = selectedSlot;
      bomber.x = 230 + (selectedSlot % 6) * 65 + level2FormationOffsetX;
      bomber.y = -bomber.height / 2;
      bomber.bomberState = "return";
      bomber.contactingPlayer = false;
    }
  } else if (bomber.bomberState === "return") {
    const targetX = 230 + (bomber.formationSlot % 6) * 65 + level2FormationOffsetX;
    const targetY = 90 + Math.floor(bomber.formationSlot / 6) * 55;
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
      } else if (pickup.type === "weapon") {
        level2WeaponTimeRemaining = level2WeaponDuration;
        level2WeaponMessageTimeRemaining = level2WeaponMessageDuration;
      }
      level2Pickups.splice(index, 1);
    } else if (pickup.y - pickup.height / 2 > canvas.height) {
      level2Pickups.splice(index, 1);
    }
  }
}

function updateLevel2WeaponTimers(deltaSeconds) {
  if (currentLevel !== 2) return;
  level2WeaponTimeRemaining = Math.max(0, level2WeaponTimeRemaining - deltaSeconds);
  if (level2WeaponTimeRemaining < 0.000001) level2WeaponTimeRemaining = 0;
  level2WeaponMessageTimeRemaining = Math.max(
    0,
    level2WeaponMessageTimeRemaining - deltaSeconds,
  );
  if (level2WeaponMessageTimeRemaining < 0.000001) {
    level2WeaponMessageTimeRemaining = 0;
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

function handleShotCollisions() {
  for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
    const shot = shots[shotIndex];
    const shotLeft = shot.x - shot.width / 2;
    const shotRight = shot.x + shot.width / 2;
    let hitEnemyIndex = -1;

    if (damageBarrierWithShot(shot)) {
      shots.splice(shotIndex, 1);
      continue;
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      const enemyLeft = enemy.x - enemy.width / 2;
      const enemyRight = enemy.x + enemy.width / 2;
      const enemyTop = enemy.y - enemy.height / 2;
      const enemyBottom = enemy.y + enemy.height / 2;
      if (shotRight >= enemyLeft && shotLeft <= enemyRight
        && shot.y <= enemyBottom && shot.y + shot.height >= enemyTop) {
        hitEnemyIndex = enemyIndex;
        break;
      }
    }

    if (hitEnemyIndex !== -1) {
      if (enemies[hitEnemyIndex] === level2Bomber) {
        level2Bomber = null;
        level2BomberTimer = level2BomberCooldown;
      }
      enemies.splice(hitEnemyIndex, 1);
      shots.splice(shotIndex, 1);
      score += 10;
      scoreDisplay.textContent = score;
      if (enemies.length === 0 && lives > 0) {
        if (currentLevel === 1 && currentWave < level1WaveCount) {
          currentWave += 1;
          shots.length = 0;
          enemyShots.length = 0;
          enemies.length = 0;
          createEnemies();
          enemyDirection = 1;
          nextEnemyShotTime = null;
          startWaveEntrance();
        } else if (currentLevel === 1) {
          startBossIntro();
        } else {
          startLevel2BossFight();
        }
        return;
      }
    } else if (currentLevel === 2 && level2BonusShip !== null
      && shotRight >= level2BonusShip.x - level2BonusShip.width / 2
      && shotLeft <= level2BonusShip.x + level2BonusShip.width / 2
      && shot.y <= level2BonusShip.y + level2BonusShip.height / 2
      && shot.y + shot.height >= level2BonusShip.y - level2BonusShip.height / 2) {
      const shipLeft = level2BonusShip.x - level2BonusShip.width / 2;
      const shipRight = level2BonusShip.x + level2BonusShip.width / 2;
      const shipTop = level2BonusShip.y - level2BonusShip.height / 2;
      const shipBottom = level2BonusShip.y + level2BonusShip.height / 2;
      if (shotRight >= shipLeft && shotLeft <= shipRight
        && shot.y <= shipBottom && shot.y + shot.height >= shipTop) {
        const pickupX = level2BonusShip.x;
        const pickupY = level2BonusShip.y;
        shots.splice(shotIndex, 1);
        score += 50;
        scoreDisplay.textContent = score;
        level2BonusShip = null;
        level2BonusShipTimer = randomLevel2BonusShipDelay();
        level2Pickups.push({
          x: pickupX,
          y: pickupY,
          width: 22,
          height: 22,
          type: Math.random() < 0.5 ? "shield" : "weapon",
        });
      }
    } else if (boss !== null) {
      const hitWidth = boss.level === 2 ? boss.width * 0.58 : boss.width;
      const hitHeight = boss.level === 2 ? boss.height * 0.62 : boss.height;
      const bossLeft = boss.x - hitWidth / 2;
      const bossRight = boss.x + hitWidth / 2;
      const bossTop = boss.y - hitHeight / 2;
      const bossBottom = boss.y + hitHeight / 2;
      if (shotRight >= bossLeft && shotLeft <= bossRight
        && shot.y <= bossBottom && shot.y + shot.height >= bossTop) {
        shots.splice(shotIndex, 1);
        boss.health -= 1;
        score += 10;
        scoreDisplay.textContent = score;
        if (boss.health <= 0) {
          if (boss.level === 2) {
            score += level2BossDefeatBonus;
            scoreDisplay.textContent = score;
            finishGame("win");
          } else {
            score += level1BossDefeatBonus;
            scoreDisplay.textContent = score;
            showLevel1ClearedScreen();
          }
          return;
        }
      }
    }
  }
}

function updateEnemyShots(deltaSeconds, frameTime) {
  if (boss === null) {
    if (enemies.length === 0) {
      nextEnemyShotTime = null;
    } else if (nextEnemyShotTime === null) {
      nextEnemyShotTime = frameTime + enemyShotIntervalMin;
    } else if (frameTime >= nextEnemyShotTime) {
      const shooter = enemies[Math.floor(Math.random() * enemies.length)];
      enemyShots.push({
        x: shooter.x,
        y: shooter.y + shooter.height / 2,
        width: 7,
        height: 13,
      });
      nextEnemyShotTime = frameTime + enemyShotIntervalMin
        + Math.random() * enemyShotIntervalRange;
    }
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
      if (currentLevel === 2 && level2ShieldCharges > 0) {
        if (frameTime >= playerInvulnerableUntil) {
          level2ShieldCharges -= 1;
          playerInvulnerableUntil = frameTime + 1000;
        }
      } else {
        damagePlayer(frameTime);
      }
    }
  }
}

function drawPlayer(frameTime) {
  if (currentLevel === 2 && level2ShieldCharges > 0) {
    context.lineWidth = 3;
    if (level2ShieldCharges >= 2) {
      context.strokeStyle = "rgba(112, 232, 255, 0.9)";
      context.beginPath();
      context.ellipse(player.x, player.y, player.width * 0.82, player.height * 0.88, 0, 0, Math.PI * 2);
      context.stroke();
    }
    context.strokeStyle = "rgba(220, 250, 255, 0.95)";
    context.beginPath();
    context.ellipse(player.x, player.y, player.width * 0.58, player.height * 0.64, 0, 0, Math.PI * 2);
    context.stroke();
  }
  const isFlashing = frameTime < playerInvulnerableUntil
    && Math.floor(frameTime / 75) % 2 === 0;
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

function drawEnemy(enemy, index) {
  const halfWidth = enemy.width / 2;
  const halfHeight = enemy.height / 2;
  const x = enemy.x;
  const y = enemy.y;
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

function drawLevel2BonusShip() {
  if (level2BonusShip === null) return;
  context.save();
  context.translate(level2BonusShip.x, level2BonusShip.y);
  context.scale(level2BonusShip.direction, 1);
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

function drawLevel2Pickups() {
  for (const pickup of level2Pickups) {
    context.save();
    context.translate(pickup.x, pickup.y);
    context.lineWidth = 2;
    context.beginPath();
    if (pickup.type === "shield") {
      context.fillStyle = "#70e8ff";
      context.strokeStyle = "#e6fcff";
      context.moveTo(0, -pickup.height / 2);
      context.lineTo(pickup.width / 2, 0);
      context.lineTo(0, pickup.height / 2);
      context.lineTo(-pickup.width / 2, 0);
    } else {
      context.fillStyle = "#ffad55";
      context.strokeStyle = "#fff0c2";
      context.moveTo(3, -pickup.height / 2);
      context.lineTo(pickup.width / 2, -2);
      context.lineTo(3, 1);
      context.lineTo(5, pickup.height / 2);
      context.lineTo(-pickup.width / 2, 2);
      context.lineTo(-2, -1);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawLevel2WeaponMessage() {
  if (currentLevel !== 2 || level2WeaponMessageTimeRemaining <= 0) return;
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 20px Arial, sans-serif";
  context.lineWidth = 4;
  context.strokeStyle = "rgba(5, 11, 21, 0.95)";
  context.fillStyle = "#ffe08a";
  const message = "Machine gun baby!";
  const messageY = canvas.height - 18;
  context.strokeText(message, canvas.width / 2, messageY);
  context.fillText(message, canvas.width / 2, messageY);
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

  context.save();
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

function drawBoss() {
  if (boss === null) return;

  if (boss.level === 2) {
    const left = boss.x - boss.width / 2;
    const top = boss.y - boss.height / 2;
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

    const healthBarY = top - 18;
    context.fillStyle = "#26374d";
    context.fillRect(left, healthBarY, boss.width, 8);
    context.fillStyle = "#e77bd5";
    context.fillRect(left, healthBarY, boss.width * (boss.health / boss.maxHealth), 8);
    context.strokeStyle = "#f3d9ff";
    context.lineWidth = 1;
    context.strokeRect(left, healthBarY, boss.width, 8);
    return;
  }

  if (bossChargeElapsed !== null) {
    const chargeProgress = bossChargeElapsed / bossChargeDuration;
    context.strokeStyle = `rgba(95, 231, 255, ${0.55 + chargeProgress * 0.4})`;
    context.lineWidth = 4 + chargeProgress * 4;
    context.beginPath();
    context.ellipse(
      boss.x,
      boss.y,
      boss.width * (0.58 + chargeProgress * 0.12),
      boss.height * (0.75 + chargeProgress * 0.2),
      0,
      0,
      Math.PI * 2,
    );
    context.stroke();
  }

  const left = boss.x - boss.width / 2;
  const top = boss.y - boss.height / 2;
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

  const healthBarWidth = boss.width;
  const healthBarY = top - 18;
  context.fillStyle = "#26374d";
  context.fillRect(left, healthBarY, healthBarWidth, 8);
  context.fillStyle = "#e77bd5";
  context.fillRect(left, healthBarY, healthBarWidth * (boss.health / boss.maxHealth), 8);
  context.strokeStyle = "#f3d9ff";
  context.lineWidth = 1;
  context.strokeRect(left, healthBarY, healthBarWidth, 8);
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

function drawFrame(frameTime) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield();
  drawLevel2BossChargeLane();
  enemies.forEach(drawEnemy);
  drawLevel2BonusShip();
  drawLevel2Pickups();
  drawBoss();
  drawBarriers();
  context.fillStyle = "#ffe08a";
  for (const shot of shots) {
    context.fillRect(shot.x - shot.width / 2, shot.y, shot.width, shot.height);
  }
  context.fillStyle = "#ffb26b";
  for (const shot of enemyShots) {
    context.fillRect(shot.x - shot.width / 2, shot.y, shot.width, shot.height);
  }
  drawPlayer(frameTime);
  drawLevel2WeaponMessage();

  if (gameState === "bossIntro" && boss.level === 1) {
    if (bossIntroElapsed >= bossIntroSlideDuration) {
      context.fillStyle = "rgba(0, 0, 0, 0.35)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const bubbleX = 24;
      const bubbleY = 24;
      const bubbleWidth = 300;
      const bubbleHeight = 154;
      const cornerRadius = 14;
      const tailHalfWidth = 12;
      const tailBaseY = bubbleY + bubbleHeight / 2;
      const tailTipX = boss.x - boss.width / 2 - 8;
      const tailTipY = Math.max(10, Math.min(canvas.height - 10, boss.y));

      context.beginPath();
      context.moveTo(bubbleX + cornerRadius, bubbleY);
      context.lineTo(bubbleX + bubbleWidth - cornerRadius, bubbleY);
      context.quadraticCurveTo(
        bubbleX + bubbleWidth,
        bubbleY,
        bubbleX + bubbleWidth,
        bubbleY + cornerRadius,
      );
      context.lineTo(bubbleX + bubbleWidth, tailBaseY - tailHalfWidth);
      context.lineTo(tailTipX, tailTipY);
      context.lineTo(bubbleX + bubbleWidth, tailBaseY + tailHalfWidth);
      context.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - cornerRadius);
      context.quadraticCurveTo(
        bubbleX + bubbleWidth,
        bubbleY + bubbleHeight,
        bubbleX + bubbleWidth - cornerRadius,
        bubbleY + bubbleHeight,
      );
      context.lineTo(bubbleX + cornerRadius, bubbleY + bubbleHeight);
      context.quadraticCurveTo(
        bubbleX,
        bubbleY + bubbleHeight,
        bubbleX,
        bubbleY + bubbleHeight - cornerRadius,
      );
      context.lineTo(bubbleX, bubbleY + cornerRadius);
      context.quadraticCurveTo(bubbleX, bubbleY, bubbleX + cornerRadius, bubbleY);
      context.closePath();
      context.fillStyle = "#0d1b2d";
      context.fill();
      context.strokeStyle = "#48c9ef";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = "#FFFFFF";
      context.textAlign = "center";
      context.font = "16px Arial, sans-serif";
      context.fillText(
        "Muwahahaha! You fool! You may",
        bubbleX + bubbleWidth / 2,
        bubbleY + 48,
      );
      context.fillText(
        "have beaten my minions, but now",
        bubbleX + bubbleWidth / 2,
        bubbleY + 79,
      );
      context.fillText(
        "you must face me!",
        bubbleX + bubbleWidth / 2,
        bubbleY + 110,
      );
    }
  } else if (gameState === "level1Cleared") {
    context.fillStyle = "rgba(0, 0, 0, 0.65)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const panelWidth = 640;
    const panelHeight = 300;
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;
    context.fillStyle = "#0d1b2d";
    context.fillRect(panelX, panelY, panelWidth, panelHeight);
    context.strokeStyle = "#48c9ef";
    context.lineWidth = 2;
    context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "bold 32px Arial, sans-serif";
    context.fillText("Level 1 cleared", canvas.width / 2, panelY + 55);
    context.fillStyle = "#bfd0e3";
    context.font = "17px Arial, sans-serif";
    context.fillText("You defeated Xal’Gorath the Devourer!", canvas.width / 2, panelY + 108);
    context.fillText("But reinforcements are closing in.", canvas.width / 2, panelY + 138);
    context.fillText("Get ready for the next attack.", canvas.width / 2, panelY + 168);
    context.fillStyle = "#bfd0e3";
    context.font = "bold 19px Arial, sans-serif";
    context.fillText(`Boss defeat bonus: +${level1BossDefeatBonus} points`, canvas.width / 2, panelY + 210);
    context.fillStyle = "#ffffff";
    context.fillText(`Score: ${score}     Lives: ${lives}`, canvas.width / 2, panelY + 242);
  } else if (gameState !== "playing" && gameState !== "bossIntro") {
    context.fillStyle = "rgba(0, 0, 0, 0.65)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const panelWidth = 360;
    const panelHeight = 126;
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;
    context.fillStyle = "#0d1b2d";
    context.fillRect(panelX, panelY, panelWidth, panelHeight);
    context.strokeStyle = gameState === "win" ? "#48c9ef" : "#df6685";
    context.lineWidth = 2;
    context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "bold 40px Arial, sans-serif";
    context.fillText(
      gameState === "win" ? "You win" : "Game over",
      canvas.width / 2,
      canvas.height / 2 - 4,
    );
    context.fillStyle = "#bfd0e3";
    context.font = "16px Arial, sans-serif";
    context.fillText("Choose Restart to play again", canvas.width / 2, canvas.height / 2 + 32);
  }
}

function gameLoop(frameTime) {
  const deltaSeconds = previousFrameTime === 0
    ? 0
    : Math.min((frameTime - previousFrameTime) / 1000, 0.05);
  previousFrameTime = frameTime;

  if (gameState === "bossIntro") {
    updateBossIntro(deltaSeconds);
  } else if (gameState === "playing") {
    updatePlayer(deltaSeconds);
    updateLevel2WeaponTimers(deltaSeconds);
    if (waveEntranceElapsed !== null) {
      updateWaveEntrance(deltaSeconds);
    } else {
      updateShots(deltaSeconds, frameTime);
      if (boss === null) {
        updateEnemies(deltaSeconds, frameTime);
      } else {
        updateBoss(deltaSeconds, frameTime);
      }
      if (gameState === "playing" && currentLevel === 2) {
        updateLevel2BonusShip(deltaSeconds);
        updateLevel2Pickups(deltaSeconds);
      }
      handleShotCollisions();
      if (gameState === "playing") {
        updateEnemyShots(deltaSeconds, frameTime);
      }
    }
  }
  drawFrame(frameTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
