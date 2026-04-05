export const FONT_SIZE_MULTIPLIERS = {
  latin: 1,
  arabic: 1.3,
  transliteration: 1,
} as const;

export const LINE_HEIGHT_MULTIPLIERS = {
  latin: 1.6,
  arabic: 2.2,
  transliteration: 1.85,
} as const;

export type TextType = keyof typeof FONT_SIZE_MULTIPLIERS;

export function getScaledFontSize(baseFontSize: number, type: TextType) {
  return Math.round(baseFontSize * FONT_SIZE_MULTIPLIERS[type]);
}

export function getScaledLineHeight(baseFontSize: number, type: TextType) {
  const scaledFontSize = getScaledFontSize(baseFontSize, type);
  return Math.ceil(scaledFontSize * LINE_HEIGHT_MULTIPLIERS[type]);
}