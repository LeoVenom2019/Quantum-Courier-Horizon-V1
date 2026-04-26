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
  Cpu
} from 'lucide-react';
import { GameStorage } from '@/lib/game-storage';

// --- Types ---

export type ConstructionType = 'forest' | 'factory' | 'school' | 'culture' | 'defense' | 'restaurant';

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

export const cleanColoniesData = (data: any[], language: 'en' | 'pt'): Colony[] => {
  const t = (en: string, pt: string) => language === 'pt' ? pt : en;

  if (!data || data.length === 0) {
    return [{
      id: 'colony-1',
      name: t('Alpha Colony', 'Colônia Alpha'),
      population: 0,
      maxPopulation: INITIAL_POP_CAPACITY,
      constructors: INITIAL_CONSTRUCTORS,
      constructions: (Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[]).map((type, idx) => ({
        id: `const-${type}`,
        type,
        level: 0,
        progress: 0,
        assignedConstructors: 0,
        isComplete: false,
        order: idx
      })),
      isHabitable: false,
      age: 0
    }];
  }

  return data.map((col: Colony) => {
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

    return { ...col, constructions: finalConstructions.sort((a, b) => a.order - b.order) };
  });
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
  onBuildingComplete,
  onAllocate10k
}) => {
  const [activeColonyId, setActiveColonyId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirmAllocate, setShowConfirmAllocate] = useState(false);
  const lastCompletedCountRef = useRef<Record<string, number>>({});

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

  // Remove local growth logic to centralize it in GameDashboard
  // (Removed calculateGrowth and its useEffect)

  // Handle Year Addition on Construction Level Up
  useEffect(() => {
    if (!isLoaded) return;
    
    let totalYearsToAdd = 0;
    
    colonies.forEach(colony => {
      const currentLevels = colony.constructions.reduce((sum, c) => sum + c.level, 0);
      const prevLevels = lastCompletedCountRef.current[colony.id] || 0;
      
      if (currentLevels > prevLevels) {
        totalYearsToAdd += (currentLevels - prevLevels);
        lastCompletedCountRef.current[colony.id] = currentLevels;
      } else if (currentLevels < prevLevels) {
        // Reset if data changed (e.g. load)
        lastCompletedCountRef.current[colony.id] = currentLevels;
      }
    });

    if (totalYearsToAdd > 0) {
      onAddYear(totalYearsToAdd);
    }
  }, [colonies, onAddYear, isLoaded]);

  const activeColony = useMemo(() => 
    colonies.find(c => c.id === activeColonyId) || null
  , [colonies, activeColonyId]);

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
            if (onBuildingComplete) onBuildingComplete(con.type, nextLevel);
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
  const startConstruction = (type: ConstructionType) => {
    if (!activeColony) return;

    // Rule: Must build 1 of each type first before free construction
    const typesBuilt = new Set(activeColony.constructions.filter(c => c.isComplete).map(c => c.type));
    const allTypes = Object.keys(CONSTRUCTION_CONFIG) as ConstructionType[];
    const hasAtLeastOneOfEach = allTypes.every(t => typesBuilt.has(t));

    // If not each type yet, and this type is already being built or built, check
    if (!hasAtLeastOneOfEach) {
      const existing = activeColony.constructions.find(c => c.type === type);
      if (existing) {
         // Already have one (complete or in progress)
         return; 
      }
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
    setColonies(prev => {
      const activeIdx = prev.findIndex(c => c.id === activeColonyId);
      if (activeIdx === -1) return prev;

      const colony = prev[activeIdx];
      const construction = colony.constructions.find(con => con.id === id);
      
      // Bloqueio se estiver completo ou não existir
      if (!construction || construction.level >= 10) return prev;

      const totalAssigned = colony.constructions.reduce((sum, con) => sum + con.assignedConstructors, 0);
      const available = colony.constructors - totalAssigned;

      let finalDelta = delta;
      
      // Se for adicionar, respeitar limite disponível
      if (finalDelta > 0) {
        finalDelta = Math.min(finalDelta, available);
      } 
      // Se for remover, não pode remover mais do que tem alocado
      else if (finalDelta < 0) {
        finalDelta = Math.max(finalDelta, -construction.assignedConstructors);
      }

      if (finalDelta === 0) return prev;

      const updatedConstructions = colony.constructions.map(con => 
        con.id === id ? { ...con, assignedConstructors: con.assignedConstructors + finalDelta } : con
      );

      const next = [...prev];
      next[activeIdx] = { ...colony, constructions: updatedConstructions };
      return next;
    });
  };

  const allocatePopulation = (requestedAmount: number) => {
    if (!activeColonyId || !activeColony) return;
    if (!activeColony.isHabitable) return;

    // Use a unified update or sequential updates outside of each other
    // Since earthPopulation is a prop, we can't easily get its next value without a ref or functional update
    // But we can trigger setColonies and inside it, use the requestedAmount, 
    // and then call setEarthPopulation with the actual amount that was moved.
    
    setColonies(prevColonies => {
      const activeIdx = prevColonies.findIndex(c => c.id === activeColonyId);
      if (activeIdx === -1) return prevColonies;
      
      const colony = prevColonies[activeIdx];
      const space = colony.maxPopulation - colony.population;
      
      if (space <= 0 || earthPopulation <= 0) return prevColonies;

      let actualAmount = Math.min(requestedAmount, space);
      if (earthPopulation < actualAmount) {
        actualAmount = earthPopulation;
      }

      if (actualAmount <= 0) return prevColonies;

      // Update Earth population (sequentially, React handles batching)
      setEarthPopulation(prev => Math.max(0, prev - actualAmount));

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

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5">
               <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">{t('Active Colony', 'Colônia Ativa')}</p>
               <span className="text-[8px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded font-mono">
                {activeColony.age || 0} {t('Years', 'Anos')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{activeColony.name}</h3>
          </div>
          <Home className="text-blue-400 opacity-50" size={24} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between"
        >
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">{t('Available Constructors', 'Construtores Disponíveis')}</p>
            <h3 className="text-lg font-bold text-blue-400">{availableConstructors} / {activeColony.constructors}</h3>
          </div>
          <Bot className="text-blue-400 opacity-50" size={24} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between"
        >
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">{t('Population', 'População')}</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className={`text-lg font-bold ${activeColony.population > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                {activeColony.population.toLocaleString()} / {activeColony.maxPopulation.toLocaleString()}
              </h3>
              {activeColony.population > 0 && (
                <span className="text-[8px] text-green-500 font-mono flex items-center">
                  <TrendingUp size={8} className="mr-0.5" />
                  {activeColony.age <= 4 ? '5-9%' : activeColony.age <= 8 ? '3-6%' : '6-10%'}
                </span>
              )}
            </div>
          </div>
          <Users className="text-green-400 opacity-50" size={24} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Management Left Panel (Always Visible) */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
          <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <Users size={16} className="text-emerald-400" /> {t('Migration & Growth', 'Migração e Crescimento')}
          </h4>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-zinc-800/50 rounded-2xl bg-black/40 relative overflow-hidden group">
             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             {!activeColony.isHabitable ? (
               <>
                 <div className="p-3 rounded-full bg-red-500/10 text-red-500 mb-2 animate-pulse shrink-0">
                    <Shield size={32} />
                 </div>
                 <h5 className="text-white text-xs font-bold mb-1 shrink-0">{t('Migration Locked', 'Migração Bloqueada')}</h5>
                 
                 <div className="mt-4 w-full space-y-1.5 text-[9px] font-mono text-left">
                    <div className="flex justify-between items-center bg-zinc-900 p-1.5 rounded">
                       <span className="text-zinc-500">{t('Progress:', 'Progresso:')}</span>
                       <span className="text-blue-400">
                          {activeColony.constructions.reduce((sum, c) => sum + c.level, 0)} / 60
                       </span>
                    </div>
                 </div>
               </>
             ) : (
               <>
                 <div className="p-3 rounded-full bg-green-500/10 text-green-500 mb-2 shrink-0">
                    <CheckCircle2 size={32} />
                 </div>
                 <h5 className="text-white text-xs font-bold mb-1 shrink-0">{t('Migration Open', 'Migração Aberta')}</h5>
                 
                  <div className="w-full space-y-1.5 mt-auto">
                    {showConfirmAllocate ? (
                      <div className="bg-black/80 border border-emerald-500/50 rounded-xl p-3 space-y-3 animate-in fade-in zoom-in duration-200">
                        <p className="text-[10px] text-white font-bold leading-tight">
                          {t('Colony ready to receive people: Allocate 10,000 people?', 'Colônia preparada para receber pessoas: Alocar 10.000 pessoas?')}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              allocatePopulation(10000);
                              onAllocate10k?.();
                              setShowConfirmAllocate(false);
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black rounded uppercase transition-all"
                          >
                            {t('Yes', 'Sim')}
                          </button>
                          <button 
                            onClick={() => setShowConfirmAllocate(false)}
                            className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black rounded uppercase transition-all"
                          >
                            {t('No', 'Não')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                         onClick={() => setShowConfirmAllocate(true)}
                         disabled={activeColony.population >= activeColony.maxPopulation || earthPopulation <= 0}
                         className={`w-full py-2.5 text-xs font-orbitron font-black rounded-xl transition-all flex flex-col items-center justify-center uppercase tracking-widest shadow-lg ${
                           activeColony.population >= activeColony.maxPopulation || earthPopulation <= 0
                             ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50' 
                             : 'bg-emerald-600 border border-emerald-400 hover:bg-emerald-500 hover:text-black text-white hover:scale-105 active:scale-95 shadow-emerald-500/20'
                         }`}
                      >
                         <span>{t('Allocate', 'Alocar')}</span>
                         {activeColony.population >= activeColony.maxPopulation && <span className="text-[7px] opacity-70">({t('Colony Full', 'Colônia Cheia')})</span>}
                         {earthPopulation <= 0 && <span className="text-[7px] opacity-70">({t('Earth Empty', 'Terra Vazia')})</span>}
                      </button>
                    )}
                  </div>
               </>
             )}
          </div>
        </div>

        {/* Construction Grid (Always 6 cards in 3xGrid) */}
        <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-orbitron font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              {t('Infrastructure Nodes', 'Nódulos de Infraestrutura')}
            </h4>
            <div className="flex items-center gap-4 text-[10px] font-orbitron font-bold text-zinc-500 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  {t('Process Active', 'Processo Ativo')}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
            {activeColony.constructions.map((con) => {
              const config = CONSTRUCTION_CONFIG[con.type];
              const isMaxed = con.level >= 10;
              const isWorking = con.assignedConstructors > 0 && !isMaxed;
              
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
                  className={`relative p-4 rounded-2xl border-2 bg-black/60 flex flex-col transition-all duration-300 min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] ${colorClasses[config.color]} ${isMaxed ? 'opacity-90' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${accentColor[config.color]} shadow-inner`}>
                      <config.icon size={22} />
                    </div>
                    <div className="text-right leading-none">
                       <span className="text-[10px] font-orbitron font-bold text-zinc-500 block uppercase mb-1">{t('Units Built', 'Unidade')}</span>
                       <span className="text-2xl font-orbitron font-black text-white tracking-widest">{con.level} <span className="text-xs text-zinc-600">/ 10</span></span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-orbitron font-bold text-white text-xs mb-2 leading-tight uppercase tracking-widest truncate">{config.label[language]}</h5>
                    <div className="flex items-center gap-3">
                       <div className={`h-1.5 flex-1 rounded-full bg-zinc-800/50 overflow-hidden relative border border-white/5`}>
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
                         <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{Math.floor(con.progress)}%</span>
                       )}
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    {!isMaxed ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[10px] font-orbitron font-bold text-zinc-400 px-1 leading-none uppercase tracking-widest">
                           <span>{t('Robots:', 'Robôs:')}</span>
                           <span className="text-white text-sm">{con.assignedConstructors.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => updateConstructors(con.id, -50)}
                             disabled={con.assignedConstructors === 0}
                             className="flex-1 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-500 text-[10px] font-bold transition-colors disabled:opacity-20 border border-white/5"
                           >
                              -50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 50)}
                             className="flex-1 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                           >
                              +50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 250)}
                             className="flex-1 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] transition-colors border border-white/5"
                           >
                              +250
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-orbitron font-black uppercase tracking-[0.3em] gap-3 relative overflow-hidden group/done">
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
      </div>

    </div>
  );
};
