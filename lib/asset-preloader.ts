import { CARD_BACKGROUND_BY_RARITY, CARD_MODAL_BACKGROUND_BY_RARITY } from './colony-cards';
import { MINI_GAMES_CONFIG } from './mini-games-config';
import { ARCADE_THEMES, ROUTE_THEMES } from './music-data';
import { NEW_EARTH_TREASURE_CATALOG } from './new-earth-treasures';
import { AETHERION_CHAMBER_BACKGROUND, ACTIVE_DELIVERY_BACKGROUNDS, MISSION_HEADER_BACKGROUNDS, ROUTE1_UI_BACKGROUNDS, ROUTE2_UI_BACKGROUNDS, SCIFI_TEXTURE_BACKGROUND } from './ui-backgrounds';

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

const route1UpgradeBackgrounds = [
  '/assets/melhorias/bg_rota1_upgrade.webp',
  '/assets/melhorias/bg_rota1_title.webp',
  '/assets/melhorias/bg_rota1_missoes_header.webp',
  '/assets/melhorias/bg_rota1_motor.webp',
  '/assets/melhorias/bg_rota1_missao.webp',
  '/assets/melhorias/bg_rota1_mercadoria.webp',
  '/assets/melhorias/bg_rota1_ia.webp',
];

const route1MineralVideos = [
  '/videos/minerals/cap1/1_common_ferrite.webm',
  '/videos/minerals/cap1/2_energized_quartz.webm',
  '/videos/minerals/cap1/3_space_nickel.webm',
  '/videos/minerals/cap1/4_ionized_cobalt.webm',
  '/videos/minerals/cap1/5_refined_titanium.webm',
  '/videos/minerals/cap1/6_plasma_crystal.webm',
  '/videos/minerals/cap1/7_condensed_aether.webm',
  '/videos/minerals/cap1/8_exotic_matter.webm',
  '/videos/minerals/cap1/9_quantum_core.webm',
];

const route2MineralVideos = [
  '/videos/minerals/cap2/1_stellar_iron.webm',
  '/videos/minerals/cap2/2_photonic_crystal.webm',
  '/videos/minerals/cap2/3_iridium_alloy.webm',
  '/videos/minerals/cap2/4_solid_plasma.webm',
  '/videos/minerals/cap2/5_radiant_core.webm',
  '/videos/minerals/cap2/6_anomaly_fragment.webm',
  '/videos/minerals/cap2/7_nebular_essence.webm',
  '/videos/minerals/cap2/8_unstable_matter.webm',
  '/videos/minerals/cap2/9_condensed_singularity.webm',
];

const route1HistoricBackgrounds = [
  '/assets/texturas/historic/cap1/bg_header.webp',
  '/assets/texturas/historic/cap1/bg_left.webp',
  '/assets/texturas/historic/cap1/bg_repo.webp',
  '/assets/texturas/historic/cap1/bg_right1.webp',
  '/assets/texturas/historic/cap1/bg_right2.webp',
];

const route2UpgradeBackgrounds = [
  '/assets/melhorias/bg_rota2_upgrade.webp',
  '/assets/melhorias/bg_rota2_title.webp',
  '/assets/melhorias/bg_rota2_missoes_header.webp',
  '/assets/melhorias/bg_rota2_motor.webp',
  '/assets/melhorias/bg_rota2_missao.webp',
  '/assets/melhorias/bg_rota2_mercadoria.webp',
  '/assets/melhorias/bg_rota2_ia.webp',
];

const route2HistoricBackgrounds = [
  '/assets/texturas/historic/cap2/bg_header.webp',
  '/assets/texturas/historic/cap2/bg_left.webp',
  '/assets/texturas/historic/cap2/bg_repo.webp',
  '/assets/texturas/historic/cap2/bg_right1.webp',
  '/assets/texturas/historic/cap2/bg_right2.webp',
];

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
  'gaia/neptune_explor_prev.webp',
  'eden/poseidon_explor_prev.webp',
].map(path => `/assets/rota4/colonys/${path}`);

