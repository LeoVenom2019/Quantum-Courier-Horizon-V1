'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Cog } from 'lucide-react';

const INTRO_BLACK_MS = 2000;
const OUTRO_BLACK_MS = 2000;
const VIDEO_FALLBACK_MS = 12000;

type SplashPhase = 'intro-black' | 'video' | 'outro-black';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<SplashPhase>('intro-black');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);
  const videoFinishedRef = useRef(false);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    if (phase !== 'intro-black') return;

    const timer = window.setTimeout(() => {
      setPhase('video');
    }, INTRO_BLACK_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'video') return;

    videoFinishedRef.current = false;
    const video = videoRef.current;
    const fallback = window.setTimeout(() => {
      if (!videoFinishedRef.current) {
        videoFinishedRef.current = true;
        setPhase('outro-black');
      }
    }, VIDEO_FALLBACK_MS);

    if (video) {
      video.currentTime = 0;
      video.muted = false;
      video.volume = 1;
      const playPromise = video.play();
      playPromise?.catch(() => {
        // Browsers can block autoplay with audio before user interaction.
        // The splash still advances by the fallback timer in that case.
      });
    }

    return () => window.clearTimeout(fallback);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'outro-black') return;

    const timer = window.setTimeout(complete, OUTRO_BLACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const finishVideo = () => {
    if (videoFinishedRef.current) return;
    videoFinishedRef.current = true;
    setPhase('outro-black');
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black"
    >
      <motion.video
        ref={videoRef}
        src="/splash/lx999games_splash_1.mp4"
        playsInline
        preload="auto"
        onEnded={finishVideo}
        onError={finishVideo}
        initial={false}
        animate={{ opacity: phase === 'video' ? 1 : 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {phase === 'video' && (
        <div className="pointer-events-none absolute bottom-5 right-5 md:bottom-7 md:right-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            className="relative grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 shadow-[0_12px_34px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm md:h-14 md:w-14"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-1.5 rounded-full border border-cyan-300/55"
            />
            <Cog className="h-7 w-7 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] md:h-8 md:w-8" strokeWidth={1.75} />
            <div className="absolute h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

