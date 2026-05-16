// lib/game-state/slices/earthReducer.ts

import { EarthState, GameAction } from '../types';

export const initialEarthState: EarthState = {
  population: 0,
  maleRatio: 0.5,
  biodiversity: 0,
  health: 0,
  happiness: 0,
  security: 0,
  qualityOfLife: 0,
  season: 1,
  events: [],
  reconstructionProgress: {
    energy: 0,
    minerals: 0,
    tech: 0,
    food: 0,
    meds: 0
  },
  couples: 0,
  birthRegistry: {},
  projectBoostCount: 0,
  // Visual Restoration
  atmosphere: 0,
  temperature: 0,
  hydrosphere: 0,
  biosphere: 0,
};

export function earthReducer(state: EarthState = initialEarthState, action: GameAction): EarthState {
  switch (action.type) {
    case 'EARTH_TICK':
      // Lógica de simulação temporal simplificada para o reducer
      return state;

    case 'EARTH_SEND_RESOURCES': {
      const { reconstructionProgress } = state;
      const newProgress = { ...reconstructionProgress };
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in newProgress) {
          newProgress[key] = Math.min(100, newProgress[key] + value);
        }
      });
      return { ...state, reconstructionProgress: newProgress };
    }

    case 'APPLY_VOID_SHIPMENT': {
      const { resourceKey } = action.payload;
      const newState = { ...state };

      if (resourceKey === 'food') {
        newState.population += 1000;
        newState.reconstructionProgress = { ...newState.reconstructionProgress, food: Math.min(100, (newState.reconstructionProgress.food || 0) + 0.1) };
      }
      if (resourceKey === 'energy') newState.reconstructionProgress = { ...newState.reconstructionProgress, energy: Math.min(100, (newState.reconstructionProgress.energy || 0) + 0.1) };
      if (resourceKey === 'minerals') newState.reconstructionProgress = { ...newState.reconstructionProgress, minerals: Math.min(100, (newState.reconstructionProgress.minerals || 0) + 0.1) };
      if (resourceKey === 'meds') newState.reconstructionProgress = { ...newState.reconstructionProgress, meds: Math.min(100, (newState.reconstructionProgress.meds || 0) + 0.1) };
      if (resourceKey === 'tech') newState.reconstructionProgress = { ...newState.reconstructionProgress, tech: Math.min(100, (newState.reconstructionProgress.tech || 0) + 0.1) };

      return newState;
    }

    case 'SET_EARTH_DATA': {
      return { ...state, ...action.payload };
    }

    case 'LOAD_SAVE': {
      return action.payload.earth;
    }

    case 'UPDATE_EARTH_STATE': {
      return { ...state, ...action.payload };
    }

    case 'UPDATE_EARTH_RESTORATION': {
      const { statId, progress } = action.payload;
      return {
        ...state,
        [statId]: progress
      };
    }

    case 'RESET_GAME':
      return initialEarthState;

    default:
      return state;
  }
}
