import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SOLAR_INTERSTELLAR_WAVE_COUNT,
  buildSolarInterstellarWaveBlueprints,
} from './solar-interstellar-battle-waves.mjs';

const createWaves = (overrides = {}) => buildSolarInterstellarWaveBlueprints({
  enemyMaxHp: 1000,
  enemyDps: 20,
  reward: 500,
  playerDamage: 100,
  critChance: 0,
  criticalDamage: 200,
  ...overrides,
});

test('creates nine sequential enemies followed by one boss', () => {
  const waves = createWaves();

  assert.equal(waves.length, SOLAR_INTERSTELLAR_WAVE_COUNT);
  assert.equal(waves.slice(0, 9).every((wave) => wave.isBoss === false), true);
  assert.equal(waves[9].isBoss, true);
  assert.equal(waves[9].type, 'Boss');
});

test('keeps regular enemies between two and five shots when critical hits are enabled', () => {
  const playerDamage = 100;
  const criticalDamage = 200;
  const waves = createWaves({ playerDamage, criticalDamage, critChance: 0.25 });

  for (const wave of waves.slice(0, 9)) {
    assert.ok(Math.ceil(wave.maxHp / playerDamage) <= 5);
    assert.ok(Math.ceil(wave.maxHp / criticalDamage) >= 2);
  }
});

test('pays the original reward only once on the boss wave', () => {
  const waves = createWaves({ reward: 12345 });

  assert.equal(waves.reduce((sum, wave) => sum + wave.qc, 0), 12345);
  assert.equal(waves.slice(0, 9).every((wave) => wave.qc === 0), true);
  assert.equal(waves[9].qc, 12345);
});

test('makes the final boss sturdier and stronger than every regular wave', () => {
  const waves = createWaves();
  const strongestRegular = Math.max(...waves.slice(0, 9).map((wave) => wave.maxHp));

  assert.ok(waves[9].maxHp > strongestRegular);
  assert.ok(waves[9].damage > waves[0].damage);
  assert.ok(waves[9].visualScale > waves[0].visualScale);
});
test('randomizes enemy spawn positions inside the combat area', () => {
  const randomValues = [0.9, 0, 0, 0.9, 1, 1];
  let index = 0;
  const waves = createWaves({ random: () => randomValues[index++ % randomValues.length] });

  assert.ok(waves.every((wave) => wave.x >= 68 && wave.x <= 92));
  assert.ok(waves.every((wave) => wave.y >= 16 && wave.y <= 84));
  assert.notDeepEqual([waves[0].x, waves[0].y], [waves[1].x, waves[1].y]);
});

test('allows non-overlapping two-ship waves while keeping the boss solo', () => {
  const waves = createWaves({ random: () => 0 });

  assert.equal(waves[0].spawnWithNext, true);
  assert.equal(waves[1].spawnWithNext, false);
  assert.equal(waves.at(-1).spawnWithNext, false);
});
