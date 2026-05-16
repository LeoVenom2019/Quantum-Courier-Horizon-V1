'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Trees, 
  Factory, 
  School, 
  Music, 
  Shield, 
  Utensils, 
  Bot, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Sparkles,
  LockKeyhole,
  BadgeCheck,
  Activity,
  Gamepad2,
  X
} from 'lucide-react';
import { GameStorage } from '@/lib/game-storage';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import {
  COLONY_CARD_CATALOG,
  DEFAULT_COLONY_SECTORS,
  DEFAULT_OWNED_COLONY_CARD_IDS,
  SECTOR_CONFIG,
  ColonyCard,
  ColonyCardSlot,
  ColonySectorId,
  getCardById,
  getCardClass,
  getCardStyle,
  getPoliticalEffects,
  isPoliticalCard,
} from '@/lib/colony-cards';

// --- Types ---

export type ConstructionType = 'forest' | 'factory' | 'school' | 'culture' | 'defense' | 'restaurant';
type ColonySupplyId = 'materials' | 'biomass' | 'tech' | 'defense';
type ColonySupplies = Record<ColonySupplyId, number>;

export interface Construction {
  id: string;
  type: ConstructionType;
  level: number;
  progress: number; // 0 to 100
  assignedConstructors: number;
  isComplete: boolean;
  order: number; // Track which one was built first
}

export interface Colony {
  id: string;
  name: string;
  population: number;
  maxPopulation: number;
  constructors: number; // Total available constructors
  constructions: Construction[];
  sectors: Record<ColonySectorId, number>;
  equippedCards: Partial<Record<ColonyCardSlot, string>>;
  isHabitable: boolean;
  age: number; // Years passed
}

export interface ColonySystemProps {
  language: 'en' | 'pt';
  onAddYear: (years: number) => void;
  onTabStatusChange: (isOpen: boolean) => void;
  earthPopulation: number;
  setEarthPopulation: React.Dispatch<React.SetStateAction<number>>;
  colonies: Colony[];
  setColonies: React.Dispatch<React.SetStateAction<Colony[]>>;
  historyStats?: Record<string, any>;
  unlockedAchievements?: string[];
  playSfx?: (type: string, config?: any) => void;
  onBuildingComplete?: (type: ConstructionType, level: number) => void;
  onAllocate10k?: () => void;
}

// --- Configuration ---

const CONSTRUCTION_CONFIG: Record<ConstructionType, { 
  label: Record<'en' | 'pt', string>, 
  icon: any, 
  maxUnits: number,
  baseTime: number, // Base seconds at 1 constructor
  color: string,
  shadowColor: string
}> = {
  forest: { 
    label: { en: 'Natural Forests', pt: 'Florestas Naturais' }, 
    icon: Trees, 
    maxUnits: 10, 
    baseTime: 400,
    color: 'emerald',
    shadowColor: 'rgba(16, 185, 129, 0.5)'
  },
  factory: { 
    label: { en: 'General Factories', pt: 'Fábricas Gerais' }, 
    icon: Factory, 
    maxUnits: 10, 
    baseTime: 600,
    color: 'zinc',
    shadowColor: 'rgba(161, 161, 170, 0.5)'
  },
  school: { 
    label: { en: 'Schools', pt: 'Escolas' }, 
    icon: School, 
    maxUnits: 10, 
    baseTime: 500,
    color: 'yellow',
    shadowColor: 'rgba(234, 179, 8, 0.5)'
  },
  culture: { 
    label: { en: 'Cultural Spaces', pt: 'Espaço Cultural' }, 
    icon: Music, 
    maxUnits: 10, 
    baseTime: 550,
    color: 'blue',
    shadowColor: 'rgba(59, 130, 246, 0.5)'
  },
  defense: { 
    label: { en: 'Public Defense', pt: 'Defensoria Pública' }, 
    icon: Shield, 
    maxUnits: 10, 
    baseTime: 700,
    color: 'red',
    shadowColor: 'rgba(239, 68, 68, 0.5)'
  },
  restaurant: { 
    label: { en: 'Restaurants', pt: 'Restaurantes' }, 
    icon: Utensils, 
    maxUnits: 10, 
    baseTime: 450,
    color: 'restaurant-mix',
    shadowColor: 'rgba(16, 185, 129, 0.5)'
  },
};

const INITIAL_CONSTRUCTORS = 500;
const INITIAL_POP_CAPACITY = 10000;

const DEFAULT_COLONY_SUPPLIES: ColonySupplies = {
  materials: 0,
  biomass: 0,
  tech: 0,
  defense: 0,
};

const SUPPLY_CONFIG: Record<ColonySupplyId, {
  label: Record<'en' | 'pt', string>;
  color: string;
  border: string;
}> = {
  materials: { label: { en: 'Materials', pt: 'Materiais' }, color: 'text-zinc-200', border: 'border-zinc-400/30 bg-zinc-400/10' },
  biomass: { label: { en: 'Biomass', pt: 'Biomassa' }, color: 'text-emerald-300', border: 'border-emerald-400/30 bg-emerald-400/10' },
  tech: { label: { en: 'Tech Parts', pt: 'Peças Tec.' }, color: 'text-cyan-300', border: 'border-cyan-400/30 bg-cyan-400/10' },
  defense: { label: { en: 'Defense Cores', pt: 'Núcleos Def.' }, color: 'text-red-300', border: 'border-red-400/30 bg-red-400/10' },
};

const CONSTRUCTION_SUPPLY_COST: Record<ConstructionType, Partial<ColonySupplies>> = {
  forest: { biomass: 4, materials: 2 },
  factory: { materials: 6, tech: 2 },
  school: { materials: 4, tech: 3 },
  culture: { materials: 3, biomass: 2, tech: 2 },
  defense: { materials: 4, tech: 2, defense: 3 },
  restaurant: { biomass: 5, materials: 2 },
};

const canPaySupplies = (stock: ColonySupplies, cost: Partial<ColonySupplies>, batches = 1) => (
  (Object.entries(cost) as Array<[ColonySupplyId, number]>).every(([key, value]) => stock[key] >= value * batches)
);

const getAffordableBatches = (stock: ColonySupplies, cost: Partial<ColonySupplies>, requestedBatches: number) => {
  const limits = (Object.entries(cost) as Array<[ColonySupplyId, number]>)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => Math.floor(stock[key] / value));

  return Math.max(0, Math.min(requestedBatches, ...limits));
};

