export type CargoType = 'Tecnologia' | 'Artefatos' | 'Minerais' | 'Biológico' | 'Dados' | 'Energia';

export type ThemeColor = 'cyan' | 'orange' | 'neila' | 'pink' | 'violet' | 'amber' | 'emerald' | 'rose' | 'blue';

export interface GameTheme {
  id: string;
  name: { en: string; pt: string };
  color: ThemeColor;
  visual: string;
}

export const GAME_THEMES: GameTheme[] = [
  { id: 'default', name: { en: 'DEFAULT', pt: 'PADRÃO' }, color: 'cyan', visual: 'none' },
  { id: 'moon', name: { en: 'LUNAR', pt: 'LUNAR' }, color: 'cyan', visual: 'moon' },
  { id: 'earth', name: { en: 'TERRA', pt: 'TERRA' }, color: 'blue', visual: 'earth' },
  { id: 'saturn', name: { en: 'SATURN', pt: 'SATURNO' }, color: 'orange', visual: 'saturn' },
  { id: 'musk', name: { en: 'X-FACTOR', pt: 'FATOR X' }, color: 'cyan', visual: 'musk' },
  { id: 'blackhole', name: { en: 'SINGULARITY', pt: 'SINGULARIDADE' }, color: 'violet', visual: 'blackhole' },
  { id: 'sun', name: { en: 'SOLAR', pt: 'SOLAR' }, color: 'orange', visual: 'sun' },
  { id: 'robot', name: { en: 'ANDROID', pt: 'ANDRÓIDE' }, color: 'emerald', visual: 'robot' },
  { id: 'chess', name: { en: 'GRANDMASTER', pt: 'GRÃO-MESTRE' }, color: 'amber', visual: 'chess' },
  { id: 'neila', name: { en: 'EMERALD', pt: 'ESMERALDA' }, color: 'neila', visual: 'alien' },
];

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  risk: number;
  reward: number;
  cargoType: CargoType;
  tier: 'Solar' | 'Interstellar' | 'Void';
  autoTravelCost: number;
  unlockCost?: number;
  requiredShipLevel: number;
  unlockCondition: {
    deliveriesTotal?: number;
    deliveriesTo?: { location: string; count: number };
    techLevel?: { category: string; level: number };
    initial?: boolean;
    route2Unlocked?: boolean;
    route3Unlocked?: boolean;
  };
}

export interface VoidAircraft {
  id: string;
  name: string;
  capacity: number;
  efficiency: number;
  rareChance: number;
  missionTime: number; // in milliseconds
  description: string;
  image?: string;
  video?: string;
}

export interface VoidPOI {
  id: string;
  name: string;
  lore: string;
  video?: string;
  need: 'Energia' | 'Alimentos' | 'Tecnologia' | 'Medicamentos';
  resourceRequired: number;
  passiveGeneration: {
    resource: string;
    amount: number;
  };
}

export interface Ship {
  level: number;
  name: string;
  route: string;
  maxSpeed: number;
  technology: string;
  description: string;
  range: number;
  cost: number;
  tier: 'Solar' | 'Interstellar' | 'Void';
  color: string;
  image?: string;
  lottie?: string;
}

export interface Technology {
  id: string;
  level: number;
  name: string;
  description: string;
  unlocksShipLevel: number;
  cost: number;
  researchTime: number; // in milliseconds
  tier: 'Solar' | 'Interstellar' | 'Void';
}

export interface UpgradeTier {
  level: number;
  name: string;
  cost: number;
  bonus: string;
  value: number; // The numerical value of the bonus (e.g., 0.2 for 20%)
}

export interface Upgrade {
  id: string;
  name: string;
  category: 'Motor' | 'IA' | 'Valor' | 'Raro';
  tiers: UpgradeTier[];
}

export interface Ore {
  id: string;
  name: string;
  rarity: number;
  baseValue: number;
  requiredShipLevel: number;
  packSize: number;
  robotBaseCost: number;
  autoSellCost: number;
  tier: 'Solar' | 'Interstellar';
}

export interface MiningRobotUpgrade {
  level: number;
  name: string;
  costMultiplier: number;
  speedBonus: number;
  efficiencyBonus: number;
  productionBonus: number;
}

export const ORES: Ore[] = [
  // ROTA 1: Solar
  { id: 'ferrita', name: 'Ferrita Comum', rarity: 1, baseValue: 50, requiredShipLevel: 1, packSize: 50, robotBaseCost: 5000, autoSellCost: 50000, tier: 'Solar' },
  { id: 'quartzo', name: 'Quartzo Energizado', rarity: 1, baseValue: 150, requiredShipLevel: 2, packSize: 50, robotBaseCost: 15000, autoSellCost: 75000, tier: 'Solar' },
  { id: 'niquel', name: 'Níquel Espacial', rarity: 1, baseValue: 500, requiredShipLevel: 3, packSize: 50, robotBaseCost: 50000, autoSellCost: 150000, tier: 'Solar' },
  { id: 'cobalto', name: 'Cobalto Ionizado', rarity: 1, baseValue: 2000, requiredShipLevel: 4, packSize: 50, robotBaseCost: 200000, autoSellCost: 350000, tier: 'Solar' },
  { id: 'titanio', name: 'Titânio Refinado', rarity: 1, baseValue: 8000, requiredShipLevel: 5, packSize: 50, robotBaseCost: 800000, autoSellCost: 800000, tier: 'Solar' },
  { id: 'plasma', name: 'Cristal de Plasma', rarity: 1, baseValue: 30000, requiredShipLevel: 6, packSize: 50, robotBaseCost: 3000000, autoSellCost: 2000000, tier: 'Solar' },
  { id: 'eter', name: 'Éter Condensado', rarity: 1, baseValue: 100000, requiredShipLevel: 7, packSize: 50, robotBaseCost: 10000000, autoSellCost: 5000000, tier: 'Solar' },
  { id: 'materia', name: 'Matéria Exótica', rarity: 1, baseValue: 300000, requiredShipLevel: 8, packSize: 50, robotBaseCost: 30000000, autoSellCost: 15000000, tier: 'Solar' },
  { id: 'nucleo', name: 'Núcleo Quântico', rarity: 1, baseValue: 1000000, requiredShipLevel: 9, packSize: 50, robotBaseCost: 100000000, autoSellCost: 50000000, tier: 'Solar' },
  
  // ROTA 2: Interstellar
  { id: 'ferro-estelar', name: 'Ferro Estelar', rarity: 1, baseValue: 1000000, requiredShipLevel: 1, packSize: 50, robotBaseCost: 100000000, autoSellCost: 500000000, tier: 'Interstellar' },
  { id: 'cristal-fotonico', name: 'Cristal Fotônico', rarity: 1, baseValue: 2000000, requiredShipLevel: 2, packSize: 50, robotBaseCost: 300000000, autoSellCost: 1500000000, tier: 'Interstellar' },
  { id: 'liga-iridio', name: 'Liga de Irídio', rarity: 1, baseValue: 5000000, requiredShipLevel: 3, packSize: 50, robotBaseCost: 1000000000, autoSellCost: 5000000000, tier: 'Interstellar' },
  { id: 'plasma-solido', name: 'Plasma Sólido', rarity: 1, baseValue: 15000000, requiredShipLevel: 4, packSize: 50, robotBaseCost: 5000000000, autoSellCost: 25000000000, tier: 'Interstellar' },
  { id: 'nucleo-radiante', name: 'Núcleo Radiante', rarity: 1, baseValue: 50000000, requiredShipLevel: 5, packSize: 50, robotBaseCost: 25000000000, autoSellCost: 125000000000, tier: 'Interstellar' },
  { id: 'fragmento-anomalia', name: 'Fragmento de Anomalia', rarity: 1, baseValue: 150000000, requiredShipLevel: 6, packSize: 50, robotBaseCost: 100000000000, autoSellCost: 500000000000, tier: 'Interstellar' },
  { id: 'essencia-nebular', name: 'Essência Nebular', rarity: 1, baseValue: 500000000, requiredShipLevel: 7, packSize: 50, robotBaseCost: 500000000000, autoSellCost: 2500000000000, tier: 'Interstellar' },
  { id: 'materia-instavel', name: 'Matéria Instável', rarity: 1, baseValue: 1500000000, requiredShipLevel: 8, packSize: 50, robotBaseCost: 2500000000000, autoSellCost: 12500000000000, tier: 'Interstellar' },
  { id: 'singularidade-condensada', name: 'Singularidade Condensada', rarity: 1, baseValue: 5000000000, requiredShipLevel: 9, packSize: 50, robotBaseCost: 10000000000000, autoSellCost: 50000000000000, tier: 'Interstellar' },
];

