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

/**
 * Helper to get a random track from a route's playlist
 */
export const getRandomTrackForRoute = (routeId: string): Track | null => {
  const theme = ROUTE_THEMES[routeId] || ARCADE_THEMES[routeId];
  if (!theme || theme.playlist.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * theme.playlist.length);
  return theme.playlist[randomIndex];
};
