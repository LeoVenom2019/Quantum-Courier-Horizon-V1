// lib/game-state/slices/missionsReducer.ts

import { MissionsState, GameAction } from '../types';

export const initialMissionsState: MissionsState = {
  missions: [],
  historyStats: {},
  unlockedAchievements: [],
  achievementProgress: {},
  skillLendariaLevel: { Solar: 0, Interstellar: 0 },
  skillMiticaLevel: { Solar: 0, Interstellar: 0 },
  skillAlienLevel: { Solar: 0, Interstellar: 0 },
  skillTempoDinheiroLevel: { Solar: 0, Interstellar: 0 },
  skillRobosOlimpicosLevel: { Solar: 0, Interstellar: 0 },
  missionRewardLevel: { Solar: 0, Interstellar: 0 },
  missionMythicBonus: 0,
  missionAlienBonus: 0,
  missionLegendaryBonus: 0,
  autoClaimMissions: false,
  radarUnlocked: { Solar: false, Interstellar: false },
  completedInitialMissions: [],
  lastScanTime: 0,
};

export function missionsReducer(state: MissionsState = initialMissionsState, action: GameAction): MissionsState {
  switch (action.type) {
    case 'ADD_MISSION':
      return { ...state, missions: [...state.missions, action.payload.mission] };

    case 'UPDATE_MISSION': {
      const { id, delta } = action.payload;
      return {
        ...state,
        missions: state.missions.map(m => 
          m.id === id ? { ...m, current: m.current + delta, completed: m.current + delta >= m.target } : m
        )
      };
    }

    case 'COMPLETE_MISSION':
      return {
        ...state,
        missions: state.missions.map(m => m.id === action.payload.id ? { ...m, completed: true } : m)
      };

    case 'CLAIM_MISSION':
      return {
        ...state,
        missions: state.missions.filter(m => m.id !== action.payload.id)
      };

    case 'UNLOCK_ACHIEVEMENT':
      if (state.unlockedAchievements.includes(action.payload.id)) return state;
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, action.payload.id]
      };

    case 'UPDATE_HISTORY': {
      const { tier, field, amount } = action.payload;
      const stats = state.historyStats[tier] || {
        deliveries: 0, manualDeliveries: 0, autoDeliveries: 0, qcFromDeliveries: 0,
        qcFromMining: 0, qcFromExtraction: 0, qcSpent: 0, qcTotalAcquired: 0,
        missionsCompleted: 0, qcFromMissions: 0, qcFromTutorial: 0,
        randomBattlesFound: 0, radarBattlesFound: 0, manualMiningPacksSold: 0,
        autoMiningPacksSold: 0, manualExtractionPacksSold: 0, autoExtractionPacksSold: 0,
        qcFromBattles: 0, battlesWon: 0, perfectDeliveries: 0
      };
      return {
        ...state,
        historyStats: {
          ...state.historyStats,
          [tier]: {
            ...stats,
            [field]: ((stats[field as keyof typeof stats] as number) || 0) + amount
          }
        }
      };
    }

    case 'UPGRADE_SKILL': {
      const { skill, tier } = action.payload;
      const skillKey = `skill${skill.charAt(0).toUpperCase() + skill.slice(1)}Level` as keyof MissionsState;
      const currentLevels = state[skillKey] as Record<string, number>;
      return {
        ...state,
        [skillKey]: {
          ...currentLevels,
          [tier]: (currentLevels[tier] || 0) + 1
        }
      };
    }

    case 'SET_HISTORY_STATS': {
      return { ...state, historyStats: action.payload.stats };
    }

    case 'TOGGLE_AUTO_CLAIM':
      return { ...state, autoClaimMissions: !state.autoClaimMissions };

    case 'UNLOCK_RADAR':
      return {
        ...state,
        radarUnlocked: { ...state.radarUnlocked, [action.payload.tier]: true }
      };

    case 'SET_MISSIONS_DATA': {
      return { ...state, ...action.payload };
    }

    case 'SET_ACHIEVEMENT_PROGRESS': {
      const { achievementId, progress } = action.payload;
      return {
        ...state,
        achievementProgress: {
          ...state.achievementProgress,
          [achievementId]: progress
        }
      };
    }

    case 'UPDATE_ACHIEVEMENT_PROGRESS': {
      const { achievementId, progress, isAbsolute } = action.payload;
      const current = state.achievementProgress[achievementId] || 0;
      const next = isAbsolute ? progress : current + progress;
      return {
        ...state,
        achievementProgress: {
          ...state.achievementProgress,
          [achievementId]: next
        }
      };
    }

    case 'SET_COMPLETED_INITIAL_MISSIONS': {
      return { ...state, completedInitialMissions: action.payload.missionIds };
    }

    case 'SET_LAST_SCAN_TIME':
      return { ...state, lastScanTime: action.payload.time };

    case 'LOAD_SAVE': {
      return action.payload.missions;
    }

    case 'RESET_GAME':
      return initialMissionsState;

    default:
      return state;
  }
}
