import React from 'react';
import { motion } from 'motion/react';
import { Globe, Clock, Users, Activity, History as HistoryIcon } from 'lucide-react';

interface EarthSidebarProps {
  earthReconstructionProgress: { [key: string]: number };
  language: string;
  t: (key: string) => string;
  gameTime: { years: number };
  totalHumanPopulation: number;
  earthBiodiversity: number;
  earthEvents: any[];
  defenseThreatAlert?: { title: string; remainingSeconds: number } | null;
  onDefenseThreatAlertClick?: () => void;
  formatValue: (val: number) => string;
}

const EarthSidebar: React.FC<EarthSidebarProps> = ({ 
  earthReconstructionProgress, 
  language, 
  t, 
  gameTime, 
  totalHumanPopulation, 
  earthBiodiversity, 
  earthEvents,
  defenseThreatAlert,
  onDefenseThreatAlertClick,
  formatValue
}) => {
  const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b: any) => a + (typeof b === 'number' ? b : 0), 0) / 5;
  const isComplete = totalProgress >= 100;
  
  // Safety check: ensure earthEvents is an array
  const safeEarthEvents = Array.isArray(earthEvents) ? earthEvents : [];
  const route4DefenseEvent = safeEarthEvents.find(event => event?.id === 'route4-defense-alert');
  const last5Events = safeEarthEvents.filter(event => event?.id !== 'route4-defense-alert').slice(0, 5);
  const fixedDefenseEvent = defenseThreatAlert ? {
    id: 'route4-defense-alert',
    name: language === 'pt' ? 'FROTA SOB ATAQUE' : 'FLEET UNDER ATTACK',
    description: language === 'pt'
      ? 'Suas buscas estão sendo atacadas.'
      : 'Your searches are under attack.',
    year: gameTime.years,
    isFixed: true,
    specialStyles: {
      bg: 'bg-red-500/12',
      border: 'border-red-400/60',
      color: 'text-red-200',
    },
  } : route4DefenseEvent;

  return (
    <div className={`glass-panel border-2 ${isComplete ? 'border-emerald-500/50' : 'border-emerald-500/20'} rounded-xl flex-1 flex flex-col overflow-hidden bg-emerald-500/5 transition-all duration-500`}>
      {/* Header with Project Name and Progress */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-white/5">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-orbitron font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
            <Globe className={`w-3 h-3 ${isComplete ? 'animate-pulse' : ''}`} /> {language === 'pt' ? 'Nova Terra' : 'New Earth'}
          </h2>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[14px] font-mono text-emerald-500/80 uppercase tracking-widest font-bold">
              {language === 'pt' ? 'AO VIVO' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20">
        {/* Main Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              {language === 'pt' ? 'Ano Atual' : 'Current Year'}
            </span>
            <span className="text-base font-mono font-black text-white tracking-widest">
              {gameTime.years}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-2.5 h-2.5 text-cyan-400" />
              {language === 'pt' ? 'População Total' : 'Total Population'}
            </span>
            <span className="text-base font-mono font-black text-white tracking-widest">
              {formatValue(Math.floor(totalHumanPopulation))}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 col-span-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-2.5 h-2.5 text-emerald-400" />
                {language === 'pt' ? 'Biodiversidade' : 'Biodiversity'}
              </span>
              <span className="text-[14px] font-mono font-black text-emerald-400">{earthBiodiversity.toFixed(1)}%</span>
            </div>
            <div className="h-1 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${earthBiodiversity}%` }}
                className="h-full bg-emerald-500"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Event History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[15px] font-orbitron text-white/30 uppercase tracking-[0.2em] px-1">
            <HistoryIcon className="w-3 h-3" />
            {language === 'pt' ? 'Histórico de Eventos' : 'Event History'}
          </div>
          
          <div className="space-y-2">
            {last5Events.length === 0 ? (
              <div className="text-[15px] font-mono text-white/10 italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                {language === 'pt' ? 'Aguardando simulação...' : 'Waiting for simulation...'}
              </div>
            ) : (
              last5Events.map((event, idx) => {
                // Defensive check: ensure event is a valid object
                if (!event || typeof event !== 'object' || !event.id) {
                  return null;
                }

                return (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-xl transition-all group ${event.isFixed ? `${event.specialStyles?.bg || 'bg-white/5'} ${event.specialStyles?.border || 'border-white/10'} border-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]` : 'bg-white/5 border border-white/5 hover:border-emerald-500/20'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-base font-bold uppercase tracking-tight transition-colors ${event.isFixed ? (event.specialStyles?.color || 'text-emerald-400') : 'text-emerald-400/80 group-hover:text-emerald-400'}`}>
                        {String(event.name || 'Unknown Event')}
                      </span>
                      <span className="text-[14px] font-mono text-white/20">
                        {language === 'pt' ? 'ANO' : 'YEAR'} {event.year || 0}
                      </span>
                    </div>
                    <p className={`text-[15px] leading-relaxed italic ${event.isFixed ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                      {String(event.description || 'No description available')}
                    </p>
                  </motion.div>
                );
              })
            )}
            {fixedDefenseEvent ? (
              <motion.button 
                type="button"
                key={fixedDefenseEvent.id}
                onClick={onDefenseThreatAlertClick}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`w-full rounded-xl p-3 text-left transition-all group ${fixedDefenseEvent.specialStyles?.bg || 'bg-red-500/10'} ${fixedDefenseEvent.specialStyles?.border || 'border-red-400/50'} border-2 shadow-[0_0_24px_rgba(248,113,113,0.22)] hover:bg-red-500/18 hover:shadow-[0_0_30px_rgba(248,113,113,0.32)]`}
              >
                <p className="font-orbitron text-[13px] font-black uppercase leading-snug tracking-widest text-red-100 drop-shadow-[0_0_12px_rgba(248,113,113,0.85)]">
                  {String(fixedDefenseEvent.description || '')}
                </p>
              </motion.button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EarthSidebar);
