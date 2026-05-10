import React from 'react';
import { motion } from 'motion/react';

interface Goal {
  id: string;
  label: string;
  progress: number;
  current: number | string;
  target: number | string;
  isCurrency?: boolean;
}

interface EconomicGoalsProps {
  goals: Goal[];
  isInterstellar: boolean;
}

const EconomicGoals: React.FC<EconomicGoalsProps> = ({ goals, isInterstellar }) => {
  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <div key={goal.id} className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{goal.label}</span>
            <span className="text-[15px] font-mono text-slate-500">
              {goal.current} / {goal.target}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, goal.progress)}%` }}
              className={`h-full bg-gradient-to-r ${goal.progress >= 100 ? 'from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : (isInterstellar ? 'from-orange-500 to-orange-300' : 'from-cyan-500 to-cyan-300')}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(EconomicGoals);
