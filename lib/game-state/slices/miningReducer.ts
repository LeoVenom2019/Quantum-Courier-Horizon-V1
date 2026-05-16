// lib/game-state/slices/miningReducer.ts

import { MiningState, GameAction } from '../types';

export const initialMiningState: MiningState = {
  miningRobots: {},
  miningRobotLevels: {},
  oresCollected: {},
  autoSellByOre: {},
  autoSellUnlockedByOre: {},
  miningCompressionLevels: {},
  extractionPacks: {},
  extractionRobotLevels: {},
  extractionProductionLevels: {},
  extractionAutoSell: {},
  extractionAutoSellUnlocked: {},
  extractionCompressionLevels: {},
  unlockedExtractionPoints: [],
  researchingExtractionPoint: null,
  voidAutoShipmentUnlocked: false,
  voidAutoShipmentActive: false,
  extractionCycleProgress: {},
};

export function miningReducer(state: MiningState = initialMiningState, action: GameAction): MiningState {
  switch (action.type) {
    case 'BUY_MINING_ROBOT': {
      const { oreId } = action.payload;
      return {
        ...state,
        miningRobots: {
          ...state.miningRobots,
          [oreId]: (state.miningRobots[oreId] || 0) + 1,
        },
      };
    }

    case 'UPGRADE_MINING_ROBOT': {
      const { oreId } = action.payload;
      const currentLevel = state.miningRobotLevels[oreId] || 0;
      return {
        ...state,
        miningRobotLevels: {
          ...state.miningRobotLevels,
          [oreId]: currentLevel + 1,
        },
      };
    }

    case 'COLLECT_ORE': {
      const { oreId, amount } = action.payload;
      return {
        ...state,
        oresCollected: {
          ...state.oresCollected,
          [oreId]: (state.oresCollected[oreId] || 0) + amount,
        },
      };
    }

    case 'SELL_ORE': {
      const { oreId } = action.payload;
      return {
        ...state,
        oresCollected: { ...state.oresCollected, [oreId]: 0 },
      };
    }

    case 'TOGGLE_AUTO_SELL_ORE': {
      const { oreId } = action.payload;
      return {
        ...state,
        autoSellByOre: {
          ...state.autoSellByOre,
          [oreId]: !state.autoSellByOre[oreId],
        },
      };
    }

    case 'UPGRADE_MINING_COMPRESSION': {
      const { oreId } = action.payload;
      return {
        ...state,
        miningCompressionLevels: {
          ...state.miningCompressionLevels,
          [oreId]: (state.miningCompressionLevels[oreId] || 0) + 1,
        },
      };
    }

    case 'START_EXTRACTION_RESEARCH': {
      const { pointId, endTime } = action.payload;
      return {
        ...state,
        researchingExtractionPoint: {
          id: pointId,
          startTime: Date.now(),
          endTime,
        },
      };
    }

    case 'FINISH_EXTRACTION_RESEARCH': {
      const { pointId } = action.payload;
      const already = state.unlockedExtractionPoints.includes(pointId);
      return {
        ...state,
        researchingExtractionPoint: null,
        unlockedExtractionPoints: already
          ? state.unlockedExtractionPoints
          : [...state.unlockedExtractionPoints, pointId],
      };
    }

    case 'SET_RESEARCHING_EXTRACTION_POINT':
      return { ...state, researchingExtractionPoint: action.payload.research };

    case 'ADD_EXTRACTION_PACKS': {
      const { pointId, amount } = action.payload;
      const MAX_STOCK = 2000;
      const current = state.extractionPacks[pointId] || 0;
      return {
        ...state,
        extractionPacks: {
          ...state.extractionPacks,
          [pointId]: Math.min(MAX_STOCK, current + amount),
        },
      };
    }

    case 'SELL_EXTRACTION_PACKS': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionPacks: { ...state.extractionPacks, [pointId]: 0 },
      };
    }

    case 'UPGRADE_EXTRACTION_ROBOT': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionRobotLevels: {
          ...state.extractionRobotLevels,
          [pointId]: (state.extractionRobotLevels[pointId] || 0) + 1,
        },
      };
    }

    case 'UPGRADE_EXTRACTION_PRODUCTION': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionProductionLevels: {
          ...state.extractionProductionLevels,
          [pointId]: (state.extractionProductionLevels[pointId] || 0) + 1,
        },
      };
    }

    case 'UPGRADE_EXTRACTION_COMPRESSION': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionCompressionLevels: {
          ...state.extractionCompressionLevels,
          [pointId]: (state.extractionCompressionLevels[pointId] || 0) + 1,
        },
      };
    }

    case 'TOGGLE_EXTRACTION_AUTO_SELL': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionAutoSell: {
          ...state.extractionAutoSell,
          [pointId]: !state.extractionAutoSell[pointId],
        },
      };
    }

    case 'BOOST_EXTRACTION_RESEARCH': {
      if (!state.researchingExtractionPoint) return state;
      const { amount } = action.payload;
      return {
        ...state,
        researchingExtractionPoint: {
          ...state.researchingExtractionPoint,
          endTime: state.researchingExtractionPoint.endTime - amount * 1000,
        },
      };
    }

    case 'UNLOCK_EXTRACTION_AUTO_SELL': {
      const { pointId } = action.payload;
      return {
        ...state,
        extractionAutoSellUnlocked: {
          ...state.extractionAutoSellUnlocked,
          [pointId]: true,
        },
      };
    }

    case 'SET_MINING_ROBOTS': {
      return { ...state, miningRobots: action.payload.robots };
    }

    case 'SET_MINING_ROBOT_LEVELS': {
      return { ...state, miningRobotLevels: action.payload.levels };
    }

    case 'SET_ORES_COLLECTED': {
      return { ...state, oresCollected: action.payload.ores };
    }

    case 'SET_AUTO_SELL_BY_ORE': {
      return { ...state, autoSellByOre: action.payload.autoSell };
    }

    case 'SET_AUTO_SELL_UNLOCKED_BY_ORE': {
      return { ...state, autoSellUnlockedByOre: action.payload.unlocked };
    }

    case 'SET_MINING_COMPRESSION_LEVELS': {
      return { ...state, miningCompressionLevels: action.payload.levels };
    }

    case 'SET_EXTRACTION_DATA': {
      const { packs, robots, production, compression, autoSell, autoSellUnlocked } = action.payload;
      return {
        ...state,
        extractionPacks: packs || state.extractionPacks,
        extractionRobotLevels: robots || state.extractionRobotLevels,
        extractionProductionLevels: production || state.extractionProductionLevels,
        extractionCompressionLevels: compression || state.extractionCompressionLevels,
        extractionAutoSell: autoSell || state.extractionAutoSell,
        extractionAutoSellUnlocked: autoSellUnlocked || state.extractionAutoSellUnlocked,
      };
    }

    case 'SET_UNLOCKED_EXTRACTION_POINTS': {
      return { ...state, unlockedExtractionPoints: action.payload.pointIds };
    }

    case 'TOGGLE_VOID_AUTO_SHIPMENT':
      return { ...state, voidAutoShipmentActive: !state.voidAutoShipmentActive };

    case 'SET_VOID_AUTO_SHIPMENT_UNLOCKED':
      return { ...state, voidAutoShipmentUnlocked: action.payload.unlocked };

    case 'SET_EXTRACTION_PROGRESS':
      return { ...state, extractionCycleProgress: action.payload.progress };

    case 'SET_MINING_DATA': {
      return { ...state, ...action.payload };
    }

    case 'LOAD_SAVE': {
      return action.payload.mining;
    }

    case 'RESET_GAME':
      return initialMiningState;

    default:
      return state;
  }
}
