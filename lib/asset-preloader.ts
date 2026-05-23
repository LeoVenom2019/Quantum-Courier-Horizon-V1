import { CARD_BACKGROUND_BY_RARITY } from './colony-cards';
import { MINI_GAMES_CONFIG } from './mini-games-config';
import { ARCADE_THEMES, ROUTE_THEMES } from './music-data';

export type AssetKind = 'image' | 'audio' | 'video';
export type AssetRouteGroup = 'route1' | 'route2' | 'route3' | 'route4';
export type AssetGroupId =
  | AssetRouteGroup
  | 'shared-ui'
  | 'card-frames'
  | 'arcades'
  | 'route4-colonies'
  | 'route4-battle';

export type PreloadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AssetPreloadEntry {
  src: string;
  kind: AssetKind;
}

export interface AssetGroupState {
  id: AssetGroupId;
  total: number;
  loaded: number;
  failed: number;
  status: PreloadStatus;
}

export interface AssetPreloadSummary {
  total: number;
  loaded: number;
  failed: number;
  status: PreloadStatus;
  progress: number;
}

type RouteTierLike = 'Solar' | 'Interstellar' | 'Void' | 'Earth';

const routeHeaderImages = {
  route1: '/assets/rota1/layout_header_cap_1/background_header_rota_1.webp',
  route2: '/assets/rota2/layout_header_cap_2/background_header_rota_2.webp',
  route3: '/assets/rota3/layout_header_cap_3/background_header_rota_3.webp',
  route4: '/assets/rota4/layout_header_cap_4/background_header_rota_4.webp',
} as const;

const route4ColonyImages = [
  'genesis/1genesis_colony.webp',
  'genesis/2genesis_constructors.webp',
  'genesis/3genesis_population.webp',
  'genesis/genesis_forest.webp',
  'genesis/genesis_factory.webp',
  'genesis/genesis_school.webp',
  'genesis/genesis_theater.webp',
  'genesis/genesis_police.webp',
  'genesis/genesis_restaurant.webp',
  'eden/1eden_colony.webp',
  'eden/2eden_constructors.webp',
  'eden/3eden_population.webp',
  'eden/eden_forest.webp',
  'eden/eden_factory.webp',
  'eden/eden_school.webp',
  'eden/eden_theater.webp',
  'eden/eden_police.webp',
  'eden/eden_restaurant.webp',
  'elysium/1elysium_colony.webp',
  'elysium/2elysium_constructors.webp',
  'elysium/3elysium_population.webp',
  'elysium/elysium_forest.webp',
  'elysium/elysium_factory.webp',
  'elysium/elysium_school.webp',
  'elysium/elysium_theater.webp',
  'elysium/elysium_police.webp',
  'elysium/elysium_restaurant.webp',
  'gaia/1gaia_colony.webp',
  'gaia/2gaia_constructors.webp',
  'gaia/3gaia_population.webp',
  'gaia/gaia_forest.webp',
  'gaia/gaia_factory.webp',
  'gaia/gaia_school.webp',
  'gaia/gaia_theater.webp',
  'gaia/gaia_police.webp',
  'gaia/gaia_restaurant.webp',
].map(path => `/assets/rota4/colonys/${path}`);

const route4LayoutImages = [
  '/assets/rota4/layout_cap4/searc_land_background.webp',
  '/assets/rota4/layout_cap4/search_sea_background.webp',
  '/assets/rota4/layout_cap4/hangar_horizon.webp',
  '/assets/texturas/textura_ficsi_2400x240.webp',
];

const route4TextureImages = [
  '/assets/texturas/textura_cards_cap4.webp',
  '/assets/texturas/textura_cards_background_cap4.webp',
  '/assets/texturas/textura_historic_cap4.webp',
];

const route4ColonyAudio = [
  '/assets/rota4/SFX_new_land/aba_colonys_click.ogg',
  '/assets/rota4/SFX_new_land/50_robots.ogg',
  '/assets/rota4/SFX_new_land/250_robots.ogg',
  '/assets/rota4/SFX_new_land/hangar_open_door.ogg',
  '/assets/rota4/SFX_new_land/hangar_close_door.ogg',
  '/assets/rota4/SFX_new_land/warning_gaming.ogg',
];

const route4BattleBase = '/assets/rota4/battles';

