export type NewEarthUnderwaterEnemyLoot<T> =
  | { type: 'qc'; amount: number }
  | { type: 'relic'; amount: 1; relic: T }
  | { type: 'none'; amount: 0 };

export const NEW_EARTH_UNDERWATER_ENEMY_QC_MIN: number;
export const NEW_EARTH_UNDERWATER_ENEMY_QC_MAX: number;

export function rollNewEarthUnderwaterEnemyLoot<T>(
  catalogs: { rareRings: T[]; rareFish: T[]; relics: T[] },
  random?: () => number,
): NewEarthUnderwaterEnemyLoot<T>;