const route4LayoutImages = [
  '/assets/rota4/layout_cap4/searc_land_background.webp',
  '/assets/rota4/layout_cap4/search_sea_background.webp',
  '/assets/rota4/layout_cap4/hangar_horizon.webp',
  '/assets/rota4/layout_cap4/mural_background.webp',
  '/assets/rota4/layout_cap4/historico_card.webp',
  '/assets/rota4/layout_cap4/historico_card_raro.webp',
  '/assets/rota4/layout_cap4/historico_card_epico.webp',
  '/assets/rota4/layout_cap4/historico_card_lendario.webp',
  '/assets/rota4/layout_cap4/historico_card_rgb.webp',
  '/assets/rota4/layout_cap4/ano_atual.webp',
  '/assets/rota4/layout_cap4/populacao_atual.webp',
  '/assets/rota4/layout_cap4/bg_peixes.webp',
  '/assets/rota4/layout_cap4/bg_reliquias.webp',
  '/assets/rota4/layout_cap4/bg_aneis.webp',
  '/assets/rota4/layout_cap4/bg_peixes_card.webp',
  '/assets/rota4/layout_cap4/bg_reliquias_card.webp',
  '/assets/rota4/layout_cap4/bg_aneis_card.webp',
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_1.webp',
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_2.webp',
  '/assets/rota4/layout_cap4/bg_victory_battle_cap4_3.webp',
  '/assets/rota4/layout_cap4/bg_lose_battle_cap4_.webp',
  '/assets/texturas/textura_ficsi_2400x240.webp',
];

const route4TextureImages = [
  '/assets/texturas/textura_cards_cap4.webp',
  '/assets/texturas/textura_cards_background_cap4.webp',
  '/assets/texturas/textura_historic_cap4.webp',
];

const route4ColonyAudio = [
  '/assets/rota4/SFX_new_land/aba_colonys_click.ogg',
  '/assets/rota4/SFX_new_land/achievment_unlocked.ogg',
  '/assets/rota4/SFX_new_land/50_robots.ogg',
  '/assets/rota4/SFX_new_land/250_robots.ogg',
  '/assets/rota4/SFX_new_land/hangar_open_door.ogg',
  '/assets/rota4/SFX_new_land/hangar_close_door.ogg',
  '/assets/rota4/SFX_new_land/warning_gaming.ogg',
  '/assets/rota4/SFX_new_land/bonus_qc_final.ogg',
  '/assets/rota4/SFX_new_land/special thor/thunder_special.ogg',
  '/assets/rota4/SFX_new_land/special thor/tornado_thor.ogg',
  '/assets/rota4/SFX_new_land/special thor/thunder_a.ogg',
  '/assets/rota4/SFX_new_land/special thor/thunder_b.ogg',
  '/assets/rota4/SFX_new_land/special thor/thunder_c.ogg',
  '/assets/rota4/SFX_new_land/special blizzard/blizard_special.ogg',
  '/assets/rota4/SFX_new_land/special blizzard/ice_explosion_1.ogg',
  '/assets/rota4/SFX_new_land/special blizzard/ice_explosion_2.ogg',
  '/assets/rota4/SFX_new_land/special blizzard/ice_explosion_3.ogg',
  '/assets/rota4/SFX_new_land/special blizzard/ice_explosion_4.ogg',
];

const route4BobbyAccessDeniedAudio = Array.from({ length: 10 }, (_, index) => (
  `/audio/sfx/bobby_blue/access_denied/access_denied_${index + 1}.ogg`
));

const route4BobbyMissionCompleteAudio = Array.from({ length: 10 }, (_, index) => (
  `/audio/sfx/bobby_blue/mission_complete/mission_complete_${index + 1}.ogg`
));