const route4BattleImages = [
  `${route4BattleBase}/backgrounds/day/rt4_background_day.webp`,
  `${route4BattleBase}/backgrounds/night/rt4_background_night.webp`,
  `${route4BattleBase}/backgrounds/winter/rt4_background_winter.webp`,
  `${route4BattleBase}/player/horizon/horizon.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_rt4.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_rt4_2.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_rt4_3.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_rt4_4.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_boss_rt4.webp`,
  `${route4BattleBase}/enemys/air_ships/enemy_elite_rt4.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_neutral.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_forward.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_up.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_down.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_backward.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m3_neutral.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_forward.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m4_up.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_down.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_backward.webp`,
];

const route4BattleAudio = [
  `${route4BattleBase}/player/horizon/shoot_rt4.ogg`,
  `${route4BattleBase}/player/horizon/eletric_shoot.ogg`,
  `${route4BattleBase}/player/horizon/fire_shoot.ogg`,
  `${route4BattleBase}/player/horizon/ice_shoot.ogg`,
  `${route4BattleBase}/player/horizon/trina_shot.ogg`,
  `${route4BattleBase}/player/horizon/apocalipse_shot_rt4.ogg`,
  `${route4BattleBase}/player/horizon/apocalipse_laser_impact.ogg`,
  `${route4BattleBase}/player/horizon/apocalipse_laser_last_explosion.ogg`,
  `${route4BattleBase}/player/horizon/hellfire_barrage_shoot.ogg`,
  `${route4BattleBase}/player/horizon/hellfire_barrage_impact.ogg`,
  `${route4BattleBase}/player/horizon/horizon_level_up.ogg`,
  `${route4BattleBase}/enemys/air_ships/1_shoot_enemy_rt4.ogg`,
  `${route4BattleBase}/enemys/air_ships/shoot_enemy_boss_rt4.ogg`,
  `${route4BattleBase}/enemys/air_ships/shoot_enemy_elite_rt4.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 1/shoot_m1.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 1/scream_m1.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 1/explosion_m1.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 2/shoot_m2.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 2/scream_m2.ogg`,
  `${route4BattleBase}/enemys/monsters/monster 2/explosion_m2.ogg`,
];

const arcadeResultImages = MINI_GAMES_CONFIG.flatMap(game => {
  const folder = game.id.replaceAll('-', '_');
  return [
    `/assets/games/${folder}/${folder}_victory.webp`,
    `/assets/games/${folder}/${folder}_lose.webp`,
  ];
});

const fliperSfx = [
  'snake_dead',
  'snake_take_1',
  'snake_take_2',
  'snake_take_3',
  'grid_collapse_change',
  'grid_collapse_match_1',
  'grid_collapse_match_2',
  'grid_collapse_match_3',
  'grid_collapse_match_4',
  'grid_collapse_go_down',
  'grid_collapse_explosion',
  'grid_collapse_perfect',
  'grid_collapse_misfit',
  'danger_zoom_zones_bomb_explosion',
  'danger_zoom_zones_choose',
  'danger_zoom_zones_close_nobomb',
  'danger_zoom_zones_close_window',
  'danger_zoom_zones_disarm',
  'danger_zoom_zones_firstclean',
  'danger_zoom_zones_no_bomb',
  'robot_runner_power_up',
  'robot_runner_lost_life',
  'robot_runner_slow',
  'ruptura_estelar_player_shot',
  'ruptura_estelar_boss_shot',
  'ruptura_estelar_enemy_explosion',
  'ruptura_estelar_player_explosion',
  'neo_catcher_black',
  'neo_catcher_3_colors',
  'neo_catcher_heall',
  'neo_catcher_miss',
  'neo_catcher_bomb',
].map(name => `/assets/games/flipers_sfx/${name}.ogg`);

const neoCatcherBackgrounds = [
  '/assets/games/neo_catcher/neo_catcher_street_background.webp',
  '/assets/games/neo_catcher/neo_catcher_beach_background.webp',
  '/assets/games/neo_catcher/neo_catcher_bridge_background.webp',
  '/assets/games/neo_catcher/neo_catcher_volcano_background.webp',
];

const asEntries = (srcs: string[], kind: AssetKind): AssetPreloadEntry[] => (
  srcs.map(src => ({ src, kind }))
);

const routeThemeAudio = (routeTier: RouteTierLike) => (
  ROUTE_THEMES[routeTier]?.playlist.map(track => track.url) || []
);

const arcadeThemeAudio = Object.values(ARCADE_THEMES).flatMap(theme => theme.playlist.map(track => track.url));

