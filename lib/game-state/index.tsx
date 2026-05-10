'use client';

// lib/game-state/index.tsx

import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { GameState, GameAction }  from './types';
import { rootReducer }            from './rootReducer';
import { initialEconomyState }    from './slices/economyReducer';
import { initialProgressionState }from './slices/progressionReducer';
import { initialMiningState }     from './slices/miningReducer';
import { initialCombatState }     from './slices/combatReducer';
import { initialMissionsState }   from './slices/missionsReducer';
import { initialEarthState }      from './slices/earthReducer';
import { initialSystemState }     from './slices/systemReducer';
import { GameStorage }            from '@/lib/game-storage';
import { SaveManager }            from '@/lib/save-manager';

const INITIAL_STATE: GameState = {
  economy:     initialEconomyState,
  progression: initialProgressionState,
  mining:      initialMiningState,
  combat:      initialCombatState,
  missions:    initialMissionsState,
  earth:       initialEarthState,
  system:      initialSystemState,
};

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Carregamento inicial do save
  const [state, dispatch] = useReducer(
    rootReducer,
    INITIAL_STATE
  );

  // Auto-save: mantém uma ref do estado atual para ser acessível
  // nos setInterval sem stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook principal
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}

// Hooks de slice para otimização (opcional, mas recomendado)
export const useEconomy     = () => useGame().state.economy;
export const useProgression = () => useGame().state.progression;
export const useMining      = () => useGame().state.mining;
export const useCombat      = () => useGame().state.combat;
export const useMissions    = () => useGame().state.missions;
export const useEarth       = () => useGame().state.earth;
export const useSystem      = () => useGame().state.system;
export const useDispatch    = () => useGame().dispatch;
