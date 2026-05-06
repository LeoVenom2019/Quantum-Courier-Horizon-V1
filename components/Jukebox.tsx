import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Music, X, Activity } from 'lucide-react';
import { Track } from '@/hooks/useJukebox';

interface JukeboxProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'pt' | 'en';
  playlist: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isLoop: boolean;
  isShuffle: boolean;
  setVolume: (v: number) => void;
  setIsLoop: (v: boolean) => void;
  setIsShuffle: (v: boolean) => void;
  setTrack: (index: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  isEmpty: boolean;
  currentTrack?: Track;
}

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef(Array.from({ length: 12 }, () => ({
    height: 4,
    targetHeight: 4,
    timer: 0
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 4;
      const gap = 4;
      const totalWidth = (barWidth + gap) * 12 - gap;
      const startX = (canvas.width - totalWidth) / 2;

      barsRef.current.forEach((bar, i) => {
        if (isPlaying) {
          if (Date.now() > bar.timer) {
            bar.targetHeight = Math.random() * 35 + 5;
            bar.timer = Date.now() + Math.random() * 200 + 100;
          }
          // Smooth interpolation
          bar.height += (bar.targetHeight - bar.height) * 0.15;
        } else {
          bar.height += (4 - bar.height) * 0.1;
        }

        const x = startX + i * (barWidth + gap);
        const y = canvas.height - bar.height;

        // Draw Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
        ctx.fillStyle = '#22d3ee';
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, bar.height, 1);
        ctx.fill();
        
        // Reset shadow for next bar
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef}
      width={120}
      height={48}
      className="w-full h-12 mb-4"
    />
  );
};

export function Jukebox({ 
  isOpen,
  onClose,
  language,
  playlist,
  currentTrackIndex,
  isPlaying,
  volume,
  isLoop,
  isShuffle,
  setVolume,
  setIsLoop,
  setIsShuffle,
  setTrack,
  togglePlay,
  playNext,
  playPrev,
  isEmpty,
  currentTrack
}: JukeboxProps) {
  const tl = (en: string, pt: string) => language === 'pt' ? pt : en;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            className="w-full max-w-2xl bg-slate-950/80 border-t-2 border-l-2 border-cyan-500/50 border-r-2 border-b-2 border-orange-500/50 rounded-3xl p-1 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh]"
          >
            {/* Background Tech Grids */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6,182,212,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="bg-slate-900/90 rounded-[22px] p-8 relative z-10 flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Music className="w-6 h-6 text-cyan-400" />
                    <motion.div 
                      animate={{ scale: isPlaying ? [1, 1.5, 1] : 1 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-orbitron font-bold text-white tracking-[0.2em] uppercase">
                      Jukebox
                    </h2>
                    <p className="text-[10px] font-mono text-cyan-500/50 tracking-tighter uppercase">
                      Quantum Audio Systems v3.0 // Master Console
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Player Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
                {/* Left Side: Visualizer & Controls */}
                <div className="flex flex-col">
                  <div className="relative mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 rounded-2xl blur opacity-75" />
                    <div className="relative bg-black/60 border border-white/10 rounded-2xl p-6 overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-50" />
                      
                      <Visualizer isPlaying={isPlaying} />
                      
                      {isEmpty ? (
                        <p className="text-slate-500 font-orbitron text-xs uppercase tracking-[0.3em] text-center animate-pulse">
                          {tl('SYSTEM_OFFLINE', 'SISTEMA_OFFLINE')}
                        </p>
                      ) : (
                        <div className="text-center">
                          <motion.p 
                            key={currentTrack?.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-orbitron font-black text-lg text-white mb-1 tracking-wide uppercase truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                          >
                            {currentTrack?.title}
                          </motion.p>
                          <p className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest mb-3">
                            {currentTrack?.origin || 'Unknown Source'}
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                              TRK {String(currentTrackIndex + 1).padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                              <span className="text-[9px] font-orbitron text-slate-400 uppercase tracking-widest">
                                {isPlaying ? tl('STREAMING', 'TRANSMITINDO') : tl('STANDBY', 'STANDBY')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-6">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2.5 rounded-xl border transition-all ${isShuffle ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                      >
                        <Shuffle className="w-4 h-4" />
                      </motion.button>

                      <div className="flex items-center gap-4">
                        <button onClick={playPrev} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                          <SkipBack className="w-6 h-6" />
                        </button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1, boxShadow: isPlaying ? '0 0 30px rgba(244,63,94,0.4)' : '0 0 30px rgba(6,182,212,0.4)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={togglePlay}
                          className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all
                            ${isPlaying 
                              ? 'border-rose-500/50 bg-rose-500/10 text-rose-500' 
                              : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                            }`}
                        >
                          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                        </motion.button>

                        <button onClick={playNext} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                          <SkipForward className="w-6 h-6" />
                        </button>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsLoop(!isLoop)}
                        className={`p-2.5 rounded-xl border transition-all ${isLoop ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                      >
                        <Repeat className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 rounded-xl p-3 border border-white/5">
                      <Volume2 className="w-4 h-4 text-cyan-500" />
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/50" style={{ width: `${volume * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{tl('MASTERED', 'MASTER')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Playlist */}
                <div className="flex flex-col overflow-hidden bg-black/40 rounded-2xl border border-white/5">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                      {tl('TRANSMISSION QUEUE', 'FILA DE TRANSMISSÃO')}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-500/40">{playlist.length} TRACKS</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {playlist.map((track, index) => (
                      <button
                        key={`${track.id}-${index}`}
                        onClick={() => setTrack(index)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group ${
                          currentTrackIndex === index 
                          ? 'bg-cyan-500/10 border border-cyan-500/30' 
                          : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded bg-slate-800/50 flex items-center justify-center font-mono text-[10px] ${currentTrackIndex === index ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {currentTrackIndex === index && isPlaying ? (
                            <Activity className="w-4 h-4 animate-pulse" />
                          ) : (
                            String(index + 1).padStart(2, '0')
                          )}
                        </div>
                        
                        <div className="flex-1 text-left overflow-hidden">
                          <p className={`text-xs font-orbitron truncate ${currentTrackIndex === index ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {track.title}
                          </p>
                          <p className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter truncate">
                            {track.origin}
                          </p>
                        </div>

                        {currentTrackIndex === index && (
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </AnimatePresence>
  );
}


