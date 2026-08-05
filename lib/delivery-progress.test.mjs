import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getChapterDeliveryProgress,
  getDeliveriesByTierFromLocations,
  getRemainingDeliveries,
  reconcileHistoryDeliveryStats,
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

test('location counters recover chapter totals without double counting route aliases', () => {
  const routes = [
    { id: 'terra', destination: 'Terra', tier: 'Solar' },
    { id: 'lua', destination: 'Lua', tier: 'Solar' },
    { id: 'alpha-centauri', destination: 'Alpha Centauri', tier: 'Interstellar' },
  ];
  const deliveriesByLocation = {
    Terra: 120,
    terra: 120,
    Lua: 80,
    'Alpha Centauri': 45,
  };

  assert.equal(getDeliveriesByTierFromLocations(deliveriesByLocation, routes, 'Solar'), 200);
  assert.equal(getDeliveriesByTierFromLocations(deliveriesByLocation, routes, 'Interstellar'), 45);
});

test('history reconciliation preserves classified deliveries and restores missing legacy totals', () => {
  const reconciled = reconcileHistoryDeliveryStats({
    historyStats: {
      Solar: {
        deliveries: 5,
        manualDeliveries: 5,
        autoDeliveries: 0,
        qcTotalAcquired: 100,
        qcFromDeliveries: 80,
        qcFromMining: 70,
      },
      Interstellar: { deliveries: 40, manualDeliveries: 12, autoDeliveries: 38 },
    },
    deliveriesByLocation: { Terra: 130, 'Alpha Centauri': 45 },
    routes: [
      { id: 'terra', destination: 'Terra', tier: 'Solar' },
      { id: 'alpha-centauri', destination: 'Alpha Centauri', tier: 'Interstellar' },
    ],
  });

  assert.equal(reconciled.Solar.deliveries, 130);
  assert.equal(reconciled.Solar.manualDeliveries, 5);
  assert.equal(reconciled.Solar.autoDeliveries, 0);
  assert.equal(reconciled.Solar.qcTotalAcquired, 150);
  assert.equal(reconciled.Interstellar.deliveries, 50);
});
