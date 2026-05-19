'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Play, Info, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MINI_GAMES_CONFIG } from '@/lib/mini-games-config';
import ArcadeCard from './ArcadeCard';
import { GameStorage } from '@/lib/game-storage';
import {
  COLONY_CARD_CATALOG,
  ColonyCard,
  DEFAULT_OWNED_COLONY_CARD_IDS,
  getOwnedArcadeIdsFromCards,
  isWildcardCard,
  normalizeOwnedColonyCardIds,
} from '@/lib/colony-cards';

interface MiniGamesProps {
  onGameSelect: (id: string) => void;
  language: 'pt' | 'en';
}

const GAMES_PER_PAGE = 4;
const WILDCARD_CARDS_PER_PAGE = 9;
const WILDCARD_ICON_SRC = '/assets/rota4/cards/joker_ico.webp';
const WILDCARD_CARD_BACKGROUND_SRC = '/assets/rota4/cards/6_background_j.webp';
const arcadeUiSoundCache = new Map<string, HTMLAudioElement>();

const playArcadeUiSound = (src: string) => {
  if (typeof Audio === 'undefined') return;
  let audio = arcadeUiSoundCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    arcadeUiSoundCache.set(src, audio);
  }
  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.volume = 0.7;
  instance.play().catch(() => {});
};

