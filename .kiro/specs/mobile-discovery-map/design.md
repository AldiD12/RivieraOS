# Mobile Discovery Map - Design Specification

## 1. Tech Stack & Directory Structure

### Core Technologies
```json
{
  "framework": "Expo ~52.0.0 with TypeScript",
  "routing": "Expo Router (file-based)",
  "styling": "NativeWind v4.0.0",
  "animation": "react-native-reanimated ~3.0.0",
  "gestures": "react-native-gesture-handler ~2.0.0",
  "state": "zustand (minimal - only for non-animated state)",
  "effects": "expo-blur, expo-linear-gradient",
  "haptics": "expo-haptics"
}
```

### Performance Philosophy: The 10k Standard
**Zero React Re-renders During Animation**
- All theme transitions use Reanimated SharedValues
- Styles interpolate on UI thread (60fps guaranteed)
- React Context only passes SharedValue references, not values
- `useAnimatedStyle` for all animated components

### Directory Structure
```
riviera-mobile/
├── app/
│   ├── _layout.tsx              # Font loading, Vignette, Haptics warm-up
│   ├── index.tsx                # Discovery map screen
│   └── (tabs)/                  # Future: tab navigation
├── components/
│   ├── core/
│   │   ├── HardwareGlass.tsx    # 4-layer glass morphism (Shadow→Gradient→Blur→Content)
│   │   ├── HapticTouchable.tsx  # Pressable with haptics + scale animation
│   │   └── NeonText.tsx         # Theme-interpolated text with glow
│   ├── map/
│   │   ├── MapPins.tsx          # Pin rendering system
│   │   ├── DayTicker.tsx        # Monospace numbers (setNativeProps)
│   │   └── NightPulse.tsx       # Infinite breathing animation
│   ├── overlay/
│   │   ├── Vignette.tsx         # SVG radial gradient (pointerEvents: none)
│   │   └── GlitchEffect.tsx     # Post-processing chromatic aberration
│   └── venue/
│       ├── SpringSheet.tsx      # Bottom sheet with heavy spring physics
│       └── VenueCard.tsx        # Venue detail content
├── context/
│   └── ThemeContext.tsx         # Provides SharedValue references (not values!)
├── hooks/
│   ├── useRivieraPhysics.ts     # Centralized spring/timing configs
│   ├── useDeviceTime.ts         # 19:00 auto-switch logic
│   └── useAnimatedTheme.ts      # Hook to access themeProgress SharedValue
├── constants/
│   ├── physics.ts               # Spring configs (Heavy, Snappy, Cinematic)
│   └── colors.ts                # Day/Night color definitions
├── services/
│   └── api.ts                   # BlackBear-Services integration
├── assets/
│   ├── fonts/
│   │   ├── InterTight-Medium.ttf
│   │   ├── InterTight-Mono.ttf  # For DataTicker (tabular nums)
│   │   └── PlayfairDisplay-Bold.ttf
│   └── vignette_overlay.svg
└── types/
    └── venue.ts                 # Venue data types
```

---

## 2. The Physics Engine (Global Constants)

### constants/physics.ts

**The Laws of Motion** - All animations follow these profiles:

```typescript
import { Easing, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

// Spring Configurations
export const SPRING_PHYSICS = {
  // For large panels (Venue Card) - feels like heavy steel door
  HEAVY: {
    damping: 20,
    stiffness: 90,
    mass: 1,
    overshootClamping: false
  } as WithSpringConfig,
  
  // For buttons and toggles - instant feedback
  SNAPPY: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
    overshootClamping: false
  } as WithSpringConfig,
  
  // For subtle movements
  SOFT: {
    damping: 25,
    stiffness: 120,
    mass: 1,
    overshootClamping: false
  } as WithSpringConfig
};

// Timing Configurations
export const TIMING_PHYSICS = {
  // For opacity fades and screen transitions
  CINEMATIC: {
    duration: 500,
    easing: Easing.bezier(0.25, 1, 0.5, 1)
  } as WithTimingConfig,
  
  // For quick state changes
  FAST: {
    duration: 200,
    easing: Easing.out(Easing.ease)
  } as WithTimingConfig,
  
  // For glitch effect
  GLITCH: {
    duration: 300,
    easing: Easing.linear
  } as WithTimingConfig
};

// Glitch Effect Parameters
export const GLITCH_CONFIG = {
  DURATION: 300,           // Total glitch duration (ms)
  SHAKE_COUNT: 10,         // Number of shake iterations
  MAX_OFFSET: 4,           // Maximum X/Y displacement (px)
  RGB_OFFSET: 2            // Chromatic aberration offset (px)
};

// Haptic Feedback Timing
export const HAPTIC_CONFIG = {
  DEBOUNCE_MS: 50,         // Minimum time between haptics
  PRESS_DELAY: 0           // Immediate feedback
};
```

