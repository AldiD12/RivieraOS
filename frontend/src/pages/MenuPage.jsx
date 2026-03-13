import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vibeApi } from '../services/vibeApi';
import { API_CONFIG } from '../services/apiConfig';

const API_URL = API_CONFIG.BASE_URL;

// 🛡️ VENUE JAIL: "NEVER STEAL THE DAY, ONLY SELL THE NIGHT"
// QR Context Detection and Night Mode Upsell System

// Get venue hierarchy from URL params or lookup from bedId/unitId
const getVenueHierarchy = async (bedId) => {
  // First check if venueId is directly provided
  const urlParams = new URLSearchParams(window.location.search);
  const directVenueId = urlParams.get('venueId') || urlParams.get('v');
  
  if (directVenueId) {
    return {
      unitId: bedId,
      venueId: parseInt(directVenueId),
      isDirect: true
    };
  }
  
  // If no direct venueId but we have bedId, we need to lookup the hierarchy
  if (bedId) {
    console.log('🔍 Looking up venue hierarchy for unit:', bedId);
    
    try {
      // PRODUCTION TODO: Implement proper hierarchy lookup API
      // const response = await fetch(`${API_CONFIG.BASE_URL}/public/Units/${bedId}/hierarchy`);
      // if (response.ok) {
      //   const hierarchy = await response.json();
      //   return hierarchy;
      // }
      
      // TEMPORARY: Use existing venue lookup logic
      if (typeof bedId === 'string') {
        if (/^[A-Z]\d+$/i.test(bedId)) {
          console.log('🏖️ Detected zone-based bedId pattern:', bedId);
          return {
            unitId: bedId,
            unitName: `Unit ${bedId}`,
            zoneId: 1,
            zoneName: 'Beach Zone',
            venueId: 1,
            venueName: 'Beach Club',
            businessId: 1,
            businessName: 'Riviera Hospitality'
          };
        }
        
        const numericBedId = parseInt(bedId);
        if (!isNaN(numericBedId)) {
          console.log('🔢 Detected numeric bedId:', numericBedId);
          return {
            unitId: numericBedId,
            unitName: `Unit ${numericBedId}`,
            zoneId: 1,
            zoneName: 'Beach Zone', 
            venueId: 1,
            venueName: 'Beach Club',
            businessId: 1,
            businessName: 'Riviera Hospitality'
          };
        }
      }
      
      console.warn('⚠️ Unknown bedId format, defaulting to venue 1:', bedId);
      return {
        unitId: bedId,
        venueId: 1,
        businessId: 1
      };
      
    } catch (error) {
      console.error('Error looking up venue hierarchy:', error);
      return { unitId: bedId, venueId: 1, businessId: 1 };
    }
  }
  
  console.warn('⚠️ No bedId provided, defaulting to venue 1');
  return { venueId: 1, businessId: 1 };
};

