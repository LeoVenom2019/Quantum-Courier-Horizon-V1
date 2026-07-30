export interface NewEarthDefenseAchievementMetrics {
  landDefenseVictories?: number;
  seaDefenseVictories?: number;
  directBattleVictories?: number;
}

export interface NewEarthDefenseAchievementProgress {
  land: number;
  sea: number;
}

export function getNewEarthDefenseAchievementProgress(
  metrics: NewEarthDefenseAchievementMetrics,
): NewEarthDefenseAchievementProgress;