export const ROBOT_UPGRADES: MiningRobotUpgrade[] = [
  { level: 1, name: 'Base', costMultiplier: 0, speedBonus: 1, efficiencyBonus: 1, productionBonus: 1 },
  { level: 2, name: 'Otimização Hidráulica', costMultiplier: 5, speedBonus: 1.25, efficiencyBonus: 1, productionBonus: 1 },
  { level: 3, name: 'Processador de Fluxo', costMultiplier: 25, speedBonus: 1.25, efficiencyBonus: 1.5, productionBonus: 1 },
  { level: 4, name: 'Broca de Diamante', costMultiplier: 100, speedBonus: 1.25, efficiencyBonus: 1.5, productionBonus: 1.75 },
  { level: 5, name: 'Núcleo de Fusão Local', costMultiplier: 500, speedBonus: 1.25, efficiencyBonus: 1.5, productionBonus: 2.0 },
];

// Removed global AUTO_SELL_UPGRADE_COST as it is now per ore in ORES array

export const TECHNOLOGIES: Technology[] = [
  // ROTA 1: Solar
  {
    id: 'solar-1',
    level: 1,
    name: 'Fundação Orbital',
    description: 'Base tecnológica inicial. Permite construir Naves de nível 1.',
    unlocksShipLevel: 1,
    cost: 0,
    researchTime: 0,
    tier: 'Solar'
  },
  {
    id: 'solar-2',
    level: 2,
    name: 'Propulsão Inicial',
    description: 'Desbloqueia Nave 2.',
    unlocksShipLevel: 2,
    cost: 5000,
    researchTime: 300000, // 5 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-3',
    level: 3,
    name: 'Estabilização Energética',
    description: 'Desbloqueia Nave 3.',
    unlocksShipLevel: 3,
    cost: 25000,
    researchTime: 600000, // 10 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-4',
    level: 4,
    name: 'Navegação de Longo Alcance',
    description: 'Desbloqueia Nave 4.',
    unlocksShipLevel: 4,
    cost: 100000,
    researchTime: 900000, // 15 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-5',
    level: 5,
    name: 'Núcleo de Fusão Avançado',
    description: 'Desbloqueia Nave 5.',
    unlocksShipLevel: 5,
    cost: 500000,
    researchTime: 1800000, // 30 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-6',
    level: 6,
    name: 'Dobra Espacial',
    description: 'Desbloqueia Nave 6.',
    unlocksShipLevel: 6,
    cost: 2500000,
    researchTime: 2700000, // 45 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-7',
    level: 7,
    name: 'Engenharia Interestelar',
    description: 'Desbloqueia Nave 7.',
    unlocksShipLevel: 7,
    cost: 12500000,
    researchTime: 3600000, // 60 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-8',
    level: 8,
    name: 'Matéria Escura Aplicada',
    description: 'Desbloqueia Nave 8.',
    unlocksShipLevel: 8,
    cost: 50000000,
    researchTime: 7200000, // 120 minutes
    tier: 'Solar'
  },
  {
    id: 'solar-9',
    level: 9,
    name: 'Singularidade Controlada',
    description: 'Desbloqueia Nave 9.',
    unlocksShipLevel: 9,
    cost: 250000000,
    researchTime: 14400000, // 240 minutes
    tier: 'Solar'
  },

  // ROTA 2: Interstellar
  {
    id: 'inter-1',
    level: 1,
    name: 'Fundação Interestelar',
    description: 'Base para operações fora do Sistema Solar (equivalente à inicial, mas mais avançada)',
    unlocksShipLevel: 1,
    cost: 0,
    researchTime: 0,
    tier: 'Interstellar'
  },
  {
    id: 'inter-2',
    level: 2,
    name: 'Motores de Dobra Fractal',
    description: 'Manipulação de espaço em múltiplas camadas. Desbloqueia Nave 2',
    unlocksShipLevel: 2,
    cost: 25000000,
    researchTime: 600000, // 10 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-3',
    level: 3,
    name: 'Ancoragem de Realidade',
    description: 'Mantém a nave estável durante distorções espaciais. Desbloqueia Nave 3',
    unlocksShipLevel: 3,
    cost: 35000000,
    researchTime: 1200000, // 20 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-4',
    level: 4,
    name: 'Cartografia de Espaço Profundo',
    description: 'Mapeamento de regiões além da luz visível. Desbloqueia Nave 4',
    unlocksShipLevel: 4,
    cost: 50000000,
    researchTime: 1800000, // 30 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-5',
    level: 5,
    name: 'Reatores de Energia Estelar',
    description: 'Extração direta de energia de estrelas. Desbloqueia Nave 5',
    unlocksShipLevel: 5,
    cost: 75000000,
    researchTime: 2400000, // 40 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-6',
    level: 6,
    name: 'Propuls propulsion de Horizonte de Eventos',
    description: 'Uso de singularidades para deslocamento. Desbloqueia Nave 6',
    unlocksShipLevel: 6,
    cost: 100000000,
    researchTime: 3600000, // 60 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-7',
    level: 7,
    name: 'Sincronização Multiversal',
    description: 'Navegação entre realidades paralelas. Desbloqueia Nave 7',
    unlocksShipLevel: 7,
    cost: 150000000,
    researchTime: 7200000, // 120 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-8',
    level: 8,
    name: 'Condensação de Espaço-Tempo',
    description: 'Compressão extrema de distância e tempo. Desbloqueia Nave 8',
    unlocksShipLevel: 8,
    cost: 250000000,
    researchTime: 14400000, // 240 minutes
    tier: 'Interstellar'
  },
  {
    id: 'inter-9',
    level: 9,
    name: 'Ascensão Pós-Temporal',
    description: 'Tecnologia além do fluxo linear do tempo. Desbloqueia Nave 9',
    unlocksShipLevel: 9,
    cost: 500000000,
    researchTime: 21600000, // 360 minutes
    tier: 'Interstellar'
  },

  // ROTA 3: Void
  {
    id: 'void-1',
    level: 1,
    name: 'Fundação do Vazio',
    description: 'Adaptação inicial ao ambiente de distorção temporal. Desbloqueia Nave 1.',
    unlocksShipLevel: 1,
    cost: 0,
    researchTime: 0,
    tier: 'Void'
  },
  {
    id: 'void-2',
    level: 2,
    name: 'Sincronização de Cronos',
    description: 'Alinhamento com o fluxo temporal do Vazio. Desbloqueia Nave 2.',
    unlocksShipLevel: 2,
    cost: 10000000,
    researchTime: 1200000, // 20 minutes
    tier: 'Void'
  },
  {
    id: 'void-3',
    level: 3,
    name: 'Estabilização de Vácuo',
    description: 'Mantém a integridade estrutural em pressões negativas. Desbloqueia Nave 3.',
    unlocksShipLevel: 3,
    cost: 50000000,
    researchTime: 2400000, // 40 minutes
    tier: 'Void'
  },
  {
    id: 'void-4',
    level: 4,
    name: 'Navegação Entrópica',
    description: 'Uso da desordem como guia estelar. Desbloqueia Nave 4.',
    unlocksShipLevel: 4,
    cost: 250000000,
    researchTime: 3600000, // 60 minutes
    tier: 'Void'
  },
  {
    id: 'void-5',
    level: 5,
    name: 'Convergência Dimensional',
    description: 'Unificação de múltiplas realidades em um ponto. Desbloqueia Nave 5.',
    unlocksShipLevel: 5,
    cost: 1000000000,
    researchTime: 7200000, // 120 minutes
    tier: 'Void'
  },
  {
    id: 'void-6',
    level: 6,
    name: 'Manipulação de Singularidade',
    description: 'Controle sobre o colapso gravitacional. Desbloqueia Nave 6.',
    unlocksShipLevel: 6,
    cost: 5000000000,
    researchTime: 14400000, // 240 minutes
    tier: 'Void'
  },
  {
    id: 'void-7',
    level: 7,
    name: 'Arquitetura Eterna',
    description: 'Construções que desafiam o fim do universo. Desbloqueia Nave 7.',
    unlocksShipLevel: 7,
    cost: 20000000000,
    researchTime: 28800000, // 480 minutes
    tier: 'Void'
  },
  {
    id: 'void-8',
    level: 8,
    name: 'Consciência Universal',
    description: 'Integração total com a malha do cosmos. Desbloqueia Nave 8.',
    unlocksShipLevel: 8,
    cost: 100000000000,
    researchTime: 43200000, // 720 minutes
    tier: 'Void'
  },
  {
    id: 'void-9',
    level: 9,
    name: 'Protocolo Ômega',
    description: 'O segredo final da existência. Desbloqueia Nave 9.',
    unlocksShipLevel: 9,
    cost: 500000000000,
    researchTime: 86400000, // 1440 minutes (24 hours)
    tier: 'Void'
  },
];

