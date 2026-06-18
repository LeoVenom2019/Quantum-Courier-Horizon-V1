export const NEW_EARTH_HELICOPTERS_STORAGE_KEY = 'new_earth_helicopters';

export type NewEarthHelicopterColonyId = 'colony-3';

export type NewEarthHelicopterUpgradeId =
  | 'speed'
  | 'gunDamage'
  | 'missileDamage'
  | 'extraMissiles'
  | 'armor'
  | 'initialDrones';

export type NewEarthHelicopterUpgradeLevels = Record<NewEarthHelicopterUpgradeId, number>;

export type NewEarthHelicopterState = Record<NewEarthHelicopterColonyId, NewEarthHelicopterUpgradeLevels>;

export const MAX_NEW_EARTH_HELICOPTER_UPGRADE_LEVEL = 5;

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

export const createDefaultNewEarthHelicopterState = (): NewEarthHelicopterState => ({
  'colony-3': { ...DEFAULT_LEVELS },
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

export const getNewEarthHelicopterStats = (levels: NewEarthHelicopterUpgradeLevels) => ({
  speedBonus: levels.speed * 10,
  gunDamageBonus: levels.gunDamage * 20,
  missileDamageBonus: levels.missileDamage * 20,
  startingMissiles: 1 + levels.extraMissiles,
  armorReduction: levels.armor * 10,
  initialDrones: levels.initialDrones,
});
