import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('uses the approved shared upgrade-cost curve for every Chapter 4 vehicle', async () => {
  const [submarines, surfaceVehicles] = await Promise.all([
    readFile(new URL('./new-earth-submarines.ts', import.meta.url), 'utf8'),
    readFile(new URL('./new-earth-helicopters.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(
    submarines,
    /getNewEarthSubmarineUpgradeCost = getNewEarthVehicleUpgradeCost/,
  );
  assert.match(
    surfaceVehicles,
    /getNewEarthHelicopterUpgradeCost = getNewEarthVehicleUpgradeCost/,
  );
  assert.match(
    surfaceVehicles,
    /getNewEarthTankUpgradeCost = getNewEarthVehicleUpgradeCost/,
  );

  const {
    NEW_EARTH_VEHICLE_UPGRADE_COSTS,
    getNewEarthVehicleUpgradeCost,
  } = await import('./new-earth-vehicle-upgrade-costs.mjs');

  assert.deepEqual(
    NEW_EARTH_VEHICLE_UPGRADE_COSTS,
    [60_000, 150_000, 300_000, 600_000, 1_000_000],
  );
  assert.deepEqual(
    Array.from({ length: 5 }, (_, level) => getNewEarthVehicleUpgradeCost(level)),
    [60_000, 150_000, 300_000, 600_000, 1_000_000],
  );
});
