'use client';

import React, { useEffect, useRef } from 'react';
import type { PremiumCanvasButtonTone } from './PremiumCanvasButton';

type StaticCardTone = PremiumCanvasButtonTone;

const STATIC_CARD_PALETTE: Record<StaticCardTone, {
  edge: string;
  edgeSoft: string;
  bodyTop: string;
  bodyBottom: string;
  glow: string;
  highlight: string;
  shadow: string;
}> = {
  amber: {
    edge: 'rgba(245,158,11,0.72)',
    edgeSoft: 'rgba(245,158,11,0.22)',
    bodyTop: 'rgba(39,29,16,0.94)',
    bodyBottom: 'rgba(16,13,11,0.96)',
    glow: 'rgba(251,191,36,0.18)',
    highlight: 'rgba(255,232,150,0.42)',
    shadow: 'rgba(120,53,15,0.32)',
  },
  indigo: {
    edge: 'rgba(129,140,248,0.72)',
    edgeSoft: 'rgba(99,102,241,0.2)',
    bodyTop: 'rgba(25,27,59,0.94)',
    bodyBottom: 'rgba(13,14,31,0.96)',
    glow: 'rgba(129,140,248,0.18)',
    highlight: 'rgba(199,210,254,0.38)',
    shadow: 'rgba(49,46,129,0.32)',
  },
  purple: {
    edge: 'rgba(168,85,247,0.74)',
    edgeSoft: 'rgba(147,51,234,0.24)',
    bodyTop: 'rgba(39,22,66,0.94)',
    bodyBottom: 'rgba(20,14,36,0.96)',
    glow: 'rgba(168,85,247,0.2)',
    highlight: 'rgba(233,213,255,0.4)',
    shadow: 'rgba(88,28,135,0.32)',
  },
  cyan: {
    edge: 'rgba(34,211,238,0.74)',
    edgeSoft: 'rgba(6,182,212,0.26)',
    bodyTop: 'rgba(8,49,63,0.94)',
    bodyBottom: 'rgba(5,24,36,0.96)',
    glow: 'rgba(34,211,238,0.2)',
    highlight: 'rgba(207,250,254,0.42)',
    shadow: 'rgba(14,116,144,0.32)',
  },
  blue: {
    edge: 'rgba(96,165,250,0.72)',
    edgeSoft: 'rgba(37,99,235,0.24)',
    bodyTop: 'rgba(15,35,69,0.94)',
    bodyBottom: 'rgba(7,18,39,0.96)',
    glow: 'rgba(59,130,246,0.18)',
    highlight: 'rgba(191,219,254,0.4)',
    shadow: 'rgba(30,64,175,0.32)',
  },
  green: {
    edge: 'rgba(74,222,128,0.74)',
    edgeSoft: 'rgba(34,197,94,0.24)',
    bodyTop: 'rgba(13,48,31,0.94)',
    bodyBottom: 'rgba(5,25,18,0.96)',
    glow: 'rgba(74,222,128,0.18)',
    highlight: 'rgba(187,247,208,0.4)',
    shadow: 'rgba(21,128,61,0.3)',
  },
  orange: {
    edge: 'rgba(251,146,60,0.74)',
    edgeSoft: 'rgba(249,115,22,0.22)',
    bodyTop: 'rgba(50,28,14,0.94)',
    bodyBottom: 'rgba(24,15,9,0.96)',
    glow: 'rgba(251,146,60,0.18)',
    highlight: 'rgba(254,215,170,0.4)',
    shadow: 'rgba(154,52,18,0.32)',
  },
  red: {
    edge: 'rgba(248,113,113,0.74)',
    edgeSoft: 'rgba(239,68,68,0.22)',
    bodyTop: 'rgba(58,17,24,0.94)',
    bodyBottom: 'rgba(28,10,16,0.96)',
    glow: 'rgba(248,113,113,0.18)',
    highlight: 'rgba(254,202,202,0.38)',
    shadow: 'rgba(153,27,27,0.3)',
  },
  brown: {
    edge: 'rgba(217,119,6,0.76)',
    edgeSoft: 'rgba(251,191,36,0.22)',
    bodyTop: 'rgba(58,36,18,0.94)',
    bodyBottom: 'rgba(24,16,10,0.96)',
    glow: 'rgba(180,83,9,0.2)',
    highlight: 'rgba(253,230,138,0.4)',
    shadow: 'rgba(120,53,15,0.34)',
  },
  steel: {
    edge: 'rgba(148,163,184,0.5)',
    edgeSoft: 'rgba(148,163,184,0.16)',
    bodyTop: 'rgba(21,29,43,0.94)',
    bodyBottom: 'rgba(10,16,29,0.96)',
    glow: 'rgba(148,163,184,0.12)',
    highlight: 'rgba(226,232,240,0.28)',
    shadow: 'rgba(15,23,42,0.42)',
  },
};

