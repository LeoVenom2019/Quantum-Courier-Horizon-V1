export interface DeliveryHistoryStats {
  [tier: string]: {
    deliveries?: number;
    [field: string]: unknown;
  } | undefined;
}

export function getChapterDeliveryProgress(options: {
  totalDeliveries?: number;
  historyStats?: DeliveryHistoryStats;
  includeInterstellar?: boolean;
}): number;

export function getRemainingDeliveries(current: number, target: number): number;
export function getDeliveriesByTierFromLocations(
  deliveriesByLocation: Record<string, number> | undefined,
  routes: Array<{ id: string; destination: string; tier: string }>,
  tier: string,
): number;
export function reconcileHistoryDeliveryStats(options: {
  historyStats?: Record<string, Record<string, number>>;
  deliveriesByLocation?: Record<string, number>;
  routes?: Array<{ id: string; destination: string; tier: string }>;
}): Record<string, Record<string, number>>;

export function reconcileTotalDeliveries(
  totalDeliveries?: number,
  historyStats?: DeliveryHistoryStats,
): number;
