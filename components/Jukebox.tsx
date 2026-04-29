import React from 'react';
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
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  isEmpty: boolean;
  currentTrack?: Track;
}

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-12 mb-4">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-cyan-400"
          animate={{
            height: isPlaying ? [
              Math.random() * 40 + 10,
              Math.random() * 40 + 10,
              Math.random() * 40 + 10
            ] : 4
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: i * 0.05
          }}
          style={{
            boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
            borderRadius: '1px'
          }}
        />
      ))}
    </div>
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
            initial={{ scale: 0.8, y: 40, rotateX: 20 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, y: 40, rotateX: 20 }}
            className="w-full max-w-lg bg-slate-950/80 border-t-2 border-l-2 border-cyan-500/50 border-r-2 border-b-2 border-orange-500/50 rounded-3xl p-1 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]"
            style={{ perspective: '1000px' }}
          >
            {/* Background Tech Grids */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6,182,212,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="bg-slate-900/90 rounded-[22px] p-8 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
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
                      Quantum Audio Systems v2.4
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

              {/* Display Panel */}
              <div className="relative mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 rounded-2xl blur opacity-75" />
                <div className="relative bg-black/60 border border-white/10 rounded-2xl p-6 overflow-hidden">
                  {/* Scanline */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
                  
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
                        className="font-orbitron font-black text-xl text-white mb-2 tracking-wide uppercase truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      >
                        {currentTrack?.title}
                      </motion.p>
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                          TRK {String(currentTrackIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">
                            {isPlaying ? tl('STREAMING', 'TRANSMITINDO') : tl('STANDBY', 'STANDBY')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-8">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-3 rounded-xl border transition-all ${isShuffle ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-6">
                    <button onClick={playPrev} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                      <SkipBack className="w-8 h-8" />
                    </button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1, boxShadow: isPlaying ? '0 0 30px rgba(244,63,94,0.4)' : '0 0 30px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
                        ${isPlaying 
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-500' 
                          : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        }`}
                    >
                      {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1.5" />}
                    </motion.button>

                    <button onClick={playNext} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                      <SkipForward className="w-8 h-8" />
                    </button>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLoop(!isLoop)}
                    className={`p-3 rounded-xl border transition-all ${isLoop ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                  >
                    <Repeat className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Volume Section */}
                <div className="flex items-center gap-6 bg-black/40 rounded-2xl p-4 border border-white/5">
                  <div className="relative">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    {volume > 0.7 && <Activity className="absolute -top-1 -right-1 w-2.5 h-2.5 text-orange-500 animate-pulse" />}
                  </div>
                  <div className="flex-1 relative h-6 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500 relative z-10"
                    />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full blur-[2px] opacity-50"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-500/80 w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


