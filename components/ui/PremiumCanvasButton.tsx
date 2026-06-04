'use client';

import React, { useEffect, useRef } from 'react';

export type PremiumCanvasButtonTone = 'amber' | 'indigo' | 'purple' | 'cyan' | 'blue' | 'green' | 'orange' | 'red' | 'brown' | 'steel';

const BUTTON_PALETTE: Record<PremiumCanvasButtonTone, {
  edge: string;
  edgeSoft: string;
  bodyTop: string;
  bodyBottom: string;
  glow: string;
  highlight: string;
  shadow: string;
}> = {
  amber: {
    edge: 'rgba(245,158,11,0.96)',
    edgeSoft: 'rgba(245,158,11,0.34)',
    bodyTop: 'rgba(54,35,14,0.98)',
    bodyBottom: 'rgba(25,18,12,0.98)',
    glow: 'rgba(251,191,36,0.5)',
    highlight: 'rgba(255,232,150,0.78)',
    shadow: 'rgba(120,53,15,0.65)',
  },
  indigo: {
    edge: 'rgba(129,140,248,0.96)',
    edgeSoft: 'rgba(99,102,241,0.36)',
    bodyTop: 'rgba(31,31,70,0.98)',
    bodyBottom: 'rgba(17,18,38,0.98)',
    glow: 'rgba(129,140,248,0.46)',
    highlight: 'rgba(199,210,254,0.72)',
    shadow: 'rgba(49,46,129,0.62)',
  },
  purple: {
    edge: 'rgba(168,85,247,0.96)',
    edgeSoft: 'rgba(147,51,234,0.4)',
    bodyTop: 'rgba(48,24,82,0.98)',
    bodyBottom: 'rgba(28,16,48,0.98)',
    glow: 'rgba(168,85,247,0.5)',
    highlight: 'rgba(233,213,255,0.74)',
    shadow: 'rgba(88,28,135,0.62)',
  },
  cyan: {
    edge: 'rgba(34,211,238,0.96)',
    edgeSoft: 'rgba(6,182,212,0.42)',
    bodyTop: 'rgba(10,62,78,0.98)',
    bodyBottom: 'rgba(7,31,45,0.98)',
    glow: 'rgba(34,211,238,0.5)',
    highlight: 'rgba(207,250,254,0.76)',
    shadow: 'rgba(14,116,144,0.62)',
  },
  blue: {
    edge: 'rgba(96,165,250,0.96)',
    edgeSoft: 'rgba(37,99,235,0.42)',
    bodyTop: 'rgba(17,38,74,0.98)',
    bodyBottom: 'rgba(8,21,44,0.98)',
    glow: 'rgba(59,130,246,0.5)',
    highlight: 'rgba(191,219,254,0.74)',
    shadow: 'rgba(30,64,175,0.62)',
  },
  green: {
    edge: 'rgba(74,222,128,0.96)',
    edgeSoft: 'rgba(34,197,94,0.4)',
    bodyTop: 'rgba(16,55,34,0.98)',
    bodyBottom: 'rgba(7,28,20,0.98)',
    glow: 'rgba(74,222,128,0.46)',
    highlight: 'rgba(187,247,208,0.72)',
    shadow: 'rgba(21,128,61,0.58)',
  },
  orange: {
    edge: 'rgba(251,146,60,0.96)',
    edgeSoft: 'rgba(249,115,22,0.38)',
    bodyTop: 'rgba(66,32,13,0.98)',
    bodyBottom: 'rgba(33,18,10,0.98)',
    glow: 'rgba(251,146,60,0.48)',
    highlight: 'rgba(254,215,170,0.72)',
    shadow: 'rgba(154,52,18,0.6)',
  },
  red: {
    edge: 'rgba(248,113,113,0.95)',
    edgeSoft: 'rgba(239,68,68,0.36)',
    bodyTop: 'rgba(70,18,24,0.98)',
    bodyBottom: 'rgba(34,12,18,0.98)',
    glow: 'rgba(248,113,113,0.42)',
    highlight: 'rgba(254,202,202,0.7)',
    shadow: 'rgba(153,27,27,0.58)',
  },
  brown: {
    edge: 'rgba(217,119,6,0.98)',
    edgeSoft: 'rgba(251,191,36,0.34)',
    bodyTop: 'rgba(72,43,18,0.98)',
    bodyBottom: 'rgba(29,20,12,0.98)',
    glow: 'rgba(180,83,9,0.52)',
    highlight: 'rgba(253,230,138,0.72)',
    shadow: 'rgba(120,53,15,0.68)',
  },
  steel: {
    edge: 'rgba(148,163,184,0.84)',
    edgeSoft: 'rgba(148,163,184,0.25)',
    bodyTop: 'rgba(31,41,55,0.98)',
    bodyBottom: 'rgba(15,23,42,0.98)',
    glow: 'rgba(148,163,184,0.28)',
    highlight: 'rgba(226,232,240,0.5)',
    shadow: 'rgba(15,23,42,0.72)',
  },
};

