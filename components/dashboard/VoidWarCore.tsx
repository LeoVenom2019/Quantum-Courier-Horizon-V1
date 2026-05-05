import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Database, Coffee, Activity, Cpu, Home, Globe, Plane } from 'lucide-react';

interface VoidWarCoreProps {
  voidResources: { [key: string]: number };
  voidCompactedResources: { [key: string]: number };
  voidAutoShipmentUnlocked: boolean;
  voidAutoShipmentActive: boolean;
  setVoidAutoShipmentActive: (active: boolean) => void;
  compactVoidResource: (id: any) => void;
  sendCompactedToEarth: (id: any) => void;
  buyVoidAutoShipment: () => void;
  playSfx: (id: string) => void;
  language: string;
  t: (key: string) => string;
  formatValue: (val: number) => string;
}

const VoidWarCore: React.FC<VoidWarCoreProps> = ({
  voidResources,
  voidCompactedResources,
  voidAutoShipmentUnlocked,
  voidAutoShipmentActive,
  setVoidAutoShipmentActive,
  compactVoidResource,
  sendCompactedToEarth,
  buyVoidAutoShipment,
  playSfx,
  language,
  t,
  formatValue
}) => {
  const reservoirs = [
    { id: 'energy', name: 'Células Quânticas', raw: 'Energia', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { id: 'minerals', name: 'Núcleos Minerais Compactados', raw: 'Minérios', icon: Database, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { id: 'food', name: 'Rações de Colonização', raw: 'Alimentos', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { id: 'meds', name: 'Kits Médicos Avançados', raw: 'Medicamentos', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { id: 'tech', name: 'Núcleos de Dados Multifatoriais', raw: 'Tecnologia', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="glass-panel border-2 border-cyan-500/30 rounded-xl p-3 bg-gradient-to-br from-cyan-500/10 via-black/60 to-black relative overflow-hidden shrink-0">
        <div className="flex flex-row items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-float">
              <Home className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Globe className="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <div className="flex-1 space-y-0 text-left">
            <h2 className="text-base font-orbitron font-black text-white tracking-widest uppercase leading-none">{t('colonizationCore')}</h2>
            <p className="text-[15px] text-cyan-400/60 font-mono uppercase tracking-[0.2em]">{t('finalPreparationEarth')}</p>
            <p className="text-[14px] text-white/40 max-w-2xl leading-tight">
              {t('colonizationCoreDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 flex-1 min-h-0 pb-1">
        {/* Left Side: 2x3 Grid */}
        <div className="w-1/2 h-full">
          <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full">
            {reservoirs.map(res => {
              const rawAmount = voidResources[res.id];
              const compactedAmount = voidCompactedResources[res.id];
              const canCompact = rawAmount >= 50000;

              return (
                <div key={res.id} className={`glass-panel border p-2 rounded-xl flex flex-col gap-1.5 transition-all relative overflow-hidden ${res.border} ${res.bg}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-black/40 border ${res.border} ${res.color}`}>
                        <res.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-orbitron font-bold text-white uppercase tracking-wider leading-tight">{res.name}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none truncate">{t('reservoirOf')} {res.raw}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0">
                        <span className="text-[7px] text-white/40 uppercase tracking-widest">{t('rawResource')}</span>
                        <div className="text-[14px] font-orbitron font-bold text-white">{formatValue(rawAmount)}</div>
                      </div>
                      <div className="text-right space-y-0">
                        <span className="text-[7px] text-white/40 uppercase tracking-widest">{t('compacted')}</span>
                        <div className={`text-[14px] font-orbitron font-bold ${res.color}`}>{compactedAmount}</div>
                      </div>
                    </div>

                    <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (rawAmount / 50000) * 100)}%` }}
                        className={`h-full bg-gradient-to-r from-white/20 to-white/60`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          compactVoidResource(res.id);
                          playSfx('target_up_2');
                        }}
                        disabled={!canCompact}
                        className={`flex-1 py-1 rounded-lg font-orbitron font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                          canCompact ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        {t('compact')}
                      </button>
                      <button
                        onClick={() => {
                          sendCompactedToEarth(res.id);
                          playSfx('laser_up');
                        }}
                        disabled={compactedAmount <= 0}
                        className={`flex-1 py-1 rounded-lg font-orbitron font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border ${
                          compactedAmount > 0 ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {t('sendToEarth')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 6th Card: Drones de Auto Envio */}
            <div className={`glass-panel border p-2 rounded-xl flex flex-col gap-1.5 transition-all relative overflow-hidden ${voidAutoShipmentUnlocked ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-black/40 border ${voidAutoShipmentUnlocked ? 'border-blue-500/40 text-blue-400' : 'border-white/10 text-white/40'}`}>
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-orbitron font-bold text-white uppercase tracking-wider leading-tight">
                      {language === 'pt' ? 'Drones de Auto Envio' : 'Auto-Shipment Drones'}
                    </h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">
                      {voidAutoShipmentUnlocked ? (voidAutoShipmentActive ? (language === 'pt' ? 'SISTEMA ATIVO' : 'SYSTEM ACTIVE') : (language === 'pt' ? 'SISTEMA PAUSADO' : 'SYSTEM PAUSED')) : (language === 'pt' ? 'SISTEMA BLOQUEADO' : 'SYSTEM LOCKED')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-2">
                {!voidAutoShipmentUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 px-1">
                      <div className="flex justify-between text-[8px] font-mono uppercase tracking-tighter">
                        <span className="text-white/40">Cost:</span>
                        <span className="text-emerald-400">500K QC | 50K T/E</span>
                      </div>
                    </div>
                    <button
                      onClick={buyVoidAutoShipment}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-orbitron font-black text-[12px] rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      {t('buy')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 py-1 px-3 bg-black/40 rounded-lg border border-white/5">
                      <div className={`w-2 h-2 rounded-full ${voidAutoShipmentActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                        {voidAutoShipmentActive ? (language === 'pt' ? 'RODANDO' : 'RUNNING') : (language === 'pt' ? 'PARADO' : 'STOPPED')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const isActivating = !voidAutoShipmentActive;
                        setVoidAutoShipmentActive(!voidAutoShipmentActive);
                        playSfx(isActivating ? 'close_window' : 'open_window');
                      }}
                      className={`w-full py-2 rounded-lg font-orbitron font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 border ${
                        voidAutoShipmentActive 
                          ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' 
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      {voidAutoShipmentActive ? (language === 'pt' ? 'DESATIVAR' : 'DISABLE') : (language === 'pt' ? 'ATIVAR' : 'ENABLE')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Video Player */}
        <div className="w-1/2 h-full">
          <div className="h-full glass-panel border-2 border-white/10 rounded-2xl relative overflow-hidden shadow-2xl bg-black">
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
            
            <video 
              src="/videos/pois/colonization-core.webm"
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Data Overlay UI */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-orbitron font-black tracking-[0.3em] uppercase">Logistics Live Feed</span>
                </div>
                <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                  Source: Orbital Station Gamma-06
                </div>
              </div>
              <div className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                REC • 24/7
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="flex flex-col gap-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[8px] font-mono text-white/40 uppercase">Target Coordinate</div>
                    <div className="text-[12px] font-mono text-white font-bold">TERRA_PRJ_RECON_V4</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[8px] font-mono text-white/40 uppercase">Sync Status</div>
                    <div className="text-[12px] font-mono text-emerald-400 font-bold">READY_FOR_DEPLOYMENT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VoidWarCore);
