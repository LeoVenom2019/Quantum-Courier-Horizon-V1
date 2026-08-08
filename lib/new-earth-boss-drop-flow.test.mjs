import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NEW_EARTH_DOUBLE_BOSS_DOCUMENT_CHANCE,
  getNewEarthBossDocumentDropCount,
} from './new-earth-boss-drop-flow.mjs';

test('uses an exact 35% threshold for double boss documents', () => {
  assert.equal(NEW_EARTH_DOUBLE_BOSS_DOCUMENT_CHANCE, 0.35);
  assert.equal(getNewEarthBossDocumentDropCount(() => 0), 2);
  assert.equal(getNewEarthBossDocumentDropCount(() => 0.349999), 2);
  assert.equal(getNewEarthBossDocumentDropCount(() => 0.35), 1);
  assert.equal(getNewEarthBossDocumentDropCount(() => 0.999999), 1);
});