export interface ExtractionPoint {
  id: string;
  name: string;
  resourceName: string;
  productionPerCycle: number; // 10 packs
  cycleTime: number; // 5 seconds
  cost: number;
  researchTime: number; // in milliseconds
  valuePerPack: number;
}

export const EXTRACTION_POINTS: ExtractionPoint[] = [
  {
    id: 'ext-1',
    name: 'Cinturão de Centauri Prime',
    resourceName: 'Basalto Vulcânico',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 500000000, // 500 Mi
    researchTime: 600000, // 10 minutes
    valuePerPack: 25000000, // 25 Mi
  },
  {
    id: 'ext-2',
    name: 'Proxima b – Planície Crepuscular',
    resourceName: 'Magnetita',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 2500000000, // 2.5 Bi
    researchTime: 900000, // 15 minutes
    valuePerPack: 100000000, // 100 Mi
  },
  {
    id: 'ext-3',
    name: 'Barnard b – Campos Criogênicos',
    resourceName: 'Criolita',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 10000000000, // 10 Bi
    researchTime: 1200000, // 20 minutes
    valuePerPack: 500000000, // 500 Mi
  },
  {
    id: 'ext-4',
    name: 'Anel Fragmentado de Wolf 359',
    resourceName: 'Titânio',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 50000000000, // 50 Bi
    researchTime: 1500000, // 25 minutes
    valuePerPack: 2500000000, // 2.5 Bi
  },
  {
    id: 'ext-5',
    name: 'Lalande IV – Crosta Ferrífera',
    resourceName: 'Silício',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 200000000000, // 200 Bi
    researchTime: 1800000, // 30 minutes
    valuePerPack: 10000000000, // 10 Bi
  },
  {
    id: 'ext-6',
    name: 'Campo de Resíduos de Sirius B',
    resourceName: 'Platina Bruta',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 400000000, // 400 Mi
    researchTime: 2400000, // 40 minutes
    valuePerPack: 175000, // 175k (Decreased by 99% again for balance)
  },
  {
    id: 'ext-7',
    name: 'Luyten Beta – Zona Binária Instável',
    resourceName: 'Diamante',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 500000000, // 500 Mi
    researchTime: 3000000, // 50 minutes
    valuePerPack: 200000, // 200k (Decreased by 99% again for balance)
  },
  {
    id: 'ext-8',
    name: 'Cratera Magnetizada de Ross',
    resourceName: 'Ródio',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 600000000, // 600 Mi
    researchTime: 3600000, // 60 minutes
    valuePerPack: 225000, // 225k (Decreased by 99% again for balance)
  },
  {
    id: 'ext-9',
    name: 'Disco de Detritos Eridani',
    resourceName: 'Irídio',
    productionPerCycle: 10,
    cycleTime: 5000,
    cost: 750000000, // 750 Mi
    researchTime: 4500000, // 75 minutes
    valuePerPack: 250000, // 250k (Decreased by 99% again for balance)
  },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'accumulative' | 'action' | 'milestone';
  target: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_delivery', name: 'Primeira Entrega', description: 'Complete sua primeira entrega com sucesso.', type: 'accumulative', target: 1, icon: 'CheckCircle2' },
  { id: 'qc_millionaire', name: 'Magnata Espacial', description: 'Acumule um total de 1.000.000 de QC.', type: 'milestone', target: 1000000, icon: 'Coins' },
  { id: 'battle_warrior', name: 'Guerreiro das Estrelas', description: 'Vença 10 batalhas contra piratas.', type: 'accumulative', target: 10, icon: 'Sword' },
  { id: 'robot_owner', name: 'Minerador Experiente', description: 'Compre 5 robôs mineradores.', type: 'accumulative', target: 5, icon: 'Bot' },
  { id: 'route_2_unlocked', name: 'Explorador de Rotas', description: 'Desbloqueie a Rota 2 (Interestelar).', type: 'milestone', target: 1, icon: 'Globe' },
  { id: 'tech_master', name: 'Mestre da Tecnologia', description: 'Desbloqueie 5 tecnologias diferentes.', type: 'accumulative', target: 5, icon: 'Cpu' },
  { id: 'void_unlocked', name: 'Senhor do Vazio', description: 'Desbloqueie a Rota 3 (Vazio).', type: 'milestone', target: 1, icon: 'Skull' },
  { id: 'ship_collector', name: 'Colecionador de Naves', description: 'Possua 5 naves diferentes em sua frota.', type: 'accumulative', target: 5, icon: 'Rocket' },
  { id: 'max_upgrade', name: 'Eficiência Máxima', description: 'Alcance o nível 5 em qualquer melhoria de local.', type: 'milestone', target: 5, icon: 'TrendingUp' },
  { id: 'pirate_slayer', name: 'Dizimador de Piratas', description: 'Vença 50 batalhas contra piratas.', type: 'accumulative', target: 50, icon: 'Zap' },
  { id: 'qc_trillionaire', name: 'Trilionário', description: 'Acumule um total de 1.000.000.000.000 de QC.', type: 'milestone', target: 1000000000000, icon: 'HistoryIcon' },
  { id: 'earth_restorer', name: 'Restaurador da Terra', description: 'Complete 50% da reconstrução do Projeto Terra.', type: 'milestone', target: 50, icon: 'CheckCircle2' },
  { id: 'earth_restorer_100', name: 'Salvador da Humanidade', description: 'Complete 100% da reconstrução do Projeto Terra.', type: 'milestone', target: 100, icon: 'Globe' },
  { id: 'total_deliveries_10k', name: 'Magnata Logístico', description: 'Faça 10.000 entregas em todas as Rotas.', type: 'accumulative', target: 10000, icon: 'TrendingUp' },
  { id: 'all_ships_r1_r2', name: 'Colecionador de Frotas', description: 'Compre todas as naves da Rota 1 e Rota 2 (18 naves).', type: 'milestone', target: 18, icon: 'Rocket' },
  { id: 'total_missions_1k', name: 'Herói das Galáxias', description: 'Faça 1000 Missões da aba "Missões" em ambas as Rotas.', type: 'accumulative', target: 1000, icon: 'Trophy' },
  { id: 'battle_level_55', name: 'Lenda de Combate', description: 'Alcance o Nível de Batalha 55.', type: 'milestone', target: 55, icon: 'Sword' },
];

