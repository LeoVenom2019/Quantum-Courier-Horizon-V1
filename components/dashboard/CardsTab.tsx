'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BadgeCheck,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Sparkles,
  X,
} from 'lucide-react';
import { GameStorage } from '@/lib/game-storage';
import {
  BATTLE_CARD_SLOTS,
  BATTLE_STAT_CONFIG,
  COLONY_CARD_CATALOG,
  DEFAULT_COLONY_SECTORS,
  DEFAULT_OWNED_COLONY_CARD_IDS,
  POLITICAL_CARD_SLOTS,
  SECTOR_CONFIG,
  BattleCardSlot,
  ColonyCard,
  ColonyCardAnySlot,
  ColonyCardClass,
  ColonyCardSlot,
  ColonySectorId,
  getCardById,
  getBattleEffects,
  getCardClass,
  getCardStyle,
  getPoliticalEffects,
  isBattleCard,
  isPoliticalCard,
} from '@/lib/colony-cards';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import { Colony } from '../ColonySystem';
import { useDashboard } from './DashboardProvider';

const CARD_SLOTS = POLITICAL_CARD_SLOTS;

const SLOT_LABEL: Record<ColonyCardAnySlot, Record<'en' | 'pt', string>> = {
  leadership: { en: 'Leadership', pt: 'Liderança' },
  infrastructure: { en: 'Infrastructure', pt: 'Infraestrutura' },
  culture: { en: 'Culture', pt: 'Cultura' },
  weapon: { en: 'Weapon', pt: 'Arma' },
  armor: { en: 'Armor', pt: 'Blindagem' },
  core: { en: 'Core', pt: 'Núcleo' },
  tactic: { en: 'Tactic', pt: 'Tática' },
};

const RARITY_LABEL: Record<string, Record<'en' | 'pt', string>> = {
  common: { en: 'Common', pt: 'Comum' },
  rare: { en: 'Rare', pt: 'Rara' },
  epic: { en: 'Epic', pt: 'Épica' },
  legendary: { en: 'Legendary', pt: 'Lendária' },
};

const RARITY_SORT = { legendary: 0, epic: 1, rare: 2, common: 3 };

const tl = (language: 'en' | 'pt', en: string, pt: string) => language === 'pt' ? pt : en;
const CLASS_LABEL: Record<ColonyCardClass, Record<'en' | 'pt', string>> = {
  political: { en: 'Political', pt: 'Política' },
  battle: { en: 'Battle', pt: 'Batalha' },
};

const getColonyEffectiveSectors = (colony: Colony | null) => {
  const next = { ...DEFAULT_COLONY_SECTORS, ...(colony?.sectors || {}) };
  if (!colony) return next;

  Object.values(colony.equippedCards || {}).forEach(cardId => {
    const card = getCardById(cardId);
    if (!card || !isPoliticalCard(card)) return;
    getPoliticalEffects(card).forEach(effect => {
      next[effect.sector] = Math.min(100, Math.max(0, next[effect.sector] + effect.value));
    });
  });

  return next;
};

