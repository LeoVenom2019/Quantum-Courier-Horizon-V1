import { ROUTES, type Route } from './game-data';

type RouteTier = Route['tier'] | 'Earth';
type MissionRarity = 'common' | 'rare' | 'legendary' | 'mythic' | 'alien';

const SOLAR_MISSION_REWARD_UPGRADE_COSTS = [
  2500,
  15000,
  100000,
  500000,
  2500000,
  10000000,
  40000000,
  150000000,
  500000000,
  2000000000,
];

const INTERSTELLAR_MISSION_REWARD_UPGRADE_COSTS = [
  1000000,
  10000000,
  20000000,
  30000000,
  40000000,
  75000000,
  150000000,
  200000000,
  500000000,
  1000000000,
];

const SOLAR_MISSION_RARITY_MULTIPLIERS: Record<MissionRarity, number> = {
  common: 1,
  rare: 3,
  legendary: 5,
  mythic: 6.5,
  alien: 8,
};

const INTERSTELLAR_MISSION_RARITY_MULTIPLIERS: Record<MissionRarity, number> = {
  common: 1,
  rare: 10,
  legendary: 50,
  mythic: 150,
  alien: 150,
};

export const BOSS_ENCOUNTER_COOLDOWN_MS = 12 * 60 * 1000;

export const getMissionRewardUpgradeCost = (level: number, tier: string) => {
  const costs = tier === 'Solar'
    ? SOLAR_MISSION_REWARD_UPGRADE_COSTS
    : INTERSTELLAR_MISSION_REWARD_UPGRADE_COSTS;

  return costs[level] || costs[costs.length - 1];
};

export const getMissionRarityMultiplier = (rarity: MissionRarity, tier: string) => {
  const multipliers = tier === 'Solar'
    ? SOLAR_MISSION_RARITY_MULTIPLIERS
    : INTERSTELLAR_MISSION_RARITY_MULTIPLIERS;

  return multipliers[rarity] || 1;
};

export const getRouteTierIndex = (route: Route) => {
  return Math.max(1, ROUTES.filter(candidate => candidate.tier === route.tier).findIndex(candidate => candidate.id === route.id) + 1);
};
export const getLocationCostMultiplier = (locationId: string, currentTier: string) => {
  const routeIndex = ROUTES.findIndex(route => route.id === locationId);
  const base = currentTier === 'Interstellar' ? 1.5 : 1.1;

  return Math.pow(base, routeIndex >= 0 ? routeIndex % 9 : 0);
};

export const getDeliveryFuelCost = (route: Route, valueUpgradeValue: number, currentQc: number) => {
  if ((currentQc === 0 && route.requiredShipLevel === 1) || route.tier === 'Interstellar') return 0;

  const costIncreaseMultiplier = 1 + valueUpgradeValue * 0.1;
  const routeTierIndex = route.tier === 'Solar' ? getRouteTierIndex(route) : 1;

  return Math.floor(10 * routeTierIndex * costIncreaseMultiplier);
};

export const getMiningProductionBase = (tier: RouteTier, robotLevel: number) => {
  return tier === 'Solar' && robotLevel <= 1 ? 0.7 : 0.5;
};

export const getSolarMissionRewardCap = (tier: string, unlockedRouteIds: string[]) => {
  if (tier !== 'Solar') return Number.POSITIVE_INFINITY;

  const unlockedSolarRoutes = ROUTES.filter(route => (
    route.tier === 'Solar'
    && unlockedRouteIds.includes(route.id)
  ));

  const topReward = unlockedSolarRoutes.reduce((maxReward, route) => Math.max(maxReward, route.reward), 2500);
  const topRouteMaxTheoretical = topReward * 45;

  return topRouteMaxTheoretical * 10;
};
