import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSolarInterstellarEnemyVolley,
  getSolarInterstellarEnemyFireConfig,
  SOLAR_INTERSTELLAR_FIRE_PERFORMANCE,
} from './solar-interstellar-enemy-fire.mjs';

test('doubles regular firing frequency and increases projectile speed', () => {
  for (const type of ['Padrão', 'Elite', 'Boss']) {
    const config = getSolarInterstellarEnemyFireConfig(type);
    assert.equal(config.regularIntervalMs, 625);
    assert.ok(config.projectileSpeed > 3);
  }
});

test('common enemies can fire in several directions', () => {
  const multi = buildSolarInterstellarEnemyVolley({ enemyType: 'Padrão', routeTier: 'Solar', random: () => 0 });
  const single = buildSolarInterstellarEnemyVolley({ enemyType: 'Padrão', routeTier: 'Solar', random: () => 0.99 });
  assert.deepEqual(multi.map((shot) => shot.angleOffset), [-0.28, 0, 0.28]);
  assert.equal(single.length, 1);
});

test('elite enemies have a high multi-shot chance and five-shot special arcs', () => {
  const config = getSolarInterstellarEnemyFireConfig('Elite');
  const regular = buildSolarInterstellarEnemyVolley({ enemyType: 'Elite', routeTier: 'Solar', random: () => 0.7 });
  const special = buildSolarInterstellarEnemyVolley({ enemyType: 'Elite', routeTier: 'Solar', special: true });
  assert.equal(config.multiShotChance, 0.75);
  assert.equal(config.specialIntervalMs, 5000);
  assert.equal(regular.length, 3);
  assert.equal(special.length, 5);
  assert.equal(special.every((shot) => shot.special), true);
});

test('bosses fire broader arcs more often with chapter-specific colors', () => {
  const config = getSolarInterstellarEnemyFireConfig('Boss');
  const solar = buildSolarInterstellarEnemyVolley({ enemyType: 'Boss', routeTier: 'Solar', special: true });
  const interstellar = buildSolarInterstellarEnemyVolley({ enemyType: 'Boss', routeTier: 'Interstellar', special: true });
  assert.equal(config.specialIntervalMs, 3000);
  assert.equal(solar.length, 7);
  assert.equal(interstellar.length, 7);
  assert.notDeepEqual(solar.map((shot) => shot.color), interstellar.map((shot) => shot.color));
});

test('reduces only the visual size of Chapter 2 special arcs by 60 percent', () => {
  for (const enemyType of ['Elite', 'Boss']) {
    const solar = buildSolarInterstellarEnemyVolley({ enemyType, routeTier: 'Solar', special: true });
    const interstellar = buildSolarInterstellarEnemyVolley({ enemyType, routeTier: 'Interstellar', special: true });
    assert.equal(interstellar[0].size, solar[0].size * 0.4);
    assert.deepEqual(interstellar.map((shot) => shot.angleOffset), solar.map((shot) => shot.angleOffset));
    assert.deepEqual(interstellar.map((shot) => shot.speed), solar.map((shot) => shot.speed));
  }
});

test('defines bounded rendering budgets without changing combat values', () => {
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.maxActiveEnemyProjectiles, 60);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.enemyTrailPoints, 2);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.particleBudget, 160);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.highPressureParticleBudget, 120);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringExhaustIntervalFrames, 6);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringCoreParticles, 1);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringPlasmaParticles, 2);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringDissipationIntervalFrames, 12);
  assert.equal(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.interstellarSkyringProjectileTrailIntervalFrames, 4);
  assert.ok(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.staggerWindowMs > 0);
  assert.ok(SOLAR_INTERSTELLAR_FIRE_PERFORMANCE.sfxCooldownMs > 0);
});
