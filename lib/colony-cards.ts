import { Cpu, Factory, Music, School, Shield, Utensils } from 'lucide-react';

export type ColonySectorId = 'happiness' | 'health' | 'economy' | 'security' | 'technology' | 'culture';
export type ColonyCardSlot = 'leadership' | 'infrastructure' | 'culture';
export type BattleCardSlot = 'weapon' | 'armor' | 'core' | 'tactic' | 'auxiliary' | 'protocol';
export type ColonyCardAnySlot = ColonyCardSlot | BattleCardSlot;
export type ColonyCardClass = 'political' | 'battle' | 'wildcard';
export type ColonyCardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'wildcard';
export type ElementalDamageType = 'ice' | 'electric' | 'fire';
export type CombatStatusId = 'slow' | 'shocked' | 'burning';
export type BattleCardStat =
  | 'damagePercent'
  | 'healthPercent'
  | 'shieldPercent'
  | 'critChance'
  | 'critDamage'
  | 'iceDamagePercent'
  | 'electricDamagePercent'
  | 'fireDamagePercent'
  | 'bonusDamageVsSlowPercent'
  | 'bonusDamageVsShockedPercent'
  | 'bonusDamageVsBurningPercent'
  | 'slowEnemyDamageReductionPercent'
  | 'shockedEnemySkipChance'
  | 'burningDamageOverTimePercent'
  | 'specialCooldownPercent'
  | 'defensePercent';

export interface ColonyCardEffect {
  sector: ColonySectorId;
  value: number;
}

export interface BattleCardEffect {
  stat: BattleCardStat;
  value: number;
}

export interface ArcadeWildcardPerk {
  id: string;
  label: Record<'en' | 'pt', string>;
  description: Record<'en' | 'pt', string>;
  value: string;
}

export interface PoliticalPassiveBonuses {
  constructorsAllColonies?: number;
  allSectorBonus?: number;
  constructionSpeedPercent?: number;
}

export interface ColonyCard {
  id: string;
  cardClass?: ColonyCardClass;
  slot?: ColonyCardAnySlot;
  rarity: ColonyCardRarity;
  name: Record<'en' | 'pt', string>;
  role: Record<'en' | 'pt', string>;
  lore: Record<'en' | 'pt', string>;
  effects?: ColonyCardEffect[];
  battleEffects?: BattleCardEffect[];
  unlocksArcadeId?: string;
  arcadePerk?: ArcadeWildcardPerk;
  passiveBonuses?: PoliticalPassiveBonuses;
}

export const POLITICAL_CARD_SLOTS: ColonyCardSlot[] = ['leadership', 'infrastructure', 'culture'];
export const BATTLE_CARD_SLOTS: BattleCardSlot[] = ['weapon', 'armor', 'core', 'tactic', 'auxiliary', 'protocol'];
export const NIKOLA_ENEAS_CARD_ID = 'political-mythic-nikola-eneas';

export const getCardClass = (card: ColonyCard): ColonyCardClass => card.cardClass || 'political';
export const isPoliticalCard = (card: ColonyCard): card is ColonyCard & { slot: ColonyCardSlot } => getCardClass(card) === 'political';
export const isBattleCard = (card: ColonyCard): card is ColonyCard & { slot: BattleCardSlot } => getCardClass(card) === 'battle';
export const isWildcardCard = (card: ColonyCard) => getCardClass(card) === 'wildcard';

export type ColonyCardLevels = Record<string, number>;
export const MAX_COLONY_CARD_LEVEL = 10;
export const MAX_HORIZON_LEVEL = 50;
export const getCardLevel = (cardId?: string, levels: ColonyCardLevels = {}) => (
  Math.max(1, Math.min(MAX_COLONY_CARD_LEVEL, Number(levels[cardId || '']) || 1))
);

export const getHorizonLevelFromXp = (xp = 0) => {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(xp));

  while (level < MAX_HORIZON_LEVEL) {
    const needed = getHorizonXpForNextLevel(level);
    if (remainingXp < needed) break;
    remainingXp -= needed;
    level += 1;
  }

  return { level, currentXp: remainingXp, nextXp: level >= MAX_HORIZON_LEVEL ? 0 : getHorizonXpForNextLevel(level) };
};

export const getHorizonXpForNextLevel = (level: number) => (
  Math.round(420 + Math.max(1, level) * 90 + Math.pow(Math.max(1, level), 1.35) * 42)
);

export const getPoliticalEffects = (card: ColonyCard, levels: ColonyCardLevels = {}): ColonyCardEffect[] => {
  const levelBonus = (getCardLevel(card.id, levels) - 1) * 2;
  return (card.effects || []).map(effect => ({
    ...effect,
    value: effect.value + levelBonus,
  }));
};

export const getPoliticalPassiveBonuses = (card: ColonyCard, levels: ColonyCardLevels = {}): PoliticalPassiveBonuses => {
  const multiplier = 1 + (getCardLevel(card.id, levels) - 1) * 0.1;
  const passiveBonuses = card.passiveBonuses || {};

  return {
    constructorsAllColonies: passiveBonuses.constructorsAllColonies
      ? Math.round(passiveBonuses.constructorsAllColonies * multiplier)
      : undefined,
    allSectorBonus: passiveBonuses.allSectorBonus
      ? Math.round(passiveBonuses.allSectorBonus * multiplier)
      : undefined,
    constructionSpeedPercent: passiveBonuses.constructionSpeedPercent
      ? Math.round(passiveBonuses.constructionSpeedPercent * multiplier)
      : undefined,
  };
};

export const getBattleEffects = (card: ColonyCard, levels: ColonyCardLevels = {}): BattleCardEffect[] => {
  const multiplier = 1 + (getCardLevel(card.id, levels) - 1) * 0.1;
  return (card.battleEffects || []).map(effect => ({
    ...effect,
    value: Math.round(effect.value * multiplier),
  }));
};

export const getArcadeWildcardPerks = (cardIds: string[] = [], arcadeId?: string) => {
  const owned = new Set(cardIds);
  return COLONY_CARD_CATALOG
    .filter(card => owned.has(card.id))
    .filter(card => isWildcardCard(card))
    .filter(card => !arcadeId || card.unlocksArcadeId === arcadeId)
    .map(card => card.arcadePerk)
    .filter(Boolean) as ArcadeWildcardPerk[];
};

const CARD_UPGRADE_BASE_COST: Record<ColonyCardRarity, number> = {
  common: 15000,
  rare: 35000,
  epic: 80000,
  legendary: 180000,
  mythic: 350000,
  wildcard: 0,
};

export const getCardUpgradeCost = (card: ColonyCard, level = 1) => (
  level >= MAX_COLONY_CARD_LEVEL ? 0 : Math.round(CARD_UPGRADE_BASE_COST[card.rarity] * level)
);

export const CARD_BACKGROUND_BY_RARITY: Record<ColonyCardRarity, string> = {
  common: '/assets/rota4/cards/1_background_c.webp',
  rare: '/assets/rota4/cards/2_background_r.webp',
  epic: '/assets/rota4/cards/3_background_e.webp',
  legendary: '/assets/rota4/cards/4_background_l.webp',
  mythic: '/assets/rota4/cards/5_background_m.webp',
  wildcard: '/assets/rota4/cards/6_background_j.webp',
};

export const getCardBackgroundImage = (rarity: ColonyCardRarity) => CARD_BACKGROUND_BY_RARITY[rarity];

export const CARD_MODAL_BACKGROUND_BY_RARITY: Record<ColonyCardRarity, string> = {
  common: '/assets/rota4/cards/modal_comum.webp',
  rare: '/assets/rota4/cards/modal_rara.webp',
  epic: '/assets/rota4/cards/modal_epica.webp',
  legendary: '/assets/rota4/cards/modal_lendaria.webp',
  mythic: '/assets/rota4/cards/modal_mitica.webp',
  wildcard: '/assets/rota4/cards/modal_rgb.webp',
};