---

## 3. Core Component Architecture

### 3.1 HardwareGlass Component

**Purpose**: The fundamental container with physical depth and glass morphism.

**Performance Critical**: 
- Single BlurView per instance (no nesting)
- Uses `shouldRasterizeIOS` for static panels
- 4-layer structure optimized for GPU

**Props Interface**:
```typescript
interface HardwareGlassProps {
  intensity?: number;              // Blur intensity (default: 40)
  children: React.ReactNode;
  className?: string;              // NativeWind classes
  onPress?: () => void;            // Optional pressable
  static?: boolean;                // Enable rasterization for static content
}
```

**4-Layer Architecture**:
```typescript
// components/core/HardwareGlass.tsx
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const HardwareGlass = ({ 
  intensity = 40, 
  children, 
  static: isStatic = false 
}: HardwareGlassProps) => {
  return (
    // Layer 1: Shadow (creates depth behind glass)
    <View style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20
    }}>
      {/* Layer 2: LinearGradient (simulates light hitting edge) */}
      <LinearGradient
        colors={['rgba(161,161,170,0.6)', 'rgba(39,39,42,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 1 }}  // 1px "border"
      >
        {/* Layer 3: BlurView (the glass effect) */}
        <BlurView 
          intensity={intensity} 
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"  // Performance optimization
          shouldRasterizeIOS={isStatic}
        >
          {/* Layer 4: Content Container (dark backing) */}
          <View style={{ backgroundColor: 'rgba(9,9,11,0.6)' }}>
            {children}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};
```

**Performance Notes**:
- Limit to 3 HardwareGlass components on screen simultaneously
- Use `static={true}` for panels that don't animate
- Avoid nesting HardwareGlass inside HardwareGlass

---

### 3.2 AnimatedThemeWrapper (The Zero-Render Engine)

**Purpose**: Provide theme state via SharedValue to avoid React re-renders.

**Critical Concept**: 
- Traditional Context causes entire tree to re-render on state change
- We pass SharedValue *references*, not values
- Components use `useAnimatedStyle` to subscribe on UI thread

**Implementation**:
```typescript
// context/ThemeContext.tsx
import { createContext, useContext, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { TIMING_PHYSICS } from '../constants/physics';

interface ThemeContextValue {
  themeProgress: SharedValue<number>;  // 0 = Day, 1 = Night
  toggleTheme: () => void;
  currentMode: 'day' | 'night';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<'day' | 'night'>('day');
  const themeProgress = useSharedValue(0);

  const toggleTheme = () => {
    'worklet';
    const newMode = currentMode === 'day' ? 'night' : 'day';
    
    // Animate SharedValue (runs on UI thread)
    themeProgress.value = withTiming(
      newMode === 'day' ? 0 : 1,
      TIMING_PHYSICS.CINEMATIC
    );
    
    // Update React state (minimal re-render)
    setCurrentMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ themeProgress, toggleTheme, currentMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to access theme
export const useAnimatedTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAnimatedTheme must be used within ThemeProvider');
  return context;
};
```

**Usage in Components**:
```typescript
// Component subscribes to SharedValue on UI thread
const MyComponent = () => {
  const { themeProgress } = useAnimatedTheme();
  
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#18181b', '#09090b']
    );
    return { backgroundColor };
  });
  
  return <Animated.View style={animatedStyle} />;
};
```

