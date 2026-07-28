const WAR_THEME_BASE = '/assets/rota4/themes_war';

export const NEW_EARTH_SURFACE_WAR_MUSIC = Object.freeze({
  helicopter: Object.freeze([
    Object.freeze({ id: 'surface_war_heli_01', title: 'Frozen Sky Offensive', url: `${WAR_THEME_BASE}/frozen_sky_offensive.ogg` }),
    Object.freeze({ id: 'surface_war_heli_02', title: 'Elysium Airborne Assault', url: `${WAR_THEME_BASE}/elysium_airborne_assault.ogg` }),
    Object.freeze({ id: 'surface_war_heli_03', title: 'Whiteout Strike Squadron', url: `${WAR_THEME_BASE}/whiteout_strike_squadron.ogg` }),
    Object.freeze({ id: 'surface_war_heli_04', title: 'Continental Thunder Run', url: `${WAR_THEME_BASE}/continental_thunder_run.ogg` }),
    Object.freeze({ id: 'surface_war_heli_05', title: 'Aether Wings at War', url: `${WAR_THEME_BASE}/aether_wings_at_war.ogg` }),
  ]),
  tank: Object.freeze([
    Object.freeze({ id: 'surface_war_tank_01', title: 'Iron Vanguard Advance', url: `${WAR_THEME_BASE}/iron_vanguard_advance.ogg` }),
    Object.freeze({ id: 'surface_war_tank_02', title: 'Siege Line Breaker', url: `${WAR_THEME_BASE}/siege_line_breaker.ogg` }),
    Object.freeze({ id: 'surface_war_tank_03', title: 'Armored Ruins Assault', url: `${WAR_THEME_BASE}/armored_ruins_assault.ogg` }),
    Object.freeze({ id: 'surface_war_tank_04', title: 'Genesis Tank Battalion', url: `${WAR_THEME_BASE}/genesis_tank_battalion.ogg` }),
    Object.freeze({ id: 'surface_war_tank_05', title: 'Last Stand at European Ruins', url: `${WAR_THEME_BASE}/last_stand_at_european_ruins.ogg` }),
  ]),
});

export const NEW_EARTH_SURFACE_WAR_TRACKS = Object.freeze([
  ...NEW_EARTH_SURFACE_WAR_MUSIC.helicopter,
  ...NEW_EARTH_SURFACE_WAR_MUSIC.tank,
]);

export function pickNewEarthSurfaceWarTheme(kind, randomValue = Math.random()) {
  const themes = NEW_EARTH_SURFACE_WAR_MUSIC[kind] || [];
  if (themes.length === 0) return null;
  const normalized = Math.min(0.999999, Math.max(0, Number(randomValue) || 0));
  return themes[Math.floor(normalized * themes.length)];
}
