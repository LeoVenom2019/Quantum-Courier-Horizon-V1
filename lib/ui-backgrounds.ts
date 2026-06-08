export const ACTIVE_DELIVERY_BACKGROUNDS = {
  route1: '/assets/texturas/deliver_bg_cap1.webp',
  route2: '/assets/texturas/deliver_bg_cap2.webp',
} as const;

export const MISSION_HEADER_BACKGROUNDS = {
  route1: '/assets/texturas/cap1_mission_bg.webp',
  route2: '/assets/texturas/cap2_mission_bg.webp',
} as const;

export const AETHERION_CHAMBER_BACKGROUND = '/assets/common/eter_bg.webp';
export const SCIFI_TEXTURE_BACKGROUND = '/assets/common/scifi_texture_bg.webp';

export const SOLAR_TECHNOLOGY_BACKGROUNDS: Record<number, string> = {
  1: '/assets/rota1/backgrounds_ui/tecnology/1_orbital_foundation.webp',
  2: '/assets/rota1/backgrounds_ui/tecnology/2_initial_propulsion.webp',
  3: '/assets/rota1/backgrounds_ui/tecnology/3_energy_stabilization.webp',
  4: '/assets/rota1/backgrounds_ui/tecnology/4_long_range_navigation.webp',
  5: '/assets/rota1/backgrounds_ui/tecnology/5_advanced_fusion_core.webp',
  6: '/assets/rota1/backgrounds_ui/tecnology/6_space_warp.webp',
  7: '/assets/rota1/backgrounds_ui/tecnology/7_interstellar_engineering.webp',
  8: '/assets/rota1/backgrounds_ui/tecnology/8_applied_dark_matter.webp',
  9: '/assets/rota1/backgrounds_ui/tecnology/9_controlled_singularity.webp',
};

export const SOLAR_AUTO_BACKGROUNDS: Record<number, string> = {
  1: '/assets/rota1/backgrounds_ui/auto/1_atlas_courier_local_distribution.webp',
  2: '/assets/rota1/backgrounds_ui/auto/2_lunar_runner_lunar_colony.webp',
  3: '/assets/rota1/backgrounds_ui/auto/3_solar_swift_venus_station.webp',
  4: '/assets/rota1/backgrounds_ui/auto/4_red_horizon_mars_colony.webp',
  5: '/assets/rota1/backgrounds_ui/auto/5_helios_freighter_mercury_base.webp',
  6: '/assets/rota1/backgrounds_ui/auto/6_jovian_hauler_jupiter_outpost.webp',
  7: '/assets/rota1/backgrounds_ui/auto/7_titan_carrier_saturn_rings.webp',
  8: '/assets/rota1/backgrounds_ui/auto/8_void_strider_uranus_station.webp',
  9: '/assets/rota1/backgrounds_ui/auto/9_neptune_vanguard_neptune_frontier.webp',
};

export const INTERSTELLAR_TECHNOLOGY_BACKGROUNDS: Record<number, string> = {
  1: '/assets/rota2/backgrounds_ui/tecnology/1_interstellar_foundation.webp',
  2: '/assets/rota2/backgrounds_ui/tecnology/2_fractal_warp_drives.webp',
  3: '/assets/rota2/backgrounds_ui/tecnology/3_reality_anchoring.webp',
  4: '/assets/rota2/backgrounds_ui/tecnology/4_deep_space_cartography.webp',
  5: '/assets/rota2/backgrounds_ui/tecnology/5_stellar_energy_reactors.webp',
  6: '/assets/rota2/backgrounds_ui/tecnology/6_event_horizon_propulsion.webp',
  7: '/assets/rota2/backgrounds_ui/tecnology/7_multiversal_synchronization.webp',
  8: '/assets/rota2/backgrounds_ui/tecnology/8_spacetime_condensation.webp',
  9: '/assets/rota2/backgrounds_ui/tecnology/9_post_temporal_ascension.webp',
};

export const INTERSTELLAR_AUTO_BACKGROUNDS: Record<number, string> = {
  1: '/assets/rota2/backgrounds_ui/auto/1_alpha_centauri.webp',
  2: '/assets/rota2/backgrounds_ui/auto/2_proxima_centauri.webp',
  3: '/assets/rota2/backgrounds_ui/auto/3_barnards_star.webp',
  4: '/assets/rota2/backgrounds_ui/auto/4_wolf_359.webp',
  5: '/assets/rota2/backgrounds_ui/auto/5_lalande_21185.webp',
  6: '/assets/rota2/backgrounds_ui/auto/6_sirius.webp',
  7: '/assets/rota2/backgrounds_ui/auto/7_luyten_726_8.webp',
  8: '/assets/rota2/backgrounds_ui/auto/8_ross_154.webp',
  9: '/assets/rota2/backgrounds_ui/auto/9_epsilon_eridani.webp',
};

export const INTERSTELLAR_EXTRACTION_POINT_BACKGROUNDS: Record<string, string> = {
  'ext-1': '/assets/rota2/backgrounds_ui/ext point/1_centauri_prime_belt.webp',
  'ext-2': '/assets/rota2/backgrounds_ui/ext point/2_proxima_b.webp',
  'ext-3': '/assets/rota2/backgrounds_ui/ext point/3_barnard_b.webp',
  'ext-4': '/assets/rota2/backgrounds_ui/ext point/4_fragmented_ring_of_wolf_359.webp',
  'ext-5': '/assets/rota2/backgrounds_ui/ext point/5_lalande_iv_iron_crust.webp',
  'ext-6': '/assets/rota2/backgrounds_ui/ext point/6_sirius_b_debris_field.webp',
  'ext-7': '/assets/rota2/backgrounds_ui/ext point/7_luyten_beta_unstable_binary_zone.webp',
  'ext-8': '/assets/rota2/backgrounds_ui/ext point/8_magnetized_crater_of_ross.webp',
  'ext-9': '/assets/rota2/backgrounds_ui/ext point/9_eridani_debris_disk.webp',
};

export const ROUTE1_UI_BACKGROUNDS = [
  ...Object.values(SOLAR_TECHNOLOGY_BACKGROUNDS),
  ...Object.values(SOLAR_AUTO_BACKGROUNDS),
];

export const ROUTE2_UI_BACKGROUNDS = [
  ...Object.values(INTERSTELLAR_TECHNOLOGY_BACKGROUNDS),
  ...Object.values(INTERSTELLAR_AUTO_BACKGROUNDS),
  ...Object.values(INTERSTELLAR_EXTRACTION_POINT_BACKGROUNDS),
];
