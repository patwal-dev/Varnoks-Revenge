const assert = require("node:assert/strict");
const { game, run } = require("./game-harness.cjs");

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `Expected ${expected}, got ${actual}`);
}

function tick(time) {
  const previous = run("previousFrameTime");
  game.gameLoop(time);
  return previous === 0 ? 0 : Math.min((time - previous) / 1000, 0.05);
}

function armLastAlien(level, wave, hit = "shot") {
  run(`restartGame(); startLevel${level}(); currentWave = ${wave}; enemies.length = 1;
    Math.random = () => 0.5;
    level2BonusShipTimer = 10;
    level2BonusShip = { x: 300, y: 42, direction: 1,
      width: level2BonusShipWidth, height: level2BonusShipHeight };
    level2Pickups.push(
      { x: 20, y: 100, width: 22, height: 22, type: "shield" },
      { x: player.x, y: player.y - 36, width: 22, height: 22, type: "shield" },
      { x: 20, y: canvas.height + 2, width: 22, height: 22, type: "shield" }
    );
    level2BomberTimer = 10;
    if ("${hit}" === "shot") {
      shots.push({ x: enemies[0].x, y: enemies[0].y, width: 5, height: 14, vx: 0, vy: 0 });
    } else {
      level2Bomber = enemies[0];
      Object.assign(level2Bomber, { x: player.x, y: player.y, bomberState: "dive",
        diveVelocityX: 0, diveVelocityY: 0 });
    }
    previousFrameTime = 1000;
  `);
}

for (const hit of ["shot", "ram"]) {
  armLastAlien(2, 2, hit);
  tick(1050);
  assert.equal(run("gameState"), "bossIntro");
  near(run("level2Pickups[0].y"), 107.5);
  near(run("level2BonusShip.x"), 308.1);
  const combatClock = run("combatElapsed");
  tick(1100);
  near(run("level2Pickups[0].y"), 115);
  assert.equal(run("level2Pickups.length"), 1);
  assert.equal(run("level2ShieldCharges"), run("level2ShieldChargesMax"));
  assert.equal(run("level2ShieldTimeRemaining"), run("level2ShieldDuration"));
  near(run("level2BonusShip.x"), 316.2);
  assert.equal(run("level2Bosses[0].attackPhaseElapsed"), 0);
  assert.equal(run("combatElapsed"), combatClock);

  // An exiting ship can set the next spawn delay, but the intro must not advance it.
  run("level2BonusShip.x = canvas.width + 50;");
  tick(1150);
  assert.equal(run("level2BonusShip"), null);
  const spawnDelay = run("level2BonusShipTimer");
  let time = 1150;
  while (run('gameState === "bossIntro"') && time < 2000) {
    const y = run("level2Pickups[0].y");
    time += 50;
    near(run("level2BonusShipTimer"), spawnDelay);
    near(run("level2Bosses[0].attackPhaseElapsed"), 0);
    const delta = tick(time);
    near(run("level2Pickups[0].y"), y + delta * run("level2ShieldPickupSpeed"));
  }
  assert.equal(run("gameState"), "playing");
  assert.equal(run("combatElapsed"), combatClock);
  assert.equal(run("level2BonusShipTimer"), spawnDelay);
  tick(time + 50); // The established handoff resets the frame clock for the first combat frame.
  const y = run("level2Pickups[0].y");
  tick(time + 100);
  near(run("level2Pickups[0].y"), y + 7.5);
  near(run("level2Bosses[0].attackPhaseElapsed"), 0.05);
  near(run("level2BonusShipTimer"), spawnDelay - 0.05);
}

for (const [level, hit] of [[2, "shot"], [2, "ram"], [3, "shot"]]) {
  armLastAlien(level, 1, hit);
  tick(1050);
  assert.equal(run("currentWave"), 2);
  assert.ok(run("waveEntrance !== null"));
  near(run("level2Pickups[0].y"), 107.5);
  const combatClock = run("combatElapsed");
  let time = 1050;
  while (run("waveEntrance !== null") && time < 3000) {
    const y = run("level2Pickups[0].y");
    const x = run("level2BonusShip.x");
    time += 50;
    const delta = tick(time);
    near(run("level2Pickups[0].y"), y + delta * run("level2ShieldPickupSpeed"));
    near(run("level2BonusShip.x"), x + delta * run("level2BonusShipSpeed"));
  }
  assert.equal(run("waveEntrance"), null);
  assert.equal(run("level2Pickups.length"), 1);
  assert.equal(run("level2ShieldCharges"), run("level2ShieldChargesMax"));
  assert.equal(run("combatElapsed"), combatClock);
  assert.equal(run("level2BonusShipTimer"), 10);
}

armLastAlien(3, 2);
tick(1050);
assert.equal(run("boss.level"), 3);
assert.equal(run("gameState"), "playing");
assert.equal(run("level2BonusShip"), null); // Boss 3 keeps its existing fresh countdown.
near(run("level2Pickups[0].y"), 107.5);
tick(1100);
tick(1150);
near(run("level2Pickups[0].y"), 115);
assert.equal(run("level2Pickups.length"), 1);
assert.equal(run("level2ShieldCharges"), run("level2ShieldChargesMax"));
run("applyBossDamage(boss.health, 1150);");
assert.equal(run("boss.level"), 4);
assert.equal(run("gameState"), "bossIntro");
assert.equal(run("level2Pickups.length"), 0); // Varnok's reveal clears supplies with Boss 3 combat.

console.log("Supply transition checks passed for movement, collection, cleanup, single updates and unchanged boss activation.");
