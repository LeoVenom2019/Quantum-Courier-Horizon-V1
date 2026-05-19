'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Settings, Trophy, Play, Music, Volume2, Globe, X, Timer, Trash2, ShieldCheck, Clock, Navigation, Database, Coffee, ArrowRight, ChevronRight, ChevronLeft, Radio, Sliders } from 'lucide-react';
import { IntroNarrative } from '@/components/IntroNarrative';
import { GameDashboard } from '@/components/GameDashboard';
import { AchievementsModal } from '@/components/AchievementsModal';
import { ThemeInfoWindow } from '@/components/ThemeInfoWindow';
import { Jukebox } from '@/components/Jukebox';
import { useJukebox } from '@/hooks/useJukebox';
import { useSFX } from '@/hooks/useSFX';
import { useSoundMaster } from '@/hooks/useSoundMaster';
import { HorizonRadioModal } from '@/components/HorizonRadioModal';
import { GameStorage } from '@/lib/game-storage';
import { SaveManager } from '@/lib/save-manager';
import { Language, t } from '@/lib/i18n';
import { ThemeColor, GAME_THEMES } from '@/lib/game-data';

// Helper for random positions
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface ConstellationStar {
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glow: string;
  spike?: boolean;
}

const CONSTELLATIONS: { [key: string]: ConstellationStar[] } = {
  ORION: [
    { name: 'Betelgeuse', x: 42, y: 28, size: 5, color: '#ff8a65', glow: 'rgba(255, 87, 34, 0.6)', spike: true },
    { name: 'Bellatrix', x: 56, y: 31, size: 3, color: '#d1f0ff', glow: 'rgba(209, 240, 255, 0.4)' },
    { name: 'Mintaka', x: 48, y: 48, size: 3.5, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Alnilam', x: 50, y: 50, size: 3.5, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Alnitak', x: 52, y: 52, size: 3.5, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Saiph', x: 46, y: 68, size: 3, color: '#d1f0ff', glow: 'rgba(209, 240, 255, 0.4)' },
    { name: 'Rigel', x: 58, y: 72, size: 5, color: '#ffffff', glow: 'rgba(100, 200, 255, 0.7)', spike: true },
  ],
  SOUTHERN_CROSS: [
    { name: 'Gacrux', x: 85, y: 75, size: 3.5, color: '#ffccbc', glow: 'rgba(255, 204, 188, 0.4)' }, // Top - Red Giant
    { name: 'Mimosa', x: 80, y: 83, size: 3.5, color: '#d1f0ff', glow: 'rgba(209, 240, 255, 0.4)' }, // Left
    { name: 'Imai', x: 90, y: 83, size: 3, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.3)' }, // Right
    { name: 'Acrux', x: 85, y: 91, size: 4.5, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)' }, // Bottom
    { name: 'Ginan', x: 87, y: 85, size: 2, color: '#ffffff', glow: 'rgba(255, 255, 255, 0.2)' }, // Intrometida
  ]
};

const Satellite = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [props, setProps] = useState({ y: 0, duration: 60, delay: 0, opacity: 0 });

  useEffect(() => {
    setProps({
      y: Math.random() * 100,
      duration: 60 + Math.random() * 120,
      delay: Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.3
    });
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <motion.div
      initial={{ left: '-5%', top: `${props.y}%`, opacity: 0 }}
      animate={{ left: '105%', opacity: [0, props.opacity, props.opacity, 0] }}
      transition={{ duration: props.duration, repeat: Infinity, delay: props.delay, ease: "linear" }}
      className="absolute w-1 h-1 bg-slate-400 rounded-full blur-[0.5px] z-0"
    />
  );
};

const StarField = ({ theme = 'cyan' }: { theme?: ThemeColor }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [stars] = useState(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: getRandom(0, 100),
      y: getRandom(0, 100),
      size: getRandom(0.5, 2),
      opacity: getRandom(0.1, 0.7),
      duration: getRandom(3, 7)
    }));
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="absolute inset-0 bg-black" />;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Satellites */}
      <Satellite />
      <Satellite />
      <Satellite />

      {/* Constellations */}
      {[...CONSTELLATIONS.ORION, ...CONSTELLATIONS.SOUTHERN_CROSS].map((star, i) => (
        <motion.div
          key={`const-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.glow}`,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {star.spike && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-white/20 blur-[1px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[200%] bg-white/20 blur-[1px]" />
            </>
          )}
        </motion.div>
      ))}

      {/* Background Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 0.4
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const Meteor = ({ delay = 0, theme = 'cyan' }: { delay?: number; theme?: ThemeColor }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const startX = getRandom(20, 100);
  const duration = getRandom(1, 3);
  const repeatDelay = getRandom(5, 15);
  const startY = -20;
  
  const trailColorMap: Record<ThemeColor, string> = {
    cyan: 'via-cyan-400',
    orange: 'via-orange-400',
    neila: 'via-emerald-400',
    pink: 'via-pink-400',
    violet: 'via-violet-400',
    amber: 'via-amber-400',
    emerald: 'via-emerald-400',
    rose: 'via-rose-400',
    blue: 'via-blue-400',
  };

  const trailColor = trailColorMap[theme] || trailColorMap.cyan;
  
  return (
    <motion.div
      initial={{ x: `${startX}%`, y: `${startY}%`, opacity: 0 }}
      animate={{ 
        x: `${startX - 40}%`, 
        y: '120%',
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatDelay: repeatDelay,
        ease: "linear"
      }}
      className="absolute z-5 pointer-events-none"
    >
      <div className={`w-[2px] h-20 bg-gradient-to-b from-white ${trailColor} to-transparent rotate-[35deg] blur-[1px]`} />
    </motion.div>
  );
};

const SpaceShip = ({ 
  id,
  start,
  end,
  duration,
  scale,
  shipType,
  onComplete,
  depth,
  isWarp = false
}: { 
  id: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  scale: number;
  shipType: typeof TRAFFIC_SHIPS[number];
  onComplete: (id: number) => void;
  depth: { scale: number; opacity: number; blur: number; zIndex: number };
  isWarp?: boolean;
}) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  
  // Logic to choose Left/Right asset
  const isMovingRight = end.x > start.x;
  const currentPath = `${shipType.basePath}_${isMovingRight ? 'right' : 'left'}.webp`;
  // If moving left, the asset already points 180deg, so we rotate relative to that
  const displayRotation = isMovingRight ? angle : angle - 180;

  // Combine base scale with depth scale
  const finalScale = scale * depth.scale;

  const engineGlowMap: Record<string, string> = {
    cyan: 'shadow-[0_0_20px_#06b6d4,0_0_40px_#06b6d4]',
    orange: 'shadow-[0_0_20px_#f97316,0_0_40px_#f97316]',
    violet: 'shadow-[0_0_20px_#8b5cf6,0_0_40px_#8b5cf6]',
    emerald: 'shadow-[0_0_20px_#10b981,0_0_40px_#10b981]',
  };

  const trailColorMap: Record<string, string> = {
    cyan: 'from-cyan-500/40',
    orange: 'from-orange-500/40',
    violet: 'from-violet-500/40',
    emerald: 'from-emerald-500/40',
  };

  return (
    <motion.div
      initial={{ 
        left: `${start.x}%`, 
        top: `${start.y}%`, 
        opacity: 0,
        scale: isWarp ? 0 : finalScale,
        rotate: displayRotation
      }}

      animate={{ 
        left: `${end.x}%`, 
        top: `${end.y}%`,
        opacity: [0, depth.opacity, depth.opacity, 0],
        scale: isWarp ? [0, finalScale * 1.5, finalScale * 0.8, finalScale * 0.8, 0] : finalScale,
        rotate: displayRotation
      }}

      onAnimationComplete={() => onComplete(id)}
      transition={{
        duration: duration,
        ease: isWarp ? "anticipate" : "linear",
      }}
      className="absolute pointer-events-none"
      style={{ zIndex: depth.zIndex }}
    >
      <div className="relative group">
        {/* Engine Trail */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: isWarp ? [100, 400, 100] : [80, 120, 80],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`absolute ${isMovingRight ? 'right-[80%]' : 'left-[80%]'} top-1/2 -translate-y-1/2 h-2 bg-gradient-to-l ${isMovingRight ? trailColorMap[shipType.engineColor] : 'from-transparent'} ${isMovingRight ? 'to-transparent' : trailColorMap[shipType.engineColor]} blur-md`} 
        />
        
        {/* Engine Glow (Back) */}
        <div className={`absolute ${isMovingRight ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-sm ${engineGlowMap[shipType.engineColor]} animate-pulse`} />

        {/* Ship Asset */}
        <div className="relative overflow-visible">
          <img 
            src={`${currentPath}?v=2`} 
            alt="Space Traffic"
            className="object-contain"
            onError={(e) => {
              // Fallback to _right if _left is not yet available
              (e.target as HTMLImageElement).src = `${shipType.basePath}_right.webp?v=2`;
            }}
            style={{ 
              width: shipType.size.w * finalScale, 
              height: shipType.size.h * finalScale,
              mixBlendMode: 'screen',
              transform: isWarp ? 'scaleX(1.5)' : 'none'
            }}
          />
          
          {/* Subtle Hull Glow */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none" 
            style={{ backgroundColor: shipType.engineColor === 'cyan' ? '#06b6d4' : shipType.engineColor === 'orange' ? '#f97316' : '#8b5cf6' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const TRAFFIC_SHIPS = [
  { id: 'interceptor', basePath: '/images/traffic/interceptor', engineColor: 'cyan', speedMult: 1.5, size: { w: 120, h: 60 } },
  { id: 'freighter', basePath: '/images/traffic/freighter', engineColor: 'orange', speedMult: 0.7, size: { w: 160, h: 80 } },
  { id: 'scout', basePath: '/images/traffic/scout', engineColor: 'violet', speedMult: 2.2, size: { w: 100, h: 50 } },
  { id: 'probe', basePath: '/images/traffic/probe', engineColor: 'emerald', speedMult: 1.1, size: { w: 80, h: 80 } },
  { id: 'ufo', basePath: '/images/traffic/ufo', engineColor: 'cyan', speedMult: 1.8, size: { w: 100, h: 50 } },
  { id: 'mothership', basePath: '/images/traffic/mothership', engineColor: 'cyan', speedMult: 0.4, size: { w: 250, h: 120 } },
  { id: 'silver_man', basePath: '/images/traffic/silver_man', engineColor: 'violet', speedMult: 2.5, size: { w: 90, h: 45 } },
  { id: 'quantum_ghost', basePath: '/images/traffic/quantum_ghost', engineColor: 'emerald', speedMult: 1.3, size: { w: 110, h: 110 } },
] as const;

const DEPTH_LAYERS = [
  { scale: 0.15, opacity: 0.3, blur: 0, zIndex: 1 },  // Far
  { scale: 0.45, opacity: 0.6, blur: 0, zIndex: 5 },  // Mid
  { scale: 0.85, opacity: 1.0, blur: 0, zIndex: 15 }, // Near
];


const SpaceTraffic = () => {
  const [ships, setShips] = useState<any[]>([]);
  
  const generateShip = React.useCallback((id: number) => {
    const side = Math.floor(Math.random() * 4);
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    
    if (side === 0) { // Top
      start = { x: getRandom(-20, 120), y: -20 };
      end = { x: getRandom(-20, 120), y: 120 };
    } else if (side === 1) { // Right
      start = { x: 120, y: getRandom(-20, 120) };
      end = { x: -20, y: getRandom(-20, 120) };
    } else if (side === 2) { // Bottom
      start = { x: getRandom(-20, 120), y: 120 };
      end = { x: getRandom(-20, 120), y: -20 };
    } else { // Left
      start = { x: -20, y: getRandom(-20, 120) };
      end = { x: 120, y: getRandom(-20, 120) };
    }
    
    const isWarp = Math.random() > 0.94;
    const shipType = TRAFFIC_SHIPS[Math.floor(Math.random() * TRAFFIC_SHIPS.length)];
    const depth = DEPTH_LAYERS[Math.floor(Math.random() * DEPTH_LAYERS.length)];
    
    // Scale is randomized slightly within the depth layer
    const scale = getRandom(0.8, 1.2);
    
    // Duration logic: heavier ships are slower, scouts are faster
    const baseDuration = getRandom(25, 55);
    const duration = (baseDuration / (scale * depth.scale * 2 * shipType.speedMult)) * (isWarp ? 0.15 : 1);
    
    return {
      id,
      start,
      end,
      duration,
      scale,
      shipType,
      depth,
      isWarp,
      key: Math.random()
    };
  }, []);

  useEffect(() => {
    // Initial batch of ships - Increased for more density across layers
    setShips(Array.from({ length: 15 }).map((_, i) => generateShip(i)));
  }, [generateShip]);

  const handleComplete = React.useCallback((id: number) => {
    setShips(prev => prev.map(s => s.id === id ? generateShip(id) : s));
  }, [generateShip]);

  return (
    <>
      {ships.map(({ key, ...shipProps }) => (
        <SpaceShip key={key} {...shipProps} onComplete={handleComplete} />
      ))}
    </>
  );
};

const MotherShip = () => (
  <motion.div
    initial={{ left: '-20%', top: '10%', opacity: 0 }}
    animate={{ 
      left: ['-20%', '40%', '-20%'],
      top: ['10%', '15%', '10%'],
      opacity: [0, 0.1, 0.1, 0]
    }}
    transition={{
      duration: 120,
      repeat: Infinity,
      ease: "linear",
    }}
    className="absolute z-0 pointer-events-none"
    style={{ scale: 5 }}
  >
    <div className="relative opacity-20 blur-[2px]">
      <div className="w-[500px] h-40 bg-slate-900 border-4 border-slate-700 rounded-full relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-slate-800 border-x-4 border-t-4 border-slate-700 rounded-t-full" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-10 bg-cyan-500/20 blur-xl rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-20 h-10 bg-cyan-500/20 blur-xl rounded-full" />
        <div className="absolute inset-0 flex items-center justify-around px-20">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="w-3 h-3 bg-cyan-400/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const Nebula = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
);

const MoonVisual = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-96 h-96 flex items-center justify-center"
    >
      {/* No Background Glow */}
      
      <motion.div
        animate={{ 
          y: [5, -5, 5],
          rotate: [0, -1, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-20 w-72 h-72"
      >
        <img 
          src="/cinematic_moon_asset_qch_1777340494996.webp" 
          alt="Moon"
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      </motion.div>
    </motion.div>
  );
};

const EarthVisual = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-96 h-96 flex items-center justify-center"
    >
      {/* Soft Background Glow - Blends better with the asset */}
      {/* No Background Glow */}
      
      {/* Cinematic Earth Asset */}
      <motion.div
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-20 w-80 h-80"
      >
        <img 
          src="/cinematic_earth_asset_qch_1777340390078.webp" 
          alt="Earth"
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* No Glow Overlay */}
      </motion.div>
    </motion.div>
  );
};

const SaturnVisual = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[500px] h-96 flex items-center justify-center"
    >
      {/* No Background Glow */}
      
      <motion.div
        animate={{ 
          y: [-15, 15, -15],
          rotate: [-1, 1, -1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-20 w-[450px] h-80"
      >
        <img 
          src="/cinematic_saturn_asset_qch_1777340512619.webp" 
          alt="Saturn"
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      </motion.div>
    </motion.div>
  );
};




const MuskVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-80 h-80 flex items-center justify-center"
  >
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_40s_linear_infinite]" />
    
    <motion.div
      animate={{ 
        rotateY: [0, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }}
      className="relative z-20 w-56 h-56"
    >
      <img 
        src="/cinematic_x_asset_qch_1777340742793.webp" 
        alt="X Logo"
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </motion.div>
  </motion.div>
);
const BlackHoleVisual = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[500px] h-[500px] flex items-center justify-center"
    >
      {/* No Background Glow */}
      
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-20 w-full h-full p-10"
      >
        <img 
          src="/cinematic_blackhole_asset_qch_1777340542328.webp" 
          alt="Black Hole"
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      </motion.div>
    </motion.div>
  );
};

const SunVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-96 h-96 flex items-center justify-center"
  >
    {/* No Background Glow */}
    
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        rotate: [0, 1, 0]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="relative z-20 w-80 h-80"
    >
      <img 
        src="/cinematic_sun_asset_qch_1777340630570.webp" 
        alt="Sun"
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </motion.div>
  </motion.div>
);
const RobotVisual = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative w-80 h-80 flex flex-col items-center justify-center"
  >
    {/* No Background Border Glow */}
    
    <motion.div
      animate={{ 
        y: [-10, 10, -10],
        rotateY: [-5, 5, -5]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="relative z-20 w-64 h-64"
    >
      <img 
        src="/cinematic_robot_asset_qch_1777340647368.webp" 
        alt="Robot"
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </motion.div>
  </motion.div>
);

const ChessBoardVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-96 h-96 flex items-center justify-center"
  >
    {/* No Background Glow */}
    
    <motion.div
      animate={{ 
        y: [-10, 10, -10],
        rotateZ: [-2, 2, -2]
      }}
      transition={{ 
        duration: 10, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="relative z-20 w-80 h-80"
    >
      <img 
        src="/cinematic_chessboard_asset_qch_1777340695618.webp" 
        alt="Chess Board"
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </motion.div>
  </motion.div>
);

const AlienVisual = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative w-96 h-96 flex items-center justify-center"
  >
    {/* No Background Glow */}
    
    <motion.div
      animate={{ 
        y: [10, -10, 10],
        rotate: [-3, 3, -3]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="relative z-20 w-80 h-80"
    >
      <img 
        src="/cinematic_alien_asset_qch_1777340712376.webp" 
        alt="Alien"
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </motion.div>
  </motion.div>
);

const ThemeIconButton = ({ 
  children, 
  onClick, 
  themeId, 
  glowColor 
}: { 
  children: React.ReactNode; 
  onClick: (id: string) => void; 
  themeId: string;
  glowColor: string;
}) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.08,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(themeId)}
      className="relative cursor-pointer transition-all duration-300 pointer-events-auto group"
    >
      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 blur-3xl transition-opacity duration-300"
        style={{ backgroundColor: glowColor }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.button>
  );
};

const MenuButton = ({ label, icon: Icon, onClick, disabled = false, theme = 'cyan' }: { label: string; icon: any; onClick?: () => void; disabled?: boolean; theme?: ThemeColor }) => {
  const colorMap: Record<ThemeColor, string> = {
    cyan: '#06b6d4',
    orange: '#f97316',
    neila: '#10b981',
    pink: '#ec4899',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    emerald: '#10b981',
    rose: '#f43f5e',
    blue: '#3b82f6',
  };

  const lightningColor = colorMap[theme] || colorMap.cyan;
  
  const borderMap: Record<ThemeColor, string> = {
    cyan: 'border-cyan-500/10',
    orange: 'border-orange-500/10',
    neila: 'border-emerald-500/10',
    pink: 'border-pink-500/10',
    violet: 'border-violet-500/10',
    amber: 'border-amber-500/10',
    emerald: 'border-emerald-500/10',
    rose: 'border-rose-500/10',
    blue: 'border-blue-500/10',
  };
  const accentBorder = borderMap[theme] || borderMap.cyan;

  const textMap: Record<ThemeColor, string> = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    neila: 'text-emerald-400',
    pink: 'text-pink-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
  };
  const accentText = textMap[theme] || textMap.cyan;

  const hoverTextMap: Record<ThemeColor, string> = {
    cyan: 'text-cyan-300',
    orange: 'text-orange-300',
    neila: 'text-emerald-300',
    pink: 'text-pink-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
    blue: 'text-blue-300',
  };
  const accentHoverText = hoverTextMap[theme] || hoverTextMap.cyan;

  const hoverBgMap: Record<ThemeColor, string> = {
    cyan: 'rgba(6, 182, 212, 0.2)',
    orange: 'rgba(249, 115, 22, 0.2)',
    neila: 'rgba(16, 185, 129, 0.2)',
    pink: 'rgba(236, 72, 153, 0.2)',
    violet: 'rgba(139, 92, 246, 0.2)',
    amber: 'rgba(245, 158, 11, 0.2)',
    emerald: 'rgba(16, 185, 129, 0.2)',
    rose: 'rgba(244, 63, 94, 0.2)',
    blue: 'rgba(59, 130, 246, 0.2)',
  };
  const accentHoverBg = hoverBgMap[theme] || hoverBgMap.cyan;

  const glowMap: Record<ThemeColor, string> = {
    cyan: 'group-hover:text-cyan-100',
    orange: 'group-hover:text-orange-100',
    neila: 'group-hover:text-emerald-100',
    pink: 'group-hover:text-pink-100',
    violet: 'group-hover:text-violet-100',
    amber: 'group-hover:text-amber-100',
    emerald: 'group-hover:text-emerald-100',
    rose: 'group-hover:text-rose-100',
    blue: 'group-hover:text-blue-100',
  };
  const accentGlow = glowMap[theme] || glowMap.cyan;

  const cornerMap: Record<ThemeColor, string> = {
    cyan: 'border-cyan-400/40',
    orange: 'border-orange-400/40',
    neila: 'border-emerald-400/40',
    pink: 'border-pink-400/40',
    violet: 'border-violet-400/40',
    amber: 'border-amber-400/40',
    emerald: 'border-emerald-400/40',
    rose: 'border-rose-400/40',
    blue: 'border-blue-400/40',
  };
  const accentCorner = cornerMap[theme] || cornerMap.cyan;

  const gradientMap: Record<ThemeColor, string> = {
    cyan: 'from-cyan-500/0 via-cyan-500/10 to-cyan-500/0',
    orange: 'from-orange-500/0 via-orange-500/10 to-orange-500/0',
    neila: 'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0',
    pink: 'from-pink-500/0 via-pink-500/10 to-pink-500/0',
    violet: 'from-violet-500/0 via-violet-500/10 to-violet-500/0',
    amber: 'from-amber-500/0 via-amber-500/10 to-amber-500/0',
    emerald: 'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0',
    rose: 'from-rose-500/0 via-rose-500/10 to-rose-500/0',
    blue: 'from-blue-500/0 via-blue-500/10 to-blue-500/0',
  };
  const accentGradient = gradientMap[theme] || gradientMap.cyan;

  return (
    <motion.button
      whileHover={disabled ? {} : { 
        x: 12, 
        scale: 1.03, 
        backgroundColor: accentHoverBg,
        boxShadow: `0 0 50px ${lightningColor}33, inset 0 0 20px ${lightningColor}11`,
        borderColor: lightningColor
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 25,
        backgroundColor: { duration: 0.3 },
        boxShadow: { duration: 0.3 }
      }}
      whileTap={disabled ? {} : { scale: 0.97, x: 6 }}
      onClick={disabled ? undefined : onClick}
      className={`w-full group relative flex items-center justify-start gap-4 py-4 px-8 rounded-xl overflow-hidden transition-all duration-500 ${
        disabled 
          ? 'bg-slate-900/5 border border-slate-800/10 cursor-not-allowed opacity-30' 
          : 'bg-black/40 backdrop-blur-md'
      }`}
    >
      {/* Refined RGB Animated Border (Google AI Studio style) with Glassmorphism */}
      {!disabled && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl p-[1px]"
          style={{
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        >
          <div 
            className="absolute inset-[-200%] animate-[spin_8s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, transparent 70%, #4285f4 80%, #ea4335 87%, #fbbc04 94%, #34a853 100%)`
            }}
          />
        </div>
      )}

      {/* Internal Glow Pulse */}
      {!disabled && (
        <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
      )}

      <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out`} />
      
      <div className="relative z-10 flex items-center gap-4">
        <Icon className={`w-5 h-5 ${disabled ? 'text-slate-600' : `${accentText} group-hover:${accentHoverText}`} transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`} />
        <span className={`text-base font-orbitron tracking-[0.4em] ${disabled ? 'text-slate-500' : `text-white ${accentGlow}`} transition-all duration-300`}>
          {label}
        </span>
      </div>
      
      {/* HUD Corner accents */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${disabled ? 'border-slate-800' : accentCorner} group-hover:scale-125 transition-transform duration-300`} />
    </motion.button>
  );
};

