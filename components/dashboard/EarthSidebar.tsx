import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Globe, Clock, Users, Activity, History as HistoryIcon, X } from 'lucide-react';
import { PremiumCanvasButton } from '../ui/PremiumCanvasButton';

const EVENT_IMPORTANCE_STYLES: Record<string, { title: string; card: string; description: string; badgePt?: string; badgeEn?: string }> = {
  important: {
    title: 'text-white',
    card: 'bg-white/5 border border-white/10 hover:border-white/20',
    description: 'text-white/50',
    badgePt: 'COMUM',
    badgeEn: 'COMMON',
  },
  relevant: {
    title: 'text-cyan-300',
    card: 'bg-cyan-400/8 border border-cyan-300/25 hover:border-cyan-300/40 shadow-[0_0_12px_rgba(34,211,238,0.08)]',
    description: 'text-cyan-50/65',
    badgePt: 'RARO',
    badgeEn: 'RARE',
  },
  major: {
    title: 'text-orange-300',
    card: 'bg-orange-400/9 border border-orange-300/28 hover:border-orange-300/45 shadow-[0_0_12px_rgba(251,146,60,0.08)]',
    description: 'text-orange-50/65',
    badgePt: 'ÉPICO',
    badgeEn: 'EPIC',
  },
  population: {
    title: 'text-violet-300',
    card: 'bg-violet-400/10 border border-violet-300/32 hover:border-violet-300/50 shadow-[0_0_14px_rgba(167,139,250,0.12)]',
    description: 'text-violet-50/70',
    badgePt: 'MARCO',
    badgeEn: 'MILESTONE',
  },
  mythic: {
    title: 'text-fuchsia-200',
    card: 'bg-fuchsia-400/12 border-2 border-fuchsia-300/42 shadow-[0_0_18px_rgba(217,70,239,0.16)]',
    description: 'text-fuchsia-50/75 font-medium',
    badgePt: 'MÍTICO',
    badgeEn: 'MYTHIC',
  },
  arcade: {
    title: 'bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]',
    card: 'border-2 border-fuchsia-300/75 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_85%_110%,rgba(250,204,21,0.18),transparent_38%),linear-gradient(90deg,rgba(34,211,238,0.14),rgba(217,70,239,0.18),rgba(34,197,94,0.13))] shadow-[0_0_22px_rgba(217,70,239,0.24),inset_0_0_18px_rgba(34,211,238,0.10)] hover:border-cyan-200/85 hover:shadow-[0_0_26px_rgba(34,211,238,0.26),inset_0_0_20px_rgba(217,70,239,0.14)]',
    description: 'text-cyan-50/75',
    badgePt: 'FLIPERAMA',
    badgeEn: 'ARCADE',
  },
};

const cleanEventText = (value: unknown) => String(value || '')
  .replace(/ÃƒÂ¡|Ã¡/g, 'á')
  .replace(/ÃƒÂ |Ã /g, 'à')
  .replace(/ÃƒÂ¢|Ã¢/g, 'â')
  .replace(/ÃƒÂ£|Ã£/g, 'ã')
  .replace(/ÃƒÂ©|Ã©/g, 'é')
  .replace(/ÃƒÂª|Ãª/g, 'ê')
  .replace(/ÃƒÂ­|Ã­/g, 'í')
  .replace(/ÃƒÂ³|Ã³/g, 'ó')
  .replace(/ÃƒÂ´|Ã´/g, 'ô')
  .replace(/ÃƒÂµ|Ãµ/g, 'õ')
  .replace(/ÃƒÂº|Ãº/g, 'ú')
  .replace(/ÃƒÂ§|Ã§/g, 'ç')
  .replace(/ÃƒÂ|Ã/g, 'Á')
  .replace(/ÃƒÂ‰|Ã‰/g, 'É')
  .replace(/ÃƒÂ“|Ã“/g, 'Ó')
  .replace(/ÃƒÂš|Ãš/g, 'Ú')
  .replace(/ÃƒÂ‡|Ã‡/g, 'Ç')
  .replace(/ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â®/g, '')
  .replace(/ÃƒÂ¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â/g, '')
  .replace(/Ã°Å¸Ëœâ€¦/g, '')
  .trim();

const RECENT_EVENTS_LIMIT = 4;
const COMMON_EVENT_VISIBLE_MS = 30 * 1000;
const PERMANENT_EVENTS_PER_PAGE = 4;

interface EarthSidebarProps {
  earthReconstructionProgress: { [key: string]: number };
  language: string;
  t: (key: string) => string;
  gameTime: { months: number; years: number };
  totalHumanPopulation: number;
  earthBiodiversity: number;
  earthEvents: any[];
  defenseThreatAlert?: { title: string; remainingSeconds: number } | null;
  onDefenseThreatAlertClick?: () => void;
  formatValue: (val: number) => string;
}

