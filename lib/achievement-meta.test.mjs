import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeAchievementMetaForCatalog } from './achievement-meta.mjs';

test('achievement metadata keeps only unique catalog entries and safe progress', () => {
  assert.deepEqual(normalizeAchievementMetaForCatalog({
    unlockedAchievements: ['valid-a', 'removed-id', 'valid-a', null],
    achievementProgress: {
      'valid-a': 4,
      'valid-b': -8,
      'removed-id': 999,
      invalid: Number.NaN,
    },
  }, ['valid-a', 'valid-b']), {
    unlockedAchievements: ['valid-a'],
    achievementProgress: {
      'valid-a': 4,
      'valid-b': 0,
    },
  });
});
