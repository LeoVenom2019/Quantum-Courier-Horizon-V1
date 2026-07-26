import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('does not keep the unused colony population capacity field', async () => {
  const colonySystem = await readFile(
    new URL('../components/ColonySystem.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(colonySystem, /maxPopulation/);
  assert.doesNotMatch(colonySystem, /INITIAL_POP_CAPACITY/);
});

test('keeps the faster population curve used by the original Chapter 4 balance', async () => {
  const dashboard = await readFile(
    new URL('../components/GameDashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /calculateNewEarthAnnualPopulationGrowth/);

  const { calculateNewEarthAnnualPopulationGrowth } = await import(
    './new-earth-population-growth.mjs'
  );

  assert.equal(calculateNewEarthAnnualPopulationGrowth(1_000_000, 1, () => 0).growth, 50_000);
  assert.equal(calculateNewEarthAnnualPopulationGrowth(1_000_000, 6, () => 0).growth, 30_000);
  assert.equal(calculateNewEarthAnnualPopulationGrowth(1_000_000, 9, () => 0).growth, 60_000);
  assert.equal(calculateNewEarthAnnualPopulationGrowth(100_000_000_000, 20, () => 0.5).growth, 400_000_000);

  let population = 12_500;
  for (let year = 1; year <= 285; year += 1) {
    population = Math.ceil(
      population + calculateNewEarthAnnualPopulationGrowth(population, year, () => 0.5).growth,
    );
  }

  assert.ok(population >= 100_000_000_000);
});