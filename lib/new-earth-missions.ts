import { ColonySectorId, MAX_COLONY_CARD_LEVEL } from './colony-cards';

export type NewEarthMissionEvent =
  | { type: 'arcade-score'; gameId: string; score: number; previousRecord: number }
  | { type: 'arcade-action'; gameId: string; actionId: string; amount?: number }
  | { type: 'search-complete'; searchId: 'land' | 'sea' }
  | { type: 'defense-victory' }
  | { type: 'defense-kills'; amount?: number }
  | { type: 'defense-bosses'; amount?: number }
  | { type: 'construction-complete'; colonyId: string; constructionType: NewEarthConstructionType; completedCount?: number }
  | { type: 'card-upgrade'; cardId: string; level: number }
  | { type: 'surface-victory'; siteId?: string; colonyId?: string; battleKind?: 'tank' | 'helicopter' }
  | { type: 'submarine-victory'; siteId?: string; colonyId?: string }
  | { type: 'submarine-treasure'; amount?: number };

export type NewEarthMissionReward = {
  qc?: number;
  supplies?: Partial<Record<'materials' | 'biomass' | 'tech' | 'defense' | 'food' | 'meds', number>>;
  missingCard?: boolean;
  colonyBonus?: {
    colonyId: 'active' | string;
    sector: ColonySectorId;
    value: number;
  };
};

export type NewEarthMission = {
  id: string;
  title: Record<'en' | 'pt', string>;
  description: Record<'en' | 'pt', string>;
  objectiveLabel: Record<'en' | 'pt', string>;
  eventType: NewEarthMissionEvent['type'];
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: NewEarthMissionReward;
  arcadeRecordPercent?: number;
  gameId?: string;
  arcadeActionId?: string;
  searchId?: 'land' | 'sea';
  colonyId?: string;
  constructionType?: NewEarthConstructionType;
  constructionTargetCount?: number;
  cardId?: string;
  cardTargetLevel?: number;
};

export type NewEarthMissionState = {
  missions: NewEarthMission[];
  completedMissionIds: string[];
  claimedMissionIds: string[];
  cycle: number;
  generatedAt: number;
  renewAvailableAt: number | null;
  cycleRewardClaimed: boolean;
};

export const NEW_EARTH_MISSIONS_STORAGE_KEY = 'new_earth_missions';
export const NEW_EARTH_MISSION_RENEW_COOLDOWN_MS = 0;
export const NEW_EARTH_MISSION_QC_REWARD_MULTIPLIER = 5;

const scaleNewEarthMissionQcReward = (amount: number) => Math.round(amount * NEW_EARTH_MISSION_QC_REWARD_MULTIPLIER);

export type NewEarthConstructionType = 'forest' | 'factory' | 'school' | 'culture' | 'defense' | 'restaurant';

export type NewEarthMissionColonyContext = {
  id: string;
  completedConstructions?: Partial<Record<NewEarthConstructionType, number>>;
  allBaseConstructionsComplete?: boolean;
};

export type NewEarthMissionGenerationContext = {
  unlockedArcadeIds?: string[];
  hasMissingCards?: boolean;
  canRunLandSearch?: boolean;
  canRunSeaSearch?: boolean;
  canDefendSearches?: boolean;
  directBattlesUnlocked?: boolean;
  canUseSurfaceBattles?: boolean;
  canUseSubmarines?: boolean;
  colonies?: NewEarthMissionColonyContext[];
  upgradeableCards?: Array<{
    id: string;
    name: Record<'en' | 'pt', string>;
    level: number;
  }>;
};

const makeMission = (mission: NewEarthMission): NewEarthMission => mission;
const NEW_EARTH_MISSION_BOARD_SIZE = 4;

const NEW_EARTH_COLONY_LABELS: Record<string, Record<'en' | 'pt', string>> = {
  'colony-1': { en: 'Genesis', pt: 'Genesis' },
  'colony-2': { en: 'Eden', pt: 'Eden' },
  'colony-3': { en: 'Elysium', pt: 'Elysium' },
  'colony-4': { en: 'Gaia', pt: 'Gaia' },
};

