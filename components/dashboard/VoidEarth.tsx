import React from 'react';
import { motion } from 'motion/react';
import { Zap, Database, Cpu, Coffee, Activity, Globe } from 'lucide-react';

interface VoidEarthProps {
  earthReconstructionProgress: { [key: string]: number };
  language: string;
  t: (key: string) => string;
  setShowRestorationModal: (show: boolean) => void;
}

const VoidEarth: React.FC<VoidEarthProps> = ({ 
  earthReconstructionProgress, 
  language, 
  t, 
  setShowRestorationModal 
}) => {
  const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b) => a + b, 0) / 5;
  const isComplete = totalProgress >= 100;

  const resourceNodes = [
    { id: 'energy', name: language === 'pt' ? 'Células Quânticas' : 'Quantum Cells', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
    { id: 'minerals', name: language === 'pt' ? 'Núcleos Minerais' : 'Mineral Cores', icon: Database, color: 'text-orange-400', border: 'border-orange-400/20', bg: 'bg-orange-400/5' },
    { id: 'tech', name: language === 'pt' ? 'Dados Multifatoriais' : 'Multifactorial Data', icon: Cpu, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/5' },
    { id: 'food', name: language === 'pt' ? 'Rações de Colonização' : 'Colonization Rations', icon: Coffee, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5' },
    { id: 'meds', name: language === 'pt' ? 'Kits Médicos Avançados' : 'Advanced Medical Kits', icon: Activity, color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5' }
  ];

  return (
    <div className="h-full w-full flex flex-row gap-0.5 overflow-hidden p-0.5">
      {/* Left Side: Projeto Terra */}
      <div className="w-[30%] h-full min-h-0">
        <div className="glass-panel border-2 border-emerald-500/30 rounded-xl bg-gradient-to-br from-emerald-500/10 via-black/80 to-black relative overflow-hidden h-full flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
          
          {/* Top Half: Command & Progress (50%) */}
          <div className="h-1/2 w-full flex flex-col items-center justify-between py-2 border-b border-white/10 relative z-10">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black/60 relative group">
                <Globe className={`w-6 h-6 ${isComplete ? 'text-emerald-400 animate-pulse' : 'text-emerald-500/60'}`} />
              </div>
              <div className="space-y-0 text-center">
                <h2 className="text-sm font-orbitron font-black text-white tracking-[0.2em] uppercase leading-none">{t('earthProject')}</h2>
                <p className="text-[8px] text-emerald-400/60 font-mono uppercase tracking-[0.1em]">{t('biosphereRestoration')}</p>
              </div>
            </div>

            <div className="w-full px-2 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-black/60 border border-white/5 rounded-lg p-1.5 space-y-0.5">
                  <p className="text-[6px] text-white/30 uppercase tracking-widest leading-none">{language === 'pt' ? 'VARREDURA' : 'SCAN'}</p>
                  <p className="text-[9px] font-mono font-bold text-emerald-400 leading-none">00-EARTH</p>
                </div>
                <div className="bg-black/60 border border-white/5 rounded-lg p-1.5 space-y-0.5">
                  <p className="text-[6px] text-white/30 uppercase tracking-widest leading-none">{language === 'pt' ? 'SINCRONIA' : 'SYNC'}</p>
                  <p className="text-[9px] font-mono font-bold text-cyan-400 leading-none">98.4%</p>
                </div>
              </div>

              <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-emerald-500/10">
                <div className="flex justify-between items-end px-0.5">
                  <span className="text-[8px] font-orbitron text-emerald-400 font-bold uppercase tracking-widest">{t('globalReconstructionProgress')}</span>
                  <span className="font-black text-[12px] text-white tabular-nums">{totalProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-black/80 rounded-full border border-emerald-500/20 overflow-hidden p-0.5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-white shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full relative"
                  />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <button 
                  onClick={() => setShowRestorationModal(true)}
                  className={`w-full py-1.5 rounded-lg font-orbitron font-black text-xs transition-all active:scale-95 border-b-2 ${
                    isComplete 
                      ? 'bg-emerald-500 text-black border-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {t('restoration')}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Half: Bobby Observation Video (50%) */}
          <div className="h-1/2 w-full p-2 relative z-10 flex flex-col">
            <div className="flex-1 rounded-xl border border-emerald-500/20 overflow-hidden bg-black/40 relative group shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]" />
              
              <video 
                src="/videos/terra/earth_restoration.webm"
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />

              {/* Video Overlay Info */}
              <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                <span className="text-[7px] font-orbitron text-white/60 uppercase tracking-widest">LIVE_FEED • BOBBY_EYE</span>
              </div>

              <div className="absolute bottom-2 right-2 z-30">
                <span className="text-[7px] font-mono text-emerald-400/40 uppercase tracking-tighter">POS: EARTH_ORBIT_L0</span>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/40 z-30" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/40 z-30" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/40 z-30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/40 z-30" />
            </div>
            
            <div className="mt-1.5 flex flex-col items-center gap-0.5">
              <p className={`text-[8px] uppercase tracking-[0.2em] font-orbitron font-black leading-tight ${isComplete ? 'text-emerald-400 animate-pulse' : 'text-white/30'}`}>
                {isComplete ? t('hopeSymbol') : t('waitingNoduleInit')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: 2x3 Grid */}
      <div className="w-[70%] h-full min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-3 gap-0.5 h-full">
          {resourceNodes.map(node => {
            const progress = earthReconstructionProgress[node.id];
            const isNodeComplete = progress >= 100;
            return (
              <div key={node.id} className={`glass-panel border p-1 rounded-lg flex flex-col transition-all relative overflow-hidden min-h-0 ${isNodeComplete ? 'border-emerald-500/40 bg-emerald-500/5' : `border-white/5 ${node.bg} hover:border-white/10`}`}>
                <div className="flex justify-between items-start shrink-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className={`p-1 rounded-md bg-black/60 border border-white/10 ${node.color} shrink-0`}>
                      <node.icon className="w-2.5 h-2.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-orbitron font-bold text-white uppercase tracking-wider leading-none truncate">{node.name}</h4>
                      <p className="text-[6px] text-white/40 uppercase tracking-widest font-mono truncate">{t('captureNodule')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[11px] font-orbitron font-black ${isNodeComplete ? 'text-emerald-400' : 'text-white'}`}>{progress.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-0.5 min-h-0">
                    <div className="flex justify-between items-center bg-black/40 p-0.5 rounded-md border border-white/5">
                      <div className="space-y-0">
                        <p className="text-[5px] text-white/30 uppercase tracking-tighter leading-none">{language === 'pt' ? 'Diagnóstico' : 'Diagnostic'}</p>
                        <p className={`text-[8px] font-mono font-bold leading-tight ${isNodeComplete ? 'text-emerald-400' : 'text-white/60'}`}>
                          {isNodeComplete ? (language === 'pt' ? 'ESTÁVEL' : 'STABLE') : (language === 'pt' ? 'ATIVO' : 'ACTIVE')}
                        </p>
                      </div>
                      <div className="text-right space-y-0">
                        <p className="text-[5px] text-white/30 uppercase tracking-tighter leading-none">{language === 'pt' ? 'Integridade' : 'Integrity'}</p>
                        <p className="text-[8px] font-mono text-cyan-400 leading-tight">99.8%</p>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="h-1 bg-black/80 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${isNodeComplete ? 'from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'from-white/20 to-white/60'}`}
                        />
                      </div>
                    </div>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Earth Asset PNG */}
          <div className="glass-panel border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex flex-col relative overflow-hidden group min-h-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
            
            <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ 
                  rotate: { duration: 80, repeat: Infinity, ease: "linear" },
                  scale: { duration: 12, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative z-10 w-full h-full flex items-center justify-center p-0.5"
              >
                <img 
                  src="/images/ui/earth_card.png" 
                  alt="Earth Restoration"
                  className="max-w-full max-h-full object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                />
              </motion.div>
            </div>
            <div className="px-1 py-0.5 bg-black/60 backdrop-blur-md border-t border-emerald-500/20 z-30 flex justify-between items-center shrink-0">
              <span className="text-[6px] font-orbitron text-emerald-400/80 uppercase tracking-widest">PLANETARY STATUS</span>
              <span className="text-[6px] font-mono text-white/40 uppercase">Sector 074</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VoidEarth);
