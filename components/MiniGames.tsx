'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Play, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import ArcadeCard from './ArcadeCard';
import { GameStorage } from '@/lib/game-storage';
import {
  COLONY_CARD_CATALOG,
  DEFAULT_OWNED_COLONY_CARD_IDS,
  getOwnedArcadeIdsFromCards,
} from '@/lib/colony-cards';

interface MiniGamesProps {
  onGameSelect: (id: string) => void;
  language: 'pt' | 'en';
}

export const MiniGames: React.FC<MiniGamesProps> = ({ onGameSelect, language }) => {
  const [selectedGameInfo, setSelectedGameInfo] = React.useState<typeof MINI_GAMES_CONFIG[number] | null>(null);
  const [highScore, setHighScore] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [ownedCardIds, setOwnedCardIds] = React.useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);
  const GAMES_PER_PAGE = 4;

  const totalPages = Math.ceil(MINI_GAMES_CONFIG.length / GAMES_PER_PAGE);
  const unlockedArcadeIds = React.useMemo(() => getOwnedArcadeIdsFromCards(ownedCardIds), [ownedCardIds]);

  React.useEffect(() => {
    let mounted = true;
    const loadOwnedCards = () => GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      if (Array.isArray(saved) && saved.length > 0) {
        setOwnedCardIds(saved);
      }
    });

    const handleCardsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      if (Array.isArray(detail)) {
        setOwnedCardIds(detail);
        return;
      }
      loadOwnedCards();
    };

    loadOwnedCards();
    window.addEventListener('qch:colony-cards-updated', handleCardsUpdated);
    window.addEventListener('focus', loadOwnedCards);
    return () => {
      mounted = false;
      window.removeEventListener('qch:colony-cards-updated', handleCardsUpdated);
      window.removeEventListener('focus', loadOwnedCards);
    };
  }, []);

  const getHighScore = (gameId: string) => {
    if (typeof window === 'undefined') return 0;
    const key = `${gameId.replace(/-/g, '_')}_high_score`;
    const savedScore = localStorage.getItem(key);
    return savedScore ? parseInt(savedScore) : 0;
  };

  const handleInfoOpen = (game: typeof MINI_GAMES_CONFIG[number]) => {
    setHighScore(getHighScore(game.id));
    setSelectedGameInfo(game);
  };

  const currentGames = MINI_GAMES_CONFIG.slice(
    currentPage * GAMES_PER_PAGE,
    (currentPage + 1) * GAMES_PER_PAGE
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-4 h-full"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-orbitron font-black uppercase tracking-tighter flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400 animate-controller-glow" />
            <span className="animate-gaming-rgb">{language === 'pt' ? 'FLIPERAMAS' : 'ARCADE CENTER'}</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-mono mt-1">
            {language === 'pt' ? 'Centro de Recreação Populacional' : 'Population Recreation Center'}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-2.5 rounded-full border transition-all ${
                currentPage === 0 
                ? 'border-white/5 text-white/10 cursor-not-allowed' 
                : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500 hover:scale-110 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
              <span className="font-mono text-[8px] text-slate-500 tracking-[0.3em] uppercase mb-0.5">
                {language === 'pt' ? 'PÁGINA' : 'PAGE'}
              </span>
              <span className="font-orbitron text-[12px] text-cyan-400 font-black tracking-widest">
                {String(currentPage + 1).padStart(2, '0')}<span className="text-white/20 mx-1">/</span>{String(totalPages).padStart(2, '0')}
              </span>
            </div>

            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-2.5 rounded-full border transition-all ${
                currentPage === totalPages - 1 
                ? 'border-white/5 text-white/10 cursor-not-allowed' 
                : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500 hover:scale-110 active:scale-95'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden relative pb-12">
        {/* Floor Effect Grounding the Cabinets */}
        <div className="absolute bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-20 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-9 items-center px-6 xl:px-10 relative z-10 mx-auto"
            style={{ width: '1245.34px', height: '548px' }}
          >
            {currentGames.map((game) => {
              // Theme mapping for arcade cards
              const themes: Record<string, { primary: string, secondary: string, visual: 'sci-fi' | 'war' | 'puzzle' | 'nebula' }> = {
                'salto-espacial': { primary: '#06b6d4', secondary: '#0891b2', visual: 'nebula' },
                'ruptura-estelar': { primary: '#ef4444', secondary: '#b91c1c', visual: 'war' },
                'danger-zoom-zones': { primary: '#00ff9d', secondary: '#059669', visual: 'sci-fi' },
                'grid-collapse': { primary: '#fbbf24', secondary: '#92400e', visual: 'sci-fi' },
                'robot-runner': { primary: '#38bdf8', secondary: '#0ea5e9', visual: 'sci-fi' },
                'neo-catcher': { primary: '#00f2ff', secondary: '#0891b2', visual: 'nebula' }
              };
              const theme = themes[game.id] || { primary: '#06b6d4', secondary: '#0891b2', visual: 'sci-fi' };
              const isUnlockedByCard = unlockedArcadeIds.has(game.id);

              return (
                <div key={game.id} className="flex flex-col items-center gap-2 w-full max-w-[215px] xl:max-w-[235px] mx-auto group/cabinet">
                  <div className="relative w-full">
                    <ArcadeCard
                      titulo={game.name[language]}
                      descricao={game.description[language]}
                      corPrimaria={theme.primary}
                      corSecundaria={theme.secondary}
                      temaVisual={theme.visual}
                      status={isUnlockedByCard ? (language === 'pt' ? 'DISPONÍVEL' : 'AVAILABLE') : (language === 'pt' ? 'CARTA BLOQUEADA' : 'CARD LOCKED')}
                      onPlay={() => isUnlockedByCard && onGameSelect(game.id)}
                      onInfo={() => handleInfoOpen(game)}
                      screenshot={game.image}
                      language={language}
                    />
                  </div>
                  
                  {/* Cabinet ID Tag */}
                  <div className="flex items-center gap-3 px-3 py-1 bg-black/40 border border-white/10 rounded-full group-hover/cabinet:border-cyan-500/50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                      UNIT CASE #{String(MINI_GAMES_CONFIG.indexOf(game) + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info Modal */}
      {selectedGameInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-8 rounded-lg border-2 border-cyan-500/30 bg-slate-900/90"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-orbitron font-black text-white uppercase tracking-tighter neon-text-cyan">
                  {selectedGameInfo.name[language]}
                </h2>
                <span className="text-[10px] font-orbitron text-cyan-400/60 uppercase tracking-widest font-bold">
                  {language === 'pt' ? 'Especificações da Missão' : 'Mission Specifications'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedGameInfo(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  &quot;{selectedGameInfo.description[language]}&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-widest font-bold">
                    {language === 'pt' ? 'Melhor Recorde' : 'Highest Ranking'}
                  </span>
                  <span className="text-3xl font-mono font-bold text-white tracking-widest text-shadow-glow">
                    {highScore.toString().padStart(5, '0')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-white/5">
                {!unlockedArcadeIds.has(selectedGameInfo.id) && (
                  <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
                    <p className="text-[10px] font-orbitron font-black text-amber-300 uppercase tracking-[0.2em] mb-1">
                      {language === 'pt' ? 'Carta Necessária' : 'Required Card'}
                    </p>
                    <p className="text-xs text-amber-100/80 leading-relaxed">
                      {(() => {
                        const requiredCard = COLONY_CARD_CATALOG
                          .find(card => card.unlocksArcadeId === selectedGameInfo.id);
                        return requiredCard
                          ? requiredCard.name[language]
                          : (language === 'pt'
                              ? 'Encontre a carta de fliperama correspondente no Capítulo 4 - Nova Terra.'
                              : 'Find the matching arcade card in Chapter 4 - New Earth.');
                      })()}
                    </p>
                  </div>
                )}
                <p className="mb-2">
                  {language === 'pt' ? 'INSTRUÇÕES:' : 'INSTRUCTIONS:'}
                </p>
                <p>
                  {selectedGameInfo.id === 'salto-espacial' && (
                    language === 'pt' 
                      ? 'Pilote sua nave através do vazio estelar. Colete núcleos de energia para aumentar sua biomassa e alcance. Evite colisões com as bordas do mapa e seu próprio rastro energético.'
                      : 'Pilot your ship through the stellar void. Collect energy cores to increase your biomass and range. Avoid collisions with map edges and your own energy trail.'
                  )}
                  {selectedGameInfo.id === 'ruptura-estelar' && (
                    language === 'pt'
                      ? 'Defenda o setor contra ondas de invasores. Destrua inimigos para carregar seu sistema de OVERDRIVE. Quando ativo, seu poder de fogo e velocidade aumentam drasticamente. Use ESPAÇO para disparar e desvie de impactos fatais.'
                      : 'Defend the sector against waves of invaders. Destroy enemies to charge your OVERDRIVE system. When active, your firepower and speed increase drastically. Use SPACE to fire and dodge fatal impacts.'
                  )}
                  {selectedGameInfo.id === 'danger-zoom-zones' && (
                    language === 'pt'
                      ? 'Desarme as minas espaciais antes que o tempo se esgote. Clique para selecionar uma zona: use um DESARMADOR (S) se suspeitar de uma mina, ou faça um SCAN (N) se achar seguro. Desarmes corretos dão bônus de tempo e combos, mas erros custam kits ou tempo vital.'
                      : 'Disarm space mines before time runs out. Click to select a zone: use a DISARMER (S) if you suspect a mine, or do a SCAN (N) if you think it\'s safe. Correct disarms grant time bonuses and combos, but errors cost kits or vital time.'
                  )}
                  {selectedGameInfo.id === 'grid-collapse' && (
                    language === 'pt'
                      ? 'Encaixe os Tetriminos para completar linhas e limpar dados corrompidos. Fique atento a peças especiais como as BOMBAS que destroem áreas e multiplicadores de pontuação. Use WASD para mover, rotacionar e acelerar a queda.'
                      : 'Fit the Tetriminos to complete lines and clear corrupted data. Watch out for special pieces like BOMBS that destroy areas and score multipliers. Use WASD to move, rotate, and accelerate the drop.'
                  )}
                  {selectedGameInfo.id === 'robot-runner' && (
                    language === 'pt'
                      ? 'Guie o robô pelo labirinto coletando esferas de energia azul. Colete as esferas vermelhas para ganhar invencibilidade temporária e destruir os fantasmas. Use ESPAÇO para ativar o boost de velocidade quando a barra estiver carregada. Movimente-se com WASD.'
                      : 'Guide the robot through the maze collecting blue energy spheres. Collect red spheres for temporary invincibility and to destroy ghosts. Use SPACE to activate the speed boost when the bar is charged. Move with WASD.'
                  )}
                  {selectedGameInfo.id === 'neo-catcher' && (
                    language === 'pt'
                      ? 'Controle o robô coletor na base da tela e capture os itens que caem do céu. Itens raros (dourados) valem mais pontos. Colete sequencialmente para aumentar seu combo e multiplicador. Sobreviva às 4 fases (Rua, Praia, Ponte e Vulcão) alcancando a pontuação mínima de cada uma. Use A/D para se mover.'
                      : 'Control the collector robot at the bottom and catch items falling from the sky. Rare (gold) items are worth more points. Catch sequentially to increase your combo and multiplier. Survive all 4 phases (Street, Beach, Bridge, and Volcano) by reaching the minimum score for each. Use A/D to move.'
                  )}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!unlockedArcadeIds.has(selectedGameInfo.id)) return;
                  onGameSelect(selectedGameInfo.id);
                  setSelectedGameInfo(null);
                }}
                disabled={!unlockedArcadeIds.has(selectedGameInfo.id)}
                className={`w-full py-4 rounded-2xl font-orbitron font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  unlockedArcadeIds.has(selectedGameInfo.id)
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                <Play className="w-5 h-5" />
                {unlockedArcadeIds.has(selectedGameInfo.id)
                  ? (language === 'pt' ? 'Iniciar Missão' : 'Start Mission')
                  : (language === 'pt' ? 'Carta Bloqueada' : 'Card Locked')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MiniGames;