const CardEffectPills = ({ card, language }: { card: ColonyCard; language: 'en' | 'pt' }) => {
  const cardClass = getCardClass(card);
  const politicalEffects = getPoliticalEffects(card);
  const battleEffects = getBattleEffects(card);
  const effects = cardClass === 'battle' ? battleEffects : politicalEffects;

  return (
    <div className="flex flex-wrap gap-1.5">
      {effects.map(effect => {
        const key = 'sector' in effect ? effect.sector : effect.stat;
        const value = effect.value;
        const label = 'sector' in effect
          ? SECTOR_CONFIG[effect.sector].label[language]
          : BATTLE_STAT_CONFIG[effect.stat].label[language];

        return (
          <span
            key={`${card.id}-${key}`}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
              value >= 0
                ? cardClass === 'battle'
                  ? 'border-red-400/30 bg-red-400/10 text-red-200'
                  : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-red-400/30 bg-red-400/10 text-red-300'
            }`}
          >
            {value > 0 ? '+' : ''}{value}{cardClass === 'battle' ? '%' : ''} {label}
          </span>
        );
      })}
    </div>
  );
};

const CardTile = ({
  card,
  language,
  owned,
  claimable,
  equippedLabel,
  lockedReason,
  actionLabel,
  onClick,
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  owned: boolean;
  claimable?: boolean;
  equippedLabel?: string;
  lockedReason?: string;
  actionLabel?: string;
  onClick?: () => void;
}) => {
  const cardClass = getCardClass(card);
  const content = (
    <>
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover/card:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.16),transparent_38%)]" />
      {claimable && !owned && (
        <div className="absolute right-3 top-3 z-20 rounded-full border border-emerald-300/50 bg-emerald-300 px-2 py-1 font-orbitron text-[8px] font-black uppercase tracking-widest text-black shadow-[0_0_14px_rgba(52,211,153,0.35)]">
          {language === 'pt' ? 'Resgatar' : 'Claim'}
        </div>
      )}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-zinc-300">
              {RARITY_LABEL[card.rarity][language]}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${
              cardClass === 'battle'
                ? 'border-red-300/30 bg-red-300/10 text-red-200'
                : 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'
            }`}>
              {CLASS_LABEL[cardClass][language]}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
              {SLOT_LABEL[card.slot][language]}
            </span>
          </div>
          <h4 className="text-sm font-orbitron font-black uppercase leading-tight text-white">{card.name[language]}</h4>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">{card.lore[language]}</p>
        </div>
        {owned ? (
          equippedLabel ? <BadgeCheck size={18} className="shrink-0 text-emerald-300" /> : <Sparkles size={18} className="shrink-0 text-white/40" />
        ) : (
          <LockKeyhole size={18} className="shrink-0 text-zinc-600" />
        )}
      </div>
      <div className="relative z-10 mt-3 space-y-2">
        <CardEffectPills card={card} language={language} />
        {equippedLabel && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">{equippedLabel}</p>
        )}
        {lockedReason && (
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{lockedReason}</p>
        )}
        {actionLabel && (
          <p className="text-[10px] font-orbitron font-black uppercase tracking-[0.22em] text-white/70">{actionLabel}</p>
        )}
      </div>
    </>
  );

  const className = `group/card relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all ${
    owned ? getCardStyle(card.rarity, cardClass) : cardClass === 'battle' ? 'border-red-900/50 bg-red-950/10 opacity-85' : 'border-zinc-800 bg-black/35 opacity-80'
  } ${onClick ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`;

  return onClick ? <button onClick={onClick} className={className}>{content}</button> : <div className={className}>{content}</div>;
};

const getCardEquippedRecord = (
  colonies: Colony[],
  cardId: string
): { colony: Colony; slot: ColonyCardSlot; card: ColonyCard } | undefined => (
  colonies.flatMap((colony: Colony) => (
    CARD_SLOTS
      .map(slot => {
        const card = getCardById(colony.equippedCards?.[slot]);
        return card ? { colony, slot, card } : null;
      })
      .filter(Boolean) as { colony: Colony; slot: ColonyCardSlot; card: ColonyCard }[]
  )).find(record => record.card.id === cardId)
);

const notifyColonyCardsChanged = (cardIds: string[]) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('qch:colony-cards-updated', { detail: cardIds }));
};

type CardClassFilter = 'all' | ColonyCardClass;
type BattleLoadout = Partial<Record<BattleCardSlot, string>>;