const NEW_EARTH_CONSTRUCTION_LABELS: Record<NewEarthConstructionType, Record<'en' | 'pt', string>> = {
  forest: { en: 'Natural Forest', pt: 'Floresta Natural' },
  factory: { en: 'General Factory', pt: 'Fábrica Geral' },
  school: { en: 'School', pt: 'Escola' },
  culture: { en: 'Cultural Center', pt: 'Centro Cultural' },
  defense: { en: 'Public Defense', pt: 'Defensoria Pública' },
  restaurant: { en: 'Restaurant', pt: 'Restaurante' },
};

const NEW_EARTH_CONSTRUCTION_TYPES: NewEarthConstructionType[] = ['forest', 'factory', 'school', 'culture', 'defense', 'restaurant'];

const getConstructionLevelFromContext = (
  context: NewEarthMissionGenerationContext | undefined,
  mission: Pick<NewEarthMission, 'colonyId' | 'constructionType'>
) => {
  const colony = (context?.colonies || []).find(item => item.id === mission.colonyId);
  if (!colony || !mission.constructionType) return 0;
  return Math.max(0, Math.floor(Number(colony.completedConstructions?.[mission.constructionType]) || 0));
};

const NEW_EARTH_MISSION_CATALOG: NewEarthMission[] = [
  makeMission({
    id: 'arcade-local-challenge',
    title: { en: 'Arcade Calibration', pt: 'Calibragem do Fliperama' },
    description: {
      en: 'Play any arcade and reach at least 25% of its current record.',
      pt: 'Jogue qualquer fliperama e alcance pelo menos 25% do recorde atual.',
    },
    objectiveLabel: { en: 'Arcade score', pt: 'Pontuação de fliperama' },
    eventType: 'arcade-score',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    arcadeRecordPercent: 0.25,
    reward: {
      qc: scaleNewEarthMissionQcReward(25000),
      supplies: { tech: 10, materials: 12 },
    },
  }),
  makeMission({
    id: 'arcade-play-any',
    title: { en: 'Cabinet Warm-Up', pt: 'Aquecimento do Fliperama' },
    description: {
      en: 'Play any unlocked arcade once.',
      pt: 'Jogue qualquer fliperama desbloqueado uma vez.',
    },
    objectiveLabel: { en: 'Arcade run', pt: 'Partida de fliperama' },
    eventType: 'arcade-score',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    arcadeRecordPercent: 0,
    reward: {
      qc: scaleNewEarthMissionQcReward(14000),
      supplies: { materials: 10, tech: 6 },
    },
  }),
  makeMission({
    id: 'robot-runner-score',
    title: { en: 'Robot Runner Patrol', pt: 'Patrulha Robot Runner' },
    description: {
      en: 'Play Robot Runner and register a score.',
      pt: 'Jogue Robot Runner e registre uma pontuação.',
    },
    objectiveLabel: { en: 'Robot Runner', pt: 'Robot Runner' },
    eventType: 'arcade-score',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    arcadeRecordPercent: 0,
    gameId: 'robot-runner',
    reward: {
      qc: scaleNewEarthMissionQcReward(22000),
      supplies: { tech: 12, defense: 8 },
    },
  }),
  makeMission({
    id: 'space-jump-void-portal',
    title: { en: 'Void Portal Jump', pt: 'Salto no Portal Void' },
    description: {
      en: 'Enter a Void Portal in Salto Espacial.',
      pt: 'Entre em um Portal Void em Salto Espacial.',
    },
    objectiveLabel: { en: 'Salto Espacial portal', pt: 'Portal de Salto Espacial' },
    eventType: 'arcade-action',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    gameId: 'salto-espacial',
    arcadeActionId: 'void-portal',
    reward: {
      qc: scaleNewEarthMissionQcReward(26000),
      supplies: { tech: 10, materials: 14 },
    },
  }),
  makeMission({
    id: 'danger-zoom-perfect-bomb',
    title: { en: 'Perfect Disarm', pt: 'Desarme Perfeito' },
    description: {
      en: 'Perfectly disarm a bomb in Danger Zoom Zones.',
      pt: 'Desarme perfeitamente uma bomba em Danger Zoom Zones.',
    },
    objectiveLabel: { en: 'Danger Zoom Zones bomb', pt: 'Bomba de Danger Zoom Zones' },
    eventType: 'arcade-action',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    gameId: 'danger-zoom-zones',
    arcadeActionId: 'perfect-bomb-disarm',
    reward: {
      qc: scaleNewEarthMissionQcReward(24000),
      supplies: { defense: 10, tech: 8 },
    },
  }),
  makeMission({
    id: 'ruptura-estelar-four-bosses',
    title: { en: 'Four Boss Rupture', pt: 'Ruptura dos Quatro Bosses' },
    description: {
      en: 'Destroy 4 bosses in Ruptura Estelar.',
      pt: 'Destrua 4 bosses em Ruptura Estelar.',
    },
    objectiveLabel: { en: 'Ruptura Estelar bosses', pt: 'Bosses de Ruptura Estelar' },
    eventType: 'arcade-action',
    target: 4,
    progress: 0,
    completed: false,
    claimed: false,
    gameId: 'ruptura-estelar',
    arcadeActionId: 'boss-destroyed',
    reward: {
      qc: scaleNewEarthMissionQcReward(52000),
      supplies: { defense: 16, tech: 16, materials: 12 },
    },
  }),
  makeMission({
    id: 'grid-collapse-signature-collapse',
    title: { en: 'Grid Collapse', pt: 'Grid Collapse' },
    description: {
      en: 'Perform a "Grid Collapse" in Grid Collapse.',
      pt: 'Faça um "Grid Collapse" em Grid Collapse.',
    },
    objectiveLabel: { en: 'Grid Collapse', pt: 'Grid Collapse' },
    eventType: 'arcade-action',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    gameId: 'grid-collapse',
    arcadeActionId: 'grid-collapse',
    reward: {
      qc: scaleNewEarthMissionQcReward(42000),
      supplies: { tech: 14, materials: 18 },
    },
  }),
  makeMission({
    id: 'neo-catcher-volcano',
    title: { en: 'Volcano Arrival', pt: 'Chegada ao Volcano' },
    description: {
      en: 'Reach Volcano in Neo Catcher.',
      pt: 'Chegue em Volcano em Neo Catcher.',
    },
    objectiveLabel: { en: 'Neo Catcher Volcano', pt: 'Volcano de Neo Catcher' },
    eventType: 'arcade-action',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    gameId: 'neo-catcher',
    arcadeActionId: 'reach-volcano',
    reward: {
      qc: scaleNewEarthMissionQcReward(36000),
      supplies: { biomass: 14, food: 18, tech: 10 },
    },
  }),
  makeMission({
    id: 'two-land-searches',
    title: { en: 'Ground Sweep', pt: 'Varredura Terrestre' },
    description: {
      en: 'Complete two land searches.',
      pt: 'Conclua duas buscas por terra.',
    },
    objectiveLabel: { en: 'Land searches', pt: 'Buscas por terra' },
    eventType: 'search-complete',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(18000),
      supplies: { materials: 20, food: 12, biomass: 8 },
    },
    searchId: 'land',
  }),
  makeMission({
    id: 'two-sea-searches',
    title: { en: 'Sea Recovery', pt: 'Resgate Marítimo' },
    description: {
      en: 'Complete two sea searches.',
      pt: 'Conclua duas buscas por mar.',
    },
    objectiveLabel: { en: 'Sea searches', pt: 'Buscas por mar' },
    eventType: 'search-complete',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      supplies: { biomass: 18, meds: 14, tech: 8 },
      colonyBonus: { colonyId: 'active', sector: 'happiness', value: 5 },
    },
    searchId: 'sea',
  }),
  makeMission({
    id: 'two-defenses',
    title: { en: 'Shield Response', pt: 'Resposta Defensiva' },
    description: {
      en: 'Win two defenses against attacks discovered during searches.',
      pt: 'Vença duas defesas contra ataques encontrados nas buscas.',
    },
    objectiveLabel: { en: 'Defenses won', pt: 'Defesas vencidas' },
    eventType: 'defense-victory',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(45000),
      missingCard: true,
    },
  }),
  makeMission({
    id: 'defense-40-ships',
    title: { en: 'Sky Cleanup', pt: 'Limpeza dos Céus' },
    description: {
      en: 'Destroy 40 enemy ships in defense battles.',
      pt: 'Destrua 40 naves inimigas em batalhas de defesa.',
    },
    objectiveLabel: { en: 'Enemy ships', pt: 'Naves inimigas' },
    eventType: 'defense-kills',
    target: 40,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(52000),
      supplies: { defense: 18, tech: 14, materials: 16 },
    },
  }),
  makeMission({
    id: 'defense-2-bosses',
    title: { en: 'Command Breaker', pt: 'Quebra-Comando' },
    description: {
      en: 'Defeat two bosses in defense battles.',
      pt: 'Vença dois bosses em batalhas de defesa.',
    },
    objectiveLabel: { en: 'Defense bosses', pt: 'Bosses de defesa' },
    eventType: 'defense-bosses',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(68000),
      missingCard: true,
    },
  }),
  makeMission({
    id: 'direct-battle-2-victories',
    title: { en: 'Direct Battle Line', pt: 'Linha de Batalha Direta' },
    description: {
      en: 'Win two direct battles after the colonies are fully built.',
      pt: 'Vença duas batalhas diretas depois que as colônias estiverem totalmente construídas.',
    },
    objectiveLabel: { en: 'Direct battles won', pt: 'Batalhas diretas vencidas' },
    eventType: 'defense-victory',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(52000),
      missingCard: true,
    },
  }),
  makeMission({
    id: 'direct-battle-40-ships',
    title: { en: 'Battle Route Cleanup', pt: 'Limpeza da Rota de Batalha' },
    description: {
      en: 'Destroy 40 enemy ships in direct battles.',
      pt: 'Destrua 40 naves inimigas em batalhas diretas.',
    },
    objectiveLabel: { en: 'Direct battle ships', pt: 'Naves em batalha direta' },
    eventType: 'defense-kills',
    target: 40,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(62000),
      supplies: { defense: 20, tech: 16, materials: 18 },
    },
  }),
  makeMission({
    id: 'direct-battle-2-bosses',
    title: { en: 'Direct Command Breaker', pt: 'Quebra-Comando Direto' },
    description: {
      en: 'Defeat two bosses in direct battles.',
      pt: 'Vença dois bosses em batalhas diretas.',
    },
    objectiveLabel: { en: 'Direct battle bosses', pt: 'Bosses em batalha direta' },
    eventType: 'defense-bosses',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(76000),
      missingCard: true,
    },
  }),
  makeMission({
    id: 'surface-win-european-ruins',
    title: { en: 'European Breakthrough', pt: 'Ruptura Europeia' },
    description: {
      en: 'Win one ground battle in the European Ruins.',
      pt: 'Vença uma batalha terrestre nas Ruínas Européias.',
    },
    objectiveLabel: { en: 'Ground victory', pt: 'Vitória terrestre' },
    eventType: 'surface-victory',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(42000),
      supplies: { defense: 16, materials: 22, tech: 10 },
    },
  }),
  makeMission({
    id: 'surface-win-elysium-airspace',
    title: { en: 'Elysium Airspace', pt: 'Espaço Aéreo de Elysium' },
    description: {
      en: 'Win two helicopter battles in New Earth surface zones.',
      pt: 'Vença duas batalhas de helicóptero nas zonas de superfície da Nova Terra.',
    },
    objectiveLabel: { en: 'Air victories', pt: 'Vitórias aéreas' },
    eventType: 'surface-victory',
    target: 2,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(46000),
      supplies: { defense: 18, tech: 16, meds: 8 },
    },
  }),
  makeMission({
    id: 'surface-all-fronts',
    title: { en: 'All Surface Fronts', pt: 'Todas as Frentes de Superfície' },
    description: {
      en: 'Win three New Earth surface battles.',
      pt: 'Vença três batalhas de superfície da Nova Terra.',
    },
    objectiveLabel: { en: 'Surface victories', pt: 'Vitórias de superfície' },
    eventType: 'surface-victory',
    target: 3,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(62000),
      missingCard: true,
    },
  }),
  makeMission({
    id: 'submarine-win-abyssal',
    title: { en: 'Abyssal Contact', pt: 'Contato Abissal' },
    description: {
      en: 'Win one submarine battle in a deep maritime zone.',
      pt: 'Vença uma batalha submarina em uma zona marítima profunda.',
    },
    objectiveLabel: { en: 'Submarine victory', pt: 'Vitória submarina' },
    eventType: 'submarine-victory',
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(38000),
      supplies: { tech: 16, defense: 12, materials: 18 },
    },
  }),
  makeMission({
    id: 'submarine-treasure-3',
    title: { en: 'Deep Salvage', pt: 'Resgate das Profundezas' },
    description: {
      en: 'Find three treasures during submarine exploration.',
      pt: 'Encontre três tesouros durante explorações submarinas.',
    },
    objectiveLabel: { en: 'Submarine treasures', pt: 'Tesouros submarinos' },
    eventType: 'submarine-treasure',
    target: 3,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      qc: scaleNewEarthMissionQcReward(26000),
      supplies: { biomass: 10, tech: 14, materials: 16 },
    },
  }),
];