**Result**: Theme switch triggers ZERO React re-renders. All style changes happen on native UI thread at 60fps.

---

### 3.3 HapticTouchable Component

**Purpose**: Universal pressable with physical weight and haptic feedback.

**Behavior**:
- `onPressIn`: Light haptic + scale to 0.98
- `onPressOut`: Medium haptic + spring back to 1.0

**Props Interface**:
```typescript
interface HapticTouchableProps {
  onPress: () => void;
  children: React.ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  className?: string;
}
```

**Implementation**:
```typescript
// components/core/HapticTouchable.tsx
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { SPRING_PHYSICS } from '../../constants/physics';

export const HapticTouchable = ({ 
  onPress, 
  children, 
  hapticStyle = 'light',
  disabled = false 
}: HapticTouchableProps) => {
  const scale = useSharedValue(1);
  let lastHapticTime = 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const triggerHaptic = (style: 'light' | 'medium') => {
    const now = Date.now();
    if (now - lastHapticTime < 50) return;  // Debounce
    
    lastHapticTime = now;
    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium
    };
    Haptics.impactAsync(hapticMap[style]);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, SPRING_PHYSICS.SNAPPY);
    triggerHaptic('light');
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, SPRING_PHYSICS.SNAPPY);
    triggerHaptic('medium');
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
```

---

### 3.4 NeonText Component

**Purpose**: Text that interpolates color and glow based on theme.

**Implementation**:
```typescript
// components/core/NeonText.tsx
import Animated, { useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import { useAnimatedTheme } from '../../context/ThemeContext';
import { DAY_COLORS, NIGHT_COLORS } from '../../constants/colors';

interface NeonTextProps {
  children: string;
  variant?: 'heading' | 'body' | 'ticker';
  className?: string;
}

export const NeonText = ({ children, variant = 'body' }: NeonTextProps) => {
  const { themeProgress } = useAnimatedTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      themeProgress.value,
      [0, 1],
      [DAY_COLORS.text, NIGHT_COLORS.text]
    );
    
    const shadowOpacity = themeProgress.value * 0.8;

    return {
      color,
      textShadowColor: NIGHT_COLORS.text,
      textShadowRadius: 10,
      textShadowOffset: { width: 0, height: 0 },
      // Note: textShadowOpacity not supported, use conditional rendering if needed
    };
  });

  const fontFamily = themeProgress.value > 0.5 
    ? 'PlayfairDisplay-Bold' 
    : 'InterTight-Medium';

  return (
    <Animated.Text style={[animatedStyle, { fontFamily }]}>
      {children}
    </Animated.Text>
  );
};
```

---

## 4. The "Cinderella Switch" System (Post-Processing Glitch)

### 4.1 GlitchEffect Component

**Purpose**: Absolute overlay that creates chromatic aberration during theme switch.

**Concept**: 
- Normally invisible (`opacity: 0`, `pointerEvents: 'none'`)
- Wakes up when `themeProgress` changes
- Simulates RGB displacement with rapid jitter

