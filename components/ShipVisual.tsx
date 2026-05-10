'use client';

import React from 'react';
import { Rocket } from 'lucide-react';
import Lottie from 'lottie-react';
import { Ship } from '@/lib/game-data';

interface ShipVisualProps {
  ship: Ship;
  className?: string;
}

const ShipVisual = ({ ship, className = "" }: ShipVisualProps) => {
  const [lottieData, setLottieData] = React.useState<any>(null);

  React.useEffect(() => {
    if (ship.lottie) {
      fetch(ship.lottie)
        .then(res => {
          const ct = res.headers.get('content-type') || '';
          if (!res.ok || !ct.includes('json')) {
            throw new Error(`Lottie fetch failed: ${res.status} (${ct})`);
          }
          return res.json();
        })
        .then(data => setLottieData(data))
        .catch(() => setLottieData(null));
    } else {
      setLottieData(null);
    }
  }, [ship.lottie]);

  if (ship.image) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={ship.image} 
          alt={ship.name} 
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
        />
      </div>
    );
  }

  if (ship.lottie && lottieData) {
    return (
      <div className={className}>
        <Lottie animationData={lottieData} loop={true} />
      </div>
    );
  }

  return <Rocket className={`${className} ${ship.color}`} />;
};

export default ShipVisual;
