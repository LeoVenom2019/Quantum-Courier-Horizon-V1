// lib/game-state/slices/economyReducer.ts

import { EconomyState, GameAction } from '../types';

export const initialEconomyState: EconomyState = {
  qc: 100, // Initial starting QC for new campaign
  aetherion: 0,
  miningWaste: 0,
  solarEnergy: 0,
  aetherionTubes: 0,
  totalExtractionProfit: 0,
};

export function economyReducer(state: EconomyState = initialEconomyState, action: GameAction): EconomyState {
  switch (action.type) {
    case 'EARN_QC':
      return { ...state, qc: (state.qc || 0) + (action.payload.amount || 0) };

    case 'SPEND_QC':
      return { ...state, qc: Math.max(0, (state.qc || 0) - (action.payload.amount || 0)) };

    case 'EARN_AETHERION':
      return { ...state, aetherion: Math.min(10000, (state.aetherion || 0) + (action.payload.amount || 0)) };

    case 'SPEND_AETHERION':
      return { ...state, aetherion: Math.max(0, (state.aetherion || 0) - (action.payload.amount || 0)) };

    case 'EARN_RESOURCES':
      return {
        ...state,
        miningWaste: (state.miningWaste || 0) + (action.payload.miningWaste || 0),
        solarEnergy: (state.solarEnergy || 0) + (action.payload.solarEnergy || 0),
        aetherionTubes: (state.aetherionTubes || 0) + (action.payload.aetherionTubes || 0),
        totalExtractionProfit: (state.totalExtractionProfit || 0) + (action.payload.totalExtractionProfit || 0),
      };

    case 'SET_QC':
      return { ...state, qc: action.payload.amount };

    case 'SET_AETHERION':
      return { ...state, aetherion: Math.min(10000, action.payload.amount) };

    case 'SET_RESOURCES':
      return {
        ...state,
        miningWaste: action.payload.miningWaste !== undefined ? action.payload.miningWaste : state.miningWaste,
        solarEnergy: action.payload.solarEnergy !== undefined ? action.payload.solarEnergy : state.solarEnergy,
        aetherionTubes: action.payload.aetherionTubes !== undefined ? action.payload.aetherionTubes : state.aetherionTubes,
        totalExtractionProfit: action.payload.totalExtractionProfit !== undefined ? action.payload.totalExtractionProfit : state.totalExtractionProfit,
      };

    case 'SELL_EXTRACTION_PACKS':
      return {
        ...state,
        qc: (state.qc || 0) + (action.payload.value || 0),
        totalExtractionProfit: (state.totalExtractionProfit || 0) + (action.payload.value || 0),
      };

    case 'SELL_ORE':
      return { ...state, qc: (state.qc || 0) + (action.payload.value || 0) };

    case 'BATTLE_WON':
      return { ...state, qc: (state.qc || 0) + (action.payload.reward || 0) };

    case 'SYNTHESIZE_AETHERION': {
      if (state.aetherionTubes <= 0) return state;
      return {
        ...state,
        aetherion: Math.min(10000, state.aetherion + 1000),
        aetherionTubes: state.aetherionTubes - 1,
      };
    }

    case 'RESET_GAME':
      return initialEconomyState;

    default:
      return state;
  }
}
