const safeCount = value => Math.max(0, Math.floor(Number(value) || 0));

export const getNewEarthDefenseAchievementProgress = ({
  landDefenseVictories,
  seaDefenseVictories,
  directBattleVictories,
}) => {
  const directVictories = safeCount(directBattleVictories);

  return {
    land: safeCount(landDefenseVictories) + directVictories,
    sea: safeCount(seaDefenseVictories) + directVictories,
  };
};