const EarthSidebar: React.FC<EarthSidebarProps> = ({ 
  earthReconstructionProgress, 
  language, 
  t, 
  gameTime, 
  totalHumanPopulation, 
  earthBiodiversity, 
  earthEvents,
  defenseThreatAlert,
  onDefenseThreatAlertClick,
  formatValue
}) => {
  const [showPermanentHistory, setShowPermanentHistory] = React.useState(false);
  const [permanentHistoryPage, setPermanentHistoryPage] = React.useState(0);
  const [recentEventClock, setRecentEventClock] = React.useState(Date.now());
  const totalProgress = Object.values(earthReconstructionProgress).reduce((a, b: any) => a + (typeof b === 'number' ? b : 0), 0) / 5;
  const isComplete = totalProgress >= 100;
  
  // Safety check: ensure earthEvents is an array
  const safeEarthEvents = Array.isArray(earthEvents) ? earthEvents : [];
  React.useEffect(() => {
    const hasVisibleCommonEvent = safeEarthEvents.some((event: any) => (
      !event?.permanent
      && !event?.isFixed
      && (event?.importance || 'important') === 'important'
      && typeof event?.timestamp === 'number'
      && recentEventClock - event.timestamp < COMMON_EVENT_VISIBLE_MS
    ));
    if (!hasVisibleCommonEvent) return;

    const interval = window.setInterval(() => setRecentEventClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [recentEventClock, safeEarthEvents]);

  const seenRecentArcadeKeys = new Set<string>();
  const isPermanentMilestone = (event: any) => (
    event?.permanent === true
    || event?.isFixed === true
    || event?.importance === 'mythic'
    || event?.importance === 'population'
    || event?.importance === 'epic'
    || (event?.importance === 'major' && event?.unique === true)
  );

  const recentEvents = safeEarthEvents.filter(event => {
    if (event?.id === 'route4-defense-alert') return false;
    if (isPermanentMilestone(event)) return false;
    const importance = event?.importance || 'important';
    if (
      importance === 'important'
      && typeof event?.timestamp === 'number'
      && recentEventClock - event.timestamp > COMMON_EVENT_VISIBLE_MS
    ) {
      return false;
    }
    if (event?.importance !== 'arcade') return true;
    const eventKind = event?.permanent ? 'record' : String(event.id).includes('near-record') ? 'near-record' : String(event.id).includes('score') ? 'score' : 'arcade';
    const arcadeKey = `${eventKind}-${event.gameId || event.name || event.id}`;
    if (seenRecentArcadeKeys.has(arcadeKey)) return false;
    seenRecentArcadeKeys.add(arcadeKey);
    return true;
  }).slice(0, RECENT_EVENTS_LIMIT);
  const permanentHistoryEvents = safeEarthEvents
    .filter(isPermanentMilestone)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const permanentHistoryTotalPages = Math.max(1, Math.ceil(permanentHistoryEvents.length / PERMANENT_EVENTS_PER_PAGE));
  const safePermanentHistoryPage = Math.min(permanentHistoryPage, permanentHistoryTotalPages - 1);
  const permanentHistoryPageEvents = permanentHistoryEvents.slice(
    safePermanentHistoryPage * PERMANENT_EVENTS_PER_PAGE,
    safePermanentHistoryPage * PERMANENT_EVENTS_PER_PAGE + PERMANENT_EVENTS_PER_PAGE
  );
  const formatEventDate = (event: any) => {
    const month = event?.month ?? event?.gameDate?.month ?? gameTime.months ?? 0;
    const year = event?.year ?? event?.gameDate?.year ?? gameTime.years ?? 0;
    return language === 'pt'
      ? `Mês ${month} / Ano ${year}`
      : `Month ${month} / Year ${year}`;
  };
  const fixedDefenseEvent = defenseThreatAlert ? {
    id: 'route4-defense-alert',
    name: language === 'pt' ? 'FROTA SOB ATAQUE' : 'FLEET UNDER ATTACK',
    description: language === 'pt'
      ? 'Suas buscas estão sendo atacadas.'
      : 'Your searches are under attack.',
    year: gameTime.years,
    isFixed: true,
    specialStyles: {
      bg: 'bg-red-500/12',
      border: 'border-red-400/60',
      color: 'text-red-200',
    },
  } : null;

  const activeMuralAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const playRandomMuralAudio = (type: 'open' | 'close') => {
    try {
      const activeAudio = activeMuralAudioRef.current;
      if (activeAudio && !activeAudio.paused && !activeAudio.ended) return;

      const maxIndex = type === 'open' ? 34 : 24;
      const randomIndex = Math.floor(Math.random() * maxIndex) + 1;
      const audioPath = `/audio/sfx/bobby_blue/mural ${type}/${type}_mural_${randomIndex}.ogg`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      activeMuralAudioRef.current = audio;
      audio.onended = () => {
        if (activeMuralAudioRef.current === audio) {
          activeMuralAudioRef.current = null;
        }
      };
      audio.play().catch(e => {
        if (activeMuralAudioRef.current === audio) {
          activeMuralAudioRef.current = null;
        }
        console.log('Audio play failed:', e);
      });
    } catch (e) {
      console.log('Error playing audio', e);
    }
  };

  return (
    <div className={`glass-panel border-2 ${isComplete ? 'border-emerald-500/50' : 'border-emerald-500/20'} rounded-xl flex-1 flex flex-col overflow-hidden bg-emerald-500/5 transition-all duration-500`}>
      {/* Header with Project Name and Progress */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-white/5">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-base font-orbitron font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2 flex-shrink-0">
            <Globe className={`w-3 h-3 ${isComplete ? 'animate-pulse' : ''}`} /> {language === 'pt' ? 'Nova Terra' : 'New Earth'}
          </h2>
          
          {/* Biodiversity Progress Bar in Header */}
          <div className="flex-1 flex items-center gap-2 max-w-[220px] px-2.5 py-1 bg-white/5 rounded-full border border-emerald-500/25 shadow-inner">
            <span className="text-[9px] font-orbitron text-emerald-400/80 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              {language === 'pt' ? 'Biodiversidade' : 'Biodiversity'}
            </span>
            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${earthBiodiversity}%` }}
                className="h-full bg-emerald-500"
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] font-mono font-black text-emerald-400 flex-shrink-0">{earthBiodiversity.toFixed(0)}%</span>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
            <span className="text-[14px] font-mono text-emerald-500/80 uppercase tracking-widest font-bold">
              {language === 'pt' ? 'AO VIVO' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20">
        {/* Main Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              {language === 'pt' ? 'Ano Atual' : 'Current Year'}
            </span>
            <span className="text-base font-mono font-black text-white tracking-widest">
              {gameTime.years}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[14px] font-orbitron text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-2.5 h-2.5 text-cyan-400" />
              {language === 'pt' ? 'População Total' : 'Total Population'}
            </span>
            <span className="text-base font-mono font-black text-white tracking-widest">
              {formatValue(Math.floor(totalHumanPopulation))}
            </span>
          </div>
        </div>

        {/* Event History */}
        <div className="space-y-3">
          <PremiumCanvasButton
            type="button"
            onClick={() => {
              setPermanentHistoryPage(0);
              setShowPermanentHistory(true);
              playRandomMuralAudio('open');
            }}
            tone="green"
            className="w-full rounded-xl"
            contentClassName="justify-between px-3 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-[15px] font-orbitron font-bold text-emerald-100 uppercase tracking-[0.2em] transition-colors group-hover:text-white drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
            <HistoryIcon className="w-3 h-3" />
            {language === 'pt' ? 'Histórico de Eventos' : 'Event History'}
            </span>
            <span className="rounded-full border border-emerald-200/30 bg-emerald-500/40 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_0_5px_rgba(16,185,129,0.3)]">
              {permanentHistoryEvents.length}
            </span>
          </PremiumCanvasButton>
          
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <div className="text-[15px] font-mono text-white/10 italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                {language === 'pt' ? 'Aguardando simulação...' : 'Waiting for simulation...'}
              </div>
            ) : (
              recentEvents.map((event, idx) => {
                // Defensive check: ensure event is a valid object
                if (!event || typeof event !== 'object' || !event.id) {
                  return null;
                }

                const importance = event.importance || (event.isFixed ? 'major' : 'important');
                const style = EVENT_IMPORTANCE_STYLES[importance] || EVENT_IMPORTANCE_STYLES.important;

                return (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-xl transition-all group ${style.card}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-base font-bold uppercase tracking-tight transition-colors ${style.title}`}>
                        {cleanEventText(event.name || 'Unknown Event')}
                      </span>
                      <div className="flex items-center gap-2">
                        {(language === 'pt' ? style.badgePt : style.badgeEn) ? (
                          <span className="rounded-full border border-current/30 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.14em] text-current opacity-75">
                            {language === 'pt' ? style.badgePt : style.badgeEn}
                          </span>
                        ) : null}
                        <span className="text-[14px] font-mono text-white/20">
                          {language === 'pt' ? 'ANO' : 'YEAR'} {event.year || 0}
                        </span>
                      </div>
                    </div>
                    <p className={`text-[15px] leading-relaxed italic ${style.description}`}>
                      {cleanEventText(event.description || 'No description available')}
                    </p>
                  </motion.div>
                );
              })
            )}
            {fixedDefenseEvent ? (
              <motion.div
                key={fixedDefenseEvent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <PremiumCanvasButton
                  type="button"
                  onClick={onDefenseThreatAlertClick}
                  tone="red"
                  className="w-full rounded-xl"
                  contentClassName="justify-start p-3 text-left"
                >
                  <p className="font-orbitron text-[13px] font-black uppercase leading-snug tracking-widest text-red-100 drop-shadow-[0_0_12px_rgba(248,113,113,0.85)]">
                    {String(fixedDefenseEvent.description || '')}
                  </p>
                </PremiumCanvasButton>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPermanentHistory ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex h-[calc(100vh-1.5rem)] max-h-[840px] min-h-[560px] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl border border-emerald-300/40 shadow-[0_0_48px_rgba(16,185,129,0.24)] sm:h-[86vh] sm:min-h-[620px]"
              style={{ backgroundColor: '#050914' }}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <div
                className="flex items-start justify-between border-b border-white/10 p-5"
                style={{ backgroundColor: '#08111d' }}
              >
                <div>
                  <h3 className="font-orbitron text-2xl font-black uppercase tracking-widest text-white">
                    {language === 'pt' ? 'Mural dos Grandes Acontecimentos' : 'Great Events Wall'}
                  </h3>
                </div>
                <PremiumCanvasButton
                  type="button"
                  onClick={() => {
                    setShowPermanentHistory(false);
                    playRandomMuralAudio('close');
                  }}
                  tone="steel"
                  className="h-10 w-10 rounded-full"
                  contentClassName="text-cyan-100"
                  aria-label={language === 'pt' ? 'Fechar histórico fixo' : 'Close fixed history'}
                >
                  <X className="h-5 w-5" />
                </PremiumCanvasButton>
              </div>

              <div
                className="flex flex-1 flex-col gap-4 overflow-hidden p-5 bg-cover bg-center"
                style={{ backgroundImage: "linear-gradient(to bottom, rgba(3, 7, 18, 0.75), rgba(3, 7, 18, 0.9)), url('/assets/rota4/layout_cap4/mural_background.webp')" }}
              >
                {permanentHistoryEvents.length === 0 ? (
                  <div
                    className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center font-mono text-[13px] uppercase tracking-[0.18em] text-white/45"
                    style={{ backgroundColor: '#080e1a' }}
                  >
                    {language === 'pt' ? 'Nenhum marco raro registrado ainda.' : 'No rare milestone registered yet.'}
                  </div>
                ) : (
                  <>
                    <div className="grid flex-1 auto-rows-max grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1">
                      {permanentHistoryPageEvents.map((event, idx) => {
                        const importance = event.importance || (event.isFixed ? 'major' : 'important');
                        const style = EVENT_IMPORTANCE_STYLES[importance] || EVENT_IMPORTANCE_STYLES.important;
                        return (
                          <motion.div
                            key={`permanent-${event.id}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                            className="min-h-0 rounded-xl border border-white/14 bg-black/50 backdrop-blur-md p-4 shadow-[0_0_18px_rgba(0,0,0,0.28)]"
                          >
                            <div className="mb-2 flex items-start justify-between gap-4">
                              <div>
                                <p className={`font-orbitron text-lg font-black uppercase tracking-wide ${style.title}`}>
                                  {cleanEventText(event.name || 'Unknown Event')}
                                </p>
                                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                                  {formatEventDate(event)}
                                </p>
                              </div>
                              {(language === 'pt' ? style.badgePt : style.badgeEn) ? (
                                <span className="rounded-full border border-current/30 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-current opacity-80">
                                  {language === 'pt' ? style.badgePt : style.badgeEn}
                                </span>
                              ) : null}
                            </div>
                            <p className={`line-clamp-2 text-[15px] leading-relaxed ${style.description}`}>
                              {cleanEventText(event.description || 'No description available')}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <PremiumCanvasButton
                        type="button"
                        onClick={() => setPermanentHistoryPage(prev => Math.max(0, prev - 1))}
                        disabled={safePermanentHistoryPage === 0}
                        tone="cyan"
                        className="h-10 w-10 rounded-full"
                        contentClassName="text-cyan-100"
                        aria-label={language === 'pt' ? 'Página anterior' : 'Previous page'}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </PremiumCanvasButton>
                      <span className="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                        {language === 'pt' ? 'Página' : 'Page'} {String(safePermanentHistoryPage + 1).padStart(2, '0')} / {String(permanentHistoryTotalPages).padStart(2, '0')}
                      </span>
                      <PremiumCanvasButton
                        type="button"
                        onClick={() => setPermanentHistoryPage(prev => Math.min(permanentHistoryTotalPages - 1, prev + 1))}
                        disabled={safePermanentHistoryPage >= permanentHistoryTotalPages - 1}
                        tone="cyan"
                        className="h-10 w-10 rounded-full"
                        contentClassName="text-cyan-100"
                        aria-label={language === 'pt' ? 'Próxima página' : 'Next page'}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </PremiumCanvasButton>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(EarthSidebar);