export const MiniGames: React.FC<MiniGamesProps> = ({ onGameSelect, language }) => {
  const [selectedGameInfo, setSelectedGameInfo] = React.useState<typeof MINI_GAMES_CONFIG[number] | null>(null);
  const [highScore, setHighScore] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [wildcardPage, setWildcardPage] = React.useState(0);
  const [showWildcardCards, setShowWildcardCards] = React.useState(false);
  const [selectedWildcardCard, setSelectedWildcardCard] = React.useState<ColonyCard | null>(null);
  const [ownedCardIds, setOwnedCardIds] = React.useState<string[]>(DEFAULT_OWNED_COLONY_CARD_IDS);

  const totalPages = Math.ceil(MINI_GAMES_CONFIG.length / GAMES_PER_PAGE);
  const unlockedArcadeIds = React.useMemo(() => getOwnedArcadeIdsFromCards(ownedCardIds), [ownedCardIds]);
  const wildcardCards = React.useMemo(() => (
    COLONY_CARD_CATALOG.filter(isWildcardCard)
  ), []);
  const ownedWildcardCount = React.useMemo(() => (
    wildcardCards.filter(card => ownedCardIds.includes(card.id)).length
  ), [ownedCardIds, wildcardCards]);
  const wildcardTotalPages = Math.max(1, Math.ceil(wildcardCards.length / WILDCARD_CARDS_PER_PAGE));
  const safeWildcardPage = Math.min(wildcardPage, wildcardTotalPages - 1);
  const currentWildcardCards = wildcardCards.slice(
    safeWildcardPage * WILDCARD_CARDS_PER_PAGE,
    safeWildcardPage * WILDCARD_CARDS_PER_PAGE + WILDCARD_CARDS_PER_PAGE
  );
  const selectedWildcardIndex = selectedWildcardCard
    ? wildcardCards.findIndex(card => card.id === selectedWildcardCard.id)
    : -1;

  const openWildcardCollection = () => {
    setWildcardPage(0);
    setSelectedWildcardCard(null);
    setShowWildcardCards(true);
    playArcadeUiSound('/audio/sfx/open_window.ogg');
  };

  const changeWildcardPage = (direction: -1 | 1) => {
    const nextPage = Math.max(0, Math.min(wildcardTotalPages - 1, safeWildcardPage + direction));
    if (nextPage === safeWildcardPage) return;
    setSelectedWildcardCard(null);
    setWildcardPage(nextPage);
    playArcadeUiSound('/audio/sfx/view_card.ogg');
  };

  const openWildcardCard = (card: ColonyCard) => {
    setSelectedWildcardCard(card);
    playArcadeUiSound('/audio/sfx/view_card.ogg');
  };

  const closeWildcardCollection = () => {
    setSelectedWildcardCard(null);
    setShowWildcardCards(false);
    playArcadeUiSound('/audio/sfx/close_window.ogg');
  };

  const closeWildcardCard = () => {
    setSelectedWildcardCard(null);
    playArcadeUiSound('/audio/sfx/close_window.ogg');
  };

  const navigateWildcardCard = (direction: -1 | 1) => {
    if (wildcardCards.length <= 1) return;
    const currentIndex = selectedWildcardIndex >= 0 ? selectedWildcardIndex : 0;
    const nextIndex = (currentIndex + direction + wildcardCards.length) % wildcardCards.length;
    const nextCard = wildcardCards[nextIndex];
    setSelectedWildcardCard(nextCard);
    setWildcardPage(Math.floor(nextIndex / WILDCARD_CARDS_PER_PAGE));
    playArcadeUiSound('/audio/sfx/view_card.ogg');
  };

  React.useEffect(() => {
    let mounted = true;
    const loadOwnedCards = () => GameStorage.load('colony_cards_data').then(saved => {
      if (!mounted) return;
      const normalized = normalizeOwnedColonyCardIds(Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_OWNED_COLONY_CARD_IDS);
      setOwnedCardIds(normalized);
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
          <button
            type="button"
            onClick={openWildcardCollection}
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-fuchsia-300/35 bg-black/45 px-3 py-2 shadow-[0_0_24px_rgba(217,70,239,0.16)] transition-all hover:border-cyan-200/70 hover:shadow-[0_0_32px_rgba(34,211,238,0.22)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.16),rgba(217,70,239,0.18),rgba(250,204,21,0.14),rgba(34,211,238,0.16))] opacity-70" />
            <div className="relative h-12 w-9 overflow-hidden rounded-md border border-white/20 bg-black">
              <img src={WILDCARD_ICON_SRC} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="relative text-left">
              <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-fuchsia-200">{language === 'pt' ? 'Cartas' : 'Cards'}</p>
              <p className="font-orbitron text-[11px] font-black uppercase tracking-widest text-white">{language === 'pt' ? 'Curingas' : 'Wildcards'}</p>
              <p className="font-mono text-[9px] text-cyan-200">{ownedWildcardCount}/{wildcardCards.length}</p>
            </div>
            <Sparkles className="relative h-4 w-4 text-cyan-200 transition-transform group-hover:scale-110" />
          </button>

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
      <div className="flex-1 flex flex-col justify-center overflow-hidden relative pb-6">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 items-center px-4 relative z-10 mx-auto"
            style={{ width: '100%', height: '610px' }}
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
                <div key={game.id} className="flex flex-col items-center gap-2 w-full max-w-[280px] mx-auto group/cabinet">
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
                      cabinetImage={game.cabinetImage}
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
      {showWildcardCards && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-fuchsia-300/35 bg-zinc-950/95 p-6 shadow-[0_0_70px_rgba(217,70,239,0.22)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.16),transparent_34%),linear-gradient(135deg,rgba(250,204,21,0.08),transparent_42%)]" />
            <div className="relative mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-fuchsia-200">{language === 'pt' ? 'Coleção Especial' : 'Special Collection'}</p>
                <h3 className="mt-2 font-orbitron text-2xl font-black uppercase text-white">{language === 'pt' ? 'Cartas Curingas dos Fliperamas' : 'Arcade Wildcard Cards'}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 p-1">
                  <button
                    type="button"
                    onClick={() => changeWildcardPage(-1)}
                    disabled={safeWildcardPage === 0}
                    className="rounded-full p-2 text-fuchsia-100 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/15"
                    aria-label={language === 'pt' ? 'Página anterior' : 'Previous page'}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="min-w-14 text-center font-mono text-[10px] font-black uppercase tracking-widest text-cyan-100">
                    {safeWildcardPage + 1}/{wildcardTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeWildcardPage(1)}
                    disabled={safeWildcardPage >= wildcardTotalPages - 1}
                    className="rounded-full p-2 text-fuchsia-100 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/15"
                    aria-label={language === 'pt' ? 'Próxima página' : 'Next page'}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeWildcardCollection}
                  className="rounded-full border border-white/10 bg-black/45 p-2 text-slate-400 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={safeWildcardPage}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
              {currentWildcardCards.map(card => {
                const owned = ownedCardIds.includes(card.id);
                const arcade = MINI_GAMES_CONFIG.find(game => game.id === card.unlocksArcadeId);
                return (
                  <button
                    type="button"
                    onClick={() => openWildcardCard(card)}
                    key={card.id}
                    className={`relative min-h-[150px] overflow-hidden rounded-2xl border p-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      owned
                        ? 'border-fuchsia-200/60 bg-fuchsia-300/10 shadow-[0_0_24px_rgba(217,70,239,0.16)]'
                        : 'border-zinc-700 bg-black/35 opacity-65 grayscale'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black">
                        <img src={WILDCARD_CARD_BACKGROUND_SRC} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-cyan-200">{owned ? (language === 'pt' ? 'Obtida' : 'Owned') : (language === 'pt' ? 'Bloqueada' : 'Locked')}</p>
                        <h4 className="mt-1 font-orbitron text-sm font-black uppercase leading-tight text-white">{card.name[language]}</h4>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-300">{card.lore[language]}</p>
                        {arcade && (
                          <p className="mt-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-cyan-100">
                            {language === 'pt' ? 'Desbloqueia' : 'Unlocks'} {arcade.name[language]}
                          </p>
                        )}
                        {card.arcadePerk && (
                          <p className="mt-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-fuchsia-100">
                            {card.arcadePerk.value} {card.arcadePerk.label[language]}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {selectedWildcardCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[130] flex items-center justify-center bg-black/78 p-4 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 18 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.94, y: 12 }}
                    className="relative grid h-[min(720px,calc(100vh-2rem))] w-full max-w-5xl gap-8 overflow-hidden rounded-3xl border border-fuchsia-200/45 bg-zinc-950 p-6 pt-16 shadow-[0_0_80px_rgba(217,70,239,0.28)] md:grid-cols-[360px_minmax(0,1fr)] md:grid-rows-[1fr]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_86%_20%,rgba(217,70,239,0.16),transparent_36%),linear-gradient(135deg,rgba(250,204,21,0.08),transparent_46%)]" />
                    {wildcardCards.length > 1 && (
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 p-1 shadow-[0_0_22px_rgba(0,0,0,0.35)]">
                        <button
                          type="button"
                          onClick={() => navigateWildcardCard(-1)}
                          className="rounded-full p-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                          aria-label={language === 'pt' ? 'Carta anterior' : 'Previous card'}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="min-w-12 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {selectedWildcardIndex + 1}/{wildcardCards.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigateWildcardCard(1)}
                          className="rounded-full p-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                          aria-label={language === 'pt' ? 'Próxima carta' : 'Next card'}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={closeWildcardCard}
                      className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 p-2 text-slate-400 transition-colors hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="relative self-center justify-self-start aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-[4%] border border-white/20 bg-black shadow-[0_0_48px_rgba(217,70,239,0.18)]">
                      <img src={WILDCARD_CARD_BACKGROUND_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-[8%] rounded-[8%] bg-gradient-to-b from-black/8 via-black/10 to-black/38" />
                      <div className="absolute bottom-[24%] left-[11%] right-[18%] space-y-2">
                        <div className="inline-flex rounded-full border border-fuchsia-300/45 bg-zinc-950/88 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-fuchsia-100">
                          {language === 'pt' ? 'Curinga' : 'Wildcard'}
                        </div>
                        <h4 className="rounded-lg bg-zinc-950/90 px-2 py-1.5 font-orbitron text-sm font-black uppercase leading-tight text-white">
                          {selectedWildcardCard.name[language]}
                        </h4>
                        <p className="rounded-lg bg-zinc-950/88 px-2 py-1.5 text-[11px] leading-snug text-zinc-100">
                          {selectedWildcardCard.lore[language]}
                        </p>
                      </div>
                      <div className="absolute bottom-[11%] left-[11%] right-[11%] space-y-2">
                        {selectedWildcardCard.arcadePerk && (
                          <span className="inline-flex rounded-full border border-fuchsia-300/60 bg-zinc-950/90 px-2 py-1 font-mono text-[10px] text-fuchsia-100">
                            {selectedWildcardCard.arcadePerk.value} {selectedWildcardCard.arcadePerk.label[language]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative flex min-h-0 min-w-0 flex-col justify-start pt-16 pr-10">
                      {(() => {
                        const owned = ownedCardIds.includes(selectedWildcardCard.id);
                        const arcade = MINI_GAMES_CONFIG.find(game => game.id === selectedWildcardCard.unlocksArcadeId);
                        return (
                          <>
                            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-fuchsia-200">
                              {owned ? (language === 'pt' ? 'Carta Obtida' : 'Card Owned') : (language === 'pt' ? 'Carta Bloqueada' : 'Locked Card')}
                            </p>
                            <h3 className="mt-2 font-orbitron text-3xl font-black uppercase leading-tight text-white">
                              {selectedWildcardCard.name[language]}
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-300">{selectedWildcardCard.role[language]}</p>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{selectedWildcardCard.lore[language]}</p>

                            <div className="mt-6 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 p-4">
                              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-200">{language === 'pt' ? 'Perk automático' : 'Automatic perk'}</p>
                              <p className="mt-2 font-orbitron text-xl font-black uppercase text-white">
                                {selectedWildcardCard.arcadePerk?.value} {selectedWildcardCard.arcadePerk?.label[language]}
                              </p>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                                {selectedWildcardCard.arcadePerk?.description[language]}
                              </p>
                            </div>

                            {arcade && (
                              <div className="mt-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200">{language === 'pt' ? 'Fliperama vinculado' : 'Linked arcade'}</p>
                                <p className="mt-2 font-orbitron text-lg font-black uppercase text-white">{arcade.name[language]}</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

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
