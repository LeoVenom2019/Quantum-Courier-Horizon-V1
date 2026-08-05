export const SOLAR_INTERSTELLAR_WAVE_COUNT = 10;

const WAVE_WEIGHTS = Object.freeze([
  0.075, 0.075, 0.075,
  0.075, 0.075, 0.075,
  0.075, 0.075, 0.075,
  0.325,
]);

const distributeIntegerBudget = (rawTotal, weights) => {
  const total = Math.max(weights.length, Math.round(Number(rawTotal) || weights.length));
  const exact = weights.map((weight) => total * weight);
  const values = exact.map((value) => Math.max(1, Math.floor(value)));
  let remaining = total - values.reduce((sum, value) => sum + value, 0);

  const priority = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || b.index - a.index);

  for (let cursor = 0; remaining > 0; cursor += 1) {
    values[priority[cursor % priority.length].index] += 1;
    remaining -= 1;
  }

  for (let cursor = priority.length - 1; remaining < 0; cursor -= 1) {
    const target = priority[(cursor + priority.length) % priority.length].index;
    if (values[target] > 1) {
      values[target] -= 1;
      remaining += 1;
    }
  }

  return values;
};

export const buildSolarInterstellarWaveBlueprints = ({
  enemyMaxHp,
  enemyDps,
  reward,
}) => {
  const hpByWave = distributeIntegerBudget(enemyMaxHp, WAVE_WEIGHTS);
  const baseDamage = Math.max(1, Number(enemyDps) || 10);
  const totalReward = Math.max(0, Number(reward) || 0);

  return hpByWave.map((hp, index) => {
    const wave = index + 1;
    const isBoss = wave === SOLAR_INTERSTELLAR_WAVE_COUNT;
    const isElite = !isBoss && wave % 3 === 0;

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
