import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mapbox, { MapView, Camera, PointAnnotation } from '@rnmapbox/maps';

// Set Mapbox access token
Mapbox.setAccessToken('sk.eyJ1IjoiYWxkaWQxNjAyIiwiYSI6ImNtbDQ4NHV3aDB5ZTQzZHNkZHpoYm96MnkifQ.BIK3YtfFBiLSZLRREwFNrg');

const { width, height } = Dimensions.get('window');

// Night Mode - Rave/Techno Color Palette
const nightColors = {
  background: '#09090B', // Deep obsidian black
  surface: '#18181B', // zinc-900
  glass: 'rgba(24, 24, 27, 0.6)',
  glassStrong: 'rgba(24, 24, 27, 0.8)',
  primary: '#13ECA4', // Neon green
  purple: '#A855F7', // Accent purple
  emerald: '#10B981', // Accent emerald
  text: {
    primary: '#FFFFFF',
    secondary: '#E4E4E7', // zinc-200
    muted: '#A1A1AA', // zinc-400
  },
  border: 'rgba(255, 255, 255, 0.1)',
  borderGlow: 'rgba(168, 85, 247, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.8)',
  glow: 'rgba(19, 236, 164, 0.3)',
  glowPurple: 'rgba(168, 85, 247, 0.4)',
};

interface RivieraDiscoveryScreenNightProps {
  onToggleMode: () => void;
}