export const getCardModalBackgroundImage = (rarity: ColonyCardRarity, cardClass: ColonyCardClass = 'political') => (
  cardClass === 'wildcard' || rarity === 'wildcard'
    ? CARD_MODAL_BACKGROUND_BY_RARITY.wildcard
    : CARD_MODAL_BACKGROUND_BY_RARITY[rarity]
);

export const ELEMENTAL_BATTLE_STATS: Record<ElementalDamageType, BattleCardStat> = {
  ice: 'iceDamagePercent',
  electric: 'electricDamagePercent',
  fire: 'fireDamagePercent',
};
export const TRINITY_REACTOR_CARD_ID = 'battle-orange-trinity';

export const unlocksElementalSynergy = (card?: ColonyCard) => card?.id === TRINITY_REACTOR_CARD_ID;

export const getBattleCardElementTypes = (card: ColonyCard): ElementalDamageType[] => {
  if (!isBattleCard(card)) return [];
  return (Object.entries(ELEMENTAL_BATTLE_STATS) as Array<[ElementalDamageType, BattleCardStat]>)
    .filter(([, stat]) => getBattleEffects(card).some(effect => effect.stat === stat && effect.value !== 0))
    .map(([element]) => element);
};

export const canEquipBattleCardWithElementRule = (
  card: ColonyCard,
  equippedCards: ColonyCard[]
) => {
  if (unlocksElementalSynergy(card) || equippedCards.some(unlocksElementalSynergy)) {
    return {
      allowed: true,
      element: undefined,
      candidateElements: getBattleCardElementTypes(card),
      equippedElements: Array.from(new Set(equippedCards.flatMap(getBattleCardElementTypes))),
    };
  }

  const candidateElements = getBattleCardElementTypes(card);
  const equippedElements = equippedCards.flatMap(getBattleCardElementTypes);
  const uniqueElements = Array.from(new Set([...equippedElements, ...candidateElements]));

  return {
    allowed: uniqueElements.length <= 1,
    element: uniqueElements[0] as ElementalDamageType | undefined,
    candidateElements,
    equippedElements: Array.from(new Set(equippedElements)),
  };
};

export const SECTOR_CONFIG: Record<ColonySectorId, {
  label: Record<'en' | 'pt', string>;
  icon: any;
  color: string;
}> = {
  happiness: { label: { en: 'Happiness', pt: 'Felicidade' }, icon: Music, color: 'text-pink-300' },
  health: { label: { en: 'Health', pt: 'Saúde' }, icon: Utensils, color: 'text-emerald-300' },
  economy: { label: { en: 'Economy', pt: 'Economia' }, icon: Factory, color: 'text-amber-300' },
  security: { label: { en: 'Security', pt: 'Segurança' }, icon: Shield, color: 'text-red-300' },
  technology: { label: { en: 'Technology', pt: 'Tecnologia' }, icon: Cpu, color: 'text-cyan-300' },
  culture: { label: { en: 'Culture', pt: 'Cultura' }, icon: School, color: 'text-violet-300' },
};

export const BATTLE_STAT_CONFIG: Record<BattleCardStat, {
  label: Record<'en' | 'pt', string>;
  category: 'core' | 'elemental' | 'conditional' | 'legacy';
  unit: 'percent' | 'chance';
}> = {
  damagePercent: { label: { en: 'Damage', pt: 'Dano' }, category: 'core', unit: 'percent' },
  healthPercent: { label: { en: 'Health', pt: 'Vida' }, category: 'core', unit: 'percent' },
  shieldPercent: { label: { en: 'Shield', pt: 'Escudo' }, category: 'core', unit: 'percent' },
  critChance: { label: { en: 'Crit Chance', pt: 'Chance Crítica' }, category: 'core', unit: 'chance' },
  critDamage: { label: { en: 'Crit Damage', pt: 'Dano Crítico' }, category: 'core', unit: 'percent' },
  iceDamagePercent: { label: { en: 'Ice Damage', pt: 'Dano Gélido' }, category: 'elemental', unit: 'percent' },
  electricDamagePercent: { label: { en: 'Electric Damage', pt: 'Dano Elétrico' }, category: 'elemental', unit: 'percent' },
  fireDamagePercent: { label: { en: 'Fire Damage', pt: 'Dano de Fogo' }, category: 'elemental', unit: 'percent' },
  bonusDamageVsSlowPercent: { label: { en: 'Damage vs Slow', pt: 'Dano vs Lentos' }, category: 'conditional', unit: 'percent' },
  bonusDamageVsShockedPercent: { label: { en: 'Damage vs Shocked', pt: 'Dano vs Eletrificados' }, category: 'conditional', unit: 'percent' },
  bonusDamageVsBurningPercent: { label: { en: 'Damage vs Burning', pt: 'Dano vs Em Chamas' }, category: 'conditional', unit: 'percent' },
  slowEnemyDamageReductionPercent: { label: { en: 'Slow Damage Reduction', pt: 'Redução de Dano Lento' }, category: 'conditional', unit: 'percent' },
  shockedEnemySkipChance: { label: { en: 'Shock Skip Chance', pt: 'Falha por Choque' }, category: 'conditional', unit: 'chance' },
  burningDamageOverTimePercent: { label: { en: 'Burn DoT', pt: 'Dano Contínuo de Fogo' }, category: 'conditional', unit: 'percent' },
  specialCooldownPercent: { label: { en: 'Special Cooldown', pt: 'Recarga Especial' }, category: 'core', unit: 'percent' },
  defensePercent: { label: { en: 'Defense', pt: 'Defesa' }, category: 'legacy', unit: 'percent' },
};

export interface BattleShipBaseStats {
  damage: number;
  health: number;
  shield: number;
  critChance: number;
  critMultiplier: number;
}

export interface BattleShipComputedStats extends BattleShipBaseStats {
  baseDamageBonusPercent: number;
  healthBonusPercent: number;
  shieldBonusPercent: number;
  critDamageBonusPercent: number;
  elementalDamage: Record<ElementalDamageType, number>;
  elementalBonusPercent: Record<ElementalDamageType, number>;
  conditionalBonuses: {
    bonusDamageVsSlowPercent: number;
    bonusDamageVsShockedPercent: number;
    bonusDamageVsBurningPercent: number;
    slowEnemyDamageReductionPercent: number;
    shockedEnemySkipChance: number;
    burningDamageOverTimePercent: number;
  };
  specialCooldownReductionPercent: number;
}

export const BASE_BATTLE_SHIP_STATS: BattleShipBaseStats = {
  damage: 100,
  health: 1000,
  shield: 400,
  critChance: 5,
  critMultiplier: 3,
};

export const createEmptyBattleStatTotals = (): Record<BattleCardStat, number> => (
  (Object.keys(BATTLE_STAT_CONFIG) as BattleCardStat[]).reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {} as Record<BattleCardStat, number>)
);

export const calculateBattleStatTotals = (
  cards: ColonyCard[],
  levels: ColonyCardLevels = {}
): Record<BattleCardStat, number> => {
  const totals = createEmptyBattleStatTotals();
  cards.forEach(card => {
    getBattleEffects(card, levels).forEach(effect => {
      totals[effect.stat] = (totals[effect.stat] || 0) + effect.value;
    });
  });
  return totals;
};

