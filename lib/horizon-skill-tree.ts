export type HorizonSkillId =
  | 'damage'
  | 'shield'
  | 'critChance'
  | 'critDamage'
  | 'fireDamage'
  | 'iceDamage'
  | 'electricDamage'
  | 'damageDrone'
  | 'defenseDrone';

export type HorizonSkillAllocation = Record<HorizonSkillId, number>;

export const HORIZON_SKILL_CAPS: HorizonSkillAllocation = {
  damage: 20,
  shield: 20,
  critChance: 14,
  critDamage: 14,
  fireDamage: 10,
  iceDamage: 10,
  electricDamage: 10,
  damageDrone: 1,
  defenseDrone: 1,
};

export const DEFAULT_HORIZON_SKILLS: HorizonSkillAllocation = {
  damage: 0,
  shield: 0,
  critChance: 0,
  critDamage: 0,
  fireDamage: 0,
  iceDamage: 0,
  electricDamage: 0,
  damageDrone: 0,
  defenseDrone: 0,
};

export const normalizeHorizonSkills = (value: unknown): HorizonSkillAllocation => {
  const source = value && typeof value === 'object' ? value as Partial<Record<HorizonSkillId, unknown>> : {};
  return (Object.keys(DEFAULT_HORIZON_SKILLS) as HorizonSkillId[]).reduce((skills, id) => {
    skills[id] = Math.max(0, Math.min(HORIZON_SKILL_CAPS[id], Math.floor(Number(source[id]) || 0)));
    return skills;
  }, { ...DEFAULT_HORIZON_SKILLS });
};

export const getSpentHorizonSkillPoints = (skills: HorizonSkillAllocation) => (
  (Object.keys(HORIZON_SKILL_CAPS) as HorizonSkillId[]).reduce((total, id) => total + skills[id], 0)
);

export const getAvailableHorizonSkillPoints = (horizonLevel: number, skills: HorizonSkillAllocation) => (
  Math.max(0, Math.floor(Number(horizonLevel) || 0) - getSpentHorizonSkillPoints(skills))
);
