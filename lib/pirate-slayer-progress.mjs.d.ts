export interface PirateSlayerMetrics {
  chapter1ManualVictories?: number;
  chapter2ManualVictories?: number;
  chapter4LandDefenseVictories?: number;
  chapter4SeaDefenseVictories?: number;
  chapter4DirectBattleVictories?: number;
}

export function getPirateSlayerProgress(metrics: PirateSlayerMetrics): number;