const route4BobbyWarningAudio = Array.from({ length: 9 }, (_, index) => (
  `/audio/sfx/bobby_blue/warnings/warning_${index + 1}.ogg`
));

const route4BobbyPrepareForBattleAudio = Array.from({ length: 7 }, (_, index) => (
  `/audio/sfx/bobby_blue/prepare_for_battle/${index + 1}_prepare_for_battle.ogg`
));

const route4BobbyLockedArcadeCardAudio = [
  '/audio/sfx/bobby_blue/cards lockeds/cards lockeds1.ogg',
  '/audio/sfx/bobby_blue/cards lockeds/cards lockeds2.ogg',
];

const route4BobbyLockedTvAudio = [
  '/audio/sfx/bobby_blue/video tv/video_tv1.ogg',
  '/audio/sfx/bobby_blue/video tv/video_tv2.ogg',
  '/audio/sfx/bobby_blue/video tv/video_tv3.ogg',
];

const route4BobbyPopulationMilestoneAudio = [
  '/audio/sfx/bobby_blue/population milestone/one_milion.ogg',
  '/audio/sfx/bobby_blue/population milestone/ten_milion.ogg',
  '/audio/sfx/bobby_blue/population milestone/fifty_milion.ogg',
  '/audio/sfx/bobby_blue/population milestone/one_hundred_milion.ogg',
  '/audio/sfx/bobby_blue/population milestone/five_hundred_milion.ogg',
  '/audio/sfx/bobby_blue/population milestone/billion.ogg',
  '/audio/sfx/bobby_blue/population milestone/five_billion.ogg',
  '/audio/sfx/bobby_blue/population milestone/ten_billion.ogg',
  '/audio/sfx/bobby_blue/population milestone/twenty_billion.ogg',
];

const route4BobbyMuralAudio = [
  ...Array.from({ length: 34 }, (_, index) => (
    `/audio/sfx/bobby_blue/mural open/open_mural_${index + 1}.ogg`
  )),
  ...Array.from({ length: 24 }, (_, index) => (
    `/audio/sfx/bobby_blue/mural close/close_mural_${index + 1}.ogg`
  )),
];

const route4BattleBase = '/assets/rota4/battles';
const submarineSpriteKeys = [
  'front',
  'back',
  'up',
  'down',
  'down_front',
  'down_back',
  'up_back',
  'up_front',
  'turn_1',
  'turn_2',
  'turn_3',
  'turn_back_1',
  'turn_back_2',
  'turn_back_3',
];
const route4SubmarineSpriteImages = [
  ...submarineSpriteKeys.map(key => `/assets/rota4/colonys/gaia/gaia_submarine_neptune/gaia_${key}.webp`),
  ...submarineSpriteKeys.map(key => `/assets/rota4/colonys/eden/eden_submarine_poseidon/eden_${key}.webp`),
  ...submarineSpriteKeys.map(key => `/assets/rota4/colonys/enemy_submarine1/enemy_submarine1_${key}.webp`),
  ...submarineSpriteKeys.map(key => `/assets/rota4/colonys/enemy_submarine2/enemy_submarine2_${key}.webp`),
  ...submarineSpriteKeys.map(key => `/assets/rota4/colonys/enemy_submarine3/enemy_submarine3_${key}.webp`),
];
const route4TreasureRelicImages = NEW_EARTH_TREASURE_CATALOG.map(treasure => treasure.src);

const route4BattleBackgroundImages = [
  `${route4BattleBase}/backgrounds/day/rt4_background_day.webp`,
  `${route4BattleBase}/backgrounds/night/rt4_background_night.webp`,
  `${route4BattleBase}/backgrounds/winter/rt4_background_winter.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_day_2.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_day_3.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_day_4.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_night_2.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_night_3.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_night_4.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_night_5.webp`,
  `${route4BattleBase}/backgrounds/multiple/rt4_background_winter_2.webp`,
];

