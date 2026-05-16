// lib/game-state/slices/systemReducer.ts

import { SystemState, GameAction } from '../types';

export const initialSystemState: SystemState = {
  seenTutorials: {},
  arcadeScores: {},
  localRecords: [],
  hasSeenRoute2UnlockMessage: false,
  playerName: '',
};

export function systemReducer(state: SystemState = initialSystemState, action: GameAction): SystemState {
  switch (action.type) {
    case 'COMPLETE_TUTORIAL': {
      const { tutorialId } = action.payload;
      return {
        ...state,
        seenTutorials: {
          ...state.seenTutorials,
          [tutorialId]: true,
        },
      };
    }

    case 'SET_ARCADE_SCORE': {
      const { gameId, score } = action.payload;
      return {
        ...state,
        arcadeScores: {
          ...state.arcadeScores,
          [gameId]: Math.max(state.arcadeScores[gameId] || 0, score),
        },
      };
    }

    case 'ADD_LOCAL_RECORD': {
      return {
        ...state,
        localRecords: [action.payload.record, ...state.localRecords].slice(0, 50),
      };
    }

    case 'SET_HAS_SEEN_ROUTE2_MESSAGE': {
      return {
        ...state,
        hasSeenRoute2UnlockMessage: action.payload.hasSeen,
      };
    }

    case 'SET_SYSTEM_DATA': {
      return {
        ...state,
        ...action.payload,
      };
    }

    case 'LOAD_SAVE': {
      return action.payload.system;
    }

    case 'RESET_GAME':
      return initialSystemState;

    default:
      return state;
  }
}