export const RivieraDiscoveryScreenNight: React.FC<RivieraDiscoveryScreenNightProps> = ({ onToggleMode }) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('Techno');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'Techno', label: 'Techno', active: true },
    { id: 'House', label: 'House', active: false },
    { id: 'Trance', label: 'Trance', active: false },
    { id: 'Industrial', label: 'Industrial', active: false },
  ];

  const venues = [
    {
      id: '1',
      name: 'Techno Bunker',
      location: 'Underground Industrial Hall',
      status: 'Live',
      genre: 'Acid Techno',
      duration: 'Until 6AM',
      friendsCount: 42,
      friendsHere: ['Alex', 'Maria'],
      image: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?w=400&q=80',
      coordinates: { latitude: 43.2384, longitude: 6.6413 }, // Saint-Tropez area coordinates
    },
  ];

  // Mapbox coordinates for Saint-Tropez/Riviera area (night mode)
  const mapCenter = [6.6413, 43.2384]; // [longitude, latitude] format for Mapbox
  const zoomLevel = 12;

  return (
    <View style={[styles.container, { backgroundColor: nightColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapView}
          styleURL="mapbox://styles/mapbox/dark-v11"
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Camera
            centerCoordinate={mapCenter}
            zoomLevel={zoomLevel}
          />
          
          {/* Venue Markers */}
          {venues.map((venue) => (
            <PointAnnotation
              key={venue.id}
              id={venue.id}
              coordinate={[venue.coordinates.longitude, venue.coordinates.latitude]}
            >
              <View style={styles.mapMarker}>
                <View style={[styles.markerPin, {
                  backgroundColor: nightColors.purple,
                  shadowColor: nightColors.purple,
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 0 },
                }]}>
                  <View style={[styles.markerDot, { backgroundColor: nightColors.text.primary }]} />
                </View>
                <View style={styles.markerPulse}>
                  <View style={[styles.pulseRing, { backgroundColor: `${nightColors.purple}20` }]} />
                  <View style={[styles.pulseInner, { backgroundColor: `${nightColors.purple}40` }]} />
                </View>
              </View>
            </PointAnnotation>
          ))}
          
          {/* Additional Club Markers */}
          <PointAnnotation
            id="warehouse9"
            coordinate={[6.6380, 43.2350]}
          >
            <View style={styles.smallMapMarker}>
              <View style={[styles.smallMarkerPin, {
                backgroundColor: nightColors.primary,
                shadowColor: nightColors.primary,
                shadowOpacity: 0.6,
                shadowRadius: 10,
              }]} />
            </View>
          </PointAnnotation>
          
          <PointAnnotation
            id="neongarden"
            coordinate={[6.6450, 43.2400]}
          >
            <View style={styles.smallMapMarker}>
              <View style={[styles.smallMarkerPin, {
                backgroundColor: nightColors.emerald,
                shadowColor: nightColors.emerald,
                shadowOpacity: 0.6,
                shadowRadius: 10,
              }]} />
            </View>
          </PointAnnotation>
        </MapView>
        
        {/* Dark overlay for night effect */}
        <View style={styles.mapOverlay} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.profileContainer}>
          <View style={[styles.profileButton, {
            backgroundColor: nightColors.glass,
            borderColor: nightColors.border
          }]}>
            <View style={styles.profileAvatar} />
          </View>
        </View>
        
        <TouchableOpacity style={[styles.searchButton, {
          backgroundColor: nightColors.glass,
          borderColor: nightColors.border
        }]}>
          <Image source={require('../assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        <View style={[styles.modeToggleWrapper, {
          backgroundColor: nightColors.glass,
          borderColor: nightColors.border
        }]}>
          <TouchableOpacity 
            style={styles.modeToggleButton}
            onPress={onToggleMode}
          >
            <Text style={[styles.modeToggleText, { color: nightColors.text.muted }]}>DAY</Text>
          </TouchableOpacity>
          <View style={[styles.modeToggleActive, {
            backgroundColor: nightColors.surface,
            borderColor: nightColors.borderGlow,
            shadowColor: nightColors.purple,
          }]}>
            <View style={[styles.moonIcon, { backgroundColor: nightColors.purple }]} />
            <Text style={[styles.modeToggleActiveText, { color: nightColors.text.primary }]}>NIGHT</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              category.active && {
                backgroundColor: `${nightColors.purple}33`,
                borderColor: `${nightColors.purple}80`,
                shadowColor: nightColors.purple,
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              category.active 
                ? { color: '#DDD6FE' } // purple-200
                : { color: nightColors.text.muted }
            ]}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <BlurView intensity={30} tint="dark" style={[styles.bottomSheetBlur, {
          backgroundColor: nightColors.glass,
          borderTopColor: nightColors.border
        }]}>
          {/* Glow Effects */}
          <View style={[styles.glowEffect, styles.glowEffectTop, { backgroundColor: `${nightColors.purple}33` }]} />
          <View style={[styles.glowEffect, styles.glowEffectBottom, { backgroundColor: `${nightColors.primary}33` }]} />
          
          {venues.map((venue) => (
            <NightVenueCard key={venue.id} venue={venue} />
          ))}
        </BlurView>
      </View>
    </View>
  );
};

