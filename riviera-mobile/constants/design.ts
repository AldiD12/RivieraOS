// Riviera OS Discovery - Premium Design System
// Inspired by Aman Resorts, Six Senses, Soho House + Modern Event Apps

export const COLORS = {
  // Day Mode - Quiet Luxury (Inspired by Aman Resorts)
  day: {
    background: '#FAFAF9', // Warm off-white
    backgroundGradient: ['#FAFAF9', '#F5F5F4'],
    surface: '#FFFFFF',
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    text: {
      primary: '#1C1917', // Near black
      secondary: '#57534E', // Warm gray
      muted: '#78716C',
    },
    accent: '#92400E', // Deep burnt amber
    accentHover: '#78350F',
    border: 'rgba(28, 25, 23, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.04)',
  },
  
  // Night Mode - Obsidian & Neon (Premium Nightlife)
  night: {
    background: '#050505', // Deep obsidian black
    backgroundGradient: ['#050505', '#0A0A0A', '#0F0F0F'],
    surface: 'rgba(255, 255, 255, 0.08)', // High-end glassmorphism
    surfaceElevated: 'rgba(255, 255, 255, 0.12)',
    glass: 'rgba(255, 255, 255, 0.08)',
    glassStrong: 'rgba(255, 255, 255, 0.15)',
    text: {
      primary: '#FFFFFF',
      secondary: '#E2E8F0',
      muted: '#94A3B8',
    },
    accent: '#8B5CF6', // Electric purple
    accentSecondary: '#06B6D4', // Neon cyan
    accentTertiary: '#F59E0B', // Amber accent
    neonPurple: '#8B5CF6',
    neonCyan: '#06B6D4',
    border: 'rgba(255, 255, 255, 0.12)',
    borderGlow: 'rgba(139, 92, 246, 0.6)', // Internal glow border
    shadow: 'rgba(0, 0, 0, 0.6)',
    glow: 'rgba(139, 92, 246, 0.4)',
    glowCyan: 'rgba(6, 182, 212, 0.4)',
  },
  
  // Status Colors (Sophisticated)
  status: {
    available: '#10B981', // Emerald
    busy: '#F59E0B', // Amber
    full: '#EF4444', // Red
    closed: '#6B7280', // Gray
  },
  
  // Event Type Colors (Night Mode)
  eventTypes: {
    'Live Music': '#8B5CF6', // Purple
    'DJ Set': '#06B6D4', // Cyan
    'Cocktail Lounge': '#F59E0B', // Amber
  }
};

export const TYPOGRAPHY = {
  fonts: {
    heading: 'SF Pro Display', // iOS system font for luxury feel
    body: 'SF Pro Text', // Clean sans-serif
    mono: 'SF Mono', // For numbers/time
  },
  
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
    '7xl': 48,
    '8xl': 64,
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
};

export const SHADOWS = {
  day: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    }
  },
  
  night: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 0,
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.6,
      shadowRadius: 40,
      elevation: 12,
    }
  }
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  full: 9999,
};

export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    luxury: 800, // For premium feel
    ultra: 1200, // For hero animations
  },
  
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    luxury: [0.25, 1, 0.5, 1], // Custom luxury easing
    bounce: [0.68, -0.55, 0.265, 1.55],
  }
};

// Premium Gradients
export const GRADIENTS = {
  day: {
    primary: ['#FAFAF9', '#F5F5F4'],
    surface: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
    accent: ['#92400E', '#78350F'],
  },
  night: {
    primary: ['#0A0A0F', '#1A1A2E', '#16213E'],
    surface: ['rgba(26, 26, 46, 0.95)', 'rgba(26, 26, 46, 0.8)'],
    accent: ['#8B5CF6', '#06B6D4'],
    premium: ['#1A1A2E', '#16213E', '#0F172A'],
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  }
};