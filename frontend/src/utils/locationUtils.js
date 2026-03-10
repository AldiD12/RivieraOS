// Location utility functions for distance calculation and sorting

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Sort events by distance from user location
 * @param {Array} events - Array of events with venue coordinates
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @returns {Array} Events sorted by distance (nearest first)
 */
export function sortEventsByDistance(events, userLocation) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return events;
  }

  return events
    .map(event => {
      // Calculate distance to venue
      const distance = event.venue?.latitude && event.venue?.longitude
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            event.venue.latitude,
            event.venue.longitude
          )
        : Infinity;
      
      return {
        ...event,
        distanceFromUser: distance
      };
    })
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser);
}

/**
 * Sort venues by distance from user location
 * @param {Array} venues - Array of venues with coordinates
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @returns {Array} Venues sorted by distance (nearest first)
 */
export function sortVenuesByDistance(venues, userLocation) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return venues;
  }

  return venues
    .map(venue => {
      const distance = venue.latitude && venue.longitude
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            venue.latitude,
            venue.longitude
          )
        : Infinity;
      
      return {
        ...venue,
        distanceFromUser: distance
      };
    })
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser);
}

/**
 * Get user's current location using GPS
 * @returns {Promise<Object>} Promise that resolves to {latitude, longitude}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}