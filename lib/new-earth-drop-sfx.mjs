export const NEW_EARTH_DROP_SFX = Object.freeze({
  bossDocumentPickup: '/assets/rota4/SFX_new_land/helicopters_tanks/cap4_boss_drop.ogg',
  normalPickup: '/assets/rota4/SFX_new_land/helicopters_tanks/cap4_normal_drop.ogg',
  dronePickup: '/assets/rota4/SFX_new_land/helicopters_tanks/get_drone_sound.ogg',
});

export function resolveNewEarthHelicopterDropSfx(dropType) {
  if (dropType === 'bossDrop') return NEW_EARTH_DROP_SFX.bossDocumentPickup;
  if (dropType === 'drone') return NEW_EARTH_DROP_SFX.dronePickup;
  return NEW_EARTH_DROP_SFX.normalPickup;
}
