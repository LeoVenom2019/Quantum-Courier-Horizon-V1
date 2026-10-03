import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDeliveryMissionCompletionProgress,
  getPirateBattleVictoryProgress,
  getReachedSubmarineDepthProgress,
  normalizeAchievementProgressAmount,
} from './achievement-progress.mjs';

test('star warrior counts chapters 1, 2 and every chapter 4 battle victory, but excludes chapter 3', () => {
  assert.equal(getPirateBattleVictoryProgress({
    historyStats: {
      Solar: { battlesWon: 4 },
      Interstellar: { battlesWon: 6 },
      Void: { battlesWon: 50 },
      Earth: { battlesWon: 50 },
    },
    chapter4LandDefenseVictories: 2,
    chapter4SeaDefenseVictories: 3,
    chapter4DirectBattleVictories: 5,
  }), 20);
});

test('delivery mission achievement counts completed unclaimed missions exactly once', () => {
  assert.equal(getDeliveryMissionCompletionProgress({
    historyStats: {
      Solar: { missionsCompleted: 400 },
      Interstellar: { missionsCompleted: 598 },
      Earth: { missionsCompleted: 999 },
    },
    missions: [
      { tier: 'Solar', completed: true, claimed: false },
      { tier: 'Interstellar', completed: true },
      { tier: 'Solar', completed: false },
      { tier: 'Earth', completed: true },
    ],
  }), 1000);
});

test('submarine depth achievement uses reached depth instead of vehicle capacity', () => {
  assert.equal(getReachedSubmarineDepthProgress({ maxSubmarineDepth: 8000 }), 8000);
  assert.equal(getReachedSubmarineDepthProgress({ maxSubmarineDepth: 10000 }), 10000);
});

test('achievement progress normalization rejects invalid and negative values', () => {
  assert.equal(normalizeAchievementProgressAmount(Number.NaN), 0);
  assert.equal(normalizeAchievementProgressAmount(-15), 0);
  assert.equal(normalizeAchievementProgressAmount('25'), 25);
});
