/**
 * TuneN2 Typography Tokens
 * Source of truth: docs/design_system.md § 3 – Typography System
 *
 * Based on 1.250 major-third scale, 16px base.
 * Fonts: Inter (UI), Space Grotesk (display), JetBrains Mono (numbers).
 */

export const fontFamilies = {
  /** Primary UI typeface */
  primary: 'Inter',
  /** Display / headline typeface */
  display: 'SpaceGrotesk',
  /** Monospace for monetary values */
  mono: 'JetBrainsMono',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 40,
  money: 28,
  price: 16,
} as const;

export const lineHeights = {
  xs: 16,
  sm: 18,
  base: 24,
  md: 26,
  lg: 28,
  xl: 32,
  '2xl': 36,
  '3xl': 44,
  money: 34,
  price: 24,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