export const ASSET_GROUPS: Record<AssetGroupId, AssetPreloadEntry[]> = {
  'shared-ui': [
    ...asEntries([
      '/audio/bgm_landing.ogg',
      '/audio/sfx/open_window.ogg',
      '/audio/sfx/close_window.ogg',
      '/audio/sfx/view_card.ogg',
      '/audio/sfx/claim_card.ogg',
      '/audio/sfx/equip_card.ogg',
      '/audio/sfx/unequip_card.ogg',
    ], 'audio'),
    ...asEntries([
      '/images/bobby_blue/bobby_blue_summer.webp',
      '/images/bobby_blue/bobby_blue_fear.webp',
      '/images/bobby_blue/bobby_blue_in_love.webp',
      '/images/bobby_blue/bobby_loader.webp',
      '/images/ui/earth_card.webp',
      '/images/ui/alien_wait.webp',
      '/images/ui/options_background.webp',
      '/images/ui/sounds_ef_background.webp',
      '/images/ui/jukebox_background.webp',
    ], 'image'),
  ],
  'card-frames': asEntries([
    ...Object.values(CARD_BACKGROUND_BY_RARITY),
    '/assets/rota4/cards/joker_ico.webp',
  ], 'image'),
  arcades: [
    ...asEntries(['/assets/games/arcade_background.webp'], 'image'),
    ...asEntries(MINI_GAMES_CONFIG.map(game => game.cabinetImage), 'image'),
    ...asEntries(MINI_GAMES_CONFIG.map(game => game.image), 'video'),
    ...asEntries(arcadeResultImages, 'image'),
    ...asEntries(neoCatcherBackgrounds, 'image'),
    ...asEntries(arcadeThemeAudio, 'audio'),
    ...asEntries(fliperSfx, 'audio'),
  ],
  route1: [
    ...asEntries([routeHeaderImages.route1], 'image'),
    ...asEntries(routeThemeAudio('Solar'), 'audio'),
  ],
  route2: [
    ...asEntries([routeHeaderImages.route2], 'image'),
    ...asEntries(routeThemeAudio('Interstellar'), 'audio'),
  ],
  route3: [
    ...asEntries([
      routeHeaderImages.route3,
      '/assets/rota3/void/zero/bg_layer_zero.webp',
      '/assets/rota3/void/zero/boss_neutral.webp',
      '/assets/rota3/void/zero/monster-elite_neutral.webp',
      '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp',
    ], 'image'),
    ...asEntries(routeThemeAudio('Void'), 'audio'),
  ],
  route4: [
    ...asEntries([routeHeaderImages.route4, '/images/bobby_blue/bobby_blue_new_land.webp', '/assets/rota4/new_land_map.webp', ...route4TextureImages], 'image'),
    ...asEntries(['/assets/rota4/videos/quantum_courier_credits.webm'], 'video'),
    ...asEntries([...routeThemeAudio('Earth'), '/audio/themes/infinite_horizon_short_version.ogg'], 'audio'),
  ],
  'route4-colonies': [
    ...asEntries([...route4ColonyImages, ...route4LayoutImages], 'image'),
    ...asEntries(route4ColonyAudio, 'audio'),
  ],
  'route4-battle': [
    ...asEntries(route4BattleImages, 'image'),
    ...asEntries(route4BattleAudio, 'audio'),
  ],
};

const routeTierToGroup: Record<RouteTierLike, AssetRouteGroup> = {
  Solar: 'route1',
  Interstellar: 'route2',
  Void: 'route3',
  Earth: 'route4',
};

const cache = new Map<string, Promise<void>>();
const groupStates = new Map<AssetGroupId, AssetGroupState>();
const groupPromises = new Map<AssetGroupId, Promise<AssetGroupState>>();
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== 'undefined';

const scheduleIdle = (task: () => void) => {
  if (!isBrowser()) return;
  const requestIdle = window.requestIdleCallback;
  if (requestIdle) {
    requestIdle(task, { timeout: 1800 });
    return;
  }
  window.setTimeout(task, 50);
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const preloadImage = (src: string) => {
  if (!isBrowser() || typeof Image === 'undefined') return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if ('decode' in image) {
        image.decode().catch(() => undefined).finally(resolve);
        return;
      }
      resolve();
    };
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });
};

const preloadMedia = (src: string, kind: 'audio' | 'video') => {
  if (!isBrowser()) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const media = kind === 'audio' ? new Audio() : document.createElement('video');
    const cleanup = () => {
      media.removeEventListener('canplaythrough', onReady);
      media.removeEventListener('loadedmetadata', onReady);
      media.removeEventListener('error', onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`${kind} failed: ${src}`));
    };
    media.preload = 'metadata';
    media.addEventListener('canplaythrough', onReady, { once: true });
    media.addEventListener('loadedmetadata', onReady, { once: true });
    media.addEventListener('error', onError, { once: true });
    media.src = src;
    media.load();
  });
};