export const calculateBattleShipStats = (
  cards: ColonyCard[],
  baseStats: BattleShipBaseStats = BASE_BATTLE_SHIP_STATS,
  levels: ColonyCardLevels = {},
  horizonLevel = 1
): BattleShipComputedStats => {
  const horizonMultiplier = 1 + Math.max(0, horizonLevel - 1) * 0.05;
  const scaledBaseStats: BattleShipBaseStats = {
    damage: Math.round(baseStats.damage * horizonMultiplier),
    health: Math.round(baseStats.health * horizonMultiplier),
    shield: Math.round(baseStats.shield * horizonMultiplier),
    critChance: baseStats.critChance * horizonMultiplier,
    critMultiplier: baseStats.critMultiplier * horizonMultiplier,
  };
  const totals = calculateBattleStatTotals(cards, levels);
  const baseDamageBonusPercent = totals.damagePercent + totals.defensePercent;
  const healthBonusPercent = totals.healthPercent;
  const shieldBonusPercent = totals.shieldPercent;
  const critDamageBonusPercent = totals.critDamage;
  const damage = Math.round(scaledBaseStats.damage * (1 + baseDamageBonusPercent / 100));
  const health = Math.round(scaledBaseStats.health * (1 + healthBonusPercent / 100));
  const shield = Math.round(scaledBaseStats.shield * (1 + shieldBonusPercent / 100));
  const critMultiplier = scaledBaseStats.critMultiplier * (1 + critDamageBonusPercent / 100);

  return {
    damage,
    health,
    shield,
    critChance: scaledBaseStats.critChance + totals.critChance,
    critMultiplier,
    baseDamageBonusPercent,
    healthBonusPercent,
    shieldBonusPercent,
    critDamageBonusPercent,
    elementalDamage: {
      ice: Math.round(damage * (totals.iceDamagePercent / 100)),
      electric: Math.round(damage * (totals.electricDamagePercent / 100)),
      fire: Math.round(damage * (totals.fireDamagePercent / 100)),
    },
    elementalBonusPercent: {
      ice: totals.iceDamagePercent,
      electric: totals.electricDamagePercent,
      fire: totals.fireDamagePercent,
    },
    conditionalBonuses: {
      bonusDamageVsSlowPercent: totals.bonusDamageVsSlowPercent,
      bonusDamageVsShockedPercent: totals.bonusDamageVsShockedPercent,
      bonusDamageVsBurningPercent: totals.bonusDamageVsBurningPercent,
      slowEnemyDamageReductionPercent: totals.slowEnemyDamageReductionPercent,
      shockedEnemySkipChance: totals.shockedEnemySkipChance,
      burningDamageOverTimePercent: totals.burningDamageOverTimePercent,
    },
    specialCooldownReductionPercent: totals.specialCooldownPercent,
  };
};

export const DEFAULT_COLONY_SECTORS: Record<ColonySectorId, number> = {
  happiness: 46,
  health: 58,
  economy: 34,
  security: 42,
  technology: 52,
  culture: 38,
};

export const DEFAULT_OWNED_COLONY_CARD_IDS: string[] = [];

export const STARTER_BATTLE_CARD_IDS = [
  'battle-white-spark',
  'battle-iron-pulse',
];

export const normalizeOwnedColonyCardIds = (ids?: string[]) => {
  const validIds = new Set(COLONY_CARD_CATALOG.map(card => card.id));
  return Array.from(new Set((ids || []).filter(id => validIds.has(id))));
};

export const BATTLE_CARD_ATTRIBUTE_COUNT: Record<ColonyCardRarity, number> = {
  common: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 6,
  wildcard: 0,
};

export const BATTLE_CARD_DROP_CHANCE: Record<ColonyCardRarity, number> = {
  common: 55,
  rare: 30,
  epic: 12,
  legendary: 3,
  mythic: 0,
  wildcard: 0,
};

export const ARCADE_CARD_REWARD_CHANCE = 42;

export type ArcadeCardRewardRule = {
  gameId: string;
  minimumScore: number;
  scoreMode: 'points' | 'remainingSeconds';
  requiresVictory?: boolean;
};

export const ARCADE_CARD_REWARD_RULES: Record<string, ArcadeCardRewardRule> = {
  'salto-espacial': {
    gameId: 'salto-espacial',
    minimumScore: 4000,
    scoreMode: 'points',
  },
  'ruptura-estelar': {
    gameId: 'ruptura-estelar',
    minimumScore: 10000,
    scoreMode: 'points',
  },
  'danger-zoom-zones': {
    gameId: 'danger-zoom-zones',
    minimumScore: 0,
    scoreMode: 'remainingSeconds',
    requiresVictory: true,
  },
  'grid-collapse': {
    gameId: 'grid-collapse',
    minimumScore: 10000,
    scoreMode: 'points',
  },
  'robot-runner': {
    gameId: 'robot-runner',
    minimumScore: 5000,
    scoreMode: 'points',
  },
  'neo-catcher': {
    gameId: 'neo-catcher',
    minimumScore: 15000,
    scoreMode: 'points',
  },
};

export const rollBattleCardRarity = (
  random = Math.random,
  legendaryBonusPercent = 0
): ColonyCardRarity => {
  const legendaryChance = Math.min(60, Math.max(0, BATTLE_CARD_DROP_CHANCE.legendary + legendaryBonusPercent));
  const roll = random() * 100;

  if (roll < legendaryChance) return 'legendary';

  const nonLegendaryRoll = random() * (
    BATTLE_CARD_DROP_CHANCE.common +
    BATTLE_CARD_DROP_CHANCE.rare +
    BATTLE_CARD_DROP_CHANCE.epic
  );
  let cursor = 0;

  for (const rarity of ['common', 'rare', 'epic'] as ColonyCardRarity[]) {
    cursor += BATTLE_CARD_DROP_CHANCE[rarity];
    if (nonLegendaryRoll <= cursor) return rarity;
  }

  return 'common';
};

export const rollBattleCardReward = (
  ownedIds: string[] = [],
  random = Math.random,
  legendaryBonusPercent = 0
) => {
  const owned = new Set(ownedIds);
  const preferredRarity = rollBattleCardRarity(random, legendaryBonusPercent);
  const battleCards = COLONY_CARD_CATALOG.filter(card => isBattleCard(card) && !owned.has(card.id));
  const sameRarity = battleCards.filter(card => card.rarity === preferredRarity);
  const pool = sameRarity.length > 0 ? sameRarity : battleCards;

  if (pool.length === 0) return null;

  return pool[Math.floor(random() * pool.length)];
};

export const rollAnyMissingColonyCardReward = (
  ownedIds: string[] = [],
  random = Math.random
) => {
  const owned = new Set(ownedIds);
  const pool = COLONY_CARD_CATALOG.filter(card => !owned.has(card.id));
  if (pool.length === 0) return null;

  const missingPoliticalMythics = pool.filter(card => isPoliticalCard(card) && card.rarity === 'mythic');
  if (missingPoliticalMythics.length > 0 && random() < 0.42) {
    return missingPoliticalMythics[Math.floor(random() * missingPoliticalMythics.length)];
  }

  const getRewardWeight = (card: ColonyCard) => {
    const baseWeight = (() => {
      if (isPoliticalCard(card) && card.rarity === 'mythic') return 24;
      if (card.rarity === 'legendary') return 8;
      if (card.rarity === 'epic') return 10;
      if (card.rarity === 'rare') return 12;
      return 14;
    })();
    if (isPoliticalCard(card) || isWildcardCard(card)) return baseWeight * 1.2;
    return baseWeight;
  };
  const totalWeight = pool.reduce((sum, card) => sum + getRewardWeight(card), 0);
  let roll = random() * totalWeight;
  return pool.find(card => {
    roll -= getRewardWeight(card);
    return roll <= 0;
  }) || pool[pool.length - 1];
};