const route4NewEarthSurfaceBattleBackgroundImages = [
  ...Array.from({ length: 6 }, (_, index) => (
    `/assets/rota4/new_land_assets/forgotten_continent_new_land_system/forgotten_continent_background_${index + 1}.webp`
  )),
  ...Array.from({ length: 4 }, (_, index) => (
    `/assets/rota4/new_land_assets/glacial_zone_new_land_system/glacial_zone_background_${index + 1}.webp`
  )),
  ...Array.from({ length: 5 }, (_, index) => (
    `/assets/rota4/new_land_assets/european_ruins_new_land_system/european_background_${index + 1}.webp`
  )),
];

const route4NewEarthTankSpriteImages = [
  '/assets/rota4/colonys/genesis/aether_tank/1tank_player_body.webp',
  '/assets/rota4/colonys/genesis/aether_tank/1tank_player_turret.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_comum_body.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_comum_turret.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_elite_body.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_elite_turret.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_boss_body.webp',
  '/assets/rota4/colonys/enemy_tank/tank_enemy_boss_turret.webp',
];

const route4NewEarthAetherHelicopterImages = [
  '/assets/rota4/colonys/elysium/aether/aether_helicopter_body.webp',
  '/assets/rota4/colonys/elysium/aether/helice.webp',
  '/assets/rota4/colonys/elysium/aether/aether_missil.webp',
  '/assets/rota4/colonys/elysium/aether/drone_player.webp',
  '/assets/rota4/colonys/elysium/aether/drone_helice.webp',
];

const route4NewEarthEnemyChopterImages = [
  '/assets/rota4/colonys/enemy_chopter/enemy_common_helice.webp',
  '/assets/rota4/colonys/enemy_chopter/enemy_common_black_body.webp',
  '/assets/rota4/colonys/enemy_chopter/enemy_common_red_body.webp',
  '/assets/rota4/colonys/enemy_chopter/enemy_common_purple_body.webp',
  '/assets/rota4/colonys/enemy_chopter/enemy_elite_body.webp',
  '/assets/rota4/colonys/enemy_chopter/enemy_boss_body.webp',
];

const route4NewEarthWarInformationImages = [
  '/assets/rota4/war_informations/war_inf_1.webp',
  '/assets/rota4/war_informations/war_inf_2.webp',
  '/assets/rota4/war_informations/war_inf_3.webp',
  '/assets/rota4/war_informations/war_inf_4.webp',
];

const route4BattleImages = [
  ...route4BattleBackgroundImages,
  ...route4NewEarthSurfaceBattleBackgroundImages,
  ...route4NewEarthTankSpriteImages,
  ...route4NewEarthAetherHelicopterImages,
  ...route4NewEarthEnemyChopterImages,
  ...route4NewEarthWarInformationImages,
  `${route4BattleBase}/player/horizon/horizon.webp`,
  `${route4BattleBase}/player/horizon/horizon_12pos_spritesheet.webp`,
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
  `${route4BattleBase}/enemys/monsters/monster 1/m1_8pos_spritesheet.webp`,
  `${route4BattleBase}/enemys/monsters/monster 1/m1_hover_spritesheet_30f_6x5.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m3_neutral.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_forward.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m4_up.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_down.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/m2_backward.webp`,
  `${route4BattleBase}/enemys/monsters/monster 2/boss1_spritesheet_30fps_motion_6x6.png`,
  '/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_01.webp',
  '/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_02.webp',
  '/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_03.webp',
  '/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_04.webp',
  '/assets/rota4/new_land_assets/abyssal_ocean_new_land_system/abissal_05.webp',
  '/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_01.webp',
  '/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_02.webp',
  '/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_03.webp',
  '/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_04.webp',
  '/assets/rota4/new_land_assets/ship_graveyard_new_land_system/graveyard_05.webp',
  '/assets/rota4/treasures/treasure_closed.webp',
  '/assets/rota4/treasures/treasure_closed2.webp',
  '/assets/rota4/treasures/treasure_closed3.webp',
  '/assets/rota4/treasures/treasure_closed4.webp',
  '/assets/rota4/treasures/treasure_closed5.webp',
  '/assets/rota4/treasures/treasure_open.webp',
  '/assets/rota4/treasures/treasure_open2.webp',
  '/assets/rota4/treasures/treasure_open3.webp',
  '/assets/rota4/treasures/treasure_open4.webp',
  '/assets/rota4/treasures/treasure_open5.webp',
  ...route4TreasureRelicImages,
  ...route4SubmarineSpriteImages,
];