**Implementation**:
```typescript
// components/overlay/GlitchEffect.tsx
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import { useAnimatedTheme } from '../../context/ThemeContext';
import { GLITCH_CONFIG, TIMING_PHYSICS } from '../../constants/physics';

export const GlitchEffect = () => {
  const { themeProgress } = useAnimatedTheme();
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Trigger glitch when theme changes
  useEffect(() => {
    const unsubscribe = themeProgress.addListener((value) => {
      if (value > 0 && value < 1) {
        triggerGlitch();
      }
    });
    return unsubscribe;
  }, []);

  const triggerGlitch = () => {
    'worklet';
    
    // Show overlay
    opacity.value = withTiming(1, { duration: 50 });
    
    // Rapid jitter sequence
    for (let i = 0; i < GLITCH_CONFIG.SHAKE_COUNT; i++) {
      const randomX = (Math.random() - 0.5) * GLITCH_CONFIG.MAX_OFFSET;
      const randomY = (Math.random() - 0.5) * GLITCH_CONFIG.MAX_OFFSET;
      
      setTimeout(() => {
        glitchX.value = randomX;
        glitchY.value = randomY;
      }, i * (GLITCH_CONFIG.DURATION / GLITCH_CONFIG.SHAKE_COUNT));
    }
    
    // Reset and hide
    setTimeout(() => {
      glitchX.value = withTiming(0, { duration: 50 });
      glitchY.value = withTiming(0, { duration: 50 });
      opacity.value = withTiming(0, { duration: 50 });
    }, GLITCH_CONFIG.DURATION);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: glitchX.value },
      { translateY: glitchY.value }
    ]
  }));

  return (
    <Animated.View 
      style={[
        StyleSheet.absoluteFill,
        animatedStyle,
        { pointerEvents: 'none' }
      ]}
    >
      {/* Chromatic aberration simulation */}
      <View style={[StyleSheet.absoluteFill, { 
        backgroundColor: 'rgba(255,0,0,0.1)',
        transform: [{ translateX: -GLITCH_CONFIG.RGB_OFFSET }]
      }]} />
      <View style={[StyleSheet.absoluteFill, { 
        backgroundColor: 'rgba(0,255,0,0.1)',
        transform: [{ translateX: GLITCH_CONFIG.RGB_OFFSET }]
      }]} />
      <View style={[StyleSheet.absoluteFill, { 
        backgroundColor: 'rgba(0,0,255,0.1)',
        transform: [{ translateY: GLITCH_CONFIG.RGB_OFFSET }]
      }]} />
    </Animated.View>
  );
};
```

**Performance**: Runs entirely on UI thread. Zero React re-renders during animation.

---

## 5. Data Visualization (The Map)

### 5.1 DayTicker Component (Spy Tech)

**Purpose**: Rapidly updating monospace numbers without React reconciliation.

**Performance Critical**:
- Uses `setNativeProps` to bypass React
- Tabular nums font for consistent width
- Updates every 100ms without re-render

**Implementation**:
```typescript
// components/map/DayTicker.tsx
import { useRef, useEffect } from 'react';
import { Text, View, findNodeHandle } from 'react-native';
import { TextInput } from 'react-native';

interface DayTickerProps {
  label: string;
  min?: number;
  max?: number;
}

export const DayTicker = ({ label, min = 0, max = 999 }: DayTickerProps) => {
  const textRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      const formatted = value.toString().padStart(3, '0');
      
      // Update native props directly (no React re-render)
      if (textRef.current) {
        textRef.current.setNativeProps({
          text: formatted
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [min, max]);

  return (
    <View className="flex-row items-center gap-2 mb-2">
      <Text className="text-zinc-500 text-xs tracking-widest uppercase">
        {label}
      </Text>
      <TextInput
        ref={textRef}
        editable={false}
        className="font-mono text-zinc-400 text-sm"
        style={{ fontVariant: ['tabular-nums'] }}
      />
    </View>
  );
};
```

**Alternative (Reanimated TextInput)**:
```typescript
// For even better performance
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const DayTickerReanimated = ({ label }: DayTickerProps) => {
  const value = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      value.value = Math.floor(Math.random() * 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    text: value.value.toString().padStart(3, '0')
  }));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      className="font-mono text-zinc-400 text-sm"
    />
  );
};
```

---

### 5.2 NightPulse Component (The Neon)

**Purpose**: Infinite breathing animation for Night Mode pins.

**Performance Critical**:
- Uses `withRepeat(-1)` for infinite loop on UI thread
- Zero CPU usage after initial setup
- No React re-renders

**Implementation**:
```typescript
// components/map/NightPulse.tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface NightPulseProps {
  color: string;
  size?: number;
}

export const NightPulse = ({ color, size = 40 }: NightPulseProps) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Infinite breathing loop (runs on UI thread forever)
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,  // Infinite
      true // Reverse (breathe in/out)
    );

    scale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowRadius: 20,
          shadowOpacity: 0.8
        }
      ]} 
    />
  );
};
```

**Usage**:
```typescript
// Night Mode pin
<NightPulse color="#06B6D4" size={30} />
```