const NEW_EARTH_CONSTRUCTION_MISSIONS: NewEarthMission[] = Object.entries(NEW_EARTH_COLONY_LABELS).flatMap(([colonyId, colonyName]) => (
  NEW_EARTH_CONSTRUCTION_TYPES.flatMap(constructionType => (
    Array.from({ length: 10 }, (_, index) => {
      const targetCount = index + 1;
      const constructionName = NEW_EARTH_CONSTRUCTION_LABELS[constructionType];
      return makeMission({
        id: `build-${colonyId}-${constructionType}-${targetCount}`,
        title: {
          en: targetCount === 1
            ? `Build ${constructionName.en} in ${colonyName.en}`
            : `Upgrade ${constructionName.en} to level ${targetCount} in ${colonyName.en}`,
          pt: targetCount === 1
            ? `Construir ${constructionName.pt} em ${colonyName.pt}`
            : `Evoluir ${constructionName.pt} para nível ${targetCount} em ${colonyName.pt}`,
        },
        description: {
          en: targetCount === 1
            ? `Reach level 1 with ${constructionName.en} in ${colonyName.en}.`
            : `Reach level ${targetCount} with ${constructionName.en} in ${colonyName.en}.`,
          pt: targetCount === 1
            ? `Alcance nível 1 com ${constructionName.pt} em ${colonyName.pt}.`
            : `Alcance nível ${targetCount} com ${constructionName.pt} em ${colonyName.pt}.`,
        },
        objectiveLabel: { en: 'Construction', pt: 'Construção' },
        eventType: 'construction-complete',
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        reward: {
          qc: scaleNewEarthMissionQcReward(18000 + targetCount * 2500),
          supplies: { materials: 8 + targetCount, tech: 4 + Math.ceil(targetCount / 2) },
        },
        colonyId,
        constructionType,
        constructionTargetCount: targetCount,
      });
    })
  ))
));

