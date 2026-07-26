import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('plays the dedicated SFX once when Robot Runner kills a ghost', async () => {
  const [robotRunner, preloader] = await Promise.all([
    readFile(new URL('../public/mini-games/robot-runner/script.js', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await access(
    new URL('../public/assets/games/flipers_sfx/ghost_dead_rr.ogg', import.meta.url),
  );

  assert.match(robotRunner, /ghostDead: [^\n]*ghost_dead_rr\.ogg/);
  assert.match(
    robotRunner,
    /if \(player\.isPowered\) \{[\s\S]*?g\.dead = true;[\s\S]*?playSfx\(SFX\.ghostDead,[\s\S]*?\}/,
  );
  assert.equal(robotRunner.match(/playSfx\(SFX\.ghostDead,/g)?.length, 1);
  assert.match(preloader, /'ghost_dead_rr'/);
});

test('plays the dedicated SFX once when Robot Runner collects a small point pellet', async () => {
  const [robotRunner, preloader] = await Promise.all([
    readFile(new URL('../public/mini-games/robot-runner/script.js', import.meta.url), 'utf8'),
    readFile(new URL('./asset-preloader.ts', import.meta.url), 'utf8'),
  ]);

  await access(
    new URL('../public/assets/games/flipers_sfx/robot_get_points.ogg', import.meta.url),
  );

  assert.match(robotRunner, /getPoints: [^\n]*robot_get_points\.ogg/);
  assert.match(
    robotRunner,
    /if \(map\[gy\]\[gx\] === 2\) \{[\s\S]*?map\[gy\]\[gx\] = 0;[\s\S]*?playSfx\(SFX\.getPoints,[\s\S]*?\}/,
  );
  assert.equal(robotRunner.match(/playSfx\(SFX\.getPoints,/g)?.length, 1);
  assert.match(preloader, /'robot_get_points'/);
});
