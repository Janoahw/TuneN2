/**
 * TuneN2 Color Tokens
 * Source of truth: tuneN2.pen design file variables
 *
 * Dark-mode-first. All screens should reference these tokens
 * instead of hardcoding hex values.
 */

export const darkColors = {
  // Backgrounds (pen: --background, --surface, --surface-elevated, --card)
  bgPrimary: '#0A0A0F',
  bgSecondary: '#121218',
  bgTertiary: '#1A1A24',
  bgElevated: '#1A1A24',
  bgCard: '#161622',
  bgPlayer: '#1C1C28',

  // Text (pen: --foreground, --muted-foreground)
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#5A5A6E',

  // Accents (pen: --primary, --accent)
  accentPrimary: '#6C5CE7',
  accentSecondary: '#FF6B6B',
  accentTertiary: '#06B6D4',

  // Status (pen: --success, --error, --warning, --gold)
  success: '#34C759',
  warning: '#FFD60A',
  error: '#FF3B30',
  gold: '#D4A843',

  // Borders (pen: --border)
  borderDefault: '#2C2C3A',
  borderFocus: '#6C5CE7',

  // Tab bar (pen: --tab-inactive)
  tabInactive: '#5A5A6E',

  // Gradients (pen: --primary → --accent)
  gradientBrand: ['#6C5CE7', '#FF6B6B'] as const,
  gradientDownload: ['#6C5CE7', '#FF6B6B'] as const,
  gradientEarnings: ['#F97316', '#EAB308'] as const,

  // Overlay / transparency helpers
  errorBgSubtle: 'rgba(255,59,48,0.1)',
  accentBgSubtle: 'rgba(108,92,231,0.08)',
  transparent: 'transparent',
  white: '#FFFFFF',

  // Foreground on colored backgrounds (pen: --primary-foreground, --accent-foreground)
  onPrimary: '#FFFFFF',
  onAccent: '#FFFFFF',
  onError: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onWarning: '#0A0A0F',
} as const;

export const lightColors = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F5F5F7',
  bgElevated: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgPlayer: '#F0F0F5',

  textPrimary: '#0A0A0F',
  textSecondary: '#6B6B70',
  textTertiary: '#8E8E93',

  accentPrimary: '#6C5CE7',
  accentSecondary: '#FF6B6B',
  accentTertiary: '#06B6D4',

  success: '#34C759',
  warning: '#FFD60A',
  error: '#FF3B30',
  gold: '#D4A843',

  borderDefault: '#E5E5EA',
  borderFocus: '#6C5CE7',

  tabInactive: '#8E8E93',

  gradientBrand: ['#6C5CE7', '#FF6B6B'] as const,
  gradientDownload: ['#6C5CE7', '#FF6B6B'] as const,
  gradientEarnings: ['#EA580C', '#EAB308'] as const,

  errorBgSubtle: 'rgba(255,59,48,0.08)',
  accentBgSubtle: 'rgba(108,92,231,0.06)',
  transparent: 'transparent',
  white: '#FFFFFF',

  onPrimary: '#FFFFFF',
  onAccent: '#FFFFFF',
  onError: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onWarning: '#0A0A0F',
} as const;

export type ColorTokens = typeof darkColors;

/** Default export is dark mode (the app default). */
export const colors = darkColors;
