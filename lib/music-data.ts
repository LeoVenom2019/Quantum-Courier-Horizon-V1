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
      { id: 'r1_t1', title: 'Solar Echoes', url: '/audio/themes/route1/solar_echoes.ogg' },
      { id: 'r1_t2', title: 'Light Speed Drift', url: '/audio/themes/route1/light_speed_drift.ogg' },
      { id: 'r1_t3', title: 'Dawn of Horizons', url: '/audio/themes/route1/dawn_of_horizons.ogg' },
    ]
  },
  'Interstellar': {
    id: 'route2',
    name: 'Interstellar (Route 2)',
    playlist: [
      { id: 'r2_t1', title: 'Nebula Waves', url: '/audio/themes/route2/nebula_waves.ogg' },
      { id: 'r2_t2', title: 'Starfield Voyage', url: '/audio/themes/route2/starfield_voyage.ogg' },
      { id: 'r2_t3', title: 'Interstellar Pulse', url: '/audio/themes/route2/interstellar_pulse.ogg' },
    ]
  },
  'Void': {
    id: 'route3',
    name: 'The Void (Route 3)',
    playlist: [
      { id: 'r3_t1', title: 'Dark Matter Resonance', url: '/audio/themes/route3/dark_matter_resonance.ogg' },
      { id: 'r3_t2', title: 'Void Silence', url: '/audio/themes/route3/void_silence.ogg' },
      { id: 'r3_t3', title: 'Abyssal Currents', url: '/audio/themes/route3/abyssal_currents.ogg' },
    ]
  },
  'Singularity': {
    id: 'route4',
    name: 'Singularity (Route 4)',
    playlist: [
      { id: 'r4_t1', title: 'Beyond Singularity', url: '/audio/themes/route4/beyond_singularity.ogg' },
      { id: 'r4_t2', title: 'Quantum Shift', url: '/audio/themes/route4/quantum_shift.ogg' },
      { id: 'r4_t3', title: 'Cosmic Ascension', url: '/audio/themes/route4/cosmic_ascension.ogg' },
    ]
  }
};

/**
 * Helper to get a random track from a route's playlist
 */
export const getRandomTrackForRoute = (routeId: string): Track | null => {
  const theme = ROUTE_THEMES[routeId];
  if (!theme || theme.playlist.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * theme.playlist.length);
  return theme.playlist[randomIndex];
};
