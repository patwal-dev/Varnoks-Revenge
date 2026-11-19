const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const restartButton = document.getElementById("restart");

const player = {
  x: canvas.width / 2,
  y: canvas.height - 52,
  width: 42,
  height: 34,
  speed: 300,
};

const keysDown = new Set();
const shots = [];
const enemyShots = [];
const enemies = [];
const shotSpeed = 420;
const shotInterval = 0.22;
const enemyShotSpeed = 210;
const enemyShotIntervalMin = 900;
const enemyShotIntervalRange = 600;
const enemySize = 30;
const enemySpeed = 65;
const maxEnemySpeedMultiplier = 1.75;
const barrierWidth = 110;
const barrierHeight = 28;
const barrierHitPoints = 3;
let startingEnemyCount = 0;
let barriers = [];
let enemyDirection = 1;
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
      enemies.push({
        x: 230 + column * 65,
        y: 90 + row * 55,
        width: enemySize,
        height: enemySize,
      });
    }
  }
  startingEnemyCount = enemies.length;
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
  keysDown.clear();
  restartButton.hidden = false;
}

function restartGame() {
  score = 0;
  lives = 3;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;

  player.x = canvas.width / 2;
  player.y = canvas.height - 52;
  shots.length = 0;
  enemyShots.length = 0;
  enemies.length = 0;
  createEnemies();
  createBarriers();

  enemyDirection = 1;
  nextShotTime = 0;
  nextEnemyShotTime = null;
  playerInvulnerableUntil = 0;
  keysDown.clear();
  gameState = "playing";
  restartButton.hidden = true;
  previousFrameTime = 0;
}

createEnemies();
createBarriers();
restartButton.addEventListener("click", restartGame);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (event.code === "Space") {
    event.preventDefault();
    keysDown.add("space");
  } else if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
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

  player.x += direction * player.speed * deltaSeconds;
  const halfWidth = player.width / 2;
  player.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, player.x));
}

function updateShots(deltaSeconds, frameTime) {
  if (keysDown.has("space") && frameTime >= nextShotTime) {
    shots.push({
      x: player.x,
      y: player.y - player.height / 2 - 5,
      width: 5,
      height: 14,
    });
    nextShotTime = frameTime + shotInterval * 1000;
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

function updateEnemies(deltaSeconds) {
  const destroyedFraction = startingEnemyCount > 0
    ? 1 - enemies.length / startingEnemyCount
    : 0;
  const formationSpeed = enemySpeed * (
    1 + destroyedFraction * (maxEnemySpeedMultiplier - 1)
  );
  const nextLeftEdge = enemies.length
    ? Math.min(...enemies.map((enemy) => enemy.x - enemy.width / 2))
      + enemyDirection * formationSpeed * deltaSeconds
    : 0;
  const nextRightEdge = enemies.length
    ? Math.max(...enemies.map((enemy) => enemy.x + enemy.width / 2))
      + enemyDirection * formationSpeed * deltaSeconds
    : canvas.width;

  if (nextLeftEdge < 0 || nextRightEdge > canvas.width) {
    enemyDirection *= -1;
  }

  for (const enemy of enemies) {
    enemy.x += enemyDirection * formationSpeed * deltaSeconds;
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
      enemies.splice(hitEnemyIndex, 1);
      shots.splice(shotIndex, 1);
      score += 10;
      scoreDisplay.textContent = score;
      if (enemies.length === 0 && lives > 0) {
        finishGame("win");
      }
    }
  }
}

function updateEnemyShots(deltaSeconds, frameTime) {
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

  for (const shot of enemyShots) {
    shot.y += enemyShotSpeed * deltaSeconds;
  }

  const playerLeft = player.x - player.width / 2;
  const playerRight = player.x + player.width / 2;
  const playerTop = player.y - player.height / 2;
  const playerBottom = player.y + player.height / 2;

  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const shot = enemyShots[index];
    if (shot.y > canvas.height) {
      enemyShots.splice(index, 1);
    } else if (damageBarrierWithShot(shot)) {
      enemyShots.splice(index, 1);
    } else if (shot.x + shot.width / 2 >= playerLeft
      && shot.x - shot.width / 2 <= playerRight
      && shot.y + shot.height >= playerTop && shot.y <= playerBottom) {
      enemyShots.splice(index, 1);
      if (frameTime >= playerInvulnerableUntil) {
        lives = Math.max(0, lives - 1);
        livesDisplay.textContent = lives;
        playerInvulnerableUntil = frameTime + 1000;
        if (lives === 0) finishGame("loss");
      }
    }
  }
}

function drawPlayer(frameTime) {
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
  enemies.forEach(drawEnemy);
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

  if (gameState !== "playing") {
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

  if (gameState === "playing") {
    updatePlayer(deltaSeconds);
    updateShots(deltaSeconds, frameTime);
    updateEnemies(deltaSeconds);
    handleShotCollisions();
    if (gameState === "playing") {
      updateEnemyShots(deltaSeconds, frameTime);
    }
  }
  drawFrame(frameTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
