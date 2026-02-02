import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Riviera OS Design System Colors
const colors = {
  // Day Mode - Quiet Luxury
  day: {
    background: '#FCFBF9', // Light Champagne
    surface: '#FFFFFF',
    border: '#E5E5E5',
    text: {
      primary: '#18181B',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
  },
  // Night Mode - Neon Luxury
  night: {
    background: '#09090B', // Zinc 950
    surface: '#18181B',
    border: '#27272A',
    primary: '#13ECA4', // Neon Green
    magenta: '#FF00FF', // Neon Magenta
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      muted: '#9CA3AF',
    },
  },
};

// Icon System from Guide
const iconSystem = {
  day: [
    { name: 'Beach Club', icon: '🏖️', symbol: 'beach_access' },
    { name: 'Sunbed', icon: '🛏️', symbol: 'deck' },
    { name: 'Pool', icon: '🏊', symbol: 'pool' },
    { name: 'Techno', icon: '🎵', symbol: 'equalizer' },
  ],
  night: [
    { name: 'Beach Club', icon: '🏖️', symbol: 'beach_access', color: '#13ECA4' },
    { name: 'Sunbed', icon: '🛏️', symbol: 'deck', color: '#FF00FF' },
    { name: 'Pool', icon: '🏊', symbol: 'pool', color: '#13ECA4' },
    { name: 'Techno', icon: '🎵', symbol: 'equalizer', color: '#FF00FF' },
  ],
};

interface GuideBookProps {}