const NightVenueCard: React.FC<{ venue: any }> = ({ venue }) => {
  return (
    <View style={styles.venueCard}>
      <View style={styles.venueInfo}>
        {/* Venue Image */}
        <View style={[styles.venueImageContainer, {
          backgroundColor: nightColors.surface,
          borderColor: nightColors.border,
        }]}>
          <Image source={{ uri: venue.image }} style={styles.venueImage} />
        </View>

        {/* Venue Details */}
        <View style={styles.venueDetails}>
          <View style={styles.venueHeader}>
            <Text style={[styles.venueName, { color: nightColors.text.primary }]}>{venue.name}</Text>
            <View style={[styles.liveIndicator, {
              backgroundColor: `${nightColors.primary}33`,
              borderColor: `${nightColors.primary}80`,
              shadowColor: nightColors.primary,
              shadowOpacity: 0.6,
              shadowRadius: 8,
            }]}>
              <View style={[styles.liveDot, { backgroundColor: nightColors.primary }]} />
              <Text style={[styles.liveText, { color: nightColors.primary }]}>LIVE</Text>
            </View>
          </View>
          
          <Text style={[styles.venueLocation, { color: nightColors.text.muted }]}>{venue.location}</Text>
          
          {/* Tags */}
          <View style={styles.venueTags}>
            <View style={[styles.venueTag, {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: nightColors.border
            }]}>
              <View style={[styles.tagIcon, { backgroundColor: nightColors.purple }]} />
              <Text style={[styles.tagText, { color: nightColors.text.muted }]}>{venue.genre}</Text>
            </View>
            <View style={[styles.venueTag, {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: nightColors.border
            }]}>
              <View style={[styles.tagIcon, { backgroundColor: nightColors.primary }]} />
              <Text style={[styles.tagText, { color: nightColors.text.muted }]}>{venue.duration}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Friends Section */}
      <View style={[styles.friendsSection, {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }]}>
        <View style={styles.friendsAvatars}>
          <View style={[styles.friendAvatar, { backgroundColor: nightColors.surface }]} />
          <View style={[styles.friendAvatar, { backgroundColor: nightColors.surface }]} />
          <View style={[styles.friendsMore, { backgroundColor: nightColors.surface }]}>
            <Text style={[styles.friendsMoreText, { color: nightColors.text.primary }]}>+{venue.friendsCount}</Text>
          </View>
        </View>
        <View style={styles.friendsInfo}>
          <Text style={[styles.friendsTitle, { color: nightColors.text.primary }]}>Who's going</Text>
          <Text style={[styles.friendsSubtitle, { color: nightColors.text.muted }]}>Your friends are here</Text>
        </View>
        <TouchableOpacity style={[styles.friendsButton, {
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }]}>
          <Text style={[styles.friendsButtonIcon, { color: nightColors.text.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.shareButton, {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: nightColors.border
        }]}>
          <Text style={[styles.shareButtonIcon, { color: nightColors.text.primary }]}>⤴</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.directionsButton, {
          shadowColor: nightColors.primary,
          shadowOpacity: 0.6,
          shadowRadius: 20,
        }]}>
          <LinearGradient
            colors={[nightColors.primary, nightColors.emerald]}
            style={styles.directionsGradient}
          >
            <Text style={[styles.directionsIcon, { color: nightColors.background }]}>⤴</Text>
            <Text style={[styles.directionsText, { color: nightColors.background }]}>Get Directions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  
  mapView: {
    flex: 1,
  },
  
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.3)', // Dark overlay for night effect
    pointerEvents: 'none',
  },
  
  // Mapbox Marker Styles for Night Mode
  mapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  markerPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 8,
  },
  
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  markerPulse: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pulseRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  
  pulseInner: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  
  smallMapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  smallMarkerPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#71717A', // zinc-500
  },
  
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  searchIcon: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  
  modeToggleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 20,
  },
  
  modeToggleWrapper: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  
  modeToggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  
  modeToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  
  modeToggleActive: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 4,
  },
  
  moonIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  modeToggleActiveText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  
  categoryScroll: {
    zIndex: 20,
    paddingLeft: 16,
  },
  
  categoryContainer: {
    paddingRight: 16,
    paddingBottom: 16,
    paddingTop: 16,
    gap: 8,
  },
  
  categoryButton: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },
  
  bottomSheetBlur: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  
  glowEffect: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    opacity: 0.2,
  },
  
  glowEffectTop: {
    top: -40,
    right: -40,
  },
  
  glowEffectBottom: {
    bottom: -40,
    left: -40,
  },
  
  venueCard: {
    gap: 16,
    position: 'relative',
    zIndex: 10,
  },
  
  venueInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  
  venueImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  venueImage: {
    width: '100%',
    height: '100%',
  },
  
  venueDetails: {
    flex: 1,
    paddingTop: 4,
    gap: 4,
  },
  
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    flex: 1,
  },
  
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  liveText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  
  venueLocation: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  venueTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  
  venueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  
  tagIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  friendsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  friendsAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
  },
  
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    marginLeft: -8,
  },
  
  friendsMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  friendsMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  friendsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
  friendsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  friendsSubtitle: {
    fontSize: 10,
  },
  
  friendsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  friendsButtonIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  shareButtonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  directionsButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  
  directionsGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  
  directionsIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  directionsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});