const drawPremiumCanvasButton = (
  canvas: HTMLCanvasElement,
  tone: PremiumCanvasButtonTone,
  disabled: boolean,
  disabledVisual: 'muted' | 'tone' = 'muted'
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

  const palette = BUTTON_PALETTE[tone];
  const mutedDisabled = disabled && disabledVisual === 'muted';
  const radius = Math.min(10, Math.max(5, height * 0.16));
  const inset = Math.max(1.6, Math.min(2.5, height * 0.04));
  const cut = Math.min(13, Math.max(7, height * 0.18));
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
  ctx.shadowColor = mutedDisabled ? 'rgba(0,0,0,0.55)' : palette.shadow;
  ctx.shadowBlur = mutedDisabled ? 7 : Math.min(18, height * 0.28);
  ctx.shadowOffsetY = mutedDisabled ? 2 : Math.min(8, height * 0.12);
  const body = ctx.createLinearGradient(0, inset, 0, height - inset);
  body.addColorStop(0, mutedDisabled ? 'rgba(31,41,55,0.98)' : palette.bodyTop);
  body.addColorStop(0.58, mutedDisabled ? 'rgba(20,27,39,0.98)' : palette.bodyBottom);
  body.addColorStop(1, 'rgba(5,9,18,0.98)');
  ctx.fillStyle = body;
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.clip(path);
  const innerGlow = ctx.createRadialGradient(width * 0.5, height * 0.12, 0, width * 0.5, height * 0.12, width * 0.62);
  innerGlow.addColorStop(0, mutedDisabled ? 'rgba(255,255,255,0.1)' : palette.glow);
  innerGlow.addColorStop(0.36, 'rgba(255,255,255,0.05)');
  innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = innerGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = mutedDisabled ? 0.08 : 0.16;
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 1;
  for (let x = 14; x < width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 5);
    ctx.lineTo(x + 18, height - 7);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = mutedDisabled ? 'rgba(148,163,184,0.32)' : palette.edge;
  ctx.lineWidth = Math.max(1.2, Math.min(1.8, height * 0.026));
  ctx.stroke(path);
  ctx.strokeStyle = mutedDisabled ? 'rgba(148,163,184,0.18)' : palette.edgeSoft;
  ctx.lineWidth = Math.max(2.2, Math.min(4, height * 0.06));
  ctx.stroke(path);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = mutedDisabled ? 'rgba(226,232,240,0.18)' : palette.highlight;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(14, Math.max(5, height * 0.1));
  ctx.lineTo(width * 0.42, Math.max(5, height * 0.1));
  ctx.moveTo(width - 16, height - Math.max(6, height * 0.12));
  ctx.lineTo(width * 0.58, height - Math.max(6, height * 0.12));
  ctx.stroke();
  ctx.restore();
};

export function PremiumCanvasButton({
  children,
  className = '',
  contentClassName = '',
  disabled = false,
  disabledVisual = 'muted',
  onClick,
  tone,
  type = 'button',
  ...buttonProps
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  disabledVisual?: 'muted' | 'tone';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  tone: PremiumCanvasButtonTone;
  type?: 'button' | 'submit' | 'reset';
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled' | 'onClick' | 'type'>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => drawPremiumCanvasButton(canvas, tone, disabled, disabledVisual);
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [disabled, disabledVisual, tone]);

  const palette = BUTTON_PALETTE[tone];
  const hoverGlow = disabled ? 'rgba(148,163,184,0.18)' : palette.glow;
  const activeFlash = disabled ? 'rgba(226,232,240,0.16)' : palette.highlight;
  const hasPositionClass = /\b(?:static|fixed|absolute|relative|sticky)\b/.test(className);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group ${hasPositionClass ? '' : 'relative'} isolate overflow-hidden rounded-[10px] font-orbitron transition-all duration-100 active:translate-y-[3px] active:scale-[0.992] disabled:cursor-not-allowed ${disabledVisual === 'tone' ? 'disabled:opacity-100' : 'disabled:opacity-70'} ${className}`}
      {...buttonProps}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
      <span
        className={`pointer-events-none absolute inset-[1px] z-[1] rounded-[inherit] opacity-0 transition-opacity duration-200 ${disabled ? '' : 'group-hover:opacity-100'}`}
        style={{
          background: `radial-gradient(circle at 50% 12%, ${hoverGlow} 0%, rgba(255,255,255,0.08) 34%, transparent 72%)`,
          boxShadow: `inset 0 0 18px ${hoverGlow}, 0 0 16px ${hoverGlow}`,
        }}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute inset-y-[-45%] left-0 z-[2] w-[34%] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 blur-[1px] mix-blend-screen ${disabled ? '' : 'group-hover:animate-[premium-button-sweep_1.18s_ease-in-out_infinite]'}`}
        style={{ boxShadow: `0 0 18px ${activeFlash}` }}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute inset-[2px] z-[3] rounded-[inherit] opacity-0 transition-opacity duration-75 ${disabled ? '' : 'group-active:opacity-100'}`}
        style={{
          background: `linear-gradient(180deg, ${activeFlash} 0%, rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.18) 100%)`,
          boxShadow: `inset 0 2px 8px rgba(255,255,255,0.24), inset 0 -8px 14px rgba(0,0,0,0.28)`,
        }}
        aria-hidden="true"
      />
      <span className={`relative z-10 flex h-full w-full items-center justify-center ${contentClassName}`}>
        {children}
      </span>
    </button>
  );
}
