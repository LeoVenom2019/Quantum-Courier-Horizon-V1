// lib/game-state/slices/combatReducer.ts

import { CombatState, GameAction } from '../types';

export const initialCombatState: CombatState = {
  activeBattle: null,
  foundBattle: null,
  voidBattleStatus: 'idle',
  voidBattleShipStats: {
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    damage: 10,
    critChance: 0.1,
    lootEfficiency: 1,
    rarity: 'common',
    upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 }
  },
  isRetributionActive: false,
  isFatigueActive: false,
  voidResources: { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
  voidCompactedResources: {},
  voidPOIsInspiration: {
    'poi-1': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-2': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-3': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
    'poi-4': { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 }
  },
  isVoidWarActive: false,
  voidWarProgress: { currentSector: 1, currentBattle: 1 },
  robotRepairProgress: 0,
  isRobotRepaired: false,
  voidPOIQCDonations: {},
  underAttackBattle: null,
  // Aircraft System
  unlockedVoidAircraft: ['va-1'],
  voidAircraftMissions: {
    'va-1': { status: 'idle' },
    'va-2': { status: 'idle' },
    'va-3': { status: 'idle' }
  },
  voidAircraftUpgrades: {
    'va-1': { storage: 0, quality: 0, time: 0, auto: 0 },
    'va-2': { storage: 0, quality: 0, time: 0, auto: 0 },
    'va-3': { storage: 0, quality: 0, time: 0, auto: 0 }
  },
  voidAircraftConstruction: {},
  voidAircraftAutoToggles: {},
  voidDonationModes: {},
  hasWonEliminateEnemiesRoute3: false,
  terraPassiveProgress: 0,
  terraDirectProgress: 0,
  lastPassiveContributionTimes: {},
};

const sanitizeVoidResources = (res: any) => {
  return {
    minerals: Number(res?.minerals) || 0,
    energy: Number(res?.energy) || 0,
    food: Number(res?.food) || 0,
    tech: Number(res?.tech) || 0,
    meds: Number(res?.meds) || 0,
  };
};

