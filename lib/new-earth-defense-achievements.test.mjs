import test from 'node:test';
import assert from 'node:assert/strict';
import { getNewEarthDefenseAchievementProgress } from './new-earth-defense-achievements.mjs';

test('land and sea defense victories remain category-specific', () => {
  assert.deepEqual(getNewEarthDefenseAchievementProgress({
    landDefenseVictories: 3,
    seaDefenseVictories: 2,
    directBattleVictories: 0,
  }), {
    land: 3,
    sea: 2,
  });
});

test('every direct battle victory counts toward both defense achievements', () => {
  assert.deepEqual(getNewEarthDefenseAchievementProgress({
    landDefenseVictories: 3,
    seaDefenseVictories: 2,
    directBattleVictories: 4,
  }), {
    land: 7,
    sea: 6,
  });
});

test('invalid or negative saved metrics cannot reduce achievement progress', () => {
  assert.deepEqual(getNewEarthDefenseAchievementProgress({
    landDefenseVictories: -3,
    seaDefenseVictories: Number.NaN,
    directBattleVictories: -8,
  }), {
    land: 0,
    sea: 0,
  });
});
