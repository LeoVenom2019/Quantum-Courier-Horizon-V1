'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Zap, Database, Heart, Globe, X, Activity, Info, Trophy, Target } from 'lucide-react';
import { useDashboard } from '../DashboardProvider';
import { VOID_POIS } from '@/lib/game-data';

const VoidMapTab = memo(function VoidMapTab() {
  const {
    combat,
    economy,
    t,
    formatValue,
    donateToPOI,
    donateQCToPOI,
    getPOIProgress,
    playSfx
  } = useDashboard();

  const [selectedPoiId, setSelectedPoiId] = useState(VOID_POIS[0].id);
  const [donationModal, setDonationModal] = useState<{
    show: boolean;
    type: 'resource' | 'qc';
    key?: string;
    name: string;
    icon: any;
  } | null>(null);

  const selectedPoi = VOID_POIS.find(p => p.id === selectedPoiId) || VOID_POIS[0];
  
  const progressPercent = getPOIProgress(selectedPoiId);
  const poiProgress = combat.voidPOIsInspiration[selectedPoiId] || {};
  const progressValue = Object.entries(poiProgress).reduce((acc, [key, val]) => acc + (val as number), 0);

  const handleDonate = (amount: number | 'max') => {
    if (!donationModal) return;

    if (donationModal.type === 'resource' && donationModal.key) {
      const currentRes = (combat.voidResources as any)[donationModal.key] || 0;
      const actualAmount = amount === 'max' ? currentRes : 5000 * amount;
      if (actualAmount <= 0) return;
      
      donateToPOI(selectedPoiId, donationModal.key, Math.min(currentRes, actualAmount));
    } else if (donationModal.type === 'qc') {
      const currentQC = economy.qc || 0;
      const actualAmount = amount === 'max' ? currentQC : 50000 * amount;
      if (actualAmount <= 0) return;
      
      donateQCToPOI(selectedPoiId, Math.min(currentQC, actualAmount));
    }
    
    playSfx('success');
    setDonationModal(null);
  };

  const resourceIcons = [
    { id: 'minerals', name: 'Minerais', icon: Database, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'energy', name: 'Energia', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'food', name: 'Alimentos', icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'tech', name: 'Tecnologia', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'meds', name: 'Medicamentos', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden relative p-2">
      {/* Left: Map Visualization with POIs (25%) */}
      <div className="w-full lg:w-[25%] glass-panel border-2 border-purple-500/30 rounded-[2.5rem] relative overflow-hidden bg-black shadow-[0_0_50px_rgba(168,85,247,0.1)] shrink-0">
        <video 
          src="/videos/bobby_blue/void_map_background.webm"
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
        
        {/* POI Markers */}
        <div className="absolute inset-0">
          {VOID_POIS.map((poi, index) => {
            const isSelected = poi.id === selectedPoiId;
            const left = 15 + (index * 35) % 70;
            const top = 20 + (index * 20) % 60;
            
            return (
              <motion.button
                key={poi.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedPoiId(poi.id);
                  playSfx('censor_beep');
                }}
                style={{ left: `${left}%`, top: `${top}%` }}
                className="absolute group z-10"
              >
                <div className="relative">
                  <div className={`p-3 rounded-full border-2 transition-all duration-500 ${
                    isSelected ? 'bg-purple-500 border-white shadow-[0_0_30px_rgba(168,85,247,0.8)] scale-125' : 'bg-black/60 border-purple-500/40 hover:border-purple-400'
                  }`}>
                    <MapPin className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                  </div>
                  {isSelected && <div className="absolute -inset-2 border-2 border-purple-500/40 rounded-full animate-ping" />}
                  
                  {/* Name Label */}
                  <div className={`absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[8px] font-orbitron uppercase tracking-widest transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {poi.name}
                  </div>
                </div>
              </motion.button>
            );
          })}

        </div>

        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <div className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-[10px] font-orbitron font-black text-white uppercase tracking-widest">{t('voidPointsOfInterest')}</h4>
        </div>
      </div>

      {/* Right: POI Details & Donation (75%) */}
      <div className="w-full lg:w-[75%] flex flex-col gap-4 overflow-hidden">
        <div className="glass-panel border-2 border-purple-500/20 rounded-[2.5rem] p-6 lg:p-8 space-y-6 bg-gradient-to-br from-purple-900/10 via-black to-black relative overflow-hidden flex-1 flex flex-col">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h3 className="text-4xl font-orbitron font-black text-white uppercase tracking-tighter leading-none">{selectedPoi.name}</h3>
              <p className="text-[11px] text-white/40 font-mono italic leading-relaxed max-w-xl line-clamp-2">{selectedPoi.lore}</p>
            </div>

            {/* Compact Donation Buttons Area */}
            <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
              {/* QC Button */}
              <button 
                onClick={() => setDonationModal({ show: true, type: 'qc', name: 'Quantum Cells', icon: Database })}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-xl hover:bg-yellow-500/40 transition-all group"
                title="Doar QC"
              >
                 <Database className="w-4 h-4 text-yellow-400" />
                 <span className="text-[9px] font-orbitron font-black text-yellow-400 uppercase tracking-widest">QC</span>
              </button>

              <div className="w-px h-6 bg-white/10 mx-1" />

              {/* Resource Buttons */}
              {resourceIcons.map(res => (
                <button 
                  key={res.id}
                  onClick={() => setDonationModal({ show: true, type: 'resource', key: res.id, name: res.name, icon: res.icon })}
                  className={`flex items-center gap-2 px-3 py-2 ${res.bg} border border-white/10 rounded-xl hover:border-purple-500/50 transition-all group relative`}
                  title={`Doar ${res.name}`}
                >
                   <res.icon className={`w-4 h-4 ${res.color}`} />
                   <span className="text-[9px] font-orbitron font-black text-white/60 group-hover:text-white uppercase tracking-widest">{res.id.slice(0, 3)}</span>
                   
                   {/* Tooltip for value */}
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-[8px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5 whitespace-nowrap z-50">
                     {formatValue((combat.voidResources as any)[res.id] || 0)}
                   </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content: Video + Info */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
             {/* Video Area (Main Focus) */}
             <div className="w-full lg:w-[70%] aspect-video rounded-[2rem] overflow-hidden border-2 border-white/10 bg-black/60 relative group shadow-2xl">
                <video 
                  key={selectedPoi.video}
                  src={selectedPoi.video}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Decorative Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[9px] font-orbitron text-white/80 font-bold tracking-[0.2em] uppercase">LIVE_FEED_{selectedPoi.id.toUpperCase()}</span>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Transmission Status</span>
                      <span className="text-[10px] font-orbitron text-emerald-400 font-black uppercase">ENCRYPTED_SECURE</span>
                   </div>
                   <Activity className="w-5 h-5 text-emerald-400/60" />
                </div>
             </div>

             {/* Sidebar Info Area */}
             <div className="flex-1 flex flex-col gap-4">
                {/* Inspiration Card (Compact) */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <Trophy className="w-24 h-24 text-purple-400" />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[10px] text-white/40 uppercase font-orbitron tracking-widest block">{t('inspirationLevel')}</span>
                           <div className="text-4xl font-orbitron font-black text-purple-400 leading-none drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                             {progressPercent.toFixed(1)}%
                           </div>
                        </div>
                        <Target className="w-6 h-6 text-purple-500/40" />
                      </div>

                      <div className="space-y-2">
                         <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden relative p-0.5">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progressPercent}%` }}
                             className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                           />
                         </div>
                         <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold">
                           <span>{formatValue(progressValue)} INF</span>
                           <span>{formatValue(selectedPoi.resourceRequired)} {selectedPoi.need.toUpperCase()} REQ</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-start gap-3">
                         <Info className="w-4 h-4 text-purple-400/60 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-white/40 font-mono leading-relaxed">
                            Doe {selectedPoi.need} para maximizar a inspiração (Eficiência 2x). Outros recursos contribuem com 1x de eficiência. Cada 10 recursos de urgência aumentam 0.02%.
                          </p>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      {/* Donation Modal Popup */}
      <AnimatePresence>
        {donationModal?.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setDonationModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass-panel border-2 border-white/20 rounded-[3rem] p-10 bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-8">
                <div className={`p-6 rounded-[2.5rem] bg-purple-500/20 border border-purple-500/40 relative group`}>
                   <donationModal.icon className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute -inset-2 border border-purple-500/20 rounded-[2.8rem] animate-ping opacity-30" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter">Doar {donationModal.name}</h4>
                  <p className="text-sm text-white/40 font-mono italic leading-relaxed px-4">Escolha a quantidade de recursos para inspirar a colônia.</p>
                </div>

                <div className="grid grid-cols-1 w-full gap-4">
                   {[1, 10, 'max'].map(amt => (
                     <button 
                       key={amt}
                       onClick={() => handleDonate(amt as any)}
                       className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-purple-600 hover:border-purple-400 transition-all group relative overflow-hidden"
                     >
                       <span className="relative z-10 font-orbitron font-black text-base uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
                         {amt === 'max' ? 'Doar Máximo Possível' : `Doar ${amt}x Pack`}
                       </span>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     </button>
                   ))}
                </div>

                <button 
                  onClick={() => setDonationModal(null)}
                  className="text-white/20 hover:text-white/60 font-orbitron text-[11px] font-black uppercase tracking-[0.3em] transition-colors pt-4 flex items-center gap-2 group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  CANCELAR OPERAÇÃO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default VoidMapTab;
