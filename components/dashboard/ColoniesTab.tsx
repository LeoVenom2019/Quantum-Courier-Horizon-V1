'use client';

import React, { memo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ColonySystem } from '../ColonySystem';
import { useDashboard } from './DashboardProvider';
import { preloadAssetGroupPassive } from '@/lib/asset-preloader';

interface ColoniesTabProps {
  addEarthYears: (years: number) => void;
  isColoniesOpenRef: React.MutableRefObject<boolean>;
  handleBuildingComplete: (type: any, level: number) => void;
  onDefenseThreatAlertChange?: (alert: { title: string; remainingSeconds: number } | null) => void;
  openDefenseRequest?: number;
  abandonDefenseRequest?: number;
  defenseAlertsPaused?: boolean;
  selectedColonyId?: string;
  setSelectedColonyId?: (id: string) => void;
}

const ColoniesTab = memo(({
  addEarthYears,
  isColoniesOpenRef,
  handleBuildingComplete,
  onDefenseThreatAlertChange,
  openDefenseRequest = 0,
  abandonDefenseRequest = 0,
  defenseAlertsPaused = false,
  selectedColonyId = 'colony-1',
  setSelectedColonyId
}: ColoniesTabProps) => {
  const { 
    language, 
    economy,
    earth, 
    missions,
    colonies, 
    setColonies,
    playSfx,
    formatValue,
    dispatch
  } = useDashboard();

  useEffect(() => {
    preloadAssetGroupPassive('route4-colonies');
    preloadAssetGroupPassive('route4-battle');
    preloadAssetGroupPassive('card-frames');
  }, []);

  return (
    <motion.div
      key="colonies"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full"
    >
      <ColonySystem 
        language={language as any}
        onAddYear={addEarthYears}
        onTabStatusChange={(isOpen) => { isColoniesOpenRef.current = isOpen; }}
        onBuildingComplete={handleBuildingComplete}
        earthPopulation={earth.population}
        setEarthPopulation={(val) => dispatch({ type: 'UPDATE_EARTH_STATE', payload: { population: typeof val === 'function' ? val(earth.population) : val } })}
        colonies={colonies}
        setColonies={setColonies}
        historyStats={missions.historyStats}
        unlockedAchievements={missions.unlockedAchievements}
        playSfx={playSfx}
        qc={economy.qc}
        formatValue={formatValue}
        onEarnQC={(amount) => {
          dispatch({ type: 'EARN_QC', payload: { amount, source: 'battle' } });
          dispatch({ type: 'UPDATE_HISTORY', payload: { tier: 'NewEarth', field: 'qcFromBattles', amount } });
          dispatch({ type: 'UPDATE_HISTORY', payload: { tier: 'NewEarth', field: 'qcTotalAcquired', amount } });
        }}
        onSpendQC={(amount) => {
          dispatch({ type: 'SPEND_QC', payload: { amount } });
        }}
        onDefenseThreatAlertChange={onDefenseThreatAlertChange}
        openDefenseRequest={openDefenseRequest}
        abandonDefenseRequest={abandonDefenseRequest}
        defenseAlertsPaused={defenseAlertsPaused}
        selectedColonyId={selectedColonyId}
        setSelectedColonyId={setSelectedColonyId}
      />
    </motion.div>
  );
});

ColoniesTab.displayName = 'ColoniesTab';

export default ColoniesTab;
