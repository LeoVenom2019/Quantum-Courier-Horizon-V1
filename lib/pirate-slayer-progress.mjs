const safeCount = value => Math.max(0, Math.floor(Number(value) || 0));

export const getPirateSlayerProgress = ({
  chapter1ManualVictories,
  chapter2ManualVictories,
  chapter4LandDefenseVictories,
  chapter4SeaDefenseVictories,
  chapter4DirectBattleVictories,
}) => safeCount(chapter1ManualVictories)
  + safeCount(chapter2ManualVictories)
  + safeCount(chapter4LandDefenseVictories)
  + safeCount(chapter4SeaDefenseVictories)
  + safeCount(chapter4DirectBattleVictories);
