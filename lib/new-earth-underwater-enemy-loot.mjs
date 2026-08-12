export const NEW_EARTH_UNDERWATER_ENEMY_QC_MIN = 1_000_000;
export const NEW_EARTH_UNDERWATER_ENEMY_QC_MAX = 3_000_000;

const pickRandomItem = (items, random) => {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
};

export const rollNewEarthUnderwaterEnemyLoot = (catalogs, random = Math.random) => {
  const roll = random();

  if (roll < 0.2) {
    return {
      type: 'qc',
      amount: Math.round(
        NEW_EARTH_UNDERWATER_ENEMY_QC_MIN
        + random() * (NEW_EARTH_UNDERWATER_ENEMY_QC_MAX - NEW_EARTH_UNDERWATER_ENEMY_QC_MIN),
      ),
    };
  }

  const collection = roll < 0.4
    ? catalogs.rareRings
    : roll < 0.6
      ? catalogs.rareFish
      : roll < 0.8
        ? catalogs.relics
        : null;

  if (!collection) return { type: 'none', amount: 0 };

  const relic = pickRandomItem(collection, random);
  return relic
    ? { type: 'relic', amount: 1, relic }
    : { type: 'none', amount: 0 };
};
