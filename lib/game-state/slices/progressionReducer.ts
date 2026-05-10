// lib/game-state/slices/progressionReducer.ts

import { ProgressionState, GameAction } from '../types';

export const initialProgressionState: ProgressionState = {
  routeTier: 'Solar',
  unlockedRouteIds: ['terra'],
  ownedShips: {}, // Start with no ships, player must acquire Atlas Courier
  techLevels: {},
  unlockedTechLevels: { 'Solar': 1 },
  autoTravelSlots: {},
  shipLevel: 1,
  shipXP: 0,
  battleLevel: 1,
  radarLevel: 1,
  privatePoliceLevel: 0,
  doubleRouteLevel: 0,
  doomPLevel: 0,
  captureLevel: 0,
  extractionTechLevel: 0,
  solarMappingLevel: 0,
  warCoreLevel: 0,
  battleShipUpgradeLevel: 0,
  route4Unlocked: false,
  gameTimeSeconds: 0,
  autoSkipRandomBattles: false,
  researchingTech: null,
};

export function progressionReducer(state: ProgressionState = initialProgressionState, action: GameAction): ProgressionState {
  switch (action.type) {
    case 'BUY_SHIP': {
      const { shipKey } = action.payload;
      return {
        ...state,
        ownedShips: {
          ...state.ownedShips,
          [shipKey]: (state.ownedShips[shipKey] || 0) + 1,
        },
      };
    }

    case 'UNLOCK_ROUTE': {
      const { routeId } = action.payload;
      if (state.unlockedRouteIds.includes(routeId)) return state;
      return {
        ...state,
        unlockedRouteIds: [...state.unlockedRouteIds, routeId],
      };
    }

    case 'ADVANCE_ROUTE_TIER':
      return { ...state, routeTier: action.payload.tier };

    case 'UPGRADE_TECH': {
      const { locationId, category } = action.payload;
      const locationTechs = state.techLevels[locationId] || {};
      return {
        ...state,
        techLevels: {
          ...state.techLevels,
          [locationId]: {
            ...locationTechs,
            [category]: (locationTechs[category] || 0) + 1,
          },
        },
      };
    }

    case 'UNLOCK_TECH_LEVEL': {
      const { tier, level } = action.payload;
      return {
        ...state,
        unlockedTechLevels: {
          ...state.unlockedTechLevels,
          [tier]: level,
        },
      };
    }

    case 'BUY_AUTO_SLOT': {
      const { routeId } = action.payload;
      return {
        ...state,
        autoTravelSlots: {
          ...state.autoTravelSlots,
          [routeId]: (state.autoTravelSlots[routeId] || 0) + 1,
        },
      };
    }

    case 'SET_OWNED_SHIPS': {
      return {
        ...state,
        ownedShips: action.payload.ownedShips,
      };
    }

    case 'SET_UNLOCKED_ROUTES': {
      return {
        ...state,
        unlockedRouteIds: action.payload.routeIds,
      };
    }

    case 'SET_AUTO_TRAVEL_SLOTS': {
      return {
        ...state,
        autoTravelSlots: action.payload.slots,
      };
    }

    case 'SET_TECH_LEVELS': {
      return {
        ...state,
        techLevels: action.payload.techLevels,
      };
    }

    case 'SET_RESEARCHING_TECH': {
      return {
        ...state,
        researchingTech: action.payload.researchingTech,
      };
    }

    case 'SET_UNLOCKED_TECH_LEVELS': {
      return {
        ...state,
        unlockedTechLevels: action.payload.techLevels,
      };
    }

    case 'LEVEL_UP_SHIP':
      return { ...state, shipLevel: state.shipLevel + 1 };

    case 'ADD_SHIP_XP':
      return { ...state, shipXP: state.shipXP + action.payload.amount };

    case 'UPGRADE_BATTLE_LEVEL':
      return { ...state, battleLevel: state.battleLevel + 1 };

    case 'UPGRADE_RADAR':
      return { ...state, radarLevel: state.radarLevel + 1 };

    case 'UPGRADE_PRIVATE_POLICE':
      return { ...state, privatePoliceLevel: state.privatePoliceLevel + 1 };

    case 'UPGRADE_DOUBLE_ROUTE':
      return { ...state, doubleRouteLevel: state.doubleRouteLevel + 1 };

    case 'UPGRADE_DOOM_P':
      return { ...state, doomPLevel: state.doomPLevel + 1 };

    case 'UPGRADE_CAPTURE':
      return { ...state, captureLevel: state.captureLevel + 1 };

    case 'UPGRADE_WAR_CORE':
      return { ...state, warCoreLevel: state.warCoreLevel + 1 };

    case 'UNLOCK_ROUTE4':
      return { ...state, route4Unlocked: true };

    case 'UPGRADE_EXTRACTION_TECH':
      return { ...state, extractionTechLevel: (state.extractionTechLevel || 0) + 1 };

    case 'UPGRADE_SOLAR_MAPPING':
      return { ...state, solarMappingLevel: (state.solarMappingLevel || 0) + 1 };

    case 'TOGGLE_AUTO_SKIP_RANDOM_BATTLES':
      return { ...state, autoSkipRandomBattles: !state.autoSkipRandomBattles };

    case 'SET_PROGRESSION_DATA':
      return { ...state, ...action.payload };

    case 'UPGRADE_BATTLESHIP_LEVEL':
      return { ...state, battleShipUpgradeLevel: (state.battleShipUpgradeLevel || 0) + 1 };

    case 'START_RESEARCH': {
      const { tier, level, duration } = action.payload;
      return {
        ...state,
        researchingTech: {
          tier,
          level,
          startTime: Date.now(),
          endTime: Date.now() + duration * 1000,
        },
      };
    }

    case 'BOOST_RESEARCH': {
      if (!state.researchingTech) return state;
      const { amount } = action.payload;
      return {
        ...state,
        researchingTech: {
          ...state.researchingTech,
          endTime: state.researchingTech.endTime - amount * 1000,
        },
      };
    }

    case 'SET_GAME_TIME':
      return { ...state, gameTimeSeconds: action.payload.seconds };

    case 'LOAD_SAVE': {
      return action.payload.progression;
    }

    case 'RESET_GAME':
      return initialProgressionState;

    default:
      return state;
  }
}
