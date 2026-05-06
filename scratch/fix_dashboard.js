const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'PROJETOS', 'QCH', 'components', 'GameDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isAutoSkipped to interface Battle
content = content.replace(/isCinematicFinished\?\:\s*boolean;\r?\n\s*playerImage\?\:\s*string;/g, 'isCinematicFinished?: boolean;\n  isAutoSkipped?: boolean;\n  playerImage?: string;');

// 2. Add isAutoSkipped = true when auto skipping
const regexSkip = /(battle\.playerHp\s*=\s*0;\r?\n\s*\}\r?\n)(\s*setActiveBattle\(battle\);)/g;
content = content.replace(regexSkip, '$1$2'.replace('setActiveBattle', 'battle.isAutoSkipped = true;\n$2'.trim() + 'setActiveBattle'));
// Wait, safer replacement:
content = content.replace(/(battle\.playerHp = 0;\s*\})(\s*setActiveBattle\(battle\);)/, '$1\n                battle.isAutoSkipped = true;$2');


// 3. Update renderBattleOverlay
const targetOverlay = `    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}`;

const specializedOverlay = `    if (activeBattle.isAutoSkipped) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-hidden"
          >
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center space-y-6">
              <h3 className={\`text-4xl font-orbitron font-bold tracking-[0.3em] uppercase \${activeBattle.isVictory ? 'text-emerald-400 neon-text-emerald' : 'text-rose-500 neon-text-rose'}\`}>
                {activeBattle.isVictory ? (language === 'pt' ? 'VITÓRIA' : 'VICTORY') : (language === 'pt' ? 'DERROTA' : 'DEFEAT')}
              </h3>
              
              {activeBattle.isVictory ? (
                <div className="space-y-2">
                  <p className="text-slate-300 font-orbitron text-[14px] tracking-widest uppercase">
                    {language === 'pt' ? 'RECOMPENSAS RECEBIDAS' : 'REWARDS RECEIVED'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-orbitron font-bold">+{formatValue(activeBattle.reward)} QC</span>
                    </div>
                    {(activeBattle.xpReward ?? 0) > 0 && (
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-xl">
                        <Trophy className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-orbitron font-bold">+{activeBattle.xpReward} XP</span>
                      </div>
                    )}
                    {(activeBattle.aetherionReward ?? 0) > 0 && (
                      <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-orbitron font-bold">+{activeBattle.aetherionReward} ET</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-orbitron text-[14px] tracking-widest uppercase">
                  {language === 'pt' ? 'SUA NAVE FOI DESTRUÍDA E A CARGA PERDIDA' : 'YOUR SHIP WAS DESTROYED AND CARGO LOST'}
                </p>
              )}

              <button
                onClick={finishBattle}
                className={\`px-12 py-4 mt-4 rounded-xl font-orbitron font-bold text-[14px] tracking-[0.4em] uppercase transition-all \${
                  activeBattle.isVictory 
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]'
                }\`}
              >
                {language === 'pt' ? 'CONTINUAR' : 'CONTINUE'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}`;

content = content.replace(/return\s*\(\s*<AnimatePresence>\s*<motion\.div\s*initial=\{\{\s*opacity:\s*0\s*\}\}\s*animate=\{\{\s*opacity:\s*1\s*\}\}/, specializedOverlay);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
