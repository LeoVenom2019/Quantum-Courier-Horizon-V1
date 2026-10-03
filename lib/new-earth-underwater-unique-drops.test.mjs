import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('underwater exploration excludes collected and already rolled museum items', async () => {
  const source = await readFile(
    new URL('../components/NewEarthUnderwaterBattle.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /collectedTreasureIds\?: string\[\]/);
  assert.match(source, /claimedTreasureIdsRef\.current = new Set\(ownedTreasureIdsRef\.current\)/);
  assert.ok(
    (source.match(/excludeCollectedUnderwaterTreasures\(/g) || []).length >= 6,
    'all chest and enemy item pools should exclude claimed treasures',
  );
  assert.match(source, /claimedTreasureIdsRef\.current\.add\(relic\.id\)/);
  assert.match(source, /claimedTreasureIdsRef\.current\.add\(enemyLoot\.relic\.id\)/);
  assert.match(source, /else if \(rarity !== 'normal'\) \{[\s\S]*?rewardType = 'qc';/);
});

test('dashboard passes the global museum collection into underwater exploration', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /const newEarthMuseumTreasureIds = useMemo\(/);
  assert.match(dashboard, /collectedTreasureIds=\{newEarthMuseumTreasureIds\}/);
});