const NEW_EARTH_FULL_MISSION_CATALOG: NewEarthMission[] = [
  ...NEW_EARTH_MISSION_CATALOG,
  ...NEW_EARTH_CONSTRUCTION_MISSIONS,
];

const createCardUpgradeMissions = (context: NewEarthMissionGenerationContext = {}): NewEarthMission[] => (
  (context.upgradeableCards || [])
    .filter(card => Math.max(1, Math.floor(Number(card.level) || 1)) < MAX_COLONY_CARD_LEVEL)
    .map(card => {
    const currentLevel = Math.max(1, Math.floor(Number(card.level) || 1));
    const targetLevel = currentLevel + 1;
    return makeMission({
      id: `upgrade-card-${card.id}`,
      title: {
        en: `Improve ${card.name.en}`,
        pt: `Melhorar ${card.name.pt}`,
      },
      description: {
        en: `Upgrade ${card.name.en} to level ${targetLevel}.`,
        pt: `Melhore ${card.name.pt} para o nível ${targetLevel}.`,
      },
      objectiveLabel: { en: 'Card upgrade', pt: 'Melhoria de carta' },
      eventType: 'card-upgrade',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      reward: {
        qc: scaleNewEarthMissionQcReward(22000 + currentLevel * 2500),
        supplies: { tech: 8 + currentLevel, materials: 10 + currentLevel },
      },
      cardId: card.id,
      cardTargetLevel: targetLevel,
    });
    })
);

