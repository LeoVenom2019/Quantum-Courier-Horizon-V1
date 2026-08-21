export const SOLAR_INTERSTELLAR_FIRE_CONFIG = Object.freeze({
  common: Object.freeze({ regularIntervalMs: 625, projectileSpeed: 4.2, multiShotChance: 0.35 }),
  elite: Object.freeze({ regularIntervalMs: 625, projectileSpeed: 4.35, multiShotChance: 0.75, specialIntervalMs: 5000 }),
  boss: Object.freeze({ regularIntervalMs: 625, projectileSpeed: 4.6, multiShotChance: 0.85, specialIntervalMs: 3000 }),
});

export const SOLAR_INTERSTELLAR_FIRE_PERFORMANCE = Object.freeze({
  maxActiveEnemyProjectiles: 60,
  staggerWindowMs: 350,
  enemyTrailPoints: 2,
  highProjectilePressure: 12,
  particleBudget: 160,
  highPressureParticleBudget: 120,
  sfxCooldownMs: 120,
  interstellarSkyringExhaustIntervalFrames: 6,
  interstellarSkyringCoreParticles: 1,
  interstellarSkyringPlasmaParticles: 2,
  interstellarSkyringDissipationIntervalFrames: 12,
  interstellarSkyringProjectileTrailIntervalFrames: 4,
});

const NORMAL_COLORS = Object.freeze({
  common: ['#ef4444'],
  elite: ['#fb923c', '#facc15', '#fb923c'],
  bossSolar: ['#facc15', '#fb7185', '#f97316'],
  bossInterstellar: ['#c084fc', '#22d3ee', '#e879f9'],
});

const getEnemyClass = (enemyType) => (
  enemyType === 'Boss' ? 'boss' : enemyType === 'Elite' ? 'elite' : 'common'
);

const buildShots = (angleOffsets, speed, colors, special = false, sizeMultiplier = 1) => angleOffsets.map((angleOffset, index) => ({
  angleOffset,
  speed: special ? speed * 0.92 : speed,
  color: colors[index % colors.length],
  size: special ? 1.35 * sizeMultiplier : 1,
  special,
}));

export const getSolarInterstellarEnemyFireConfig = (enemyType) => (
  SOLAR_INTERSTELLAR_FIRE_CONFIG[getEnemyClass(enemyType)]
);

export const buildSolarInterstellarEnemyVolley = ({
  enemyType,
  routeTier,
  special = false,
  random = Math.random,
}) => {
  const enemyClass = getEnemyClass(enemyType);
  const config = SOLAR_INTERSTELLAR_FIRE_CONFIG[enemyClass];
  const bossColors = routeTier === 'Interstellar' ? NORMAL_COLORS.bossInterstellar : NORMAL_COLORS.bossSolar;
  const specialSizeMultiplier = routeTier === 'Interstellar' ? 0.4 : 1;

  if (special && enemyClass === 'elite') {
    return buildShots([-0.44, -0.22, 0, 0.22, 0.44], config.projectileSpeed, NORMAL_COLORS.elite, true, specialSizeMultiplier);
  }
  if (special && enemyClass === 'boss') {
    return buildShots([-0.66, -0.44, -0.22, 0, 0.22, 0.44, 0.66], config.projectileSpeed, bossColors, true, specialSizeMultiplier);
  }

  const multiShot = random() < config.multiShotChance;
  if (enemyClass === 'common') {
    return buildShots(multiShot ? [-0.28, 0, 0.28] : [0], config.projectileSpeed, NORMAL_COLORS.common);
  }
  if (enemyClass === 'elite') {
    return buildShots(multiShot ? [-0.18, 0, 0.18] : [0], config.projectileSpeed, NORMAL_COLORS.elite);
  }
  return buildShots(multiShot ? [-0.24, 0, 0.24] : [-0.1, 0.1], config.projectileSpeed, bossColors);
};
