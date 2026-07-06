const COMPACT_SUFFIX_MULTIPLIERS: Record<string, number> = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

const normalizeNumericString = (value: string): string => {
  const hasComma = value.includes(',');
  const hasDot = value.includes('.');

  if (hasComma && hasDot) {
    const lastComma = value.lastIndexOf(',');
    const lastDot = value.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';

    return value
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
  }

  if (hasComma || hasDot) {
    const separator = hasComma ? ',' : '.';
    const parts = value.split(separator);
    const separatorLooksLikeThousands = parts.length > 1
      && parts.slice(1).every(part => part.length === 3)
      && parts[0].length <= 3;

    return separatorLooksLikeThousands
      ? parts.join('')
      : value.replace(separator, '.');
  }

  return value;
};

export const normalizeGameNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') return 0;

  const compact = value.trim().replace(/\s+/g, '');
  if (!compact) return 0;

  const match = compact.match(/^(-?[\d.,]+)([kmbt])?$/i);
  if (!match) return 0;

  const rawNumber = match[1];
  const suffix = match[2]?.toLowerCase();
  const parsed = Number(normalizeNumericString(rawNumber));

  if (!Number.isFinite(parsed)) return 0;
  return parsed * (suffix ? COMPACT_SUFFIX_MULTIPLIERS[suffix] : 1);
};
