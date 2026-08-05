const toDeliveryCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};

const getTierDeliveries = (historyStats, tier) => (
  toDeliveryCount(historyStats?.[tier]?.deliveries)
);

export const getDeliveriesByTierFromLocations = (deliveriesByLocation, routes, tier) => (
  (Array.isArray(routes) ? routes : [])
    .filter((route) => route?.tier === tier)
    .reduce((total, route) => {
      const byDestination = toDeliveryCount(deliveriesByLocation?.[route.destination]);
      const byRouteId = toDeliveryCount(deliveriesByLocation?.[route.id]);
      return total + Math.max(byDestination, byRouteId);
    }, 0)
);

export const reconcileHistoryDeliveryStats = ({ historyStats, deliveriesByLocation, routes }) => {
  const reconciled = { ...(historyStats || {}) };

  for (const tier of ['Solar', 'Interstellar']) {
    const current = { ...(reconciled[tier] || {}) };
    const classified = toDeliveryCount(current.manualDeliveries) + toDeliveryCount(current.autoDeliveries);
    const locations = getDeliveriesByTierFromLocations(deliveriesByLocation, routes, tier);
    current.deliveries = Math.max(toDeliveryCount(current.deliveries), classified, locations);

    const acquiredBySource = [
      'qcFromDeliveries',
      'qcFromMining',
      'qcFromExtraction',
      'qcFromMissions',
      'qcFromTutorial',
      'qcFromBattles',
    ].reduce((total, field) => total + Math.max(0, Number(current[field]) || 0), 0);
    current.qcTotalAcquired = Math.max(0, Number(current.qcTotalAcquired) || 0, acquiredBySource);
    reconciled[tier] = current;
  }

  return reconciled;
};

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
