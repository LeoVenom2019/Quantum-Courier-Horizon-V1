import { Cpu, Factory, Music, School, Shield, Utensils } from 'lucide-react';

export type ColonySectorId = 'happiness' | 'health' | 'economy' | 'security' | 'technology' | 'culture';
export type ColonyCardSlot = 'leadership' | 'infrastructure' | 'culture';
export type BattleCardSlot = 'weapon' | 'armor' | 'core' | 'tactic';
export type ColonyCardAnySlot = ColonyCardSlot | BattleCardSlot;
export type ColonyCardClass = 'political' | 'battle';
export type ColonyCardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BattleCardStat = 'damagePercent' | 'defensePercent' | 'critChance' | 'critDamage' | 'specialCooldownPercent';

export interface ColonyCardEffect {
  sector: ColonySectorId;
  value: number;
}

export interface BattleCardEffect {
  stat: BattleCardStat;
  value: number;
}

export interface ColonyCard {
  id: string;
  cardClass?: ColonyCardClass;
  slot: ColonyCardAnySlot;
  rarity: ColonyCardRarity;
  name: Record<'en' | 'pt', string>;
  role: Record<'en' | 'pt', string>;
  lore: Record<'en' | 'pt', string>;
  effects?: ColonyCardEffect[];
  battleEffects?: BattleCardEffect[];
  unlocksArcadeId?: string;
}

export const POLITICAL_CARD_SLOTS: ColonyCardSlot[] = ['leadership', 'infrastructure', 'culture'];
export const BATTLE_CARD_SLOTS: BattleCardSlot[] = ['weapon', 'armor', 'core', 'tactic'];

export const getCardClass = (card: ColonyCard): ColonyCardClass => card.cardClass || 'political';
export const isPoliticalCard = (card: ColonyCard): card is ColonyCard & { slot: ColonyCardSlot } => getCardClass(card) === 'political';
export const isBattleCard = (card: ColonyCard): card is ColonyCard & { slot: BattleCardSlot } => getCardClass(card) === 'battle';
export const getPoliticalEffects = (card: ColonyCard): ColonyCardEffect[] => card.effects || [];
export const getBattleEffects = (card: ColonyCard): BattleCardEffect[] => card.battleEffects || [];

export const SECTOR_CONFIG: Record<ColonySectorId, {
  label: Record<'en' | 'pt', string>;
  icon: any;
  color: string;
}> = {
  happiness: { label: { en: 'Happiness', pt: 'Felicidade' }, icon: Music, color: 'text-pink-300' },
  health: { label: { en: 'Health', pt: 'Saúde' }, icon: Utensils, color: 'text-emerald-300' },
  economy: { label: { en: 'Economy', pt: 'Economia' }, icon: Factory, color: 'text-amber-300' },
  security: { label: { en: 'Security', pt: 'Segurança' }, icon: Shield, color: 'text-red-300' },
  technology: { label: { en: 'Technology', pt: 'Tecnologia' }, icon: Cpu, color: 'text-cyan-300' },
  culture: { label: { en: 'Culture', pt: 'Cultura' }, icon: School, color: 'text-violet-300' },
};

export const BATTLE_STAT_CONFIG: Record<BattleCardStat, {
  label: Record<'en' | 'pt', string>;
}> = {
  damagePercent: { label: { en: 'Damage', pt: 'Dano' } },
  defensePercent: { label: { en: 'Defense', pt: 'Defesa' } },
  critChance: { label: { en: 'Crit Chance', pt: 'Chance Crítica' } },
  critDamage: { label: { en: 'Crit Damage', pt: 'Dano Crítico' } },
  specialCooldownPercent: { label: { en: 'Special Cooldown', pt: 'Recarga Especial' } },
};

export const DEFAULT_COLONY_SECTORS: Record<ColonySectorId, number> = {
  happiness: 46,
  health: 58,
  economy: 34,
  security: 42,
  technology: 52,
  culture: 38,
};

