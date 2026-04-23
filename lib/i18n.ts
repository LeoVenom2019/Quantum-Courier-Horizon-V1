export type Language = 'pt' | 'en';

export const t = (language: Language, en: string, pt: string) => {
  if (language === 'en') return en;
  return pt;
};