export const GuideBook: React.FC<GuideBookProps> = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Riviera OS</Text>
            <Text style={styles.headerSubtitle}>VISUAL SYSTEM V1.0</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>ASSETS.LIB</Text>
          </View>
        </View>
      </View>

      {/* Split Screen Content */}
      <View style={styles.splitContainer}>
        {/* Day Mode Column */}
        <ScrollView style={styles.dayColumn} showsVerticalScrollIndicator={false}>
          <View style={styles.columnContent}>
            {/* Day Mode Header */}
            <View style={styles.columnHeader}>
              <View style={styles.dayModeIcon} />
              <Text style={styles.dayModeLabel}>DAY MODE</Text>
            </View>

            {/* Day Iconography */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Iconography</Text>
                <Text style={styles.sectionSubtitle}>1.2px STROKE</Text>
              </View>
              <View style={styles.iconGrid}>
                {iconSystem.day.map((item, index) => (
                  <View key={index} style={styles.dayIconBox}>
                    <Text style={styles.dayIcon}>{item.icon}</Text>
                    <Text style={styles.dayIconLabel}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Day Components */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Components</Text>
                <Text style={styles.sectionSubtitle}>BTN-PRI</Text>
              </View>
              <View style={styles.dayComponentBox}>
                <TouchableOpacity style={styles.dayPrimaryButton}>
                  <Text style={styles.dayPrimaryButtonText}>Book Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.daySecondaryButton}>
                  <Text style={styles.daySecondaryButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Typography */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Typography</Text>
                <Text style={styles.sectionSubtitle}>INTER TIGHT</Text>
              </View>
              <View style={styles.typographyBox}>
                <Text style={styles.dayTypographyDisplay}>Aa</Text>
                <Text style={styles.dayTypographyLabel}>Display Bold 32px</Text>
                <Text style={styles.dayTypographyBody}>
                  The quick brown fox jumps over the lazy dog.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Night Mode Column */}
        <ScrollView style={styles.nightColumn} showsVerticalScrollIndicator={false}>
          <View style={styles.columnContent}>
            {/* Night Mode Header */}
            <View style={[styles.columnHeader, styles.nightColumnHeader]}>
              <Text style={styles.nightModeLabel}>NIGHT MODE</Text>
              <View style={styles.nightModeIcon} />
            </View>

            {/* Night Iconography */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.nightSectionTitle}>Iconography</Text>
                <Text style={styles.nightSectionSubtitle}>NEON GLOW</Text>
              </View>
              <View style={styles.iconGrid}>
                {iconSystem.night.map((item, index) => (
                  <View key={index} style={styles.nightIconBox}>
                    <LinearGradient
                      colors={[`${item.color}20`, 'transparent']}
                      style={styles.nightIconGradient}
                    />
                    <Text style={[styles.nightIcon, { color: item.color }]}>{item.icon}</Text>
                    <Text style={styles.nightIconLabel}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Night Components */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.nightSectionTitle}>Components</Text>
                <Text style={styles.nightSectionSubtitle}>BTN-ACTIVE</Text>
              </View>
              <View style={styles.nightComponentBox}>
                <TouchableOpacity style={styles.nightPrimaryButton}>
                  <LinearGradient
                    colors={[colors.night.primary, colors.night.primary]}
                    style={styles.nightPrimaryButtonGradient}
                  >
                    <Text style={styles.nightPrimaryButtonText}>Book Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nightSecondaryButton}>
                  <Text style={styles.nightSecondaryButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Night Typography */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.nightSectionTitle}>Typography</Text>
                <Text style={styles.nightSectionSubtitle}>JB MONO</Text>
              </View>
              <View style={styles.typographyBox}>
                <Text style={styles.nightTypographyDisplay}>Aa</Text>
                <Text style={styles.nightTypographyLabel}>Display Bold 32px</Text>
                <Text style={styles.nightTypographyBody}>
                  // system_status: active{'\n'}load_assets(night_mode);
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.background,
  },
  
  header: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: colors.night.border,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.night.text.primary,
    letterSpacing: -0.5,
  },
  
  headerSubtitle: {
    fontSize: 10,
    color: colors.night.text.muted,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  
  headerBadge: {
    backgroundColor: `${colors.night.primary}20`,
    borderWidth: 1,
    borderColor: `${colors.night.primary}40`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  headerBadgeText: {
    fontSize: 10,
    color: colors.night.primary,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  
  dayColumn: {
    flex: 1,
    backgroundColor: colors.day.background,
    borderRightWidth: 1,
    borderRightColor: colors.day.border,
  },
  
  nightColumn: {
    flex: 1,
    backgroundColor: colors.night.background,
  },
  
  columnContent: {
    padding: 12,
    gap: 32,
  },
  
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  
  nightColumnHeader: {
    justifyContent: 'flex-end',
  },
  
  dayModeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
  },
  
  nightModeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.night.primary,
    shadowColor: colors.night.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  
  dayModeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.day.text.muted,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  
  nightModeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.night.primary,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  
  section: {
    gap: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.day.border,
    paddingBottom: 4,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.day.text.primary,
  },
  
  nightSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.night.text.secondary,
  },
  
  sectionSubtitle: {
    fontSize: 8,
    color: colors.day.text.muted,
    fontFamily: 'monospace',
  },
  
  nightSectionSubtitle: {
    fontSize: 8,
    color: colors.night.primary,
    fontFamily: 'monospace',
  },
  
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  dayIconBox: {
    width: (width / 2 - 36) / 2,
    aspectRatio: 1,
    backgroundColor: colors.day.surface,
    borderWidth: 1,
    borderColor: colors.day.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  nightIconBox: {
    width: (width / 2 - 36) / 2,
    aspectRatio: 1,
    backgroundColor: colors.night.surface,
    borderWidth: 1,
    borderColor: colors.night.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  
  nightIconGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  dayIcon: {
    fontSize: 32,
    color: colors.day.text.primary,
  },
  
  nightIcon: {
    fontSize: 32,
    textShadowColor: 'rgba(19, 236, 164, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    zIndex: 10,
  },
  
  dayIconLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: colors.day.text.secondary,
  },
  
  nightIconLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: colors.night.text.muted,
    zIndex: 10,
  },
  
  dayComponentBox: {
    backgroundColor: colors.day.surface,
    borderWidth: 1,
    borderColor: colors.day.border,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  nightComponentBox: {
    backgroundColor: `${colors.night.surface}80`,
    borderWidth: 1,
    borderColor: colors.night.border,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  
  dayPrimaryButton: {
    backgroundColor: colors.day.text.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  dayPrimaryButtonText: {
    color: colors.day.surface,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  daySecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.day.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  daySecondaryButtonText: {
    color: colors.day.text.primary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  nightPrimaryButton: {
    borderRadius: 6,
    shadowColor: colors.night.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  
  nightPrimaryButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  nightPrimaryButtonText: {
    color: colors.night.background,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  nightSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.night.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  nightSecondaryButtonText: {
    color: colors.night.text.muted,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  typographyBox: {
    gap: 8,
  },
  
  dayTypographyDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.day.text.primary,
    letterSpacing: -1,
  },
  
  nightTypographyDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.night.text.primary,
    letterSpacing: -1,
  },
  
  dayTypographyLabel: {
    fontSize: 10,
    color: colors.day.text.secondary,
    fontFamily: 'monospace',
  },
  
  nightTypographyLabel: {
    fontSize: 10,
    color: colors.night.primary,
    fontFamily: 'monospace',
  },
  
  dayTypographyBody: {
    fontSize: 14,
    color: colors.day.text.secondary,
    lineHeight: 20,
  },
  
  nightTypographyBody: {
    fontSize: 14,
    color: colors.night.text.muted,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});

export default GuideBook;