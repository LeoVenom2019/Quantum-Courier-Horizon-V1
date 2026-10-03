import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPassiveShotDamageRoute,
  rollPassiveShotDamage,
  rollPassiveShotDamageForRoute,
} from './passive-shot-damage.mjs';

const sequence = (...values) => {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
};

test('uses the requested probability boundaries', () => {
  assert.equal(rollPassiveShotDamage(100, sequence(0.00)).tier, 'common');
  assert.equal(rollPassiveShotDamage(100, sequence(0.499999)).tier, 'common');
  assert.equal(rollPassiveShotDamage(100, sequence(0.50, 0)).tier, 'brutal');
  assert.equal(rollPassiveShotDamage(100, sequence(0.75, 0)).tier, 'insane');
  assert.equal(rollPassiveShotDamage(100, sequence(0.90, 0)).tier, 'divine');
});

test('uses the requested multiplier ranges', () => {
  assert.equal(rollPassiveShotDamage(100, sequence(0.2)).damage, 100);
  assert.equal(rollPassiveShotDamage(100, sequence(0.5, 0)).damage, 150);
  assert.ok(Math.abs(rollPassiveShotDamage(100, sequence(0.6, 0.999999999)).damage - 250) < 0.000001);
  assert.equal(rollPassiveShotDamage(100, sequence(0.75, 0)).damage, 250);
  assert.ok(Math.abs(rollPassiveShotDamage(100, sequence(0.8, 0.999999999)).damage - 350) < 0.000001);
  assert.equal(rollPassiveShotDamage(100, sequence(0.9, 0)).damage, 400);
  assert.ok(Math.abs(rollPassiveShotDamage(100, sequence(0.95, 0.999999999)).damage - 500) < 0.000001);
});

test('returns the floating-number color for every tier', () => {
  assert.equal(rollPassiveShotDamage(10, sequence(0.1)).color, '#ffffff');
  assert.equal(rollPassiveShotDamage(10, sequence(0.5, 0)).color, '#ff1744');
  assert.equal(rollPassiveShotDamage(10, sequence(0.75, 0)).color, '#00b7ff');
  assert.equal(rollPassiveShotDamage(10, sequence(0.9, 0)).color, '#ffffff');
});

test('uses the requested floating-number size and duration by tier', async () => {
  const { PASSIVE_SHOT_DAMAGE_TIERS } = await import('./passive-shot-damage.mjs');
  assert.deepEqual(
    Object.fromEntries(Object.entries(PASSIVE_SHOT_DAMAGE_TIERS).map(([tier, config]) => [tier, [config.numberSizeMultiplier, config.numberDurationMultiplier]])),
    {
      common: [1, 1],
      brutal: [1.2, 1.1],
      insane: [1.3, 1.15],
      divine: [1.4, 1.2],
    },
  );
});

test('enables Chapters 1, 2 and 3 while leaving Chapter 4 unchanged', () => {
  assert.equal(isPassiveShotDamageRoute('Solar'), true);
  assert.equal(isPassiveShotDamageRoute('Interstellar'), true);
  assert.equal(isPassiveShotDamageRoute('Void'), true);
  assert.equal(isPassiveShotDamageRoute('Earth'), false);

  const earthDamage = rollPassiveShotDamageForRoute(100, 'Earth', sequence(0.95, 0.99));
  assert.deepEqual(earthDamage, {
    tier: 'common',
    multiplier: 1,
    damage: 100,
    color: '#ffffff',
  });
});
