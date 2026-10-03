export const getExtractionUnlockProgress = (points, unlockedPointIds, tier = 'Interstellar') => {
  const requiredIds = points
    .filter(point => point.tier === tier)
    .map(point => point.id);
  const unlockedIds = new Set(unlockedPointIds || []);
  const unlocked = requiredIds.filter(id => unlockedIds.has(id)).length;
  const total = requiredIds.length;

  return {
    unlocked,
    total,
    progress: total > 0 ? (unlocked / total) * 100 : 100,
    allUnlocked: total === 0 || unlocked === total,
  };
};
