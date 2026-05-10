import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Trophy, Zap, Globe, Clock, Pickaxe, Coins } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  desc: string;
  level: number;
  max: number;
  baseCost: number;
  mult: number;
  setter: (val: number) => void;
  icon: any;
  color: string;
}

interface SkillMapProps {
  show: boolean;
  onClose: () => void;
  isInterstellar: boolean;
  language: string;
  qc: number;
  setQc: (val: number) => void;
  onUpgrade: (cost: number, setter: (val: number) => void, level: number, name: string) => void;
  skills: Skill[];
  formatValue: (val: number) => string;
  playSfx: (sfx: string) => void;
  addLog: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  t: (key: string) => string;
  updateHistoryStats: (type: 'acquired' | 'spent', amount: number, source?: any) => void;
}

const SkillMap: React.FC<SkillMapProps> = ({ 
  show, 
  onClose, 
  isInterstellar, 
  language, 
  qc, 
  setQc,
  onUpgrade,
  skills,
  formatValue,
  playSfx,
  addLog,
  t,
  updateHistoryStats
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-2xl glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${isInterstellar ? 'from-orange-500/5' : 'from-cyan-500/5'} to-transparent pointer-events-none`} />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <h2 className={`text-xl font-orbitron font-bold text-white tracking-widest uppercase ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                  {language === 'pt' ? 'Mapa de Habilidades' : 'Skill Map'}
                </h2>
                <p className="text-[14px] text-slate-500 font-mono uppercase tracking-widest">
                  {language === 'pt' ? 'Melhorias permanentes para suas missões' : 'Permanent upgrades for your missions'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 relative z-10">
              {skills.map((skill) => {
                const cost = Math.floor(skill.baseCost * Math.pow(skill.mult, skill.level));
                const canAfford = qc >= cost;
                const isMax = skill.level >= skill.max;
                const Icon = skill.icon;

                return (
                  <div key={skill.id} className={`glass-panel border-white/5 p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all`}>
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${skill.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-orbitron font-bold text-white uppercase tracking-wider">{skill.name}</h3>
                        <span className="text-base font-mono text-slate-500">LVL {skill.level}/{skill.max}</span>
                      </div>
                      <p className="text-base text-slate-400 font-mono uppercase tracking-widest mt-0.5">{skill.desc}</p>
                      
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${isInterstellar ? 'from-orange-500 to-orange-300' : 'from-cyan-500 to-cyan-300'}`}
                            style={{ width: `${(skill.level / skill.max) * 100}%` }}
                          />
                        </div>
                        
                        {isMax ? (
                          <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-orbitron text-[14px] tracking-widest uppercase">
                            MAX
                          </div>
                        ) : (
                          <button
                            onClick={() => onUpgrade(cost, skill.setter, skill.level, skill.name)}
                            className={`px-3 py-1 rounded font-orbitron text-[14px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                              canAfford 
                                ? 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold' 
                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {formatValue(cost)} <Coins className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end relative z-10">
              <button
                onClick={onClose}
                className={`px-8 py-3 rounded-xl font-orbitron font-bold text-[14px] tracking-[0.2em] transition-all uppercase ${
                  isInterstellar ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {language === 'pt' ? 'FECHAR' : 'CLOSE'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SkillMap);
