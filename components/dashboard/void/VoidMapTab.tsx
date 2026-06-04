'use client';

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Zap, Database, Heart, Globe, X, Activity, Info, Trophy, Target } from 'lucide-react';
import { useDashboard } from '../DashboardProvider';
import { VOID_POIS } from '@/lib/game-data';
import { PremiumCanvasButton, PremiumCanvasButtonTone } from '../../ui/PremiumCanvasButton';

const VOID_POI_RESOURCE_KEY_BY_NEED: Record<string, string> = {
  'Energia': 'energy',
  'Alimentos': 'food',
  'Tecnologia': 'tech',
  'Medicamentos': 'meds',
  'Minerais': 'minerals',
};
const VOID_POI_RESOURCE_KEYS = ['minerals', 'energy', 'food', 'tech', 'meds'] as const;
const VOID_POI_MAX_RESOURCE_PROGRESS_RATIO = 0.2;
const VOID_POI_QC_INSPIRATION_CAP = 500000;
const getVoidPOIResourceRawCap = (poi: any, resourceKey: string) => {
  const required = poi.resourceRequired || 100000;
  const targetKey = VOID_POI_RESOURCE_KEY_BY_NEED[poi.need] || 'energy';
  const weight = resourceKey === targetKey ? 2 : 1;
  return (required * VOID_POI_MAX_RESOURCE_PROGRESS_RATIO) / weight;
};
const getVoidPOIContributionValue = (poi: any, poiProgress: Record<string, number>) => {
  const required = poi.resourceRequired || 100000;
  const targetKey = VOID_POI_RESOURCE_KEY_BY_NEED[poi.need] || 'energy';
  const effectiveCap = required * VOID_POI_MAX_RESOURCE_PROGRESS_RATIO;
  const resourceValue = VOID_POI_RESOURCE_KEYS.reduce((total, key) => {
    const weight = key === targetKey ? 2 : 1;
    return total + Math.min((poiProgress[key] || 0) * weight, effectiveCap);
  }, 0);
  return resourceValue;
};

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
  const qcInspiration = combat.voidPOIQCDonations?.[selectedPoiId] || 0;
  const qcInspirationPercent = Math.min(20, (qcInspiration / VOID_POI_QC_INSPIRATION_CAP) * 20);
  const progressValue = getVoidPOIContributionValue(selectedPoi, poiProgress);

  const openDonationModal = (modal: NonNullable<typeof donationModal>) => {
    playSfx('open_window_void');
    setDonationModal(modal);
  };

  const closeDonationModal = () => {
    playSfx('close_window_void');
    setDonationModal(null);
  };

  const handleDonate = (amount: number | 'max') => {
    if (!donationModal) return;

    if (donationModal.type === 'resource' && donationModal.key) {
      const currentRes = (combat.voidResources as any)[donationModal.key] || 0;
      const actualAmount = amount === 'max' ? currentRes : 5000 * amount;
      if (actualAmount <= 0) return;

      const rawCap = getVoidPOIResourceRawCap(selectedPoi, donationModal.key);
      const currentDonated = poiProgress[donationModal.key] || 0;
      const acceptedAmount = Math.max(0, Math.min(currentRes, actualAmount, rawCap - currentDonated));
      donateToPOI(selectedPoiId, donationModal.key, Math.min(currentRes, actualAmount));
      if (acceptedAmount <= 0) return;
    } else if (donationModal.type === 'qc') {
      const currentQC = economy.qc || 0;
      const actualAmount = amount === 'max' ? currentQC : 50000 * amount;
      if (actualAmount <= 0) return;

      const currentQCDonation = combat.voidPOIQCDonations?.[selectedPoiId] || 0;
      const acceptedAmount = Math.max(0, Math.min(currentQC, actualAmount, VOID_POI_QC_INSPIRATION_CAP - currentQCDonation));
      donateQCToPOI(selectedPoiId, Math.min(currentQC, actualAmount));
      if (acceptedAmount <= 0) return;
    }
    
    const donationSfx = amount === 'max' ? 'donation_3_void' : amount === 10 ? 'donation_2_void' : 'donation_1_void';
    playSfx(donationSfx);
    setDonationModal(null);
  };

  const resourceIcons: Array<{ id: string; name: string; icon: any; color: string; tone: PremiumCanvasButtonTone }> = [
    { id: 'minerals', name: 'Minerais', icon: Database, color: 'text-orange-300', tone: 'orange' },
    { id: 'energy', name: 'Energia', icon: Zap, color: 'text-blue-300', tone: 'blue' },
    { id: 'food', name: 'Alimentos', icon: Heart, color: 'text-emerald-300', tone: 'green' },
    { id: 'tech', name: 'Tecnologia', icon: Activity, color: 'text-cyan-300', tone: 'cyan' },
    { id: 'meds', name: 'Medicamentos', icon: Heart, color: 'text-red-300', tone: 'red' }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden relative p-2">
      {/* Left: Map Visualization with POIs (25%) */}
      <div className="w-full lg:w-[25%] glass-panel border-2 border-purple-500/30 rounded-[2.5rem] relative overflow-hidden bg-black shadow-[0_0_50px_rgba(168,85,247,0.1)] shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url('/assets/rota3/void/bg_void_map_left.webp')` }}
        />
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
            <div className="flex min-w-full md:min-w-[520px] flex-wrap items-center justify-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              {/* QC Button */}
              <PremiumCanvasButton
                onClick={() => openDonationModal({ show: true, type: 'qc', name: 'Quantum Cells', icon: Database })}
                tone="amber"
                className="min-h-[48px] min-w-[76px] px-5 py-3"
                contentClassName="gap-2"
                title="Doar QC"
              >
                 <Database className="w-5 h-5 text-yellow-400" />
                 <span className="text-[11px] font-orbitron font-black text-yellow-400 uppercase tracking-widest">QC</span>
              </PremiumCanvasButton>

              <div className="w-px h-9 bg-white/10 mx-1" />

              {/* Resource Buttons */}
              {resourceIcons.map(res => (
                <PremiumCanvasButton
                  key={res.id}
                  onClick={() => openDonationModal({ show: true, type: 'resource', key: res.id, name: res.name, icon: res.icon })}
                  tone={res.tone}
                  className="min-h-[48px] min-w-[76px] px-5 py-3"
                  contentClassName="gap-2"
                  title={`Doar ${res.name}`}
                >
                   <res.icon className={`w-5 h-5 ${res.color}`} />
                   <span className="text-[11px] font-orbitron font-black text-white/60 group-hover:text-white uppercase tracking-widest">{res.id.slice(0, 3)}</span>
                   
                   {/* Tooltip for value */}
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-[8px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5 whitespace-nowrap z-50">
                     {formatValue((combat.voidResources as any)[res.id] || 0)}
                   </div>
                </PremiumCanvasButton>
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
             <div className="flex-1 flex flex-col gap-4 min-h-0">
                {/* Inspiration Card (Compact) */}
                <div className="min-h-[420px] flex-1 bg-black border border-white/10 rounded-[2rem] p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
                   <div 
                     className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700 group-hover:scale-105"
                     style={{ 
                       backgroundImage: `url(${
                         selectedPoi.id === 'poi-1' ? '/assets/rota3/void/bg_void_poi_eridani.webp' :
                         selectedPoi.id === 'poi-2' ? '/assets/rota3/void/bg_void_poi_vega.webp' :
                         selectedPoi.id === 'poi-3' ? '/assets/rota3/void/bg_void_poi_aurora.webp' :
                         selectedPoi.id === 'poi-4' ? '/assets/rota3/void/bg_void_poi_sirius.webp' :
                         '/assets/rota3/void/bg_void_map_left.webp'
                       })`
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
                   
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                           <span className="text-xs text-white/80 drop-shadow-md uppercase font-orbitron tracking-widest block">{t('inspirationLevel')}</span>
                           <div className="text-5xl font-orbitron font-black text-purple-400 leading-none drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                             {progressPercent.toFixed(1)}%
                           </div>
                        </div>
                        <Target className="w-8 h-8 text-purple-500/80 drop-shadow-md" />
                      </div>

                      <div className="space-y-3">
                         <div className="h-4 bg-black/60 rounded-full border border-white/10 overflow-hidden relative p-0.5 shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progressPercent}%` }}
                             className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                           />
                         </div>
                         <div className="flex justify-between text-[11px] font-mono text-white/80 drop-shadow-md uppercase tracking-widest font-bold">
                           <span>{formatValue(progressValue)} INF</span>
                           <span>OBJETIVO 100% AJUDA</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-6 flex-1 flex items-center relative z-10">
                      <div className="flex items-start gap-4 bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/5 shadow-xl">
                         <Info className="w-6 h-6 text-purple-400 drop-shadow-md shrink-0 mt-0.5" />
                          <p className="text-sm text-white/90 drop-shadow-md font-mono leading-7">
                            A colônia precisa chegar a 100% de ajuda. <span className="text-white font-bold">{selectedPoi.need}</span> é urgente e contribui em dobro, mas cada recurso só pode preencher até 20% do total.
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
            onClick={closeDonationModal}
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
                  <div className="space-y-2 px-4">
                    <p className="text-sm text-white/50 font-mono italic leading-relaxed">
                      Recursos aumentam a inspiração da colônia. QC motiva a contribuição que ela fará ao Projeto Terra depois de chegar a 100%.
                    </p>
                    <p className="text-[11px] text-purple-200/60 font-mono uppercase tracking-widest leading-relaxed">
                      Recursos preenchem 20% cada; QC vai até 500k e concede até +20% na ajuda futura.
                    </p>
                    {donationModal.type === 'qc' && (
                      <p className="text-[11px] text-emerald-300/70 font-mono uppercase tracking-widest leading-relaxed">
                        Incentivo atual: {formatValue(qcInspiration)} / 500K QC ({qcInspirationPercent.toFixed(1)}% de bônus)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 w-full gap-4">
                   {[1, 10, 'max'].map(amt => (
                     <PremiumCanvasButton
                       key={amt}
                       onClick={() => handleDonate(amt as any)}
                       tone={amt === 'max' ? 'purple' : 'cyan'}
                       className="w-full min-h-[64px] rounded-2xl text-base uppercase tracking-[0.2em]"
                       contentClassName="text-white"
                     >
                       <span className="font-orbitron font-black">
                         {amt === 'max' ? 'Doar Máximo Possível' : `Doar ${amt}x Pack`}
                       </span>
                     </PremiumCanvasButton>
                   ))}
                </div>

                <PremiumCanvasButton
                  onClick={closeDonationModal}
                  tone="steel"
                  className="h-12 min-w-[240px] px-5 text-[11px] font-black uppercase tracking-[0.3em]"
                  contentClassName="gap-2 text-white/60"
                >
                  <X className="w-4 h-4" />
                  CANCELAR OPERAÇÃO
                </PremiumCanvasButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default VoidMapTab;
