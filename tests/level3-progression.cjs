const assert = require("node:assert/strict");
const { game, run, setLayoutRoll } = require("./game-harness.cjs");

run("Math.random = () => 0.99;");

for (const difficulty of ["easy", "hard", "ridiculous"]) {
  for (const wave of [1, 2]) {
    for (const [shape, roll] of [["Grid", 0], ["Chevron", 0x80000000], ["Staggered", 0xffffffff]]) {
      setLayoutRoll(roll);
      for (const slot of [0, 2, 12, 18, 20, 23]) {
        run(`restartGame(); startLevel3(); selectedDifficulty = "${difficulty}"; currentWave = ${wave};
          enemies.length = 0; createEnemies(); enemies.splice(${slot} + 1); enemies.splice(0, ${slot});
          player.x = -200; player.y = playerMaxY;
          for (let step = 0; step < 1600; step += 1) {
            level2BomberTimer = 100;
            updateEnemies(0.05, 1000);
          }
        `);
        const scenario = `${difficulty}, Wave ${wave}, ${shape}, slot ${slot}`;
        assert.equal(run("regularFormation.shape"), shape, scenario);
        assert.equal(run("gameState"), "playing", scenario);
        assert.equal(run("enemies.length"), 1, scenario);
        assert.ok(run("enemies[0].x >= 15 - 1e-7 && enemies[0].x <= canvas.width - 15 + 1e-7"), scenario);
        assert.ok(run(`regularFormation.slots.every(slot => slot.y + level3FormationDescentOffset + enemySize / 2
          <= playerMaxY - player.height / 2 - playerShotMuzzleOffset + 1e-7)`), scenario);

        run("player.x = enemies[0].x;");
        assert.equal(run("level3FormationCollidesWithPlayer()"), false, scenario);
        run(`keysDown.add("space"); updateShots(0, 3000); keysDown.clear();
          for (let time = 3050; enemies.length === 1 && time <= 4500; time += 50) {
            updateShots(0.05, time);
            handleShotCollisions(0.05, time);
          }
        `);
        assert.equal(run("score"), 10, scenario);
        if (wave === 1) {
          assert.equal(run("currentWave"), 2, scenario);
          assert.ok(run("waveEntrance !== null"), scenario);
        } else {
          assert.equal(run("boss.level"), 3, scenario);
        }
      }
    }
  }
}

run(`restartGame(); startLevel3(); enemies.length = 1;
  Object.assign(enemies[0], { x: 700, y: player.y, formationSlot: 0 });
  level2BomberTimer = 0; updateLevel2Bomber(0.05, 1000);
`);
assert.equal(run("level2Bomber"), null);

for (const wave of [1, 2]) {
  for (const roll of [0, 0x80000000, 0xffffffff]) {
    setLayoutRoll(roll);
    for (const [x, y, vx, vy] of [[-30, 500, -200, 1], [830, 500, 200, 1], [400, -30, 0, -200], [450, 630, 10, 200]]) {
      run(`restartGame(); startLevel3(); selectedDifficulty = "ridiculous"; currentWave = ${wave};
        enemies.length = 0; createEnemies(); enemies.length = 1;
        level3FormationDescentOffset = playerMaxY - player.height / 2 - playerShotMuzzleOffset - regularFormation.bottom;
        level2Bomber = enemies[0];
        Object.assign(level2Bomber, {
          x: ${x}, y: ${y}, diveVelocityX: ${vx}, diveVelocityY: ${vy}, formationSlot: null, bomberState: "dive",
        });
        previousFrameTime = 1000;
      `);
      game.gameLoop(4000); // A long frame still takes the normal capped simulation step.
      assert.equal(run("enemies[0].bomberState"), "return");
      assert.ok(run("Number.isInteger(enemies[0].formationSlot)"));
      for (let time = 4100; run('enemies[0].bomberState === "return"') && time <= 9000; time += 100) {
        game.gameLoop(time);
      }
      assert.equal(run("enemies[0].bomberState"), undefined);
      assert.equal(run("enemies.length"), 1);
      assert.ok(run("enemies[0].y + enemySize / 2 <= playerMaxY - player.height / 2 - playerShotMuzzleOffset + 1e-7"));
    }
  }
}

run("restartGame(); startLevel3(); Object.assign(enemies[0], { x: player.x, y: player.y }); updateEnemies(0, 1000);");
assert.equal(run("gameState"), "loss");
console.log("Level 3 progression passed for all layouts, waves and difficulties, including 108 survivor cases and long-frame diver returns.");
