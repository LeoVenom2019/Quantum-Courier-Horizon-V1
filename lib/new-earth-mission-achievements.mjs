export const getNewEarthMissionCompletionKey = (cycle, missionId) => (
  `${Math.max(0, Math.floor(Number(cycle) || 0))}:${String(missionId || '')}`
);

export const getUncountedNewEarthMissionCompletionKeys = (state, countedKeys) => {
  const counted = countedKeys instanceof Set ? countedKeys : new Set(countedKeys || []);
  if (!state || !Array.isArray(state.missions)) return [];

  return state.missions
    .filter(mission => mission?.completed && typeof mission.id === 'string')
    .map(mission => getNewEarthMissionCompletionKey(state.cycle, mission.id))
    .filter(key => !counted.has(key));
};
