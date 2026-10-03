export function normalizeAchievementProgressAmount(value: unknown): number;

export function getPirateBattleVictoryProgress(input: {
  historyStats: Record<string, { battlesWon?: number }> | null | undefined;
  chapter4LandDefenseVictories?: number;
  chapter4SeaDefenseVictories?: number;
  chapter4DirectBattleVictories?: number;
}): number;

export function getDeliveryMissionCompletionProgress(input: {
  historyStats: Record<string, { missionsCompleted?: number }> | null | undefined;
  missions: Array<{ tier?: string; completed?: boolean; claimed?: boolean }> | null | undefined;
}): number;

export function getReachedSubmarineDepthProgress(achievementMetrics: {
  maxSubmarineDepth?: number;
} | null | undefined): number;
