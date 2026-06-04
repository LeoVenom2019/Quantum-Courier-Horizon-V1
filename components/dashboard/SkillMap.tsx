import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Trophy, Zap, Globe, Clock, Pickaxe, Coins } from 'lucide-react';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

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
            className={`w-full max-w-2xl glass-panel ${isInterstellar ? 'neon-border-orange' : 'neon-border-cyan'} rounded-2xl p-4 relative overflow-hidden flex flex-col max-h-[calc(100vh-24px)]`}
          >
            <div 
              className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url('/assets/texturas/bg_skill_map_modal.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className={`absolute inset-0 z-0 bg-gradient-to-b ${isInterstellar ? 'from-orange-500/5' : 'from-cyan-500/5'} to-transparent pointer-events-none`} />
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div>
                <h2 className={`text-lg font-orbitron font-bold text-white tracking-widest uppercase ${isInterstellar ? 'neon-text-orange' : 'neon-text-cyan'}`}>
                  {language === 'pt' ? 'Mapa de Habilidades' : 'Skill Map'}
                </h2>
                <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">
                  {language === 'pt' ? 'Melhorias permanentes para suas missões' : 'Permanent upgrades for your missions'}
                </p>
              </div>
              <PremiumCanvasButton
                onClick={onClose}
                tone="steel"
                className="h-9 w-9"
                contentClassName="text-slate-300"
                aria-label={language === 'pt' ? 'Fechar' : 'Close'}
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </PremiumCanvasButton>
            </div>

            <div className="flex-1 overflow-hidden space-y-1.5 relative z-10">
              {skills.map((skill) => {
                const cost = Math.floor(skill.baseCost * Math.pow(skill.mult, skill.level));
                const canAfford = qc >= cost;
                const isMax = skill.level >= skill.max;
                const Icon = skill.icon;
                
                const bgMap: Record<string, string> = {
                  'lendaria': '/assets/texturas/bg_missao_lendaria.webp',
                  'mitica': '/assets/texturas/bg_missao_mitica.webp',
                  'alien': '/assets/texturas/bg_missao_alien.webp',
                  'tempo': '/assets/texturas/bg_tempo_dinheiro.webp',
                  'robos': '/assets/texturas/bg_robos_olimpicos.webp'
                };
                const bgImage = bgMap[skill.id];

                return (
                  <div key={skill.id} className={`glass-panel border-white/5 p-2.5 rounded-xl flex items-center gap-3 hover:border-white/20 transition-all relative overflow-hidden group min-h-[96px]`}>
                    {bgImage && (
                      <div 
                        className="absolute inset-0 z-0 opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity"
                        style={{ 
                          backgroundImage: `url(${bgImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    )}
                    <div className={`relative z-10 w-9 h-9 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${skill.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[14px] font-orbitron font-bold text-white uppercase tracking-wider leading-tight">{skill.name}</h3>
                        <span className="text-[12px] font-mono text-slate-500 whitespace-nowrap">LVL {skill.level}/{skill.max}</span>
                      </div>
                      <p className="text-[12px] text-slate-400 font-mono uppercase tracking-widest mt-0.5 leading-tight">{skill.desc}</p>
                      
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${isInterstellar ? 'from-orange-500 to-orange-300' : 'from-cyan-500 to-cyan-300'}`}
                            style={{ width: `${(skill.level / skill.max) * 100}%` }}
                          />
                        </div>
                        
                        {isMax ? (
                          <PremiumCanvasButton
                            tone="green"
                            disabled
                            className="h-8 min-w-[68px] px-2.5 text-[12px] uppercase tracking-widest"
                            contentClassName="text-emerald-300"
                          >
                            MAX
                          </PremiumCanvasButton>
                        ) : (
                          <PremiumCanvasButton
                            onClick={() => onUpgrade(cost, skill.setter, skill.level, skill.name)}
                            disabled={!canAfford}
                            tone={canAfford ? (isInterstellar ? 'orange' : 'cyan') : 'steel'}
                            className="h-8 min-w-[82px] px-2.5 text-[12px] font-bold uppercase tracking-widest"
                            contentClassName={`gap-1.5 ${canAfford ? (isInterstellar ? 'text-orange-100' : 'text-cyan-100') : 'text-slate-500'}`}
                          >
                            {formatValue(cost)} <Coins className="w-2.5 h-2.5" />
                          </PremiumCanvasButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-end relative z-10">
              <PremiumCanvasButton
                onClick={onClose}
                tone={isInterstellar ? 'orange' : 'cyan'}
                className="h-11 min-w-[124px] px-7 text-[12px] font-bold uppercase tracking-[0.2em]"
                contentClassName={isInterstellar ? 'text-orange-100' : 'text-cyan-100'}
              >
                {language === 'pt' ? 'FECHAR' : 'CLOSE'}
              </PremiumCanvasButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SkillMap);