export const DEFAULT_OWNED_COLONY_CARD_IDS = [
  'mayor-agronomist',
  'orbital-engineer',
  'civic-mediator',
  'arcade-salto-espacial',
];

export const COLONY_CARD_CATALOG: ColonyCard[] = [
  {
    id: 'mayor-agronomist',
    slot: 'leadership',
    rarity: 'common',
    name: { en: 'Agronomist Mayor', pt: 'Prefeita Agrônoma' },
    role: { en: 'Food and public health', pt: 'Alimento e saúde pública' },
    lore: {
      en: 'Turns survival logistics into stable daily life.',
      pt: 'Transforma logística de sobrevivência em rotina estável.',
    },
    effects: [
      { sector: 'health', value: 12 },
      { sector: 'happiness', value: 4 },
      { sector: 'economy', value: -3 },
    ],
  },
  {
    id: 'orbital-engineer',
    slot: 'infrastructure',
    rarity: 'rare',
    name: { en: 'Orbital Engineer', pt: 'Engenheiro Orbital' },
    role: { en: 'Industrial planning', pt: 'Planejamento industrial' },
    lore: {
      en: 'Reads the colony like a machine that still remembers people.',
      pt: 'Lê a colônia como uma máquina que ainda lembra das pessoas.',
    },
    effects: [
      { sector: 'economy', value: 14 },
      { sector: 'technology', value: 8 },
      { sector: 'happiness', value: -5 },
    ],
  },
  {
    id: 'civic-mediator',
    slot: 'leadership',
    rarity: 'epic',
    name: { en: 'Civic Mediator', pt: 'Mediadora Cívica' },
    role: { en: 'Social balance', pt: 'Equilíbrio social' },
    lore: {
      en: 'Keeps tired families, builders, and councils at the same table.',
      pt: 'Mantém famílias, construtores e conselhos na mesma mesa.',
    },
    effects: [
      { sector: 'happiness', value: 10 },
      { sector: 'security', value: 7 },
      { sector: 'culture', value: 6 },
    ],
  },
  {
    id: 'arcade-salto-espacial',
    slot: 'culture',
    rarity: 'legendary',
    name: { en: 'Arcade Charter: Space Jump', pt: 'Carta Fliperama: Salto Espacial' },
    role: { en: 'Unlocks Space Jump', pt: 'Desbloqueia Salto Espacial' },
    lore: {
      en: 'The first public arcade cabinet approved for New Earth morale recovery.',
      pt: 'O primeiro fliperama público aprovado para recuperar o moral da Nova Terra.',
    },
    effects: [
      { sector: 'culture', value: 16 },
      { sector: 'happiness', value: 8 },
    ],
    unlocksArcadeId: 'salto-espacial',
  },
  {
    id: 'arcade-ruptura-estelar',
    slot: 'culture',
    rarity: 'epic',
    name: { en: 'Arcade Charter: Stellar Rupture', pt: 'Carta Fliperama: Ruptura Estelar' },
    role: { en: 'Unlocks Stellar Rupture', pt: 'Desbloqueia Ruptura Estelar' },
    lore: {
      en: 'A combat simulator reframed as civic courage training.',
      pt: 'Um simulador de combate convertido em treinamento de coragem cívica.',
    },
    effects: [
      { sector: 'security', value: 8 },
      { sector: 'culture', value: 8 },
    ],
    unlocksArcadeId: 'ruptura-estelar',
  },
  {
    id: 'arcade-danger-zoom-zones',
    slot: 'culture',
    rarity: 'rare',
    name: { en: 'Arcade Charter: Danger Zoom Zones', pt: 'Carta Fliperama: Danger Zoom Zones' },
    role: { en: 'Unlocks Danger Zoom Zones', pt: 'Desbloqueia Danger Zoom Zones' },
    lore: {
      en: 'A pressure game that teaches pattern recognition under stress.',
      pt: 'Um jogo de pressão que ensina leitura de padrões sob estresse.',
    },
    effects: [
      { sector: 'technology', value: 7 },
      { sector: 'security', value: 5 },
    ],
    unlocksArcadeId: 'danger-zoom-zones',
  },
  {
    id: 'arcade-grid-collapse',
    slot: 'culture',
    rarity: 'rare',
    name: { en: 'Arcade Charter: Grid Collapse', pt: 'Carta Fliperama: Grid Collapse' },
    role: { en: 'Unlocks Grid Collapse', pt: 'Desbloqueia Grid Collapse' },
    lore: {
      en: 'Puzzle discipline dressed as a glowing cabinet.',
      pt: 'Disciplina lógica vestida como um gabinete luminoso.',
    },
    effects: [
      { sector: 'technology', value: 10 },
      { sector: 'culture', value: 3 },
    ],
    unlocksArcadeId: 'grid-collapse',
  },
  {
    id: 'arcade-robot-runner',
    slot: 'culture',
    rarity: 'epic',
    name: { en: 'Arcade Charter: Robot Runner', pt: 'Carta Fliperama: Robot Runner' },
    role: { en: 'Unlocks Robot Runner', pt: 'Desbloqueia Robot Runner' },
    lore: {
      en: 'A cheerful maze that quietly improves robot empathy protocols.',
      pt: 'Um labirinto alegre que melhora protocolos de empatia robótica.',
    },
    effects: [
      { sector: 'happiness', value: 6 },
      { sector: 'technology', value: 6 },
      { sector: 'culture', value: 6 },
    ],
    unlocksArcadeId: 'robot-runner',
  },
  {
    id: 'arcade-neo-catcher',
    slot: 'culture',
    rarity: 'legendary',
    name: { en: 'Arcade Charter: Neo Catcher', pt: 'Carta Fliperama: Neo Catcher' },
    role: { en: 'Unlocks Neo Catcher', pt: 'Desbloqueia Neo Catcher' },
    lore: {
      en: 'A preservation ritual disguised as a game of falling lights.',
      pt: 'Um ritual de preservação disfarçado de jogo de luzes em queda.',
    },
    effects: [
      { sector: 'culture', value: 14 },
      { sector: 'happiness', value: 6 },
      { sector: 'health', value: 4 },
    ],
    unlocksArcadeId: 'neo-catcher',
  },
  {
    id: 'legacy-solar-quartermaster',
    slot: 'infrastructure',
    rarity: 'rare',
    name: { en: 'Solar Quartermaster', pt: 'Intendente Solar' },
    role: { en: 'Chapter 1 legacy logistics', pt: 'Logística legado do Capítulo 1' },
    lore: {
      en: 'The old Solar Routes taught this office how to move hope before it expires.',
      pt: 'As antigas Rotas Solares ensinaram este gabinete a mover esperança antes que ela expire.',
    },
    effects: [
      { sector: 'economy', value: 9 },
      { sector: 'health', value: 4 },
    ],
  },
  {
    id: 'legacy-interstellar-envoy',
    slot: 'leadership',
    rarity: 'epic',
    name: { en: 'Interstellar Envoy', pt: 'Enviada Interestelar' },
    role: { en: 'Chapter 2 diplomatic memory', pt: 'Memória diplomática do Capítulo 2' },
    lore: {
      en: 'Knows which colony will fracture before the first argument becomes public.',
      pt: 'Sabe qual colônia vai rachar antes da primeira discussão virar pública.',
    },
    effects: [
      { sector: 'happiness', value: 9 },
      { sector: 'culture', value: 7 },
      { sector: 'security', value: 3 },
    ],
  },
  {
    id: 'legacy-void-veteran',
    slot: 'leadership',
    rarity: 'legendary',
    name: { en: 'Void Veteran', pt: 'Veterana do Vazio' },
    role: { en: 'Chapter 3 survival command', pt: 'Comando de sobrevivência do Capítulo 3' },
    lore: {
      en: 'After the Void, panic sounds slow.',
      pt: 'Depois do Vazio, o pânico parece lento.',
    },
    effects: [
      { sector: 'security', value: 15 },
      { sector: 'technology', value: 5 },
      { sector: 'happiness', value: -4 },
    ],
  },
  {
    id: 'legacy-perfect-route-planner',
    slot: 'infrastructure',
    rarity: 'epic',
    name: { en: 'Perfect Route Planner', pt: 'Planejadora de Rotas Perfeitas' },
    role: { en: 'Precision logistics', pt: 'Logística de precisão' },
    lore: {
      en: 'Turns impossible schedules into civic confidence.',
      pt: 'Transforma cronogramas impossíveis em confiança civil.',
    },
    effects: [
      { sector: 'economy', value: 10 },
      { sector: 'technology', value: 6 },
    ],
  },
  {
    id: 'legacy-civic-archive',
    slot: 'culture',
    rarity: 'legendary',
    name: { en: 'Civic Archive', pt: 'Arquivo Cívico' },
    role: { en: 'Campaign memory', pt: 'Memória da campanha' },
    lore: {
      en: 'A living archive of every route that made New Earth possible.',
      pt: 'Um arquivo vivo de cada rota que tornou a Nova Terra possível.',
    },
    effects: [
      { sector: 'culture', value: 12 },
      { sector: 'happiness', value: 8 },
      { sector: 'technology', value: 4 },
    ],
  },
];

