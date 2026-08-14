export function normalizeAchievementProgressAmount(value: unknown): number;

export function getPirateBattleVictoryProgress(historyStats: Record<string, {
  battlesWon?: number;
}> | null | undefined): number;

export function getDeliveryMissionCompletionProgress(input: {
  historyStats: Record<string, { missionsCompleted?: number }> | null | undefined;
  missions: Array<{ tier?: string; completed?: boolean; claimed?: boolean }> | null | undefined;
}): number;

export function getReachedSubmarineDepthProgress(achievementMetrics: {
  maxSubmarineDepth?: number;
} | null | undefined): number;
