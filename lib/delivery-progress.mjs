const toDeliveryCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};

const getTierDeliveries = (historyStats, tier) => (
  toDeliveryCount(historyStats?.[tier]?.deliveries)
);

export const getChapterDeliveryProgress = ({
  totalDeliveries,
  historyStats,
  includeInterstellar = false,
}) => {
  const historyDeliveries = getTierDeliveries(historyStats, 'Solar')
    + (includeInterstellar ? getTierDeliveries(historyStats, 'Interstellar') : 0);

  // Older saves may contain only one counter. Preserve the greatest valid total.
  return Math.max(toDeliveryCount(totalDeliveries), historyDeliveries);
};

export const getRemainingDeliveries = (current, target) => (
  Math.max(0, toDeliveryCount(target) - toDeliveryCount(current))
);

export const reconcileTotalDeliveries = (totalDeliveries, historyStats) => (
  getChapterDeliveryProgress({ totalDeliveries, historyStats, includeInterstellar: true })
);
