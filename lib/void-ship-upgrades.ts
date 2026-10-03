export const VOID_SHIP_BASE_DAMAGE = 100;
export const VOID_SHIP_BASE_CRIT_CHANCE = 0.10;
export const VOID_SHIP_BASE_LOOT_EFFICIENCY = 1;

export const VOID_SHIP_DAMAGE_PER_LEVEL = 0.15;
export const VOID_SHIP_CRIT_CHANCE_PER_LEVEL = 0.10;
export const VOID_SHIP_LOOT_BONUS_PER_LEVEL = 0.10;

export type VoidShipUpgradeLevels = {
  damage: number;
  shield: number;
  crit: number;
  loot: number;
};

const normalizeLevel = (level: number) => Math.max(0, Math.min(5, Number(level) || 0));

export const getVoidShipDamage = (level: number) =>
  VOID_SHIP_BASE_DAMAGE * (1 + normalizeLevel(level) * VOID_SHIP_DAMAGE_PER_LEVEL);

export const getVoidShipCritChance = (level: number) =>
  VOID_SHIP_BASE_CRIT_CHANCE + normalizeLevel(level) * VOID_SHIP_CRIT_CHANCE_PER_LEVEL;

export const getVoidShipLootEfficiency = (level: number) =>
  VOID_SHIP_BASE_LOOT_EFFICIENCY + normalizeLevel(level) * VOID_SHIP_LOOT_BONUS_PER_LEVEL;

/** Recalculates upgraded stats so existing saves also adopt the current balance. */
export const applyVoidShipUpgradeBalance = <T extends {
  damage: number;
  critChance: number;
  lootEfficiency: number;
  upgrades: VoidShipUpgradeLevels;
}>(stats: T): T => ({
  ...stats,
  damage: stats.upgrades.damage > 0 ? getVoidShipDamage(stats.upgrades.damage) : stats.damage,
  critChance: stats.upgrades.crit > 0 ? getVoidShipCritChance(stats.upgrades.crit) : stats.critChance,
  lootEfficiency: stats.upgrades.loot > 0 ? getVoidShipLootEfficiency(stats.upgrades.loot) : stats.lootEfficiency,
});
