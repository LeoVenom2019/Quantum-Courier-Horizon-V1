'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Crosshair,
  Flame,
  HeartPulse,
  LucideIcon,
  Shield,
  Snowflake,
  Sparkles,
  Swords,
  Target,
  X,
  Zap,
} from 'lucide-react';
import {
  getAvailableHorizonSkillPoints,
  HORIZON_SKILL_CAPS,
  HorizonSkillAllocation,
  HorizonSkillId,
} from '@/lib/horizon-skill-tree';
import { PremiumCanvasButton } from './ui/PremiumCanvasButton';

type HorizonSkillTreeModalProps = {
  language: 'en' | 'pt';
  horizonLevel: number;
  skills: HorizonSkillAllocation;
  onUpgrade: (skillId: HorizonSkillId) => void;
  onClose: () => void;
};

type SkillDefinition = {
  id: HorizonSkillId;
  name: { en: string; pt: string };
  description: { en: string; pt: string };
  effect: { en: string; pt: string };
  icon: LucideIcon;
  color: string;
  glow: string;
};

const CORE_SKILLS: SkillDefinition[] = [
  {
    id: 'damage',
    name: { en: 'Base Damage', pt: 'Dano' },
    description: { en: 'Amplifies the Horizon main battery.', pt: 'Amplifica a bateria principal da Horizon.' },
    effect: { en: '+20% base damage per point', pt: '+20% de dano base por ponto' },
    icon: Swords,
    color: 'border-rose-300/35 bg-rose-400/10 text-rose-100',
    glow: 'shadow-[0_0_35px_rgba(244,63,94,0.16)]',
  },
  {
    id: 'shield',
    name: { en: 'Shield', pt: 'Escudo' },
    description: { en: 'Reinforces the defensive energy lattice.', pt: 'Reforça a malha de energia defensiva.' },
    effect: { en: '+20% base shield per point', pt: '+20% de escudo base por ponto' },
    icon: Shield,
    color: 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100',
    glow: 'shadow-[0_0_35px_rgba(34,211,238,0.16)]',
  },
  {
    id: 'critChance',
    name: { en: 'Critical Chance', pt: 'Chance Crítica' },
    description: { en: 'Improves tactical weak-point acquisition.', pt: 'Melhora a aquisição de pontos fracos.' },
    effect: { en: '+1% critical chance per point', pt: '+1% de chance crítica por ponto' },
    icon: Target,
    color: 'border-amber-300/35 bg-amber-400/10 text-amber-100',
    glow: 'shadow-[0_0_35px_rgba(251,191,36,0.16)]',
  },
  {
    id: 'critDamage',
    name: { en: 'Critical Damage', pt: 'Dano Crítico' },
    description: { en: 'Overcharges confirmed critical strikes.', pt: 'Sobrecarrega impactos críticos confirmados.' },
    effect: { en: '+20% base critical damage per point', pt: '+20% de dano crítico base por ponto' },
    icon: Crosshair,
    color: 'border-orange-300/35 bg-orange-400/10 text-orange-100',
    glow: 'shadow-[0_0_35px_rgba(251,146,60,0.16)]',
  },
];

const ELEMENTAL_SKILLS: SkillDefinition[] = [
  {
    id: 'fireDamage',
    name: { en: 'Fire Damage', pt: 'Dano de Fogo' },
    description: { en: 'Ignites every Horizon projectile.', pt: 'Incendeia cada projétil da Horizon.' },
    effect: { en: '+10% base damage as fire', pt: '+10% do dano base como fogo' },
    icon: Flame,
    color: 'border-orange-400/40 bg-orange-500/10 text-orange-100',
    glow: 'shadow-[0_0_35px_rgba(249,115,22,0.2)]',
  },
  {
    id: 'iceDamage',
    name: { en: 'Ice Damage', pt: 'Dano de Gelo' },
    description: { en: 'Infuses rounds with cryogenic force.', pt: 'Infunde os disparos com força criogênica.' },
    effect: { en: '+10% base damage as ice', pt: '+10% do dano base como gelo' },
    icon: Snowflake,
    color: 'border-sky-300/40 bg-sky-400/10 text-sky-100',
    glow: 'shadow-[0_0_35px_rgba(125,211,252,0.2)]',
  },
  {
    id: 'electricDamage',
    name: { en: 'Electric Damage', pt: 'Dano Elétrico' },
    description: { en: 'Routes storm energy into the cannons.', pt: 'Canaliza energia de tempestade aos canhões.' },
    effect: { en: '+10% base damage as electricity', pt: '+10% do dano base como eletricidade' },
    icon: Zap,
    color: 'border-violet-300/40 bg-violet-400/10 text-violet-100',
    glow: 'shadow-[0_0_35px_rgba(167,139,250,0.2)]',
  },
];

