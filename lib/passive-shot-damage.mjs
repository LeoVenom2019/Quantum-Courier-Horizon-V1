export const PASSIVE_SHOT_DAMAGE_TIERS = Object.freeze({
  common: Object.freeze({ chance: 0.50, minMultiplier: 1, maxMultiplier: 1, color: '#ffffff', numberSizeMultiplier: 1, numberDurationMultiplier: 1 }),
  brutal: Object.freeze({ chance: 0.25, minMultiplier: 1.5, maxMultiplier: 2.5, color: '#ff1744', numberSizeMultiplier: 1.20, numberDurationMultiplier: 1.10 }),
  insane: Object.freeze({ chance: 0.15, minMultiplier: 2.5, maxMultiplier: 3.5, color: '#00b7ff', numberSizeMultiplier: 1.30, numberDurationMultiplier: 1.15 }),
  divine: Object.freeze({ chance: 0.10, minMultiplier: 4, maxMultiplier: 5, color: '#ffffff', numberSizeMultiplier: 1.40, numberDurationMultiplier: 1.20 }),
});

const clampUnitRandom = (value) => Math.max(0, Math.min(0.999999999, Number(value) || 0));

export const isPassiveShotDamageRoute = (routeTier) => (
  routeTier === 'Solar' || routeTier === 'Interstellar' || routeTier === 'Void'
);

/**
 * Rolls the passive shot bonus used by manual Chapter 1/2 battles and Chapter 3.
 * The first random value selects the tier; a second value selects its multiplier.
 */
export const rollPassiveShotDamage = (baseDamage, random = Math.random) => {
  const normalizedBaseDamage = Math.max(0, Number(baseDamage) || 0);
  const chanceRoll = clampUnitRandom(random());
  const tier = chanceRoll < 0.50
    ? 'common'
    : chanceRoll < 0.75
      ? 'brutal'
      : chanceRoll < 0.90
        ? 'insane'
        : 'divine';
  const config = PASSIVE_SHOT_DAMAGE_TIERS[tier];
  const multiplierRoll = config.minMultiplier === config.maxMultiplier
    ? 0
    : clampUnitRandom(random());
  const multiplier = config.minMultiplier
    + (config.maxMultiplier - config.minMultiplier) * multiplierRoll;

  return {
    tier,
    multiplier,
    damage: normalizedBaseDamage * multiplier,
    color: config.color,
  };
};

export const rollPassiveShotDamageForRoute = (baseDamage, routeTier, random = Math.random) => {
  if (isPassiveShotDamageRoute(routeTier)) return rollPassiveShotDamage(baseDamage, random);
  const normalizedBaseDamage = Math.max(0, Number(baseDamage) || 0);
  return {
    tier: 'common',
    multiplier: 1,
    damage: normalizedBaseDamage,
    color: PASSIVE_SHOT_DAMAGE_TIERS.common.color,
  };
};
