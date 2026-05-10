// lib/game-state/rootReducer.ts

import { GameState, GameAction } from './types';
import { economyReducer, initialEconomyState }    from './slices/economyReducer';
import { progressionReducer, initialProgressionState } from './slices/progressionReducer';
import { miningReducer, initialMiningState }      from './slices/miningReducer';
import { combatReducer, initialCombatState }      from './slices/combatReducer';
import { missionsReducer, initialMissionsState }    from './slices/missionsReducer';
import { earthReducer, initialEarthState }       from './slices/earthReducer';
import { systemReducer, initialSystemState }     from './slices/systemReducer';

export function rootReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'RESET_GAME') {
    return {
      economy:     initialEconomyState,
      progression: initialProgressionState,
      mining:      initialMiningState,
      combat:      initialCombatState,
      missions:    initialMissionsState,
      earth:       initialEarthState,
      system:      initialSystemState,
    };
  }

  // LOAD_SAVE substitui o estado, mas fazemos merge com o INITIAL_STATE 
  // para garantir que novas fatias (slices) não fiquem undefined
  if (action.type === 'LOAD_SAVE') {
    const payload = action.payload || {};
    return {
      economy:     { ...initialEconomyState,     ...payload.economy },
      progression: { ...initialProgressionState, ...payload.progression },
      mining:      { ...initialMiningState,      ...payload.mining },
      combat:      { ...initialCombatState,      ...payload.combat },
      missions:    { 
        ...initialMissionsState,    
        ...payload.missions,
        // Deep merge critical nested objects
        missionRewardLevel: { ...initialMissionsState.missionRewardLevel, ...(payload.missions?.missionRewardLevel || {}) },
        skillLendariaLevel: { ...initialMissionsState.skillLendariaLevel, ...(payload.missions?.skillLendariaLevel || {}) },
        skillMiticaLevel: { ...initialMissionsState.skillMiticaLevel, ...(payload.missions?.skillMiticaLevel || {}) },
        skillAlienLevel: { ...initialMissionsState.skillAlienLevel, ...(payload.missions?.skillAlienLevel || {}) },
        skillTempoDinheiroLevel: { ...initialMissionsState.skillTempoDinheiroLevel, ...(payload.missions?.skillTempoDinheiroLevel || {}) },
        skillRobosOlimpicosLevel: { ...initialMissionsState.skillRobosOlimpicosLevel, ...(payload.missions?.skillRobosOlimpicosLevel || {}) },
        radarUnlocked: { ...initialMissionsState.radarUnlocked, ...(payload.missions?.radarUnlocked || {}) },
      },
      earth:       { ...initialEarthState,       ...payload.earth },
      system:      { ...initialSystemState,      ...payload.system },
    };
  }

  return {
    economy:     economyReducer(state.economy, action),
    progression: progressionReducer(state.progression, action),
    mining:      miningReducer(state.mining, action),
    combat:      combatReducer(state.combat, action),
    missions:    missionsReducer(state.missions, action),
    earth:       earthReducer(state.earth, action),
    system:      systemReducer(state.system, action),
  };
}