export const COLONY_CARD_CATALOG: ColonyCard[] = [
  {
    id: 'mayor-agronomist',
    slot: 'leadership',
    rarity: 'common',
    name: { en: 'Greenhouse Warden', pt: 'Guardiã das Estufas' },
    role: { en: 'Food and public health', pt: 'Alimento e saúde pública' },
    lore: {
      en: 'Turns survival logistics into stable daily life.',
      pt: 'Transforma logística de sobrevivência em rotina estável.',
    },
    effects: [
      { sector: 'health', value: 12 },
      { sector: 'happiness', value: 4 },
      { sector: 'economy', value: -3 },
    ],
  },
  {
    id: 'orbital-engineer',
    slot: 'infrastructure',
    rarity: 'rare',
    name: { en: 'Low-Ring Engineer', pt: 'Engenheira do Anel Baixo' },
    role: { en: 'Industrial planning', pt: 'Planejamento industrial' },
    lore: {
      en: 'Reads the colony like a machine that still remembers people.',
      pt: 'Lê a colônia como uma máquina que ainda lembra das pessoas.',
    },
    effects: [
      { sector: 'economy', value: 14 },
      { sector: 'technology', value: 8 },
      { sector: 'happiness', value: -5 },
    ],
  },
  {
    id: 'civic-mediator',
    slot: 'leadership',
    rarity: 'epic',
    name: { en: 'Living Council Voice', pt: 'Voz do Conselho Vivo' },
    role: { en: 'Social balance', pt: 'Equilíbrio social' },
    lore: {
      en: 'Keeps tired families, builders, and councils at the same table.',
      pt: 'Mantém famílias, construtores e conselhos na mesma mesa.',
    },
    effects: [
      { sector: 'happiness', value: 10 },
      { sector: 'security', value: 7 },
      { sector: 'culture', value: 6 },
    ],
  },
  {
    id: NIKOLA_ENEAS_CARD_ID,
    slot: 'leadership',
    rarity: 'mythic',
    name: { en: 'Aurora Patriarch', pt: 'Patriarca da Aurora' },
    role: { en: 'Founding civil command', pt: 'Comando civil fundador' },
    lore: {
      en: 'He did not promise paradise. He brought the blueprint and asked who still had courage.',
      pt: 'Não prometeu paraíso. Trouxe a planta e perguntou quem ainda tinha coragem.',
    },
    passiveBonuses: {
      constructorsAllColonies: 500,
      allSectorBonus: 10,
    },
  },
  {
    id: 'political-mythic-dawn-architect',
    slot: 'infrastructure',
    rarity: 'mythic',
    name: { en: 'Dawn Architect', pt: 'Arquiteta da Alvorada' },
    role: { en: 'Acceleration doctrine', pt: 'Doutrina de aceleração' },
    lore: {
      en: 'When the colony asks for time, she answers with machines, shifts, and impossible order.',
      pt: 'Quando a colônia pede tempo, ela responde com máquinas, turnos e uma ordem impossível.',
    },
    passiveBonuses: {
      constructorsAllColonies: 300,
      constructionSpeedPercent: 15,
    },
  },
  {
    id: 'political-legendary-green-dome-senator',
    slot: 'leadership',
    rarity: 'legendary',
    name: { en: 'Green Dome Senator', pt: 'Senadora das Cúpulas Verdes' },
    role: { en: 'Habitable city pact', pt: 'Pacto de cidade habitável' },
    lore: {
      en: 'Her laws make air, food, and dignity part of the same budget.',
      pt: 'Suas leis colocam ar, comida e dignidade no mesmo orçamento.',
    },
    effects: [
      { sector: 'health', value: 14 },
      { sector: 'happiness', value: 10 },
      { sector: 'economy', value: 6 },
    ],
  },
  {
    id: 'political-legendary-glass-foundry-marshal',
    slot: 'infrastructure',
    rarity: 'legendary',
    name: { en: 'Glass Foundry Marshal', pt: 'Marechal das Forjas de Vidro' },
    role: { en: 'Industrial discipline', pt: 'Disciplina industrial' },
    lore: {
      en: 'Turns raw ruins into factories that look too clean to be desperate.',
      pt: 'Transforma ruínas brutas em fábricas limpas demais para parecerem desespero.',
    },
    effects: [
      { sector: 'economy', value: 16 },
      { sector: 'technology', value: 10 },
      { sector: 'security', value: 4 },
    ],
  },
  {
    id: 'political-epic-civil-pact-judge',
    slot: 'leadership',
    rarity: 'epic',
    name: { en: 'Civil Pact Judge', pt: 'Juíza do Pacto Civil' },
    role: { en: 'Order without fear', pt: 'Ordem sem medo' },
    lore: {
      en: 'She settles disputes before they become factions.',
      pt: 'Resolve disputas antes que elas virem facções.',
    },
    effects: [
      { sector: 'security', value: 9 },
      { sector: 'happiness', value: 6 },
      { sector: 'culture', value: 5 },
    ],
  },
  {
    id: 'political-epic-water-ledger-keeper',
    slot: 'infrastructure',
    rarity: 'epic',
    name: { en: 'Water Ledger Keeper', pt: 'Guardião do Livro das Águas' },
    role: { en: 'Scarcity logistics', pt: 'Logística de escassez' },
    lore: {
      en: 'Every liter has a name, a route, and a reason to arrive.',
      pt: 'Cada litro tem nome, rota e motivo para chegar.',
    },
    effects: [
      { sector: 'health', value: 8 },
      { sector: 'economy', value: 7 },
      { sector: 'technology', value: 4 },
    ],
  },
  {
    id: 'political-epic-genesis-choirmaster',
    slot: 'culture',
    rarity: 'epic',
    name: { en: 'Genesis Choirmaster', pt: 'Regente de Genesis' },
    role: { en: 'Public morale', pt: 'Moral popular' },
    lore: {
      en: 'When the generators fail, people still remember the song.',
      pt: 'Quando os geradores falham, o povo ainda lembra a canção.',
    },
    effects: [
      { sector: 'culture', value: 11 },
      { sector: 'happiness', value: 8 },
      { sector: 'health', value: 2 },
    ],
  },
  {
    id: 'political-common-reservoir-inspector',
    slot: 'infrastructure',
    rarity: 'common',
    name: { en: 'Reservoir Inspector', pt: 'Fiscal dos Reservatórios' },
    role: { en: 'Basic sanitation', pt: 'Saneamento básico' },
    lore: {
      en: 'The first civilization is a clean pipe no one notices.',
      pt: 'A primeira civilização é um cano limpo que ninguém percebe.',
    },
    effects: [
      { sector: 'health', value: 7 },
      { sector: 'economy', value: 2 },
    ],
  },
  {
    id: 'political-common-shelter-teacher',
    slot: 'culture',
    rarity: 'common',
    name: { en: 'Shelter Teacher', pt: 'Professora dos Abrigos' },
    role: { en: 'First lessons', pt: 'Primeiras aulas' },
    lore: {
      en: 'She teaches children to count seeds, stars, and exits.',
      pt: 'Ensina as crianças a contar sementes, estrelas e saídas.',
    },
    effects: [
      { sector: 'culture', value: 6 },
      { sector: 'happiness', value: 3 },
    ],
  },
  {
    id: 'arcade-salto-espacial',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Space Jump', pt: 'Curinga: Salto Espacial' },
    role: { en: 'Unlocks Space Jump', pt: 'Desbloqueia Salto Espacial' },
    lore: {
      en: 'The first public arcade cabinet approved for New Earth morale recovery.',
      pt: 'O primeiro fliperama público aprovado para recuperar o moral da Nova Terra.',
    },
    arcadePerk: {
      id: 'space-jump-score-boost',
      label: { en: 'Score Bonus', pt: 'Pontuação Bônus' },
      description: { en: 'Space Jump score is multiplied during the run.', pt: 'A pontuação do Salto Espacial é multiplicada durante a partida.' },
      value: '1.5x',
    },
    unlocksArcadeId: 'salto-espacial',
  },
  {
    id: 'arcade-ruptura-estelar',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Stellar Rupture', pt: 'Curinga: Ruptura Estelar' },
    role: { en: 'Unlocks Stellar Rupture', pt: 'Desbloqueia Ruptura Estelar' },
    lore: {
      en: 'A combat simulator reframed as civic courage training.',
      pt: 'Um simulador de combate convertido em treinamento de coragem cívica.',
    },
    arcadePerk: {
      id: 'stellar-rupture-shield-charge',
      label: { en: 'Emergency Shield', pt: 'Escudo Emergencial' },
      description: { en: 'Stellar Rupture starts with one visible shield charge that absorbs one hit.', pt: 'Ruptura Estelar começa com um escudo visual que absorve um dano.' },
      value: '+1',
    },
    unlocksArcadeId: 'ruptura-estelar',
  },
  {
    id: 'arcade-danger-zoom-zones',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Danger Zoom Zones', pt: 'Curinga: Danger Zoom Zones' },
    role: { en: 'Unlocks Danger Zoom Zones', pt: 'Desbloqueia Danger Zoom Zones' },
    lore: {
      en: 'A pressure game that teaches pattern recognition under stress.',
      pt: 'Um jogo de pressão que ensina leitura de padrões sob estresse.',
    },
    arcadePerk: {
      id: 'danger-zoom-extra-time',
      label: { en: 'Extra Time', pt: 'Tempo Extra' },
      description: { en: 'Danger Zoom Zones begins with a stronger timer reserve.', pt: 'Danger Zoom Zones começa com uma reserva de tempo mais forte.' },
      value: '+20s',
    },
    unlocksArcadeId: 'danger-zoom-zones',
  },
  {
    id: 'arcade-grid-collapse',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Grid Collapse', pt: 'Curinga: Grid Collapse' },
    role: { en: 'Unlocks Grid Collapse', pt: 'Desbloqueia Grid Collapse' },
    lore: {
      en: 'Puzzle discipline dressed as a glowing cabinet.',
      pt: 'Disciplina lógica vestida como um gabinete luminoso.',
    },
    arcadePerk: {
      id: 'grid-collapse-line-bonus',
      label: { en: 'Line Bonus', pt: 'Bônus de Linha' },
      description: { en: 'Every completed line in Grid Collapse grants bonus points.', pt: 'Cada linha completa em Grid Collapse concede pontos bônus.' },
      value: '+500',
    },
    unlocksArcadeId: 'grid-collapse',
  },
  {
    id: 'arcade-robot-runner',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Robot Runner', pt: 'Curinga: Robot Runner' },
    role: { en: 'Unlocks Robot Runner', pt: 'Desbloqueia Robot Runner' },
    lore: {
      en: 'A cheerful maze that quietly improves robot empathy protocols.',
      pt: 'Um labirinto alegre que melhora protocolos de empatia robótica.',
    },
    arcadePerk: {
      id: 'robot-runner-extra-life',
      label: { en: 'Extra Life', pt: 'Vida Extra' },
      description: { en: 'Robot Runner starts with one additional life.', pt: 'Robot Runner começa com uma vida adicional.' },
      value: '+1',
    },
    unlocksArcadeId: 'robot-runner',
  },
  {
    id: 'arcade-neo-catcher',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Neo Catcher', pt: 'Curinga: Neo Catcher' },
    role: { en: 'Unlocks Neo Catcher', pt: 'Desbloqueia Neo Catcher' },
    lore: {
      en: 'A preservation ritual disguised as a game of falling lights.',
      pt: 'Um ritual de preservação disfarçado de jogo de luzes em queda.',
    },
    arcadePerk: {
      id: 'neo-catcher-catch-range',
      label: { en: 'Robot Reach', pt: 'Alcance do Robô' },
      description: { en: 'Neo Catcher robot catches objects with a wider area.', pt: 'O robô de Neo Catcher captura objetos em uma área maior.' },
      value: '+20%',
    },
    unlocksArcadeId: 'neo-catcher',
  },
  {
    id: 'wildcard-salto-espacial-second-chance',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Cosmic Spare Hull', pt: 'Curinga: Casco Reserva Cósmico' },
    role: { en: 'Space Jump passive perk', pt: 'Perk passivo do Salto Espacial' },
    lore: {
      en: 'A backup hull authorization stamped for the most stubborn pilots.',
      pt: 'Uma autorização de casco reserva carimbada para pilotos teimosos.',
    },
    arcadePerk: {
      id: 'space-jump-extra-life',
      label: { en: 'Extra Life', pt: 'Vida Extra' },
      description: { en: 'Space Jump starts with one emergency life.', pt: 'Salto Espacial começa com uma vida emergencial.' },
      value: '+1',
    },
    unlocksArcadeId: 'salto-espacial',
  },
  {
    id: 'wildcard-ruptura-estelar-score-multiplier',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Overdrive Spark', pt: 'Curinga: Centelha Overdrive' },
    role: { en: 'Stellar Rupture passive perk', pt: 'Perk passivo da Ruptura Estelar' },
    lore: {
      en: 'A tiny illegal capacitor that makes every takedown count harder.',
      pt: 'Um pequeno capacitor ilegal que faz cada inimigo vencido valer mais.',
    },
    arcadePerk: {
      id: 'stellar-rupture-score-multiplier',
      label: { en: 'Score Multiplier', pt: 'Pontuação Máxima' },
      description: { en: 'Every enemy defeated in Stellar Rupture grants 1.5x score.', pt: 'Cada inimigo vencido em Ruptura Estelar concede 1.5x da pontuação padrão.' },
      value: '1.5x',
    },
    unlocksArcadeId: 'ruptura-estelar',
  },
  {
    id: 'wildcard-danger-zoom-safe-scan',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Blue Scan Permit', pt: 'Curinga: Permissão Scan Azul' },
    role: { en: 'Danger Zoom Zones passive perk', pt: 'Perk passivo do Danger Zoom Zones' },
    lore: {
      en: 'A tiny permission slip that tells one mistake to stay quiet.',
      pt: 'Uma autorização mínima que manda um erro ficar quieto.',
    },
    arcadePerk: {
      id: 'danger-zoom-forgive-error',
      label: { en: 'Anti-Bomb Shield', pt: 'Escudo Anti Bomba' },
      description: { en: 'Danger Zoom Zones blocks the first bomb mistake once per run.', pt: 'Danger Zoom Zones bloqueia o primeiro erro com bomba uma vez por partida.' },
      value: '1x',
    },
    unlocksArcadeId: 'danger-zoom-zones',
  },
  {
    id: 'wildcard-grid-collapse-preview',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Prism Queue', pt: 'Curinga: Fila Prisma' },
    role: { en: 'Grid Collapse passive perk', pt: 'Perk passivo do Grid Collapse' },
    lore: {
      en: 'A preview lens that makes corrupted pieces feel slightly less smug.',
      pt: 'Uma lente de previsão que deixa peças corrompidas menos convencidas.',
    },
    arcadePerk: {
      id: 'grid-collapse-next-piece-preview',
      label: { en: 'Extra Preview', pt: 'Prévia Extra' },
      description: { en: 'Grid Collapse can show one additional upcoming piece.', pt: 'Grid Collapse pode mostrar uma peça futura adicional.' },
      value: '+1',
    },
    unlocksArcadeId: 'grid-collapse',
  },
  {
    id: 'wildcard-robot-runner-slow-aura',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Rubber Clock', pt: 'Curinga: Relógio Elástico' },
    role: { en: 'Robot Runner passive perk', pt: 'Perk passivo do Robot Runner' },
    lore: {
      en: 'A cheerful timing bug officially reclassified as accessibility.',
      pt: 'Um erro simpático de tempo oficialmente reclassificado como acessibilidade.',
    },
    arcadePerk: {
      id: 'robot-runner-ghost-slow',
      label: { en: 'Enemy Slow', pt: 'Inimigos Lentos' },
      description: { en: 'Robot Runner enemies are 10% slower during the run.', pt: 'Os inimigos de Robot Runner ficam 10% mais lentos durante a partida.' },
      value: '+10%',
    },
    unlocksArcadeId: 'robot-runner',
  },
  {
    id: 'wildcard-neo-catcher-combo-guard',
    cardClass: 'wildcard',
    rarity: 'wildcard',
    name: { en: 'Wildcard: Combo Safety Net', pt: 'Curinga: Rede de Combo' },
    role: { en: 'Neo Catcher passive perk', pt: 'Perk passivo do Neo Catcher' },
    lore: {
      en: 'A soft protocol that catches the streak right before pride drops it.',
      pt: 'Um protocolo macio que segura a sequência antes do orgulho derrubar.',
    },
    arcadePerk: {
      id: 'neo-catcher-damage-dodge',
      label: { en: 'Damage Dodge', pt: 'Chance Sem Dano' },
      description: { en: 'Neo Catcher has a 20% chance to ignore damage when an object falls.', pt: 'Neo Catcher tem 20% de chance de não sofrer dano quando um objeto cai.' },
      value: '20%',
    },
    unlocksArcadeId: 'neo-catcher',
  },
  {
    id: 'legacy-solar-quartermaster',
    slot: 'infrastructure',
    rarity: 'rare',
    name: { en: 'First Route Quartermaster', pt: 'Intendente da Primeira Rota' },
    role: { en: 'Chapter 1 legacy logistics', pt: 'Logística legado do Capítulo 1' },
    lore: {
      en: 'The old Solar Routes taught this office how to move hope before it expires.',
      pt: 'As antigas Rotas Solares ensinaram este gabinete a mover esperança antes que ela expire.',
    },
    effects: [
      { sector: 'economy', value: 9 },
      { sector: 'health', value: 4 },
    ],
  },
  {
    id: 'legacy-interstellar-envoy',
    slot: 'leadership',
    rarity: 'epic',
    name: { en: 'Long Bridge Envoy', pt: 'Emissária das Pontes Longas' },
    role: { en: 'Chapter 2 diplomatic memory', pt: 'Memória diplomática do Capítulo 2' },
    lore: {
      en: 'Knows which colony will fracture before the first argument becomes public.',
      pt: 'Sabe qual colônia vai rachar antes da primeira discussão virar pública.',
    },
    effects: [
      { sector: 'happiness', value: 9 },
      { sector: 'culture', value: 7 },
      { sector: 'security', value: 3 },
    ],
  },
  {
    id: 'legacy-void-veteran',
    slot: 'leadership',
    rarity: 'legendary',
    name: { en: 'Silent War Veteran', pt: 'Veterana da Guerra Silenciosa' },
    role: { en: 'Chapter 3 survival command', pt: 'Comando de sobrevivência do Capítulo 3' },
    lore: {
      en: 'After the Void, panic sounds slow.',
      pt: 'Depois do Vazio, o pânico parece lento.',
    },
    effects: [
      { sector: 'security', value: 15 },
      { sector: 'technology', value: 5 },
      { sector: 'happiness', value: -4 },
    ],
  },
  {
    id: 'legacy-perfect-route-planner',
    slot: 'infrastructure',
    rarity: 'epic',
    name: { en: 'Return Cartographer', pt: 'Cartógrafa do Retorno' },
    role: { en: 'Precision logistics', pt: 'Logística de precisão' },
    lore: {
      en: 'Turns impossible schedules into civic confidence.',
      pt: 'Transforma cronogramas impossíveis em confiança civil.',
    },
    effects: [
      { sector: 'economy', value: 10 },
      { sector: 'technology', value: 6 },
    ],
  },
  {
    id: 'legacy-civic-archive',
    slot: 'culture',
    rarity: 'legendary',
    name: { en: 'Living Memory Archive', pt: 'Arquivo da Memória Viva' },
    role: { en: 'Campaign memory', pt: 'Memória da campanha' },
    lore: {
      en: 'A living archive of every route that made New Earth possible.',
      pt: 'Um arquivo vivo de cada rota que tornou a Nova Terra possível.',
    },
    effects: [
      { sector: 'culture', value: 12 },
      { sector: 'happiness', value: 8 },
      { sector: 'technology', value: 4 },
    ],
  },
  {
    id: 'battle-white-spark',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'common',
    name: { en: 'First Ignition Wire', pt: 'Fio da Primeira Ignição' },
    role: { en: 'Starter battle card', pt: 'Carta de batalha inicial' },
    lore: {
      en: 'A clean ignition coil used by the first New Earth patrol ships.',
      pt: 'Uma bobina de ignição limpa usada pelas primeiras patrulhas da Nova Terra.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 10 },
      { stat: 'electricDamagePercent', value: 15 },
    ],
  },
  {
    id: 'battle-iron-pulse',
    cardClass: 'battle',
    slot: 'armor',
    rarity: 'common',
    name: { en: 'Oathbound Hull', pt: 'Casco do Juramento' },
    role: { en: 'Starter battle card', pt: 'Carta de batalha inicial' },
    lore: {
      en: 'Basic hull reinforcement with a stubborn shield pulse.',
      pt: 'Reforço básico de casco com um pulso de escudo teimoso.',
    },
    battleEffects: [
      { stat: 'healthPercent', value: 12 },
      { stat: 'shieldPercent', value: 10 },
    ],
  },
  {
    id: 'battle-white-trigger',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'common',
    name: { en: 'Skyward Redemption', pt: 'Redenção Aérea' },
    role: { en: 'Stable fire discipline', pt: 'Disciplina de disparo estável' },
    lore: {
      en: 'Old targeting discipline rebuilt for young colony pilots.',
      pt: 'Velha disciplina de mira reconstruída para pilotos jovens da colônia.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 8 },
      { stat: 'critChance', value: 3 },
    ],
  },
  {
    id: 'battle-white-bulwark',
    cardClass: 'battle',
    slot: 'armor',
    rarity: 'common',
    name: { en: 'First Light Wall', pt: 'Muralha da Primeira Luz' },
    role: { en: 'Starter survivability', pt: 'Sobrevivência inicial' },
    lore: {
      en: 'Simple plating that buys one more breath before the hull screams.',
      pt: 'Blindagem simples que compra mais um fôlego antes do casco gritar.',
    },
    battleEffects: [
      { stat: 'healthPercent', value: 10 },
      { stat: 'shieldPercent', value: 8 },
    ],
  },
  {
    id: 'battle-white-cinder',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'common',
    name: { en: 'Founding Ember Cell', pt: 'Brasa de Fundação' },
    role: { en: 'Starter fire output', pt: 'Dano de fogo inicial' },
    lore: {
      en: 'A modest heat cell that leaves orange scars in the air.',
      pt: 'Uma célula térmica modesta que deixa cicatrizes laranja no ar.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 6 },
      { stat: 'fireDamagePercent', value: 18 },
    ],
  },
  {
    id: 'battle-white-rime',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'common',
    name: { en: 'Cold Decree', pt: 'Decreto de Gelo' },
    role: { en: 'Starter ice control', pt: 'Controle gélido inicial' },
    lore: {
      en: 'A tiny cold routine that makes hostile engines hesitate.',
      pt: 'Uma pequena rotina fria que faz motores hostis hesitarem.',
    },
    battleEffects: [
      { stat: 'iceDamagePercent', value: 18 },
      { stat: 'bonusDamageVsSlowPercent', value: 8 },
    ],
  },
  {
    id: 'battle-white-capacitor',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'common',
    name: { en: 'Vigil Pulse', pt: 'Pulso de Vigília' },
    role: { en: 'Shield tuning', pt: 'Ajuste de escudo' },
    lore: {
      en: 'A light capacitor that keeps the first shield layer awake.',
      pt: 'Um capacitor leve que mantém a primeira camada de escudo acordada.',
    },
    battleEffects: [
      { stat: 'shieldPercent', value: 14 },
      { stat: 'electricDamagePercent', value: 10 },
    ],
  },
  {
    id: 'battle-white-needle',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'common',
    name: { en: 'Quiet Needle Sight', pt: 'Mira da Agulha Silenciosa' },
    role: { en: 'Critical starter', pt: 'Crítico inicial' },
    lore: {
      en: 'A narrow lens that rewards pilots who wait half a second longer.',
      pt: 'Uma lente estreita que recompensa pilotos que esperam meio segundo a mais.',
    },
    battleEffects: [
      { stat: 'critChance', value: 4 },
      { stat: 'critDamage', value: 20 },
    ],
  },
  {
    id: 'battle-blue-arc',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'rare',
    name: { en: 'Oath Arc', pt: 'Arco Juramentado' },
    role: { en: 'Electric pressure', pt: 'Pressão elétrica' },
    lore: {
      en: 'Turns standard fire into pale lightning stitched across the target.',
      pt: 'Transforma disparos comuns em relâmpagos claros costurados no alvo.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 14 },
      { stat: 'critChance', value: 4 },
      { stat: 'electricDamagePercent', value: 35 },
    ],
  },
  {
    id: 'battle-frost-halo',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'rare',
    name: { en: 'Boreal Halo', pt: 'Halo Boreal' },
    role: { en: 'Ice control', pt: 'Controle gélido' },
    lore: {
      en: 'A cold reactor ring that slows hostile movement before impact.',
      pt: 'Um anel de reator frio que desacelera movimentos hostis antes do impacto.',
    },
    battleEffects: [
      { stat: 'shieldPercent', value: 16 },
      { stat: 'iceDamagePercent', value: 30 },
      { stat: 'bonusDamageVsSlowPercent', value: 18 },
    ],
  },
  {
    id: 'battle-blue-shock-net',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'rare',
    name: { en: 'Rhythmbreaker Mesh', pt: 'Malha Quebra-Ritmo' },
    role: { en: 'Shock control', pt: 'Controle por choque' },
    lore: {
      en: 'A bright net of probability that interrupts hostile attack rhythm.',
      pt: 'Uma rede brilhante de probabilidade que interrompe o ritmo de ataque inimigo.',
    },
    battleEffects: [
      { stat: 'electricDamagePercent', value: 28 },
      { stat: 'shockedEnemySkipChance', value: 10 },
      { stat: 'bonusDamageVsShockedPercent', value: 18 },
    ],
  },
  {
    id: 'battle-blue-glacier-plate',
    cardClass: 'battle',
    slot: 'armor',
    rarity: 'rare',
    name: { en: 'Winter Plate', pt: 'Placa de Inverno' },
    role: { en: 'Cold defense', pt: 'Defesa gélida' },
    lore: {
      en: 'Armor that cools faster than panic can spread.',
      pt: 'Uma blindagem que resfria mais rápido do que o pânico consegue se espalhar.',
    },
    battleEffects: [
      { stat: 'healthPercent', value: 14 },
      { stat: 'shieldPercent', value: 18 },
      { stat: 'iceDamagePercent', value: 22 },
    ],
  },
  {
    id: 'battle-blue-cinder-vector',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'rare',
    name: { en: 'Incandescent Vector', pt: 'Vetor Incandescente' },
    role: { en: 'Fire criticals', pt: 'Críticos de fogo' },
    lore: {
      en: 'A heat vector that turns clean shots into burning fractures.',
      pt: 'Um vetor térmico que transforma tiros limpos em fraturas flamejantes.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 12 },
      { stat: 'critChance', value: 4 },
      { stat: 'fireDamagePercent', value: 30 },
    ],
  },
  {
    id: 'battle-blue-guardian-loop',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'rare',
    name: { en: 'Sentinel Loop', pt: 'Laço Sentinela' },
    role: { en: 'Shield economy', pt: 'Economia de escudo' },
    lore: {
      en: 'A defensive loop that keeps shield pressure from collapsing all at once.',
      pt: 'Um laço defensivo que impede o escudo de colapsar de uma vez só.',
    },
    battleEffects: [
      { stat: 'shieldPercent', value: 28 },
      { stat: 'healthPercent', value: 8 },
      { stat: 'specialCooldownPercent', value: 6 },
    ],
  },
  {
    id: 'battle-blue-fracture-sight',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'rare',
    name: { en: 'Faultline Sight', pt: 'Mira Linha de Falha' },
    role: { en: 'Critical precision', pt: 'Precisão crítica' },
    lore: {
      en: 'Shows the pilot where the armor already wants to break.',
      pt: 'Mostra ao piloto onde a blindagem já quer quebrar.',
    },
    battleEffects: [
      { stat: 'critChance', value: 6 },
      { stat: 'critDamage', value: 45 },
      { stat: 'damagePercent', value: 8 },
    ],
  },
  {
    id: 'battle-blue-ember-field',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'rare',
    name: { en: 'Afterburn Field', pt: 'Campo Pós-Chama' },
    role: { en: 'Burn follow-up', pt: 'Pressão contra chamas' },
    lore: {
      en: 'A contained burn field that teaches the ship to punish ignition.',
      pt: 'Um campo de combustão contido que ensina a nave a punir ignição.',
    },
    battleEffects: [
      { stat: 'fireDamagePercent', value: 24 },
      { stat: 'burningDamageOverTimePercent', value: 12 },
      { stat: 'bonusDamageVsBurningPercent', value: 18 },
    ],
  },
  {
    id: 'battle-violet-inferno',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'epic',
    name: { en: 'Ash Psalm', pt: 'Salmo das Cinzas' },
    role: { en: 'Fire aggression', pt: 'Agressão incendiária' },
    lore: {
      en: 'A combat script that leaves burning vectors in every evasive path.',
      pt: 'Um roteiro de combate que deixa vetores em chamas em cada rota de evasão.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 18 },
      { stat: 'critDamage', value: 60 },
      { stat: 'fireDamagePercent', value: 45 },
      { stat: 'burningDamageOverTimePercent', value: 20 },
    ],
  },
  {
    id: 'battle-violet-storm-lattice',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'epic',
    name: { en: 'Stormglass Lattice', pt: 'Malha Vidro-Tempestade' },
    role: { en: 'Electric burst build', pt: 'Build de explosão elétrica' },
    lore: {
      en: 'A lattice that makes every shot look like the sky tearing open.',
      pt: 'Uma malha que faz cada disparo parecer o céu se rasgando.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 16 },
      { stat: 'electricDamagePercent', value: 55 },
      { stat: 'shockedEnemySkipChance', value: 12 },
      { stat: 'bonusDamageVsShockedPercent', value: 30 },
    ],
  },
  {
    id: 'battle-violet-absolute-zero',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'epic',
    name: { en: 'Still Winter Core', pt: 'Núcleo Inverno Imóvel' },
    role: { en: 'Slow punishment', pt: 'Punição contra lentidão' },
    lore: {
      en: 'The reactor does not freeze enemies. It convinces time to do it.',
      pt: 'O reator não congela inimigos. Ele convence o tempo a fazer isso.',
    },
    battleEffects: [
      { stat: 'iceDamagePercent', value: 50 },
      { stat: 'bonusDamageVsSlowPercent', value: 36 },
      { stat: 'slowEnemyDamageReductionPercent', value: 18 },
      { stat: 'shieldPercent', value: 18 },
    ],
  },
  {
    id: 'battle-violet-war-heart',
    cardClass: 'battle',
    slot: 'armor',
    rarity: 'epic',
    name: { en: 'Last Stand Heart', pt: 'Coração da Última Linha' },
    role: { en: 'Heavy survival', pt: 'Sobrevivência pesada' },
    lore: {
      en: 'A stubborn heart for ships expected to return with missing paint.',
      pt: 'Um coração teimoso para naves que devem voltar sem parte da pintura.',
    },
    battleEffects: [
      { stat: 'healthPercent', value: 30 },
      { stat: 'shieldPercent', value: 26 },
      { stat: 'damagePercent', value: 10 },
      { stat: 'critDamage', value: 35 },
    ],
  },
  {
    id: 'battle-violet-triple-spark',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'epic',
    name: { en: 'Threefold Rift', pt: 'Fenda Tríplice' },
    role: { en: 'Hybrid elemental pressure', pt: 'Pressão elemental híbrida' },
    lore: {
      en: 'Three unstable vectors braided into a doctrine no instructor recommends.',
      pt: 'Três vetores instáveis trançados em uma doutrina que nenhum instrutor recomenda.',
    },
    battleEffects: [
      { stat: 'electricDamagePercent', value: 30 },
      { stat: 'fireDamagePercent', value: 30 },
      { stat: 'iceDamagePercent', value: 30 },
      { stat: 'critChance', value: 5 },
    ],
  },
  {
    id: 'battle-violet-execution-clock',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'epic',
    name: { en: 'Final Second Clock', pt: 'Relógio do Último Segundo' },
    role: { en: 'Critical finisher', pt: 'Finalização crítica' },
    lore: {
      en: 'Ticks only when the target is about to become a statistic.',
      pt: 'Só marca o tempo quando o alvo está prestes a virar estatística.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 14 },
      { stat: 'critChance', value: 8 },
      { stat: 'critDamage', value: 85 },
      { stat: 'specialCooldownPercent', value: 8 },
    ],
  },
  {
    id: 'battle-orange-trinity',
    cardClass: 'battle',
    slot: 'core',
    rarity: 'mythic',
    name: { en: 'Aurora Trina Reactor', pt: 'Reator Aurora Trina' },
    role: { en: 'Elemental command', pt: 'Comando elemental' },
    lore: {
      en: 'A forbidden reactor that makes fire, frost, and lightning agree for one shot.',
      pt: 'Um reator proibido que faz fogo, gelo e raio concordarem por um disparo.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 22 },
      { stat: 'critChance', value: 6 },
      { stat: 'electricDamagePercent', value: 35 },
      { stat: 'fireDamagePercent', value: 35 },
      { stat: 'iceDamagePercent', value: 35 },
    ],
  },
  {
    id: 'battle-orange-worldbreaker',
    cardClass: 'battle',
    slot: 'weapon',
    rarity: 'legendary',
    name: { en: 'Noonfall Lens', pt: 'Lente Queda do Meio-Dia' },
    role: { en: 'Pure annihilation', pt: 'Aniquilação pura' },
    lore: {
      en: 'A lens that refuses to treat armor as a serious argument.',
      pt: 'Uma lente que se recusa a tratar blindagem como argumento sério.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 34 },
      { stat: 'critChance', value: 9 },
      { stat: 'critDamage', value: 130 },
      { stat: 'fireDamagePercent', value: 45 },
      { stat: 'bonusDamageVsBurningPercent', value: 40 },
    ],
  },
  {
    id: 'battle-orange-aegis-star',
    cardClass: 'battle',
    slot: 'armor',
    rarity: 'legendary',
    name: { en: 'Aegis Star Mantle', pt: 'Manto da Estrela-Égide' },
    role: { en: 'Legendary survival', pt: 'Sobrevivência lendária' },
    lore: {
      en: 'A defensive mantle bright enough to make monsters choose easier prey.',
      pt: 'Um manto defensivo brilhante o suficiente para monstros escolherem presas mais fáceis.',
    },
    battleEffects: [
      { stat: 'healthPercent', value: 42 },
      { stat: 'shieldPercent', value: 48 },
      { stat: 'iceDamagePercent', value: 35 },
      { stat: 'slowEnemyDamageReductionPercent', value: 24 },
      { stat: 'specialCooldownPercent', value: 12 },
    ],
  },
  {
    id: 'battle-orange-tempest-crown',
    cardClass: 'battle',
    slot: 'tactic',
    rarity: 'legendary',
    name: { en: 'Crown of Unfinished Thunder', pt: 'Coroa do Trovão Inacabado' },
    role: { en: 'Shock commander', pt: 'Comando elétrico' },
    lore: {
      en: 'A crown for pilots who prefer the enemy never finishing its thought.',
      pt: 'Uma coroa para pilotos que preferem que o inimigo nunca termine o pensamento.',
    },
    battleEffects: [
      { stat: 'damagePercent', value: 24 },
      { stat: 'electricDamagePercent', value: 70 },
      { stat: 'shockedEnemySkipChance', value: 22 },
      { stat: 'bonusDamageVsShockedPercent', value: 55 },
      { stat: 'critChance', value: 7 },
    ],
  },
];

