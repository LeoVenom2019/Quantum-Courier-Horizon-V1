import test from 'node:test';
import assert from 'node:assert/strict';
import { hasBossZeroDefeatEvidence } from './void-boss-achievements.mjs';

test('Boss Zero unlocks immediately from its direct victory flag', () => {
  assert.equal(hasBossZeroDefeatEvidence({
    routeTier: 'Void',
    hasWonEliminateEnemiesRoute3: true,
  }), true);
});

test('later mandatory progression repairs the achievement for advanced saves', () => {
  assert.equal(hasBossZeroDefeatEvidence({
    routeTier: 'Void',
    isRobotRepaired: true,
  }), true);
  assert.equal(hasBossZeroDefeatEvidence({
    routeTier: 'Void',
    isVoidWarActive: true,
  }), true);
  assert.equal(hasBossZeroDefeatEvidence({
    routeTier: 'Earth',
    route4Unlocked: true,
  }), true);
});

test('a new Chapter 3 save does not unlock Boss Zero prematurely', () => {
  assert.equal(hasBossZeroDefeatEvidence({
    routeTier: 'Void',
    route4Unlocked: false,
    hasWonEliminateEnemiesRoute3: false,
    isRobotRepaired: false,
    isVoidWarActive: false,
  }), false);
});
