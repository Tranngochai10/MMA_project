export const Colors = {
  primaryCoral: '#FF765F',
  primaryOrange: '#FF9D43',
  lightPeach: '#FFF0DF',
  peachAccent: '#FFE6CC',
  warmCream: '#FFF8F1',
  white: '#FFFFFF',
  primaryText: '#202020',
  secondaryText: '#888888',
  tertiaryText: '#B0AFAF',
  border: '#F0EFED',
  borderLight: '#F7F6F4',
  success: '#2E9D68',
  successLight: '#E8F6EF',
  error: '#DC4F4F',
  errorLight: '#FDECEC',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  disabled: '#F2F2F2',
  cardBg: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.45)',
  gradientPrimary: ['#FF765F', '#FF9D43'] as const,
  gradientPeach: ['#FFF0DF', '#FFE2CA'] as const,
  gradientSoft: ['#FFF8F1', '#FFFFFF'] as const,
  gradientDark: ['#202020', '#3D3D3D'] as const,
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
  card: 18,
  lg: 20,
  xl: 24,
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
    fontSize: 14,
    color: Colors.primaryText,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    color: Colors.secondaryText,
    lineHeight: 14,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
};

export const Shadows = {
  soft: {
    shadowColor: '#202020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: '#202020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  float: {
    shadowColor: '#FF765F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  tabBar: {
    shadowColor: '#202020',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
};