export const VOID_AIRCRAFT: VoidAircraft[] = [
  {
    id: 'va-1',
    name: 'Seeker-Alpha',
    capacity: 12500,
    efficiency: 35,
    rareChance: 0.05,
    missionTime: 150000, // 2.5 min
    description: 'Uma aeronave leve e ágil, ideal para incursões rápidas em zonas de baixa densidade.',
    image: '/images/ships/seeker-alpha.png',
    video: '/videos/ships/seeker-alpha.webm'
  },
  {
    id: 'va-2',
    name: 'Collector-Beta',
    capacity: 25000,
    efficiency: 45,
    rareChance: 0.10,
    missionTime: 210000, // 3.5 min
    description: 'Projetada para transporte de carga pesada, com sistemas de filtragem de recursos aprimorados.',
    image: '/images/ships/collector-beta.png',
    video: '/videos/ships/collector-beta.webm'
  },
  {
    id: 'va-3',
    name: 'Ghost-Gamma',
    capacity: 50000,
    efficiency: 55,
    rareChance: 0.25,
    missionTime: 270000, // 4.5 min
    description: 'Equipada com sensores de longo alcance e tecnologia de ocultação para encontrar o que outros ignoram.',
    image: '/images/ships/ghost-gamma.png',
    video: '/videos/ships/ghost-gamma.webm'
  }
];

export const VOID_POIS: VoidPOI[] = [
  {
    id: 'poi-1',
    name: 'Colônia de Eridani',
    lore: 'Uma antiga colônia de mineração que sobreviveu ao colapso, mas agora sofre com a falta de energia.',
    video: '/videos/pois/void-eridani.webm',
    need: 'Energia',
    resourceRequired: 1000000,
    passiveGeneration: { resource: 'Energia', amount: 100 }
  },
  {
    id: 'poi-2',
    name: 'Refúgio de Vega',
    lore: 'Sobreviventes isolados em um cinturão de asteroides, buscando desesperadamente por suprimentos básicos.',
    video: '/videos/pois/void-vega.webm',
    need: 'Alimentos',
    resourceRequired: 2500000,
    passiveGeneration: { resource: 'Alimentos', amount: 50 }
  },
  {
    id: 'poi-3',
    name: 'Estação Aurora',
    lore: 'Uma base científica oculta que guarda segredos da antiga Terra, mas precisa de tecnologia para reativar seus sistemas.',
    video: '/videos/pois/void-aurora.webm',
    need: 'Tecnologia',
    resourceRequired: 5000000,
    passiveGeneration: { resource: 'Tecnologia', amount: 20 }
  },
  {
    id: 'poi-4',
    name: 'Posto Avançado de Sirius',
    lore: 'Uma facção neutra que controla rotas comerciais, disposta a ajudar na reconstrução em troca de medicamentos.',
    video: '/videos/pois/void-sirius.webm',
    need: 'Medicamentos',
    resourceRequired: 10000000,
    passiveGeneration: { resource: 'Medicamentos', amount: 10 }
  }
];

