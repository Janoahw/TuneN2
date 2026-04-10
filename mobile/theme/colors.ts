/**
 * TuneN2 Color Tokens
 * Source of truth: tuneN2.pen design file
 *
 * Dark-mode-first. All screens should reference these tokens
 * instead of hardcoding hex values.
 */

export const darkColors = {
  // Backgrounds (pen: --background, --surface, --surface-elevated, --card, --player-bg)
  bgPrimary: '#0D0D0F',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  bgElevated: '#2C2C2E',
  bgCard: '#161622',
  bgPlayer: '#1C1C28',

  // Text (pen: --foreground, --muted-foreground)
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // Accents (pen: --primary, --accent)
  accentPrimary: '#FF6B2E',
  accentSecondary: '#BF5AF2',
  accentTertiary: '#06B6D4',

  // Status (pen: --success, --warning, --error)
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',

  // Earnings / money (pen: --gold)
  gold: '#FF9F0A',

  // Borders (pen: --border)
  borderDefault: '#2C2C3A',
  borderFocus: '#FF6B2E',

  // Tab bar
  tabInactive: '#5A5A6E',

  // Gradients (start, end) — 135° in pen
  gradientBrand: ['#FF6B2E', '#BF5AF2'] as const,
  gradientDownload: ['#FF6B2E', '#BF5AF2'] as const,
  gradientEarnings: ['#FF6B2E', '#BF5AF2'] as const,

  // Subtle status backgrounds (from screen evidence)
  successBgSubtle: '#1A3A1A',
  warningBgSubtle: '#3A2A1A',
  errorBgSubtle: '#3A1A1A',
  accentBgSubtle: 'rgba(255,107,46,0.08)',
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
  bgTertiary: '#F4F4F5',
  bgElevated: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgPlayer: '#F0F0F5',

  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',

  accentPrimary: '#FF6B2E',
  accentSecondary: '#BF5AF2',
  accentTertiary: '#06B6D4',

  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',

  gold: '#FF9F0A',

  borderDefault: '#E4E4E7',
  borderFocus: '#FF6B2E',

  tabInactive: '#8E8E93',

  gradientBrand: ['#FF6B2E', '#BF5AF2'] as const,
  gradientDownload: ['#FF6B2E', '#BF5AF2'] as const,
  gradientEarnings: ['#FF6B2E', '#BF5AF2'] as const,

  successBgSubtle: 'rgba(48,209,88,0.1)',
  warningBgSubtle: 'rgba(255,214,10,0.1)',
  errorBgSubtle: 'rgba(255,69,58,0.08)',
  accentBgSubtle: 'rgba(255,107,46,0.06)',
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