const drawPremiumStaticCard = (
  canvas: HTMLCanvasElement,
  tone: StaticCardTone,
  density: 'compact' | 'standard' | 'message'
) => {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const palette = STATIC_CARD_PALETTE[tone];
  const radius = Math.min(density === 'compact' ? 8 : 14, Math.max(6, height * 0.18));
  const inset = Math.max(1.4, Math.min(2.2, height * 0.035));
  const cut = Math.min(density === 'compact' ? 8 : 14, Math.max(6, height * 0.16));
  const path = new Path2D();
  path.moveTo(inset + radius, inset);
  path.lineTo(width - inset - cut, inset);
  path.lineTo(width - inset, inset + cut);
  path.lineTo(width - inset, height - inset - radius);
  path.quadraticCurveTo(width - inset, height - inset, width - inset - radius, height - inset);
  path.lineTo(inset + cut, height - inset);
  path.lineTo(inset, height - inset - cut);
  path.lineTo(inset, inset + radius);
  path.quadraticCurveTo(inset, inset, inset + radius, inset);
  path.closePath();

  ctx.save();
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = Math.min(18, height * 0.18);
  ctx.shadowOffsetY = Math.min(6, height * 0.08);
  const body = ctx.createLinearGradient(0, inset, 0, height - inset);
  body.addColorStop(0, palette.bodyTop);
  body.addColorStop(0.64, palette.bodyBottom);
  body.addColorStop(1, 'rgba(3,7,18,0.98)');
  ctx.fillStyle = body;
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.clip(path);
  const innerGlow = ctx.createRadialGradient(width * 0.18, height * 0.2, 0, width * 0.18, height * 0.2, width * 0.72);
  innerGlow.addColorStop(0, palette.glow);
  innerGlow.addColorStop(0.42, 'rgba(255,255,255,0.035)');
  innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = innerGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = density === 'compact' ? 0.1 : 0.14;
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 1;
  const spacing = density === 'compact' ? 28 : 34;
  for (let x = 12; x < width + height; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x - height * 0.5, height - 5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = Math.max(1, Math.min(1.5, height * 0.022));
  ctx.stroke(path);
  ctx.strokeStyle = palette.edgeSoft;
  ctx.lineWidth = Math.max(2, Math.min(3.4, height * 0.045));
  ctx.stroke(path);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = palette.highlight;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(13, Math.max(5, height * 0.11));
  ctx.lineTo(Math.max(36, width * 0.32), Math.max(5, height * 0.11));
  ctx.moveTo(width - 13, height - Math.max(6, height * 0.12));
  ctx.lineTo(width - Math.max(36, width * 0.28), height - Math.max(6, height * 0.12));
  ctx.stroke();
  ctx.restore();
};

export function PremiumStaticCard({
  children,
  className = '',
  contentClassName = '',
  tone = 'steel',
  density = 'standard',
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: StaticCardTone;
  density?: 'compact' | 'standard' | 'message';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => drawPremiumStaticCard(canvas, tone, density);
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [density, tone]);

  return (
    <div className={`relative isolate overflow-hidden rounded-xl ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
      <div className={`relative z-10 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
