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
let enemyDirection = 1;
let score = 0;
let lives = 3;
let nextShotTime = 0;
let nextEnemyShotTime = null;
let playerInvulnerableUntil = 0;
let gameState = "playing";
let previousFrameTime = 0;

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
  const nextLeftEdge = enemies.length
    ? Math.min(...enemies.map((enemy) => enemy.x - enemy.width / 2))
      + enemyDirection * enemySpeed * deltaSeconds
    : 0;
  const nextRightEdge = enemies.length
    ? Math.max(...enemies.map((enemy) => enemy.x + enemy.width / 2))
      + enemyDirection * enemySpeed * deltaSeconds
    : canvas.width;

  if (nextLeftEdge < 0 || nextRightEdge > canvas.width) {
    enemyDirection *= -1;
  }

  for (const enemy of enemies) {
    enemy.x += enemyDirection * enemySpeed * deltaSeconds;
  }
}

function handleShotCollisions() {
  for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
    const shot = shots[shotIndex];
    const shotLeft = shot.x - shot.width / 2;
    const shotRight = shot.x + shot.width / 2;
    let hitEnemyIndex = -1;

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
  context.fillStyle = isFlashing ? "#ffffff" : "#64d8ff";
  context.beginPath();
  context.moveTo(player.x, player.y - player.height / 2);
  context.lineTo(player.x - player.width / 2, player.y + player.height / 2);
  context.lineTo(player.x + player.width / 2, player.y + player.height / 2);
  context.closePath();
  context.fill();
}

function drawFrame(frameTime) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ff7b72";
  for (const enemy of enemies) {
    context.fillRect(
      enemy.x - enemy.width / 2,
      enemy.y - enemy.height / 2,
      enemy.width,
      enemy.height,
    );
  }
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
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "bold 48px Arial, sans-serif";
    context.fillText(
      gameState === "win" ? "You win" : "Game over",
      canvas.width / 2,
      canvas.height / 2,
    );
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
