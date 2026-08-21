export type Cap12AutomaticBattleResult = 'victory' | 'defeat';

export function getCap12TotalWinChance(
  baseChance: number,
  doomBonus?: number,
  policeBonus?: number,
): number;

export function getCap12DisplayedWinChance(
  baseChance: number,
  doomBonus?: number,
  policeBonus?: number,
): number;

export function rollCap12AutomaticBattle(
  totalWinChance: number,
  random?: () => number,
): Cap12AutomaticBattleResult;