const getMissionCatalog = (context?: NewEarthMissionGenerationContext) => [
  ...NEW_EARTH_FULL_MISSION_CATALOG,
  ...createCardUpgradeMissions(context),
];

const isMissionEligible = (mission: NewEarthMission, context: NewEarthMissionGenerationContext = {}) => {
  if (mission.reward.missingCard && context.hasMissingCards !== true) return false;

  if (mission.eventType === 'arcade-score') {
    const unlocked = new Set(context.unlockedArcadeIds || []);
    if (mission.gameId) return unlocked.has(mission.gameId);
    return unlocked.size > 0;
  }
  if (mission.eventType === 'arcade-action') {
    if (!mission.gameId || !mission.arcadeActionId) return false;
    return new Set(context.unlockedArcadeIds || []).has(mission.gameId);
  }
  if (mission.eventType === 'search-complete') {
    if (context.directBattlesUnlocked === true) return false;
    return mission.searchId === 'sea' ? context.canRunSeaSearch === true : context.canRunLandSearch === true;
  }
  if (mission.id.startsWith('direct-battle-')) return context.directBattlesUnlocked === true;
  if (mission.eventType === 'defense-victory') return context.canDefendSearches === true;
  if (mission.eventType === 'defense-kills' || mission.eventType === 'defense-bosses') return context.canDefendSearches === true;
  if (mission.eventType === 'construction-complete') {
    if (!mission.colonyId || !mission.constructionType || !mission.constructionTargetCount) return false;
    const completedLevel = getConstructionLevelFromContext(context, mission);
    if (completedLevel >= mission.constructionTargetCount) return false;
    return completedLevel === mission.constructionTargetCount - 1;
  }
  if (mission.eventType === 'card-upgrade') {
    if (!mission.cardId || !mission.cardTargetLevel) return false;
    if (!Array.isArray(context.upgradeableCards)) return true;
    const targetLevel = mission.cardTargetLevel;
    return (context.upgradeableCards || []).some(card => (
      card.id === mission.cardId
      && Math.max(1, Math.floor(Number(card.level) || 1)) < MAX_COLONY_CARD_LEVEL
      && Math.max(1, Math.floor(Number(card.level) || 1)) < targetLevel
    ));
  }
  if (mission.eventType === 'surface-victory') return Boolean(context.canUseSurfaceBattles);
  if (mission.eventType === 'submarine-victory' || mission.eventType === 'submarine-treasure') return Boolean(context.canUseSubmarines);
  return true;
};

