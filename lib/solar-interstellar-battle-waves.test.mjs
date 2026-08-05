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