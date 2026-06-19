export const NEW_EARTH_HELICOPTERS_STORAGE_KEY = 'new_earth_helicopters';
export const NEW_EARTH_TANKS_STORAGE_KEY = 'new_earth_tanks';
export const NEW_EARTH_SURFACE_BATTLES_STORAGE_KEY = 'new_earth_surface_battles';

export type NewEarthHelicopterColonyId = 'colony-3';
export type NewEarthTankColonyId = 'colony-1';
export type NewEarthSurfaceBattleSiteId = 'zona-glacial' | 'ruinas-europeias' | 'continente-esquecido';
export type NewEarthSurfaceBattleKind = 'tank' | 'helicopter';

export type NewEarthHelicopterUpgradeId =
  | 'speed'
  | 'gunDamage'
  | 'missileDamage'
  | 'extraMissiles'
  | 'armor'
  | 'initialDrones';

export type NewEarthHelicopterUpgradeLevels = Record<NewEarthHelicopterUpgradeId, number>;

export type NewEarthHelicopterState = Record<NewEarthHelicopterColonyId, NewEarthHelicopterUpgradeLevels>;

export type NewEarthTankUpgradeId =
  | 'speed'
  | 'shotDamage'
  | 'shotSpeed'
  | 'armor'
  | 'capture';

export type NewEarthTankUpgradeLevels = Record<NewEarthTankUpgradeId, number>;
export type NewEarthTankState = Record<NewEarthTankColonyId, NewEarthTankUpgradeLevels>;
export type NewEarthSurfaceBattleProgress = Record<NewEarthSurfaceBattleSiteId, {
  victories: number;
  bestBattleLevel: number;
  lastVictoryAt: number | null;
}>;

export const MAX_NEW_EARTH_HELICOPTER_UPGRADE_LEVEL = 5;
export const MAX_NEW_EARTH_TANK_UPGRADE_LEVEL = 5;

export const NEW_EARTH_HELICOPTER_UPGRADES: Array<{
  id: NewEarthHelicopterUpgradeId;
  label: Record<'pt' | 'en', string>;
  description: Record<'pt' | 'en', string>;
}> = [
  {
    id: 'speed',
    label: { pt: 'Velocidade do Helicóptero', en: 'Helicopter Speed' },
    description: { pt: '+10% velocidade por nível', en: '+10% speed per level' },
  },
  {
    id: 'gunDamage',
    label: { pt: 'Dano da Metralhadora', en: 'Machine Gun Damage' },
    description: { pt: '+20% dano por nível', en: '+20% damage per level' },
  },
  {
    id: 'missileDamage',
    label: { pt: 'Dano do Míssil', en: 'Missile Damage' },
    description: { pt: '+20% dano por nível', en: '+20% damage per level' },
  },
  {
    id: 'extraMissiles',
    label: { pt: 'Míssil Extra', en: 'Extra Missile' },
    description: { pt: '+1 míssil inicial por nível', en: '+1 starting missile per level' },
  },
  {
    id: 'armor',
    label: { pt: 'Armadura', en: 'Armor' },
    description: { pt: '+10% resistência por nível', en: '+10% resistance per level' },
  },
  {
    id: 'initialDrones',
    label: { pt: 'Drones Iniciais', en: 'Starting Drones' },
    description: { pt: '+1 drone inicial por nível', en: '+1 starting drone per level' },
  },
];

const DEFAULT_LEVELS: NewEarthHelicopterUpgradeLevels = {
  speed: 0,
  gunDamage: 0,
  missileDamage: 0,
  extraMissiles: 0,
  armor: 0,
  initialDrones: 0,
};

export const NEW_EARTH_TANK_UPGRADES: Array<{
  id: NewEarthTankUpgradeId;
  label: Record<'pt' | 'en', string>;
  description: Record<'pt' | 'en', string>;
}> = [
  {
    id: 'speed',
    label: { pt: 'Velocidade do Tanque', en: 'Tank Speed' },
    description: { pt: '+5% velocidade por nível', en: '+5% speed per level' },
  },
  {
    id: 'shotDamage',
    label: { pt: 'Dano do Tiro', en: 'Shot Damage' },
    description: { pt: '+5% dano por nível', en: '+5% damage per level' },
  },
  {
    id: 'shotSpeed',
    label: { pt: 'Velocidade do Tiro', en: 'Shot Speed' },
    description: { pt: '+10% velocidade do tiro por nível', en: '+10% shot speed per level' },
  },
  {
    id: 'armor',
    label: { pt: 'Armadura', en: 'Armor' },
    description: { pt: '+5% resistência por nível', en: '+5% resistance per level' },
  },
  {
    id: 'capture',
    label: { pt: 'Captação', en: 'Capture' },
    description: { pt: '+20% recompensas por nível', en: '+20% rewards per level' },
  },
];

const DEFAULT_TANK_LEVELS: NewEarthTankUpgradeLevels = {
  speed: 0,
  shotDamage: 0,
  shotSpeed: 0,
  armor: 0,
  capture: 0,
};

export const createDefaultNewEarthHelicopterState = (): NewEarthHelicopterState => ({
  'colony-3': { ...DEFAULT_LEVELS },
});

export const createDefaultNewEarthTankState = (): NewEarthTankState => ({
  'colony-1': { ...DEFAULT_TANK_LEVELS },
});

