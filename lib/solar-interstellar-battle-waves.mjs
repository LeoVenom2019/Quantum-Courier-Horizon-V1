export const SOLAR_INTERSTELLAR_WAVE_COUNT = 10;

const REGULAR_WAVE_TARGET_HITS = Object.freeze([3, 3, 4, 3.5, 4, 5, 4, 4.5, 5]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const buildSolarInterstellarWaveBlueprints = ({
  enemyMaxHp,
  enemyDps,
  reward,
  playerDamage,
  critChance = 0,
  criticalDamage,
}) => {
  const baseDamage = Math.max(1, Number(enemyDps) || 10);
  const baseShotDamage = Math.max(1, Number(playerDamage) || 10);
  const normalizedCritChance = clamp(Number(critChance) || 0, 0, 1);
  const criticalShotDamage = Math.max(baseShotDamage, Number(criticalDamage) || baseShotDamage * 2);
  const expectedShotDamage = baseShotDamage * (1 - normalizedCritChance) + criticalShotDamage * normalizedCritChance;
  const totalReward = Math.max(0, Number(reward) || 0);
  const originalEnemyHits = Math.max(1, (Number(enemyMaxHp) || baseShotDamage) / baseShotDamage);

  return Array.from({ length: SOLAR_INTERSTELLAR_WAVE_COUNT }, (_, index) => {
    const wave = index + 1;
    const isBoss = wave === SOLAR_INTERSTELLAR_WAVE_COUNT;
    const isElite = !isBoss && wave % 3 === 0;
    const targetHits = isBoss
      ? clamp(Math.round(originalEnemyHits), 7, 12)
      : REGULAR_WAVE_TARGET_HITS[index];
    const minimumHp = normalizedCritChance > 0 ? criticalShotDamage + 1 : baseShotDamage + 1;
    const maximumRegularHp = baseShotDamage * 5;
    const hp = Math.ceil(isBoss
      ? Math.max(targetHits * expectedShotDamage, criticalShotDamage * 3 + 1)
      : clamp(targetHits * expectedShotDamage, minimumHp, maximumRegularHp));

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
    };
  });
};