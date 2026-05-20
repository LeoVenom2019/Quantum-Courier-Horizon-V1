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
  ColonyCardLevels,
  ColonyCardAnySlot,
  ColonyCardClass,
  ColonyCardSlot,
  getCardById,
  getBattleEffects,
  getCardBackgroundImage,
  getCardClass,
  getCardLevel,
  getCardStyle,
  getCardUpgradeCost,
  getPoliticalEffects,
  MAX_COLONY_CARD_LEVEL,
  canEquipBattleCardWithElementRule,
  getBattleCardElementTypes,
  isBattleCard,
  isPoliticalCard,
  isWildcardCard,
  normalizeOwnedColonyCardIds,
  TRINITY_REACTOR_CARD_ID,
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
  auxiliary: { en: 'Auxiliary', pt: 'Auxiliar' },
  protocol: { en: 'Protocol', pt: 'Protocolo' },
};

const RARITY_LABEL: Record<string, Record<'en' | 'pt', string>> = {
  common: { en: 'Common', pt: 'Comum' },
  rare: { en: 'Rare', pt: 'Rara' },
  epic: { en: 'Epic', pt: 'Épica' },
  legendary: { en: 'Legendary', pt: 'Lendária' },
  mythic: { en: 'Mythic', pt: 'Mítica' },
  wildcard: { en: 'Wildcard', pt: 'Curinga' },
};

const RARITY_SORT = { wildcard: -1, mythic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };

const tl = (language: 'en' | 'pt', en: string, pt: string) => language === 'pt' ? pt : en;
const CLASS_LABEL: Record<ColonyCardClass, Record<'en' | 'pt', string>> = {
  political: { en: 'Political', pt: 'Política' },
  battle: { en: 'Battle', pt: 'Batalha' },
  wildcard: { en: 'Wildcard', pt: 'Curinga' },
};

const getColonyEffectiveSectors = (colony: Colony | null, cardLevels: ColonyCardLevels = {}) => {
  const next = { ...DEFAULT_COLONY_SECTORS, ...(colony?.sectors || {}) };
  if (!colony) return next;

  Object.values(colony.equippedCards || {}).forEach(cardId => {
    const card = getCardById(cardId);
    if (!card || !isPoliticalCard(card)) return;
    getPoliticalEffects(card, cardLevels).forEach(effect => {
      next[effect.sector] = Math.min(100, Math.max(0, next[effect.sector] + effect.value));
    });
  });

  return next;
};

