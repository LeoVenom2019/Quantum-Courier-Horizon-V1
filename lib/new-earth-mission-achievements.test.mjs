import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getNewEarthMissionCompletionKey,
  getUncountedNewEarthMissionCompletionKeys,
} from './new-earth-mission-achievements.mjs';

const state = (cycle, missions) => ({ cycle, missions });

test('counts every completed mission exactly once within a board cycle', () => {
  const board = state(4, [
    { id: 'mission-a', completed: true },
    { id: 'mission-b', completed: false },
    { id: 'mission-c', completed: true },
  ]);

  assert.deepEqual(
    getUncountedNewEarthMissionCompletionKeys(board, new Set(['4:mission-a'])),
    ['4:mission-c'],
  );
});

test('counts the same mission template again when completed in a later cycle', () => {
  const counted = new Set([getNewEarthMissionCompletionKey(4, 'mission-a')]);

  assert.deepEqual(
    getUncountedNewEarthMissionCompletionKeys(
      state(5, [{ id: 'mission-a', completed: true }]),
      counted,
    ),
    ['5:mission-a'],
  );
});

test('New Earth mission board centrally forwards completed missions to both achievements', async () => {
  const [colonySystem, dashboard, gameData] = await Promise.all([
    readFile(new URL('../components/ColonySystem.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('./game-data.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(colonySystem, /getUncountedNewEarthMissionCompletionKeys\(/);
  assert.match(colonySystem, /type: 'new-earth-mission-completed'/);
  assert.match(dashboard, /next\.missionsCompleted \+= amount/);
  assert.match(dashboard, /updateAchievementProgress\('ne_missions_40', newEarthAchievementMetrics\.missionsCompleted, true\)/);
  assert.match(gameData, /id: 'ne_missions_40'[\s\S]*?target: 40/);
});