export const getCardById = (id?: string) => COLONY_CARD_CATALOG.find(card => card.id === id);

export const BATTLE_CARD_REWARD_POOL = COLONY_CARD_CATALOG
  .filter(card => isBattleCard(card))
  .map(card => card.id);

export const getOwnedArcadeIdsFromCards = (cardIds: string[]) => {
  const unlocked = new Set<string>();
  cardIds.forEach(id => {
    const card = getCardById(id);
    if (card?.unlocksArcadeId) unlocked.add(card.unlocksArcadeId);
  });
  return unlocked;
};

export const getCardStyle = (rarity: ColonyCardRarity, cardClass: ColonyCardClass = 'political') => {
  if (cardClass === 'wildcard' || rarity === 'wildcard') {
    return 'border-fuchsia-200/90 bg-gradient-to-br from-cyan-300/18 via-fuchsia-400/16 to-amber-300/18 shadow-[0_0_38px_rgba(34,211,238,0.24),0_0_42px_rgba(217,70,239,0.18)]';
  }

  if (cardClass === 'battle') {
    switch (rarity) {
      case 'mythic':
        return 'border-rose-200/90 bg-gradient-to-br from-rose-300/22 via-zinc-950 to-amber-300/16 shadow-[0_0_36px_rgba(244,114,182,0.28)]';
      case 'legendary':
        return 'border-orange-300/80 bg-gradient-to-br from-orange-400/20 via-zinc-950 to-amber-500/12 shadow-[0_0_30px_rgba(251,146,60,0.24)]';
      case 'epic':
        return 'border-violet-300/80 bg-gradient-to-br from-violet-400/20 via-zinc-950 to-fuchsia-500/12 shadow-[0_0_28px_rgba(168,85,247,0.24)]';
      case 'rare':
        return 'border-sky-300/80 bg-gradient-to-br from-sky-400/18 via-zinc-950 to-blue-500/12 shadow-[0_0_26px_rgba(56,189,248,0.22)]';
      default:
        return 'border-white/75 bg-gradient-to-br from-white/16 via-zinc-950 to-cyan-300/8 shadow-[0_0_20px_rgba(255,255,255,0.16)]';
    }
  }

  switch (rarity) {
    case 'mythic':
      return 'border-rose-200/80 bg-gradient-to-br from-rose-300/18 via-zinc-950 to-amber-300/12 shadow-[0_0_34px_rgba(244,114,182,0.22)]';
    case 'legendary':
      return 'border-amber-300/70 bg-gradient-to-br from-amber-300/15 via-zinc-950 to-emerald-400/10 shadow-[0_0_28px_rgba(251,191,36,0.18)]';
    case 'epic':
      return 'border-violet-300/70 bg-gradient-to-br from-violet-400/15 via-zinc-950 to-cyan-400/10 shadow-[0_0_28px_rgba(167,139,250,0.18)]';
    case 'rare':
      return 'border-cyan-300/70 bg-gradient-to-br from-cyan-400/15 via-zinc-950 to-blue-500/10 shadow-[0_0_28px_rgba(34,211,238,0.16)]';
    default:
      return 'border-zinc-500/70 bg-gradient-to-br from-zinc-400/10 via-zinc-950 to-white/5 shadow-[0_0_18px_rgba(161,161,170,0.12)]';
  }
};