const cloneMission = (mission: NewEarthMission): NewEarthMission => ({
  ...mission,
  progress: 0,
  completed: false,
  claimed: false,
  reward: {
    ...mission.reward,
    supplies: mission.reward.supplies ? { ...mission.reward.supplies } : undefined,
    colonyBonus: mission.reward.colonyBonus ? { ...mission.reward.colonyBonus } : undefined,
  },
});

const isSavedMissionDefinitionUsable = (mission: any): mission is NewEarthMission => (
  Boolean(
    mission &&
    typeof mission.id === 'string' &&
    mission.title &&
    mission.description &&
    mission.objectiveLabel &&
    typeof mission.eventType === 'string' &&
    Number.isFinite(Number(mission.target)) &&
    mission.reward &&
    typeof mission.reward === 'object'
  )
);

const createEligibleMissions = (
  context?: NewEarthMissionGenerationContext,
  offset = 0,
  count = NEW_EARTH_MISSION_BOARD_SIZE,
  excludeIds: string[] = []
): NewEarthMission[] => {
  const excluded = new Set(excludeIds);
  const eligible = getMissionCatalog(context).filter(mission => (
    !excluded.has(mission.id) && isMissionEligible(mission, context)
  ));
  const shuffled = [...eligible];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const selected = shuffled.slice(0, count);

  return selected.map(cloneMission);
};

export const createDefaultNewEarthMissionState = (context?: NewEarthMissionGenerationContext): NewEarthMissionState => {
  const missions = createEligibleMissions(context);
  return {
    missions,
    completedMissionIds: [],
    claimedMissionIds: [],
    cycle: 0,
    generatedAt: Date.now(),
    renewAvailableAt: null,
    cycleRewardClaimed: false,
  };
};

