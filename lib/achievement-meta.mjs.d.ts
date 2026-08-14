export function normalizeAchievementMetaForCatalog(
  value: unknown,
  validAchievementIds: Iterable<string>,
): {
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
};