const route4BattleAudio = [
  '/audio/sfx/shoot_enemy.ogg',
  '/audio/sfx/shoot_player.ogg',
  '/assets/rota4/SFX_new_land/airplane_enemys_sounds.ogg',
  '/assets/rota4/SFX_new_land/airplane_player_sounds.ogg',
  '/assets/rota4/SFX_new_land/enemy_explosion_cap_4.ogg',
  '/assets/rota4/SFX_new_land/enemy_explosion_cap4_2.ogg',
  '/assets/rota4/SFX_new_land/explosion_elite_cap4.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_comum_sound.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_elite_sound.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_boss_sound.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/helicopter_aether_sound.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/get_drone_sound.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/drone_explosion.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_comum_before_exploding.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_elite_before_exploding.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/enemy_boss_before_exploding.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/aether_player_before_exploding.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/aether_shooting_missil.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/aether_missil_impact.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_player_running.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_player_stoping.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_enemy_comum_shoot.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_enemy_elite_shoot.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_shoot_player.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_start_mission.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/helicopter_start_mission.ogg',
  '/assets/rota4/SFX_new_land/helicopters_tanks/tank_boss_shooting.ogg',
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
  '/assets/rota4/SFX_new_land/abissal_sounds_1_mistery.ogg',
  '/assets/rota4/SFX_new_land/abissal_sounds_2_mistery.ogg',
  '/assets/rota4/SFX_new_land/abissal_sounds_3_mistery.ogg',
  '/assets/rota4/SFX_new_land/enemy_submarine_enter.ogg',
  '/assets/rota4/SFX_new_land/player_torped_launcher.ogg',
  '/assets/rota4/SFX_new_land/player_torped_impact.ogg',
  '/assets/rota4/SFX_new_land/submarine_enter.ogg',
  '/assets/rota4/SFX_new_land/radar_submarine_1.ogg',
  '/assets/rota4/SFX_new_land/submarine_aim_green.ogg',
  '/assets/rota4/SFX_new_land/submarine_ocean_sounds_1.ogg',
  '/assets/rota4/SFX_new_land/submarine_ocean_sounds_2.ogg',
  '/assets/rota4/SFX_new_land/submarine_explosion1.ogg',
  '/assets/rota4/SFX_new_land/submarine_explosion_2.ogg',
  '/assets/rota4/SFX_new_land/submarine_explosion_3.ogg',
  '/assets/rota4/SFX_new_land/chest_rare_comum.ogg',
  '/assets/rota4/SFX_new_land/chest_epic.ogg',
  '/assets/rota4/SFX_new_land/chest_legendary.ogg',
  '/assets/rota4/SFX_new_land/treasure_1_.ogg',
  '/assets/rota4/SFX_new_land/treasure_2_.ogg',
  '/assets/rota4/SFX_new_land/submarine_motion_1.ogg',
  '/assets/rota4/SFX_new_land/submarine_motion_2.ogg',
  '/assets/rota4/SFX_new_land/submarine_player_constant.ogg',
  '/assets/rota4/SFX_new_land/submarine_player_stoping.ogg',
];

