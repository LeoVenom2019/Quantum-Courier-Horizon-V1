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
  setColonies
}) => {
  const [activeColonyId, setActiveColonyId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  const allocatePopulation = (amount: number) => {
    if (!activeColony || !activeColony.isHabitable) return;
    
    // Check global population
    if (earthPopulation < amount) amount = earthPopulation;
    
    // Check colony capacity
    const space = activeColony.maxPopulation - activeColony.population;
    if (amount > space) amount = space;

    if (amount <= 0) return;

    setEarthPopulation(prev => prev - amount);
    setColonies(prev => prev.map(c => 
      c.id === activeColonyId ? { ...c, population: c.population + amount } : c
    ));
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 flex-1 overflow-hidden">
        {/* Management Left Panel (Always Visible) */}
        <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-3 flex flex-col space-y-3">
          <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} /> {t('Migration & Growth', 'Migração e Crescimento')}
          </h4>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-zinc-800/50 rounded-xl bg-zinc-900/20">
             {!activeColony.isHabitable ? (
               <>
                 <div className="p-3 rounded-full bg-red-500/10 text-red-500 mb-2 animate-pulse shrink-0">
                    <Shield size={32} />
                 </div>
                 <h5 className="text-white text-xs font-bold mb-1 shrink-0">{t('Migration Locked', 'Migração Bloqueada')}</h5>
                 <p className="text-[9px] text-zinc-500 leading-tight">
                   {t('The population can ONLY move when ALL 10 of EACH infrastructure category are constructed.', 'A população só poderá se mudar quando TODOS os 10 de cada infraestrutura forem construídos.')}
                 </p>
                 
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
                 <p className="text-[9px] text-zinc-400 mb-4">
                    {t('Colony status: Ready. Select amount to move from Earth.', 'Status: Pronta. Selecione a quantidade para mudar da Terra.')}
                 </p>
                 
                 <div className="w-full space-y-1.5">
                    <button 
                      onClick={() => allocatePopulation(250)}
                      className="w-full py-1.5 text-[9px] font-bold bg-green-600/20 border border-green-500/50 hover:bg-green-600 hover:text-black text-green-400 rounded transition-all"
                    >
                      +250 {t('People', 'Pessoas')}
                    </button>
                    <button 
                      onClick={() => allocatePopulation(1000)}
                      className="w-full py-1.5 text-[9px] font-bold bg-green-600/20 border border-green-500/50 hover:bg-green-600 hover:text-black text-green-400 rounded transition-all"
                    >
                      +1.000 {t('People', 'Pessoas')}
                    </button>
                    <button 
                      onClick={() => allocatePopulation(5000)}
                      className="w-full py-1.5 text-[9px] font-bold bg-green-700/30 border border-green-600/50 hover:bg-green-700 hover:text-white text-green-300 rounded transition-all"
                    >
                      +5.000 {t('People', 'Pessoas')}
                    </button>
                 </div>
               </>
             )}
          </div>

          <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 shrink-0">
             <div className="flex items-center gap-1.5 mb-1 text-blue-400">
                <TrendingUp size={12} />
                <span className="text-[8px] font-bold uppercase">{t('Growth Factor', 'Fator de Crescimento')}</span>
             </div>
             <p className="text-[8px] text-zinc-500 leading-tight">
                {t('Population grows relative to colony age. Reaches 10% after 10 years.', 'População cresce conforme a idade da colônia. Chega a 10% após 10 anos.')}
             </p>
          </div>
        </div>

        {/* Construction Grid (Always 6 cards in 3xGrid) */}
        <div className="lg:col-span-3 bg-zinc-900/10 border border-zinc-800/50 rounded-xl p-3 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-white uppercase tracking-tighter flex items-center gap-2.5">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              {t('Infrastructure Nodes', 'Nódulos de Infraestrutura')}
            </h4>
            <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500">
               <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  {t('Process Active', 'Processo Ativo')}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeColony.constructions.map((con) => {
              const config = CONSTRUCTION_CONFIG[con.type];
              const isMaxed = con.level >= 10;
              const isWorking = con.assignedConstructors > 0 && !isMaxed;
              
              // Custom colors mapping
              const colorClasses: Record<string, string> = {
                emerald: 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
                zinc: 'border-zinc-400/80 shadow-[0_0_15px_rgba(161,161,170,0.4)]',
                yellow: 'border-yellow-400/80 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
                blue: 'border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
                red: 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
                'restaurant-mix': 'border-l-emerald-400 border-t-emerald-400 border-r-red-400 border-b-red-400 shadow-[0_0_15px_rgba(16,185,129,0.3),0_0_15px_rgba(239,68,68,0.2)]'
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
                  className={`relative p-2.5 rounded-xl border-2 bg-black/40 flex flex-col ${colorClasses[config.color]} ${isMaxed ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${accentColor[config.color]}`}>
                      <config.icon size={18} />
                    </div>
                    <div className="text-right leading-none">
                       <span className="text-[8px] font-mono text-zinc-500 block uppercase mb-0.5">{t('Units Built', 'Unidades')}</span>
                       <span className="text-base font-michroma text-white">{con.level} / 10</span>
                    </div>
                  </div>

                  <h5 className="font-bold text-white text-[11px] mb-1 leading-tight">{config.label[language]}</h5>
                  <div className="flex items-center gap-2 mb-2">
                     <div className={`h-1 flex-1 rounded-full bg-zinc-800 overflow-hidden`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${isMaxed ? 100 : con.progress}%` }}
                          className={`h-full ${isMaxed ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-blue-500 animate-[pulse_2s_infinite]'}`}
                        />
                     </div>
                     {!isMaxed && (
                       <span className="text-[8px] font-mono text-zinc-500 w-6">{Math.floor(con.progress)}%</span>
                     )}
                  </div>

                  <div className="mt-auto space-y-1.5">
                    {!isMaxed ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1 leading-none">
                           <span>{t('Robots:', 'Robôs:')}</span>
                           <span className="text-white">{con.assignedConstructors}</span>
                        </div>
                        <div className="flex gap-1">
                           <button 
                             onClick={() => updateConstructors(con.id, -50)}
                             disabled={con.assignedConstructors === 0}
                             className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 text-[9px] transition-colors disabled:opacity-20"
                           >
                              -50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 50)}
                             className="flex-1 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[9px] transition-all"
                           >
                              +50
                           </button>
                           <button 
                             onClick={() => updateConstructors(con.id, 250)}
                             className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold text-[9px] transition-colors"
                           >
                              +250
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-mono uppercase tracking-widest gap-1.5 leading-none">
                         <CheckCircle2 size={10} />
                         {t('Done', 'Concluído')}
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
