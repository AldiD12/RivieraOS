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
import { RivieraDiscoveryScreenNight } from './RivieraDiscoveryScreen-Night';

// Set Mapbox access token
Mapbox.setAccessToken('sk.eyJ1IjoiYWxkaWQxNjAyIiwiYSI6ImNtbDQ4NHV3aDB5ZTQzZHNkZHpoYm96MnkifQ.BIK3YtfFBiLSZLRREwFNrg');

const { width, height } = Dimensions.get('window');

// Day Mode - Premium Luxury Color Palette (Following Design System)
const dayColors = {
  // Primary backgrounds following design system
  backgroundLight: '#FAFAF9', // warm off-white
  surfaceGlass: 'rgba(255, 255, 255, 0.75)', // glass morphism
  
  // Sophisticated accent colors
  primary: '#92400E', // deep burnt amber (design system primary)
  primaryHover: '#78350F', // darker amber for hover
  
  // Premium text colors
  textMain: '#1C1917', // near black (stone-900)
  textSecondary: '#57534E', // warm gray (stone-600)
  textMuted: '#78716C', // muted (stone-500)
  
  // Subtle borders and elements
  border: 'rgba(120, 113, 108, 0.2)', // stone-500 with opacity
  borderLight: 'rgba(120, 113, 108, 0.1)',
  
  // Status and accent colors
  success: '#059669', // emerald for status
  successBg: '#ECFDF5', // emerald-50
  successBorder: '#A7F3D0', // emerald-200
  
  // Map specific colors
  mapBg: '#FAFAF9',
  champagne: '#D4C48C', // sophisticated champagne
};

interface RivieraDiscoveryScreenProps {}