const CardEffectPills = ({ card, language, cardLevels = {} }: { card: ColonyCard; language: 'en' | 'pt'; cardLevels?: ColonyCardLevels }) => {
  const cardClass = getCardClass(card);
  if (cardClass === 'wildcard') {
    const arcade = card.unlocksArcadeId
      ? MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId)
      : undefined;

    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-fuchsia-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.35)]">
          {card.arcadePerk
            ? `${card.arcadePerk.value} ${card.arcadePerk.label[language]}`
            : (language === 'pt' ? 'Coleção Curinga' : 'Wildcard Collection')}
        </span>
        {arcade && (
          <span className="rounded-full border border-cyan-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.35)]">
            {language === 'pt' ? 'Desbloqueia' : 'Unlocks'} {arcade.name[language]}
          </span>
        )}
      </div>
    );
  }

  const politicalEffects = getPoliticalEffects(card, cardLevels);
  const battleEffects = getBattleEffects(card, cardLevels);
  const effects = cardClass === 'battle' ? battleEffects : politicalEffects;

  return (
    <div className="flex flex-wrap gap-1.5">
      {cardClass === 'political' && card.passiveBonuses?.constructorsAllColonies ? (
        <span className="rounded-full border border-cyan-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-cyan-100 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
          +{card.passiveBonuses.constructorsAllColonies} {language === 'pt' ? 'Robôs Construtores' : 'Builder Robots'}
        </span>
      ) : null}
      {cardClass === 'political' && card.passiveBonuses?.allSectorBonus ? (
        <span className="rounded-full border border-emerald-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-emerald-200 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
          +{card.passiveBonuses.allSectorBonus} {language === 'pt' ? 'Todas as Colônias' : 'All Colonies'}
        </span>
      ) : null}
      {cardClass === 'political' && card.passiveBonuses?.constructionSpeedPercent ? (
        <span className="rounded-full border border-amber-300/60 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-mono text-amber-100 shadow-[0_0_10px_rgba(0,0,0,0.45)]">
          +{card.passiveBonuses.constructionSpeedPercent}% {language === 'pt' ? 'Velocidade de Construção' : 'Construction Speed'}
        </span>
      ) : null}
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
                  ? 'border-red-300/60 bg-zinc-950/90 text-red-100 shadow-[0_0_10px_rgba(0,0,0,0.45)]'
                  : 'border-emerald-300/60 bg-zinc-950/90 text-emerald-200 shadow-[0_0_10px_rgba(0,0,0,0.45)]'
                : 'border-red-300/60 bg-zinc-950/90 text-red-200 shadow-[0_0_10px_rgba(0,0,0,0.45)]'
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
  size = 'normal',
  cardLevels = {},
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  owned: boolean;
  claimable?: boolean;
  equippedLabel?: string;
  lockedReason?: string;
  actionLabel?: string;
  onClick?: () => void;
  size?: 'normal' | 'large';
  cardLevels?: ColonyCardLevels;
}) => {
  const cardClass = getCardClass(card);
  const backgroundImage = getCardBackgroundImage(card.rarity);
  const content = (
    <>
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.018] ${owned ? 'opacity-100' : 'opacity-45 grayscale'}`}
      />
      <div className="absolute inset-[8%] rounded-[8%] bg-gradient-to-b from-black/8 via-black/10 to-black/36" />
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover/card:opacity-100 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.16),transparent_36%)]" />
      {claimable && !owned && (
        <div className="absolute left-[12%] top-[12%] z-20 rounded-full border border-emerald-300/50 bg-emerald-300 px-2 py-1 font-orbitron text-[8px] font-black uppercase tracking-widest text-black shadow-[0_0_14px_rgba(52,211,153,0.35)]">
          {language === 'pt' ? 'Resgatar' : 'Claim'}
        </div>
      )}
      <div className={`absolute z-10 ${cardClass === 'wildcard' ? 'bottom-[24%] left-[11%] right-[18%]' : 'inset-x-[11%] top-[18%]'}`}>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${
              cardClass === 'wildcard'
                ? 'border-fuchsia-300/55 bg-zinc-950/85 text-fuchsia-100'
                : cardClass === 'battle'
                ? 'border-red-300/45 bg-zinc-950/85 text-red-100'
                : 'border-cyan-300/45 bg-zinc-950/85 text-cyan-100'
            }`}>
              {CLASS_LABEL[cardClass][language]}
            </span>
            {card.slot ? (
              <span className="rounded-full border border-white/20 bg-zinc-950/85 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-zinc-200">
                {SLOT_LABEL[card.slot][language]}
              </span>
            ) : (
              <span className="rounded-full border border-cyan-300/30 bg-zinc-950/85 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-cyan-100">
                Arcade
              </span>
            )}
          </div>
          <h4 className="line-clamp-3 rounded-lg bg-zinc-950/88 px-2 py-1.5 text-sm font-orbitron font-black uppercase leading-tight text-white shadow-[0_0_18px_rgba(0,0,0,0.45)]">{card.name[language]}</h4>
          <p className="line-clamp-3 rounded-lg bg-zinc-950/86 px-2 py-1.5 text-[11px] leading-snug text-zinc-100 shadow-[0_0_14px_rgba(0,0,0,0.35)]">{card.lore[language]}</p>
        </div>
      </div>
      <div className="absolute right-[11%] top-[18%] z-10">
        {owned ? (
          equippedLabel ? <BadgeCheck size={18} className="shrink-0 text-emerald-300" /> : <Sparkles size={18} className="shrink-0 text-white/40" />
        ) : (
          <LockKeyhole size={18} className="shrink-0 text-zinc-600" />
        )}
      </div>
      <div className="absolute inset-x-[11%] bottom-[11%] z-10 space-y-2">
        {!isWildcardCard(card) && (
          <div className="inline-flex rounded-full border border-white/20 bg-zinc-950/88 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
            LVL {getCardLevel(card.id, cardLevels)} / {MAX_COLONY_CARD_LEVEL}
          </div>
        )}
        <CardEffectPills card={card} language={language} cardLevels={cardLevels} />
        {equippedLabel && (
          <p className="rounded-lg bg-zinc-950/88 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-200">{equippedLabel}</p>
        )}
        {lockedReason && (
          <p className="line-clamp-3 rounded-lg bg-zinc-950/88 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-200">{lockedReason}</p>
        )}
        {actionLabel && (
          <p className="rounded-lg bg-zinc-950/90 px-2 py-1 text-[10px] font-orbitron font-black uppercase tracking-[0.22em] text-white">{actionLabel}</p>
        )}
      </div>
    </>
  );

  const sizeClass = size === 'large'
    ? 'max-w-[350px] sm:max-w-[390px]'
    : 'max-w-[260px] sm:max-w-[290px]';
  const className = `group/card relative mx-auto aspect-[2/3] w-full ${sizeClass} overflow-hidden rounded-[3.8%] border text-left transition-all ${
    owned ? getCardStyle(card.rarity, cardClass) : cardClass === 'wildcard' ? 'border-fuchsia-900/50 bg-fuchsia-950/10 opacity-85' : cardClass === 'battle' ? 'border-red-900/50 bg-red-950/10 opacity-85' : 'border-zinc-800 bg-black/35 opacity-80'
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

const getFreePoliticalSlot = (equippedCards: Partial<Record<ColonyCardSlot, string>> = {}) => (
  CARD_SLOTS.find(slot => !equippedCards[slot])
);

const notifyColonyCardsChanged = (cardIds: string[]) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('qch:colony-cards-updated', { detail: cardIds }));
};

const notifyColonyCardLevelsChanged = (levels: ColonyCardLevels) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('qch:colony-card-levels-updated', { detail: levels }));
};

type CardClassFilter = 'all' | ColonyCardClass;
type BattleLoadout = Partial<Record<BattleCardSlot, string>>;

const CardsTab = memo(function CardsTab() {
  const {
    language,
    colonies,
    setColonies,
    missions,
    economy,
    dispatch,
    playSfx,
    formatValue,
  } = useDashboard();
  const lang = language as 'en' | 'pt';

  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);
  const [selectedCard, setSelectedCard] = useState<{ card: ColonyCard; action: 'equip' | 'claim' } | null>(null);
  const [equipChoiceCard, setEquipChoiceCard] = useState<ColonyCard | null>(null);
  const [battleLoadout, setBattleLoadout] = useState<BattleLoadout>({});
  const [cardLevels, setCardLevels] = useState<ColonyCardLevels>({});
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
      const normalized = normalizeOwnedColonyCardIds(Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_OWNED_COLONY_CARD_IDS);
      setOwnedCardIds(normalized);
      GameStorage.save(normalized, 'colony_cards_data');
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
    let mounted = true;
    GameStorage.load('colony_card_levels').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') setCardLevels(saved);
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
    if (!isLoaded) return;
    GameStorage.save(cardLevels, 'colony_card_levels');
    notifyColonyCardLevelsChanged(cardLevels);
  }, [cardLevels, isLoaded]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const timer = window.setTimeout(() => setPage(0), 0);
    return () => window.clearTimeout(timer);
  }, [activeSection, classFilter]);

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

  const getRequirement = (card: ColonyCard) => {
    return {
      met: false,
      label: tl(
        lang,
        'Chapter 4 drops: defense battles or arcade score rewards',
        'Drops do Capítulo 4: batalhas de defesa ou prêmios de pontuação dos fliperamas'
      ),
    };
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
    const currentRecord = getCardEquippedRecord(colonies, card.id);
    const targetSlot = currentRecord?.colony.id === colonyId
      ? currentRecord.slot
      : getFreePoliticalSlot(target?.equippedCards);

    if (!targetSlot) {
      setFeedback(tl(lang, 'This colony already has three political cards equipped', 'Esta colônia já possui três cartas políticas equipadas'));
      return;
    }

    setColonies((prev: Colony[]) => prev.map(colony => {
      const equippedCards = { ...(colony.equippedCards || {}) };
      Object.keys(equippedCards).forEach(slot => {
        if (equippedCards[slot as ColonyCardSlot] === card.id) {
          delete equippedCards[slot as ColonyCardSlot];
        }
      });
      if (colony.id === colonyId) equippedCards[targetSlot] = card.id;
      return { ...colony, equippedCards };
    }));
    playSfx('equip_card');
    setFeedback(tl(lang, 'Card equipped', 'Carta equipada'));
  };

  const unequipPoliticalCard = (card: ColonyCard) => {
    if (!isPoliticalCard(card)) return;
    const currentRecord = getCardEquippedRecord(colonies, card.id);
    if (!currentRecord) return;

    setColonies((prev: Colony[]) => prev.map(colony => {
      if (colony.id !== currentRecord.colony.id) return colony;
      const equippedCards = { ...(colony.equippedCards || {}) };
      delete equippedCards[currentRecord.slot];
      return { ...colony, equippedCards };
    }));
    playSfx('unequip_card');
    setFeedback(tl(lang, 'Political card removed', 'Carta política retirada'));
  };

  const equipBattleCard = (card: ColonyCard) => {
    if (!isBattleCard(card)) return;
    const currentSlot = BATTLE_CARD_SLOTS.find(slot => battleLoadout[slot] === card.id);
    const targetSlot = currentSlot || BATTLE_CARD_SLOTS.find(slot => !battleLoadout[slot]);
    if (!targetSlot) {
      setFeedback(tl(lang, 'All 6 battle slots are occupied', 'Todos os 6 slots ocupados'));
      return;
    }
    const equippedCardsForRule = BATTLE_CARD_SLOTS
      .map(slot => getCardById(battleLoadout[slot]))
      .filter(Boolean)
      .filter(equippedCard => equippedCard?.id !== card.id)
      .filter(equippedCard => equippedCard && isBattleCard(equippedCard)) as ColonyCard[];
    const elementRule = canEquipBattleCardWithElementRule(card, equippedCardsForRule);
    if (!elementRule.allowed) {
      setFeedback(tl(
        lang,
        'Only one elemental battle path can be active at a time',
        'Apenas um caminho elemental de batalha pode ficar ativo por vez'
      ));
      return;
    }

    setBattleLoadout(prev => {
      const next = { ...prev };
      BATTLE_CARD_SLOTS.forEach(slot => {
        if (next[slot] === card.id) delete next[slot];
      });
      next[targetSlot] = card.id;
      return next;
    });
    playSfx('equip_card');
    setFeedback(tl(lang, 'Battle card equipped', 'Carta de batalha equipada'));
  };

  const unequipBattleCard = (card: ColonyCard) => {
    if (!isBattleCard(card)) return;
    const currentSlot = BATTLE_CARD_SLOTS.find(slot => battleLoadout[slot] === card.id);
    if (!currentSlot) return;

    setBattleLoadout(prev => {
      const next = { ...prev };
      delete next[currentSlot];

      if (card.id === TRINITY_REACTOR_CARD_ID) {
        BATTLE_CARD_SLOTS.forEach(slot => {
          const equippedCard = getCardById(next[slot]);
          if (equippedCard && isBattleCard(equippedCard) && getBattleCardElementTypes(equippedCard).length > 0) {
            delete next[slot];
          }
        });
      }

      return next;
    });
    playSfx('unequip_card');
    setFeedback(card.id === TRINITY_REACTOR_CARD_ID
      ? tl(lang, 'Trina removed. Elemental battle cards were automatically unequipped.', 'Trina retirada. Cartas elementais foram removidas automaticamente.')
      : tl(lang, 'Battle card removed', 'Carta de batalha retirada')
    );
  };

  const upgradeCard = (card: ColonyCard) => {
    const level = getCardLevel(card.id, cardLevels);
    if (level >= MAX_COLONY_CARD_LEVEL) {
      setFeedback(tl(lang, 'Card already at maximum level', 'Carta já está no nível máximo'));
      return;
    }
    const cost = getCardUpgradeCost(card, level);
    if ((economy.qc || 0) < cost) {
      setFeedback(tl(lang, 'Not enough QC', 'QC insuficiente'));
      return;
    }
    dispatch({ type: 'SPEND_QC', payload: { amount: cost } });
    setCardLevels(prev => ({ ...prev, [card.id]: level + 1 }));
    playSfx('level_up');
    setFeedback(tl(lang, 'Card upgraded', 'Carta aprimorada'));
  };

  const confirmSelected = () => {
    if (!selectedCard) return;
    if (selectedCard.action === 'claim') {
      claimCard(selectedCard.card);
      return;
    }
    if (selectedCard.action === 'equip') {
      if (isWildcardCard(selectedCard.card)) {
        setFeedback(tl(lang, 'Wildcard cards are passive arcade collectibles', 'Cartas Curingas são colecionáveis passivos dos fliperamas'));
        return;
      }
      if (isBattleCard(selectedCard.card)) {
        const battleRecord = battleEquippedRecords.find(record => record.card.id === selectedCard.card.id);
        if (battleRecord) {
          unequipBattleCard(selectedCard.card);
          return;
        }
        if (BATTLE_CARD_SLOTS.every(slot => battleLoadout[slot])) {
          setFeedback(tl(lang, 'All 6 battle slots are occupied', 'Todos os 6 slots ocupados'));
          return;
        }
        equipBattleCard(selectedCard.card);
        return;
      }
      const politicalRecord = getCardEquippedRecord(colonies, selectedCard.card.id);
      if (politicalRecord) {
        unequipPoliticalCard(selectedCard.card);
        return;
      }
      if (colonies.every((colony: Colony) => !getFreePoliticalSlot(colony.equippedCards))) {
        setFeedback(tl(lang, 'All political card slots are occupied', 'Todos os slots políticos estão ocupados'));
        return;
      }
      setEquipChoiceCard(selectedCard.card);
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

  const effectiveClassFilter = activeSection === 'equipped' && classFilter === 'wildcard' ? 'all' : classFilter;
  const availableClassFilters = activeSection === 'equipped'
    ? [
      { id: 'all' as const, label: tl(lang, 'All', 'Todas') },
      { id: 'political' as const, label: tl(lang, 'Political', 'Políticas') },
      { id: 'battle' as const, label: tl(lang, 'Battle', 'Batalha') },
    ]
    : [
      { id: 'all' as const, label: tl(lang, 'All', 'Todas') },
      { id: 'political' as const, label: tl(lang, 'Political', 'Políticas') },
      { id: 'battle' as const, label: tl(lang, 'Battle', 'Batalha') },
      { id: 'wildcard' as const, label: tl(lang, 'Wildcard', 'Curinga') },
    ];
  const filteredOwnedCards = ownedCards.filter(card => effectiveClassFilter === 'all' || getCardClass(card) === effectiveClassFilter);
  const filteredCatalog = COLONY_CARD_CATALOG.filter(card => effectiveClassFilter === 'all' || getCardClass(card) === effectiveClassFilter);
  const filteredPoliticalEquippedRecords = effectiveClassFilter === 'battle' ? [] : politicalEquippedRecords;
  const filteredBattleEquippedRecords = effectiveClassFilter === 'political' ? [] : battleEquippedRecords;
  const equippedItems = [
    ...filteredPoliticalEquippedRecords.map(record => ({ kind: 'political' as const, ...record })),
    ...filteredBattleEquippedRecords.map(record => ({ kind: 'battle' as const, ...record })),
  ];

  const pageSize = 4;
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
  const modalCards = activeItems.map(item => ('card' in item ? item.card : item));
  const selectedCardIndex = selectedCard
    ? modalCards.findIndex(card => card.id === selectedCard.card.id)
    : -1;
  const canNavigateSelectedCard = Boolean(selectedCard && modalCards.length > 1 && selectedCardIndex >= 0);
  const navigateSelectedCard = (direction: -1 | 1) => {
    if (!selectedCard || modalCards.length === 0) return;
    const currentIndex = selectedCardIndex >= 0
      ? selectedCardIndex
      : modalCards.findIndex(card => card.id === selectedCard.card.id);
    if (currentIndex < 0) return;

    const nextIndex = (currentIndex + direction + modalCards.length) % modalCards.length;
    const nextCard = modalCards[nextIndex];
    setSelectedCard({
      card: nextCard,
      action: activeSection === 'codex' && !ownedCardIds.includes(nextCard.id) ? 'claim' : 'equip',
    });
    playSfx('view_card');
  };

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
            <div className={`grid gap-1 rounded-xl border border-white/10 bg-black/35 p-1 ${activeSection === 'equipped' ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {availableClassFilters.map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setClassFilter(filter.id)}
                  className={`rounded-lg px-2 py-1 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all ${
                    effectiveClassFilter === filter.id
                      ? filter.id === 'wildcard'
                        ? 'bg-fuchsia-300 text-black'
                        : filter.id === 'battle'
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

        <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 overflow-hidden md:grid-cols-2 xl:grid-cols-4">
          {activeSection === 'owned' && (pageItems as ColonyCard[]).map(card => (
            <CardTile
              key={card.id}
                card={card}
                language={lang}
                owned
                cardLevels={cardLevels}
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
                cardLevels={cardLevels}
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
                cardLevels={cardLevels}
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
                <CardTile card={cardEvent} language={lang} owned cardLevels={cardLevels} />
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
              className={`relative grid h-[min(736px,calc(100vh-1rem))] w-full max-w-5xl gap-5 overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-6 ${getCardStyle(selectedCard.card.rarity, getCardClass(selectedCard.card))}`}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 p-2 text-zinc-300 transition-all hover:text-white"
                aria-label={tl(lang, 'Close card', 'Fechar carta')}
              >
                <X size={18} />
              </button>
              {canNavigateSelectedCard && (
                <div className="absolute left-7 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 p-1 shadow-[0_0_22px_rgba(0,0,0,0.35)]">
                  <button
                    type="button"
                    onClick={() => navigateSelectedCard(-1)}
                    className="rounded-full p-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                    aria-label={tl(lang, 'Previous card', 'Carta anterior')}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="min-w-12 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {selectedCardIndex + 1}/{modalCards.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateSelectedCard(1)}
                    className="rounded-full p-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                    aria-label={tl(lang, 'Next card', 'Próxima carta')}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              <div className="flex min-h-0 items-center">
                <CardTile card={selectedCard.card} language={lang} owned={ownedCardIds.includes(selectedCard.card.id)} size="large" cardLevels={cardLevels} />
              </div>

              <div className="flex min-h-0 flex-col justify-between gap-4">
                <div className="min-h-0">
                  {(() => {
                    const selectedRequirement = getRequirement(selectedCard.card);
                    const alreadyOwned = ownedCardIds.includes(selectedCard.card.id);
                    const isWildcard = isWildcardCard(selectedCard.card);
                    const cardLevel = getCardLevel(selectedCard.card.id, cardLevels);
                    const upgradeCost = getCardUpgradeCost(selectedCard.card, cardLevel);
                    const politicalRecord = isPoliticalCard(selectedCard.card)
                      ? getCardEquippedRecord(colonies, selectedCard.card.id)
                      : undefined;
                    const battleRecord = isBattleCard(selectedCard.card)
                      ? battleEquippedRecords.find(record => record.card.id === selectedCard.card.id)
                      : undefined;
                    const isEquipped = Boolean(politicalRecord || battleRecord);
                    const usageEyebrow = isPoliticalCard(selectedCard.card)
                      ? tl(lang, 'Political Assignment', 'Designação Política')
                      : isWildcard
                        ? tl(lang, 'Arcade Wildcard', 'Curinga de Fliperama')
                        : tl(lang, 'Battle Loadout', 'Plano de Batalha');
                    const usageText = politicalRecord
                      ? `${politicalRecord.colony.name} / ${SLOT_LABEL[politicalRecord.slot][lang]}`
                      : battleRecord
                        ? `${tl(lang, 'Horizon', 'Horizon')} / ${SLOT_LABEL[battleRecord.slot][lang]}`
                        : tl(lang, 'Not currently equipped', 'Não está sendo usada');
                    return (
                      <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-200">{tl(lang, 'Council Dossier', 'Dossiê do Conselho')}</p>
                  <h3 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-tight text-white">{selectedCard.card.name[lang]}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-200">{selectedCard.card.role[lang]}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{selectedCard.card.lore[lang]}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{tl(lang, 'Direct impact', 'Impacto direto')}</p>
                    <CardEffectPills card={selectedCard.card} language={lang} cardLevels={cardLevels} />
                  </div>
                  {alreadyOwned && !isWildcard && (
                    <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">{tl(lang, 'Card Level', 'Nível da Carta')}</p>
                          <p className="mt-1 font-orbitron text-lg font-black text-white">LVL {cardLevel} / {MAX_COLONY_CARD_LEVEL}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => upgradeCard(selectedCard.card)}
                          disabled={cardLevel >= MAX_COLONY_CARD_LEVEL || (economy.qc || 0) < upgradeCost}
                          className="rounded-xl border border-amber-300/30 bg-amber-300 px-4 py-2 font-orbitron text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                        >
                          {cardLevel >= MAX_COLONY_CARD_LEVEL ? 'MAX' : `${formatValue(upgradeCost)} QC`}
                        </button>
                      </div>
                    </div>
                  )}
                  {alreadyOwned && !isWildcard && (
                    <div className={`mt-3 rounded-2xl border p-4 ${
                      isEquipped
                        ? 'border-emerald-300/25 bg-emerald-300/10'
                        : 'border-zinc-600/40 bg-black/35'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${isEquipped ? 'text-emerald-200' : 'text-zinc-500'}`}>{usageEyebrow}</p>
                          <p className="mt-1 font-orbitron text-lg font-black uppercase text-white">{usageText}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                          isEquipped
                            ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100'
                            : 'border-zinc-600 bg-zinc-900 text-zinc-400'
                        }`}>
                          {isEquipped ? tl(lang, 'Active', 'Ativa') : tl(lang, 'Idle', 'Livre')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className={`mt-3 min-h-[85px] rounded-2xl border p-4 ${
                    selectedCard.card.unlocksArcadeId
                      ? 'border-violet-300/30 bg-violet-300/10'
                      : 'pointer-events-none border-transparent bg-transparent opacity-0'
                  }`}>
                    {selectedCard.card.unlocksArcadeId && (
                      <>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-200">{tl(lang, 'Linked arcade', 'Fliperama vinculado')}</p>
                      <p className="mt-2 font-orbitron text-lg font-black uppercase text-white">
                        {MINI_GAMES_CONFIG.find(game => game.id === selectedCard.card.unlocksArcadeId)?.name[lang]}
                      </p>
                      </>
                    )}
                  </div>
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
                    const battleRecord = isBattleCard(selectedCard.card)
                      ? battleEquippedRecords.find(record => record.card.id === selectedCard.card.id)
                      : undefined;
                    const politicalRecord = isPoliticalCard(selectedCard.card)
                      ? getCardEquippedRecord(colonies, selectedCard.card.id)
                      : undefined;
                    const battleSlotsFull = isBattleCard(selectedCard.card) && !battleRecord && BATTLE_CARD_SLOTS.every(slot => battleLoadout[slot]);
                    const politicalSlotsFull = isPoliticalCard(selectedCard.card) && !politicalRecord && colonies.every((colony: Colony) => !getFreePoliticalSlot(colony.equippedCards));
                    const isWildcard = isWildcardCard(selectedCard.card);
                    const isEquipped = Boolean(battleRecord || politicalRecord);
                    const slotsFull = battleSlotsFull || politicalSlotsFull;
                    const canConfirm = !isWildcard && (selectedCard.action !== 'claim' || selectedRequirement.met || alreadyOwned);
                    return (
                  <button
                    onClick={confirmSelected}
                    disabled={!canConfirm}
                    className={`flex-1 rounded-2xl px-5 py-4 font-orbitron text-sm font-black uppercase tracking-[0.22em] transition-all disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 ${
                      isEquipped
                        ? isBattleCard(selectedCard.card)
                          ? 'border border-red-300/35 bg-red-400/15 text-red-100 hover:bg-red-400/25'
                          : 'border border-cyan-300/35 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25'
                        : slotsFull
                          ? 'border border-white/10 bg-black/25 text-zinc-500 hover:border-amber-300/40 hover:text-amber-100'
                          : 'bg-emerald-400 text-black hover:bg-emerald-300'
                    }`}
                  >
                    {slotsFull && <LockKeyhole size={15} className="mr-2 inline -translate-y-px" />}
                    {selectedCard.action === 'claim'
                      ? alreadyOwned
                        ? tl(lang, 'Registered', 'Registrada')
                        : canConfirm
                          ? tl(lang, 'Claim Card', 'Reivindicar Carta')
                          : tl(lang, 'Locked', 'Bloqueada')
                      : isEquipped
                        ? tl(lang, 'Unequip Card', 'Desequipar Carta')
                        : isWildcard
                          ? tl(lang, 'Wildcard Card', 'Carta Curinga')
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
                  {tl(lang, 'Choose any colony with a free political card slot. Each colony can hold three political cards.', 'Escolha qualquer colônia com um slot político livre. Cada colônia comporta três cartas políticas.')}
                </p>
              </div>

              <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-2">
                {colonies.map((colony: Colony) => {
                  const currentRecord = getCardEquippedRecord(colonies, equipChoiceCard.id);
                  const alreadyHere = currentRecord?.colony.id === colony.id;
                  const freeSlot = getFreePoliticalSlot(colony.equippedCards);
                  const canEquip = alreadyHere || Boolean(freeSlot);
                  const effective = getColonyEffectiveSectors(colony, cardLevels);

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
                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
                            {alreadyHere
                              ? `${tl(lang, 'Equipped slot', 'Slot equipado')}: ${SLOT_LABEL[currentRecord!.slot][lang]}`
                              : `${tl(lang, 'Free slots', 'Slots livres')}: ${CARD_SLOTS.filter(slot => !colony.equippedCards?.[slot]).length} / 3`}
                          </p>
                          <h4 className="mt-2 font-orbitron text-base font-black uppercase text-white group-hover:text-black">{colony.name}</h4>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                          {alreadyHere
                            ? tl(lang, 'Equipped', 'Equipada')
                            : canEquip
                              ? tl(lang, 'Available', 'Disponível')
                              : tl(lang, 'Full', 'Cheia')}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {getPoliticalEffects(equipChoiceCard, cardLevels).slice(0, 3).map(effect => (
                          <div key={`${colony.id}-${effect.sector}`} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
                            <p className="truncate font-mono text-[8px] uppercase tracking-wider opacity-70">{SECTOR_CONFIG[effect.sector].label[lang]}</p>
                            <p className="font-orbitron text-[12px] font-black">{effective[effect.sector]} {effect.value > 0 ? `+${effect.value}` : effect.value}</p>
                          </div>
                        ))}
                      </div>

                      {!canEquip && (
                        <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
                          {tl(lang, 'Remove one political card from this colony to open space.', 'Retire uma carta política desta colônia para abrir espaço.')}
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
