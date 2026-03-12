import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vibeApi } from '../services/vibeApi';
import { API_CONFIG } from '../services/apiConfig';

const API_URL = API_CONFIG.BASE_URL;

// Get venue ID from URL params or lookup from bedId/unitId
const getVenueId = async (bedId) => {
  // First check if venueId is directly provided
  const urlParams = new URLSearchParams(window.location.search);
  const directVenueId = urlParams.get('venueId') || urlParams.get('v');
  
  if (directVenueId) {
    return parseInt(directVenueId);
  }
  
  // If no direct venueId but we have bedId, we need to lookup the venue
  if (bedId) {
    console.log('🔍 Looking up venue for bedId:', bedId);
    
    try {
      // PRODUCTION TODO: Implement proper venue lookup API
      // This should be replaced with an API call like:
      // const response = await fetch(`${API_CONFIG.BASE_URL}/public/Units/lookup?unitCode=${bedId}`);
      // if (response.ok) {
      //   const data = await response.json();
      //   return data.venueId;
      // }
      
      // TEMPORARY: Try to determine venue from bedId pattern
      // This is a temporary solution until proper API is implemented
      if (typeof bedId === 'string') {
        // If bedId contains letters (like A1, B2), it might be a zone-based system
        if (/^[A-Z]\d+$/i.test(bedId)) {
          console.log('🏖️ Detected zone-based bedId pattern:', bedId);
          // For now, assume all zone-based IDs are venue 1
          return 1;
        }
        
        // If bedId is purely numeric, try to parse it
        const numericBedId = parseInt(bedId);
        if (!isNaN(numericBedId)) {
          // TEMPORARY: Assume venue 1 for all numeric bed IDs
          // In production, this should be a proper database lookup
          console.log('🔢 Detected numeric bedId:', numericBedId);
          return 1;
        }
      }
      
      // Fallback for any other bedId format
      console.warn('⚠️ Unknown bedId format, defaulting to venue 1:', bedId);
      return 1;
      
    } catch (error) {
      console.error('Error looking up venue from bedId:', error);
      return 1; // Fallback
    }
  }
  
  // Final fallback - no bedId provided
  console.warn('⚠️ No bedId or venueId provided, defaulting to venue 1');
  return 1;
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

// Menu Item Component
function MenuItem({ item, addToCart, cart, updateQuantity, isDigitalOrderingEnabled }) {
  const cartItem = cart.find(cartItem => cartItem.id === item.id);
  const isInCart = !!cartItem;

  return (
    <article className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-[4/5] mb-8">
        {isInCart && isDigitalOrderingEnabled && (
          <div className="absolute top-4 right-4 z-10 bg-black text-white rounded-full p-1 opacity-100 transition-opacity duration-300">
            <MaterialIcon name="check" className="text-[16px]" />
          </div>
        )}
        <div className="w-full h-full overflow-hidden shadow-sm border border-transparent transition-all duration-300">
          <img
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            src={item.imageUrl}
          />
        </div>
      </div>
      <div className="w-full px-2">
        <div className="flex flex-col items-center gap-2 mb-4">
          <h3 className="font-serif text-3xl text-black leading-tight">{item.name}</h3>
          <span className="font-serif text-xl text-black">€{item.basePrice.toFixed(2)}</span>
        </div>
        <p className="font-sans text-sm text-black/60 leading-relaxed font-light max-w-[90%] mx-auto mb-8">
          {item.description}
        </p>
        
        {/* Conditional rendering based on digital ordering enabled */}
        {isDigitalOrderingEnabled ? (
          <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mx-auto">
            {isInCart ? (
              <>
                <div className="flex items-center gap-3 border border-black/10 px-3 py-2 bg-white">
                  <button 
                    onClick={() => updateQuantity(item.id, 'decrease')}
                    className="text-black hover:opacity-60 transition-opacity flex items-center"
                  >
                    <MaterialIcon name="remove" className="text-[16px]" />
                  </button>
                  <span className="font-serif text-base min-w-[1ch] text-center w-4">{cartItem.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 'increase')}
                    className="text-black hover:opacity-60 transition-opacity flex items-center"
                  >
                    <MaterialIcon name="add" className="text-[16px]" />
                  </button>
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  className="flex-1 bg-black text-white font-serif text-sm uppercase tracking-widest py-3 px-4 hover:bg-black/80 transition-colors duration-300"
                >
                  Add
                </button>
              </>
            ) : (
              <button
                onClick={() => addToCart(item)}
                className="flex-1 bg-black text-white font-serif text-sm uppercase tracking-widest py-3 px-8 hover:bg-black/80 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <span>Add to Order</span>
              </button>
            )}
          </div>
        ) : (
          // View-only mode - no ordering controls
          <div className="flex items-center justify-center w-full max-w-[280px] mx-auto">
            <div className="text-center py-3 px-8 border border-stone-300/60 bg-stone-50/30 text-stone-600 font-serif text-sm uppercase tracking-widest">
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
  const [loading, setLoading] = useState(false); // Start with false for instant load
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
  const [primaryColor, setPrimaryColor] = useState('#10FF88');
  const [categories, setCategories] = useState(['All Items', 'Cocktails', 'Food', 'Wine']);
  
  // Vibe Poll System State
  const [liveVibeScore, setLiveVibeScore] = useState(92); // Live vibe percentage
  const [showVibePoll, setShowVibePoll] = useState(false);
  const [vibeResponse, setVibeResponse] = useState(null); // 'dead', 'okay', 'elite'
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
          
          // TODO: Replace with actual API when implemented
          // const response = await fetch(`${API_URL}/public/Units/${bedId}/hierarchy`);
          // if (response.ok) {
          //   const hierarchy = await response.json();
          //   setVenueHierarchy(hierarchy);
          //   VENUE_ID = hierarchy.venueId;
          // }
          
          // TEMPORARY: Use existing venue lookup
          VENUE_ID = await getVenueId(bedId);
          
          // Set temporary hierarchy for demo
          setVenueHierarchy({
            unitId: bedId,
            unitName: `Unit ${bedId}`,
            zoneId: 1,
            zoneName: 'Beach Zone',
            venueId: VENUE_ID,
            venueName: 'Current Venue',
            businessId: 1,
            businessName: 'Riviera Hospitality'
          });
          
          console.log('🏨 Venue hierarchy loaded:', venueHierarchy);
          
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
          VENUE_ID = await getVenueId(bedId);
        }
      } else {
        // REGULAR BROWSE MODE: No restrictions
        console.log('🌐 Regular browse mode - no venue jail restrictions');
        VENUE_ID = await getVenueId(bedId);
      }
      
      // Load venue data with the correct venue ID
      fetchVenueData();
    };
    
    initializeVenueJail();
    
    // Add Material Symbols font if not already present
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [bedId, isQRContext]);

  const fetchVenueData = async () => {
    // Set loading to false immediately and load data in background
    setLoading(false);
    
    // Set bedId immediately if provided
    if (bedId) {
      setSunbedName(bedId);
      setSunbedNumber(bedId);
    }
    
    // Default to enabled for fast loading
    setIsDigitalOrderingEnabled(true);
    
    try {
      // Fetch venue details with timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const venueResponse = await fetch(`${API_URL}/public/Venues/${VENUE_ID}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (venueResponse.ok) {
          const venue = await venueResponse.json();
          setVenueData(venue);
          setIsDigitalOrderingEnabled(venue.isDigitalOrderingEnabled ?? true);
          
          // Update dynamic configuration from venue data
          if (venue.vibeConfig) {
            setVibeConfig({
              whatsappNumber: venue.vibeConfig.whatsappNumber || '355691234567',
              googleBusinessId: venue.vibeConfig.googleBusinessId || 'YOUR_GOOGLE_BUSINESS_ID',
              pollDelayMs: venue.vibeConfig.pollDelayMs || 3000
            });
          }
          
          // Update primary color from venue branding
          if (venue.branding?.primaryColor) {
            setPrimaryColor(venue.branding.primaryColor);
          }
          
          console.log('🏨 Venue data loaded:', venue);
        } else {
          console.log('Venue endpoint returned:', venueResponse.status);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.log('Venue API call timed out - using defaults');
        } else {
          console.error('Error fetching venue details:', err);
        }
      }

      // Fetch menu items from API
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
          
          // Extract categories from menu items
          const uniqueCategories = ['All Items', ...new Set(menuData.items?.map(item => item.categoryName) || [])];
          setCategories(uniqueCategories);
          
          console.log('🍽️ Menu data loaded:', menuData);
        } else {
          console.log('Menu endpoint returned:', menuResponse.status, '- using fallback menu');
          // Fallback menu items
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
        if (err.name === 'AbortError') {
          console.log('Menu API call timed out - using fallback');
        } else {
          console.error('Error fetching menu:', err);
        }
        // Fallback menu items
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
    return getCartTotal() * 0.15; // 15% service charge
  };

  const getFinalTotal = () => {
    return getCartTotal() + getServiceCharge();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      // For now, we'll use a simplified approach since the Discovery endpoint doesn't exist
      // We'll use the bedId directly or a default unit ID
      let unitId = null;
      
      if (bedId) {
        // Try to parse bedId as a number, or use a default mapping
        if (/^\d+$/.test(bedId)) {
          unitId = parseInt(bedId);
        } else {
          // For alphanumeric bedIds like A1, B2, etc., we'll use a simple mapping
          // This should be replaced with actual unit lookup when the proper endpoint is available
          const bedMapping = {
            'A1': 1, 'A2': 2, 'A3': 3, 'A4': 4, 'A5': 5,
            'B1': 6, 'B2': 7, 'B3': 8, 'B4': 9, 'B5': 10,
            'C1': 11, 'C2': 12, 'C3': 13, 'C4': 14, 'C5': 15
          };
          unitId = bedMapping[bedId] || 1; // Default to unit 1 if not found
        }
      } else {
        unitId = 1; // Default unit ID
      }

      console.log(`🛏️ Using unit ID ${unitId} for bedId: ${bedId}`);

      const response = await fetch(`${API_URL}/Orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: unitId,
          waiterId: null, // QR code order - no waiter
          venueId: VENUE_ID,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      if (response.ok) {
        setCurrentScreen('confirmation');
        // Show vibe poll after configured delay (the psychological ambush window)
        setTimeout(() => {
          setShowVibePoll(true);
        }, vibeConfig.pollDelayMs);
      } else {
        console.error('Order failed:', response.status, response.statusText);
        // For demo purposes, still show confirmation even if order fails
        setCurrentScreen('confirmation');
        setTimeout(() => {
          setShowVibePoll(true);
        }, vibeConfig.pollDelayMs);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // For demo purposes, still show confirmation even if there's an error
      setCurrentScreen('confirmation');
      setTimeout(() => {
        setShowVibePoll(true);
      }, vibeConfig.pollDelayMs);
    }
  };

  const resetToMenu = () => {
    setCart([]);
    setCurrentScreen('menu');
    setRating(0);
    setFeedbackNote('');
    setSpecialInstructions('');
    // Reset vibe poll state
    setShowVibePoll(false);
    setVibeResponse(null);
    setShowComplaintBox(false);
    setShowGoogleReview(false);
    setComplaintText('');
    setVibeSubmitting(false);
  };

  // Vibe Poll Functions
  const handleVibeResponse = async (response) => {
    setVibeResponse(response);
    setVibeSubmitting(true);

    try {
      if (response === 'elite') {
        // Positive feedback - route to Google Reviews
        setShowGoogleReview(true);
        // Update live vibe score
        setLiveVibeScore(prev => Math.min(prev + 1, 100));
        
        // Submit positive feedback to backend using vibeApi
        await vibeApi.submitFeedback({
          venueId: VENUE_ID,
          rating: vibeApi.mapVibeToRating(response),
          comment: vibeApi.getVibeComment(response),
          unitCode: sunbedNumber
        });
      } else {
        // Negative/neutral feedback - show complaint box
        setShowComplaintBox(true);
      }
    } catch (error) {
      console.error('Error submitting vibe feedback:', error);
    } finally {
      setVibeSubmitting(false);
    }
  };

  const submitComplaint = async () => {
    if (!complaintText.trim()) return;
    
    setVibeSubmitting(true);
    
    try {
      // Submit negative feedback to backend using vibeApi
      await vibeApi.submitFeedback({
        venueId: VENUE_ID,
        rating: vibeApi.mapVibeToRating(vibeResponse),
        comment: complaintText,
        unitCode: sunbedNumber
      });

      // Generate WhatsApp URL and open
      const whatsappUrl = vibeApi.generateWhatsAppUrl(
        vibeConfig.whatsappNumber,
        complaintText,
        sunbedNumber
      );
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Close complaint box
      setShowComplaintBox(false);
      setShowVibePoll(false);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setVibeSubmitting(false);
    }
  };

  const redirectToGoogleReviews = () => {
    // Generate Google Reviews URL
    const googleReviewsUrl = vibeApi.generateGoogleReviewsUrl(vibeConfig.googleBusinessId);
    window.open(googleReviewsUrl, '_blank');
    setShowGoogleReview(false);
    setShowVibePoll(false);
  };

  const handleReservationSubmit = async () => {
    if (!reservationForm.guestName || !reservationForm.guestPhone) {
      return;
    }

    setReservationSubmitting(true);
    
    // Simulate API call - replace with actual API when ready
    setTimeout(() => {
      setReservationSubmitting(false);
      setReservationSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowReservationModal(false);
        setReservationSuccess(false);
        setReservationForm({
          guestName: '',
          guestPhone: '',
          guestCount: 2,
          date: new Date().toISOString().split('T')[0],
          time: '19:00',
          notes: ''
        });
      }, 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-sans text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!bedId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFBF7]">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-4xl text-black mb-4 leading-tight">Welcome to {venueData?.name || 'Beach Club'}</h1>
          <p className="text-stone-600 text-lg font-light">Please scan your sunbed QR code to order</p>
        </div>
      </div>
    );
  }

  // MENU SCREEN
  if (currentScreen === 'menu') {
    return (
      <div 
        className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased pb-32"
        style={{
          '--primary-color': primaryColor,
          '--primary-glow': `0 0 12px ${primaryColor}40`,
          '--primary-shadow': `0 0 12px ${primaryColor}40`
        }}
      >
        {/* Header with Hero Image */}
        <header className="relative w-full h-64 md:h-80">
          <img 
            alt={`${venueData?.name || 'Beach Club'} luxury atmosphere`} 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8WwQlTWCp-ILL2b_lkfUnaiP9s_hGxRZsn-2CAzXztNWkQieRJmoqS9akLFXLBRdX9c-jJQvaQuspeWk-ZnDGKwbZd7oXDHdUC3Xc8brjUZUdR8EBjcl4JbBvFNaV_FOvpawMlgzQ3ltJuJMqHjuTtHWlJLb5BlcrqOBl6LifJGu4Gu1VrjRpVC9Cwy5i5-cQIPBxiikNRKM23KeJIhy24G1nxGJS9ap35lyt4gXPVxgbu8fU8m3QxqQeB93tuvMcrHvuAGIa_I5r"
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
            <button className="w-10 h-10 bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-white">
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>
            <div className="flex-1 mx-3 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MaterialIcon name="search" className="text-zinc-400 text-lg" />
              </div>
              <input 
                className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 py-2 pl-10 pr-4 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono" 
                placeholder="SEARCH MENU" 
                type="text"
              />
            </div>
            <button className="w-10 h-10 bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-white">
              <MaterialIcon name="favorite_border" className="text-xl" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent"></div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center z-20">
            <span className="font-display font-bold text-2xl tracking-widest text-white">
              {venueData?.name?.substring(0, 4).toUpperCase() || 'CLUB'}
            </span>
          </div>
        </header>

        {/* Venue Info Section */}
        <section className="px-4 pt-14 pb-6 text-center border-b border-zinc-800">
          <h1 className="font-display text-3xl font-bold mb-2 tracking-tight text-white uppercase">
            {venueData?.name || 'Beach Club'}
          </h1>
          <div className="flex flex-wrap items-center justify-center text-xs text-zinc-400 gap-x-3 gap-y-1 mb-4 font-mono uppercase tracking-wider">
            <span className="flex items-center">
              <MaterialIcon name="star" className="text-sm mr-1 text-primary" filled />
              {venueData?.rating || '4.8'}
            </span>
            <span>•</span>
            <span>Open until {venueData?.closingTime || '23:00'}</span>
            <span>•</span>
            <span>Min. <span className="text-primary">€{venueData?.minimumOrder || '15.00'}</span></span>
          </div>
          
          {sunbedName && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 bg-zinc-900 border border-zinc-800 flex items-center justify-between px-4 py-3">
                <div className="flex items-center text-sm font-medium text-zinc-200 uppercase tracking-wide">
                  <MaterialIcon name="bed" className="text-primary mr-2 text-lg" />
                  Sunbed {sunbedName}
                </div>
                <MaterialIcon name="expand_more" className="text-zinc-500 text-lg" />
              </div>
            </div>
          )}

          {/* Live Vibe Widget - Industrial Style */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 z-10" style={{filter: 'drop-shadow(0 0 12px rgba(16, 255, 136, 0.4))'}}>
                <MaterialIcon name="local_fire_department" className="text-primary text-2xl" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}} />
              </div>
              <div className="absolute top-4 right-4 z-10">
                <div className="text-right">
                  <p className="text-white text-sm font-bold uppercase tracking-wide mb-1">
                    {venueData?.name || 'Beach Club'} Vibe Tonight
                  </p>
                  <p className="text-primary font-mono text-lg font-bold" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}}>
                    {liveVibeScore}% Positive
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {!isDigitalOrderingEnabled && (
            <div className="mt-6 max-w-sm mx-auto">
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <p className="text-zinc-400 font-mono text-sm leading-relaxed">
                  <span className="font-medium text-white">Menu Catalog</span><br/>
                  Please order with your waiter
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Category Navigation - Industrial Style */}
        <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm py-6 border-b border-zinc-800">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 w-full items-center justify-start md:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 font-mono text-sm uppercase tracking-widest transition-colors ${
                  activeCategory === category
                    ? 'text-primary border-b-2 border-primary pb-1 hover:opacity-70'
                    : 'text-zinc-400 hover:text-white'
                }`}
                style={activeCategory === category ? {textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'} : {}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items - Industrial Cards */}
        <main className="max-w-md mx-auto px-6 pt-12">
          <div className="flex flex-col gap-24">
            {filteredItems.map((item) => (
              <article key={item.id} className="group flex flex-col items-center text-center">
                <div className="relative w-full aspect-[4/5] mb-8">
                  {cart.find(cartItem => cartItem.id === item.id) && isDigitalOrderingEnabled && (
                    <div className="absolute top-4 right-4 z-10 bg-zinc-950 text-primary border border-zinc-800 p-1 opacity-100 transition-opacity duration-300" style={{filter: 'drop-shadow(0 0 12px rgba(16, 255, 136, 0.4))'}}>
                      <MaterialIcon name="check" className="text-base" />
                    </div>
                  )}
                  <div className="w-full h-full overflow-hidden border border-zinc-800 transition-all duration-300 bg-zinc-900">
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 contrast-125 saturate-150"
                      src={item.imageUrl}
                    />
                  </div>
                </div>
                <div className="w-full px-2">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <h3 className="font-display text-3xl text-white leading-tight uppercase tracking-wide">{item.name}</h3>
                    <span className="font-mono text-xl text-primary font-bold" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}}>€{item.basePrice.toFixed(2)}</span>
                  </div>
                  <p className="font-mono text-sm text-zinc-400 leading-relaxed font-light max-w-[90%] mx-auto mb-8">
                    {item.description}
                  </p>
                  
                  {/* Conditional rendering based on digital ordering enabled */}
                  {isDigitalOrderingEnabled ? (
                    <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mx-auto">
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <>
                          <div className="flex items-center gap-3 border border-zinc-800 px-3 py-2 bg-zinc-900">
                            <button 
                              onClick={() => updateQuantity(item.id, 'decrease')}
                              className="text-white hover:text-primary transition-colors flex items-center"
                            >
                              <MaterialIcon name="remove" className="text-base" />
                            </button>
                            <span className="font-mono text-base min-w-[1ch] text-center w-4 text-white">{cart.find(cartItem => cartItem.id === item.id).quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 'increase')}
                              className="text-white hover:text-primary transition-colors flex items-center"
                            >
                              <MaterialIcon name="add" className="text-base" />
                            </button>
                          </div>
                          <button 
                            onClick={() => addToCart(item)}
                            className="flex-1 bg-zinc-950 text-white font-mono text-sm uppercase tracking-widest py-3 px-4 hover:bg-zinc-900 hover:text-primary transition-colors duration-300 border border-zinc-800"
                          >
                            Add
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 bg-zinc-950 text-white font-mono text-sm uppercase tracking-widest py-3 px-8 hover:bg-zinc-900 hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2 border border-zinc-800"
                        >
                          <MaterialIcon name="add" className="text-base" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    // View-only mode - no ordering controls
                    <div className="flex items-center justify-center w-full max-w-[280px] mx-auto">
                      <div className="text-center py-3 px-8 border border-zinc-800 bg-zinc-900 text-zinc-400 font-mono text-sm uppercase tracking-widest">
                        View Only
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Floating Cart Button - Industrial Style */}
        {cart.length > 0 && isDigitalOrderingEnabled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent"
          >
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setCurrentScreen('checkout')}
                className="w-full bg-zinc-950 text-white font-mono text-lg py-4 px-6 flex items-center justify-between border border-zinc-800 hover:bg-zinc-900 hover:text-primary transition-colors"
                style={{filter: 'drop-shadow(0 0 12px rgba(16, 255, 136, 0.2))'}}
              >
                <span className="font-medium uppercase tracking-wide">View Order</span>
                <span className="text-sm uppercase tracking-widest opacity-80">
                  {getTotalItems()} Item{getTotalItems() !== 1 ? 's' : ''}
                </span>
                <span className="font-bold text-primary" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}}>€{getCartTotal().toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Navigation Tabs - Industrial Style */}
        <div className={`fixed ${cart.length > 0 && isDigitalOrderingEnabled ? 'bottom-28' : 'bottom-0'} left-0 w-full z-40 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800`}>
          <div className="max-w-md mx-auto flex items-center justify-around py-3">
            <button className="flex flex-col items-center gap-1 text-primary" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}}>
              <MaterialIcon name="restaurant_menu" className="text-2xl" filled />
              <span className="text-xs uppercase tracking-wider font-mono">Menu</span>
            </button>
            <button 
              onClick={() => setShowReservationModal(true)}
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-primary transition-colors"
            >
              <MaterialIcon name="event" className="text-2xl" />
              <span className="text-xs uppercase tracking-wider font-mono">Book Table</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('feedback')}
              className="flex flex-col items-center gap-1 text-zinc-400 hover:text-primary transition-colors"
            >
              <MaterialIcon name="star" className="text-2xl" />
              <span className="text-xs uppercase tracking-wider font-mono">Review</span>
            </button>
          </div>
        </div>

        {/* Reservation Modal */}
        {showReservationModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
              onClick={() => !reservationSubmitting && setShowReservationModal(false)}
            ></div>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-[480px] bg-[#FAFAF9] rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] overflow-hidden"
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-stone-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-2 pb-6 border-b border-stone-200/40">
                <h2 className="font-serif text-2xl text-stone-900 tracking-tight">Reserve a Table</h2>
                <button 
                  onClick={() => !reservationSubmitting && setShowReservationModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                  disabled={reservationSubmitting}
                >
                  <MaterialIcon name="close" className="text-2xl" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                {reservationSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                      <MaterialIcon name="check_circle" className="text-5xl text-emerald-600" filled />
                    </div>
                    <h3 className="font-serif text-2xl text-stone-900 mb-2">Reservation Sent!</h3>
                    <p className="text-stone-600">Our team will contact you shortly to confirm</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Name *</label>
                      <input
                        type="text"
                        value={reservationForm.guestName}
                        onChange={(e) => setReservationForm({ ...reservationForm, guestName: e.target.value })}
                        className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                        placeholder="Your name"
                        disabled={reservationSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={reservationForm.guestPhone}
                        onChange={(e) => setReservationForm({ ...reservationForm, guestPhone: e.target.value })}
                        className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                        placeholder="+1234567890"
                        disabled={reservationSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Date</label>
                        <input
                          type="date"
                          value={reservationForm.date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                          className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                          disabled={reservationSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Time</label>
                        <input
                          type="time"
                          value={reservationForm.time}
                          onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })}
                          className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                          disabled={reservationSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Guests</label>
                      <select
                        value={reservationForm.guestCount}
                        onChange={(e) => setReservationForm({ ...reservationForm, guestCount: parseInt(e.target.value) })}
                        className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                        disabled={reservationSubmitting}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Special Requests</label>
                      <textarea
                        value={reservationForm.notes}
                        onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                        className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors resize-none h-24"
                        placeholder="Allergies, preferences, or special occasions..."
                        disabled={reservationSubmitting}
                      />
                    </div>

                    <button
                      onClick={handleReservationSubmit}
                      disabled={!reservationForm.guestName || !reservationForm.guestPhone || reservationSubmitting}
                      className="w-full bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                      {reservationSubmitting ? 'Sending...' : 'Request Reservation'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom CSS for dynamic primary color and hiding scrollbar */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .text-primary {
              color: ${primaryColor} !important;
            }
            .border-primary {
              border-color: ${primaryColor} !important;
            }
            .bg-primary {
              background-color: ${primaryColor} !important;
            }
            .focus\\:ring-primary:focus {
              --tw-ring-color: ${primaryColor} !important;
            }
            .focus\\:border-primary:focus {
              border-color: ${primaryColor} !important;
            }
            .hover\\:text-primary:hover {
              color: ${primaryColor} !important;
            }
            .selection\\:bg-primary::selection {
              background-color: ${primaryColor} !important;
            }
          `
        }} />
      </div>
    );
  }

  // CHECKOUT SCREEN
  if (currentScreen === 'checkout') {
    return (
      <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased overflow-hidden">
        {/* Background blur */}
        <div className="opacity-30 pointer-events-none filter blur-[2px] transition-all duration-500">
          <header className="relative w-full h-64 md:h-80">
            <img 
              alt={`${venueData?.name || 'Beach Club'} luxury atmosphere`} 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8WwQlTWCp-ILL2b_lkfUnaiP9s_hGxRZsn-2CAzXztNWkQieRJmoqS9akLFXLBRdX9c-jJQvaQuspeWk-ZnDGKwbZd7oXDHdUC3Xc8brjUZUdR8EBjcl4JbBvFNaV_FOvpawMlgzQ3ltJuJMqHjuTtHWlJLb5BlcrqOBl6LifJGu4Gu1VrjRpVC9Cwy5i5-cQIPBxiikNRKM23KeJIhy24G1nxGJS9ap35lyt4gXPVxgbu8fU8m3QxqQeB93tuvMcrHvuAGIa_I5r"
            />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center z-20">
              <span className="font-display font-bold text-2xl tracking-widest text-white">
                {venueData?.name?.substring(0, 4).toUpperCase() || 'CLUB'}
              </span>
            </div>
          </header>
          <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm py-6 border-b border-zinc-800">
            <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 w-full items-center justify-start md:justify-center">
              <button className="flex-shrink-0 text-primary font-mono text-sm uppercase tracking-widest border-b-2 border-primary pb-1" style={{textShadow: '0 0 12px rgba(16, 255, 136, 0.4)'}}>All Items</button>
              <button className="flex-shrink-0 text-zinc-400 font-mono text-sm uppercase tracking-widest">Cocktails</button>
              <button className="flex-shrink-0 text-zinc-400 font-mono text-sm uppercase tracking-widest">Food</button>
              <button className="flex-shrink-0 text-zinc-400 font-mono text-sm uppercase tracking-widest">Wine</button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-end justify-center isolate">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setCurrentScreen('menu')}
          ></div>
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="relative w-full max-w-[480px] h-[92vh] bg-zinc-950 border-t border-zinc-800 flex flex-col overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="w-full flex justify-center pt-4 pb-2 bg-zinc-950">
              <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-8 pt-2 pb-6 border-b border-zinc-800 bg-zinc-950">
              <h2 className="font-display text-3xl text-white tracking-tight uppercase">Your Order</h2>
              <button 
                onClick={() => setCurrentScreen('menu')}
                className="w-10 h-10 -mr-2 flex items-center justify-center hover:bg-zinc-900 transition-colors text-white border border-zinc-800"
              >
                <MaterialIcon name="close" className="text-2xl font-light" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#FDFBF7]">
              <div className="px-8 py-8 space-y-10">
                {/* Cart Items */}
                <div className="space-y-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-5 items-start group">
                      <div className="w-20 aspect-[4/5] bg-gray-100 flex-shrink-0 overflow-hidden relative shadow-sm rounded-sm">
                        <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl}/>
                      </div>
                      <div className="flex-1 min-w-0 pt-1 flex flex-col h-full justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl text-black leading-tight mb-1">{item.name}</h3>
                          <p className="font-sans text-sm text-black/60">
                            {item.category === 'cocktails' ? 'Classic' : item.category === 'food' ? 'Signature' : 'Premium'}
                          </p>
                        </div>
                        <div className="flex justify-between items-end w-full">
                          <span className="font-serif text-lg text-black">€{item.basePrice.toFixed(2)}</span>
                          <div className="flex items-center border border-black/10 px-2 py-1 gap-3 bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, 'decrease')}
                              className="text-[10px] p-1 hover:opacity-50"
                            >
                              <MaterialIcon name="remove" />
                            </button>
                            <span className="font-serif text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 'increase')}
                              className="text-[10px] p-1 hover:opacity-50"
                            >
                              <MaterialIcon name="add" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="pt-10 border-t border-black/5 space-y-8">
                  <div>
                    <label className="block font-serif text-xl text-black mb-3">Sunbed Number</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 font-serif text-xl text-black/40 group-focus-within:text-black transition-colors">#</span>
                      <input 
                        value={sunbedNumber}
                        onChange={(e) => setSunbedNumber(e.target.value)}
                        className="w-full bg-transparent border-b border-black/20 py-3 pl-6 font-sans text-lg focus:border-black focus:ring-0 rounded-none px-0 text-black placeholder-black/20 transition-colors" 
                        type="text"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-serif text-xl text-black mb-3">Special Instructions</label>
                    <textarea 
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full bg-white border border-black/10 p-4 font-sans text-sm text-black focus:border-black focus:ring-0 resize-none h-32 placeholder-black/40 rounded-sm leading-relaxed" 
                      placeholder="Allergies, preferences, or special requests..."
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="pt-4 pb-4 space-y-4">
                  <div className="flex justify-between text-black/60 font-sans text-sm uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span>€{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-black/60 font-sans text-sm uppercase tracking-wider">
                    <span>Service Charge</span>
                    <span>€{getServiceCharge().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-6 border-t border-black/10">
                    <span className="font-serif text-2xl text-black font-medium">Total</span>
                    <span className="font-serif text-3xl text-black">€{getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="p-6 bg-[#FDFBF7] border-t border-black/5 w-full pb-10">
              <button 
                onClick={placeOrder}
                className="w-full bg-black text-white py-5 flex items-center justify-between px-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-black/90 transition-all active:scale-[0.99]"
              >
                <span className="font-serif text-lg tracking-widest font-medium uppercase">Place Order</span>
                <span className="font-serif text-xl tracking-wide">€{getFinalTotal().toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // CONFIRMATION SCREEN
  if (currentScreen === 'confirmation') {
    return (
      <div className="bg-[#FDFBF7] text-black flex flex-col items-center justify-between p-8 font-sans antialiased relative overflow-hidden h-screen">
        <div className="flex-1"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center space-y-12"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-400/5 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-24 h-24 rounded-full border border-black/5 flex items-center justify-center bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] z-10 relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MaterialIcon name="check" className="text-5xl font-thin text-yellow-600" />
              </motion.div>
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl text-black leading-[1.15]">
              Order Sent<br/>to Bar
            </h1>
            <p className="font-sans text-black/60 text-sm leading-7 max-w-[280px] mx-auto font-light">
              Our team at <span className="italic font-serif">{venueData?.name || 'Beach Club'}</span> is preparing your selection. Estimated delivery to <span className="text-black font-medium">Sunbed #{sunbedNumber}</span> in 15 minutes.
            </p>
          </div>

          {/* Vibe Poll - The 3-Second Ambush */}
          {showVibePoll && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-6"
            >
              {!vibeResponse && !showComplaintBox && !showGoogleReview && (
                <>
                  <div className="space-y-4">
                    <p className="font-serif text-xl text-black/90 leading-tight">
                      Add to the live vibe.<br/>
                      How's the energy right now?
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleVibeResponse('dead')}
                      disabled={vibeSubmitting}
                      className="flex-1 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 disabled:opacity-50"
                    >
                      <div className="text-4xl mb-2">🥶</div>
                      <div className="font-serif text-lg text-stone-900">Dead</div>
                    </button>
                    
                    <button
                      onClick={() => handleVibeResponse('okay')}
                      disabled={vibeSubmitting}
                      className="flex-1 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 disabled:opacity-50"
                    >
                      <div className="text-4xl mb-2">🎵</div>
                      <div className="font-serif text-lg text-stone-900">Okay</div>
                    </button>
                    
                    <button
                      onClick={() => handleVibeResponse('elite')}
                      disabled={vibeSubmitting}
                      className="flex-1 bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 disabled:opacity-50"
                    >
                      <div className="text-4xl mb-2">🔥</div>
                      <div className="font-serif text-lg text-stone-900">Elite</div>
                    </button>
                  </div>
                </>
              )}

              {/* Complaint Box for Negative Feedback */}
              {showComplaintBox && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <p className="font-serif text-xl text-stone-900 leading-tight">
                      Damn. What's killing the vibe?
                    </p>
                    <p className="font-sans text-sm text-stone-600">
                      Music? Service? Drinks? Let us know privately.
                    </p>
                  </div>
                  
                  <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="Tell us what's wrong..."
                    className="w-full bg-white border border-stone-200/40 rounded-2xl p-4 font-sans text-sm text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors resize-none h-24"
                    disabled={vibeSubmitting}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowComplaintBox(false)}
                      className="flex-1 border border-stone-300 text-stone-700 px-6 py-3 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 text-sm tracking-widest uppercase"
                      disabled={vibeSubmitting}
                    >
                      Skip
                    </button>
                    <button
                      onClick={submitComplaint}
                      disabled={!complaintText.trim() || vibeSubmitting}
                      className="flex-1 bg-stone-900 text-stone-50 px-6 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 disabled:opacity-50"
                    >
                      {vibeSubmitting ? 'Sending...' : 'Send Privately'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Google Reviews Request for Positive Feedback */}
              {showGoogleReview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <MaterialIcon name="star" className="text-3xl text-emerald-600" filled />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="font-serif text-xl text-stone-900 leading-tight">
                      Glad you're feeling it! 🍻
                    </p>
                    <p className="font-sans text-sm text-stone-600 leading-relaxed">
                      We are trying to hit #1 in Tirana. Can you permanently stamp that vibe on Google for us?
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowGoogleReview(false)}
                      className="flex-1 border border-stone-300 text-stone-700 px-6 py-3 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 text-sm tracking-widest uppercase"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={redirectToGoogleReviews}
                      className="flex-1 bg-stone-900 text-stone-50 px-6 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
                    >
                      Drop 5 Stars on Google
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="w-full px-4 pt-4">
            <div className="flex justify-between items-end mb-3 px-1">
              <span className="font-serif text-lg text-black italic">Preparing...</span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-black/40">Step 1 of 3</span>
            </div>
            <div className="relative h-[2px] w-full bg-black/5 rounded-full overflow-hidden">
              <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white z-10"></div>
              <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white z-10"></div>
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: '33%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-0 left-0 h-full bg-black"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-black/30 font-medium">
              <motion.span 
                initial={{ color: 'rgb(0 0 0 / 0.3)' }}
                animate={{ color: 'rgb(0 0 0 / 1)' }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                Kitchen
              </motion.span>
              <span>On Way</span>
              <span>Delivered</span>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex-1 flex flex-col justify-end w-full max-w-sm pb-8 space-y-8"
        >
          <button 
            onClick={resetToMenu}
            className="w-full py-4 border border-black/10 bg-white text-black font-serif text-sm uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
          >
            Back to Menu
          </button>
          <a className="flex items-center justify-center gap-2 text-black/40 hover:text-black transition-colors duration-300 group" href="#">
            <MaterialIcon name="call" className="text-lg font-light group-hover:scale-110 transition-transform" />
            <span className="font-sans text-xs uppercase tracking-widest border-b border-transparent group-hover:border-black transition-all">Call Attendant</span>
          </a>
        </motion.div>
      </div>
    );
  }

  // FEEDBACK SCREEN
  if (currentScreen === 'feedback') {
    return (
      <div className="bg-[#FDFBF7] text-black flex flex-col items-center justify-between p-8 font-sans antialiased relative overflow-hidden min-h-screen">
        <div className="flex-1"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center space-y-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-400/5 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-20 h-20 rounded-full border border-black/5 flex items-center justify-center bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] z-10 relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MaterialIcon name="check" className="text-4xl font-thin text-yellow-600" />
              </motion.div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-black leading-[1.15]">
              Your Order<br/>is on the Way
            </h1>
            <p className="font-sans text-black/60 text-sm leading-6 max-w-[280px] mx-auto font-light">
              Our team at <span className="italic font-serif">La Reserve</span> is preparing your selection. Estimated delivery to <span className="text-black font-medium">Sunbed #{sunbedNumber}</span> in 15 minutes.
            </p>
          </div>
          <div className="w-full px-6 pt-2 pb-2 space-y-6">
            <div className="space-y-4">
              <p className="font-serif text-lg italic text-black/80">How was your experience today?</p>
              <div className="flex justify-center items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setRating(star)}
                    className="group focus:outline-none"
                  >
                    <MaterialIcon 
                      name="star" 
                      className={`text-3xl transition-all duration-300 ${
                        star <= rating ? 'text-yellow-600' : 'text-black/20 hover:text-yellow-600'
                      }`}
                      filled={star <= rating}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="relative pt-4 w-full max-w-[260px] mx-auto">
              <input 
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-black/20 text-center font-serif text-sm italic placeholder:text-black/30 placeholder:italic focus:ring-0 focus:border-black/60 transition-colors pb-2 px-0" 
                placeholder="Leave a note for the team..." 
                type="text"
              />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex-1 flex flex-col justify-end w-full max-w-sm pb-8 space-y-8"
        >
          <button 
            onClick={resetToMenu}
            className="w-full py-4 border border-black/10 bg-white text-black font-serif text-sm uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
          >
            Back to Menu
          </button>
          <a className="flex items-center justify-center gap-2 text-black/40 hover:text-black transition-colors duration-300 group" href="#">
            <MaterialIcon name="call" className="text-lg font-light group-hover:scale-110 transition-transform" />
            <span className="font-sans text-xs uppercase tracking-widest border-b border-transparent group-hover:border-black transition-all">Call Attendant</span>
          </a>
        </motion.div>
      </div>
    );
  }

  return null;
}
