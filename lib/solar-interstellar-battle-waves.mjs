export const SOLAR_INTERSTELLAR_WAVE_COUNT = 10;

export const SOLAR_INTERSTELLAR_ENEMY_HP = Object.freeze({
  Solar: Object.freeze({ common: 1500, elite: 2500, boss: 4000 }),
  Interstellar: Object.freeze({ common: 2625, elite: 4375, boss: 7000 }),
});

export const buildSolarInterstellarWaveBlueprints = ({
  enemyDps,
  reward,
  routeTier = 'Solar',
  random = Math.random,
}) => {
  const baseDamage = Math.max(1, Number(enemyDps) || 10);
  const totalReward = Math.max(0, Number(reward) || 0);
  const hpByType = SOLAR_INTERSTELLAR_ENEMY_HP[routeTier] || SOLAR_INTERSTELLAR_ENEMY_HP.Solar;

  let previousWaveStartsPair = false;

  return Array.from({ length: SOLAR_INTERSTELLAR_WAVE_COUNT }, (_, index) => {
    const wave = index + 1;
    const isBoss = wave === SOLAR_INTERSTELLAR_WAVE_COUNT;
    const isElite = !isBoss && wave % 3 === 0;
    const hp = isBoss ? hpByType.boss : (isElite ? hpByType.elite : hpByType.common);

    const startsPair = index < SOLAR_INTERSTELLAR_WAVE_COUNT - 2
      && !previousWaveStartsPair
      && random() < 0.3;
    const x = Math.round(68 + random() * 24);
    const y = Math.round(16 + random() * 68);
    previousWaveStartsPair = startsPair;

    return {
      wave,
      isBoss,
      type: isBoss ? 'Boss' : (isElite ? 'Elite' : 'Padrão'),
      hp,
      maxHp: hp,
      damage: Math.max(1, Math.round(baseDamage * (isBoss ? 1.25 : (isElite ? 1 : 0.9)))),
      qc: isBoss ? totalReward : 0,
      visualScale: isBoss ? 1.4 : (isElite ? 1.08 : 0.94 + (index % 3) * 0.04),
      spawnDelayMs: isBoss ? 1150 : 650,
      x,
      trackingOffsetY: index % 2 === 0 ? -8 : 8,
      y,
      spawnWithNext: startsPair,
    };
  });
};