export const getCardById = (id?: string) => COLONY_CARD_CATALOG.find(card => card.id === id);

export const getOwnedArcadeIdsFromCards = (cardIds: string[]) => {
  const unlocked = new Set<string>();
  cardIds.forEach(id => {
    const card = getCardById(id);
    if (card?.unlocksArcadeId) unlocked.add(card.unlocksArcadeId);
  });
  return unlocked;
};

export const getCardStyle = (rarity: ColonyCardRarity, cardClass: ColonyCardClass = 'political') => {
  if (cardClass === 'battle') {
    switch (rarity) {
      case 'legendary':
        return 'border-red-300/75 bg-gradient-to-br from-red-500/20 via-zinc-950 to-amber-500/10 shadow-[0_0_30px_rgba(248,113,113,0.22)]';
      case 'epic':
        return 'border-rose-300/75 bg-gradient-to-br from-rose-500/18 via-zinc-950 to-orange-500/10 shadow-[0_0_28px_rgba(251,113,133,0.2)]';
      case 'rare':
        return 'border-orange-300/75 bg-gradient-to-br from-orange-500/16 via-zinc-950 to-red-500/10 shadow-[0_0_26px_rgba(251,146,60,0.18)]';
      default:
        return 'border-red-500/60 bg-gradient-to-br from-red-500/10 via-zinc-950 to-white/5 shadow-[0_0_18px_rgba(239,68,68,0.12)]';
    }
  }

  switch (rarity) {
    case 'legendary':
      return 'border-amber-300/70 bg-gradient-to-br from-amber-300/15 via-zinc-950 to-emerald-400/10 shadow-[0_0_28px_rgba(251,191,36,0.18)]';
    case 'epic':
      return 'border-violet-300/70 bg-gradient-to-br from-violet-400/15 via-zinc-950 to-cyan-400/10 shadow-[0_0_28px_rgba(167,139,250,0.18)]';
    case 'rare':
      return 'border-cyan-300/70 bg-gradient-to-br from-cyan-400/15 via-zinc-950 to-blue-500/10 shadow-[0_0_28px_rgba(34,211,238,0.16)]';
    default:
      return 'border-zinc-500/70 bg-gradient-to-br from-zinc-400/10 via-zinc-950 to-white/5 shadow-[0_0_18px_rgba(161,161,170,0.12)]';
  }
};