export const RivieraDiscoveryScreen: React.FC<RivieraDiscoveryScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('Beach Clubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);

  const toggleMode = () => {
    setIsNightMode(!isNightMode);
  };

  // If night mode is active, render the completely different night component
  if (isNightMode) {
    return <RivieraDiscoveryScreenNight onToggleMode={toggleMode} />;
  }

  // Day mode component (luxury Riviera theme)
  const categories = [
    { 
      id: 'Beach Clubs', 
      label: 'Beach Clubs', 
      icon: require('../assets/icons8-place-marker-50.png'),
    },
    { 
      id: 'Rooftops', 
      label: 'Rooftops', 
      icon: require('../assets/icons8-expand-arrow-50.png'),
    },
    { 
      id: 'Pools', 
      label: 'Pools', 
      icon: require('../assets/icons8-navigation-50.png'),
    },
  ];

  const venues = [
    {
      id: '1',
      name: 'La Reserve',
      location: 'Pampelonne, Ramatuelle',
      status: 'Open',
      temperature: '28°C',
      rating: 4.9,
      vibeMeter: 0.7,
      vibeLabel: 'High Energy',
      occupancy: '80% Full',
      friendsHere: ['Sophie', 'Marc'],
      totalFriends: 7,
      sunbedsLeft: 2,
      tags: ['Sunbeds', 'DJ'],
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
      coordinates: { latitude: 43.2384, longitude: 6.6413 }, // Saint-Tropez area coordinates
    },
  ];

  // Mapbox coordinates for Saint-Tropez/Riviera area
  const mapCenter = [6.6413, 43.2384]; // [longitude, latitude] format for Mapbox
  const zoomLevel = 12;

  return (
    <View style={[styles.container, { backgroundColor: dayColors.backgroundLight }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapView}
          styleURL="mapbox://styles/mapbox/light-v11"
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
                  backgroundColor: dayColors.textMain,
                  shadowColor: dayColors.textMain,
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                }]}>
                  <View style={[styles.markerDot, { backgroundColor: 'white' }]} />
                </View>
                <View style={styles.markerPulse}>
                  <View style={[styles.pulseRing, { backgroundColor: `${dayColors.primary}15` }]} />
                  <View style={[styles.pulseInner, { backgroundColor: `${dayColors.primary}25` }]} />
                </View>
              </View>
            </PointAnnotation>
          ))}
          
          {/* Additional Beach Club Markers */}
          <PointAnnotation
            id="bagatelle"
            coordinate={[6.6380, 43.2350]}
          >
            <View style={styles.smallMapMarker}>
              <View style={[styles.smallMarkerPin, {
                backgroundColor: dayColors.primary,
                shadowColor: dayColors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 6,
              }]} />
            </View>
          </PointAnnotation>
          
          <PointAnnotation
            id="club55"
            coordinate={[6.6450, 43.2400]}
          >
            <View style={styles.smallMapMarker}>
              <View style={[styles.smallMarkerPin, {
                backgroundColor: dayColors.champagne,
                shadowColor: dayColors.champagne,
                shadowOpacity: 0.3,
                shadowRadius: 6,
              }]} />
            </View>
          </PointAnnotation>
        </MapView>
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.searchContainer}>
          <BlurView intensity={20} tint="light" style={styles.searchBlur}>
            <View style={[styles.searchInput, { 
              backgroundColor: dayColors.surfaceGlass,
              borderColor: 'rgba(255, 255, 255, 0.4)'
            }]}>
              <Image source={require('../assets/search.png')} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchText, { color: dayColors.textMain }]}
                placeholder="Search Riviera..."
                placeholderTextColor={dayColors.textMuted + '99'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </BlurView>
        </View>
        
        <TouchableOpacity style={styles.profileButton}>
          <BlurView intensity={20} tint="light" style={[styles.profileBlur, {
            backgroundColor: dayColors.surfaceGlass,
            borderColor: 'rgba(255, 255, 255, 0.4)'
          }]}>
            <Image source={require('../assets/menu.png')} style={styles.profileIcon} />
          </BlurView>
        </TouchableOpacity>
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
            style={styles.categoryButton}
            onPress={() => setSelectedCategory(category.id)}
          >
            {selectedCategory === category.id ? (
              <LinearGradient
                colors={[dayColors.textMain, '#4A4238']}
                style={styles.categoryGradient}
              >
                <Image source={category.icon} style={styles.categoryIcon} />
                <Text style={[styles.categoryTextActive, { color: '#FDFBF7' }]}>{category.label}</Text>
              </LinearGradient>
            ) : (
              <BlurView intensity={20} tint="light" style={[styles.categoryBlur, {
                backgroundColor: dayColors.surfaceGlass,
                borderColor: 'rgba(255, 255, 255, 0.4)'
              }]}>
                <Image source={category.icon} style={styles.categoryIconInactive} />
                <Text style={[styles.categoryTextInactive, { color: dayColors.textMain }]}>{category.label}</Text>
              </BlurView>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton}>
          <BlurView intensity={20} tint="light" style={[styles.controlBlur, {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.4)'
          }]}>
            <Image source={require('../assets/icons8-navigation-50.png')} style={styles.controlIcon} />
          </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlButton}>
          <BlurView intensity={20} tint="light" style={[styles.controlBlur, {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.4)'
          }]}>
            <Image source={require('../assets/icons8-map-pin-50.png')} style={styles.controlIcon} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleMode}>
        <BlurView intensity={20} tint="light" style={[styles.modeToggleBlur, {
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.4)'
        }]}>
          <View style={[styles.modeIcon, { 
            backgroundColor: dayColors.primary,
            shadowColor: dayColors.primary,
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }]} />
          <Text style={[styles.modeText, { color: dayColors.textMain }]}>DAY MODE</Text>
        </BlurView>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <BlurView intensity={30} tint="light" style={[styles.bottomSheetBlur, {
          backgroundColor: dayColors.surfaceGlass,
          borderTopColor: 'rgba(255, 255, 255, 0.6)'
        }]}>
          <View style={[styles.bottomSheetHandle, { 
            backgroundColor: 'rgba(107, 102, 94, 0.2)',
          }]} />
          
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </BlurView>
      </View>
    </View>
  );
};

