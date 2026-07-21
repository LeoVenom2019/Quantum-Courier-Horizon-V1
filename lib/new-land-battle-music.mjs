export const NEW_LAND_BATTLE_MUSIC = Object.freeze({
  themes: Object.freeze([
    '/audio/new_land/battle_theme_new_land_01.ogg',
    '/audio/new_land/battle_theme_new_land_02.ogg',
    '/audio/new_land/battle_theme_new_land_03.ogg',
    '/audio/new_land/battle_theme_new_land_04.ogg',
  ]),
  searchDefensePreferenceKey: 'route4_search_defense_battle_music_enabled',
  directPreferenceKey: 'route4_direct_battle_music_enabled',
});

export function pickNewLandBattleTheme(randomValue = Math.random()) {
  const normalized = Math.min(Math.max(Number(randomValue) || 0, 0), 0.999999999999);
  return NEW_LAND_BATTLE_MUSIC.themes[Math.floor(normalized * NEW_LAND_BATTLE_MUSIC.themes.length)];
}
