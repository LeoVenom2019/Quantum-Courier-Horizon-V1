import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getChapterDeliveryProgress,
  getRemainingDeliveries,
  reconcileTotalDeliveries,
} from './delivery-progress.mjs';

test('chapter 1 uses Solar history and reports the remaining deliveries', () => {
  const current = getChapterDeliveryProgress({
    totalDeliveries: 0,
    historyStats: { Solar: { deliveries: 725 } },
  });

  assert.equal(current, 725);
  assert.equal(getRemainingDeliveries(current, 1500), 775);
});

test('chapter 2 combines Solar and Interstellar delivery history', () => {
  const current = getChapterDeliveryProgress({
    totalDeliveries: 0,
    historyStats: {
      Solar: { deliveries: 1500 },
      Interstellar: { deliveries: 2100 },
    },
    includeInterstellar: true,
  });

  assert.equal(current, 3600);
  assert.equal(getRemainingDeliveries(current, 5000), 1400);
});

test('legacy global total is preserved when route history is incomplete', () => {
  assert.equal(getChapterDeliveryProgress({
    totalDeliveries: 2400,
    historyStats: { Solar: { deliveries: 1500 } },
    includeInterstellar: true,
  }), 2400);
});

test('save reconciliation restores a missing global total from history', () => {
  assert.equal(reconcileTotalDeliveries(0, {
    Solar: { deliveries: 1500 },
    Interstellar: { deliveries: 3500 },
  }), 5000);
});
