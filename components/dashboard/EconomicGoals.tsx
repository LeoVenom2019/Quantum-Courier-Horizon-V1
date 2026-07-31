import React from 'react';
import { motion } from 'motion/react';

interface Goal {
  id: string;
  label: string;
  progress: number;
  current: number | string;
  target: number | string;
  remaining?: number;
  isCurrency?: boolean;
}

interface EconomicGoalsProps {
  goals: Goal[];
  isInterstellar: boolean;
  language: 'pt' | 'en';
}

const EconomicGoals: React.FC<EconomicGoalsProps> = ({ goals, isInterstellar, language }) => {
  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <div key={goal.id} className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{goal.label}</span>
            <div className="text-right font-mono">
              <div className="text-[15px] text-slate-400">{goal.current} / {goal.target}</div>
              {typeof goal.remaining === 'number' && (
                <div className={`text-[13px] font-bold ${goal.remaining === 0 ? 'text-emerald-400' : isInterstellar ? 'text-orange-300' : 'text-cyan-300'}`}>
                  {goal.remaining === 0
                    ? (language === 'pt' ? 'Meta concluída' : 'Goal completed')
                    : (language === 'pt' ? `Faltam ${goal.remaining}` : `${goal.remaining} remaining`)}
                </div>
              )}
            </div>
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
