'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Settings, Trophy, Play, Music, Volume2, Globe, X, Timer, Trash2, ShieldCheck, Clock, Navigation, Database, Coffee, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { IntroNarrative } from '@/components/IntroNarrative';
import { GameDashboard } from '@/components/GameDashboard';
import { AchievementsModal } from '@/components/AchievementsModal';
import { ThemeInfoWindow } from '@/components/ThemeInfoWindow';
import { Jukebox } from '@/components/Jukebox';
import { useJukebox } from '@/hooks/useJukebox';
import { useSFX } from '@/hooks/useSFX';
import { GameStorage } from '@/lib/game-storage';
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
  const currentPath = `${shipType.basePath}_${isMovingRight ? 'right' : 'left'}.png`;
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
            src={currentPath} 
            alt="Space Traffic"
            className="object-contain"
            onError={(e) => {
              // Fallback to _right if _left is not yet available
              (e.target as HTMLImageElement).src = `${shipType.basePath}_right.png`;
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
          src="/cinematic_moon_asset_qch_1777340494996.png" 
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
          src="/cinematic_earth_asset_qch_1777340390078.png" 
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
          src="/cinematic_saturn_asset_qch_1777340512619.png" 
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
        src="/cinematic_x_asset_qch_1777340742793.png" 
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
          src="/cinematic_blackhole_asset_qch_1777340542328.png" 
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
        src="/cinematic_sun_asset_qch_1777340630570.png" 
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
        src="/cinematic_robot_asset_qch_1777340647368.png" 
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
        src="/cinematic_chessboard_asset_qch_1777340695618.png" 
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
        src="/cinematic_alien_asset_qch_1777340712376.png" 
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
      className={`w-full group relative flex items-center justify-start gap-4 py-4 px-8 border ${accentBorder} rounded-xl overflow-hidden transition-all duration-500 ${
        disabled 
          ? 'bg-slate-900/5 border-slate-800/10 cursor-not-allowed opacity-30' 
          : 'bg-slate-900/20 backdrop-blur-md'
      }`}
    >
      {/* Lightning Border Effect - Electric Pulse */}
      {!disabled && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div 
            className="absolute inset-[-400%] animate-[spin_3s_linear_infinite] opacity-60 blur-[1px]" 
            style={{
              background: `conic-gradient(from_0deg,transparent_0%,transparent_49.5%,#fff_50%,${lightningColor}_50.5%,transparent_51%,transparent_100%)`
            }}
          />
          <div className="absolute inset-[1px] bg-slate-950/40 rounded-[11px] z-[-1]" />
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
  const [view, setView] = useState<'landing' | 'narrative' | 'game'>('landing');
  const [showOptions, setShowOptions] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isSpeedRun, setIsSpeedRun] = useState(false);
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
    saveTheme();
  }, [currentThemeIndex]);

  const [showSpeedRunConfirm, setShowSpeedRunConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearRecordsConfirm, setShowClearRecordsConfirm] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  const [showSpeedRunMenu, setShowSpeedRunMenu] = useState(false);
  const [showLocalRecords, setShowLocalRecords] = useState(false);
  const [showOnlineRecords, setShowOnlineRecords] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showJukeboxModal, setShowJukeboxModal] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<{ [key: string]: number }>({});
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);
  const [activeCodes, setActiveCodes] = useState<{ [key: string]: boolean }>({});
  const [isShaking, setIsShaking] = useState(false);
  const [codesView, setCodesView] = useState<'input' | 'list'>('input');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
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
  const { playSfx } = useSFX(sfxOn);

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

    if (view === 'landing' && musicOn && !jukeboxState.isPlaying && audioUnlocked) {
      // Fade in
      bgm.play().catch((err) => console.warn('Audio play blocked:', err));
      let vol = bgm.volume;
      const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.02, 0.45);
        bgm.volume = vol;
        if (vol >= 0.45) clearInterval(fadeIn);
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
  }, [view, musicOn, jukeboxState.isPlaying, audioUnlocked]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Use a small timeout to avoid synchronous setState in effect lint error
    const timer = setTimeout(() => {
      const loadAllData = async () => {
        const saved = await GameStorage.load('time_travel_save');
        if (saved) {
          try {
            const data = saved;
            setPlayerName(data.playerName || '');
            const unlocked = data.routeTier === 'Interstellar' || (data.unlockedTechLevels?.Solar >= 9);
            setIsRoute2Unlocked(unlocked);
            setHasSave(true);
            
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

        const savedCodes = await GameStorage.load('game_unlocked_codes');
        if (savedCodes) {
          try {
            setUnlockedCodes(savedCodes);
          } catch (e) {}
        }

        const savedActiveCodes = await GameStorage.load('game_active_codes');
        if (savedActiveCodes) {
          try {
            setActiveCodes(savedActiveCodes);
          } catch (e) {}
        }

        const savedRecords = await GameStorage.load('speed_run_records');
        if (savedRecords) {
          try {
            setLocalRecords(savedRecords);
          } catch (e) {}
        }
      };
      loadAllData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saveCodes = async () => {
      await GameStorage.save(unlockedCodes, 'game_unlocked_codes');
    };
    saveCodes();
  }, [unlockedCodes]);

  useEffect(() => {
    const saveActiveCodes = async () => {
      await GameStorage.save(activeCodes, 'game_active_codes');
    };
    saveActiveCodes();
  }, [activeCodes]);

  const AVAILABLE_CODES = [
    { 
      code: 'MONEY', 
      name: 'Quantum Wealth', 
      description: { 
        en: 'Start new games with 500,000 QC.', 
        pt: 'Comece novos jogos com 500.000 QC.' 
      } 
    },
    { 
      code: 'NEON', 
      name: 'Neon Horizon', 
      description: { 
        en: 'Unlocks a special visual theme (Visual only).', 
        pt: 'Desbloqueia um tema visual especial (Apenas visual).' 
      } 
    },
    { 
      code: 'EASY', 
      name: 'Easy Mode', 
      description: { 
        en: '-50% cost and +50% profit in mining for "Routes 1" and "Routes 2".', 
        pt: '-50% de custo e +50% de lucro em mineração "Rotas 1" e "Rotas 2".' 
      } 
    },
    { 
      code: 'SIGNAL', 
      name: 'Strange Signal', 
      description: { 
        en: 'Detects strange signals from space.', 
        pt: 'Detecta sinais estranhos vindo do espaço.' 
      } 
    },
    { 
      code: 'GLITCH', 
      name: 'Glitch Mode', 
      description: { 
        en: 'Visual glitches on the landing page (Visual only).', 
        pt: 'A tela inicial fica com glitchs visuais interessantes (Apenas Visual).' 
      } 
    },
    { 
      code: 'HARD', 
      name: 'Hard Mode', 
      description: { 
        en: '-50% profit in all routes. (New game only)', 
        pt: 'Diminui todo o lucro gerado em todas as Rotas em 50%. (Apenas novo jogo)' 
      } 
    },
    { 
      code: 'SPEED', 
      name: 'Speed Demon', 
      description: { 
        en: 'Changes Speed Run Mode colors to Red and Black.', 
        pt: 'Muda as cores do Modo Speed Run (e apenas ele).' 
      } 
    },
    { 
      code: 'SLIKE', 
      name: 'Impossible Mode', 
      description: { 
        en: 'No auto-deliveries, no auto-sell, 1h research. (New game only)', 
        pt: 'Ativa o Modo Impossível (?)! (Apenas jogo novo)' 
      } 
    },
    { 
      code: 'NEILA', 
      name: 'Emerald Theme', 
      description: { 
        en: 'Unlocks the Emerald theme.', 
        pt: 'Desbloqueia o tema Esmeralda.' 
      } 
    }
  ];

  const ECONOMIC_CODES = ['MONEY', 'EASY', 'HARD', 'SLIKE'];
  const VISUAL_CODES = ['NEON', 'SIGNAL', 'GLITCH', 'SPEED', 'NEILA'];
  const LANDING_CODES: string[] = [];

  const handleActivateCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;

    const found = AVAILABLE_CODES.find(c => c.code === code);
    if (!found) {
      setCodeError(tl('CODE NOT RECOGNIZED', 'CÓDIGO NÃO RECONHECIDO'));
      setTimeout(() => setCodeError(''), 3000);
      return;
    }

    if (unlockedCodes.includes(code)) {
      setCodeError(tl('CODE ALREADY ACTIVATED', 'CÓDIGO JÁ ATIVADO'));
      setTimeout(() => setCodeError(''), 3000);
      return;
    }

    setUnlockedCodes(prev => [...prev, code]);
    
    const next = { ...activeCodes };
    
    // Mutual Exclusivity
    if (ECONOMIC_CODES.includes(code)) {
      ECONOMIC_CODES.forEach(ec => { if (ec !== code) next[ec] = false; });
    }
    
    next[code] = true;

    // Save Invalidation
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if ((data.activeCodes?.HARD && !next.HARD) || (data.activeCodes?.SLIKE && !next.SLIKE)) {
          await GameStorage.remove('time_travel_save');
          setHasSave(false);
        }
      } catch (e) {}
    }

    setActiveCodes(next);
    if (code === 'SIGNAL') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    }

    setCodeSuccess(tl('CODE ACTIVATED!', 'CÓDIGO ATIVADO!'));
    setCodeInput('');
    setTimeout(() => setCodeSuccess(''), 3000);
    
    if (sfxOn) {
      playSfx('login_start', { volume: 0.3 }); // Using login_start as a generic success sound or click
    }
  };

  const toggleCode = async (code: string) => {
    const newState = !activeCodes[code];
    const next = { ...activeCodes };

    // Mutual Exclusivity
    if (newState) {
      if (ECONOMIC_CODES.includes(code)) {
        ECONOMIC_CODES.forEach(ec => { if (ec !== code) next[ec] = false; });
      }
      if (LANDING_CODES.includes(code)) {
        LANDING_CODES.forEach(lc => { if (lc !== code) next[lc] = false; });
      }
    }
    
    next[code] = newState;

    // Save Invalidation
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if ((data.activeCodes?.HARD && !next.HARD) || (data.activeCodes?.SLIKE && !next.SLIKE)) {
          await GameStorage.remove('time_travel_save');
          setHasSave(false);
        }
      } catch (e) {}
    }

    if (code === 'NEILA' && newState) {
      setTheme('neila');
    } else if (code === 'NEILA' && !newState) {
      if (theme === 'neila') setTheme('cyan');
    }

    if (code === 'SIGNAL' && newState) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    }

    setActiveCodes(next);

    if (sfxOn) {
      playSfx(newState ? 'aba_click' : 'aba_click', { volume: 0.2 }); 
    }
  };

  const handleStartGame = (speedRun = false) => {
    setIsSpeedRun(speedRun);
    setView('narrative');
  };

  const handleClearRecords = async () => {
    await GameStorage.remove('speed_run_records');
    setLocalRecords([]);
    setShowClearRecordsConfirm(false);
  };

  const handleDeleteRecord = async (index: number) => {
    const updatedRecords = [...localRecords];
    updatedRecords.splice(index, 1);
    setLocalRecords(updatedRecords);
    await GameStorage.save(updatedRecords, 'speed_run_records');
  };

  const handleContinue = async () => {
    const saved = await GameStorage.load('time_travel_save');
    if (saved) {
      try {
        const data = saved;
        if (data.playerName) {
          setPlayerName(data.playerName);
        }
        setIsSpeedRun(false);
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
      if (isSpeedRun) {
        setView('game');
      } else {
        setView('narrative');
      }
    }
  };

  const handleResetProgress = async () => {
    await GameStorage.remove('time_travel_save');
    setHasSave(false);
    setPlayerName('');
    setIsRoute2Unlocked(false);
    setUnlockedAchievements([]);
    setAchievementProgress({});
    setShowResetConfirm(false);
    setShowOptions(false);
  };

  const handleExportSave = async () => {
    const data = {
      time_travel_save: await GameStorage.load('time_travel_save'),
      game_theme_index: await GameStorage.load('game_theme_index'),
      game_unlocked_codes: await GameStorage.load('game_unlocked_codes'),
      game_active_codes: await GameStorage.load('game_active_codes'),
      speed_run_records: await GameStorage.load('speed_run_records'),
      export_date: new Date().toISOString(),
      version: '1.0'
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
        if (data.game_unlocked_codes) await GameStorage.save(data.game_unlocked_codes, 'game_unlocked_codes');
        if (data.game_active_codes) await GameStorage.save(data.game_active_codes, 'game_active_codes');
        if (data.speed_run_records) await GameStorage.save(data.speed_run_records, 'speed_run_records');
        
        playSfx('click');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        console.error("Failed to import save", err);
      }
    };
    reader.readAsText(file);
  };

  if (view === 'narrative') {
    return (
      <IntroNarrative 
        onComplete={() => setView('game')} 
        onCancel={() => setView('landing')}
        language={language} 
        playerName={playerName}
        setPlayerName={setPlayerName}
        sfxOn={sfxOn}
      />
    );
  }

  if (view === 'game') {
    return (
      <GameDashboard 
        language={language} 
        musicOn={musicOn} 
        sfxOn={sfxOn} 
        setLanguage={setLanguage}
        setMusicOn={setMusicOn}
        setSfxOn={setSfxOn}
        playerName={playerName}
        isSpeedRun={isSpeedRun}
        activeCodes={activeCodes}
        setActiveCodes={setActiveCodes}
        unlockedCodes={unlockedCodes}
        setUnlockedCodes={setUnlockedCodes}
        localRecords={localRecords}
        setLocalRecords={setLocalRecords}
        onReturnToMenu={async () => {
          setView('landing');
          setIsSpeedRun(false);
          const hasSavedGame = await GameStorage.load('time_travel_save');
          setHasSave(!!hasSavedGame);
          
          // Refresh Route 2 status
          const saved = await GameStorage.load('time_travel_save');
          if (saved) {
            try {
              const data = saved;
              const unlocked = data.routeTier === 'Interstellar' || (data.unlockedTechLevels?.Solar >= 9);
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
    );
  }

  const tl = (en: string, pt: string) => t(language, en, pt);

  return (
    <main className={`relative min-h-screen w-full flex flex-col items-start justify-center pl-12 md:pl-24 bg-[#050510] overflow-hidden ${isMounted && activeCodes['GLITCH'] ? 'animate-[glitch-bg_0.2s_infinite]' : ''}`}>
      {/* Glitch Overlay for Code */}
      {activeCodes['GLITCH'] && (
        <div className="fixed inset-0 z-[200] pointer-events-none opacity-30 overflow-hidden">
          <div className={`absolute inset-0 ${theme === 'cyan' ? 'bg-cyan-500/5' : theme === 'orange' ? 'bg-orange-500/5' : 'bg-emerald-500/5'} animate-pulse`} />
          <div className="absolute top-0 left-0 w-full h-1 bg-pink-500/50 animate-[glitch-line_2s_infinite]" />
          <div className={`absolute top-1/4 left-0 w-full h-2 ${theme === 'cyan' ? 'bg-cyan-500/30' : theme === 'orange' ? 'bg-orange-500/30' : 'bg-emerald-500/30'} animate-[glitch-line_3s_infinite_reverse]`} />
          <div className="absolute top-3/4 left-0 w-full h-1 bg-white/40 animate-[glitch-line_1.5s_infinite]" />
        </div>
      )}
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
        {/* Title Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-left relative"
        >
          {/* Decorative Elements Removed */}
          
          <motion.h1 
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-michroma tracking-tighter leading-tight flex flex-col items-start relative group cursor-default"
          >
            {/* Background Depth Layer */}
            <div className="absolute inset-0 blur-2xl opacity-20 pointer-events-none select-none">
              <span className="text-4xl md:text-6xl text-pink-500 block">
                {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
              </span>
              <span className={`text-3xl md:text-5xl ${theme === 'cyan' ? 'text-cyan-500' : 'text-orange-500'} block`}>
                {tl('HORIZON', 'HORIZON')}
              </span>
            </div>

            <span className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-200 to-pink-500 drop-shadow-[0_0_15px_rgba(219,39,119,0.6)] relative z-10">
              <span className="absolute inset-0 shimmer-text opacity-70 pointer-events-none">
                {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
              </span>
              {tl('QUANTUM COURIER', 'QUANTUM COURIER')}
            </span>
            <div className="relative inline-block">
              <span className={`text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-white ${theme === 'cyan' ? 'via-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'via-orange-200 to-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]'} relative z-10`}>
                <span className="absolute inset-0 shimmer-text opacity-70 pointer-events-none">
                  {tl('HORIZON', 'HORIZON')}
                </span>
                {tl('HORIZON', 'HORIZON')}
              </span>
              
              {/* Decorative underline restricted to HORIZON */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5, duration: 1 }}
                className={`h-0.5 mt-1 z-10 ${theme === 'cyan' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)]'}`}
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
          <MenuButton label={tl('CAMPAIGN', 'CAMPANHA')} icon={Rocket} onClick={() => { playSfx('aba_click'); handleStartGame(false); }} theme={theme} />
          <MenuButton label={tl('SPEED RUN', 'SPEED RUN')} icon={Timer} onClick={() => { playSfx('aba_click'); setShowSpeedRunMenu(true); }} theme={theme} />
          <MenuButton label={tl('OPTIONS', 'OPÇÕES')} icon={Settings} onClick={() => { playSfx('aba_click'); setShowOptions(true); }} theme={theme} />
          <MenuButton label={tl('ACHIEVEMENTS', 'CONQUISTAS')} icon={Trophy} onClick={() => { playSfx('aba_click'); setShowAchievements(true); }} theme={theme} />
          
          <div className={`mt-4 flex flex-col gap-1 text-[15px] font-mono ${theme === 'cyan' ? 'text-cyan-500/40' : 'text-orange-500/40'} uppercase tracking-widest`}>
            <div className="flex justify-between">
              <span>{tl('System: Offline', 'Sistema: Offline')}</span>
              <span>{tl('Signal: Local', 'Sinal: Local')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Name Prompt Modal - Removed as it's now in IntroNarrative */}

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
                {/* Music */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Music className="w-4 h-4" /> {tl('MUSIC', 'MÚSICA')}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { playSfx('aba_click'); setMusicOn(true); }}
                      className={`flex-1 py-1.5 rounded font-orbitron text-sm border transition-all ${musicOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ON', 'LIGADO')}
                    </button>
                    <button 
                      onClick={() => { playSfx('aba_click'); setMusicOn(false); }}
                      className={`flex-1 py-1.5 rounded font-orbitron text-sm border transition-all ${!musicOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('OFF', 'DESLIGADO')}
                    </button>
                  </div>
                </div>

                {/* SFX */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-orbitron text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> {tl('SOUND EFFECTS', 'EFEITOS SONOROS')}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { playSfx('aba_click'); setSfxOn(true); }}
                      className={`flex-1 py-1.5 rounded font-orbitron text-sm border transition-all ${sfxOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('ON', 'LIGADO')}
                    </button>
                    <button 
                      onClick={() => { playSfx('aba_click'); setSfxOn(false); }}
                      className={`flex-1 py-1.5 rounded font-orbitron text-sm border transition-all ${!sfxOn ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500/40 border-cyan-500/20'}`}
                    >
                      {tl('OFF', 'DESLIGADO')}
                    </button>
                  </div>
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

                {/* Jukebox & Codes Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cyan-500/30">
                  <button 
                    onClick={() => {
                      playSfx('aba_click');
                      setShowOptions(false);
                      setShowJukeboxModal(true);
                    }}
                    className="w-full py-3 bg-slate-800/40 border border-cyan-500/30 text-cyan-400 font-orbitron text-sm tracking-widest rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500 transition-all uppercase flex items-center justify-center gap-2 group"
                  >
                    <Music className="w-4 h-4 group-hover:scale-110 transition-transform" /> JUKEBOX
                  </button>

                  <button 
                    onClick={() => {
                      playSfx('aba_click');
                      setShowCodesModal(true);
                    }}
                    className="w-full py-3 bg-slate-800/40 border border-cyan-500/30 text-cyan-400 font-orbitron text-sm tracking-widest rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500 transition-all uppercase flex items-center justify-center gap-2 group"
                  >
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" /> {tl('CODES', 'CÓDIGOS')}
                  </button>
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

      {/* Speed Run Menu Modal */}
      <AnimatePresence>
        {showSpeedRunMenu && (
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
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />
              
              <button 
                onClick={() => setShowSpeedRunMenu(false)}
                className="absolute top-4 right-4 text-pink-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-pink">
                {tl('SPEED RUN MODE', 'MODO SPEED RUN')}
              </h2>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowSpeedRunMenu(false);
                    setShowSpeedRunConfirm(true);
                  }}
                  className="w-full py-4 bg-pink-600/20 border border-pink-500 text-white font-orbitron tracking-widest rounded-lg hover:bg-pink-600 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Rocket className="w-5 h-5" /> {tl('NEW SPEED RUN', 'NOVA SPEED RUN')}
                </button>
                
                <button 
                  onClick={() => {
                    setShowLocalRecords(true);
                  }}
                  className="w-full py-4 bg-slate-800/40 border border-cyan-500/30 text-white font-orbitron tracking-widest rounded-lg hover:border-cyan-500 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Trophy className="w-5 h-5 text-yellow-400" /> {tl('LOCAL RECORDS', 'RECORDES LOCAIS')}
                </button>

                <button 
                  onClick={() => {
                    setShowOnlineRecords(true);
                  }}
                  className="w-full py-4 bg-slate-800/40 border border-cyan-500/30 text-white/50 font-orbitron tracking-widest rounded-lg transition-all uppercase flex items-center justify-center gap-3 cursor-not-allowed"
                >
                  <Globe className="w-5 h-5" /> {tl('ONLINE RECORDS (SOON)', 'RECORDES ONLINE (FUTURAMENTE)')}
                </button>

                <button 
                  onClick={() => {
                    setShowClearRecordsConfirm(true);
                  }}
                  className="w-full py-4 bg-rose-900/20 border border-rose-500/30 text-rose-400 font-orbitron tracking-widest rounded-lg hover:bg-rose-900/40 hover:border-rose-500 transition-all uppercase flex items-center justify-center gap-3"
                >
                  <Trash2 className="w-5 h-5" /> {tl('CLEAR LOCAL RECORDS', 'APAGAR RECORDES LOCAIS')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Records Modal */}
      <AnimatePresence>
        {showLocalRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-panel neon-border-cyan rounded-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowLocalRecords(false)}
                className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-cyan">
                {tl('LOCAL RECORDS', 'RECORDES LOCAIS')}
              </h2>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                {localRecords.length === 0 ? (
                  <p className="text-center text-slate-500 font-orbitron py-8 uppercase tracking-widest">
                    {tl('No records found', 'Nenhum recorde encontrado')}
                  </p>
                ) : (
                  localRecords.slice(0, 10).map((record, index) => {
                    const isTop3 = index < 3;
                    const trophyColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : 'text-amber-600';
                    const glowClass = index === 0 ? 'shadow-[0_0_15px_rgba(250,204,21,0.4)] border-yellow-400/50' : 
                                     index === 1 ? 'shadow-[0_0_15px_rgba(203,213,225,0.3)] border-slate-300/50' : 
                                     index === 2 ? 'shadow-[0_0_15px_rgba(217,119,6,0.3)] border-amber-600/50' : 
                                     'border-white/5';
                    
                    return (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 bg-slate-800/40 border rounded-lg relative group transition-all duration-300 ${glowClass} ${isTop3 ? 'hover:scale-[1.02]' : ''}`}
                      >
                        {isTop3 && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${index === 0 ? 'from-yellow-400/5' : index === 1 ? 'from-slate-300/5' : 'from-amber-600/5'} to-transparent pointer-events-none rounded-lg`} />
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="flex flex-col items-center justify-center w-10">
                            {isTop3 ? (
                              <motion.div
                                animate={{ 
                                  filter: ['drop-shadow(0 0 2px currentColor)', 'drop-shadow(0 0 8px currentColor)', 'drop-shadow(0 0 2px currentColor)'],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className={trophyColor}
                              >
                                <Trophy className="w-6 h-6" />
                              </motion.div>
                            ) : (
                              <span className="text-lg font-orbitron font-bold text-slate-500">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-orbitron text-base uppercase tracking-wider flex items-center gap-2">
                              {record.name}
                              {index === 0 && <span className="text-[14px] bg-yellow-400 text-black px-1 rounded font-bold animate-pulse">CHAMPION</span>}
                            </p>
                            <p className="text-base text-slate-500 font-mono">{record.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <span className={`font-orbitron text-base ${index === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {formatTime(record.time)}
                          </span>
                          <button 
                            onClick={() => handleDeleteRecord(index)}
                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-20 group-hover:opacity-100"
                            title={tl('Delete record', 'Apagar recorde')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Records Modal (Placeholder) */}
      <AnimatePresence>
        {showOnlineRecords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowOnlineRecords(false)}
                className="absolute top-4 right-4 text-pink-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-pink">
                {tl('ONLINE RECORDS', 'RECORDES ONLINE')}
              </h2>

              <div className="text-center py-12 space-y-4">
                <Globe className="w-16 h-16 text-pink-500/50 mx-auto animate-pulse" />
                <p className="text-pink-400 font-orbitron text-base uppercase tracking-widest">
                  {tl('Coming Soon in v3.0', 'Em breve na v3.0')}
                </p>
                <p className="text-slate-500 text-[14px] font-orbitron">
                  {tl('Global leaderboards are under development.', 'Placares globais estão em desenvolvimento.')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Records Confirmation Modal */}
      <AnimatePresence>
        {showClearRecordsConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel neon-border-rose rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-rose">
                {tl('CLEAR ALL RECORDS', 'APAGAR TODOS OS RECORDES')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-rose-400 font-orbitron text-base leading-relaxed">
                  {tl('This will permanently delete ALL your speed run records. This action cannot be undone.', 'Isso excluirá permanentemente TODOS os seus recordes de speed run. Esta ação não pode ser desfeita.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleClearRecords}
                  className="w-full py-4 bg-rose-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-rose-600 transition-all uppercase"
                >
                  {tl('CONFIRM & CLEAR', 'CONFIRMAR E APAGAR')}
                </button>
                <button 
                  onClick={() => setShowClearRecordsConfirm(false)}
                  className="w-full py-3 text-white/40 font-orbitron text-base hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
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

      {/* Speed Run Confirmation Modal */}
      <AnimatePresence>
        {showSpeedRunConfirm && (
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
              className="w-full max-w-md glass-panel neon-border-pink rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />
              
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center neon-text-pink">
                {tl('SPEED RUN MODE', 'MODO SPEED RUN')}
              </h2>

              <div className="space-y-4 text-center mb-8">
                <p className="text-cyan-400 font-orbitron text-base leading-relaxed">
                  {tl('Start a new game focused on Route 1.', 'Inicie uma nova partida focada na Rota 1.')}
                </p>
                
                <div className="py-6 border-y border-white/5 space-y-4">
                  <p className="text-white/60 text-base font-orbitron uppercase tracking-[0.2em]">{tl('OBJECTIVE:', 'OBJETIVO:')}</p>
                  <p className="text-white text-base font-orbitron leading-relaxed uppercase tracking-wider">
                    {tl('Buy, Unlock, Upgrade, Automate...', 'Compre, Desbloqueie, Melhore, automatize...')}
                  </p>
                  <p className="text-cyan-400 text-[14px] font-orbitron font-bold uppercase tracking-widest animate-pulse">
                    {tl('Rule Route 1 as fast as you can.', 'Reine na Rota 1 o mais rápido que puder.')}
                  </p>
                </div>

                <p className="text-pink-400 font-orbitron text-[14px]">
                  ⏱️ {tl('The game ends when everything is completed.', 'O jogo termina ao completar tudo.')}
                </p>
                <p className="text-white font-orbitron text-[14px] italic">
                  {tl('Be fast. Every second counts.', 'Seja rápido. Cada segundo conta.')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    playSfx('login_start');
                    setShowSpeedRunConfirm(false);
                    setShowOptions(false);
                    handleStartGame(true);
                  }}
                  className="w-full py-4 bg-pink-600 text-white font-orbitron font-bold tracking-widest rounded-lg hover:bg-white hover:text-pink-600 transition-all uppercase"
                >
                  {tl('CONFIRM & START', 'CONFIRMAR E INICIAR')}
                </button>
                <button 
                  onClick={() => {
                    playSfx('aba_click');
                    setShowSpeedRunConfirm(false);
                  }}
                  className="w-full py-3 text-white/40 font-orbitron text-base hover:text-white transition-colors uppercase"
                >
                  {tl('CANCEL', 'CANCELAR')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codes Modal */}
      <AnimatePresence>
        {showCodesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                x: isShaking ? [0, -5, 5, -5, 5, 0] : 0
              }}
              transition={{ 
                x: isShaking ? { duration: 0.1, repeat: 10 } : { duration: 0.3 }
              }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full ${codesView === 'list' ? 'max-w-6xl' : 'max-w-lg'} glass-panel neon-border-cyan rounded-2xl p-8 relative overflow-hidden transition-all duration-500`}
            >
              <button 
                onClick={() => {
                  setShowCodesModal(false);
                  setCodesView('input');
                }}
                className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-orbitron font-bold text-white mb-8 tracking-widest text-center neon-text-cyan">
                {codesView === 'input' ? tl('CODES SYSTEM', 'SISTEMA DE CÓDIGOS') : tl('DISCOVERED CODES', 'CÓDIGOS DESCOBERTOS')}
              </h2>

              {isSpeedRun && (
                <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-lg text-center">
                  <p className="text-rose-500 font-orbitron text-base uppercase tracking-widest">
                    {tl('CODES DISABLED IN SPEED RUN MODE', 'CÓDIGOS DESCOBERTOS DESATIVADOS NO MODO SPEED RUN')}
                  </p>
                </div>
              )}

              <div className="relative min-h-[250px]">
                <AnimatePresence mode="wait">
                  {codesView === 'input' ? (
                    <motion.div
                      key="input-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      {/* Input Section */}
                      <div className="space-y-4">
                        <label className="text-base font-orbitron text-cyan-400 uppercase tracking-widest block">
                          {tl('INSERT CODE', 'INSERIR CÓDIGO')}
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            placeholder="********"
                            className="flex-1 bg-slate-800 border border-cyan-500/30 rounded px-4 py-3 text-white font-orbitron text-base focus:outline-none focus:border-cyan-500 transition-colors uppercase"
                          />
                          <button 
                            onClick={handleActivateCode}
                            className="px-6 bg-cyan-500 text-black font-orbitron font-bold tracking-widest rounded hover:bg-white transition-all uppercase"
                          >
                            {tl('ACTIVATE', 'ATIVAR')}
                          </button>
                        </div>
                        <AnimatePresence mode="wait">
                          {codeError && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-rose-500 font-orbitron text-base uppercase tracking-widest"
                            >
                              {codeError}
                            </motion.p>
                          )}
                          {codeSuccess && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-emerald-500 font-orbitron text-base uppercase tracking-widest"
                            >
                              {codeSuccess}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Arrow to List View */}
                      {unlockedCodes.length > 0 && (
                        <div className="flex justify-end mt-8">
                          <button 
                            onClick={() => setCodesView('list')}
                            className="flex items-center gap-2 text-cyan-500 hover:text-white transition-all group"
                          >
                            <span className="text-base font-orbitron uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              {tl('DISCOVERED', 'DESCOBERTOS')}
                            </span>
                            <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-500 group-hover:bg-cyan-500/10 transition-all">
                              <ChevronRight className="w-6 h-6" />
                            </div>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <button 
                          onClick={() => setCodesView('input')}
                          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-base font-orbitron text-white/40 uppercase tracking-[0.3em]">
                          {tl('BACK TO INPUT', 'VOLTAR AO INÍCIO')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {unlockedCodes.map(code => {
                          const info = AVAILABLE_CODES.find(c => c.code === code);
                          const isActive = activeCodes[code];
                          
                          let colorClass = 'text-cyan-400';
                          let glowClass = 'shadow-[0_0_20px_rgba(6,182,212,0.1)]';
                          let borderClass = 'border-cyan-500/40';
                          let bgClass = 'bg-cyan-500/5';
                          let dotClass = 'bg-cyan-400';
                          let toggleBorderClass = 'border-cyan-500';
                          let toggleBgClass = 'bg-cyan-500/20';
                          let toggleThumbClass = 'bg-cyan-400';
                          let toggleShadowClass = 'shadow-[0_0_15px_rgba(6,182,212,0.5)]';

                          if (isActive) {
                            if (ECONOMIC_CODES.includes(code)) {
                              colorClass = 'text-green-400';
                              glowClass = 'shadow-[0_0_20px_rgba(74,222,128,0.1)]';
                              borderClass = 'border-green-500/40';
                              bgClass = 'bg-green-500/5';
                              dotClass = 'bg-green-400';
                              toggleBorderClass = 'border-green-500';
                              toggleBgClass = 'bg-green-500/20';
                              toggleThumbClass = 'bg-green-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(74,222,128,0.5)]';
                            } else if (VISUAL_CODES.includes(code)) {
                              colorClass = 'text-yellow-400';
                              glowClass = 'shadow-[0_0_20px_rgba(250,204,21,0.1)]';
                              borderClass = 'border-yellow-500/40';
                              bgClass = 'bg-yellow-500/5';
                              dotClass = 'bg-yellow-400';
                              toggleBorderClass = 'border-yellow-500';
                              toggleBgClass = 'bg-yellow-500/20';
                              toggleThumbClass = 'bg-yellow-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(250,204,21,0.5)]';
                            } else if (LANDING_CODES.includes(code)) {
                              colorClass = 'text-blue-400';
                              glowClass = 'shadow-[0_0_20px_rgba(96,165,250,0.1)]';
                              borderClass = 'border-blue-500/40';
                              bgClass = 'bg-blue-500/5';
                              dotClass = 'bg-blue-400';
                              toggleBorderClass = 'border-blue-500';
                              toggleBgClass = 'bg-blue-500/20';
                              toggleThumbClass = 'bg-blue-400';
                              toggleShadowClass = 'shadow-[0_0_15px_rgba(96,165,250,0.5)]';
                            }
                          } else {
                            colorClass = 'text-rose-400';
                            glowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.1)]';
                            borderClass = 'border-rose-500/40';
                            bgClass = 'bg-rose-500/5';
                            dotClass = 'bg-rose-400';
                            toggleBorderClass = 'border-rose-500';
                            toggleBgClass = 'bg-rose-500/20';
                            toggleThumbClass = 'bg-rose-400';
                            toggleShadowClass = 'shadow-[0_0_15px_rgba(244,63,94,0.5)]';
                          }

                          return (
                            <div 
                              key={code} 
                              className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-500 group ${bgClass} ${borderClass} ${glowClass}`}
                            >
                              {/* Background Glow */}
                              <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${isActive ? (ECONOMIC_CODES.includes(code) ? 'bg-green-500' : VISUAL_CODES.includes(code) ? 'bg-yellow-500' : 'bg-blue-500') : 'bg-rose-500'}`} />
                              
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} />
                                    <p className={`font-orbitron text-base uppercase tracking-wider transition-colors ${colorClass}`}>
                                      {info?.name || code}
                                    </p>
                                  </div>
                                  <p className="text-base text-slate-400 font-orbitron uppercase tracking-widest mt-2 leading-relaxed">
                                    {tl(info?.description.en || '', info?.description.pt || '')}
                                  </p>
                                </div>

                                <button 
                                  onClick={() => toggleCode(code)}
                                  className={`relative w-20 h-10 rounded-full border-2 transition-all duration-500 flex items-center px-1 ${toggleBorderClass} ${toggleBgClass} ${toggleShadowClass}`}
                                >
                                  <motion.div 
                                    animate={{ x: isActive ? 40 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${toggleThumbClass}`}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-white/40" />
                                  </motion.div>
                                  <span className={`absolute ${isActive ? 'left-3' : 'right-3'} text-[15px] font-orbitron font-bold tracking-tighter`}>
                                    {isActive ? 'ON' : 'OFF'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        onClose={() => setShowJukeboxModal(false)} 
        language={language}
        {...jukeboxState} 
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
    </main>
  );
}