---

## 6. Map & Venue Logic

### 6.1 MapOverlay Component

**Purpose**: Layer system for pins and data tickers over the map.

**Layer Structure**:
```typescript
<View style={StyleSheet.absoluteFill} pointerEvents="box-none">
  {/* Layer 1: Data Tickers (Day Mode) */}
  {currentMode === 'day' && (
    <View className="absolute top-20 left-4">
      <DayTicker label="ACTIVE" min={10} max={50} />
      <DayTicker label="CAPACITY" min={200} max={500} />
      <DayTicker label="DISTANCE" min={100} max={2000} />
    </View>
  )}

  {/* Layer 2: Venue Pins */}
  {venues.map((venue) => (
    currentMode === 'day' 
      ? <VenuePin key={venue.id} venue={venue} onPress={handleVenuePress} />
      : <NeonPin key={venue.id} venue={venue} onPress={handleVenuePress} />
  ))}
</View>
```

---

### 6.2 VenuePin & NeonPin Components

**Day Mode (VenuePin)**:
```typescript
// Simple marker with status indicator
export const VenuePin = ({ venue, onPress }: VenuePinProps) => (
  <HapticTouchable onPress={() => onPress(venue)}>
    <View className="items-center">
      <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
        <Text className="text-xl">{venue.icon}</Text>
      </View>
      <View className={`w-2 h-2 rounded-full ${getStatusColor(venue.status)}`} />
    </View>
  </HapticTouchable>
);
```

**Night Mode (NeonPin)**:
```typescript
// Pulsing neon marker
export const NeonPin = ({ venue, onPress }: VenuePinProps) => {
  const color = venue.type === 'restaurant' ? '#06B6D4' : '#D946EF';
  
  return (
    <HapticTouchable onPress={() => onPress(venue)}>
      <View className="items-center">
        <NightPulse color={color} size={30} />
        <Text className="text-xs text-cyan-400 mt-1 font-bold">
          {venue.name}
        </Text>
      </View>
    </HapticTouchable>
  );
};
```

---

### 6.3 SpringSheet Component (Heavy Physics)

**Purpose**: Bottom sheet with realistic spring physics for venue details.

**Gesture Handler Setup**:
```typescript
// components/venue/SpringSheet.tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { SPRING_PHYSICS } from '../../constants/physics';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

export const SpringSheet = ({ venue, onDismiss }: SpringSheetProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      
      if (velocity > 500 || translateY.value > SHEET_HEIGHT / 2) {
        // Dismiss with heavy spring
        translateY.value = withSpring(
          SCREEN_HEIGHT, 
          SPRING_PHYSICS.HEAVY,
          () => runOnJS(onDismiss)()
        );
      } else {
        // Snap back with heavy spring
        translateY.value = withSpring(0, SPRING_PHYSICS.HEAVY);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [0.6, 0]
    )
  }));

  // Open with overshoot
  const openSheet = () => {
    translateY.value = withSequence(
      withSpring(-20, { damping: 10, stiffness: 100 }),  // Overshoot
      withSpring(0, SPRING_PHYSICS.HEAVY)                // Settle
    );
  };

  useEffect(() => {
    openSheet();
  }, []);

  return (
    <>
      {/* Backdrop */}
      <Animated.View 
        style={[StyleSheet.absoluteFill, backdropStyle, { backgroundColor: '#000' }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            sheetStyle,
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: SHEET_HEIGHT,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32
            }
          ]}
        >
          <HardwareGlass intensity={40}>
            <VenueCard venue={venue} />
          </HardwareGlass>
        </Animated.View>
      </GestureDetector>
    </>
  );
};
```

**Physics Feel**:
- Damping: 20 (heavy, controlled)
- Stiffness: 90 (slow, premium)
- Mass: 1 (substantial weight)
- Result: Feels like sliding a heavy steel door

---

## 7. Asset Strategy

### 5.1 Font Loading

**app/_layout.tsx**:
```typescript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'InterTight-Medium': require('../assets/fonts/InterTight-Medium.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Slot />;
}
```

---

### 5.2 Vignette Overlay