const VenueCard: React.FC<{ venue: any }> = ({ venue }) => {
  return (
    <View style={styles.venueCard}>
      <View style={styles.venueInfo}>
        {/* Status and Temperature */}
        <View style={styles.venueHeader}>
          <View style={[styles.statusContainer, {
            backgroundColor: dayColors.successBg,
            borderColor: dayColors.successBorder,
          }]}>
            <View style={[styles.statusDot, {
              backgroundColor: dayColors.success,
              shadowColor: dayColors.success,
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }]} />
            <Text style={[styles.statusText, { color: dayColors.success }]}>OPEN</Text>
          </View>
          <View style={[styles.temperatureContainer, {
            backgroundColor: 'rgba(146, 64, 14, 0.1)', // primary with opacity
            borderColor: 'rgba(146, 64, 14, 0.2)',
          }]}>
            <View style={styles.temperatureIconContainer}>
              <View style={[styles.thermometerIcon, {
                backgroundColor: dayColors.primary
              }]} />
            </View>
            <Text style={[styles.temperatureText, {
              color: dayColors.primary
            }]}>28°C</Text>
          </View>
        </View>

        {/* Venue Name and Location */}
        <Text style={[styles.venueName, { color: dayColors.textMain }]}>{venue.name}</Text>
        <View style={styles.locationContainer}>
          <Image source={require('../assets/icons8-map-pin-50.png')} style={styles.locationIcon} />
          <Text style={[styles.locationText, { color: dayColors.textMuted }]}>{venue.location}</Text>
        </View>

        {/* Vibe Meter */}
        <View style={styles.vibeMeterContainer}>
          <View style={styles.vibeMeterHeader}>
            <Text style={[styles.vibeMeterLabel, { color: dayColors.textMuted }]}>VIBE METER</Text>
            <Text style={[styles.vibeMeterValue, { color: dayColors.textMain }]}>{venue.vibeLabel}</Text>
          </View>
          <View style={styles.vibeMeterBar}>
            <View style={[styles.vibeMeterFillDay, { 
              width: `${venue.vibeMeter * 100}%`,
              backgroundColor: dayColors.primary 
            }]} />
          </View>
        </View>

        {/* Friends */}
        <View style={styles.friendsContainer}>
          <View style={styles.friendsAvatars}>
            <View style={[styles.friendAvatar, {
              backgroundColor: '#D1D5DB',
              borderColor: 'white',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }]} />
            <View style={[styles.friendAvatar, {
              backgroundColor: '#D1D5DB',
              borderColor: 'white',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }]} />
            <View style={[styles.friendsMore, {
              backgroundColor: dayColors.textMain,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }]}>
              <Text style={[styles.friendsMoreText, {
                color: 'white'
              }]}>+{venue.totalFriends - 2}</Text>
            </View>
          </View>
          <View style={styles.friendsInfo}>
            <Text style={[styles.friendsTitle, { color: dayColors.textMain }]}>Friends here</Text>
            <Text style={[styles.friendsSubtitle, { color: dayColors.textMuted }]}>
              {venue.friendsHere.join(' & ')} are checked in
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.primaryButton, {
            shadowColor: dayColors.textMain,
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }]}>
            <LinearGradient
              colors={[dayColors.textMain, '#4A4238']}
              style={styles.buttonGradient}
            >
              <Text style={[styles.primaryButtonText, {
                color: '#FDFBF7'
              }]}>Check Availability</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <BlurView intensity={20} tint="light" style={[styles.secondaryButtonBlur, {
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              borderColor: 'rgba(255, 255, 255, 0.4)'
            }]}>
              <Image source={require('../assets/icons8-route-50.png')} style={styles.secondaryButtonIcon} />
              <Text style={[styles.secondaryButtonText, {
                color: dayColors.textMain
              }]}>Directions</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Venue Image */}
      <View style={[styles.venueImageContainer, {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        borderColor: 'transparent',
        borderWidth: 0,
      }]}>
        <Image source={{ uri: venue.image }} style={styles.venueImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.venueImageOverlay}
        />
        <View style={styles.venueRating}>
          <BlurView intensity={20} tint="light" style={[styles.ratingBlur, {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'transparent',
            borderWidth: 0,
          }]}>
            <Text style={[styles.ratingText, {
              color: dayColors.textMain
            }]}>{venue.rating}</Text>
            <View style={[styles.starIcon, {
              backgroundColor: dayColors.primary,
              shadowColor: 'transparent',
              shadowOpacity: 0,
              shadowRadius: 0,
            }]} />
          </BlurView>
        </View>
        <View style={styles.venueTags}>
          {venue.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.venueTag}>
              <BlurView intensity={20} tint="light" style={[styles.tagBlur, {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'transparent',
                borderWidth: 0,
              }]}>
                <Text style={[styles.tagText, {
                  color: dayColors.textMain
                }]}>{tag}</Text>
              </BlurView>
            </View>
          ))}
        </View>
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
  
  // Mapbox Marker Styles
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
    borderColor: 'white',
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
    borderColor: 'white',
    elevation: 4,
  },
  
  modeToggle: {
    position: 'absolute',
    bottom: 360,
    left: 16,
    zIndex: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  modeToggleBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  
  modeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    elevation: 2,
  },
  
  modeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    zIndex: 20,
  },
  
  searchContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  searchBlur: {
    flex: 1,
    borderRadius: 24,
  },
  
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
    opacity: 0.6,
  },
  
  searchText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  profileBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
  },
  
  profileIcon: {
    width: 22,
    height: 22,
  },
  
  categoryScroll: {
    zIndex: 20,
    paddingLeft: 16,
  },
  
  categoryContainer: {
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 4,
    gap: 12,
  },
  
  categoryButton: {
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  categoryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  
  categoryBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  
  categoryIcon: {
    width: 18,
    height: 18,
  },
  
  categoryIconInactive: {
    width: 18,
    height: 18,
    opacity: 0.7,
  },
  
  categoryTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FDFBF7',
    letterSpacing: 0.5,
  },
  
  categoryTextInactive: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 360,
    zIndex: 20,
    gap: 12,
  },
  
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  controlBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
  },
  
  controlIcon: {
    width: 20,
    height: 20,
  },
  
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 60,
    elevation: 20,
  },
  
  bottomSheetBlur: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
  },
  
  bottomSheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  
  venueCard: {
    flexDirection: 'row',
    gap: 20,
  },
  
  venueInfo: {
    flex: 1,
    paddingTop: 4,
  },
  
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  
  temperatureIconContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  
  thermometerIcon: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    position: 'relative',
  },
  
  temperatureText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  venueName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 4,
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  
  locationIcon: {
    width: 16,
    height: 16,
  },
  
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  vibeMeterContainer: {
    marginBottom: 20,
  },
  
  vibeMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  
  vibeMeterLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  
  vibeMeterValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  vibeMeterBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  vibeMeterFillDay: {
    height: '100%',
    borderRadius: 3,
    opacity: 0.8,
  },
  
  friendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  friendsAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  friendsMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  friendsMoreText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  
  friendsInfo: {
    flex: 1,
  },
  
  friendsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  
  friendsSubtitle: {
    fontSize: 10,
    lineHeight: 12,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FDFBF7',
    letterSpacing: 0.5,
  },
  
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  secondaryButtonBlur: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    gap: 4,
  },
  
  secondaryButtonIcon: {
    width: 18,
    height: 18,
  },
  
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  venueImageContainer: {
    width: 150,
    aspectRatio: 3/4,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  
  venueImage: {
    width: '100%',
    height: '100%',
  },
  
  venueImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  
  venueRating: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  ratingBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 4,
  },
  
  starIcon: {
    width: 10,
    height: 10,
    backgroundColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  
  venueTags: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  
  venueTag: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  
  tagBlur: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
  },
  
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RivieraDiscoveryScreen;