const CardsTab = memo(function CardsTab() {
  const {
    language,
    colonies,
    setColonies,
    missions,
    playSfx,
  } = useDashboard();
  const lang = language as 'en' | 'pt';

  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);
  const [selectedCard, setSelectedCard] = useState<{ card: ColonyCard; action: 'equip' | 'claim' } | null>(null);
  const [equipChoiceCard, setEquipChoiceCard] = useState<ColonyCard | null>(null);
  const [battleLoadout, setBattleLoadout] = useState<BattleLoadout>({});
  const [cardEvent, setCardEvent] = useState<ColonyCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<'owned' | 'codex' | 'equipped'>('owned');
  const [classFilter, setClassFilter] = useState<CardClassFilter>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      if (Array.isArray(saved) && saved.length > 0) {
        setOwnedCardIds(saved.filter(id => COLONY_CARD_CATALOG.some(card => card.id === id)));
      }
      setIsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('battle_cards_loadout').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        const next: BattleLoadout = {};
        BATTLE_CARD_SLOTS.forEach(slot => {
          const card = getCardById(saved[slot]);
          if (card && isBattleCard(card)) next[slot] = card.id;
        });
        setBattleLoadout(next);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    GameStorage.save(ownedCardIds, 'colony_cards_data');
  }, [ownedCardIds, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    GameStorage.save(battleLoadout, 'battle_cards_loadout');
  }, [battleLoadout, isLoaded]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    setPage(0);
  }, [activeSection, classFilter]);

  const bestEffectiveSectors = useMemo(() => {
    const sectorIds = Object.keys(SECTOR_CONFIG) as ColonySectorId[];
    return colonies.reduce((best, colony: Colony) => {
      const current = getColonyEffectiveSectors(colony);
      sectorIds.forEach(sectorId => {
        best[sectorId] = Math.max(best[sectorId], current[sectorId]);
      });
      return best;
    }, { ...DEFAULT_COLONY_SECTORS });
  }, [colonies]);

  const ownedCards = useMemo(() => (
    ownedCardIds
      .map(id => getCardById(id))
      .filter(Boolean)
      .sort((a, b) => RARITY_SORT[a!.rarity] - RARITY_SORT[b!.rarity]) as ColonyCard[]
  ), [ownedCardIds]);

  const politicalEquippedRecords = useMemo(() => {
    return colonies.flatMap((colony: Colony) => (
      CARD_SLOTS
        .map(slot => {
          const card = getCardById(colony.equippedCards?.[slot]);
          return card && isPoliticalCard(card) ? { colony, slot, card } : null;
        })
        .filter(Boolean) as { colony: Colony; slot: ColonyCardSlot; card: ColonyCard }[]
    ));
  }, [colonies]);

  const battleEquippedRecords = useMemo(() => (
    BATTLE_CARD_SLOTS
      .map(slot => {
        const card = getCardById(battleLoadout[slot]);
        return card && isBattleCard(card) ? { slot, card } : null;
      })
      .filter(Boolean) as { slot: BattleCardSlot; card: ColonyCard }[]
  ), [battleLoadout]);

  const filterByClass = (card: ColonyCard) => classFilter === 'all' || getCardClass(card) === classFilter;

  const getRequirement = (card: ColonyCard) => {
    const historyStats = missions.historyStats || {};
    const unlockedAchievements = missions.unlockedAchievements || [];
    const solarStats = historyStats.Solar || {};
    const interstellarStats = historyStats.Interstellar || {};
    const voidStats = historyStats.Void || {};
    const totalStats = Object.values(historyStats).reduce((acc: Record<string, number>, stats: any) => {
      acc.qcTotalAcquired += Number(stats?.qcTotalAcquired) || 0;
      acc.perfectDeliveries += Number(stats?.perfectDeliveries) || 0;
      acc.missionsCompleted += Number(stats?.missionsCompleted) || 0;
      acc.battlesWon += Number(stats?.battlesWon) || 0;
      return acc;
    }, { qcTotalAcquired: 0, perfectDeliveries: 0, missionsCompleted: 0, battlesWon: 0 });

    switch (card.id) {
      case 'legacy-solar-quartermaster':
        return { met: (solarStats.manualDeliveries || 0) >= 50 || unlockedAchievements.includes('first_delivery'), label: tl(lang, 'Chapter 1: 50 manual deliveries', 'Capítulo 1: 50 entregas manuais') };
      case 'legacy-interstellar-envoy':
        return { met: (interstellarStats.missionsCompleted || 0) >= 25 || totalStats.missionsCompleted >= 75, label: tl(lang, 'Chapter 2: 25 missions completed', 'Capítulo 2: 25 missões concluídas') };
      case 'legacy-void-veteran':
        return { met: (voidStats.battlesWon || 0) >= 20 || totalStats.battlesWon >= 80, label: tl(lang, 'Chapter 3: 20 battles won', 'Capítulo 3: 20 batalhas vencidas') };
      case 'legacy-perfect-route-planner':
        return { met: totalStats.perfectDeliveries >= 30, label: tl(lang, 'Campaign: 30 perfect deliveries', 'Campanha: 30 entregas perfeitas') };
      case 'legacy-civic-archive':
        return { met: totalStats.qcTotalAcquired >= 1000000000, label: tl(lang, 'Campaign: 1B total QC acquired', 'Campanha: 1B de QC total adquirido') };
      case 'arcade-ruptura-estelar':
        return { met: bestEffectiveSectors.security >= 48, label: tl(lang, 'Security 48+', 'Segurança 48+') };
      case 'arcade-danger-zoom-zones':
        return { met: bestEffectiveSectors.technology >= 55, label: tl(lang, 'Technology 55+', 'Tecnologia 55+') };
      case 'arcade-grid-collapse':
        return { met: bestEffectiveSectors.technology >= 60 && bestEffectiveSectors.economy >= 45, label: tl(lang, 'Technology 60+ and Economy 45+', 'Tecnologia 60+ e Economia 45+') };
      case 'arcade-robot-runner':
        return { met: bestEffectiveSectors.happiness >= 60 && bestEffectiveSectors.technology >= 60, label: tl(lang, 'Happiness 60+ and Technology 60+', 'Felicidade 60+ e Tecnologia 60+') };
      case 'arcade-neo-catcher':
        return { met: bestEffectiveSectors.culture >= 60 && bestEffectiveSectors.happiness >= 65, label: tl(lang, 'Culture 60+ and Happiness 65+', 'Cultura 60+ e Felicidade 65+') };
      default:
        return { met: false, label: tl(lang, 'New Earth protocol', 'Protocolo Nova Terra') };
    }
  };

  const openCard = (card: ColonyCard, action: 'equip' | 'claim') => {
    setSelectedCard({ card, action });
    playSfx('view_card');
  };

  const claimCard = (card: ColonyCard) => {
    const requirement = getRequirement(card);
    if (ownedCardIds.includes(card.id)) {
      setFeedback(tl(lang, 'Card already registered', 'Carta já registrada'));
      return;
    }
    if (!requirement.met) {
      setFeedback(`${tl(lang, 'Requirement missing:', 'Requisito pendente:')} ${requirement.label}`);
      return;
    }

    const nextOwnedCardIds = [...ownedCardIds, card.id];
    setOwnedCardIds(nextOwnedCardIds);
    GameStorage.save(nextOwnedCardIds, 'colony_cards_data');
    notifyColonyCardsChanged(nextOwnedCardIds);
    setCardEvent(card);
    setSelectedCard(null);
    playSfx('claim_card');
  };

  const equipCard = (card: ColonyCard, colonyId: string) => {
    if (!isPoliticalCard(card)) return;
    const target = colonies.find((colony: Colony) => colony.id === colonyId);
    const occupiedCardId = target?.equippedCards?.[card.slot];
    if (occupiedCardId && occupiedCardId !== card.id) {
      setFeedback(tl(lang, 'Remove the equipped card first', 'Retire a carta equipada primeiro'));
      return;
    }

    setColonies((prev: Colony[]) => prev.map(colony => {
      const equippedCards = { ...(colony.equippedCards || {}) };
      Object.keys(equippedCards).forEach(slot => {
        if (equippedCards[slot as ColonyCardSlot] === card.id) {
          delete equippedCards[slot as ColonyCardSlot];
        }
      });
      if (colony.id === colonyId) equippedCards[card.slot] = card.id;
      return { ...colony, equippedCards };
    }));
    playSfx('equip_card');
    setFeedback(tl(lang, 'Card equipped', 'Carta equipada'));
  };

  const equipBattleCard = (card: ColonyCard) => {
    if (!isBattleCard(card)) return;
    const occupiedCardId = battleLoadout[card.slot];
    if (occupiedCardId && occupiedCardId !== card.id) {
      setFeedback(tl(lang, 'Remove the equipped battle card first', 'Retire a carta de batalha equipada primeiro'));
      return;
    }

    setBattleLoadout(prev => {
      const next = { ...prev };
      BATTLE_CARD_SLOTS.forEach(slot => {
        if (next[slot] === card.id) delete next[slot];
      });
      next[card.slot] = card.id;
      return next;
    });
    playSfx('equip_card');
    setFeedback(tl(lang, 'Battle card equipped', 'Carta de batalha equipada'));
  };

  const confirmSelected = () => {
    if (!selectedCard) return;
    if (selectedCard.action === 'claim') {
      claimCard(selectedCard.card);
      return;
    }
    if (selectedCard.action === 'equip') {
      if (isBattleCard(selectedCard.card)) {
        equipBattleCard(selectedCard.card);
        setSelectedCard(null);
        return;
      }
      setEquipChoiceCard(selectedCard.card);
      setSelectedCard(null);
    }
  };

  const getEquippedLabel = (cardId: string) => {
    const politicalRecord = politicalEquippedRecords.find(item => item.card.id === cardId);
    if (politicalRecord) return `${politicalRecord.colony.name} / ${SLOT_LABEL[politicalRecord.slot][lang]}`;
    const battleRecord = battleEquippedRecords.find(item => item.card.id === cardId);
    return battleRecord ? `${tl(lang, 'Battle Loadout', 'Plano de Batalha')} / ${SLOT_LABEL[battleRecord.slot][lang]}` : undefined;
  };

  if (colonies.length === 0) return null;

  const sectionTabs = [
    { id: 'owned' as const, label: tl(lang, 'Card Chest', 'Baú de Cartas'), icon: Boxes },
    { id: 'codex' as const, label: tl(lang, 'Card Codex', 'Codex de Cartas'), icon: BookOpen },
    { id: 'equipped' as const, label: tl(lang, 'Equipped Cards', 'Cartas Equipadas'), icon: BadgeCheck },
  ];

  const filteredOwnedCards = ownedCards.filter(filterByClass);
  const filteredCatalog = COLONY_CARD_CATALOG.filter(filterByClass);
  const filteredPoliticalEquippedRecords = classFilter === 'battle' ? [] : politicalEquippedRecords;
  const filteredBattleEquippedRecords = classFilter === 'political' ? [] : battleEquippedRecords;
  const equippedItems = [
    ...filteredPoliticalEquippedRecords.map(record => ({ kind: 'political' as const, ...record })),
    ...filteredBattleEquippedRecords.map(record => ({ kind: 'battle' as const, ...record })),
  ];

  const pageSize = activeSection === 'equipped' ? 6 : 8;
  const activeItems = activeSection === 'owned'
    ? filteredOwnedCards
    : activeSection === 'codex'
      ? filteredCatalog
      : equippedItems;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = activeItems.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const canGoPrev = safePage > 0;
  const canGoNext = safePage < totalPages - 1;

  const sectionTitle = sectionTabs.find(tab => tab.id === activeSection)?.label || '';
  const sectionEyebrow = activeSection === 'owned'
    ? tl(lang, 'Owned Cards', 'Cartas Possuídas')
    : activeSection === 'codex'
      ? tl(lang, 'Complete Catalog', 'Catálogo Completo')
      : tl(lang, 'Active Influence', 'Influência Ativa');

  return (
    <motion.div
      key="cards"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full min-h-0 flex-col gap-3 overflow-hidden"
    >
      <div className="shrink-0 rounded-2xl border border-emerald-400/20 bg-black/40 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300">{tl(lang, 'Chapter 4 Collection', 'Coleção do Capítulo 4')}</p>
            <h2 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{tl(lang, 'Card Album', 'Álbum de Cartas')}</h2>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/40 p-1 lg:w-[520px]">
            {sectionTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-orbitron font-black uppercase tracking-widest transition-all ${
                  activeSection === tab.id
                    ? 'bg-emerald-300 text-black shadow-[0_0_18px_rgba(52,211,153,0.22)]'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-zinc-950/70 p-4">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">{sectionEyebrow}</p>
            <h3 className="font-orbitron text-lg font-black uppercase text-white">{sectionTitle}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/35 p-1">
              {([
                { id: 'all' as const, label: tl(lang, 'All', 'Todas') },
                { id: 'political' as const, label: tl(lang, 'Political', 'Políticas') },
                { id: 'battle' as const, label: tl(lang, 'Battle', 'Batalha') },
              ]).map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setClassFilter(filter.id)}
                  className={`rounded-lg px-2 py-1 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all ${
                    classFilter === filter.id
                      ? filter.id === 'battle'
                        ? 'bg-red-400 text-black'
                        : 'bg-cyan-300 text-black'
                      : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-cyan-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-700"
              aria-label={tl(lang, 'Previous page', 'Página anterior')}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-cyan-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-700"
              aria-label={tl(lang, 'Next page', 'Próxima página')}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {activeSection === 'equipped' && (
          <div className="mb-3 grid shrink-0 gap-3 xl:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">{tl(lang, 'Political Cards Equipped', 'Cartas Políticas Equipadas')}</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {(Object.keys(SECTOR_CONFIG) as ColonySectorId[]).map(sectorId => {
                  const config = SECTOR_CONFIG[sectorId];
                  return (
                    <div key={sectorId} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[9px] font-mono uppercase tracking-wider text-zinc-500">{config.label[lang]}</span>
                        <span className="font-orbitron text-[11px] font-black text-white">{bestEffectiveSectors[sectorId]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-red-300/20 bg-red-300/5 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-red-200">{tl(lang, 'Battle Cards Equipped', 'Cartas de Batalha Equipadas')}</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {BATTLE_CARD_SLOTS.map(slot => {
                  const card = getCardById(battleLoadout[slot]);
                  return (
                    <div key={slot} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                      <p className="truncate text-[9px] font-mono uppercase tracking-wider text-zinc-500">{SLOT_LABEL[slot][lang]}</p>
                      <p className={`mt-1 truncate font-orbitron text-[10px] font-black uppercase ${card ? 'text-red-100' : 'text-zinc-600'}`}>
                        {card ? card.name[lang] : tl(lang, 'Empty', 'Vazio')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className={`grid flex-1 auto-rows-fr gap-3 overflow-hidden ${
          activeSection === 'equipped'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
        }`}>
          {activeSection === 'owned' && (pageItems as ColonyCard[]).map(card => (
            <CardTile
              key={card.id}
              card={card}
              language={lang}
              owned
              equippedLabel={getEquippedLabel(card.id)}
              actionLabel={tl(lang, 'Inspect Card', 'Inspecionar Carta')}
              onClick={() => openCard(card, 'equip')}
            />
          ))}

          {activeSection === 'codex' && (pageItems as ColonyCard[]).map(card => {
            const owned = ownedCardIds.includes(card.id);
            const requirement = getRequirement(card);
            return (
              <CardTile
                key={card.id}
                card={card}
                language={lang}
                owned={owned}
                claimable={!owned && requirement.met}
                equippedLabel={owned ? getEquippedLabel(card.id) : undefined}
                lockedReason={owned ? undefined : `${tl(lang, 'How to acquire:', 'Como adquirir:')} ${requirement.label}`}
                actionLabel={owned ? tl(lang, 'Inspect Card', 'Inspecionar Carta') : requirement.met ? tl(lang, 'Claim Card', 'Reivindicar Carta') : undefined}
                onClick={() => openCard(card, owned ? 'equip' : 'claim')}
              />
            );
          })}

          {activeSection === 'equipped' && equippedItems.length === 0 && (
            <div className="col-span-full flex items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-black/30 p-5 text-center">
              <p className="font-orbitron text-sm font-black uppercase text-zinc-500">{tl(lang, 'No active cards', 'Nenhuma carta ativa')}</p>
            </div>
          )}

          {activeSection === 'equipped' && (pageItems as Array<
            | { kind: 'political'; colony: Colony; slot: ColonyCardSlot; card: ColonyCard }
            | { kind: 'battle'; slot: BattleCardSlot; card: ColonyCard }
          >).map(item => {
            const equippedLabel = item.kind === 'political'
              ? `${item.colony.name} / ${SLOT_LABEL[item.slot][lang]}`
              : `${tl(lang, 'Battle Loadout', 'Plano de Batalha')} / ${SLOT_LABEL[item.slot][lang]}`;

            return (
              <CardTile
                key={`${item.kind}-${item.slot}-${item.card.id}`}
                card={item.card}
                language={lang}
                owned
                equippedLabel={equippedLabel}
                actionLabel={tl(lang, 'Inspect Card', 'Inspecionar Carta')}
                onClick={() => openCard(item.card, 'equip')}
              />
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-8 left-1/2 z-[150] -translate-x-1/2 rounded-full border border-emerald-300/30 bg-black/80 px-5 py-3 font-orbitron text-[12px] font-black uppercase tracking-widest text-emerald-200 backdrop-blur-md"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cardEvent && (
          <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border p-6 ${getCardStyle(cardEvent.rarity, getCardClass(cardEvent))}`}
            >
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_45%)]" />
              <div className="relative z-10 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-emerald-300">{tl(lang, 'Card acquired', 'Carta adquirida')}</p>
                <h3 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-tight text-white">{RARITY_LABEL[cardEvent.rarity][lang]}</h3>
              </div>
              <div className="relative z-10 my-6">
                <CardTile card={cardEvent} language={lang} owned />
              </div>
              <button
                onClick={() => setCardEvent(null)}
                className="relative z-10 w-full rounded-2xl bg-emerald-400 px-5 py-4 font-orbitron text-sm font-black uppercase tracking-[0.24em] text-black transition-all hover:bg-emerald-300"
              >
                {tl(lang, 'Register in Album', 'Registrar no Álbum')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className={`relative grid w-full max-w-4xl gap-5 overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7 ${getCardStyle(selectedCard.card.rarity, getCardClass(selectedCard.card))}`}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 p-2 text-zinc-300 transition-all hover:text-white"
                aria-label={tl(lang, 'Close card', 'Fechar carta')}
              >
                <X size={18} />
              </button>

              <div className="flex items-center">
                <CardTile card={selectedCard.card} language={lang} owned={ownedCardIds.includes(selectedCard.card.id)} />
              </div>

              <div className="flex flex-col justify-between gap-5">
                <div>
                  {(() => {
                    const selectedRequirement = getRequirement(selectedCard.card);
                    const alreadyOwned = ownedCardIds.includes(selectedCard.card.id);
                    return (
                      <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-200">{tl(lang, 'Council Dossier', 'Dossiê do Conselho')}</p>
                  <h3 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-tight text-white">{selectedCard.card.name[lang]}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-200">{selectedCard.card.role[lang]}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{selectedCard.card.lore[lang]}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{tl(lang, 'Direct impact', 'Impacto direto')}</p>
                    <CardEffectPills card={selectedCard.card} language={lang} />
                  </div>
                  {selectedCard.card.unlocksArcadeId && (
                    <div className="mt-3 rounded-2xl border border-violet-300/30 bg-violet-300/10 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-200">{tl(lang, 'Linked arcade', 'Fliperama vinculado')}</p>
                      <p className="mt-2 font-orbitron text-lg font-black uppercase text-white">
                        {MINI_GAMES_CONFIG.find(game => game.id === selectedCard.card.unlocksArcadeId)?.name[lang]}
                      </p>
                    </div>
                  )}
                  {selectedCard.action === 'claim' && !alreadyOwned && (
                    <div className={`mt-3 rounded-2xl border p-4 ${
                      selectedRequirement.met
                        ? 'border-emerald-300/35 bg-emerald-300/10'
                        : 'border-amber-300/35 bg-amber-300/10'
                    }`}>
                      <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
                        selectedRequirement.met ? 'text-emerald-200' : 'text-amber-200'
                      }`}>
                        {selectedRequirement.met
                          ? tl(lang, 'Requirement complete', 'Requisito concluído')
                          : tl(lang, 'Requirement missing', 'Requisito pendente')}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-200">{selectedRequirement.label}</p>
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {(() => {
                    const selectedRequirement = getRequirement(selectedCard.card);
                    const alreadyOwned = ownedCardIds.includes(selectedCard.card.id);
                    const canConfirm = selectedCard.action !== 'claim' || selectedRequirement.met || alreadyOwned;
                    return (
                  <button
                    onClick={confirmSelected}
                    disabled={!canConfirm}
                    className="flex-1 rounded-2xl bg-emerald-400 px-5 py-4 font-orbitron text-sm font-black uppercase tracking-[0.22em] text-black transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
                  >
                    {selectedCard.action === 'claim'
                      ? alreadyOwned
                        ? tl(lang, 'Registered', 'Registrada')
                        : canConfirm
                          ? tl(lang, 'Claim Card', 'Reivindicar Carta')
                          : tl(lang, 'Locked', 'Bloqueada')
                      : tl(lang, 'Equip Card', 'Equipar Carta')}
                  </button>
                    );
                  })()}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 font-orbitron text-sm font-black uppercase tracking-[0.22em] text-zinc-300 transition-all hover:text-white"
                  >
                    {tl(lang, 'Back', 'Voltar')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {equipChoiceCard && (
          <div className="fixed inset-0 z-[142] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className={`relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 p-5 md:p-7 ${getCardStyle(equipChoiceCard.rarity, getCardClass(equipChoiceCard))}`}
            >
              <button
                onClick={() => setEquipChoiceCard(null)}
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 p-2 text-zinc-300 transition-all hover:text-white"
                aria-label={tl(lang, 'Close colony selection', 'Fechar seleção de colônia')}
              >
                <X size={18} />
              </button>

              <div className="relative z-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-200">{tl(lang, 'Choose destination', 'Escolha o destino')}</p>
                <h3 className="mt-2 font-orbitron text-2xl font-black uppercase tracking-tight text-white">{equipChoiceCard.name[lang]}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {tl(lang, 'This card can be equipped only in a free matching slot.', 'Esta carta só pode ser equipada em um slot correspondente livre.')}
                </p>
              </div>

              <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-2">
                {colonies.map((colony: Colony) => {
                  const politicalSlot = equipChoiceCard.slot as ColonyCardSlot;
                  const occupiedCardId = colony.equippedCards?.[politicalSlot];
                  const occupiedCard = getCardById(occupiedCardId);
                  const currentRecord = getCardEquippedRecord(colonies, equipChoiceCard.id);
                  const alreadyHere = currentRecord?.colony.id === colony.id;
                  const alreadyElsewhere = Boolean(currentRecord && !alreadyHere);
                  const canEquip = !occupiedCardId && !alreadyElsewhere;
                  const effective = getColonyEffectiveSectors(colony);

                  return (
                    <button
                      key={colony.id}
                      type="button"
                      disabled={!canEquip}
                      onClick={() => {
                        equipCard(equipChoiceCard, colony.id);
                        setEquipChoiceCard(null);
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        canEquip
                          ? 'border-emerald-300/40 bg-emerald-300/10 hover:bg-emerald-300 hover:text-black'
                          : alreadyHere
                            ? 'cursor-not-allowed border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
                            : 'cursor-not-allowed border-white/10 bg-black/35 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">{SLOT_LABEL[politicalSlot][lang]}</p>
                          <h4 className="mt-2 font-orbitron text-base font-black uppercase text-white group-hover:text-black">{colony.name}</h4>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                          {alreadyHere
                            ? tl(lang, 'Equipped', 'Equipada')
                            : canEquip
                              ? tl(lang, 'Available', 'Disponível')
                              : tl(lang, 'Blocked', 'Bloqueada')}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {getPoliticalEffects(equipChoiceCard).slice(0, 3).map(effect => (
                          <div key={`${colony.id}-${effect.sector}`} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
                            <p className="truncate font-mono text-[8px] uppercase tracking-wider opacity-70">{SECTOR_CONFIG[effect.sector].label[lang]}</p>
                            <p className="font-orbitron text-[12px] font-black">{effective[effect.sector]} {effect.value > 0 ? `+${effect.value}` : effect.value}</p>
                          </div>
                        ))}
                      </div>

                      {!canEquip && (
                        <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
                          {alreadyHere
                            ? tl(lang, 'Remove it from this colony if you want to change the setup.', 'Retire pela própria colônia se quiser mudar o plano.')
                            : alreadyElsewhere
                              ? tl(lang, `Already equipped in ${currentRecord?.colony.name}.`, `Já equipada em ${currentRecord?.colony.name}.`)
                              : tl(lang, `Slot occupied by ${occupiedCard?.name[lang] || 'another card'}.`, `Slot ocupado por ${occupiedCard?.name[lang] || 'outra carta'}.`)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default CardsTab;
