const ROUTE4_AIR_SHIP_BASE = '/assets/rota4/battles/enemys/air_ships';

export const ROUTE4_ELITE_SHIP_IMAGES = Object.freeze([
  `${ROUTE4_AIR_SHIP_BASE}/enemy_elite_rt4.webp`,
  `${ROUTE4_AIR_SHIP_BASE}/enemy_elite2_rt4.webp`,
]);

export function pickRoute4EliteShipImage(randomValue = Math.random()) {
  const normalized = Math.min(0.999999, Math.max(0, Number(randomValue) || 0));
  return ROUTE4_ELITE_SHIP_IMAGES[Math.floor(normalized * ROUTE4_ELITE_SHIP_IMAGES.length)];
}
