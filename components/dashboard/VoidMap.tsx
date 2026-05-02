import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Database, Cpu, Coffee, Activity, ChevronRight, MousePointer2, Coins } from 'lucide-react';

interface VoidPOI {
  id: string;
  name: string;
  lore: string;
  video?: string;
  need?: string;
}

interface VoidMapProps {
  voidPOIs: VoidPOI[];
  voidPOIsInspiration: { [id: string]: { [res: string]: number } };
  language: string;
  t: (key: string) => string;
  voidResources: { minerals: number; energy: number; food: number; tech: number; meds: number };
  voidDonationModes: { [poiId: string]: '1x' | '10x' | 'max' };
  donateToPOI: (poiId: string, resourceName: string) => void;
  donateQCToPOI: (poiId: string) => void;
  setVoidDonationModes: React.Dispatch<React.SetStateAction<{ [poiId: string]: '1x' | '10x' | 'max' }>>;
  voidPOIQCDonations: { [poiId: string]: number };
}

const VoidMap: React.FC<VoidMapProps> = ({
  voidPOIs,
  voidPOIsInspiration,
  language,
  t,
  voidResources,
  voidDonationModes,
  donateToPOI,
  donateQCToPOI,
  setVoidDonationModes,
  voidPOIQCDonations
}) => {
  const getPOIColor = (id: string) => {
    switch(id) {
      case 'poi-1': return 'cyan';
      case 'poi-2': return 'orange';
      case 'poi-3': return 'purple';
      case 'poi-4': return 'emerald';
      default: return 'cyan';
    }
  };

  const resourceTypes = [
    { id: 'minerals', name: language === 'pt' ? 'Minérios' : 'Minerals', icon: Database, color: 'text-orange-400', key: 'minerals' },
    { id: 'energy', name: language === 'pt' ? 'Energia' : 'Energy', icon: Zap, color: 'text-yellow-400', key: 'energy' },
    { id: 'food', name: language === 'pt' ? 'Alimentos' : 'Food', icon: Coffee, color: 'text-emerald-400', key: 'food' },
    { id: 'tech', name: language === 'pt' ? 'Tecnologia' : 'Tech', icon: Cpu, color: 'text-purple-400', key: 'tech' },
    { id: 'meds', name: language === 'pt' ? 'Medicamentos' : 'Meds', icon: Activity, color: 'text-red-400', key: 'meds' }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 p-1 overflow-hidden">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full flex-1">
        {voidPOIs.map(poi => {
          const poiStats = voidPOIsInspiration[poi.id] || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 };
          const totalProgress = Object.values(poiStats).reduce((a: any, b: any) => a + b, 0);
          const isInspired = totalProgress >= 100;
          const color = getPOIColor(poi.id);
          const currentDonationMode = voidDonationModes[poi.id] || '1x';
          const qcDonations = voidPOIQCDonations[poi.id] || 0;

          const colorClasses = {
            cyan: 'neon-border-cyan bg-cyan-500/5 text-cyan-400 border-cyan-500/40',
            orange: 'neon-border-orange bg-orange-500/5 text-orange-400 border-orange-500/40',
            purple: 'neon-border-purple bg-purple-500/5 text-purple-400 border-purple-500/40',
            emerald: 'neon-border-emerald bg-emerald-500/5 text-emerald-400 border-emerald-500/40'
          };

          return (
            <div key={poi.id} className={`glass-panel border-2 rounded-2xl p-3 flex flex-col relative overflow-hidden h-full ${isInspired ? 'neon-border-emerald bg-emerald-500/5' : colorClasses[color as keyof typeof colorClasses]}`}>
              {/* Header Info */}
              <div className="flex justify-between items-start gap-2 shrink-0 mb-2">
                <div className="flex flex-col text-left min-w-0">
                  <h3 className="text-lg font-orbitron font-black text-white tracking-widest uppercase leading-tight truncate">{poi.name}</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest leading-none mt-1 truncate">{poi.lore}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-orbitron font-black ${isInspired ? 'text-emerald-400' : 'text-white'}`}>
                    {Math.min(100, totalProgress).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest leading-none">
                    {language === 'pt' ? 'STATUS: INSPIRAÇÃO' : 'STATUS: INSPIRATION'}
                  </div>
                </div>
              </div>

              {/* Main Content: Video + Resources */}
              <div className="flex-1 flex gap-2.5 min-h-0">
                {/* Video Area */}
                <div className="w-[32%] h-full bg-black/40 rounded-xl border border-white/5 overflow-hidden relative shrink-0 group">
                   <video 
                    src={poi.video || `/videos/pois/${poi.id}.mp4`}
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                     <div className="text-[7px] font-orbitron text-emerald-400/60 uppercase tracking-widest">LIVE</div>
                  </div>
                </div>

                {/* Resources Area */}
                <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden pr-1">
                  {resourceTypes.map(res => {
                    const progress = poiStats[res.id as keyof typeof poiStats] || 0;
                    const isTarget = poi.need === res.name;
                    return (
                      <div key={res.id} className={`space-y-0.5 p-1 rounded-lg border transition-all ${isTarget ? 'bg-white/5 border-white/20' : 'border-transparent hover:bg-white/5'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <res.icon className={`w-3 h-3 ${res.color}`} />
                            <span className="text-[10px] font-orbitron font-bold text-white uppercase tracking-wider truncate">
                              {res.name}
                              {isTarget && <span className="ml-1 text-[8px] text-emerald-400 animate-pulse">★</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono text-white/60 tabular-nums">{progress.toFixed(1)}%</span>
                             <button
                               onClick={() => donateToPOI(poi.id, res.name)}
                               disabled={progress >= 20}
                               className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-0.5 ${
                                 progress >= 20 
                                   ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                   : 'bg-white/10 text-white hover:bg-white/20 active:scale-90 border border-white/10'
                               }`}
                             >
                               {currentDonationMode}
                               <ChevronRight size={10} />
                             </button>
                          </div>
                        </div>
                        <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress / 20) * 100}%` }}
                            className={`h-full rounded-full ${isTarget ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]' : `bg-${getPOIColor(poi.id)}-500`} opacity-80`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Controls */}
              <div className="mt-auto pt-1.5 flex justify-between items-end shrink-0 border-t border-white/5">
                <div className="space-y-1">
                  <div className="text-[9px] font-orbitron text-white/30 uppercase tracking-widest">{language === 'pt' ? 'Modo de Doação' : 'Donation Mode'}</div>
                  <div className="flex gap-1">
                    {['1x', '10x', 'max'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setVoidDonationModes(prev => ({ ...prev, [poi.id]: mode as any }))}
                        className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-black uppercase transition-all ${
                          currentDonationMode === mode 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                   <button
                     onClick={() => donateQCToPOI(poi.id)}
                     disabled={qcDonations >= 10}
                     className={`px-3 py-1.5 rounded-lg flex flex-col items-center gap-0.5 transition-all border ${
                       qcDonations >= 10 
                         ? 'border-slate-800 bg-slate-900/50 text-slate-600' 
                         : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                     }`}
                   >
                     <div className="flex items-center gap-1">
                        <Coins size={12} />
                        <span className="text-[10px] font-orbitron font-black">BONUS</span>
                     </div>
                     <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${i < qcDonations ? 'bg-yellow-400' : 'bg-white/10'}`} />
                        ))}
                     </div>
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(VoidMap);