export function combatReducer(state: CombatState = initialCombatState, action: GameAction): CombatState {
  switch (action.type) {
    case 'START_BATTLE':
      return { ...state, activeBattle: action.payload.battle, foundBattle: null };

    case 'BATTLE_PLAYER_ATTACK': {
      if (!state.activeBattle) return state;
      return {
        ...state,
        activeBattle: {
          ...state.activeBattle,
          enemyHp: Math.max(0, state.activeBattle.enemyHp - action.payload.damage)
        }
      };
    }

    case 'BATTLE_ENEMY_ATTACK': {
      if (!state.activeBattle) return state;
      return {
        ...state,
        activeBattle: {
          ...state.activeBattle,
          playerHp: Math.max(0, state.activeBattle.playerHp - action.payload.damage)
        }
      };
    }

    case 'BATTLE_WON':
      return { ...state, activeBattle: null, voidBattleStatus: 'won' };

    case 'BATTLE_LOST':
      return { ...state, activeBattle: null, voidBattleStatus: 'lost' };

    case 'FLEE_BATTLE':
      return { ...state, activeBattle: null, voidBattleStatus: 'idle' };

    case 'FIND_BATTLE':
      return { ...state, foundBattle: action.payload.battle };

    case 'DISMISS_FOUND_BATTLE':
      return { ...state, foundBattle: null };

    case 'SET_VOID_BATTLE_STATUS':
      return { ...state, voidBattleStatus: action.payload.status };

    case 'UPGRADE_VOID_SHIP': {
      const { stat } = action.payload;
      return {
        ...state,
        voidBattleShipStats: {
          ...state.voidBattleShipStats,
          upgrades: {
            ...state.voidBattleShipStats.upgrades,
            [stat]: state.voidBattleShipStats.upgrades[stat] + 1
          }
        }
      };
    }

    case 'TOGGLE_RETRIBUTION':
      return { ...state, isRetributionActive: !state.isRetributionActive };

    case 'TOGGLE_FATIGUE':
      return { ...state, isFatigueActive: !state.isFatigueActive };

    case 'EARN_VOID_RESOURCES': {
      const current = sanitizeVoidResources(state.voidResources);
      return {
        ...state,
        voidResources: {
          minerals: current.minerals + (Number(action.payload.minerals) || 0),
          energy: current.energy + (Number(action.payload.energy) || 0),
          food: current.food + (Number(action.payload.food) || 0),
          tech: current.tech + (Number(action.payload.tech) || 0),
          meds: current.meds + (Number(action.payload.meds) || 0),
        }
      };
    }

    case 'COMPACT_VOID_RESOURCES': {
      const { key, amount } = action.payload;
      return {
        ...state,
        voidResources: {
          ...state.voidResources,
          [key]: state.voidResources[key as keyof CombatState['voidResources']] - amount
        },
        voidCompactedResources: {
          ...state.voidCompactedResources,
          [key]: (state.voidCompactedResources[key] || 0) + 1
        }
      };
    }

    case 'SPEND_VOID_RESOURCES': {
      const newResources = { ...state.voidResources };
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in newResources) {
          (newResources as any)[key] = Math.max(0, (newResources as any)[key] - (value as number));
        }
      });
      return { ...state, voidResources: newResources };
    }

    case 'UPDATE_VOID_COMPACTED': {
      const { key, delta } = action.payload;
      return {
        ...state,
        voidCompactedResources: {
          ...state.voidCompactedResources,
          [key]: Math.max(0, (state.voidCompactedResources[key] || 0) + delta)
        }
      };
    }

    case 'SET_VOID_POI_INSPIRATION':
      return { ...state, voidPOIsInspiration: action.payload.inspiration };

    case 'DONATE_VOID_RESOURCES': {
      const { poiId, resourceKey, amount } = action.payload;
      const currentPOI = state.voidPOIsInspiration[poiId] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0, qc: 0 };
      return {
        ...state,
        voidResources: {
          ...state.voidResources,
          [resourceKey]: Math.max(0, state.voidResources[resourceKey as keyof CombatState['voidResources']] - amount)
        },
        voidPOIsInspiration: {
          ...state.voidPOIsInspiration,
          [poiId]: {
            ...currentPOI,
            [resourceKey]: (currentPOI[resourceKey as keyof typeof currentPOI] || 0) + amount
          }
        }
      };
    }

    case 'DONATE_VOID_QC': {
      const { poiId, amount } = action.payload;
      return {
        ...state,
        voidPOIQCDonations: {
          ...state.voidPOIQCDonations,
          [poiId]: (state.voidPOIQCDonations[poiId] || 0) + amount
        }
      };
    }

    case 'SET_VOID_BATTLE_SHIP_STATS':
      return { ...state, voidBattleShipStats: action.payload.stats };
    
    case 'SET_UNDER_ATTACK_BATTLE':
      return { ...state, underAttackBattle: action.payload.battle };

    case 'APPLY_TERRA_PASSIVE_PROGRESS': {
      const { amount, poiId, nextTime } = action.payload;
      return {
        ...state,
        terraPassiveProgress: Math.min(100, state.terraPassiveProgress + amount),
        lastPassiveContributionTimes: {
          ...state.lastPassiveContributionTimes,
          [poiId]: nextTime
        }
      };
    }

    case 'DONATE_TO_TERRA_PROJECT': {
      const { resourceKey, amount, progressDelta } = action.payload;
      const newState = { ...state };
      
      if (resourceKey === 'QC') {
        // QC handled via separate action or payload
      } else {
        newState.voidResources = {
          ...state.voidResources,
          [resourceKey]: Math.max(0, state.voidResources[resourceKey as keyof CombatState['voidResources']] - amount)
        };
      }
      
      newState.terraDirectProgress = Math.min(100, state.terraDirectProgress + progressDelta);
      return newState;
    }

    case 'TOGGLE_VOID_WAR':
      return { ...state, isVoidWarActive: action.payload.active };

    case 'REPAIR_ROBOT':
      return { 
        ...state, 
        robotRepairProgress: Math.min(100, state.robotRepairProgress + action.payload.amount),
        isRobotRepaired: state.robotRepairProgress + action.payload.amount >= 100
      };

    case 'SET_COMBAT_DATA': {
      const newState = { ...state, ...action.payload };
      if (action.payload.voidResources) {
        newState.voidResources = sanitizeVoidResources(action.payload.voidResources);
      }
      return newState;
    }

    case 'SET_UNLOCKED_VOID_AIRCRAFT':
      return { ...state, unlockedVoidAircraft: action.payload.aircraftIds };

    case 'SET_VOID_AIRCRAFT_MISSION':
      return {
        ...state,
        voidAircraftMissions: {
          ...state.voidAircraftMissions,
          [action.payload.aircraftId]: action.payload.mission
        }
      };

    case 'SET_VOID_AIRCRAFT_UPGRADE':
      return {
        ...state,
        voidAircraftUpgrades: {
          ...state.voidAircraftUpgrades,
          [action.payload.aircraftId]: action.payload.upgrades
        }
      };

    case 'SET_VOID_AIRCRAFT_CONSTRUCTION': {
      const { aircraftId, construction } = action.payload;
      const nextConstruction = { ...state.voidAircraftConstruction };
      if (construction === null) {
        delete nextConstruction[aircraftId];
      } else {
        nextConstruction[aircraftId] = construction;
      }
      return { ...state, voidAircraftConstruction: nextConstruction };
    }

    case 'SET_VOID_AIRCRAFT_AUTO_TOGGLE':
      return {
        ...state,
        voidAircraftAutoToggles: {
          ...state.voidAircraftAutoToggles,
          [action.payload.aircraftId]: action.payload.active
        }
      };

    case 'SET_AIRCRAFT_DATA':
      return { ...state, ...action.payload };

    case 'LOAD_SAVE': {
      return action.payload.combat;
    }

    case 'RESET_GAME':
      return initialCombatState;

    default:
      return state;
  }
}