export const normalizeNewEarthHelicopterState = (raw: unknown): NewEarthHelicopterState => {
  const defaults = createDefaultNewEarthHelicopterState();
  if (!raw || typeof raw !== 'object') return defaults;

  const colonyLevels = (raw as Record<string, unknown>)['colony-3'];
  if (!colonyLevels || typeof colonyLevels !== 'object') return defaults;

  NEW_EARTH_HELICOPTER_UPGRADES.forEach(upgrade => {
    const level = Number((colonyLevels as Record<string, unknown>)[upgrade.id]);
    defaults['colony-3'][upgrade.id] = Number.isFinite(level)
      ? Math.min(MAX_NEW_EARTH_HELICOPTER_UPGRADE_LEVEL, Math.max(0, Math.floor(level)))
      : 0;
  });

  return defaults;
};

export const getNewEarthHelicopterUpgradeCost = (level: number) => Math.round(520 + Math.pow(level + 1, 1.38) * 220);

export const normalizeNewEarthTankState = (raw: unknown): NewEarthTankState => {
  const defaults = createDefaultNewEarthTankState();
  if (!raw || typeof raw !== 'object') return defaults;

  const colonyLevels = (raw as Record<string, unknown>)['colony-1'];
  if (!colonyLevels || typeof colonyLevels !== 'object') return defaults;

  NEW_EARTH_TANK_UPGRADES.forEach(upgrade => {
    const level = Number((colonyLevels as Record<string, unknown>)[upgrade.id]);
    defaults['colony-1'][upgrade.id] = Number.isFinite(level)
      ? Math.min(MAX_NEW_EARTH_TANK_UPGRADE_LEVEL, Math.max(0, Math.floor(level)))
      : 0;
  });

  return defaults;
};

export const getNewEarthTankUpgradeCost = (level: number) => Math.round(620 + Math.pow(level + 1, 1.42) * 260);

export const getNewEarthHelicopterStats = (levels: NewEarthHelicopterUpgradeLevels) => ({
  speedBonus: levels.speed * 10,
  gunDamageBonus: levels.gunDamage * 20,
  missileDamageBonus: levels.missileDamage * 20,
  startingMissiles: 1 + levels.extraMissiles,
  armorReduction: levels.armor * 10,
  initialDrones: levels.initialDrones,
});

export const getNewEarthTankStats = (levels: NewEarthTankUpgradeLevels) => ({
  speedBonus: levels.speed * 5,
  shotDamageBonus: levels.shotDamage * 5,
  shotSpeedBonus: levels.shotSpeed * 10,
  armorReduction: levels.armor * 5,
  rewardBonus: levels.capture * 20,
});

export const createDefaultNewEarthSurfaceBattleProgress = (): NewEarthSurfaceBattleProgress => ({
  'zona-glacial': { victories: 0, bestBattleLevel: 0, lastVictoryAt: null },
  'ruinas-europeias': { victories: 0, bestBattleLevel: 0, lastVictoryAt: null },
  'continente-esquecido': { victories: 0, bestBattleLevel: 0, lastVictoryAt: null },
});

export const normalizeNewEarthSurfaceBattleProgress = (raw: unknown): NewEarthSurfaceBattleProgress => {
  const defaults = createDefaultNewEarthSurfaceBattleProgress();
  if (!raw || typeof raw !== 'object') return defaults;

  (Object.keys(defaults) as NewEarthSurfaceBattleSiteId[]).forEach(siteId => {
    const saved = (raw as Record<string, unknown>)[siteId];
    if (!saved || typeof saved !== 'object') return;
    const savedRecord = saved as Record<string, unknown>;
    defaults[siteId] = {
      victories: Math.max(0, Math.floor(Number(savedRecord.victories) || 0)),
      bestBattleLevel: Math.max(0, Math.floor(Number(savedRecord.bestBattleLevel) || 0)),
      lastVictoryAt: savedRecord.lastVictoryAt == null
        ? null
        : Number.isFinite(Number(savedRecord.lastVictoryAt)) ? Number(savedRecord.lastVictoryAt) : null,
    };
  });

  return defaults;
};

export const recordNewEarthSurfaceBattleVictory = (
  progress: NewEarthSurfaceBattleProgress,
  siteId: NewEarthSurfaceBattleSiteId,
  battleLevel: number,
  now = Date.now()
): NewEarthSurfaceBattleProgress => {
  const normalized = normalizeNewEarthSurfaceBattleProgress(progress);
  const current = normalized[siteId];
  return {
    ...normalized,
    [siteId]: {
      victories: current.victories + 1,
      bestBattleLevel: Math.max(current.bestBattleLevel, Math.max(1, Math.floor(Number(battleLevel) || 1))),
      lastVictoryAt: now,
    },
  };
};

export const getNewEarthSurfaceBattleReward = (
  battleKind: NewEarthSurfaceBattleKind,
  battleLevel: number,
  previousVictories = 0
) => {
  const safeLevel = Math.max(1, Math.floor(Number(battleLevel) || 1));
  const repeatMultiplier = previousVictories > 0 ? 0.55 : 1;
  const base = battleKind === 'tank' ? 34000 : 30000;
  const levelBonus = safeLevel * (battleKind === 'tank' ? 3200 : 2800);

  return Math.round((base + levelBonus) * repeatMultiplier);
};
