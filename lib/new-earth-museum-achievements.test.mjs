import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSources = async () => Promise.all([
  readFile(new URL('./game-data.ts', import.meta.url), 'utf8'),
  readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
  import('./new-earth-treasures.ts'),
]);

test('museum catalog contains the expected 47 unique collectibles', async () => {
  const [, , treasures] = await readSources();
  const catalog = treasures.NEW_EARTH_TREASURE_CATALOG;

  assert.equal(treasures.NEW_EARTH_RARE_FISH_TREASURES.length, 17);
  assert.equal(treasures.NEW_EARTH_RELIC_TREASURES.length, 20);
  assert.equal(treasures.NEW_EARTH_RARE_RING_TREASURES.length, 10);
  assert.equal(catalog.length, 47);
  assert.equal(new Set(catalog.map(item => item.id)).size, 47);
});

test('museum achievements expose real category progress and full completion', async () => {
  const [gameData, dashboard] = await readSources();

  assert.match(gameData, /id: 'ne_rare_fish_all'[\s\S]*?target: 17/);
  assert.match(gameData, /id: 'ne_relics_all'[\s\S]*?target: 20/);
  assert.match(gameData, /id: 'ne_rare_rings_all'[\s\S]*?target: 10/);
  assert.match(gameData, /id: 'ne_museum_all'[\s\S]*?target: 47/);
  assert.match(dashboard, /updateAchievementProgress\('ne_rare_fish_all', rareFishFound, true\)/);
  assert.match(dashboard, /updateAchievementProgress\('ne_relics_all', relicsFound, true\)/);
  assert.match(dashboard, /updateAchievementProgress\('ne_rare_rings_all', rareRingsFound, true\)/);
  assert.match(dashboard, /updateAchievementProgress\('ne_museum_all', museumTotalFound, true\)/);
  assert.match(dashboard, /newEarthMuseumTreasures,[\s\S]*?\]\);[\s\S]*?useEffect\([\s\S]*?syncAchievements\(\);[\s\S]*?syncAchievements/);
});
