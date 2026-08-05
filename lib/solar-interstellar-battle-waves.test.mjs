import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SOLAR_INTERSTELLAR_WAVE_COUNT,
  buildSolarInterstellarWaveBlueprints,
} from './solar-interstellar-battle-waves.mjs';

test('creates nine sequential enemies followed by one boss', () => {
  const waves = buildSolarInterstellarWaveBlueprints({ enemyMaxHp: 1000, enemyDps: 20, reward: 500 });

  assert.equal(waves.length, SOLAR_INTERSTELLAR_WAVE_COUNT);
  assert.equal(waves.slice(0, 9).every((wave) => wave.isBoss === false), true);
  assert.equal(waves[9].isBoss, true);
  assert.equal(waves[9].type, 'Boss');
});

test('preserves the original total health and pays the original reward only once', () => {
  const waves = buildSolarInterstellarWaveBlueprints({ enemyMaxHp: 347, enemyDps: 18, reward: 12345 });

  assert.equal(waves.reduce((sum, wave) => sum + wave.maxHp, 0), 347);
  assert.equal(waves.reduce((sum, wave) => sum + wave.qc, 0), 12345);
  assert.equal(waves.slice(0, 9).every((wave) => wave.qc === 0), true);
  assert.equal(waves[9].qc, 12345);
});

test('makes the final boss sturdier and stronger than a regular wave', () => {
  const waves = buildSolarInterstellarWaveBlueprints({ enemyMaxHp: 1000, enemyDps: 20, reward: 500 });

  assert.ok(waves[9].maxHp > waves[0].maxHp * 4);
  assert.ok(waves[9].damage > waves[0].damage);
  assert.ok(waves[9].visualScale > waves[0].visualScale);
});
