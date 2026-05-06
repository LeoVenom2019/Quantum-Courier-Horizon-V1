import { Track } from '@/hooks/useJukebox';

export interface RouteTheme {
  id: string;
  name: string;
  playlist: Track[];
}

export const ROUTE_THEMES: Record<string, RouteTheme> = {
  'Solar': {
    id: 'route1',
    name: 'Solar System (Route 1)',
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
    name: 'Interstellar (Route 2)',
    playlist: [
      { id: 'r2_t1', title: 'Route 2 Track 1', url: '/audio/themes/route2/track1.ogg' },
      { id: 'r2_t2', title: 'Route 2 Track 2', url: '/audio/themes/route2/track2.ogg' },
      { id: 'r2_t3', title: 'Route 2 Track 3', url: '/audio/themes/route2/track3.ogg' },
      { id: 'r2_t4', title: 'Route 2 Track 4', url: '/audio/themes/route2/track4.ogg' },
    ]
  },
  'Void': {
    id: 'route3',
    name: 'The Void (Route 3)',
    playlist: [
      { id: 'r3_t1', title: 'Route 3 Track 1', url: '/audio/themes/route3/track1.ogg' },
      { id: 'r3_t2', title: 'Route 3 Track 2', url: '/audio/themes/route3/track2.ogg' },
      { id: 'r3_t3', title: 'Route 3 Track 3', url: '/audio/themes/route3/track3.ogg' },
      { id: 'r3_t4', title: 'Route 3 Track 4', url: '/audio/themes/route3/track4.ogg' },
    ]
  },
  'Singularity': {
    id: 'route4',
    name: 'Singularity (Route 4)',
    playlist: [
      { id: 'r4_t1', title: 'Route 4 Track 1', url: '/audio/themes/route4/track1.ogg' },
      { id: 'r4_t2', title: 'Route 4 Track 2', url: '/audio/themes/route4/track2.ogg' },
      { id: 'r4_t3', title: 'Route 4 Track 3', url: '/audio/themes/route4/track3.ogg' },
      { id: 'r4_t4', title: 'Route 4 Track 4', url: '/audio/themes/route4/track4.ogg' },
      { id: 'r4_t5', title: 'Route 4 Track 5', url: '/audio/themes/route4/track5.ogg' },
      { id: 'r4_t6', title: 'Route 4 Track 6', url: '/audio/themes/route4/track6.ogg' },
    ]
  }
};

export const ARCADE_THEMES: Record<string, RouteTheme> = {
  'salto-espacial': {
    id: 'salto-espacial',
    name: 'Salto Espacial',
    playlist: [
      // { id: 'arcade_1_t1', title: 'Track 1', url: '/audio/themes/fliperamas/salto-espacial/track1.ogg' }
    ]
  },
  'ruptura-estelar': {
    id: 'ruptura-estelar',
    name: 'Ruptura Estelar',
    playlist: [
      // { id: 'arcade_2_t1', title: 'Track 1', url: '/audio/themes/fliperamas/ruptura-estelar/track1.ogg' }
    ]
  },
  'danger-zoom-zones': {
    id: 'danger-zoom-zones',
    name: 'Danger Zoom Zones',
    playlist: [
      // { id: 'arcade_3_t1', title: 'Track 1', url: '/audio/themes/fliperamas/danger-zoom-zones/track1.ogg' }
    ]
  },
  'grid-collapse': {
    id: 'grid-collapse',
    name: 'Grid Collapse',
    playlist: [
      // { id: 'arcade_4_t1', title: 'Track 1', url: '/audio/themes/fliperamas/grid-collapse/track1.ogg' }
    ]
  },
  'robot-runner': {
    id: 'robot-runner',
    name: 'Robot Runner',
    playlist: [
      // { id: 'arcade_5_t1', title: 'Track 1', url: '/audio/themes/fliperamas/robot-runner/track1.ogg' }
    ]
  },
  'neo-catcher': {
    id: 'neo-catcher',
    name: 'Neo Catcher',
    playlist: [
      // { id: 'arcade_6_t1', title: 'Track 1', url: '/audio/themes/fliperamas/neo-catcher/track1.ogg' }
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