// Initialize venue ID (will be set properly in useEffect)
let VENUE_ID = 1;
// Material Icons Component
const MaterialIcon = ({ name, className = "", filled = false }) => (
  <span className={`material-symbols-outlined ${className}`} style={{
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 200, 'GRAD' 0, 'opsz' 24`
  }}>
    {name}
  </span>
);

// Menu Item Component - Luxury Design System
function MenuItem({ item, addToCart, cart, updateQuantity, isDigitalOrderingEnabled }) {
  const cartItem = cart.find(cartItem => cartItem.id === item.id);
  const isInCart = !!cartItem;

  return (
    <article className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-[4/5] mb-8">
        {isInCart && isDigitalOrderingEnabled && (
          <div className="absolute top-4 right-4 z-10 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-full p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/40">
            <MaterialIcon name="check" className="text-[16px] text-stone-900" />
          </div>
        )}
        <div className="w-full h-full overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-200/40 transition-all duration-500 ease-out group-hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)] group-hover:-translate-y-2">
          <img
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            src={item.imageUrl}
          />
        </div>
      </div>
      <div className="w-full px-2">
        <div className="flex flex-col items-center gap-2 mb-4">
          <h3 className="font-serif text-3xl text-stone-900 leading-tight font-light tracking-tight">{item.name}</h3>
          <span className="font-serif text-4xl text-amber-900 font-normal">€{item.basePrice.toFixed(2)}</span>
        </div>
        <p className="font-sans text-lg text-stone-600 leading-relaxed font-normal max-w-[90%] mx-auto mb-8">
          {item.description}
        </p>
        
        {/* Conditional rendering based on digital ordering enabled */}
        {isDigitalOrderingEnabled ? (
          <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mx-auto">
            {isInCart ? (
              <>
                <div className="flex items-center gap-3 border border-stone-300 px-4 py-3 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
                  <button 
                    onClick={() => updateQuantity(item.id, 'decrease')}
                    className="text-stone-700 hover:text-stone-900 transition-colors flex items-center"
                  >
                    <MaterialIcon name="remove" className="text-[16px]" />
                  </button>
                  <span className="font-serif text-base min-w-[1ch] text-center w-4 text-stone-900">{cartItem.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 'increase')}
                    className="text-stone-700 hover:text-stone-900 transition-colors flex items-center"
                  >
                    <MaterialIcon name="add" className="text-[16px]" />
                  </button>
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  className="flex-1 bg-stone-900 text-stone-50 font-sans text-sm uppercase tracking-widest py-4 px-6 rounded-full hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                >
                  Add
                </button>
              </>
            ) : (
              <button
                onClick={() => addToCart(item)}
                className="flex-1 bg-stone-900 text-stone-50 font-sans text-sm uppercase tracking-widest py-4 px-8 rounded-full hover:bg-stone-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
              >
                <span>Add to Order</span>
              </button>
            )}
          </div>
        ) : (
          // View-only mode - no ordering controls
          <div className="flex items-center justify-center w-full max-w-[280px] mx-auto">
            <div className="text-center py-4 px-8 border border-stone-300 text-stone-700 font-sans text-sm uppercase tracking-widest rounded-full">
              View Only
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const bedId = searchParams.get('bedId');
  
  // 🛡️ VENUE JAIL DETECTION - "NEVER STEAL THE DAY, ONLY SELL THE NIGHT"
  const isQRContext = Boolean(bedId || searchParams.get('qr') || searchParams.get('unitId'));
  const [venueHierarchy, setVenueHierarchy] = useState(null); // Business → Venue → Zone → Unit
  const [tonightEvents, setTonightEvents] = useState([]); // Night mode upsell events
  const [showPlanTonightBanner, setShowPlanTonightBanner] = useState(false);
  
  const [sunbedName, setSunbedName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [sunbedNumber, setSunbedNumber] = useState('24');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [venueData, setVenueData] = useState(null);
  const [isDigitalOrderingEnabled, setIsDigitalOrderingEnabled] = useState(true);
  
  // Dynamic configuration from venue data
  const [vibeConfig, setVibeConfig] = useState({
    whatsappNumber: '355691234567',
    googleBusinessId: 'YOUR_GOOGLE_BUSINESS_ID',
    pollDelayMs: 3000
  });
  const [primaryColor, setPrimaryColor] = useState('#92400E'); // Luxury amber instead of industrial green
  const [categories, setCategories] = useState(['All Items', 'Cocktails', 'Food', 'Wine']);
  
  // Vibe Poll System State
  const [liveVibeScore, setLiveVibeScore] = useState(92);
  const [showVibePoll, setShowVibePoll] = useState(false);
  const [vibeResponse, setVibeResponse] = useState(null);
  const [showComplaintBox, setShowComplaintBox] = useState(false);
  const [showGoogleReview, setShowGoogleReview] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [vibeSubmitting, setVibeSubmitting] = useState(false);
  
  // Reservation modal state
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    guestName: '',
    guestPhone: '',
    guestCount: 2,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    notes: ''
  });
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  useEffect(() => {
    const initializeVenueJail = async () => {
      console.log('🛡️ VENUE JAIL: Initializing QR context detection');
      console.log('📱 QR Context detected:', isQRContext);
      console.log('🛏️ Bed ID:', bedId);
      
      if (isQRContext && bedId) {
        // VENUE JAIL MODE: Get complete hierarchy
        try {
          console.log('🔍 Looking up venue hierarchy for unit:', bedId);
          
          const hierarchy = await getVenueHierarchy(bedId);
          setVenueHierarchy(hierarchy);
          VENUE_ID = hierarchy.venueId;
          
          console.log('🏨 Venue hierarchy loaded:', hierarchy);
          
          // Load tonight's events for upsell (exclude current venue's competitors)
          await loadTonightEvents(VENUE_ID);
          
          // Show "Plan Tonight" banner after 3 seconds (psychological timing)
          setTimeout(() => {
            setShowPlanTonightBanner(true);
            console.log('🪩 VENUE JAIL: Activating "Plan Tonight" upsell banner');
          }, 3000);
          
        } catch (error) {
          console.error('❌ Failed to load venue hierarchy:', error);
          // Fallback to regular mode
          const fallbackHierarchy = await getVenueHierarchy(bedId);
          VENUE_ID = fallbackHierarchy.venueId;
        }
      } else {
        // REGULAR BROWSE MODE: No restrictions
        console.log('🌐 Regular browse mode - no venue jail restrictions');
        const hierarchy = await getVenueHierarchy(bedId);
        VENUE_ID = hierarchy.venueId;
      }
      
      // Load venue data with the correct venue ID
      fetchVenueData();
    };
    
    initializeVenueJail();
    
    // Add fonts
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Add luxury fonts
    if (!document.querySelector('link[href*="Cormorant+Garamond"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [bedId, isQRContext]);
  // 🪩 VENUE JAIL: Load tonight's events for upsell (with home venue advantage)
  const loadTonightEvents = async (currentVenueId) => {
    try {
      console.log('🌙 Loading tonight\'s events for venue jail upsell...');
      
      // Fetch all events for tonight
      const response = await fetch(`${API_URL}/public/Events`);
      if (!response.ok) {
        console.log('Events API not available, using mock data');
        // Mock events for demo
        setTonightEvents([
          {
            id: 1,
            name: 'VIP Rooftop Party',
            venueId: currentVenueId, // Home venue gets priority
            venueName: venueData?.name || 'Current Venue',
            startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
            minimumSpend: 150,
            isHomeVenue: true
          },
          {
            id: 2,
            name: 'Beach Club Sunset',
            venueId: currentVenueId + 1,
            venueName: 'Rival Beach Club',
            startTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
            minimumSpend: 100,
            isHomeVenue: false
          }
        ]);
        return;
      }
      
      const allEvents = await response.json();
      
      // Filter for tonight's events
      const today = new Date();
      const tonight = new Date(today);
      tonight.setHours(18, 0, 0, 0); // After 6 PM
      const endOfNight = new Date(today);
      endOfNight.setDate(endOfNight.getDate() + 1);
      endOfNight.setHours(6, 0, 0, 0); // Until 6 AM next day
      
      const tonightEvents = allEvents.filter(event => {
        const eventTime = new Date(event.startTime);
        return eventTime >= tonight && eventTime <= endOfNight;
      });
      
      // 🏆 HOME TEAM ADVANTAGE: Pin current venue's events to top
      const sortedEvents = tonightEvents.sort((a, b) => {
        // Home venue events first
        if (a.venueId === currentVenueId && b.venueId !== currentVenueId) return -1;
        if (b.venueId === currentVenueId && a.venueId !== currentVenueId) return 1;
        
        // Then by start time
        return new Date(a.startTime) - new Date(b.startTime);
      });
      
      // Mark home venue events
      const eventsWithHomeFlag = sortedEvents.map(event => ({
        ...event,
        isHomeVenue: event.venueId === currentVenueId
      }));
      
      setTonightEvents(eventsWithHomeFlag.slice(0, 5)); // Top 5 events
      console.log('🪩 Tonight\'s events loaded:', eventsWithHomeFlag.length, 'events');
      
    } catch (error) {
      console.error('Failed to load tonight\'s events:', error);
      setTonightEvents([]);
    }
  };

  // 🪩 Handle "Plan Tonight" banner click
  const handlePlanTonightClick = () => {
    console.log('🪩 VENUE JAIL: User clicked "Plan Tonight" - routing to night events');
    
    // Navigate to Discovery page in night mode with events
    const discoveryUrl = `/discovery?mode=night&filter=events&source=venue-jail&venue=${VENUE_ID}`;
    window.open(discoveryUrl, '_blank');
  };
  const fetchVenueData = async () => {
    setLoading(false);
    
    if (bedId) {
      setSunbedName(bedId);
      setSunbedNumber(bedId);
    }
    
    setIsDigitalOrderingEnabled(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const venueResponse = await fetch(`${API_URL}/public/Venues/${VENUE_ID}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (venueResponse.ok) {
          const venue = await venueResponse.json();
          setVenueData(venue);
          // Use backend's computed field (factors in venue type for auto mode)
          setIsDigitalOrderingEnabled(venue.allowsDigitalOrdering ?? venue.isDigitalOrderingEnabled ?? true);
          
          if (venue.vibeConfig) {
            setVibeConfig({
              whatsappNumber: venue.vibeConfig.whatsappNumber || '355691234567',
              googleBusinessId: venue.vibeConfig.googleBusinessId || 'YOUR_GOOGLE_BUSINESS_ID',
              pollDelayMs: venue.vibeConfig.pollDelayMs || 3000
            });
          }
          
          if (venue.branding?.primaryColor) {
            setPrimaryColor(venue.branding.primaryColor);
          }
          
          console.log('🏨 Venue data loaded:', venue);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error fetching venue details:', err);
      }

      try {
        const menuController = new AbortController();
        const menuTimeoutId = setTimeout(() => menuController.abort(), 5000);
        
        const menuResponse = await fetch(`${API_URL}/public/Venues/${VENUE_ID}/menu`, {
          signal: menuController.signal
        });
        clearTimeout(menuTimeoutId);
        
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(menuData.items || []);
          
          const uniqueCategories = ['All Items', ...new Set(menuData.items?.map(item => item.categoryName) || [])];
          setCategories(uniqueCategories);
          
          console.log('🍽️ Menu data loaded:', menuData);
        } else {
          console.log('Menu endpoint returned:', menuResponse.status, '- using fallback menu');
          setMenuItems([
            {
              id: 1,
              name: 'House Special',
              description: 'Chef\'s signature dish',
              basePrice: 15.00,
              categoryName: 'Food',
              category: 'food',
              imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setMenuItems([
          {
            id: 1,
            name: 'House Special',
            description: 'Chef\'s signature dish',
            basePrice: 15.00,
            categoryName: 'Food',
            category: 'food',
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error in fetchVenueData:', error);
    }
  };

  const filteredItems = activeCategory === 'All Items' 
    ? menuItems 
    : menuItems.filter(item => item.categoryName === activeCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, action) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    if (action === 'increase') {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else if (action === 'decrease') {
      if (item.quantity <= 1) {
        setCart(cart.filter(cartItem => cartItem.id !== itemId));
      } else {
        setCart(cart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        ));
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
  };

  const getServiceCharge = () => {
    return getCartTotal() * 0.15;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getServiceCharge();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-sans text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!bedId && isQRContext) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF9]">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-6xl font-light text-stone-900 mb-4 leading-none tracking-tighter">Welcome to {venueData?.name || 'Beach Club'}</h1>
          <p className="text-stone-600 text-lg font-normal leading-relaxed">Please scan your sunbed QR code to order</p>
        </div>
      </div>
    );
  }

  // MENU SCREEN - LUXURY DESIGN SYSTEM
  if (currentScreen === 'menu') {
    return (
      <div className="bg-[#FAFAF9] text-stone-900 min-h-screen font-sans antialiased pb-32">
        {/* 🪩 VENUE JAIL: "Plan Tonight" Banner - The Psychological Upsell */}
        {isQRContext && showPlanTonightBanner && tonightEvents.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="max-w-md mx-auto px-6 py-4">
              <button
                onClick={handlePlanTonightClick}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪩</span>
                  <div className="text-left">
                    <p className="font-serif text-lg font-light">PLAN TONIGHT</p>
                    <p className="font-sans text-sm opacity-90">See {tonightEvents.length} VIP Events</p>
                  </div>
                </div>
                <MaterialIcon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Header with Hero Image */}
        <header className={`relative w-full h-64 md:h-80 ${showPlanTonightBanner ? 'mt-20' : ''}`}>
          <img 
            alt={`${venueData?.name || 'Beach Club'} luxury atmosphere`} 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center"
          />
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
            <button className="w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>
            <div className="flex-1 mx-4 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <MaterialIcon name="search" className="text-stone-500 text-lg" />
              </div>
              <input 
                className="w-full bg-white/90 backdrop-blur-sm border border-white/20 rounded-full text-stone-900 py-3 pl-12 pr-4 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900/30 text-sm font-sans shadow-[0_8px_30px_rgba(0,0,0,0.12)]" 
                placeholder="Search menu" 
                type="text"
              />
            </div>
            <button className="w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <MaterialIcon name="favorite_border" className="text-xl" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAFAF9] to-transparent"></div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] border border-stone-200/40 flex items-center justify-center z-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
            <span className="font-serif text-2xl font-light tracking-tight text-stone-900">
              {venueData?.name?.substring(0, 4).toUpperCase() || 'CLUB'}
            </span>
          </div>
        </header>

        {/* Venue Info Section */}
        <section className="px-6 pt-16 pb-8 text-center border-b border-stone-200/40">
          <h1 className="font-serif text-6xl font-light mb-4 tracking-tighter text-stone-900 leading-none">
            {venueData?.name || 'Beach Club'}
          </h1>
          <div className="flex flex-wrap items-center justify-center text-sm text-stone-500 gap-x-4 gap-y-2 mb-6 font-sans uppercase tracking-widest">
            <span className="flex items-center">
              <MaterialIcon name="star" className="text-sm mr-2 text-amber-900" filled />
              {venueData?.rating || '4.8'}
            </span>
            <span>•</span>
            <span>Open until {venueData?.closingTime || '23:00'}</span>
            <span>•</span>
            <span>Min. <span className="text-amber-900">€{venueData?.minimumOrder || '15.00'}</span></span>
          </div>
          
          {sunbedName && (
            <div className="flex items-center gap-3 mt-6 max-w-sm mx-auto">
              <div className="flex-1 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] border border-stone-200/40 flex items-center justify-between px-6 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-center text-sm font-medium text-stone-700 uppercase tracking-widest">
                  <MaterialIcon name="bed" className="text-amber-900 mr-3 text-lg" />
                  {isQRContext ? `Unit ${sunbedName}` : `Sunbed ${sunbedName}`}
                </div>
                <MaterialIcon name="expand_more" className="text-stone-400 text-lg" />
              </div>
            </div>
          )}

          {/* Live Vibe Widget - Luxury Style */}
          <div className="mt-8 max-w-sm mx-auto">
            <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-6 border border-stone-200/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-900 to-amber-800 rounded-full flex items-center justify-center shrink-0 z-10 shadow-[0_8px_30px_rgba(146,64,14,0.3)]">
                <MaterialIcon name="local_fire_department" className="text-white text-2xl" />
              </div>
              <div className="absolute top-6 right-6 z-10">
                <div className="text-right">
                  <p className="text-stone-900 text-sm font-medium uppercase tracking-widest mb-1">
                    {venueData?.name || 'Beach Club'} Vibe Tonight
                  </p>
                  <p className="text-amber-900 font-serif text-2xl font-normal">
                    {liveVibeScore}% Positive
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {!isDigitalOrderingEnabled && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-6 border border-stone-200/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <p className="text-stone-600 font-sans text-sm leading-relaxed">
                  <span className="font-medium text-stone-900">Menu Catalog</span><br/>
                  Please order with your waiter
                </p>
              </div>
            </div>
          )}
        </section>
        {/* Category Navigation - Luxury Style */}
        <div className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-sm py-8 border-b border-stone-200/40">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 w-full items-center justify-start md:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 font-sans text-sm uppercase tracking-widest transition-all duration-500 ease-out ${
                  activeCategory === category
                    ? 'text-stone-900 border-b-2 border-stone-900 pb-2'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items - Luxury Cards */}
        <main className="max-w-4xl mx-auto px-6 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {filteredItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                addToCart={addToCart}
                cart={cart}
                updateQuantity={updateQuantity}
                isDigitalOrderingEnabled={isDigitalOrderingEnabled}
              />
            ))}
          </div>
        </main>

        {/* Floating Cart Button - Luxury Style */}
        {cart.length > 0 && isDigitalOrderingEnabled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-6 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9] to-transparent"
          >
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setCurrentScreen('checkout')}
                className="w-full bg-stone-900 text-stone-50 font-sans text-lg py-5 px-8 rounded-full flex items-center justify-between shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] hover:bg-stone-800 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="font-medium uppercase tracking-wide">View Order</span>
                <span className="text-sm uppercase tracking-widest opacity-90">
                  {getTotalItems()} Item{getTotalItems() !== 1 ? 's' : ''}
                </span>
                <span className="font-serif text-xl text-amber-200">€{getCartTotal().toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Navigation Tabs - Luxury Style with Venue Jail Logic */}
        <div className={`fixed ${cart.length > 0 && isDigitalOrderingEnabled ? 'bottom-28' : 'bottom-0'} left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-t border-stone-200/40`}>
          <div className="max-w-md mx-auto flex items-center justify-around py-4">
            <button className="flex flex-col items-center gap-2 text-amber-900">
              <MaterialIcon name="restaurant_menu" className="text-2xl" filled />
              <span className="text-xs uppercase tracking-widest font-sans font-medium">Menu</span>
            </button>
            
            {/* 🛡️ VENUE JAIL: Hide competitor venues, show "Tonight" instead */}
            {isQRContext ? (
              <button 
                onClick={handlePlanTonightClick}
                className="flex flex-col items-center gap-2 text-stone-500 hover:text-amber-900 transition-colors"
              >
                <MaterialIcon name="nightlife" className="text-2xl" />
                <span className="text-xs uppercase tracking-widest font-sans font-medium">Tonight</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowReservationModal(true)}
                className="flex flex-col items-center gap-2 text-stone-500 hover:text-amber-900 transition-colors"
              >
                <MaterialIcon name="event" className="text-2xl" />
                <span className="text-xs uppercase tracking-widest font-sans font-medium">Book Table</span>
              </button>
            )}
            
            <button 
              onClick={() => setCurrentScreen('feedback')}
              className="flex flex-col items-center gap-2 text-stone-500 hover:text-amber-900 transition-colors"
            >
              <MaterialIcon name="star" className="text-2xl" />
              <span className="text-xs uppercase tracking-widest font-sans font-medium">Review</span>
            </button>
            
            {/* 🛡️ VENUE JAIL: Add concierge for QR users */}
            {isQRContext && (
              <button className="flex flex-col items-center gap-2 text-stone-500 hover:text-amber-900 transition-colors">
                <MaterialIcon name="concierge_bell" className="text-2xl" />
                <span className="text-xs uppercase tracking-widest font-sans font-medium">Concierge</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom CSS for luxury styling */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
            
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            
            .font-serif {
              font-family: 'Cormorant Garamond', serif;
            }
            
            .font-sans {
              font-family: 'Inter', sans-serif;
            }
          `
        }} />
      </div>
    );
  }

  return null;
}