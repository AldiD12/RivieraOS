// API Data Structures for Riviera OS Discovery

export interface VenueStatus {
  venueId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  occupancyRate: number; // 0-100
  statusColor: 'Green' | 'Yellow' | 'Red';
  venueName: string;
  availableUnits: number;
  unitType: string; // e.g., "Sunbeds", "Tables", "Spots"
}

export interface LiveEvent {
  eventId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  eventName: string;
  eventType: 'Live Music' | 'DJ Set' | 'Cocktail Lounge';
  venueName: string;
  eventDetails: {
    music?: string;
    entry?: string;
    startTime?: string;
    endTime?: string;
  };
  learnMoreUrl?: string;
}

export interface VenueDetail {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  // Day mode specific
  occupancyRate?: number;
  availableUnits?: number;
  unitType?: string;
  // Night mode specific
  currentEvent?: LiveEvent;
}

// Filter types
export type DayModeFilter = 'VIP' | 'Family Friendly' | 'Party Vibe';
export type NightModeFilter = 'Live Music' | 'DJ Set' | 'Cocktail Lounge';

// API Response types
export interface VenueStatusResponse {
  venues: VenueStatus[];
  timestamp: string;
}

export interface LiveEventResponse {
  events: LiveEvent[];
  timestamp: string;
}

// App State types
export type AppMode = 'day' | 'night';

export interface AppState {
  mode: AppMode;
  selectedVenue: VenueDetail | null;
  isDetailSheetOpen: boolean;
  activeFilters: DayModeFilter[] | NightModeFilter[];
}