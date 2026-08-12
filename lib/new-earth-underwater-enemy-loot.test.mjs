import assert from 'node:assert/strict';
import test from 'node:test';

import {
  NEW_EARTH_UNDERWATER_ENEMY_QC_MAX,
  NEW_EARTH_UNDERWATER_ENEMY_QC_MIN,
  rollNewEarthUnderwaterEnemyLoot,
} from './new-earth-underwater-enemy-loot.mjs';

const catalogs = {
  rareRings: ['ring-a', 'ring-b'],
  rareFish: ['fish-a', 'fish-b'],
  relics: ['relic-a', 'relic-b'],
};

const sequence = (...values) => {
  let index = 0;
  return () => values[index++] ?? 0;
};

test('uses five mutually exclusive 20% enemy-loot bands', () => {
  assert.equal(rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.00, 0.00)).type, 'qc');
  assert.deepEqual(rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.20, 0.75)), { type: 'relic', amount: 1, relic: 'ring-b' });
  assert.deepEqual(rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.40, 0.75)), { type: 'relic', amount: 1, relic: 'fish-b' });
  assert.deepEqual(rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.60, 0.75)), { type: 'relic', amount: 1, relic: 'relic-b' });
  assert.deepEqual(rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.80)), { type: 'none', amount: 0 });
});

test('awards QC throughout the inclusive 1M to 3M range', () => {
  assert.deepEqual(
    rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.10, 0.00)),
    { type: 'qc', amount: NEW_EARTH_UNDERWATER_ENEMY_QC_MIN },
  );
  assert.deepEqual(
    rollNewEarthUnderwaterEnemyLoot(catalogs, sequence(0.10, 1.00)),
    { type: 'qc', amount: NEW_EARTH_UNDERWATER_ENEMY_QC_MAX },
  );
});
