export const NEW_EARTH_SUBMARINES_STORAGE_KEY = 'new_earth_submarines';

export type NewEarthSubmarineColonyId = 'colony-2' | 'colony-4';

export type NewEarthSubmarineUpgradeId =
  | 'hullArmor'
  | 'glassArmor'
  | 'sonar'
  | 'missile'
  | 'thrusters'
  | 'airTanks';

export type NewEarthSubmarineUpgradeLevels = Record<NewEarthSubmarineUpgradeId, number>;

export type NewEarthSubmarineState = Record<NewEarthSubmarineColonyId, NewEarthSubmarineUpgradeLevels>;

export const NEW_EARTH_SUBMARINE_DEPTH_STAGES = [2000, 4000, 6000, 8000, 10000] as const;
export const MAX_NEW_EARTH_SUBMARINE_UPGRADE_LEVEL = 5;

export const NEW_EARTH_SUBMARINE_COLONIES: NewEarthSubmarineColonyId[] = ['colony-4', 'colony-2'];

export const NEW_EARTH_SUBMARINE_IMAGE_PATHS: Record<NewEarthSubmarineColonyId, string | null> = {
  'colony-4': '/assets/rota4/colonys/gaia/gaia_submarine_neptune/gaia_front.webp',
  'colony-2': '/assets/rota4/colonys/eden/eden_submarine_poseidon/eden_front.webp',
};

export const NEW_EARTH_SUBMARINE_UPGRADES: Array<{
  id: NewEarthSubmarineUpgradeId;
  label: Record<'pt' | 'en', string>;
  description: Record<'pt' | 'en', string>;
}> = [
  {
    id: 'hullArmor',
    label: { pt: 'Blindagem do casco', en: 'Hull armor' },
    description: { pt: '+600m profundidade, +8% resistência', en: '+600m depth, +8% durability' },
  },
  {
    id: 'glassArmor',
    label: { pt: 'Blindagem do vidro', en: 'Glass armor' },
    description: { pt: '+450m profundidade', en: '+450m depth' },
  },
  {
    id: 'sonar',
    label: { pt: 'Sonar', en: 'Sonar' },
    description: { pt: '+1 tesouro potencial a cada 2 níveis', en: '+1 potential treasure every 2 levels' },
  },
  {
    id: 'missile',
    label: { pt: 'Míssil', en: 'Missile' },
    description: { pt: '+12% dano, +3% velocidade', en: '+12% damage, +3% speed' },
  },
  {
    id: 'thrusters',
    label: { pt: 'Propulsores', en: 'Thrusters' },
    description: { pt: '+4% velocidade do submarino', en: '+4% submarine speed' },
  },
  {
    id: 'airTanks',
    label: { pt: 'Cilindros de ar comprimido', en: 'Compressed air tanks' },
    description: { pt: '+750m profundidade', en: '+750m depth' },
  },
];

const DEFAULT_LEVELS: NewEarthSubmarineUpgradeLevels = {
  hullArmor: 0,
  glassArmor: 0,
  sonar: 0,
  missile: 0,
  thrusters: 0,
  airTanks: 0,
};

export const createDefaultNewEarthSubmarineState = (): NewEarthSubmarineState => ({
  'colony-4': { ...DEFAULT_LEVELS },
  'colony-2': { ...DEFAULT_LEVELS },
});

export const normalizeNewEarthSubmarineState = (raw: unknown): NewEarthSubmarineState => {
  const defaults = createDefaultNewEarthSubmarineState();
  if (!raw || typeof raw !== 'object') return defaults;

  NEW_EARTH_SUBMARINE_COLONIES.forEach(colonyId => {
    const colonyLevels = (raw as Record<string, unknown>)[colonyId];
    if (!colonyLevels || typeof colonyLevels !== 'object') return;

    NEW_EARTH_SUBMARINE_UPGRADES.forEach(upgrade => {
      const level = Number((colonyLevels as Record<string, unknown>)[upgrade.id]);
      defaults[colonyId][upgrade.id] = Number.isFinite(level)
        ? Math.min(MAX_NEW_EARTH_SUBMARINE_UPGRADE_LEVEL, Math.max(0, Math.floor(level)))
        : 0;
    });
  });

  return defaults;
};

export const getNewEarthSubmarineUpgradeCost = (level: number) => Math.round(420 + Math.pow(level + 1, 1.35) * 180);

export const getNewEarthSubmarineStats = (levels: NewEarthSubmarineUpgradeLevels) => {
  const maxDepth =
    NEW_EARTH_SUBMARINE_DEPTH_STAGES[0] +
    levels.hullArmor * 600 +
    levels.glassArmor * 450 +
    levels.airTanks * 750;

  return {
    maxDepth,
    hullResistance: Math.round(levels.hullArmor * 8),
    treasurePotential: 3 + Math.floor(levels.sonar / 2),
    missileDamageBonus: Math.round(levels.missile * 12),
    missileSpeedBonus: Math.round(levels.missile * 3),
    speedBonus: Math.round(levels.thrusters * 4),
    oxygenSeconds: 120 + levels.airTanks * 60 + levels.glassArmor * 24 + levels.hullArmor * 12,
  };
};

export const getNewEarthSubmarineUnlockedStageIndex = (maxDepth: number) => (
  NEW_EARTH_SUBMARINE_DEPTH_STAGES.reduce((highest, depth, index) => (
    maxDepth >= depth ? index : highest
  ), 0)
);
