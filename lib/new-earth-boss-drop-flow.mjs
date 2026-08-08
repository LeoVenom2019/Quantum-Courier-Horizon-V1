export const NEW_EARTH_DOUBLE_BOSS_DOCUMENT_CHANCE = 0.35;

export function getNewEarthBossDocumentDropCount(random = Math.random) {
  return random() < NEW_EARTH_DOUBLE_BOSS_DOCUMENT_CHANCE ? 2 : 1;
}
