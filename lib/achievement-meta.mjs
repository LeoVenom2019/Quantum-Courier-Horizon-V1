const safeProgress = value => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

export const normalizeAchievementMetaForCatalog = (value, validAchievementIds) => {
  const validIds = new Set(validAchievementIds || []);
  const unlockedAchievements = Array.isArray(value?.unlockedAchievements)
    ? [...new Set(value.unlockedAchievements.filter(id => typeof id === 'string' && validIds.has(id)))]
    : [];
  const achievementProgress = value?.achievementProgress && typeof value.achievementProgress === 'object'
    ? Object.fromEntries(
      Object.entries(value.achievementProgress)
        .filter(([id, progress]) => validIds.has(id) && Number.isFinite(Number(progress)))
        .map(([id, progress]) => [id, safeProgress(progress)]),
    )
    : {};

  return { unlockedAchievements, achievementProgress };
};
