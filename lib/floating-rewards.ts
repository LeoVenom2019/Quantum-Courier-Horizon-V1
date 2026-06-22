export type FloatingRewardSource = Element | EventTarget | null | undefined;

export type FloatingRewardPayload = {
  id: string;
  amount: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  sourceType?: 'mining' | 'mission' | 'extraction' | 'delivery' | 'battle' | 'generic';
};

const getRectCenter = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const isVisibleRect = (rect: DOMRect) => (
  rect.width > 0 &&
  rect.height > 0 &&
  rect.bottom >= 0 &&
  rect.right >= 0 &&
  rect.top <= window.innerHeight &&
  rect.left <= window.innerWidth
);

const resolveElement = (source?: FloatingRewardSource | string): Element | null => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (!source) return null;
  if (typeof source === 'string') return document.querySelector(source);
  return source instanceof Element ? source : null;
};

export const createFloatingReward = ({
  amount,
  source,
  sourceSelector,
  sourceType = 'generic',
  targetSelector = '[data-qc-total-target]',
}: {
  amount: number;
  source?: FloatingRewardSource;
  sourceSelector?: string;
  sourceType?: FloatingRewardPayload['sourceType'];
  targetSelector?: string;
}): FloatingRewardPayload => {
  const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  const fallbackTargetX = typeof window !== 'undefined' ? window.innerWidth - 100 : 1000;
  const fallbackTargetY = 40;

  const sourceElement = resolveElement(source) || resolveElement(sourceSelector);
  const sourceRect = sourceElement?.getBoundingClientRect();
  const sourceCenter = sourceRect && isVisibleRect(sourceRect)
    ? getRectCenter(sourceRect)
    : { x: fallbackX, y: fallbackY };

  const targetElement = resolveElement(targetSelector);
  const targetRect = targetElement?.getBoundingClientRect();
  const targetCenter = targetRect && isVisibleRect(targetRect)
    ? getRectCenter(targetRect)
    : { x: fallbackTargetX, y: fallbackTargetY };

  return {
    id: Math.random().toString(36).substr(2, 9),
    amount,
    x: sourceCenter.x,
    y: sourceCenter.y,
    targetX: targetCenter.x,
    targetY: targetCenter.y,
    sourceType,
  };
};