export const SHIPS: Ship[] = [
  // ROTA 1: Solar
  {
    level: 1,
    name: 'Atlas Courier',
    route: 'Terra → Terra',
    maxSpeed: 80,
    technology: 'Propulsão Química Avançada',
    description: 'A Atlas Courier é uma pequena nave atmosférica usada para entregas dentro da Terra. Não possui motor de dobra ou tecnologia de salto espacial, sendo projetada apenas para rotas locais rápidas dentro do planeta.',
    range: 5000,
    cost: 0,
    tier: 'Solar',
    color: 'text-cyan-400',
    image: '/images/ships/atlas-courier.png'
  },
  {
    level: 2,
    name: 'Lunar Runner',
    route: 'Terra → Lua',
    maxSpeed: 120,
    technology: 'Motor de Íons Orbital',
    description: 'A Lunar Runner é otimizada para viagens entre a Terra e a Lua. Seu motor de íons permite escapar eficientemente da gravidade da Terra, mas ainda depende de viagens convencionais sem motor de dobra.',
    range: 400000,
    cost: 10000,
    tier: 'Solar',
    color: 'text-blue-400',
    image: '/images/ships/lunar-runner.png'
  },
  {
    level: 3,
    name: 'Solar Swift',
    route: 'Terra → Vênus',
    maxSpeed: 300,
    technology: 'Motor de Fusão',
    description: 'A Solar Swift é a primeira nave da frota equipada com um motor experimental de pré-dobra. Ela acelera a uma alta velocidade sub-luz e então ativa um micro-salto que encurta drasticamente a distância até seu destino.',
    range: 50000000,
    cost: 50000,
    tier: 'Solar',
    color: 'text-yellow-400',
    image: '/images/ships/solar-swift.png'
  },
  {
    level: 4,
    name: 'Red Horizon',
    route: 'Terra → Marte',
    maxSpeed: 500,
    technology: 'Motor de fusão aprimorado + micro-dobra',
    description: 'A Red Horizon utiliza uma versão mais estável da tecnologia de dobra. Após atingir velocidade suficiente, o motor gera uma pequena distorção no espaço-tempo que permite saltos curtos entre órbitas planetárias.',
    range: 100000000,
    cost: 200000,
    tier: 'Solar',
    color: 'text-red-400',
    image: '/images/ships/red-horizon.png'
  },
  {
    level: 5,
    name: 'Helios Freighter',
    route: 'Terra → Mercúrio',
    maxSpeed: 800,
    technology: 'Núcleo de dobra comercial',
    description: 'Projetada para operar perto do Sol, a Helios Freighter possui blindagem térmica avançada e um núcleo de dobra comercial capaz de saltos espaciais mais longos após atingir velocidade sub-luz.',
    range: 200000000,
    cost: 1000000,
    tier: 'Solar',
    color: 'text-orange-400',
    image: '/images/ships/helios-freighter.png'
  },
  {
    level: 6,
    name: 'Jovian Hauler',
    route: 'Terra → Júpiter',
    maxSpeed: 1200,
    technology: 'Motor de dobra orbital',
    description: 'A Jovian Hauler foi projetada para rotas profundas no Sistema Solar. Ao atingir sua velocidade de ativação, ela gera um campo de dobra que encurta a distância entre dois pontos, permitindo viagens rápidas sem exceder a velocidade da luz.',
    range: 700000000,
    cost: 5000000,
    tier: 'Solar',
    color: 'text-purple-400',
    image: '/images/ships/jovian-hauler.png'
  },
  {
    level: 7,
    name: 'Titan Carrier',
    route: 'Terra → Saturno',
    maxSpeed: 1800,
    technology: 'Dobra estável de longo alcance',
    description: 'A Titan Carrier é uma nave de carga pesada capaz de manter um campo de dobra por períodos prolongados. Isso permite atravessar vastas distâncias no Sistema Solar mantendo um tempo de entrega constante.',
    range: 1500000000,
    cost: 25000000,
    tier: 'Solar',
    color: 'text-amber-400',
    image: '/images/ships/titan-carrier.png'
  },
  {
    level: 8,
    name: 'Void Strider',
    route: 'Terra → Urano',
    maxSpeed: 2500,
    technology: 'Núcleo de dobra quântico',
    description: 'A Void Strider utiliza um núcleo de dobra quântico que cria um túnel temporário no espaço-tempo. A nave não viaja mais rápido que a luz — ela encurta o espaço entre a origem e o destino.',
    range: 3000000000,
    cost: 100000000,
    tier: 'Solar',
    color: 'text-indigo-400',
    image: '/images/ships/void-strider.png'
  },
  {
    level: 9,
    name: 'Neptune Vanguard',
    route: 'Terra → Netuno',
    maxSpeed: 3500,
    technology: 'Teletransporte quântico estabilizado',
    description: 'A Neptune Vanguard representa o auge da engenharia humana. Ao atingir sua velocidade de ativação, o núcleo quântico abre um salto espacial instantâneo, teletransportando a nave através de bilhões de quilômetros sem violar as leis da relatividade.',
    range: 5000000000,
    cost: 500000000,
    tier: 'Solar',
    color: 'text-teal-400',
    image: '/images/ships/neptune-vanguard.png'
  },

  // ROTA 2: Interstellar
  {
    level: 1,
    name: 'Pulsar I',
    route: 'Interestelar → Alpha Centauri',
    maxSpeed: 5000,
    technology: 'Reator de Pulso Interestelar',
    description: 'Uma nave experimental de travessia interestelar inicial. Equipada com um reator de pulso instável, ela marca o primeiro passo da humanidade além dos limites do sistema solar. Frágil, mas revolucionária.',
    range: 4.5,
    cost: 0,
    tier: 'Interstellar',
    color: 'text-pink-400',
    image: '/images/ships/pulsar-i.png'
  },
  {
    level: 2,
    name: 'Pulsar II',
    route: 'Interestelar → Proxima Centauri',
    maxSpeed: 8000,
    technology: 'Núcleo de Pulso Estabilizado',
    description: 'Versão refinada do protótipo original. Seu núcleo foi estabilizado, permitindo viagens mais longas com menor risco de colapso energético. Ainda limitada, mas muito mais confiável.',
    range: 5,
    cost: 50000000,
    tier: 'Interstellar',
    color: 'text-rose-600',
    image: '/images/ships/pulsar-ii.png'
  },
  {
    level: 3,
    name: 'Nebula Runner',
    route: 'Interestelar → Barnard\'s Star',
    maxSpeed: 12000,
    technology: 'Captação de Energia Residual de Nebulosas',
    description: 'Projetada para cortar o vazio interestelar com eficiência máxima. Utiliza captação de energia residual de nebulosas e poeira cósmica para alimentar seus sistemas auxiliares, reduzindo o consumo de combustível em longas jornadas.',
    range: 6,
    cost: 250000000,
    tier: 'Interstellar',
    color: 'text-violet-300',
    image: '/images/ships/nebula-runner.png'
  },
  {
    level: 4,
    name: 'Orion VX',
    route: 'Interestelar → Wolf 359',
    maxSpeed: 18000,
    technology: 'Propulsão de Antimatéria Estágio I',
    description: 'O primeiro modelo a utilizar antimatéria como combustível principal. Seus motores geram um campo de contenção que previne a aniquilação descontrolada, permitindo alcançar sistemas estelares distantes em tempo recorde.',
    range: 8,
    cost: 1000000000,
    tier: 'Interstellar',
    color: 'text-green-300',
    image: '/images/ships/orion-vx.png'
  },
  {
    level: 5,
    name: 'Quasar Light',
    route: 'Interestelar → Lalande 21185',
    maxSpeed: 25000,
    technology: 'Vela de Fótons de Alta Densidade',
    description: 'Uma maravilha da engenharia óptica. Utiliza feixes de laser concentrados para impulsionar velas de fótons ultra-densas, atingindo velocidades próximas à da luz sem o custo exponencial dos motores convencionais.',
    range: 8.5,
    cost: 5000000000,
    tier: 'Interstellar',
    color: 'text-yellow-300',
    image: '/images/ships/quasar-light.png'
  },
  {
    level: 6,
    name: 'Zenith Core',
    route: 'Interestelar → Sirius',
    maxSpeed: 40000,
    technology: 'Núcleo de Singularidade Controlada',
    description: 'Utiliza uma micro-singularidade artificial para curvar o espaço-tempo à sua frente. O casco rosado claro é reforçado com ligas de nanotubo de carbono negro, absorvendo a radiação extrema gerada pelo núcleo de singularidade.',
    range: 9,
    cost: 20000000000,
    tier: 'Interstellar',
    color: 'text-pink-200',
    image: '/images/ships/zenith-core.png'
  },
  {
    level: 7,
    name: 'Nova Striker',
    route: 'Interestelar → Luyten 726-8',
    maxSpeed: 65000,
    technology: 'Motores de Fusão de Hélio-3 Extrema',
    description: 'Uma nave de combate e exploração forjada nas sombras da Nova mais próxima. Seus motores operam no limite físico do que os materiais conhecidos suportam, com um vermelho-sangue de casco que reflete a intensidade das câmaras de fusão.',
    range: 9.5,
    cost: 100000000000,
    tier: 'Interstellar',
    color: 'text-red-500',
    image: '/images/ships/nova-striker.png'
  },
  {
    level: 8,
    name: 'Eclipse Prime',
    route: 'Interestelar → Ross 154',
    maxSpeed: 90000,
    technology: 'Dobra Espacial de Quinta Geração',
    description: 'O ápice da tecnologia de dobra conhecida. Seu casco azul-celeste brilhante é um efeito colateral da radiação Cherenkov emitida pelo campo de dobra que envolve permanentemente a nave em velocidade de cruzeiro.',
    range: 10,
    cost: 500000000000,
    tier: 'Interstellar',
    color: 'text-sky-300',
    image: '/images/ships/eclipse-prime.png'
  },
  {
    level: 9,
    name: 'Infinity Drive',
    route: 'Interestelar → Epsilon Eridani',
    maxSpeed: 120000,
    technology: 'Motor de Probabilidade Infinita',
    description: 'A fronteira final da tecnologia interestelar. Utiliza flutuações quânticas para existir em múltiplos pontos do espaço simultaneamente. O verde-abacate vibrante do casco é gerado pelos campos de contenção quântica que envolvem a nave em todas as direções.',
    range: 15,
    cost: 2500000000000,
    tier: 'Interstellar',
    color: 'text-lime-400',
    image: '/images/ships/infinity-drive.png'
  },
  {
    level: 1,
    name: 'Sombra do Vazio',
    route: 'Vazio Profundo → Singularidade',
    maxSpeed: 250000,
    technology: 'Motor de Antimatéria Pura',
    description: 'Uma nave projetada para navegar nas distorções do tempo. Quase invisível aos radares convencionais.',
    range: 50,
    cost: 0, // Initial ship for Route 3
    tier: 'Void',
    color: 'text-purple-500'
  },
  {
    level: 2,
    name: 'Espectro Temporal',
    route: 'Vazio Profundo → Fenda de Eventos',
    maxSpeed: 400000,
    technology: 'Dobra de Cronos',
    description: 'Utiliza partículas de tempo para deslizar entre segundos. Pode chegar ao destino antes mesmo de partir.',
    range: 75,
    cost: 5000000,
    tier: 'Void',
    color: 'text-indigo-500'
  },
  {
    level: 3,
    name: 'Nulificador de Matéria',
    route: 'Vazio Profundo → Abismo Branco',
    maxSpeed: 650000,
    technology: 'Reator de Vácuo Absoluto',
    description: 'Converte o nada em propulsão infinita. Uma maravilha da engenharia da Era Sem Tempo.',
    range: 100,
    cost: 25000000,
    tier: 'Void',
    color: 'text-fuchsia-500'
  },
  {
    level: 4,
    name: 'Arauto do Caos',
    route: 'Vazio Profundo → Horizonte de Cauchy',
    maxSpeed: 1000000,
    technology: 'Motor de Entropia Reversa',
    description: 'Navega nas correntes de probabilidade. Onde o caos reina, ela encontra o caminho mais curto.',
    range: 150,
    cost: 100000000,
    tier: 'Void',
    color: 'text-pink-500'
  },
  {
    level: 5,
    name: 'Soberano do Éter',
    route: 'Vazio Profundo → Ponto Zero',
    maxSpeed: 1800000,
    technology: 'Sincronizador de Realidade',
    description: 'Capaz de existir em todas as dimensões simultaneamente. A distância é apenas uma sugestão.',
    range: 250,
    cost: 500000000,
    tier: 'Void',
    color: 'text-violet-500'
  },
  {
    level: 6,
    name: 'Devorador de Estrelas',
    route: 'Vazio Profundo → Quasar Negro',
    maxSpeed: 3500000,
    technology: 'Núcleo de Singularidade Primordial',
    description: 'Alimentada por buracos negros artificiais. Sua presença distorce a luz ao seu redor.',
    range: 400,
    cost: 2000000000,
    tier: 'Void',
    color: 'text-purple-600'
  },
  {
    level: 7,
    name: 'Sentinela da Eternidade',
    route: 'Vazio Profundo → Muralha de Planck',
    maxSpeed: 7000000,
    technology: 'Escudo de Tempo Estático',
    description: 'Uma fortaleza móvel que ignora as leis da física convencional. O tempo não passa para seus tripulantes.',
    range: 700,
    cost: 10000000000,
    tier: 'Void',
    color: 'text-indigo-600'
  },
  {
    level: 8,
    name: 'Avatar do Vazio',
    route: 'Vazio Profundo → Além do Infinito',
    maxSpeed: 15000000,
    technology: 'Consciência Coletiva de IAs',
    description: 'Não é apenas uma nave, mas uma extensão da própria rede neural que governa o Vazio.',
    range: 1200,
    cost: 50000000000,
    tier: 'Void',
    color: 'text-fuchsia-600'
  },
  {
    level: 9,
    name: 'O Ômega',
    route: 'Vazio Profundo → O Fim de Tudo',
    maxSpeed: 50000000,
    technology: 'Motor de Criação Ex-Nihilo',
    description: 'A última nave. Capaz de reiniciar o universo se necessário. O ápice da evolução tecnológica.',
    range: 5000,
    cost: 250000000000,
    tier: 'Void',
    color: 'text-white'
  }
];

