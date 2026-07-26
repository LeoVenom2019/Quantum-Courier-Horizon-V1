export const NEW_EARTH_VEHICLE_UPGRADE_COSTS = Object.freeze([
  60_000,
  150_000,
  300_000,
  600_000,
  1_000_000,
]);

export const getNewEarthVehicleUpgradeCost = level => {
  const safeLevel = Math.max(
    0,
    Math.min(
      NEW_EARTH_VEHICLE_UPGRADE_COSTS.length - 1,
      Math.floor(Number(level) || 0),
    ),
  );

  return NEW_EARTH_VEHICLE_UPGRADE_COSTS[safeLevel];
};