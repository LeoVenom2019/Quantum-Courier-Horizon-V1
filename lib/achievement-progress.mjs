const safeProgress = value => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

export const normalizeAchievementProgressAmount = value => safeProgress(value);

export const getPirateBattleVictoryProgress = ({
  historyStats,
  chapter4LandDefenseVictories,
  chapter4SeaDefenseVictories,
  chapter4DirectBattleVictories,
}) => (
  safeProgress(historyStats?.Solar?.battlesWon)
  + safeProgress(historyStats?.Interstellar?.battlesWon)
  + safeProgress(chapter4LandDefenseVictories)
  + safeProgress(chapter4SeaDefenseVictories)
  + safeProgress(chapter4DirectBattleVictories)
);

export const getDeliveryMissionCompletionProgress = ({ historyStats, missions }) => {
  const claimedCompletions = safeProgress(historyStats?.Solar?.missionsCompleted)
    + safeProgress(historyStats?.Interstellar?.missionsCompleted);
  const completedUnclaimed = Array.isArray(missions)
    ? missions.filter(mission => (
      (mission?.tier === 'Solar' || mission?.tier === 'Interstellar')
      && mission.completed === true
      && mission.claimed !== true
    )).length
    : 0;

  return claimedCompletions + completedUnclaimed;
};

export const getReachedSubmarineDepthProgress = achievementMetrics => (
  safeProgress(achievementMetrics?.maxSubmarineDepth)
);