const applySupplyDelta = (stock: ColonySupplies, delta: Partial<ColonySupplies>, multiplier = 1): ColonySupplies => {
  const next = { ...stock };
  (Object.entries(delta) as Array<[ColonySupplyId, number]>).forEach(([key, value]) => {
    next[key] = Math.max(0, next[key] + value * multiplier);
  });
  return next;
};

const createInitialConstructions = () => (
  (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).map((type, idx) => ({
    id: `const-${type}`,
    type,
    level: 0,
    progress: 0,
    assignedConstructors: 0,
    isComplete: false,
    order: idx,
  }))
);

const COLONY_BLUEPRINTS: Array<{
  id: string;
  name: Record<'en' | 'pt', string>;
  sectors: Record<ColonySectorId, number>;
}> = [
  {
    id: 'colony-1',
    name: { en: 'Alpha Colony', pt: 'Colônia Alpha' },
    sectors: DEFAULT_COLONY_SECTORS,
  },
  {
    id: 'colony-2',
    name: { en: 'Colony B (Temporary)', pt: 'Colônia B (Provisório)' },
    sectors: { happiness: 42, health: 44, economy: 52, security: 48, technology: 38, culture: 36 },
  },
  {
    id: 'colony-3',
    name: { en: 'Colony C (Temporary)', pt: 'Colônia C (Provisório)' },
    sectors: { happiness: 34, health: 50, economy: 40, security: 56, technology: 46, culture: 42 },
  },
  {
    id: 'colony-4',
    name: { en: 'Colony D (Temporary)', pt: 'Colônia D (Provisório)' },
    sectors: { happiness: 48, health: 36, economy: 44, security: 40, technology: 58, culture: 50 },
  },
];

const createColonyFromBlueprint = (blueprint: typeof COLONY_BLUEPRINTS[number], language: 'en' | 'pt'): Colony => ({
  id: blueprint.id,
  name: blueprint.name[language],
  population: 0,
  maxPopulation: INITIAL_POP_CAPACITY,
  constructors: INITIAL_CONSTRUCTORS,
  sectors: blueprint.sectors,
  equippedCards: {},
  constructions: createInitialConstructions(),
  isHabitable: false,
  age: 0,
});

export const cleanColoniesData = (data: any, language: 'en' | 'pt'): Colony[] => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return COLONY_BLUEPRINTS.map(blueprint => createColonyFromBlueprint(blueprint, language));
  }

  const cleaned = data.map((col: Colony) => {
    const uniqueTypes = new Set();
    const cleanConstructions = (col.constructions || []).filter(c => {
      if (CONSTRUCTION_CONFIG[c.type] && !uniqueTypes.has(c.type)) {
        uniqueTypes.add(c.type);
        return true;
      }
      return false;
    }).sort((a, b) => {
      const types = Object.keys(CONSTRUCTION_CONFIG);
      return types.indexOf(a.type) - types.indexOf(b.type);
    });
    
    // Ensure all 6 types are present
    const existingTypes = new Set(cleanConstructions.map(c => c.type));
    (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).forEach((type, idx) => {
       if (!existingTypes.has(type)) {
          cleanConstructions.push({
             id: `const-${type}`, // Stable ID
             type,
             level: 0,
             progress: 0,
             assignedConstructors: 0,
             isComplete: false,
             order: idx
          });
       }
    });

    // Final fix: Ensure isComplete reflects level >= 10
    const finalConstructions = cleanConstructions.map(c => ({
      ...c,
      isComplete: c.level >= 10,
      assignedConstructors: c.level >= 10 ? 0 : c.assignedConstructors
    }));

    const sectors = {
      ...DEFAULT_COLONY_SECTORS,
      ...(col.sectors || {}),
    };

    return {
      ...col,
      sectors,
      equippedCards: col.equippedCards || {},
      constructions: finalConstructions.sort((a, b) => a.order - b.order),
    };
  });

  const existingIds = new Set(cleaned.map(col => col.id));
  COLONY_BLUEPRINTS.forEach(blueprint => {
    if (!existingIds.has(blueprint.id)) {
      cleaned.push(createColonyFromBlueprint(blueprint, language));
    }
  });

  return cleaned.sort((a, b) => {
    const orderA = COLONY_BLUEPRINTS.findIndex(blueprint => blueprint.id === a.id);
    const orderB = COLONY_BLUEPRINTS.findIndex(blueprint => blueprint.id === b.id);
    return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
  });
};

const RARITY_LABEL: Record<string, Record<'en' | 'pt', string>> = {
  common: { en: 'Common', pt: 'Comum' },
  rare: { en: 'Rare', pt: 'Rara' },
  epic: { en: 'Epic', pt: 'Épica' },
  legendary: { en: 'Legendary', pt: 'Lendária' },
};