**ScreenBackground Component**:
```typescript
import VignetteOverlay from '../assets/vignette_overlay.svg';

export const ScreenBackground = ({ children }) => (
  <View className="flex-1 bg-[#09090b]">
    {children}
    <View 
      style={StyleSheet.absoluteFill} 
      pointerEvents="none"
    >
      <VignetteOverlay width="100%" height="100%" />
    </View>
  </View>
);
```

**SVG Structure** (vignette_overlay.svg):
```xml
<svg viewBox="0 0 375 812" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#18181b" stop-opacity="0" />
      <stop offset="100%" stop-color="#09090b" stop-opacity="1" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#vignette)" />
</svg>
```

---

## 6. API Integration

### 6.1 Venue Service

**Endpoint**: `GET /api/discovery/venues`

**Response Type**:
```typescript
interface Venue {
  id: string;
  name: string;
  type: 'restaurant' | 'beach' | 'bar' | 'hotel';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: 'open' | 'busy' | 'closed';
  capacity: {
    current: number;
    max: number;
  };
  distance: number;  // meters from user
  rating: number;
  imageUrl: string;
}
```

**API Client**:
```typescript
// services/api.ts
import axios from 'axios';

const API_BASE = 'https://your-backend.com/api';

export const venueApi = {
  getVenues: async (): Promise<Venue[]> => {
    const { data } = await axios.get(`${API_BASE}/discovery/venues`);
    return data;
  },
  
  getVenueDetails: async (id: string): Promise<VenueDetails> => {
    const { data } = await axios.get(`${API_BASE}/discovery/venues/${id}`);
    return data;
  }
};
```

---

## 7. Performance Optimization

### 7.1 Animation Performance
- Use `useAnimatedStyle` for all animated styles (runs on UI thread)
- Avoid `useState` for animation values (causes re-renders)
- Use `runOnJS` sparingly (bridge crossing is expensive)

### 7.2 Rendering Optimization
```typescript
// Memoize expensive components
const VenuePin = memo(({ venue }) => {
  // ...
}, (prev, next) => prev.venue.id === next.venue.id);

// Virtualize long lists
import { FlashList } from '@shopify/flash-list';
```

### 7.3 Blur Performance
- Limit concurrent BlurViews to 3
- Use `shouldRasterizeIOS` for static blurs
- Consider pre-rendered blur images for complex layouts

---

## 8. Testing Strategy

### 8.1 Component Tests
- HardwareGlass: Verify blur intensity, gradient colors
- TactilePressable: Mock haptics, test scale animation
- SpringSheet: Test gesture thresholds, spring physics

### 8.2 Animation Tests
- Glitch effect: Verify shake completes in 300ms
- Theme transition: Verify color interpolation over 500ms
- Pin pulse: Verify infinite loop animation

### 8.3 Performance Tests
- FPS monitoring during mode switch (target: 60fps)
- Memory usage during normal operation (target: <150MB)
- Gesture response time (target: <16ms)

---

## 9. Accessibility

### 9.1 Haptic Feedback
- Respect system haptic settings
- Provide visual feedback alternative
- Allow users to disable haptics in app settings

### 9.2 Color Contrast
- Day mode: WCAG AA compliant
- Night mode: Ensure neon text is readable

### 9.3 Screen Reader Support
- Label all interactive elements
- Announce mode changes
- Provide venue details via accessibility hints

---

## 10. Future Enhancements

### Phase 2
- Real-time venue updates via SignalR
- User location tracking
- Venue filtering by type/distance
- Favorites system

### Phase 3
- AR mode for venue discovery
- Social features (check-ins, reviews)
- Booking integration
- Multi-language support

---

## Correctness Properties

### Property 1: Animation Frame Rate
**Validates: Requirements 1.5, 8.1, 8.2**

For all animations (glitch, theme transition, spring sheet):
- Frame rate must maintain ≥58fps on mid-range devices
- No dropped frames during gesture interactions
- Transition durations must match specifications (±10ms tolerance)

