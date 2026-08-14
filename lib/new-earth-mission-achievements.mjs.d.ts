import type { NewEarthMissionState } from './new-earth-missions';

export function getNewEarthMissionCompletionKey(cycle: number, missionId: string): string;

export function getUncountedNewEarthMissionCompletionKeys(
  state: NewEarthMissionState,
  countedKeys: Set<string> | string[],
): string[];
