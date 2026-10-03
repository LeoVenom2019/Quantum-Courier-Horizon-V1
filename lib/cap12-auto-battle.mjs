export const getCap12TotalWinChance = (baseChance, doomBonus = 0, policeBonus = 0) => (
  Math.max(0, Number(baseChance) || 0)
  + Math.max(0, Number(doomBonus) || 0)
  + Math.max(0, Number(policeBonus) || 0)
);

export const getCap12DisplayedWinChance = (baseChance, doomBonus = 0, policeBonus = 0) => (
  Math.min(100, getCap12TotalWinChance(baseChance, doomBonus, policeBonus))
);

export const rollCap12AutomaticBattle = (totalWinChance, random = Math.random) => {
  const chance = Math.max(0, Number(totalWinChance) || 0);
  if (chance >= 100) return 'victory';
  if (chance <= 0) return 'defeat';
  return random() * 100 < chance ? 'victory' : 'defeat';
};