export default function GameHome() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Prevent Next.js Error Overlay and browser default logging
      event.preventDefault();

      // Basic diagnostic info
      const errorMsg = `[Global Error] ${event.message || 'Unknown error'} at ${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`;
      console.error(errorMsg, event.error);
      
      // If it's a critical object error, log it as JSON but don't block the UI with alerts
      if (typeof event.error === 'object' && event.error) {
        try {
          console.debug("Error Object Detail:", JSON.parse(JSON.stringify(event.error)));
        } catch(e) {
          console.debug("Error Object Detail (Circular):", event.error);
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      // Prevent Next.js Error Overlay and browser default logging
      event.preventDefault();

      const reason = event.reason;
      
      // Filter out common harmless browser-level rejections
      if (reason && (
        reason.name === 'AbortError' || 
        reason.message?.includes('The play() request was interrupted') ||
        reason.message?.includes('pause()')
      )) {
        console.warn("[Promise Rejection Filtered]", reason.message || "Playback interrupted");
        return;
      }

      // Filter or handle DOM Event objects to prevent circular/empty logs
      if (reason instanceof Event) {
        console.warn("[Promise Rejection Filtered - DOM Event]", reason);
        return;
      }

      // Log detailed rejection info
      console.error("UNHANDLED_REJECTION:", {
        reason: reason,
        message: reason?.message || (reason ? String(reason) : "No message"),
        stack: reason?.stack || "No stack",
        type: typeof reason
      });

      // Show a toast or notification instead of alert if possible, 
      // but for now, we'll keep it to console only to avoid blocking the main thread.
      // alert(`Unhandled Rejection: ${reason?.message || reason}`);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);


  const [view, setView] = useState<'landing' | 'narrative' | 'game'>('landing');
  const [showOptions, setShowOptions] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const { masterMusicOn, masterMusicVolume, masterSfxOn, updateSettings } = useSoundMaster();
  const [showHorizonRadio, setShowHorizonRadio] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isRoute2Unlocked, setIsRoute2Unlocked] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const theme = GAME_THEMES[currentThemeIndex].color;

  const setTheme = (color: ThemeColor | ((prev: ThemeColor) => ThemeColor)) => {
    const newColor = typeof color === 'function' ? color(theme) : color;
    const index = GAME_THEMES.findIndex(t => t.color === newColor);
    if (index !== -1) {
      setCurrentThemeIndex(index);
    }
  };

  useEffect(() => {
    const saveTheme = async () => {
      await GameStorage.save(currentThemeIndex, 'game_theme_index');
    };
    saveTheme().catch(() => {});
  }, [currentThemeIndex]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showJukeboxModal, setShowJukeboxModal] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<{ [key: string]: number }>({});
  const [isShaking, setIsShaking] = useState(false);

  const [localRecords, setLocalRecords] = useState<{ name: string; time: number; date: string }[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [randomVisual, setRandomVisual] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (view === 'landing') {
      if (Math.random() > 0.5) {
        const visuals = [
          <EarthVisual key="earth" />,
          <MoonVisual key="moon" />,
          <SaturnVisual key="saturn" />,
          <MuskVisual key="musk" />,
          <BlackHoleVisual key="blackhole" />,
          <SunVisual key="sun" />,
          <RobotVisual key="robot" />,
          <ChessBoardVisual key="chess" />,
          <AlienVisual key="alien" />
        ];
        const randomIndex = Math.floor(Math.random() * visuals.length);
        setRandomVisual(visuals[randomIndex]);
      } else {
        setRandomVisual(null);
      }
    }
  }, [view]);

  // Jukebox Hook
  const jukeboxState = useJukebox();
  
  // SFX Hook
  const { playSfx } = useSFX();

  // BGM da tela inicial
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Listener para desbloquear áudio (Autoplay Policy)
  useEffect(() => {
    if (audioUnlocked) return;

    const unlock = () => {
      setAudioUnlocked(true);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!bgmRef.current) {
      const audio = new Audio('/audio/bgm_landing.ogg');
      audio.loop = true;
      audio.volume = 0;
      bgmRef.current = audio;
    }

    const bgm = bgmRef.current;

    if (view === 'landing' && masterMusicOn && !jukeboxState.isPlaying && audioUnlocked) {
      // Fade in
      bgm.play().catch((err) => console.warn('Audio play blocked:', err));
      let vol = bgm.volume;
      const targetVol = 0.45 * masterMusicVolume;
      const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.02, targetVol);
        bgm.volume = vol;
        if (vol >= targetVol) clearInterval(fadeIn);
      }, 80);
      return () => clearInterval(fadeIn);
    } else {
      // Fade out
      let vol = bgm.volume;
      const fadeOut = setInterval(() => {
        vol = Math.max(vol - 0.04, 0);
        bgm.volume = vol;
        if (vol <= 0) {
          clearInterval(fadeOut);
          bgm.pause();
        }
      }, 80);
      return () => clearInterval(fadeOut);
    }
  }, [view, masterMusicOn, masterMusicVolume, jukeboxState.isPlaying, audioUnlocked]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  const getThemeGlowColor = (themeColor: ThemeColor) => {
    const colorMap: Record<ThemeColor, string> = {
      cyan: '#06b6d4',
      orange: '#f97316',
      neila: '#10b981',
      pink: '#ec4899',
      violet: '#8b5cf6',
      amber: '#f59e0b',
      emerald: '#10b981',
      rose: '#f43f5e',
      blue: '#3b82f6',
    };
    return colorMap[themeColor] || '#06b6d4';
  };

  // Hydration fix: Load from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('restore') === 'true') {
        localStorage.clear();
        window.location.href = '/';
        return;
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Use a small timeout to avoid synchronous setState in effect lint error
    const timer = setTimeout(() => {
      const loadAllData = async () => {
        const saved = await GameStorage.load('time_travel_save');
        if (saved) {
          try {
            // Use SaveManager to handle both legacy (flat) and modular (structured) saves
            const data = SaveManager.loadSave(saved);
            
            // Map structured state back to local UI states
            setPlayerName(data.system?.playerName || data.playerName || '');
            
            // Improved Route 2 detection
            const routeTier = data.progression?.routeTier || data.routeTier || 'Solar';
            const techLevels = data.progression?.unlockedTechLevels || data.unlockedTechLevels || {};
            const unlocked = routeTier !== 'Solar' || (techLevels.Solar >= 9);
            
            setIsRoute2Unlocked(unlocked);
            setHasSave(true);
            
            // Achievement states
            if (data.missions?.unlockedAchievements) {
              setUnlockedAchievements(data.missions.unlockedAchievements);
            } else if (data.unlockedAchievements) {
              setUnlockedAchievements(data.unlockedAchievements);
            }
            
            if (data.missions?.achievementProgress) {
              setAchievementProgress(data.missions.achievementProgress);
            } else if (data.achievementProgress) {
              setAchievementProgress(data.achievementProgress);
            }
            
            const savedThemeIndex = await GameStorage.load('game_theme_index');
            if (typeof savedThemeIndex === 'number' && savedThemeIndex >= 0 && savedThemeIndex < GAME_THEMES.length) {
              setCurrentThemeIndex(savedThemeIndex);
            } else {
              // Fallback to old theme system if exists
              const savedTheme = await GameStorage.load('game_theme');
              if (savedTheme === 'cyan') setCurrentThemeIndex(0);
              else if (savedTheme === 'orange') setCurrentThemeIndex(3); // Saturn is orange
              else if (savedTheme === 'neila') setCurrentThemeIndex(9); // Neila is emerald
              else if (unlocked) setCurrentThemeIndex(3);
            }

            if (data.unlockedAchievements) {
              setUnlockedAchievements(data.unlockedAchievements);
            }
            if (data.achievementProgress) {
              setAchievementProgress(data.achievementProgress);
            }
          } catch (e) {}
        }


      };
      loadAllData().catch(e => console.error("[InitialLoad] Failed:", e));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  

  


  const handleStartGame = () => {
    setView('narrative');
  };

  const handleContinue = async () => {
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if (data.playerName) {
          setPlayerName(data.playerName);
        }
        setView('game');
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  const confirmName = () => {
    if (playerName.trim()) {
      setShowNamePrompt(false);
      setView('narrative');
    }
  };

  const handleResetProgress = async () => {
    try {
      playSfx('aba_click');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      GameStorage.markReset(10000);
      const keys = ['time_travel_save', 'speed_run_save', 'colonies_data', 'history_data', 'game_theme_index', 'qch_settings'];
      for (const key of keys) {
        await GameStorage.remove(key);
        localStorage.removeItem(key);
      }
      localStorage.clear();
      GameStorage.markReset(10000);
      
      // Reset all local states reactively
      setHasSave(false);
      setPlayerName('');
      setIsRoute2Unlocked(false);
      setUnlockedAchievements([]);
      setAchievementProgress({});
      setLocalRecords([]);
      setCurrentThemeIndex(0); // Reset to default Cyan theme
      
      // Reset sound settings to defaults
      updateSettings({
        masterMusicOn: true,
        masterMusicVolume: 0.5,
        masterSfxOn: true,
        masterSfxVolume: 0.5,
      });

      // Close modals
      setShowResetConfirm(false);
      setShowOptions(false);
      
      console.log("Progress reset successfully without reload.");
    } catch (err) {
      console.error("Reset failed:", err);
      // Fallback only if critical failure
      window.location.reload();
    }
  };

  const handleExportSave = async () => {
    const data = {
      time_travel_save: await GameStorage.load('time_travel_save'),
      game_theme_index: await GameStorage.load('game_theme_index'),
      colony_cards_data: await GameStorage.load('colony_cards_data'),
      colony_card_levels: await GameStorage.load('colony_card_levels'),
      colony_search_upgrade_levels: await GameStorage.load('colony_search_upgrade_levels'),
      colony_active_search: await GameStorage.load('colony_active_search'),
      colony_search_threat_bonus: await GameStorage.load('colony_search_threat_bonus'),
      horizon_ship_xp: await GameStorage.load('horizon_ship_xp'),
      route4_defense_battle_level: await GameStorage.load('route4_defense_battle_level'),
      battle_cards_loadout: await GameStorage.load('battle_cards_loadout'),
      battle_card_legendary_pity: await GameStorage.load('battle_card_legendary_pity'),
      colony_supplies_data: await GameStorage.load('colony_supplies_data'),
      defense_special_loadout: await GameStorage.load('defense_special_loadout'),
      colony_defense_threats: await GameStorage.load('colony_defense_threats'),
      export_date: new Date().toISOString(),
      version: '1.2'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qch_save_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSfx('click');
  };

  const handleImportSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.time_travel_save) await GameStorage.save(data.time_travel_save, 'time_travel_save');
        if (data.game_theme_index !== undefined) await GameStorage.save(data.game_theme_index, 'game_theme_index');
        if (data.colony_cards_data) await GameStorage.save(data.colony_cards_data, 'colony_cards_data');
        if (data.colony_card_levels) await GameStorage.save(data.colony_card_levels, 'colony_card_levels');
        if (data.colony_search_upgrade_levels) await GameStorage.save(data.colony_search_upgrade_levels, 'colony_search_upgrade_levels');
        if (data.colony_active_search) await GameStorage.save(data.colony_active_search, 'colony_active_search');
        if (data.colony_search_threat_bonus) await GameStorage.save(data.colony_search_threat_bonus, 'colony_search_threat_bonus');
        if (data.horizon_ship_xp !== undefined) await GameStorage.save(data.horizon_ship_xp, 'horizon_ship_xp');
        if (data.route4_defense_battle_level !== undefined) await GameStorage.save(data.route4_defense_battle_level, 'route4_defense_battle_level');
        if (data.battle_cards_loadout) await GameStorage.save(data.battle_cards_loadout, 'battle_cards_loadout');
        if (data.battle_card_legendary_pity !== undefined) await GameStorage.save(data.battle_card_legendary_pity, 'battle_card_legendary_pity');
        if (data.colony_supplies_data) await GameStorage.save(data.colony_supplies_data, 'colony_supplies_data');
        if (data.defense_special_loadout) await GameStorage.save(data.defense_special_loadout, 'defense_special_loadout');
        if (data.colony_defense_threats) await GameStorage.save(data.colony_defense_threats, 'colony_defense_threats');
        
        playSfx('click');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        console.error("Failed to import save", err);
      }
    };
    reader.readAsText(file);
  };

  const tl = (en: string, pt: string) => t(language, en, pt);

  return (
    <motion.main 
      animate={isShaking ? { 
        x: [-2, 2, -2, 2, 0],
        rotate: [-0.5, 0.5, -0.5, 0.5, 0]
      } : {}}
      transition={{ duration: 0.4 }}
      className={`relative min-h-screen w-full flex flex-col ${view === 'game' ? 'items-stretch justify-start' : 'items-start justify-center pl-12 md:pl-24'} bg-[#050510] overflow-hidden `}
    >
      {view === 'narrative' ? (
        <IntroNarrative 
          onComplete={() => setView('game')} 
          onCancel={() => setView('landing')}
          language={language} 
          playerName={playerName}
          setPlayerName={setPlayerName}
          sfxOn={masterSfxOn}
        />
      ) : view === 'game' ? (
        <GameDashboard 
          language={language} 
          musicOn={masterMusicOn} 
          sfxOn={masterSfxOn} 
          setLanguage={setLanguage}
          setMusicOn={(val) => updateSettings({ masterMusicOn: val })}
          setSfxOn={(val) => updateSettings({ masterSfxOn: val })}
          playerName={playerName}
          onReturnToMenu={async () => {
            setView('landing');
            jukeboxState.stop();
            const hasSavedGame = await GameStorage.load('time_travel_save');
            setHasSave(!!hasSavedGame);
            
            // Refresh Route 2 status
            const saved = await GameStorage.load('time_travel_save');
            if (saved) {
              try {
                const data = SaveManager.loadSave(saved);
                const routeTier = data.progression?.routeTier || data.routeTier || 'Solar';
                const techLevels = data.progression?.unlockedTechLevels || data.unlockedTechLevels || {};
                const unlocked = routeTier !== 'Solar' || (techLevels.Solar >= 9);
                
                setIsRoute2Unlocked(unlocked);
                if (unlocked) {
                  const savedThemeIndex = await GameStorage.load('game_theme_index');
                  if (savedThemeIndex === null || savedThemeIndex === undefined) {
                    setCurrentThemeIndex(3); // Default to Saturn (orange) if unlocked
                  }
                }
              } catch (e) {}
            }

            // Refresh local records when returning to menu
            const savedRecords = await GameStorage.load('speed_run_records');
            if (savedRecords) {
              try {
                setLocalRecords(savedRecords);
              } catch (e) {
                setLocalRecords([]);
              }
            }
          }}
          currentThemeIndex={currentThemeIndex}
          jukebox={jukeboxState}
        />
      ) : (
        <>
          {/* Background Elements (Vacuum Focus) */}
          <StarField theme={theme} />
          
          {/* Meteors */}
          <Meteor delay={2} theme={theme} />
          <Meteor delay={7} theme={theme} />
          <Meteor delay={12} theme={theme} />
          
          {/* Animated Ships */}
          <SpaceTraffic />

          {/* Random Visual Event (Stripped of Glows) */}
          <AnimatePresence mode="wait">
            {randomVisual && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1 }}
                className="absolute top-1/2 right-[10%] md:right-[15%] -translate-y-1/2 z-10 pointer-events-none hidden md:flex"
              >
                {randomVisual}
              </motion.div>
            )}
          </AnimatePresence>


          {/* Futuristic Frame */}
          <div className={`absolute inset-4 border ${theme === 'cyan' ? 'border-cyan-500/20' : 'border-orange-500/20'} pointer-events-none z-50`}>
            <div className={`absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-tl-3xl`} />
            <div className={`absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-tr-3xl`} />
            <div className={`absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-bl-3xl`} />
            <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 ${theme === 'cyan' ? 'border-cyan-500/40' : 'border-orange-500/40'} rounded-br-3xl`} />
            
            {/* HUD Elements */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-8">
              <div className={`h-1 w-24 ${theme === 'cyan' ? 'bg-cyan-500/30' : 'bg-orange-500/30'} rounded-full`} />
              <div className="h-1 w-48 bg-pink-500/30 rounded-full" />
              <div className={`h-1 w-24 ${theme === 'cyan' ? 'bg-cyan-500/30' : 'bg-orange-500/30'} rounded-full`} />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-20 flex flex-col items-start gap-8 max-w-4xl w-full px-4">
            {/* Title Section - PC Impact Version */}
            <motion.div
              initial={{ x: -100, opacity: 0, filter: 'blur(20px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-left relative py-12"
            >
              <motion.h1 
                className="font-title leading-[0.9] flex flex-col items-start relative group cursor-default"
              >
                {/* Background Depth Aura */}
                <div className="absolute inset-0 blur-[100px] opacity-30 pointer-events-none select-none -z-10">
                  <span className="text-[7.5rem] text-pink-500 block tracking-[0.5em]">
                    {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
                  </span>
                  <span className={`text-[6rem] ${theme === 'cyan' ? 'text-cyan-500' : 'text-orange-500'} block tracking-[0.8em] mt-4`}>
                    {tl('HORIZON', 'HORIZON')}
                  </span>
                </div>

                {/* Main Text Layer */}
                <span className="text-[5.5rem] md:text-[7.5rem] text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-200 to-pink-500 drop-shadow-[0_0_30px_rgba(219,39,119,0.8)] tracking-[0.5em] relative z-10">
                  <span className="absolute inset-0 shimmer-text opacity-50 pointer-events-none">
                    {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
                  </span>
                  {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
                </span>

                <div className="relative inline-block mt-4">
                  <span className={`text-[4rem] md:text-[6rem] text-transparent bg-clip-text bg-gradient-to-b from-white ${theme === 'cyan' ? 'via-cyan-200 to-cyan-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]' : 'via-orange-200 to-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]'} tracking-[0.8em] relative z-10 uppercase`}>
                    <span className="absolute inset-0 shimmer-text opacity-50 pointer-events-none">
                      {tl('HORIZON', 'HORIZON')}
                    </span>
                    {tl('HORIZON', 'HORIZON')}
                  </span>
                  
                  {/* High-Impact Neon Underline */}
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.2, ease: "circOut" }}
                    className={`h-1.5 mt-2 z-10 ${theme === 'cyan' ? 'bg-cyan-400 shadow-[0_0_40px_rgba(6,182,212,1)]' : 'bg-orange-400 shadow-[0_0_40px_rgba(249,115,22,1)]'}`}
                  />
                </div>
              </motion.h1>
            </motion.div>

            {/* Menu Section */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`w-full max-w-md flex flex-col gap-4 p-8 bg-transparent backdrop-blur-sm border ${theme === 'cyan' ? 'border-cyan-500/5' : 'border-orange-500/5'} rounded-2xl relative`}
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                <div className={`w-full h-1 ${theme === 'cyan' ? 'bg-cyan-500/10' : 'bg-orange-500/10'} absolute top-0 animate-[scan_4s_linear_infinite]`} />
              </div>

              <MenuButton 
                label={tl('CONTINUE', 'CONTINUAR')} 
                icon={Play} 
                onClick={() => {
                  playSfx('aba_click');
                  handleContinue();
                }} 
                disabled={!hasSave}
                theme={theme}
              />
              <MenuButton label={tl('CAMPAIGN', 'CAMPANHA')} icon={Rocket} onClick={() => { playSfx('aba_click'); handleStartGame(); }} theme={theme} />
              <MenuButton label={tl('OPTIONS', 'OPÇÕES')} icon={Settings} onClick={() => { playSfx('aba_click'); setShowOptions(true); }} theme={theme} />
              <MenuButton label={tl('ACHIEVEMENTS', 'CONQUISTAS')} icon={Trophy} onClick={() => { playSfx('aba_click'); setShowAchievements(true); }} theme={theme} />
              

            </motion.div>
          </div>
        </>
      )}

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border-2 border-cyan-500 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-cyan-500/5 absolute top-0 animate-[scan_4s_linear_infinite]" />
              </div>

              <button 
                onClick={() => setShowOptions(false)}
                className="absolute top-4 right-4 text-cyan-500 hover:text-pink-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest border-b border-cyan-500/30 pb-4">
                {tl('OPTIONS', 'OPÇÕES')}
              </h2>

              <div className="space-y-8">
                {/* Horizon Radio - Master Audio Control */}
                <div className="space-y-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <h3 className="text-[12px] font-orbitron text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-2"><Radio className="w-4 h-4" /> {tl('AUDIO ENGINE', 'MOTOR DE ÁUDIO')}</span>
                    <span className="text-[8px] font-mono text-cyan-500/40">v3.0</span>
                  </h3>
                  <button 
                    onClick={() => {
                      playSfx('aba_click');
                      setShowHorizonRadio(true);
                    }}
                    className="w-full py-4 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-orbitron text-sm tracking-[0.2em] hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  >
                    <Sliders className="w-4 h-4" />
                    {tl('HORIZON RADIO', 'HORIZON RADIO')}
                  </button>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {tl('LANGUAGE', 'IDIOMA')}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => { playSfx('aba_click'); setLanguage('pt'); }}
                      className={`w-full py-1.5 rounded font-orbitron text-sm border transition-all ${language === 'pt' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('PORTUGUESE', 'PORTUGUÊS')}
                    </button>
                    <button 
                      onClick={() => { playSfx('aba_click'); setLanguage('en'); }}
                      className={`w-full py-1.5 rounded font-orbitron text-sm border transition-all ${language === 'en' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ENGLISH', 'INGLÊS')}
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="space-y-3 pt-3 border-t border-cyan-500/20">
                  <h3 className="text-[14px] font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> {tl('DATA MANAGEMENT', 'DADOS')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleExportSave}
                      className="py-2 rounded font-orbitron text-[12px] border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-3 h-3 rotate-90" /> {tl('EXPORT', 'EXPORTAR')}
                    </button>
                    <label className="py-2 rounded font-orbitron text-[12px] border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase flex items-center justify-center gap-2 cursor-pointer text-center">
                      <Navigation className="w-3 h-3 -rotate-90" /> {tl('IMPORT', 'IMPORTAR')}
                      <input type="file" accept=".json" onChange={handleImportSave} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-3 border-t border-cyan-500/30">
                  <p className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
                    {tl('Advanced audio settings available in Horizon Radio', 'Configurações avançadas de áudio disponíveis no Horizon Radio')}
                  </p>
                </div>

                {/* Reset Progress */}
                <div className="pt-3 border-t border-cyan-500/20">
                  <button 
                    onClick={() => {
                      playSfx('aba_click');
                      setShowResetConfirm(true);
                    }}
                    className="w-full py-2 rounded font-orbitron text-sm bg-rose-600/20 text-rose-400 border border-rose-500/50 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {tl('RESET PROGRESS', 'RESETAR PROGRESSO')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-rose rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-rose">
                {tl('RESET PROGRESS', 'RESETAR PROGRESSO')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-rose-400 font-orbitron text-base leading-relaxed">
                  {tl('This will permanently delete all your progress, ships, and upgrades. This action cannot be undone.', 'Isso excluirá permanentemente todo o seu progresso, naves e melhorias. Esta ação não pode ser desfeita.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleResetProgress}
                  className="w-full py-4 bg-rose-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-rose-600 transition-all uppercase"
                >
                  {tl('CONFIRM & RESET', 'CONFIRMAR E RESETAR')}
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 text-white/40 font-orbitron text-base hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AchievementsModal 
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedAchievements={unlockedAchievements}
        achievementProgress={achievementProgress}
        language={language}
        theme={theme}
      />

      {/* Jukebox Modal */}
      <Jukebox 
        isOpen={showJukeboxModal} 
        onClose={() => {
          setShowJukeboxModal(false);
          jukeboxState.stop();
        }} 
        language={language}
        {...jukeboxState} 
      />

      {/* Horizon Radio Modal */}
      <HorizonRadioModal 
        isOpen={showHorizonRadio}
        onClose={() => setShowHorizonRadio(false)}
        onOpenJukebox={() => {
          setShowJukeboxModal(true);
          setShowHorizonRadio(false);
        }}
        language={language}
      />

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes glitch-line {
          0% { top: -10%; transform: skewY(0deg); }
          50% { top: 110%; transform: skewY(2deg); }
          100% { top: -10%; transform: skewY(0deg); }
        }
        @keyframes glitch-bg {
          0% { background-color: #050510; }
          95% { background-color: #050510; }
          96% { background-color: #100510; }
          97% { background-color: #051010; }
          98% { background-color: #101005; }
          100% { background-color: #050510; }
        }
      `}</style>
    </motion.main>
  );
}
