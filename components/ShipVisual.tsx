'use client';

import React from 'react';
import Image from 'next/image';
import { Rocket } from 'lucide-react';
import Lottie from 'lottie-react';
import { Ship } from '@/lib/game-data';

interface ShipVisualProps {
  ship: Ship;
  className?: string;
}

const ShipVisual = ({ ship, className = "" }: ShipVisualProps) => {
  const [lottieAsset, setLottieAsset] = React.useState<{ src: string; data: any } | null>(null);

  React.useEffect(() => {
    if (!ship.lottie) return;

    const src = ship.lottie;
    let cancelled = false;

    fetch(src)
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('json')) {
          throw new Error(`Lottie fetch failed: ${res.status} (${ct})`);
        }
        return res.json();
      })
      .then(data => {
        if (!cancelled) setLottieAsset({ src, data });
      })
      .catch(() => {
        if (!cancelled) setLottieAsset(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ship.lottie]);

  if (ship.image) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Image unoptimized width={800} height={600} 
          src={ship.image} 
          alt={ship.name} 
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
        />
      </div>
    );
  }

  if (ship.lottie && lottieAsset?.src === ship.lottie) {
    return (
      <div className={className}>
        <Lottie animationData={lottieAsset.data} loop={true} />
      </div>
    );
  }

  return <Rocket className={`${className} ${ship.color}`} />;
};

export default ShipVisual;