const route4OceanThemeAudio = [
  '/assets/rota4/themes_ocean/abyssal_whispers.ogg',
  '/assets/rota4/themes_ocean/bioluminescent_dreams.ogg',
  '/assets/rota4/themes_ocean/deep_sea_serenity.ogg',
  '/assets/rota4/themes_ocean/underwater_colors.ogg',
  '/assets/rota4/themes_ocean/sunken_silence.ogg',
  '/assets/rota4/themes_ocean/ocean_floor_slumber.ogg',
  '/assets/rota4/themes_ocean/gentle_tides.ogg',
  '/assets/rota4/themes_ocean/floating_coral.ogg',
];

const arcadeResultVideos = MINI_GAMES_CONFIG.flatMap(game => {
  const folder = game.id.replaceAll('-', '_');
  const file = game.id === 'salto-espacial' ? 'space_jump' : folder;
  return [
    `/assets/games/${folder}/${file}_victory.webm`,
    `/assets/games/${folder}/${file}_lose.webm`,
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
  'barrier_explosion',
  'rupture_last_explosion',
  'neo_catcher_black',
  'neo_catcher_3_colors',
  'neo_catcher_heall',
  'neo_catcher_miss',
  'neo_catcher_bomb',
  'intro_fliper',
  'insert_coins',
  'victory_theme_games',
  'lose_theme_games',
].map(name => `/assets/games/flipers_sfx/${name}.ogg`);

const neoCatcherBackgrounds = [
  '/assets/games/neo_catcher/neo_catcher_street_background.webp',
  '/assets/games/neo_catcher/neo_catcher_beach_background.webp',
  '/assets/games/neo_catcher/neo_catcher_bridge_background.webp',
  '/assets/games/neo_catcher/neo_catcher_volcano_background.webp',
];

const dangerZoomZonesImages = [
  '/assets/games/danger_zoom_zones/danger_zoom_zones_bg.webp',
  '/assets/games/danger_zoom_zones/danger_zoom_zones_bg2.webp',
];

const gridCollapseImages = [
  '/assets/games/grid_collapse/grid_collapse_bg.webp',
];

const route3VoidLocationKeys = ['zero', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const route3VoidBossSpriteImages = route3VoidLocationKeys.flatMap(locationKey => (
  ['neutral', 'up', 'down', 'forward', 'backward'].map(direction => (
    `/assets/rota3/void/${locationKey}/boss_${direction}.webp`
  ))
));
const route3VoidBossShootImages = [
  '/assets/rota3/void/5/boss_shoot.webp',
];
const route3VoidBattleImages = [
  '/images/ships/battle/player_battle_neutral.webp',
  '/images/ships/battle/player_battle_up.webp',
  '/images/ships/battle/player_battle_down.webp',
  '/images/ships/battle/player-battle.webp',
  '/images/battle/void/meteorite1.webp',
  '/images/battle/void/meteorite2.webp',
  '/images/battle/void/meteor1.webp',
  '/images/battle/void/meteor2.webp',
  '/assets/rota3/void/bg_void_invasion.webp',
  '/assets/rota3/void/mitic_eclipse/mitic_eclipse_neutral.webp',
  '/assets/rota3/void/mitic_eclipse/mitic_eclipse_up.webp',
  '/assets/rota3/void/mitic_eclipse/mitic_eclipse_down.webp',
  '/assets/rota3/void/mitic_eclipse/mitic_eclipse_forward.webp',
  '/assets/rota3/void/zero/monster-elite_neutral.webp',
  '/assets/rota3/void/zero/monster-common-1_neutral.webp',
  '/assets/rota3/void/zero/monster-common-2_neutral.webp',
  '/assets/rota3/void/zero/monster-common-3_neutral.webp',
  '/assets/rota3/void/zero/monster-common-4_neutral.webp',
  ...route3VoidLocationKeys.map(locationKey => `/assets/rota3/void/${locationKey}/bg_layer_${locationKey}.webp`),
  ...route3VoidBossSpriteImages,
  ...route3VoidBossShootImages,
];
const route3VoidBattleVideos = [
  ...route3VoidLocationKeys.map(locationKey => `/assets/rota3/void/${locationKey}/background_battle_${locationKey}.mp4`),
  '/assets/rota3/void/1/devorador_alpha.mp4',
  '/assets/rota3/void/2/sanguessuga_estelar.mp4',
  '/assets/rota3/void/3/colosso_amalgamado.mp4',
  '/assets/rota3/void/4/kraken_do_vazio.mp4',
  '/assets/rota3/void/5/besta_titã_de_ferro.mp4',
  '/assets/rota3/void/6/horror_mutante.mp4',
  '/assets/rota3/void/7/verme_rei_do_vazio.mp4',
  '/assets/rota3/void/8/predador_abissal.mp4',
  '/assets/rota3/void/9/deus_monstro_do_vazio.mp4',
];

const route3VoidDonationAudio = [
  '/audio/sfx/open_window_void.ogg',
  '/audio/sfx/close_window_void.ogg',
  '/audio/sfx/donation_1_void.ogg',
  '/audio/sfx/donation_2_void.ogg',
  '/audio/sfx/donation_3_void.ogg',
  '/audio/sfx/full_void.ogg',
  '/audio/sfx/songs_of_war.ogg',
];

const rupturaEstelarEnemies = [
  '/assets/games/ruptura_estelar/ruptura_canvas_bg.webp',
  '/assets/games/ruptura_estelar/battle_shopter_ruptura.webp',
  '/assets/games/ruptura_estelar/battle_airship_ruptura.webp',
  '/assets/games/ruptura_estelar/1bg_beach_ruptura.webp',
  '/assets/games/ruptura_estelar/2bg_city_ruptura.webp',
  '/assets/games/ruptura_estelar/3bg_montain_ruptura.webp',
  '/assets/games/ruptura_estelar/4bg_desert_ruptura.webp',
  '/assets/games/ruptura_estelar/5bg_nebula_ruptura.webp',
  '/assets/games/ruptura_estelar/6bg_saturn_ruptura.webp',
  '/assets/games/ruptura_estelar/7bg_space_ruptura.webp',
  '/assets/games/ruptura_estelar/8bg_earth_ruptura.webp',
  '/assets/games/ruptura_estelar/boos_1_ruptura.webp',
  '/assets/games/ruptura_estelar/boos_2_ruptura.webp',
  '/assets/games/ruptura_estelar/boos_3_ruptura.webp',
  '/assets/games/ruptura_estelar/boos_4_ruptura.webp',
  '/assets/games/ruptura_estelar/ruptura_meteor1.webp',
  '/assets/games/ruptura_estelar/ruptura_meteor2.webp',
  '/assets/games/ruptura_estelar/ruptura_meteor3.webp',
  '/assets/games/ruptura_estelar/ruptura_meteor4.webp',
  '/assets/games/ruptura_estelar/ruptura_meteorite1.webp',
  '/assets/games/ruptura_estelar/ruptura_meteorite2.webp',
  '/assets/games/ruptura_estelar/ruptura_meteorite3.webp',
  '/assets/games/ruptura_estelar/ruptura_meteorite4.webp',
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
      '/assets/rota4/SFX_new_land/hangar_open_door.ogg',
      '/assets/rota4/SFX_new_land/hangar_close_door.ogg',
      '/audio/sfx/view_card.ogg',
      '/audio/sfx/claim_card.ogg',
      '/audio/sfx/equip_card.ogg',
      '/audio/sfx/unequip_card.ogg',
      '/audio/sfx/change_air_ships.ogg',
      '/audio/sfx/tec_extract_change.ogg',
      '/audio/sfx/radar_skip_victory.ogg',
      '/audio/sfx/radar_skip_defeat.ogg',
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
      SCIFI_TEXTURE_BACKGROUND,
    ], 'image'),
    ...asEntries([
      '/videos/bobby_blue/bobby_blue_game_intro_glitch.webm',
      '/videos/bobby_blue/bobby_blue_game_intro.webm',
    ], 'video'),
  ],
  'card-frames': asEntries([
    ...Object.values(CARD_BACKGROUND_BY_RARITY),
    ...Object.values(CARD_MODAL_BACKGROUND_BY_RARITY),
    '/assets/rota4/cards/joker_ico.webp',
  ], 'image'),
  arcades: [
    ...asEntries(['/assets/games/arcade_background.webp'], 'image'),
    ...asEntries(MINI_GAMES_CONFIG.map(game => game.cabinetImage), 'image'),
    ...asEntries([...MINI_GAMES_CONFIG.map(game => game.image), '/assets/games/fliper_intro.webm'], 'video'),
    ...asEntries(arcadeResultVideos, 'video'),
    ...asEntries(dangerZoomZonesImages, 'image'),
    ...asEntries(gridCollapseImages, 'image'),
    ...asEntries(neoCatcherBackgrounds, 'image'),
    ...asEntries(rupturaEstelarEnemies, 'image'),
    ...asEntries(arcadeThemeAudio, 'audio'),
    ...asEntries([...fliperSfx, ...route4BobbyLockedArcadeCardAudio], 'audio'),
  ],
  route1: [
    ...asEntries([routeHeaderImages.route1, ACTIVE_DELIVERY_BACKGROUNDS.route1, MISSION_HEADER_BACKGROUNDS.route1, AETHERION_CHAMBER_BACKGROUND, ...ROUTE1_UI_BACKGROUNDS, ...route1UpgradeBackgrounds, ...route1HistoricBackgrounds], 'image'),
    ...asEntries(route1MineralVideos, 'video'),
    ...asEntries(routeThemeAudio('Solar'), 'audio'),
  ],
  route2: [
    ...asEntries([routeHeaderImages.route2, ACTIVE_DELIVERY_BACKGROUNDS.route2, MISSION_HEADER_BACKGROUNDS.route2, AETHERION_CHAMBER_BACKGROUND, ...ROUTE2_UI_BACKGROUNDS, ...route2UpgradeBackgrounds, ...route2HistoricBackgrounds], 'image'),
    ...asEntries(route2MineralVideos, 'video'),
    ...asEntries(routeThemeAudio('Interstellar'), 'audio'),
  ],
  route3: [
    ...asEntries([
      routeHeaderImages.route3,
      ...route3VoidBattleImages,
    ], 'image'),
    ...asEntries(route3VoidBattleVideos, 'video'),
    ...asEntries([...routeThemeAudio('Void'), ...route3VoidDonationAudio], 'audio'),
  ],
  route4: [
    ...asEntries([routeHeaderImages.route4, '/images/bobby_blue/bobby_blue_new_land.webp', '/assets/rota4/new_land_map.webp', ...route4TextureImages], 'image'),
    ...asEntries(['/assets/rota4/videos/quantum_courier_credits.webm'], 'video'),
    ...asEntries([...routeThemeAudio('Earth'), '/audio/themes/infinite_horizon_short_version.ogg', ...route4BobbyAccessDeniedAudio, ...route4BobbyMissionCompleteAudio, ...route4BobbyWarningAudio, ...route4BobbyPrepareForBattleAudio, ...route4BobbyLockedTvAudio, ...route4BobbyPopulationMilestoneAudio, ...route4BobbyMuralAudio], 'audio'),
  ],
  'route4-colonies': [
    ...asEntries([...route4ColonyImages, ...route4LayoutImages], 'image'),
    ...asEntries(route4ColonyAudio, 'audio'),
  ],
  'route4-battle': [
    ...asEntries(route4BattleImages, 'image'),
    ...asEntries([...route4BattleAudio, ...route4OceanThemeAudio], 'audio'),
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