**Test Strategy**: Use `react-native-performance` to monitor FPS during:
- Mode switch with glitch animation
- Bottom sheet drag and release
- Pin pulse animations (10+ pins on screen)

---

### Property 2: Haptic Feedback Consistency
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

For all interactive elements:
- Haptic feedback fires within 16ms of touch event
- Correct haptic style applied (Light for buttons, Medium for sheets)
- No duplicate haptics within 50ms window
- Graceful degradation when haptics unavailable

**Test Strategy**: Mock `expo-haptics` and verify:
- `impactAsync` called exactly once per press
- Correct `ImpactFeedbackStyle` parameter
- No calls when system haptics disabled

---

### Property 3: Spring Physics Accuracy
**Validates: Requirements 6.4, 6.5, 6.6**

For SpringSheet component:
- Damping = 15, Stiffness = 120 (±5% tolerance)
- High velocity (>500) always dismisses
- Low velocity always snaps back
- Overshoot occurs on open (translateY goes negative briefly)

**Test Strategy**: Simulate gesture events with known velocities:
- velocity = 600 → sheet dismisses
- velocity = 300 → sheet snaps back
- Measure overshoot distance (should be 10-30px)

---

### Property 4: Theme Interpolation Smoothness
**Validates: Requirements 5.3, 5.4, 5.6**

For theme transitions:
- Color interpolation completes in 500ms (±50ms)
- No sudden color jumps (smooth gradient)
- Font family switches at 50% progress point
- All text elements update simultaneously

**Test Strategy**: Sample color values at 100ms intervals:
- t=0ms: Day colors
- t=250ms: Mid-transition colors
- t=500ms: Night colors
- Verify smooth interpolation curve

---

### Property 5: Glass Morphism Layering
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

For HardwareGlass component:
- LinearGradient wraps BlurView (correct layer order)
- Border width = 1px (±0.5px tolerance)
- Blur intensity = 30 (default)
- Inner content opacity = 0.7

**Test Strategy**: Render component and verify:
- Component tree structure matches specification
- Style properties match expected values
- Visual regression test against reference image

---

## Color Definitions

```typescript
// utils/colors.ts
export const DAY_COLORS = {
  background: '#09090b',
  backgroundLight: '#18181b',
  text: '#71717A',
  textMuted: '#52525B',
  accent: '#A1A1AA',
  border: 'rgba(161,161,170,0.6)'
};

export const NIGHT_COLORS = {
  background: '#09090b',
  backgroundLight: '#18181b',
  text: '#06B6D4',        // Cyan
  textMuted: '#22D3EE',
  accent: '#D946EF',      // Fuchsia
  border: 'rgba(6,182,212,0.6)'
};
```

---

## Animation Configs

```typescript
// utils/animations.ts
export const SPRING_CONFIGS = {
  heavy: { damping: 15, stiffness: 120 },
  medium: { damping: 20, stiffness: 200 },
  light: { damping: 25, stiffness: 300 },
  bouncy: { damping: 10, stiffness: 100 }
};

export const TIMING_CONFIGS = {
  fast: { duration: 200, easing: Easing.out(Easing.ease) },
  normal: { duration: 500, easing: Easing.inOut(Easing.ease) },
  slow: { duration: 800, easing: Easing.inOut(Easing.cubic) }
};

export const GLITCH_CONFIG = {
  duration: 300,
  shakeCount: 10,
  maxOffset: 2
};
```

---

## Implementation Priority

### Phase 1 (Core Foundation)
1. Project setup with Expo + TypeScript + NativeWind
2. Font loading system
3. ScreenBackground with vignette
4. HardwareGlass component
5. TactilePressable with haptics

### Phase 2 (Theme System)
6. Zustand theme store
7. useRivieraTheme hook
8. GlitchContainer animation
9. NeonText component
10. Mode toggle UI

### Phase 3 (Map & Pins)
11. MapOverlay structure
12. VenuePin component (Day mode)
13. NeonPin component (Night mode)
14. DataTicker component
15. API integration

### Phase 4 (Venue Details)
16. SpringSheet component
17. Gesture handler setup
18. VenueCard content
19. Background dim effect
20. Polish & testing