const PanelHeader = ({
  eyebrow,
  title,
  icon: Icon,
  tone = 'text-emerald-300',
}: {
  eyebrow: string;
  title: string;
  icon: any;
  tone?: string;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className={`text-[10px] font-mono uppercase tracking-[0.28em] ${tone}`}>{eyebrow}</p>
      <h4 className="text-lg font-orbitron font-black text-white uppercase tracking-tight">{title}</h4>
    </div>
    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
      <Icon size={16} className={tone} />
    </div>
  </div>
);

const CardEffectPills = ({ card, language }: { card: ColonyCard; language: 'en' | 'pt' }) => (
  <div className="mt-3 flex flex-wrap gap-1.5">
    {getPoliticalEffects(card).map(effect => (
      <span
        key={`${card.id}-${effect.sector}`}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
          effect.value >= 0
            ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10'
            : 'border-red-400/30 text-red-300 bg-red-400/10'
        }`}
      >
        {effect.value > 0 ? '+' : ''}{effect.value} {SECTOR_CONFIG[effect.sector].label[language]}
      </span>
    ))}
  </div>
);

const ColonyCardView = ({
  card,
  language,
  onClick,
  isEquipped = false,
  actionLabel,
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  onClick?: () => void;
  isEquipped?: boolean;
  actionLabel?: string;
}) => {
  const content = (
    <>
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover/card:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.16),transparent_38%)]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[9px] text-zinc-300 font-mono uppercase tracking-widest">
              {RARITY_LABEL[card.rarity]?.[language] || card.rarity}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-zinc-400 font-mono uppercase tracking-widest">
              {card.slot}
            </span>
          </div>
          <h5 className="text-sm font-orbitron font-black text-white uppercase leading-tight">{card.name[language]}</h5>
          <p className="mt-1 text-[11px] text-zinc-400 leading-snug">{card.lore[language]}</p>
        </div>
        {isEquipped ? (
          <BadgeCheck size={18} className="shrink-0 text-emerald-300" />
        ) : (
          <Sparkles size={18} className="shrink-0 text-white/40" />
        )}
      </div>
      <div className="relative z-10">
        <CardEffectPills card={card} language={language} />
        {actionLabel && (
          <p className="mt-3 text-[10px] font-orbitron font-black uppercase tracking-[0.22em] text-white/70">{actionLabel}</p>
        )}
      </div>
    </>
  );

  const className = `group/card relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all ${getCardStyle(card.rarity, getCardClass(card))} ${
    onClick ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
  } ${isEquipped ? 'ring-1 ring-emerald-300/70' : ''}`;

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};

const ClaimCardView = ({
  card,
  language,
  requirement,
  onClaim,
  tone,
}: {
  card: ColonyCard;
  language: 'en' | 'pt';
  requirement: { met: boolean; label: string };
  onClaim: () => void;
  tone: 'emerald' | 'cyan';
}) => {
  const enabledClass = tone === 'emerald'
    ? 'bg-emerald-400 text-black hover:bg-emerald-300'
    : 'bg-cyan-300 text-black hover:bg-cyan-200';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-3 ${requirement.met ? getCardStyle(card.rarity, getCardClass(card)) : 'border-zinc-800 bg-black/30 opacity-80'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {requirement.met ? <Sparkles size={14} className="text-emerald-300" /> : <LockKeyhole size={14} className="text-zinc-600" />}
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest">{RARITY_LABEL[card.rarity]?.[language] || card.rarity}</span>
          </div>
          <h5 className="text-sm font-orbitron font-black text-white uppercase leading-tight">{card.name[language]}</h5>
          <p className="mt-1 text-[11px] text-zinc-400 leading-snug">{card.role[language]}</p>
          <p className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${requirement.met ? 'text-emerald-300' : 'text-zinc-500'}`}>
            {requirement.label}
          </p>
        </div>
        <button
          onClick={onClaim}
          disabled={!requirement.met}
          className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-orbitron font-black uppercase tracking-widest transition-all ${
            requirement.met ? enabledClass : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {requirement.met ? (language === 'pt' ? 'Reivindicar' : 'Claim') : (language === 'pt' ? 'Bloqueada' : 'Locked')}
        </button>
      </div>
    </div>
  );
};

const AcquisitionEventOverlay = ({
  card,
  language,
  onClose,
}: {
  card: ColonyCard | null;
  language: 'en' | 'pt';
  onClose: () => void;
}) => {
  if (!card) return null;

  const arcade = card.unlocksArcadeId
    ? MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId)
    : null;

  const rarityTone: Record<string, string> = {
    common: 'from-zinc-300/20 via-zinc-950 to-zinc-900',
    rare: 'from-cyan-300/25 via-zinc-950 to-blue-950/70',
    epic: 'from-violet-300/25 via-zinc-950 to-fuchsia-950/70',
    legendary: 'from-amber-300/30 via-zinc-950 to-emerald-950/70',
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -10 }}
        className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br ${rarityTone[card.rarity]} p-6 shadow-[0_0_80px_rgba(16,185,129,0.18)]`}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_45%)]" />
        <motion.div
          className="absolute -inset-24 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.35), transparent, rgba(16,185,129,0.25), transparent)',
          }}
        />

        <div className="relative z-10 text-center">
          <p className="text-[10px] text-emerald-300 font-mono uppercase tracking-[0.45em]">
            {language === 'pt' ? 'Carta adquirida' : 'Card acquired'}
          </p>
          <h3 className="mt-2 text-3xl font-orbitron font-black text-white uppercase tracking-tight">
            {RARITY_LABEL[card.rarity]?.[language] || card.rarity}
          </h3>
        </div>

        <div className="relative z-10 my-6">
          <ColonyCardView card={card} language={language} />
        </div>

        {arcade && (
          <div className="relative z-10 mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-center">
            <p className="text-[10px] text-cyan-200 font-mono uppercase tracking-[0.32em]">
              {language === 'pt' ? 'Novo Fliperama Desbloqueado' : 'New Arcade Unlocked'}
            </p>
            <p className="mt-2 text-xl font-orbitron font-black text-white uppercase">
              {arcade.name[language]}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="relative z-10 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-black font-orbitron font-black uppercase tracking-[0.24em] hover:bg-emerald-300 transition-all"
        >
          {language === 'pt' ? 'Registrar no Conselho' : 'Register in Council'}
        </button>
      </motion.div>
    </div>
  );
};

const CardDetailOverlay = ({
  selected,
  language,
  onClose,
  onConfirm,
}: {
  selected: { card: ColonyCard; action: 'equip' | 'remove'; slot?: ColonyCardSlot; blockedBy?: string } | null;
  language: 'en' | 'pt';
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!selected) return null;

  const { card, action } = selected;
  const arcade = card.unlocksArcadeId
    ? MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId)
    : null;

  const confirmLabel = action === 'remove'
    ? (language === 'pt' ? 'Retirar carta' : 'Remove card')
    : (language === 'pt' ? 'Equipar carta' : 'Equip card');
  const isBlocked = action === 'equip' && Boolean(selected.blockedBy);

  return (
    <div className="fixed inset-0 z-[135] flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        className={`relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 shadow-[0_0_80px_rgba(34,211,238,0.12)] ${getCardStyle(card.rarity, getCardClass(card))}`}
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.18),transparent_30%)]" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 p-2 text-zinc-300 transition-all hover:border-white/25 hover:text-white"
          aria-label={language === 'pt' ? 'Fechar carta' : 'Close card'}
        >
          <X size={18} />
        </button>

        <div className="relative z-10 grid gap-5 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-7">
          <div className="flex items-center">
            <ColonyCardView card={card} language={language} isEquipped={action === 'remove'} />
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="text-[10px] text-cyan-200 font-mono uppercase tracking-[0.42em]">
                {language === 'pt' ? 'Dossiê do Conselho' : 'Council Dossier'}
              </p>
              <h3 className="mt-2 text-3xl font-orbitron font-black text-white uppercase tracking-tight">
                {card.name[language]}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                  {RARITY_LABEL[card.rarity]?.[language] || card.rarity}
                </span>
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                  {card.slot}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-200">
                {card.role[language]}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {card.lore[language]}
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                  {language === 'pt' ? 'Impacto direto' : 'Direct impact'}
                </p>
                <CardEffectPills card={card} language={language} />
              </div>

              {arcade && (
                <div className="mt-3 rounded-2xl border border-violet-300/30 bg-violet-300/10 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-violet-200">
                    {language === 'pt' ? 'Fliperama vinculado' : 'Linked arcade'}
                  </p>
                  <p className="mt-2 text-lg font-orbitron font-black uppercase text-white">
                    {arcade.name[language]}
                  </p>
                </div>
              )}

              {isBlocked && (
                <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-200">
                    {language === 'pt' ? 'Slot ocupado' : 'Slot occupied'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-200">
                    {language === 'pt'
                      ? `Retire "${selected.blockedBy}" antes de equipar uma nova carta neste slot.`
                      : `Remove "${selected.blockedBy}" before equipping a new card in this slot.`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onConfirm}
                disabled={isBlocked}
                className={`flex-1 rounded-2xl px-5 py-4 text-sm font-orbitron font-black uppercase tracking-[0.22em] transition-all ${
                  isBlocked
                    ? 'cursor-not-allowed border border-zinc-700 bg-zinc-900 text-zinc-600'
                    : action === 'remove'
                    ? 'border border-red-300/35 bg-red-400/15 text-red-100 hover:bg-red-400/25'
                    : 'bg-emerald-400 text-black hover:bg-emerald-300'
                }`}
              >
                {isBlocked ? (language === 'pt' ? 'Retire a carta atual' : 'Remove current card') : confirmLabel}
              </button>
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm font-orbitron font-black uppercase tracking-[0.22em] text-zinc-300 transition-all hover:border-white/25 hover:text-white"
              >
                {language === 'pt' ? 'Voltar' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Component ---

export const ColonySystem: React.FC<ColonySystemProps> = ({ 
  language, 
  onAddYear, 
  onTabStatusChange,
  earthPopulation,
  setEarthPopulation,
  colonies,
  setColonies,
  historyStats = {},
  unlockedAchievements = [],
  playSfx,
  onBuildingComplete,
  onAllocate10k
}) => {
  const [activeColonyId, setActiveColonyId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'colony' | 'searches'>('colony');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirmAllocate, setShowConfirmAllocate] = useState(false);
  const [colonySupplies, setColonySupplies] = useState<ColonySupplies>(DEFAULT_COLONY_SUPPLIES);
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);
  const [managementPanel, setManagementPanel] = useState<'status' | 'council' | 'claims'>('status');
  const [cardEvent, setCardEvent] = useState<ColonyCard | null>(null);
  const [cardFeedback, setCardFeedback] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ card: ColonyCard; action: 'equip' | 'remove'; slot?: ColonyCardSlot; blockedBy?: string } | null>(null);
  const colonySuppliesRef = useRef<ColonySupplies>(DEFAULT_COLONY_SUPPLIES);
  const lastBuildingLevelsRef = useRef<Record<string, Record<string, number>>>({});

  const t = (en: string, pt: string) => language === 'pt' ? pt : en;

  // Load state
  useEffect(() => {
    if (colonies.length > 0 && !activeColonyId) {
      setActiveColonyId(colonies[0].id);
    }
    setIsLoaded(true);
    onTabStatusChange(true);
    return () => onTabStatusChange(false);
  }, [colonies, activeColonyId, onTabStatusChange]);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      if (Array.isArray(saved) && saved.length > 0) {
        setOwnedCardIds(saved.filter(id => COLONY_CARD_CATALOG.some(card => card.id === id)));
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    GameStorage.load('colony_supplies_data').then(saved => {
      if (!mounted) return;
      if (saved && typeof saved === 'object') {
        setColonySupplies({
          ...DEFAULT_COLONY_SUPPLIES,
          ...saved,
        });
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
    GameStorage.save(colonySupplies, 'colony_supplies_data');
  }, [colonySupplies, isLoaded]);

  useEffect(() => {
    colonySuppliesRef.current = colonySupplies;
  }, [colonySupplies]);

  useEffect(() => {
    if (!cardFeedback) return;
    const timer = window.setTimeout(() => setCardFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [cardFeedback]);

  // Remove local growth logic to centralize it in GameDashboard
  // (Removed calculateGrowth and its useEffect)

  // Handle Year Addition and Building Completion on Level Up
  useEffect(() => {
    if (!isLoaded) return;
    
    let totalYearsToAdd = 0;
    
    colonies.forEach(colony => {
      const colonyPrevLevels = lastBuildingLevelsRef.current[colony.id] || {};
      const newLevels: Record<string, number> = {};
      
      colony.constructions.forEach(con => {
        const prevLevel = colonyPrevLevels[con.type] || 0;
        if (con.level > prevLevel) {
          // If level increased, notify and count years
          if (prevLevel > 0) { // Don't notify on initial load (level 0 to level X)
            totalYearsToAdd += (con.level - prevLevel);
            // Notify for EACH level gained if multiple
            for (let l = prevLevel + 1; l <= con.level; l++) {
              if (onBuildingComplete) onBuildingComplete(con.type, l);
            }
          }
        }
        newLevels[con.type] = con.level;
      });
      
      lastBuildingLevelsRef.current[colony.id] = newLevels;
    });

    if (totalYearsToAdd > 0) {
      onAddYear(totalYearsToAdd);
    }
  }, [colonies, onAddYear, onBuildingComplete, isLoaded]);

  const activeColony = useMemo(() => 
    colonies.find(c => c.id === activeColonyId) || null
  , [colonies, activeColonyId]);

  const ownedCards = useMemo(() =>
    ownedCardIds
      .map(id => getCardById(id))
      .filter(Boolean) as ColonyCard[]
  , [ownedCardIds]);

  const equippedCards = useMemo(() => {
    if (!activeColony) return [];
    return (Object.values(activeColony.equippedCards || {})
      .map(id => getCardById(id))
      .filter(Boolean) as ColonyCard[]);
  }, [activeColony]);

  const effectiveSectors = useMemo(() => {
    if (!activeColony) return DEFAULT_COLONY_SECTORS;
    const next = { ...DEFAULT_COLONY_SECTORS, ...(activeColony.sectors || {}) };
    equippedCards.forEach(card => {
      if (!isPoliticalCard(card)) return;
      getPoliticalEffects(card).forEach(effect => {
        next[effect.sector] = Math.min(100, Math.max(0, next[effect.sector] + effect.value));
      });
    });
    return next;
  }, [activeColony, equippedCards]);

  // Construction Progress Logic
  useEffect(() => {
    if (!isLoaded || !activeColonyId) return;

    const interval = setInterval(() => {
      setColonies(prev => {
        const activeIdx = prev.findIndex(c => c.id === activeColonyId);
        if (activeIdx === -1) return prev;

        const colony = prev[activeIdx];
        let hasChanges = false;

        const updatedConstructions = colony.constructions.map(con => {
          // If already level 10, ensure stopped and zeroed
          if (con.level >= 10) {
             if (con.assignedConstructors > 0 || !con.isComplete) {
               hasChanges = true;
               return { ...con, assignedConstructors: 0, isComplete: true, progress: 100 };
             }
             return con;
          }

          // If no robots, no progress
          if (con.assignedConstructors === 0) return con;

          const config = CONSTRUCTION_CONFIG[con.type];
          // Progress speed: 100% / baseTime * (constructors / baseFactor)
          // Base factor is 10 for balancing
          const tickSeconds = 1;
          const speedFactor = con.assignedConstructors / 10; 
          const increment = (100 / config.baseTime) * speedFactor * tickSeconds;
          
          const newProgress = Math.min(100, con.progress + increment);
          const isNowAtLevelComplete = newProgress >= 100;

          if (isNowAtLevelComplete || newProgress !== con.progress) {
            hasChanges = true;
          }

          if (isNowAtLevelComplete) {
            const nextLevel = con.level + 1;
            return {
              ...con,
              progress: 0,
              level: nextLevel,
              assignedConstructors: 0, // Liberação automática ao concluir nível
              isComplete: nextLevel >= 10 
            };
          }

          return {
            ...con,
            progress: newProgress
          };
        });

        if (!hasChanges) return prev;


        // Check habitability: ALL 10 of EACH
        const allMaxed = updatedConstructions.every(c => c.level === 10);
        const isHabitable = allMaxed;

        const updatedColonies = [...prev];
        updatedColonies[activeIdx] = {
          ...colony,
          constructions: updatedConstructions,
          isHabitable
        };

        return updatedColonies;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, activeColonyId]);

  // Actions
  const equipCard = (card: ColonyCard): boolean => {
    if (!isPoliticalCard(card)) return false;
    if (!activeColonyId) return false;
    const occupiedCardId = activeColony?.equippedCards?.[card.slot];
    if (occupiedCardId && occupiedCardId !== card.id) {
      setCardFeedback(t('Remove the equipped card first', 'Retire a carta equipada primeiro'));
      return false;
    }

    setColonies(prev => prev.map(colony => {
      if (colony.id !== activeColonyId) return colony;

      const equippedCards = { ...(colony.equippedCards || {}) };
      Object.keys(equippedCards).forEach(slot => {
        if (equippedCards[slot as ColonyCardSlot] === card.id) {
          delete equippedCards[slot as ColonyCardSlot];
        }
      });
      equippedCards[card.slot] = card.id;

      return { ...colony, equippedCards };
    }));
    playSfx?.('equip_card');
    setCardFeedback(t('Card equipped', 'Carta equipada'));
    return true;
  };

  const unequipCard = (slot: ColonyCardSlot) => {
    if (!activeColonyId) return;
    setColonies(prev => prev.map(colony => {
      if (colony.id !== activeColonyId) return colony;
      const equippedCards = { ...(colony.equippedCards || {}) };
      delete equippedCards[slot];
      return { ...colony, equippedCards };
    }));
    playSfx?.('unequip_card');
    setCardFeedback(t('Card removed', 'Carta retirada'));
  };

  const openCardDetails = (card: ColonyCard, action: 'equip' | 'remove', slot?: ColonyCardSlot) => {
    if (!isPoliticalCard(card)) return;
    const occupiedCardId = action === 'equip' ? activeColony?.equippedCards?.[card.slot] : undefined;
    const blockedBy = occupiedCardId && occupiedCardId !== card.id
      ? getCardById(occupiedCardId)?.name[language]
      : undefined;

    setSelectedCard({ card, action, slot, blockedBy });
    playSfx?.('view_card');
  };

  const confirmSelectedCardAction = () => {
    if (!selectedCard) return;
    if (selectedCard.action === 'remove' && selectedCard.slot) {
      unequipCard(selectedCard.slot);
      setSelectedCard(null);
    } else {
      const equipped = equipCard(selectedCard.card);
      if (equipped) setSelectedCard(null);
    }
  };

  const getCardUnlockRequirement = (card: ColonyCard) => {
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
        return {
          met: (solarStats.manualDeliveries || 0) >= 50 || unlockedAchievements.includes('first_delivery'),
          label: t('Chapter 1: 50 manual deliveries', 'Capítulo 1: 50 entregas manuais'),
        };
      case 'legacy-interstellar-envoy':
        return {
          met: (interstellarStats.missionsCompleted || 0) >= 25 || totalStats.missionsCompleted >= 75,
          label: t('Chapter 2: 25 missions completed', 'Capítulo 2: 25 missões concluídas'),
        };
      case 'legacy-void-veteran':
        return {
          met: (voidStats.battlesWon || 0) >= 20 || totalStats.battlesWon >= 80,
          label: t('Chapter 3: 20 battles won', 'Capítulo 3: 20 batalhas vencidas'),
        };
      case 'legacy-perfect-route-planner':
        return {
          met: totalStats.perfectDeliveries >= 30,
          label: t('Campaign: 30 perfect deliveries', 'Campanha: 30 entregas perfeitas'),
        };
      case 'legacy-civic-archive':
        return {
          met: totalStats.qcTotalAcquired >= 1000000000,
          label: t('Campaign: 1B total QC acquired', 'Campanha: 1B de QC total adquirido'),
        };
      case 'arcade-ruptura-estelar':
        return {
          met: effectiveSectors.security >= 48,
          label: t('Security 48+', 'Segurança 48+'),
        };
      case 'arcade-danger-zoom-zones':
        return {
          met: effectiveSectors.technology >= 55,
          label: t('Technology 55+', 'Tecnologia 55+'),
        };
      case 'arcade-grid-collapse':
        return {
          met: effectiveSectors.technology >= 60 && effectiveSectors.economy >= 45,
          label: t('Technology 60+ and Economy 45+', 'Tecnologia 60+ e Economia 45+'),
        };
      case 'arcade-robot-runner':
        return {
          met: effectiveSectors.happiness >= 60 && effectiveSectors.technology >= 60,
          label: t('Happiness 60+ and Technology 60+', 'Felicidade 60+ e Tecnologia 60+'),
        };
      case 'arcade-neo-catcher':
        return {
          met: effectiveSectors.culture >= 60 && effectiveSectors.happiness >= 65,
          label: t('Culture 60+ and Happiness 65+', 'Cultura 60+ e Felicidade 65+'),
        };
      default:
        return {
          met: false,
          label: t('New Earth protocol', 'Protocolo Nova Terra'),
        };
    }
  };

  const claimCard = (cardId: string) => {
    const card = getCardById(cardId);
    if (!card || ownedCardIds.includes(cardId)) return;
    const requirement = getCardUnlockRequirement(card);
    if (!requirement.met) return;
    setOwnedCardIds(prev => [...prev, cardId]);
    setManagementPanel('council');
    setCardEvent(card);
    playSfx?.('claim_card');
  };

  const startConstruction = (type: ConstructionType) => {
    if (!activeColony) return;

    // Rule: Must build 1 of each type first before free construction
    const typesBuilt = new Set(activeColony.constructions.filter(c => c.isComplete).map(c => c.type));
    const allTypes = Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[];
    const hasAtLeastOneOfEach = allTypes.every(t => typesBuilt.has(t));

    if (!hasAtLeastOneOfEach) {
      const existing = activeColony.constructions.find(c => c.type === type);
      if (existing) return;
    }

    // Limit max units
    const count = activeColony.constructions.filter(c => c.type === type).length;
    if (count >= CONSTRUCTION_CONFIG[type].maxUnits) return;

    const newConstruction: Construction = {
      id: `const-${Date.now()}`,
      type,
      level: 1,
      progress: 0,
      assignedConstructors: 0,
      isComplete: false,
      order: activeColony.constructions.length
    };

    setColonies(prev => prev.map(c => 
      c.id === activeColonyId 
        ? { ...c, constructions: [...c.constructions, newConstruction] }
        : c
    ));
  };

  const updateConstructors = (id: string, delta: number) => {
    if (!activeColonyId) return;
    
    // 1. Encontrar a colônia e construção no estado atual (prop) para cálculos prévios
    const colony = colonies.find(c => c.id === activeColonyId);
    if (!colony) return;
    
    const construction = colony.constructions.find(con => con.id === id);
    if (!construction || construction.level >= 10) return;

    const totalAssigned = colony.constructions.reduce((sum, con) => sum + con.assignedConstructors, 0);
    const available = colony.constructors - totalAssigned;

    let finalDelta = delta;
    
    // Se for adicionar, respeitar limite disponível e suprimentos
    if (finalDelta > 0) {
      finalDelta = Math.min(finalDelta, available);
      const requestedBatches = Math.floor(finalDelta / 50);
      const supplyCost = CONSTRUCTION_SUPPLY_COST[construction.type];
      
      // Usar a Ref ou o Estado atual para checar suprimentos
      const currentSupplies = colonySuppliesRef.current;
      const affordableBatches = getAffordableBatches(currentSupplies, supplyCost, requestedBatches);

      if (affordableBatches <= 0) {
        setCardFeedback(t('Insufficient supplies', 'Suprimentos insuficientes'));
        return;
      }

      finalDelta = Math.min(finalDelta, affordableBatches * 50);
      
      // Atualizar suprimentos FORA do setColonies
      const nextSupplies = applySupplyDelta(currentSupplies, supplyCost, -affordableBatches);
      colonySuppliesRef.current = nextSupplies;
      setColonySupplies(nextSupplies);
    } 
    // Se for remover, não pode remover mais do que tem alocado
    else if (finalDelta < 0) {
      finalDelta = Math.max(finalDelta, -construction.assignedConstructors);
    }

    if (finalDelta === 0) return;

    // 2. Agora atualizar as colônias apenas com o delta já validado
    setColonies(prev => {
      const activeIdx = prev.findIndex(c => c.id === activeColonyId);
      if (activeIdx === -1) return prev;

      const targetColony = prev[activeIdx];
      const updatedConstructions = targetColony.constructions.map(con => 
        con.id === id ? { ...con, assignedConstructors: con.assignedConstructors + finalDelta } : con
      );

      const next = [...prev];
      next[activeIdx] = { ...targetColony, constructions: updatedConstructions };
      return next;
    });
  };

  const allocatePopulation = (requestedAmount: number) => {
    if (!activeColonyId || !activeColony) return;
    if (!activeColony.isHabitable) return;

    if (earthPopulation <= 0) return;

    const actualAmount = Math.min(requestedAmount, earthPopulation);

    if (actualAmount <= 0) return;

    // Update Earth population (Sequentially, React handles batching)
    setEarthPopulation(prev => Math.max(0, prev - actualAmount));

    // Update Colony population
    setColonies(prevColonies => {
      const activeIdx = prevColonies.findIndex(c => c.id === activeColonyId);
      if (activeIdx === -1) return prevColonies;
      
      const colony = prevColonies[activeIdx];
      const nextColonies = [...prevColonies];
      nextColonies[activeIdx] = {
        ...colony,
        population: colony.population + actualAmount
      };
      
      return nextColonies;
    });
  };

  if (!activeColony) return null;

  const totalAssignedConstructors = activeColony.constructions.reduce((sum, c) => sum + c.assignedConstructors, 0);
  const availableConstructors = activeColony.constructors - totalAssignedConstructors;
  const searchOptions = [
    {
      id: 'land',
      title: t('Land Search', 'Busca por Terra'),
      subtitle: t('Ground Vehicles', 'Veículos Terrestres'),
      description: t(
        'Expeditions across ruined roads, supply depots, and old transit corridors.',
        'Expedições por estradas destruídas, depósitos de suprimentos e antigos corredores de transporte.'
      ),
      tone: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
      icon: Bot,
      rewards: { materials: 18, biomass: 8, tech: 2 } as Partial<ColonySupplies>,
    },
    {
      id: 'sea',
      title: t('Sea Search', 'Busca por Mar'),
      subtitle: t('Aquatic Vehicles', 'Veículos Aquáticos'),
      description: t(
        'Recovered vessels scan coastlines and submerged cargo zones for useful supplies.',
        'Embarcações recuperadas vasculham costas e zonas de carga submersas em busca de suprimentos.'
      ),
      tone: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
      icon: Activity,
      rewards: { biomass: 14, materials: 8, tech: 4 } as Partial<ColonySupplies>,
    },
    {
      id: 'air',
      title: t('Air Defense', 'Defesa Aérea'),
      subtitle: t('Monster Interception', 'Intercepção de Monstros'),
      description: t(
        'Aerial patrols recover defense cores while keeping the sky dangerous.',
        'Patrulhas aéreas recuperam núcleos de defesa enquanto mantêm o céu perigoso.'
      ),
      tone: 'text-red-300 border-red-400/40 bg-red-400/10',
      icon: Shield,
      rewards: { defense: 10, tech: 5, materials: 4 } as Partial<ColonySupplies>,
    },
  ];

  const runSearch = (rewards: Partial<ColonySupplies>, title: string) => {
    const nextSupplies = applySupplyDelta(colonySuppliesRef.current, rewards);
    colonySuppliesRef.current = nextSupplies;
    setColonySupplies(nextSupplies);
    setCardFeedback(t(`${title} completed`, `${title} concluída`));
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden">
      <AnimatePresence>
        {cardEvent && (
          <AcquisitionEventOverlay
            card={cardEvent}
            language={language}
            onClose={() => setCardEvent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailOverlay
            selected={selectedCard}
            language={language}
            onClose={() => setSelectedCard(null)}
            onConfirm={confirmSelectedCardAction}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cardFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className="fixed top-6 left-1/2 z-[120] -translate-x-1/2 rounded-2xl border border-emerald-300/40 bg-zinc-950/90 px-5 py-3 text-sm text-emerald-200 font-orbitron font-black uppercase tracking-[0.22em] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            {cardFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shrink-0 rounded-2xl border border-emerald-400/20 bg-black/40 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300">{t('Chapter 4 Habitat Network', 'Rede Habitacional do Capítulo 4')}</p>
            <h2 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{t('Colonies', 'Colônias')}</h2>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/40 p-1 md:grid-cols-5 xl:w-[820px]">
            {colonies.map(colony => (
              <button
                key={colony.id}
                type="button"
                onClick={() => {
                  setActiveView('colony');
                  setActiveColonyId(colony.id);
                }}
                className={`rounded-xl px-3 py-2 text-[10px] font-orbitron font-black uppercase tracking-widest transition-all ${
                  activeView === 'colony' && activeColonyId === colony.id
                    ? 'bg-emerald-300 text-black shadow-[0_0_18px_rgba(52,211,153,0.22)]'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                {colony.name.replace('Colônia ', '').replace(' Colony', '')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveView('searches')}
              className={`rounded-xl px-3 py-2 text-[10px] font-orbitron font-black uppercase tracking-widest transition-all ${
                activeView === 'searches'
                  ? 'bg-cyan-300 text-black shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              {t('Searches', 'Buscas')}
            </button>
          </div>
        </div>
      </div>

      {activeView === 'colony' ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-4">
          <div className="grid shrink-0 grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-xl border border-blue-400/20 bg-black/45 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-300/70">{t('Active Colony', 'Colônia Ativa')}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className="truncate font-orbitron text-base font-black uppercase text-white">{activeColony.name}</h3>
                <Home className="h-5 w-5 shrink-0 text-blue-300/50" />
              </div>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-black/45 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">{t('Available Constructors', 'Construtores Disponíveis')}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className="font-orbitron text-base font-black text-cyan-300">{availableConstructors} / {activeColony.constructors}</h3>
                <Bot className="h-5 w-5 text-cyan-300/50" />
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-black/45 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">{t('Population', 'População')}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className={`font-orbitron text-base font-black ${activeColony.population > 0 ? 'text-emerald-300' : 'text-zinc-500'}`}>
                  {activeColony.population.toLocaleString()}
                </h3>
                {activeColony.isHabitable ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (showConfirmAllocate) {
                        allocatePopulation(10000);
                        onAllocate10k?.();
                        setShowConfirmAllocate(false);
                      } else {
                        setShowConfirmAllocate(true);
                      }
                    }}
                    disabled={earthPopulation <= 0}
                    className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-orbitron text-[10px] font-black uppercase tracking-widest text-emerald-200 transition-all hover:bg-emerald-400 hover:text-black disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600"
                  >
                    {showConfirmAllocate ? t('Confirm', 'Confirmar') : t('Allocate', 'Alocar')}
                  </button>
                ) : (
                  <Users className="h-5 w-5 text-emerald-300/50" />
                )}
              </div>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-[1.25fr_1fr]">
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
              {(Object.keys(SECTOR_CONFIG) as ColonySectorId[]).map(sectorId => {
                const config = SECTOR_CONFIG[sectorId];
                const value = effectiveSectors[sectorId];
                const baseValue = activeColony.sectors?.[sectorId] ?? DEFAULT_COLONY_SECTORS[sectorId];
                const delta = value - baseValue;
                const isCritical = value < 45;
                return (
                  <div key={sectorId} className="rounded-xl border border-white/10 bg-black/45 px-3 py-2">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <config.icon size={13} className={config.color} />
                        <span className="truncate font-orbitron text-[10px] font-black uppercase tracking-wider text-zinc-300">{config.label[language]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {delta !== 0 && (
                          <span className={`font-mono text-[9px] ${delta > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        <span className={`font-orbitron text-[12px] font-black ${isCritical ? 'text-red-300' : 'text-white'}`}>{value}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${isCritical ? 'bg-red-400' : value >= 70 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['leadership', 'infrastructure', 'culture'] as ColonyCardSlot[]).map(slot => {
                const card = getCardById(activeColony.equippedCards?.[slot]);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => card && openCardDetails(card, 'remove', slot)}
                    className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      card
                        ? `${getCardStyle(card.rarity, getCardClass(card))} hover:scale-[1.01]`
                        : 'border-dashed border-amber-300/25 bg-black/35'
                    }`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),transparent_38%)] opacity-60" />
                    <div className="relative z-10">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-200/70">{slot}</p>
                      <p className={`mt-2 min-h-[32px] font-orbitron text-[12px] font-black uppercase leading-tight ${card ? 'text-white' : 'text-zinc-600'}`}>
                        {card ? card.name[language] : t('Empty slot', 'Slot vazio')}
                      </p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                        {card ? t('Inspect', 'Inspecionar') : t('Equip in Cards tab', 'Equipe na aba Cartas')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between">
            <h4 className="text-base font-orbitron font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              {t('Infrastructure Nodes', 'Nódulos de Infraestrutura')}
            </h4>
            <div className="flex flex-wrap justify-end gap-2">
              {(Object.keys(SUPPLY_CONFIG) as ColonySupplyId[]).map(supplyId => (
                <span
                  key={supplyId}
                  className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${SUPPLY_CONFIG[supplyId].border} ${SUPPLY_CONFIG[supplyId].color}`}
                >
                  {SUPPLY_CONFIG[supplyId].label[language]}: {colonySupplies[supplyId]}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 min-h-0 auto-rows-fr">
            {activeColony.constructions.map((con) => {
              const config = CONSTRUCTION_CONFIG[con.type];
              const isMaxed = con.level >= 10;
              const isWorking = con.assignedConstructors > 0 && !isMaxed;
              const supplyCost = CONSTRUCTION_SUPPLY_COST[con.type];
              const hasSuppliesFor50 = canPaySupplies(colonySupplies, supplyCost, 1);
              const hasSuppliesFor250 = canPaySupplies(colonySupplies, supplyCost, 5);
              const costLabel = (Object.entries(supplyCost) as Array<[ColonySupplyId, number]>)
                .map(([key, value]) => `${SUPPLY_CONFIG[key].label[language]} ${value}`)
                .join(' · ');
              
              // Custom colors mapping
              const colorClasses: Record<string, string> = {
                emerald: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500',
                zinc: 'border-zinc-500/60 shadow-[0_0_20px_rgba(161,161,170,0.15)] hover:border-zinc-400',
                yellow: 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:border-yellow-400',
                blue: 'border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400',
                red: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-400',
                'restaurant-mix': 'border-l-emerald-400/60 border-t-emerald-400/60 border-r-red-400/60 border-b-red-400/60 shadow-[0_0_20px_rgba(16,185,129,0.1),0_0_20px_rgba(239,68,68,0.1)] hover:border-emerald-400'
              };

              const accentColor: Record<string, string> = {
                emerald: 'text-emerald-400 bg-emerald-500/15',
                zinc: 'text-zinc-300 bg-zinc-500/15',
                yellow: 'text-yellow-400 bg-yellow-500/15',
                blue: 'text-blue-400 bg-blue-500/15',
                red: 'text-red-400 bg-red-500/15',
                'restaurant-mix': 'text-emerald-300 bg-gradient-to-br from-emerald-500/15 via-zinc-800 to-red-500/15'
              };

              return (
                <motion.div
                  key={con.id}
                  layout
                  className={`relative p-3 rounded-2xl border-2 bg-black/60 flex flex-col transition-all duration-300 min-h-0 overflow-hidden ${colorClasses[config.color]} ${isMaxed ? 'opacity-90' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${accentColor[config.color]} shadow-inner`}>
                      <config.icon size={18} />
                    </div>
                    <div className="text-right leading-none">
                       <span className="text-[11px] font-orbitron font-bold text-zinc-500 block uppercase mb-1">{t('Units Built', 'Unidade')}</span>
                       <span className="text-xl font-orbitron font-black text-white tracking-widest">{con.level} <span className="text-[11px] text-zinc-600">/ 10</span></span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h5 className="font-orbitron font-bold text-white text-[12px] mb-2 leading-tight uppercase tracking-widest truncate">{config.label[language]}</h5>
                    <p className="mb-2 truncate font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                      {t('Cost / 50:', 'Custo / 50:')} {costLabel}
                    </p>
                    <div className="flex items-center gap-2">
                       <div className={`h-1 flex-1 rounded-full bg-zinc-800/50 overflow-hidden relative border border-white/5`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${isMaxed ? 100 : con.progress}%` }}
                            className={`h-full relative z-10 ${isMaxed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          />
                          {isWorking && (
                            <motion.div
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
                            />
                          )}
                       </div>
                        {!isMaxed && (
                          <span className="text-[11px] font-mono text-zinc-500 w-7 text-right">{Math.floor(con.progress)}%</span>
                        )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {!isMaxed ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[12px] font-orbitron font-bold text-zinc-400 px-1 leading-none uppercase tracking-widest">
                           <span>{t('Robots:', 'Robôs:')}</span>
                           <span className="text-white text-[12px]">{con.assignedConstructors.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => updateConstructors(con.id, -50)}
                             disabled={con.assignedConstructors === 0}
                             className="flex-1 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-500 text-[12px] font-bold transition-colors disabled:opacity-20 border border-white/5"
                           >
                              -50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 50)}
                             disabled={!hasSuppliesFor50 || availableConstructors < 50}
                             className="flex-1 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white font-black text-[12px] uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900/70 disabled:text-zinc-600"
                           >
                              +50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 250)}
                             disabled={!hasSuppliesFor250 || availableConstructors < 50}
                             className="flex-1 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold text-[12px] transition-colors border border-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                           >
                              +250
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-orbitron font-black uppercase tracking-[0.3em] gap-3 relative overflow-hidden group/done">
                         <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                         <CheckCircle2 size={16} className="relative z-10" />
                         <span className="relative z-10">{t('Done', 'Concluído')}</span>
                      </div>
                    )}
                  </div>

                  {isWorking && (
                     <div className="absolute top-2 right-12">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="text-blue-500/40"
                        >
                           <Cpu size={14} />
                        </motion.div>
                     </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-2xl border border-cyan-300/20 bg-zinc-950/70 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">{t('Supply Recon', 'Reconhecimento de Suprimentos')}</p>
              <h3 className="font-orbitron text-xl font-black uppercase tracking-tight text-white">{t('Search Operations', 'Operações de Busca')}</h3>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {(Object.keys(SUPPLY_CONFIG) as ColonySupplyId[]).map(supplyId => (
                <span
                  key={supplyId}
                  className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${SUPPLY_CONFIG[supplyId].border} ${SUPPLY_CONFIG[supplyId].color}`}
                >
                  {SUPPLY_CONFIG[supplyId].label[language]}: {colonySupplies[supplyId]}
                </span>
              ))}
            </div>
          </div>

          <div className="grid h-[calc(100%-70px)] grid-cols-1 gap-4 lg:grid-cols-3">
            {searchOptions.map(option => (
              <div key={option.id} className={`flex min-h-0 flex-col rounded-2xl border p-5 ${option.tone}`}>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-80">{option.subtitle}</p>
                    <h4 className="mt-2 font-orbitron text-xl font-black uppercase leading-tight text-white">{option.title}</h4>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                    <option.icon size={24} />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300">{option.description}</p>

                <div className="mt-auto rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">{t('Recovered Supplies', 'Suprimentos Recuperados')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.entries(option.rewards) as Array<[ColonySupplyId, number]>).map(([key, value]) => (
                      <span
                        key={`${option.id}-${key}`}
                        className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${SUPPLY_CONFIG[key].border} ${SUPPLY_CONFIG[key].color}`}
                      >
                        +{value} {SUPPLY_CONFIG[key].label[language]}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runSearch(option.rewards, option.title)}
                  className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-orbitron text-[12px] font-black uppercase tracking-[0.22em] text-white transition-all hover:border-cyan-300/50 hover:bg-cyan-300 hover:text-black"
                >
                  {t('Start Search', 'Iniciar Busca')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