export const ROUTES: Route[] = [
  // ROTA 1: Sistema Solar
  { id: 'terra', name: 'Terra: Distribuição Local', origin: 'Terra', destination: 'Terra', distance: 5000, risk: 0.001, reward: 2500, cargoType: 'Tecnologia', tier: 'Solar', autoTravelCost: 500, requiredShipLevel: 1, unlockCondition: { initial: true } },
  { id: 'lua', name: 'Colônia Lunar', origin: 'Terra', destination: 'Lua', distance: 384400, risk: 0.01, reward: 7500, cargoType: 'Tecnologia', tier: 'Solar', autoTravelCost: 1500, unlockCost: 5000, requiredShipLevel: 2, unlockCondition: { initial: true } },
  { id: 'venus', name: 'Estação Vênus', origin: 'Terra', destination: 'Vênus', distance: 41000000, risk: 0.08, reward: 25000, cargoType: 'Minerais', tier: 'Solar', autoTravelCost: 5000, unlockCost: 25000, requiredShipLevel: 3, unlockCondition: { initial: true } },
  { id: 'marte', name: 'Colônia de Marte', origin: 'Terra', destination: 'Marte', distance: 78000000, risk: 0.05, reward: 100000, cargoType: 'Minerais', tier: 'Solar', autoTravelCost: 20000, unlockCost: 100000, requiredShipLevel: 4, unlockCondition: { initial: true } },
  { id: 'mercurio', name: 'Base Mercúrio', origin: 'Terra', destination: 'Mercúrio', distance: 91000000, risk: 0.12, reward: 400000, cargoType: 'Energia', tier: 'Solar', autoTravelCost: 80000, unlockCost: 500000, requiredShipLevel: 5, unlockCondition: { initial: true } },
  { id: 'jupiter', name: 'Posto Júpiter', origin: 'Terra', destination: 'Júpiter', distance: 628000000, risk: 0.15, reward: 1500000, cargoType: 'Dados', tier: 'Solar', autoTravelCost: 300000, unlockCost: 2500000, requiredShipLevel: 6, unlockCondition: { initial: true } },
  { id: 'saturno', name: 'Anéis de Saturno', origin: 'Terra', destination: 'Saturno', distance: 1200000000, risk: 0.18, reward: 5000000, cargoType: 'Minerais', tier: 'Solar', autoTravelCost: 1000000, unlockCost: 12500000, requiredShipLevel: 7, unlockCondition: { initial: true } },
  { id: 'urano', name: 'Estação Urano', origin: 'Terra', destination: 'Urano', distance: 2600000000, risk: 0.22, reward: 15000000, cargoType: 'Biológico', tier: 'Solar', autoTravelCost: 3000000, unlockCost: 50000000, requiredShipLevel: 8, unlockCondition: { initial: true } },
  { id: 'netuno', name: 'Fronteira Netuno', origin: 'Terra', destination: 'Netuno', distance: 4300000000, risk: 0.25, reward: 50000000, cargoType: 'Artefatos', tier: 'Solar', autoTravelCost: 10000000, unlockCost: 250000000, requiredShipLevel: 9, unlockCondition: { initial: true } },

  // ROTA 2: Interstellar
  { id: 'alpha-centauri', name: 'Alpha Centauri', origin: 'Sistema Solar', destination: 'Alpha Centauri', distance: 4.37, risk: 0.30, reward: 50000000, cargoType: 'Tecnologia', tier: 'Interstellar', autoTravelCost: 50000000, requiredShipLevel: 1, unlockCondition: { route2Unlocked: true } },
  { id: 'proxima-centauri', name: 'Proxima Centauri', origin: 'Sistema Solar', destination: 'Proxima Centauri', distance: 4.24, risk: 0.32, reward: 125000000, cargoType: 'Energia', tier: 'Interstellar', autoTravelCost: 150000000, unlockCost: 100000000, requiredShipLevel: 2, unlockCondition: { route2Unlocked: true } },
  { id: 'barnards-star', name: 'Barnard\'s Star', origin: 'Sistema Solar', destination: 'Barnard\'s Star', distance: 5.96, risk: 0.35, reward: 400000000, cargoType: 'Dados', tier: 'Interstellar', autoTravelCost: 500000000, unlockCost: 500000000, requiredShipLevel: 3, unlockCondition: { route2Unlocked: true } },
  { id: 'wolf-359', name: 'Wolf 359', origin: 'Sistema Solar', destination: 'Wolf 359', distance: 7.78, risk: 0.38, reward: 1250000000, cargoType: 'Tecnologia', tier: 'Interstellar', autoTravelCost: 1500000000, unlockCost: 2500000000, requiredShipLevel: 4, unlockCondition: { route2Unlocked: true } },
  { id: 'lalande-21185', name: 'Lalande 21185', origin: 'Sistema Solar', destination: 'Lalande 21185', distance: 8.29, risk: 0.40, reward: 5000000000, cargoType: 'Biológico', tier: 'Interstellar', autoTravelCost: 6000000000, unlockCost: 12500000000, requiredShipLevel: 5, unlockCondition: { route2Unlocked: true } },
  { id: 'sirius', name: 'Sirius', origin: 'Sistema Solar', destination: 'Sirius', distance: 8.60, risk: 0.45, reward: 20000000000, cargoType: 'Artefatos', tier: 'Interstellar', autoTravelCost: 25000000000, unlockCost: 62500000000, requiredShipLevel: 6, unlockCondition: { route2Unlocked: true } },
  { id: 'luyten-726-8', name: 'Luyten 726-8', origin: 'Sistema Solar', destination: 'Luyten 726-8', distance: 8.73, risk: 0.50, reward: 80000000000, cargoType: 'Energia', tier: 'Interstellar', autoTravelCost: 100000000000, unlockCost: 312500000000, requiredShipLevel: 7, unlockCondition: { route2Unlocked: true } },
  { id: 'ross-154', name: 'Ross 154', origin: 'Sistema Solar', destination: 'Ross 154', distance: 9.68, risk: 0.55, reward: 300000000000, cargoType: 'Dados', tier: 'Interstellar', autoTravelCost: 400000000000, unlockCost: 1562500000000, requiredShipLevel: 8, unlockCondition: { route2Unlocked: true } },
  { id: 'epsilon-eridani', name: 'Epsilon Eridani', origin: 'Sistema Solar', destination: 'Epsilon Eridani', distance: 10.50, risk: 0.60, reward: 1000000000000, cargoType: 'Tecnologia', tier: 'Interstellar', autoTravelCost: 1500000000000, unlockCost: 7812500000000, requiredShipLevel: 9, unlockCondition: { route2Unlocked: true } },
  
  // ROTA 3: Void
  { id: 'void-1', name: 'O Horizonte de Eventos', origin: 'Vazio Profundo', destination: 'Singularidade', distance: 5000, risk: 0.95, reward: 10000000, cargoType: 'Dados', tier: 'Void', autoTravelCost: 5000, requiredShipLevel: 1, unlockCondition: { route3Unlocked: true } },
  { id: 'void-2', name: 'Fenda de Eventos', origin: 'Vazio Profundo', destination: 'Fenda de Eventos', distance: 12000, risk: 0.96, reward: 25000000, cargoType: 'Tecnologia', tier: 'Void', autoTravelCost: 10000, unlockCost: 1000000, requiredShipLevel: 2, unlockCondition: { route3Unlocked: true } },
  { id: 'void-3', name: 'Abismo Branco', origin: 'Vazio Profundo', destination: 'Abismo Branco', distance: 25000, risk: 0.97, reward: 60000000, cargoType: 'Energia', tier: 'Void', autoTravelCost: 25000, unlockCost: 5000000, requiredShipLevel: 3, unlockCondition: { route3Unlocked: true } },
  { id: 'void-4', name: 'Horizonte de Cauchy', origin: 'Vazio Profundo', destination: 'Horizonte de Cauchy', distance: 50000, risk: 0.98, reward: 150000000, cargoType: 'Dados', tier: 'Void', autoTravelCost: 50000, unlockCost: 20000000, requiredShipLevel: 4, unlockCondition: { route3Unlocked: true } },
  { id: 'void-5', name: 'Ponto Zero', origin: 'Vazio Profundo', destination: 'Ponto Zero', distance: 100000, risk: 0.985, reward: 400000000, cargoType: 'Artefatos', tier: 'Void', autoTravelCost: 100000, unlockCost: 100000000, requiredShipLevel: 5, unlockCondition: { route3Unlocked: true } },
  { id: 'void-6', name: 'Quasar Negro', origin: 'Vazio Profundo', destination: 'Quasar Negro', distance: 250000, risk: 0.99, reward: 1000000000, cargoType: 'Minerais', tier: 'Void', autoTravelCost: 250000, unlockCost: 500000000, requiredShipLevel: 6, unlockCondition: { route3Unlocked: true } },
  { id: 'void-7', name: 'Muralha de Planck', origin: 'Vazio Profundo', destination: 'Muralha de Planck', distance: 500000, risk: 0.992, reward: 2500000000, cargoType: 'Tecnologia', tier: 'Void', autoTravelCost: 500000, unlockCost: 2000000000, requiredShipLevel: 7, unlockCondition: { route3Unlocked: true } },
  { id: 'void-8', name: 'Além do Infinito', origin: 'Vazio Profundo', destination: 'Além do Infinito', distance: 1000000, risk: 0.995, reward: 7500000000, cargoType: 'Biológico', tier: 'Void', autoTravelCost: 1000000, unlockCost: 10000000000, requiredShipLevel: 8, unlockCondition: { route3Unlocked: true } },
  { id: 'void-9', name: 'O Fim de Tudo', origin: 'Vazio Profundo', destination: 'O Fim de Tudo', distance: 5000000, risk: 0.999, reward: 25000000000, cargoType: 'Dados', tier: 'Void', autoTravelCost: 5000000, unlockCost: 50000000000, requiredShipLevel: 9, unlockCondition: { route3Unlocked: true } },
];

