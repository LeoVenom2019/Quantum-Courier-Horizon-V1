import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('spawns the submarine boss after three normal kills only at the final depth', async () => {
  const source = await readFile(
    new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const BOSS_HEALTH_MULTIPLIER = 3/);
  assert.match(source, /const BOSS_SIZE_MULTIPLIER = 2/);
  assert.match(source, /const BOSS_FIRE_RATE_MULTIPLIER = 2/);
  assert.match(source, /const BOSS_MAX_ACTIVE_TORPEDOES = 2/);
  assert.match(
    source,
    /if \(state\.kills >= TARGET_KILLS\) \{[\s\S]*?const bossRequired = !nextDepthMeters;[\s\S]*?spawnEnemy\(true\);/,
  );
  assert.match(source, /if \(!bossRequired \|\| state\.bossDefeated\) \{/);
});

test('boss rewards use only QC, rings and relics', async () => {
  const source = await readFile(
    new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url),
    'utf8',
  );
  const bossLootBlock = source.match(/const bossLoot = rollNewEarthUnderwaterBossLoot\(\{([\s\S]*?)\}\);/)?.[1] || '';

  assert.match(bossLootBlock, /rareRings: excludeCollectedUnderwaterTreasures\([\s\S]*?NEW_EARTH_TREASURES_BY_RARITY\.legendary/);
  assert.match(bossLootBlock, /relics: excludeCollectedUnderwaterTreasures\([\s\S]*?NEW_EARTH_TREASURES_BY_RARITY\.rare/);
  assert.doesNotMatch(bossLootBlock, /rareFish/);
});
