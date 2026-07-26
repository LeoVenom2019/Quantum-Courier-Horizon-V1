const POPULATION_GROWTH_SLOWDOWN_THRESHOLD = 100_000_000_000;
const POPULATION_GROWTH_SLOWDOWN_MULTIPLIER = 0.05;

const getPopulationGrowthRange = (year) => {
  const safeYear = Math.max(0, Math.floor(Number(year) || 0));
  if (safeYear > 8) return { min: 0.06, max: 0.10 };
  if (safeYear > 4) return { min: 0.03, max: 0.06 };
  return { min: 0.05, max: 0.09 };
};

export const calculateNewEarthAnnualPopulationGrowth = (
  totalPopulation,
  year,
  random = Math.random,
) => {
  const safePopulation = Math.max(0, Number(totalPopulation) || 0);
  const { min, max } = getPopulationGrowthRange(year);
  const roll = Math.max(0, Math.min(0.999999, Number(random()) || 0));
  const rate = min + roll * (max - min);
  const slowdown = safePopulation >= POPULATION_GROWTH_SLOWDOWN_THRESHOLD
    ? POPULATION_GROWTH_SLOWDOWN_MULTIPLIER
    : 1;

  return {
    rate,
    growth: safePopulation * rate * slowdown,
  };
};
