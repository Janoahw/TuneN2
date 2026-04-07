/**
 * TuneN2 Color Tokens
 * Source of truth: docs/design_system.md § 2 – Color System
 *
 * Dark-mode-first. All screens should reference these tokens
 * instead of hardcoding hex values.
 */

export const darkColors = {
  // Backgrounds
  bgPrimary: '#0D0D0F',
  bgSecondary: '#1A1A1F',
  bgTertiary: '#252530',
  bgElevated: '#2E2E3A',

  // Text
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textTertiary: '#6B6B76',

  // Accents
  accentPrimary: '#8B5CF6',
  accentSecondary: '#F97316',
  accentTertiary: '#06B6D4',

  // Status
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',

  // Borders
  borderDefault: '#2E2E3A',
  borderFocus: '#8B5CF6',

  // Gradients (start, end)
  gradientDownload: ['#8B5CF6', '#06B6D4'] as const,
  gradientEarnings: ['#F97316', '#EAB308'] as const,

  // Overlay / transparency helpers
  errorBgSubtle: 'rgba(239,68,68,0.1)',
  accentBgSubtle: 'rgba(139,92,246,0.08)',
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

  accentPrimary: '#7C3AED',
  accentSecondary: '#EA580C',
  accentTertiary: '#06B6D4',

  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',

  borderDefault: '#E4E4E7',
  borderFocus: '#7C3AED',

  gradientDownload: ['#7C3AED', '#06B6D4'] as const,
  gradientEarnings: ['#EA580C', '#EAB308'] as const,

  errorBgSubtle: 'rgba(239,68,68,0.08)',
  accentBgSubtle: 'rgba(124,58,237,0.06)',
  transparent: 'transparent',
  white: '#FFFFFF',
} as const;

export type ColorTokens = typeof darkColors;

/** Default export is dark mode (the app default). */
export const colors = darkColors;