const DRONE_SKILLS: SkillDefinition[] = [
  {
    id: 'damageDrone',
    name: { en: 'Damage Support Drone', pt: 'Drone Suporte de Dano' },
    description: { en: 'Focuses one target and fires for 40% of current base damage.', pt: 'Foca um inimigo por vez e dispara causando 40% do dano base atual.' },
    effect: { en: 'Unlock autonomous attack drone', pt: 'Libera drone de ataque autônomo' },
    icon: Bot,
    color: 'border-fuchsia-300/40 bg-fuchsia-400/10 text-fuchsia-100',
    glow: 'shadow-[0_0_42px_rgba(232,121,249,0.22)]',
  },
  {
    id: 'defenseDrone',
    name: { en: 'Defense Support Drone', pt: 'Drone Suporte de Defesa' },
    description: { en: 'Every 10s, heals 10% hull and weakens one enemy by 20% for 10s.', pt: 'A cada 10s, cura 10% da vida e reduz em 20% o dano de um inimigo por 10s.' },
    effect: { en: 'Unlock autonomous defense drone', pt: 'Libera drone de defesa autônomo' },
    icon: HeartPulse,
    color: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100',
    glow: 'shadow-[0_0_42px_rgba(52,211,153,0.22)]',
  },
];

const SkillNode = ({
  skill,
  level,
  availablePoints,
  language,
  onUpgrade,
  index,
}: {
  skill: SkillDefinition;
  level: number;
  availablePoints: number;
  language: 'en' | 'pt';
  onUpgrade: (skillId: HorizonSkillId) => void;
  index: number;
}) => {
  const max = HORIZON_SKILL_CAPS[skill.id];
  const complete = level >= max;
  const disabled = complete || availablePoints <= 0;
  const Icon = skill.icon;
  const progress = max > 0 ? (level / max) * 100 : 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.06 + index * 0.035 }}
      whileHover={disabled ? undefined : { y: -3, scale: 1.012 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      onClick={() => onUpgrade(skill.id)}
      disabled={disabled}
      className={`group relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all ${skill.color} ${level > 0 ? skill.glow : 'opacity-80'} ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-white/45'}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_20%,rgba(255,255,255,0.07)_50%,transparent_80%)] opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/45">
          <Icon className="h-5 w-5" />
          {level > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white/50 bg-current shadow-[0_0_10px_currentColor]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-orbitron text-[11px] font-black uppercase leading-tight tracking-wide text-white">{skill.name[language]}</h4>
            <span className="shrink-0 font-mono text-[10px] font-black tracking-widest text-white">{level}/{max}</span>
          </div>
          <p className="mt-1 text-[10px] leading-snug text-zinc-400">{skill.description[language]}</p>
          <p className="mt-1.5 font-mono text-[8px] font-bold uppercase tracking-wider opacity-85">{skill.effect[language]}</p>
        </div>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-black/55">
        <motion.div
          className="h-full rounded-full bg-current shadow-[0_0_12px_currentColor]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
      <div className="relative mt-2 text-right font-mono text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {complete ? (language === 'pt' ? 'Domínio completo' : 'Mastered') : availablePoints > 0 ? (language === 'pt' ? 'Clique para aprimorar' : 'Click to upgrade') : (language === 'pt' ? 'Sem pontos disponíveis' : 'No points available')}
      </div>
    </motion.button>
  );
};

export const HorizonSkillTreeModal: React.FC<HorizonSkillTreeModalProps> = ({
  language,
  horizonLevel,
  skills,
  onUpgrade,
  onClose,
}) => {
  const availablePoints = getAvailableHorizonSkillPoints(horizonLevel, skills);
  const t = (en: string, pt: string) => language === 'pt' ? pt : en;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-[#02050b]/90 p-4 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative flex max-h-[92vh] w-full max-w-[1420px] flex-col overflow-hidden rounded-[2rem] border border-cyan-200/25 bg-[#050914] shadow-[0_0_120px_rgba(34,211,238,0.18),0_0_240px_rgba(168,85,247,0.1)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_8%_80%,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_92%_78%,rgba(249,115,22,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(103,232,249,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-black/35 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-cyan-300">Horizon Neural Matrix</p>
              <h2 className="font-orbitron text-2xl font-black uppercase tracking-tight text-white">{t('Skill Tree', 'Árvore de Habilidades')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-right sm:block">
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-500">Horizon</p>
              <p className="font-orbitron text-sm font-black text-white">LVL {horizonLevel}</p>
            </div>
            <div className={`rounded-2xl border px-5 py-2 text-center ${availablePoints > 0 ? 'border-amber-300/40 bg-amber-300/15 shadow-[0_0_30px_rgba(251,191,36,0.16)]' : 'border-white/10 bg-white/5'}`}>
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-400">{t('Available points', 'Pontos disponíveis')}</p>
              <p className="font-orbitron text-xl font-black text-amber-200">{availablePoints}</p>
            </div>
            <PremiumCanvasButton type="button" onClick={onClose} tone="steel" className="h-11 w-11 rounded-2xl" contentClassName="text-zinc-200">
              <X className="h-5 w-5" />
            </PremiumCanvasButton>
          </div>
        </header>

        <div className="relative z-10 min-h-0 overflow-y-auto p-5 [scrollbar-color:rgba(103,232,249,0.35)_transparent]">
          <div className="mx-auto grid max-w-[1360px] items-start gap-4 xl:grid-cols-[1.15fr_0.9fr_1fr]">
            <section className="relative rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-rose-300">Branch 01</p>
                  <h3 className="font-orbitron text-sm font-black uppercase text-white">{t('Combat Systems', 'Sistemas de Combate')}</h3>
                </div>
                <Swords className="h-5 w-5 text-rose-300/70" />
              </div>
              <div className="pointer-events-none absolute bottom-5 left-1/2 top-16 w-px bg-gradient-to-b from-rose-300/35 via-amber-300/20 to-transparent" />
              <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {CORE_SKILLS.map((skill, index) => <SkillNode key={skill.id} skill={skill} level={skills[skill.id]} availablePoints={availablePoints} language={language} onUpgrade={onUpgrade} index={index} />)}
              </div>
            </section>

            <section className="relative rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-sky-300">Branch 02</p>
                  <h3 className="font-orbitron text-sm font-black uppercase text-white">{t('Elemental Arsenal', 'Arsenal Elemental')}</h3>
                </div>
                <Zap className="h-5 w-5 text-sky-300/70" />
              </div>
              <div className="pointer-events-none absolute bottom-5 left-8 top-16 w-px bg-gradient-to-b from-sky-300/40 via-violet-300/25 to-transparent" />
              <div className="relative grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {ELEMENTAL_SKILLS.map((skill, index) => <SkillNode key={skill.id} skill={skill} level={skills[skill.id]} availablePoints={availablePoints} language={language} onUpgrade={onUpgrade} index={CORE_SKILLS.length + index} />)}
              </div>
            </section>

            <section className="relative rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-fuchsia-300">Branch 03</p>
                  <h3 className="font-orbitron text-sm font-black uppercase text-white">{t('Autonomous Support', 'Suporte Autônomo')}</h3>
                </div>
                <Bot className="h-5 w-5 text-fuchsia-300/70" />
              </div>
              <div className="pointer-events-none absolute left-1/2 top-16 h-10 w-px bg-gradient-to-b from-fuchsia-300/50 to-emerald-300/20" />
              <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {DRONE_SKILLS.map((skill, index) => <SkillNode key={skill.id} skill={skill} level={skills[skill.id]} availablePoints={availablePoints} language={language} onUpgrade={onUpgrade} index={CORE_SKILLS.length + ELEMENTAL_SKILLS.length + index} />)}
              </div>

            </section>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default HorizonSkillTreeModal;
