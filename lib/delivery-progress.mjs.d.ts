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

export function reconcileTotalDeliveries(
  totalDeliveries?: number,
  historyStats?: DeliveryHistoryStats,
): number;
