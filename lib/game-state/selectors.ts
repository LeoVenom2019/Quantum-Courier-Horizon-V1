// lib/game-state/selectors.ts

import { EXTRACTION_POINTS } from '@/lib/game-data';
import { INTERSTELLAR_EXTRACTION_VALUE_MULTIPLIER } from '@/lib/game-constants';
import { GameState } from './types';

/**
 * Calcula o valor de venda de packs de um ponto de extração.
 * Fonte única de verdade — elimina triplicação no código original.
 */
export function calcExtractionSaleValue(
  pointId: string,
  packs: number,
  state: Pick<GameState, 'mining' | 'progression'>
): number {
  const point = EXTRACTION_POINTS.find(p => p.id === pointId);
  if (!point || packs < 100) return 0;

  let value = packs * point.valuePerPack;

  // Recompensa do Nível 40: 10x para minérios interestelares
  if (state.progression.battleLevel >= 40 && state.progression.routeTier === 'Interstellar') {
    value *= 10;
  }

  // Multiplicador de Compactação: 2x por nível
  const compressionLevel = state.mining.extractionCompressionLevels[pointId] || 0;
  if (compressionLevel > 0) {
    value *= compressionLevel * 2;
  }

  return Math.floor(value * INTERSTELLAR_EXTRACTION_VALUE_MULTIPLIER);
}

/**
 * Retorna o custo do próximo upgrade de batalha.
 */
export function calcBattleLevelCost(currentLevel: number, routeTier: string): number {
  const nextLevel = currentLevel + 1;
  return nextLevel <= 25
    ? Math.floor(1000 * Math.pow(50000, (nextLevel - 1) / 24))
    : Math.floor(55000000 * Math.pow(1000 / 55, (nextLevel - 26) / 29) * (routeTier === 'Interstellar' ? 1.2 : 1));
}

/**
 * Verifica se o jogador tem QC suficiente para uma ação.
 */
export function canAfford(state: GameState, cost: number): boolean {
  return state.economy.qc >= cost;
}

/**
 * Retorna os multiplicadores econômicos aplicáveis ao momento atual.
 */
export function getEconomicMultipliers(state: GameState) {
  const { doubleRouteLevel, extractionTechLevel, captureLevel } = state.progression;
  return {
    deliveryValue: getDoubleRouteMultiplier(doubleRouteLevel),
    extractionYield: 1 + extractionTechLevel * 0.1,
    battleReward: 1 + captureLevel * 0.05,
  };
}

function getDoubleRouteMultiplier(level: number): number {
  switch (level) {
    case 1: return 25;
    case 2: return 75;
    case 3: return 150;
    case 4: return 300;
    case 5: return 750;
    default: return 1;
  }
}
