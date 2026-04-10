/**
 * TuneN2 Color Tokens
 * Source of truth: tuneN2.pen design file
 *
 * Dark-mode-first. All screens should reference these tokens
 * instead of hardcoding hex values.
 */

export const darkColors = {
  // Backgrounds
  bgPrimary: '#0D0D0F',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  bgElevated: '#2C2C2E',

  // Text
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // Accents
  accentPrimary: '#FF6B2E',
  accentSecondary: '#BF5AF2',
  accentTertiary: '#06B6D4',

  // Status
  success: '#30D158',
  warning: '#EAB308',
  error: '#EF4444',

  // Borders
  borderDefault: '#2C2C2E',
  borderFocus: '#FF6B2E',

  // Gradients (start, end)
  gradientBrand: ['#FF6B2E', '#BF5AF2'] as const,
  gradientDownload: ['#FF6B2E', '#BF5AF2'] as const,
  gradientEarnings: ['#F97316', '#EAB308'] as const,

  // Overlay / transparency helpers
  errorBgSubtle: 'rgba(239,68,68,0.1)',
  accentBgSubtle: 'rgba(255,107,46,0.08)',
  transparent: 'transparent',
  white: '#FFFFFF',
} as const;

export const lightColors = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F4F4F5',
  bgElevated: '#FFFFFF',

  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',

  accentPrimary: '#FF6B2E',
  accentSecondary: '#BF5AF2',
  accentTertiary: '#06B6D4',

  success: '#30D158',
  warning: '#EAB308',
  error: '#EF4444',

  borderDefault: '#E4E4E7',
  borderFocus: '#FF6B2E',

  gradientBrand: ['#FF6B2E', '#BF5AF2'] as const,
  gradientDownload: ['#FF6B2E', '#BF5AF2'] as const,
  gradientEarnings: ['#EA580C', '#EAB308'] as const,

  errorBgSubtle: 'rgba(239,68,68,0.08)',
  accentBgSubtle: 'rgba(255,107,46,0.06)',
  transparent: 'transparent',
  white: '#FFFFFF',
} as const;

export type ColorTokens = typeof darkColors;

/** Default export is dark mode (the app default). */
export const colors = darkColors;
