
export interface MiniGameConfig {
  id: string;
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  image: string;
  cabinetImage: string;
  status: 'available' | 'locked';
  path: string;
}

export const MINI_GAMES_CONFIG: MiniGameConfig[] = [
  {
    id: "salto-espacial",
    name: { pt: "Salto Espacial", en: "Space Jump" },
    description: { pt: "Colete recursos e aumente o tamanho da sua nave.", en: "Collect resources and increase your ship's size." },
    image: "/assets/games/salto_espacial/salto_espacial.mp4",
    cabinetImage: "/assets/games/salto_espacial/space_jump_fliper.webp",
    status: "available",
    path: "/mini-games/salto-espacial/index.html"
  },
  {
    id: "ruptura-estelar",
    name: { pt: "Ruptura Estelar", en: "Stellar Rupture" },
    description: { pt: "Sobreviva a ondas de inimigos e libere o poder máximo da sua nave.", en: "Survive waves of enemies and unleash your ship's ultimate power." },
    image: "/assets/games/ruptura_estelar/ruptura_estelar.mp4",
    cabinetImage: "/assets/games/ruptura_estelar/ruptura_estelar_fliper.webp",
    status: "available",
    path: "/mini-games/ruptura-estelar/index.html"
  },
  {
    id: "danger-zoom-zones",
    name: { pt: "Danger Zoom Zones", en: "Danger Zoom Zones" },
    description: { pt: "Desarme minas espaciais instáveis sob pressão de tempo e radiação.", en: "Disarm unstable space mines under time pressure and radiation." },
    image: "/assets/games/danger_zoom_zones/danger_zoom_zones.mp4",
    cabinetImage: "/assets/games/danger_zoom_zones/danger_zoom_zones_fliper.webp",
    status: "available",
    path: "/mini-games/danger-zoom-zones/index.html"
  },
  {
    id: "grid-collapse",
    name: { pt: "Grid Collapse", en: "Grid Collapse" },
    description: { pt: "Um clássico reinventado com peças especiais e efeitos de energia.", en: "A reimagined classic with special pieces and energy effects." },
    image: "/assets/games/grid_collapse/grid_collapse.mp4",
    cabinetImage: "/assets/games/grid_collapse/grid_collapse_fliper.webp",
    status: "available",
    path: "/mini-games/grid-collapse/index.html"
  },
  {
    id: "robot-runner",
    name: { pt: "The Robot Runner", en: "The Robot Runner" },
    description: { pt: "Um clássico labirinto tecnológico onde você deve coletar energia e evitar sentinelas.", en: "A classic technological maze where you must collect energy and avoid sentinels." },
    image: "/assets/games/robot_runner/robot_runner.mp4",
    cabinetImage: "/assets/games/robot_runner/robot_runner_fliper.webp",
    status: "available",
    path: "/mini-games/robot-runner/index.html"
  },
  {
    id: "neo-catcher",
    name: { pt: "Neo Catcher", en: "Neo Catcher" },
    description: { pt: "Capture objetos em queda e proteja o núcleo da Terra.", en: "Catch falling objects and protect the Earth's core." },
    image: "/assets/games/neo_catcher/neo_catcher.mp4",
    cabinetImage: "/assets/games/neo_catcher/neo_catcher_fliper.webp",
    status: "available",
    path: "/mini-games/neo-catcher/index.html"
  },
];
