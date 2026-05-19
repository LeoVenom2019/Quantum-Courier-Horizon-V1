'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { ColonySystem } from '../ColonySystem';
import { useDashboard } from './DashboardProvider';

interface ColoniesTabProps {
  addEarthYears: (years: number) => void;
  isColoniesOpenRef: React.MutableRefObject<boolean>;
  handleBuildingComplete: (type: any, level: number) => void;
  setEarthProjectBoostCount: React.Dispatch<React.SetStateAction<number>>;
}

const ColoniesTab = memo(({
  addEarthYears,
  isColoniesOpenRef,
  handleBuildingComplete,
  setEarthProjectBoostCount
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
        onAllocate10k={() => setEarthProjectBoostCount(prev => prev + 1)}
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
      />
    </motion.div>
  );
});

ColoniesTab.displayName = 'ColoniesTab';

export default ColoniesTab;
