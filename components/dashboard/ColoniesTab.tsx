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
    earth, 
    colonies, 
    setColonies,
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
      />
    </motion.div>
  );
});

export default ColoniesTab;