export const normalizeNewEarthMissionState = (saved: any, context?: NewEarthMissionGenerationContext): NewEarthMissionState => {
  const defaults = createDefaultNewEarthMissionState(context);
  const savedMissions = Array.isArray(saved?.missions) ? saved.missions : [];
  const savedById = new Map(savedMissions.map((mission: any) => [mission?.id, mission]));

  const catalog = getMissionCatalog(context);
  const catalogById = new Map(catalog.map(mission => [mission.id, mission]));
  const sourceMissions: NewEarthMission[] = savedMissions.length > 0
    ? savedMissions
      .map((savedMission: any) => (
        isSavedMissionDefinitionUsable(savedMission)
          ? savedMission
          : catalogById.get(savedMission?.id)
      ))
      .filter((mission: NewEarthMission | undefined): mission is NewEarthMission => Boolean(mission))
    : defaults.missions;

  const missions = sourceMissions.filter(mission => {
    const savedMission: any = savedById.get(mission.id);
    if (savedMission) return true;
    return isMissionEligible(mission, context);
  }).map(defaultMission => {
    const savedMission: any = savedById.get(defaultMission.id);
    const progress = Math.max(0, Math.floor(Number(savedMission?.progress) || 0));
    const claimed = Boolean(savedMission?.claimed);
    const completed = Boolean(savedMission?.completed) || progress >= defaultMission.target;

    return {
      ...defaultMission,
      progress: completed ? defaultMission.target : Math.min(defaultMission.target, progress),
      completed,
      claimed,
    };
  });

  return {
    missions,
    completedMissionIds: missions.filter(mission => mission.completed).map(mission => mission.id),
    claimedMissionIds: missions.filter(mission => mission.claimed).map(mission => mission.id),
    cycle: Math.max(0, Math.floor(Number(saved?.cycle) || 0)),
    generatedAt: Number(saved?.generatedAt) || Date.now(),
    renewAvailableAt: saved?.renewAvailableAt ? Number(saved.renewAvailableAt) : null,
    cycleRewardClaimed: Boolean(saved?.cycleRewardClaimed),
  };
};

export const refreshNewEarthMissionBoard = (
  state: NewEarthMissionState,
  context: NewEarthMissionGenerationContext,
  now = Date.now(),
  force = false
): NewEarthMissionState => {
  const normalized = normalizeNewEarthMissionState(state, context);
  const activeMissions = normalized.missions.filter(mission => !mission.claimed);
  const boardIsFull = normalized.missions.length >= NEW_EARTH_MISSION_BOARD_SIZE;
  const allBoardMissionsClaimed = boardIsFull && normalized.missions.every(mission => mission.claimed);

  if (!force && boardIsFull && !allBoardMissionsClaimed) {
    return normalized;
  }

  if (!force && activeMissions.length === 0 && normalized.missions.length === 0) {
    const missions = createEligibleMissions(context, normalized.cycle);
    if (missions.length === 0) return normalized;
    return {
      ...normalized,
      missions,
      completedMissionIds: [],
      claimedMissionIds: [],
      generatedAt: now,
      renewAvailableAt: null,
      cycleRewardClaimed: false,
    };
  }

  const missingSlots = Math.max(0, NEW_EARTH_MISSION_BOARD_SIZE - normalized.missions.length);
  if (!force && missingSlots > 0) {
    const excludedIds = normalized.missions.map(mission => mission.id);
    const replacements = createEligibleMissions(
      context,
      normalized.cycle + normalized.missions.length + 1,
      missingSlots,
      excludedIds
    );
    if (replacements.length === 0) {
      return {
        ...normalized,
        completedMissionIds: normalized.missions.filter(mission => mission.completed).map(mission => mission.id),
        claimedMissionIds: normalized.missions.filter(mission => mission.claimed).map(mission => mission.id),
        renewAvailableAt: null,
      };
    }
    const missions = [...normalized.missions, ...replacements];
    return {
      missions,
      completedMissionIds: missions.filter(mission => mission.completed).map(mission => mission.id),
      claimedMissionIds: missions.filter(mission => mission.claimed).map(mission => mission.id),
      cycle: normalized.cycle + 1,
      generatedAt: now,
      renewAvailableAt: null,
      cycleRewardClaimed: false,
    };
  }

  const nextCycle = normalized.cycle + 1;
  const missions = createEligibleMissions(context, nextCycle);
  return {
    missions,
    completedMissionIds: [],
    claimedMissionIds: [],
    cycle: nextCycle,
    generatedAt: now,
    renewAvailableAt: null,
    cycleRewardClaimed: false,
  };
};

