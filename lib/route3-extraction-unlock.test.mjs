import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { getExtractionUnlockProgress } from './extraction-unlock-progress.mjs';

const points = Array.from({ length: 9 }, (_, index) => ({
  id: `ext-${index + 1}`,
  tier: 'Interstellar',
}));

test('requires every Interstellar extraction point for completion', () => {
  const incomplete = getExtractionUnlockProgress(points, points.slice(0, 8).map(point => point.id));
  const complete = getExtractionUnlockProgress(points, points.map(point => point.id));

  assert.deepEqual(incomplete, { unlocked: 8, total: 9, progress: 8 / 9 * 100, allUnlocked: false });
  assert.deepEqual(complete, { unlocked: 9, total: 9, progress: 100, allUnlocked: true });
});

test('route 3 rule and goals modal consume the same extraction progress', async () => {
  const dashboard = await readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8');

  assert.match(dashboard, /if \(!extractionUnlockProgress\.allUnlocked\) return false/);
  assert.match(dashboard, /id: 'extractionPoints'/);
  assert.match(dashboard, /label: t\('unlockAllExtractionPoints'\)/);
});
