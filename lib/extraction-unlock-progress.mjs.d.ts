export interface ExtractionUnlockProgress {
  unlocked: number;
  total: number;
  progress: number;
  allUnlocked: boolean;
}

export function getExtractionUnlockProgress(
  points: Array<{ id: string; tier: string }>,
  unlockedPointIds: string[],
  tier?: string,
): ExtractionUnlockProgress;