export const recordNewEarthMissionEvent = (
  state: NewEarthMissionState,
  event: NewEarthMissionEvent
): { state: NewEarthMissionState; changed: boolean; completedMissionIds: string[] } => {
  let changed = false;
  const completedMissionIds: string[] = [];

  const missions = state.missions.map(mission => {
    if (mission.claimed || mission.completed || mission.eventType !== event.type) return mission;

    if (event.type === 'search-complete') {
      const matchesSearch = mission.searchId ? mission.searchId === event.searchId : true;
      if (!matchesSearch) return mission;
    }

    if (event.type === 'construction-complete') {
      if (mission.colonyId && mission.colonyId !== event.colonyId) return mission;
      if (mission.constructionType && mission.constructionType !== event.constructionType) return mission;
      if (mission.constructionTargetCount && Number(event.completedCount || 0) < mission.constructionTargetCount) return mission;
    }

    if (event.type === 'card-upgrade') {
      if (mission.cardId && mission.cardId !== event.cardId) return mission;
      if (mission.cardTargetLevel && Number(event.level || 0) < mission.cardTargetLevel) return mission;
    }

    if (event.type === 'arcade-score') {
      if (mission.gameId && mission.gameId !== event.gameId) return mission;
      const recordBase = Math.max(0, Number(event.previousRecord) || 0);
      const requiredPercent = mission.arcadeRecordPercent ?? 0.25;
      const threshold = requiredPercent <= 0 ? 0 : Math.max(1, Math.ceil(recordBase * requiredPercent));
      if (Number(event.score) < threshold) return mission;
    }

    if (event.type === 'arcade-action') {
      if (mission.gameId !== event.gameId || mission.arcadeActionId !== event.actionId) return mission;
    }

    if (event.type === 'surface-victory') {
      if (mission.id === 'surface-win-european-ruins' && event.siteId !== 'ruinas-europeias') return mission;
      if (mission.id === 'surface-win-elysium-airspace' && event.battleKind !== 'helicopter') return mission;
    }

    const increment = event.type === 'submarine-treasure' || event.type === 'defense-kills' || event.type === 'defense-bosses' || event.type === 'arcade-action'
      ? Math.max(1, Math.floor(Number(event.amount) || 1))
      : 1;

    const progress = Math.min(mission.target, mission.progress + increment);
    const completed = progress >= mission.target;
    changed = true;
    if (completed) completedMissionIds.push(mission.id);
    return { ...mission, progress, completed };
  });

  if (!changed) return { state, changed: false, completedMissionIds: [] };

  return {
    changed: true,
    completedMissionIds,
    state: {
      missions,
      completedMissionIds: missions.filter(mission => mission.completed).map(mission => mission.id),
      claimedMissionIds: missions.filter(mission => mission.claimed).map(mission => mission.id),
      cycle: state.cycle || 0,
      generatedAt: state.generatedAt || Date.now(),
      renewAvailableAt: state.renewAvailableAt || null,
      cycleRewardClaimed: Boolean(state.cycleRewardClaimed),
    },
  };
};

export const markNewEarthMissionClaimed = (
  state: NewEarthMissionState,
  missionId: string
): NewEarthMissionState => {
  const missions = state.missions.map(mission => (
    mission.id === missionId ? { ...mission, claimed: true } : mission
  ));

  return {
    missions,
    completedMissionIds: missions.filter(mission => mission.completed).map(mission => mission.id),
    claimedMissionIds: missions.filter(mission => mission.claimed).map(mission => mission.id),
    cycle: state.cycle || 0,
    generatedAt: state.generatedAt || Date.now(),
    renewAvailableAt: state.renewAvailableAt || null,
    cycleRewardClaimed: Boolean(state.cycleRewardClaimed),
  };
};

export const markNewEarthMissionCycleRewardClaimed = (state: NewEarthMissionState): NewEarthMissionState => ({
  ...state,
  cycleRewardClaimed: true,
});
