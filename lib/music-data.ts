import { SOLAR_INTERSTELLAR_BATTLE_MEDIA } from './solar-interstellar-battle-media.mjs';
import { NEW_LAND_BATTLE_MUSIC } from './new-land-battle-music.mjs';
import { NEW_EARTH_SURFACE_WAR_TRACKS } from './new-earth-surface-war-music.mjs';

export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: string;
  origin?: string;
}

export interface RouteTheme {
  id: string;
  name: string;
  playlist: Track[];
}

export const ROUTE_THEMES: Record<string, RouteTheme> = {
  'Solar': {
    id: 'route1',
    name: 'Chapter 1 - Solar Routes',
    playlist: [
      { id: 'r1_t1', title: 'Hidden Places', url: '/audio/themes/route1/hidden_places.ogg' },
      { id: 'r1_t2', title: 'Miss The Earth', url: '/audio/themes/route1/miss_the_earth.ogg' },
      { id: 'r1_t3', title: 'Solar Echoes', url: '/audio/themes/route1/solar_schoes.ogg' },
      { id: 'r1_t4', title: 'Space After Space', url: '/audio/themes/route1/space_after_space.ogg' },
      { id: 'r1_t5', title: 'Throne Signal', url: '/audio/themes/route1/throne_signal.ogg' },
      { id: 'r1_battle_1', title: 'Solar Battle I', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[0] },
      { id: 'r1_battle_2', title: 'Solar Battle II', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[1] },
    ]
  },
  'Interstellar': {
    id: 'route2',
    name: 'Chapter 2 - Interstellar Routes',
    playlist: [
      { id: 'r2_t1', title: 'Ballad From Stars', url: '/audio/themes/route2/ballad_from _stars.ogg' },
      { id: 'r2_t2', title: 'Far Horizon Drift', url: '/audio/themes/route2/far_horizon _drift.ogg' },
      { id: 'r2_t3', title: 'Going to Future', url: '/audio/themes/route2/going_to_future.ogg' },
      { id: 'r2_t4', title: 'This Way', url: '/audio/themes/route2/this_way.ogg' },
      { id: 'r2_battle_1', title: 'Interstellar Battle I', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes[0] },
      { id: 'r2_battle_2', title: 'Interstellar Battle II', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes[1] },
    ]
  },
  'Void': {
    id: 'route3',
    name: 'Chapter 3 - Void Routes: Project Earth',
    playlist: [
      { id: 'r3_t1', title: 'Abyssal War', url: '/audio/themes/route3/abyssal_war.ogg' },
      { id: 'r3_t2', title: 'Alien Instinct', url: '/audio/themes/route3/alien_instinct.ogg' },
      { id: 'r3_t3', title: 'Alien Username', url: '/audio/themes/route3/alien_username.ogg' },
      { id: 'r3_t4', title: 'Knight From Space', url: '/audio/themes/route3/knight_from_space.ogg' },
    ]
  },
  'Earth': {
    id: 'route4',
    name: 'Chapter 4 - New Earth',
    playlist: [
      { id: 'r4_t1', title: 'Living For Tomorrow', url: '/audio/themes/route4/living_for_tomorrow.ogg' },
      { id: 'r4_t2', title: 'Looking Out The Window', url: '/audio/themes/route4/looking_out the_window.ogg' },
      { id: 'r4_t3', title: 'Maybe Green', url: '/audio/themes/route4/maybe_green.ogg' },
      { id: 'r4_t4', title: 'New Dawn Archive', url: '/audio/themes/route4/new_dawn_archive.ogg' },
      { id: 'r4_t5', title: 'Prelude of the Stars', url: '/audio/themes/route4/prelude_of the_stars.ogg' },
      { id: 'r4_t6', title: 'So This Is Home', url: '/audio/themes/route4/so_this_is_home.ogg' },
    ]
  }
};

export const ARCADE_THEMES: Record<string, RouteTheme> = {
  'salto-espacial': {
    id: 'salto-espacial',
    name: 'Salto Espacial',
    playlist: [
      { id: 'arcade_1_t1', title: 'Salto Espacial', url: '/audio/themes/fliperamas/salto-espacial/salto_espacial.ogg' }
    ]
  },
  'ruptura-estelar': {
    id: 'ruptura-estelar',
    name: 'Ruptura Estelar',
    playlist: [
      { id: 'arcade_2_t1', title: 'Ruptura Estelar', url: '/audio/themes/fliperamas/ruptura-estelar/ruptura_estelar.ogg' }
    ]
  },
  'danger-zoom-zones': {
    id: 'danger-zoom-zones',
    name: 'Danger Zoom Zones',
    playlist: [
      { id: 'arcade_3_t1', title: 'Danger Zoom', url: '/audio/themes/fliperamas/danger-zoom-zones/danger_zoom.ogg' }
    ]
  },
  'grid-collapse': {
    id: 'grid-collapse',
    name: 'Grid Collapse',
    playlist: [
      { id: 'arcade_4_t1', title: 'Grid Collapse', url: '/audio/themes/fliperamas/grid-collapse/grid_collapse.ogg' }
    ]
  },
  'robot-runner': {
    id: 'robot-runner',
    name: 'Robot Runner',
    playlist: [
      { id: 'arcade_5_t1', title: 'Robot Runner', url: '/audio/themes/fliperamas/robot-runner/robot_runner.ogg' }
    ]
  },
  'neo-catcher': {
    id: 'neo-catcher',
    name: 'Neo Catcher',
    playlist: [
      { id: 'arcade_6_t1', title: 'Neo Catcher', url: '/audio/themes/fliperamas/neo-catcher/neo_catcher.ogg' }
    ]
  }
};

