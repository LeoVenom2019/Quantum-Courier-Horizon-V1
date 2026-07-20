const AUDIO_BASE = '/audio/solar_interestelar';

export const SOLAR_INTERSTELLAR_BATTLE_MEDIA = Object.freeze({
  Solar: Object.freeze({
    battleThemes: Object.freeze([
      `${AUDIO_BASE}/start_solar_battle_01.ogg`,
      `${AUDIO_BASE}/start_solar_battle_02.ogg`,
    ]),
    victoryTheme: `${AUDIO_BASE}/solar_battle_victory_theme.ogg`,
  }),
  Interstellar: Object.freeze({
    battleThemes: Object.freeze([
      `${AUDIO_BASE}/start_interestelar_battle_01.ogg`,
      `${AUDIO_BASE}/start_interestelar_battle_02.ogg`,
    ]),
    victoryTheme: `${AUDIO_BASE}/interestelar_battle_victory_theme.ogg`,
  }),
  defeatTheme: `${AUDIO_BASE}/cap_0102_battlelost_theme.ogg`,
});

const isSupportedRoute = (routeTier) => (
  routeTier === 'Solar' || routeTier === 'Interstellar'
);

export const isSolarInterstellarManualBattle = (routeTier, deliveryId) => (
  isSupportedRoute(routeTier) && !String(deliveryId || '').startsWith('auto-')
);

export const pickManualBattleTheme = (routeTier, randomValue = Math.random()) => {
  if (!isSupportedRoute(routeTier)) return null;

  const normalizedRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.9999999999999999)
    : 0;
  const themes = SOLAR_INTERSTELLAR_BATTLE_MEDIA[routeTier].battleThemes;
  return themes[Math.floor(normalizedRandom * themes.length)];
};

export const getManualBattleResultAudio = (routeTier, outcome) => {
  if (!isSupportedRoute(routeTier)) return null;
  if (outcome === 'defeat') return SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme;
  if (outcome === 'victory') return SOLAR_INTERSTELLAR_BATTLE_MEDIA[routeTier].victoryTheme;
  return null;
};
