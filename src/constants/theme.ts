export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  // Compatibility names used by existing screens; all resolve to the same design system.
  primaryCoral: '#2563EB',
  primaryOrange: '#1D4ED8',
  lightPeach: '#EFF6FF',
  peachAccent: '#DBEAFE',
  warmCream: '#F8FAFC',
  white: '#FFFFFF',
  primaryText: '#0F172A',
  secondaryText: '#64748B',
  tertiaryText: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#16A34A',
  successLight: '#F0FDF4',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  disabled: '#F1F5F9',
  cardBg: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.4)',
  gradientPrimary: ['#2563EB', '#2563EB'] as const,
  gradientPeach: ['#EFF6FF', '#EFF6FF'] as const,
  gradientSoft: ['#FFFFFF', '#FFFFFF'] as const,
  gradientDark: ['#0F172A', '#0F172A'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  card: 14,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primaryText,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.primaryText,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primaryText,
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primaryText,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    color: Colors.primaryText,
    lineHeight: 23,
  },
  bodySmall: {
    fontSize: 13,
    color: Colors.secondaryText,
    lineHeight: 19,
  },
  caption: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
};

export const Shadows = {
  soft: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.025, shadowRadius: 3, elevation: 1 },
  card: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 0 },
  float: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  tabBar: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.035, shadowRadius: 5, elevation: 2 },
};