export const SPECIAL_THEMES: Record<string, RouteTheme> = {
  'new-earth-surface-war': {
    id: 'new-earth-surface-war',
    name: 'Chapter 4 - Surface War',
    playlist: NEW_EARTH_SURFACE_WAR_TRACKS.map(track => ({ ...track })),
  },
  'new-land-battles': {
    id: 'new-land-battles',
    name: 'Chapter 4 - New Land Battles',
    playlist: [
      { id: 'r4_battle_1', title: 'New Land Battle I', url: NEW_LAND_BATTLE_MUSIC.themes[0] },
      { id: 'r4_battle_2', title: 'New Land Battle II', url: NEW_LAND_BATTLE_MUSIC.themes[1] },
      { id: 'r4_battle_3', title: 'New Land Battle III', url: NEW_LAND_BATTLE_MUSIC.themes[2] },
      { id: 'r4_battle_4', title: 'New Land Battle IV', url: NEW_LAND_BATTLE_MUSIC.themes[3] },
    ],
  },
  transitions: {
    id: 'transitions',
    name: 'Transitions & Epilogues',
    playlist: [
      { id: 'transition_cap2', title: 'Chapter 2 - Interstellar Transition', url: '/audio/themes/intro_cap_02.ogg' },
      { id: 'transition_cap3', title: 'Chapter 3 - Into the Void', url: '/audio/themes/intro_cap_03.ogg' },
      { id: 'epilogue_cap3', title: 'Road of Hollow Kings', url: '/audio/themes/road_of_hollow_kings_endcap3theme.ogg' },
      { id: 'credits_cap4_full', title: 'Infinite Horizon (Full Version)', url: '/audio/themes/infinite_horizon_full_version.ogg' },
    ],
  },
  'void-bosses': {
    id: 'void-bosses',
    name: 'Chapter 3 - Void Bosses',
    playlist: [
      { id: 'void_boss_1_theme', title: 'Devorador Alpha', url: '/audio/themes/local_bosses_void_themes/boss_devorador_alpha_theme.ogg' },
      { id: 'void_boss_2_theme', title: 'Sanguessuga Estelar', url: '/audio/themes/local_bosses_void_themes/boss_sanguessuga_estelar_theme.ogg' },
      { id: 'void_boss_3_theme', title: 'Colosso Amalgamado', url: '/audio/themes/local_bosses_void_themes/boss_colosso_amalgamado_theme.ogg' },
      { id: 'void_boss_4_theme', title: 'Kraken do Vazio', url: '/audio/themes/local_bosses_void_themes/boss_kraken_do_vazio_theme.ogg' },
      { id: 'void_boss_5_theme', title: 'Besta-Titã de Ferro', url: '/audio/themes/local_bosses_void_themes/boss_besta_tita_de_ferro_theme.ogg' },
      { id: 'void_boss_6_theme', title: 'Horror Mutante', url: '/audio/themes/local_bosses_void_themes/boss_horror_mutante_theme.ogg' },
      { id: 'void_boss_7_theme', title: 'Verme-Rei do Vazio', url: '/audio/themes/local_bosses_void_themes/boss_verme_rei_do_vazio_theme.ogg' },
      { id: 'void_boss_8_theme', title: 'Predador Abissal', url: '/audio/themes/local_bosses_void_themes/boss_predador_abissal_theme.ogg' },
      { id: 'void_boss_9_theme', title: 'Lux Invicta - Deus-Monstro', url: '/audio/themes/local_bosses_void_themes/lux_invicta.ogg' },
    ],
  },
};
/**
 * Helper to get a random track from a route's playlist
 */
export const getRandomTrackForRoute = (routeId: string): Track | null => {
  const theme = ROUTE_THEMES[routeId] || ARCADE_THEMES[routeId];
  if (!theme || theme.playlist.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * theme.playlist.length);
  return theme.playlist[randomIndex];
};