const preloadEntry = (entry: AssetPreloadEntry) => {
  const cacheKey = `${entry.kind}:${entry.src}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const promise = entry.kind === 'image'
    ? preloadImage(entry.src)
    : preloadMedia(entry.src, entry.kind);
  cache.set(cacheKey, promise.catch(() => undefined));
  return promise;
};

export const getAssetGroupState = (id: AssetGroupId): AssetGroupState => (
  groupStates.get(id) || {
    id,
    total: ASSET_GROUPS[id]?.length || 0,
    loaded: 0,
    failed: 0,
    status: 'idle',
  }
);

export const preloadAssetGroup = async (id: AssetGroupId): Promise<AssetGroupState> => {
  const existing = groupPromises.get(id);
  const current = groupStates.get(id);
  if (existing && current?.status === 'loading') return existing;
  if (current?.status === 'loaded') return current;

  const entries = ASSET_GROUPS[id] || [];
  const uniqueEntries = Array.from(
    new Map(entries.map(entry => [`${entry.kind}:${entry.src}`, entry])).values()
  );

  const state: AssetGroupState = {
    id,
    total: uniqueEntries.length,
    loaded: 0,
    failed: 0,
    status: uniqueEntries.length > 0 ? 'loading' : 'loaded',
  };
  groupStates.set(id, state);
  notifyListeners();

  const promise = Promise.all(uniqueEntries.map(entry => (
    preloadEntry(entry)
      .then(() => {
        state.loaded += 1;
        groupStates.set(id, { ...state });
        notifyListeners();
      })
      .catch(() => {
        state.failed += 1;
        groupStates.set(id, { ...state });
        notifyListeners();
      })
  ))).then(() => {
    state.status = state.failed > 0 && state.loaded === 0 ? 'error' : 'loaded';
    groupStates.set(id, { ...state });
    notifyListeners();
    return state;
  }).finally(() => {
    groupPromises.delete(id);
  });

  groupPromises.set(id, promise);
  return promise;
};

export const preloadAssetGroups = async (ids: AssetGroupId[]) => {
  await Promise.all(ids.map(id => preloadAssetGroup(id)));
  return getAssetGroupsSummary(ids);
};

export const preloadAssetGroupPassive = (id: AssetGroupId) => {
  scheduleIdle(() => {
    preloadAssetGroup(id).catch(() => undefined);
  });
};

export const preloadAssetGroupsPassive = (ids: AssetGroupId[]) => {
  ids.forEach(id => preloadAssetGroupPassive(id));
};

export const getAssetGroupsSummary = (ids: AssetGroupId[]): AssetPreloadSummary => {
  const states = ids.map(getAssetGroupState);
  const total = states.reduce((sum, state) => sum + state.total, 0);
  const loaded = states.reduce((sum, state) => sum + state.loaded, 0);
  const failed = states.reduce((sum, state) => sum + state.failed, 0);
  const anyLoading = states.some(state => state.status === 'loading');
  const allSettled = states.every(state => state.status === 'loaded' || state.status === 'error');
  const status: PreloadStatus = anyLoading ? 'loading' : allSettled ? 'loaded' : 'idle';

  return {
    total,
    loaded,
    failed,
    status,
    progress: total > 0 ? Math.min(1, (loaded + failed) / total) : 1,
  };
};

export const areAssetGroupsReady = (ids: AssetGroupId[]) => {
  const summary = getAssetGroupsSummary(ids);
  return summary.total === 0 || summary.progress >= 1;
};

export const subscribeAssetPreloader = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getRouteAssetGroup = (routeTier?: string): AssetRouteGroup => {
  if (routeTier === 'Interstellar' || routeTier === 'Void' || routeTier === 'Earth') {
    return routeTierToGroup[routeTier];
  }
  return 'route1';
};

export const getRecommendedAssetGroupsForRoute = (routeTier?: string): AssetGroupId[] => {
  const routeGroup = getRouteAssetGroup(routeTier);
  if (routeGroup === 'route4') {
    return ['shared-ui', 'card-frames', 'route4', 'route4-colonies', 'route4-battle', 'arcades'];
  }
  return ['shared-ui', routeGroup];
};
