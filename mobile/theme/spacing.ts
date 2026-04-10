/**
 * TuneN2 Spacing & Layout Tokens
 * Source of truth: docs/design_system.md § 4 – Spacing & Layout
 *
 * 4px base unit system.
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  none: 0,
  sm: 8, // pen: --radius-sm
  md: 12, // pen: --radius-md
  lg: 16, // pen: --radius-lg
  xl: 24,
  '2xl': 36,
  full: 9999, // pen: --radius-full
} as const;

export const layout = {
  screenMargin: 20,
  cardGridGap: 12,
  listRowMinHeight: 60,
  listRowSpacing: 12,
  tabBarHeight: 56,
  downloadBarHeight: 48,
  maxContentWidth: 428,
} as const;
