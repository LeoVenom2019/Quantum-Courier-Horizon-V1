export type NewEarthUnderwaterEnemyLoot<T> =
  | { type: 'qc'; amount: number }
  | { type: 'relic'; amount: 1; relic: T }
  | { type: 'none'; amount: 0 };

export const NEW_EARTH_UNDERWATER_ENEMY_QC_MIN: number;
export const NEW_EARTH_UNDERWATER_ENEMY_QC_MAX: number;
export const NEW_EARTH_UNDERWATER_BOSS_QC_MIN: number;
export const NEW_EARTH_UNDERWATER_BOSS_QC_MAX: number;

export function excludeCollectedUnderwaterTreasures<T extends { id: string }>(
  items: T[],
  collectedIds: Set<string> | string[],
): T[];

export function rollNewEarthUnderwaterEnemyLoot<T>(
  catalogs: { rareRings: T[]; rareFish: T[]; relics: T[] },
  random?: () => number,
): NewEarthUnderwaterEnemyLoot<T>;

export function rollNewEarthUnderwaterBossLoot<T>(
  catalogs: { rareRings: T[]; relics: T[] },
  random?: () => number,
): {
  qc: { type: 'qc'; amount: number };
  treasure: { type: 'relic'; amount: 1; relic: T } | { type: 'none'; amount: 0 };
};