export const UPGRADES: Upgrade[] = [
  {
    id: 'engine',
    name: 'Motor',
    category: 'Motor',
    tiers: [
      { level: 1, name: 'Motor de íons', cost: 5000, bonus: '+25% Velocidade', value: 0.25 },
      { level: 2, name: 'Motor de fusão', cost: 25000, bonus: '+50% Velocidade', value: 0.50 },
      { level: 3, name: 'Motor de antimatéria', cost: 100000, bonus: '+75% Velocidade', value: 0.75 },
      { level: 4, name: 'Motor quântico', cost: 500000, bonus: '+100% Velocidade', value: 1.00 },
      { level: 5, name: 'Motor Dobra espacial', cost: 2500000, bonus: 'Instantâneo', value: 999 },
    ]
  },
  {
    id: 'ai',
    name: 'Melhoria iA',
    category: 'IA',
    tiers: [
      { level: 1, name: 'Nível 1', cost: 5000, bonus: '75% Sucesso', value: 0.75 },
      { level: 2, name: 'Nível 2', cost: 25000, bonus: '80% Sucesso', value: 0.80 },
      { level: 3, name: 'Nível 3', cost: 100000, bonus: '85% Sucesso', value: 0.85 },
      { level: 4, name: 'Nível 4', cost: 500000, bonus: '90% Sucesso', value: 0.90 },
      { level: 5, name: 'Nível 5', cost: 2500000, bonus: '100% Sucesso', value: 1.00 },
      { level: 6, name: 'Nível 6 MAX', cost: 12500000, bonus: '100% Sucesso + 50% Perfeita', value: 1.50 },
    ]
  },
  {
    id: 'value',
    name: 'Valor de Mercadoria',
    category: 'Valor',
    tiers: [
      { level: 1, name: 'Carga Rara', cost: 10000, bonus: '+50% Lucro', value: 0.5 },
      { level: 2, name: 'Carga Exótica', cost: 100000, bonus: '+100% Lucro', value: 1.0 },
      { level: 3, name: 'Carga Interplanetária', cost: 1000000, bonus: '+150% Lucro', value: 1.5 },
      { level: 4, name: 'Carga Intergalática', cost: 10000000, bonus: '+300% Lucro', value: 3.0 },
      { level: 5, name: 'Carga Alienígena', cost: 100000000, bonus: '+500% Lucro', value: 5.0 },
    ]
  },
  {
    id: 'rare',
    name: 'Entrega Missão Especial',
    category: 'Raro',
    tiers: [
      { level: 1, name: 'Missão Secreta', cost: 20000, bonus: '10% Chance (10x)', value: 0.10 },
      { level: 2, name: 'Missão Ultra Secreta', cost: 200000, bonus: '15% Chance (10x)', value: 0.15 },
      { level: 3, name: 'Missão Matrix', cost: 2000000, bonus: '20% Chance (10x)', value: 0.20 },
      { level: 4, name: 'Missão X', cost: 20000000, bonus: '25% Chance (10x)', value: 0.25 },
      { level: 5, name: 'Missão Tesla Musk MAX', cost: 200000000, bonus: '35% Chance (10x)', value: 0.35 },
    ]
  }
];
