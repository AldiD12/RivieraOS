import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Check, Star, LogOut } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useCartStore } from '../store/cartStore';
import whatsappLink from '../utils/whatsappLink';
import haptics from '../utils/haptics';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
// Bulletproof: strip trailing slashes + /api suffix, then always re-add /api
const baseUrl = API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

// Input sanitization utility
const sanitizeInput = (input) => {
  if (!input) return '';
  return String(input)
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .trim();
};

// Phone number validation (international format)
const isValidPhone = (phone) => {
  if (!phone) return false;
  // Allow +, digits, spaces, hyphens, parentheses
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Email validation
const isValidEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SpotPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, exitSession, enrichSession } = useAppStore();
  
  // 🪩 TIME-SHIFT: Detect night mode for venue-branded dark theme
  const isNightTime = new Date().getHours() >= 18 || new Date().getHours() < 6;
  const { setVenue: setCartVenue } = useCartStore();
  
  // URL parameters
  const venueId = searchParams.get('v');
  const zoneId = searchParams.get('z');
  const unitId = searchParams.get('u');

  // State
  const [venue, setVenue] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestCount: 2,
    notes: ''
  });

  useEffect(() => {
    if (!venueId) {
      setError('Invalid QR code - missing venue information');
      setLoading(false);
      return;
    }
    fetchData();
  }, [venueId, zoneId, unitId]);

  // Auto-redirect for order success
  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        setOrderSuccess(null);
        setBookingForm({ guestName: '', guestPhone: '', guestEmail: '', guestCount: 2, notes: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [orderSuccess]);

  // Auto-redirect for reservation success
  useEffect(() => {
    if (reservationSuccess) {
      const timer = setTimeout(() => {
        setReservationSuccess(null);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [reservationSuccess]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('🔍 Fetching data for venue:', venueId);
      
      // Fetch menu (public endpoint)
      const menuUrl = `${baseUrl}/public/Orders/menu?venueId=${venueId}`;
      console.log('📡 Fetching menu from:', menuUrl);
      
      const menuResponse = await fetch(menuUrl);
      console.log('📊 Menu response status:', menuResponse.status);
      
      if (!menuResponse.ok) {
        const errorText = await menuResponse.text();
        console.error('❌ Menu fetch failed:', errorText);
        throw new Error(`Failed to load menu: ${menuResponse.status} ${errorText}`);
      }
      
      const menuData = await menuResponse.json();
      
      // DEBUG: Log menu data to check if imageUrl is present
      console.log('📋 Menu data received:', menuData);
      console.log('📊 Menu categories count:', menuData.length);
      
      if (menuData.length === 0) {
        console.warn('⚠️ No menu categories found for venue:', venueId);
      }
      
      if (menuData.length > 0 && menuData[0].products?.length > 0) {
        console.log('🖼️ First product imageUrl:', menuData[0].products[0].imageUrl);
      }
      
      setMenu(menuData);

      // Fetch venue details with digital ordering status
      let venueData = null;
      
      try {
        // Fetch full venue details from public endpoint (includes allowsDigitalOrdering)
        const venueResponse = await fetch(`${baseUrl}/public/Venues/${venueId}`);
        if (venueResponse.ok) {
          venueData = await venueResponse.json();
          console.log('✅ Venue details loaded:', {
            name: venueData.name,
            type: venueData.type,
            allowsDigitalOrdering: venueData.allowsDigitalOrdering
          });
        } else {
          console.warn('⚠️ Could not fetch venue details, using fallback');
          // Fallback: use menu data
          venueData = {
            id: venueId,
            name: menuData[0]?.venueName || 'Venue',
            type: 'OTHER',
            allowsDigitalOrdering: false
          };
        }
      } catch (err) {
        console.error('❌ Error fetching venue details:', err);
        // Fallback: use menu data
        venueData = {
          id: venueId,
          name: menuData[0]?.venueName || 'Venue',
          type: 'OTHER',
          allowsDigitalOrdering: false
        };
      }

      // Set venue info with digital ordering status from backend
      setVenue({
        id: venueId,
        name: venueData.name,
        type: venueData.type,
        zoneId: zoneId,
        unitId: unitId,
        allowsDigitalOrdering: venueData.allowsDigitalOrdering,
        orderingEnabled: venueData.orderingEnabled
      });
      
      // 🏖️ VENUE JAIL: Enrich session with venue context for isolation protocols
      enrichSession(venueData.type, venueData.businessId);
      
      // Update cart store with venue context
      setCartVenue(venueId, unitId, venueData.name);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      console.error('Error details:', {
        message: err.message,
        venueId,
        zoneId,
        unitId
      });
      setError(err.message || 'Failed to load venue information');
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Haptic feedback for adding to cart
    if (haptics.isSupported()) {
      haptics.light();
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(bookingForm.guestName);
    const sanitizedNotes = sanitizeInput(bookingForm.notes);

    try {
      const orderData = {
        venueId: parseInt(venueId),
        ...(zoneId && { zoneId: parseInt(zoneId) }),
        ...(unitId && { zoneUnitId: parseInt(unitId) }), // Send unit ID for collector tracking
        customerName: sanitizedName || 'Guest',
        notes: sanitizedNotes || '',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${baseUrl}/public/Orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to place order');
      
      const result = await response.json();
      
      // 🚨 CRITICAL: Haptic feedback for order success
      if (haptics.isSupported()) {
        haptics.success();
      }
      
      setOrderSuccess(result);
      setCart([]);
      
      // 🚨 CRITICAL: Send WhatsApp link for retention (6-7x improvement)
      setTimeout(() => {
        const phone = whatsappLink.promptForPhone();
        if (phone) {
          whatsappLink.sendOrderLink(
            phone,
            result.orderNumber || result.id,
            venue?.name || 'Riviera'
          );
        }
      }, 1000); // Delay to show success screen first
      
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
      
      // Error haptic feedback
      if (haptics.isSupported()) {
        haptics.error();
      }
      
      // Display error to user
      alert('Failed to place order. Please try again.');
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const sanitizedName = sanitizeInput(bookingForm.guestName);
    const sanitizedPhone = sanitizeInput(bookingForm.guestPhone);
    const sanitizedEmail = sanitizeInput(bookingForm.guestEmail);
    const sanitizedNotes = sanitizeInput(bookingForm.notes);

    // Validation checks
    if (!sanitizedName || sanitizedName.length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!isValidPhone(sanitizedPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!unitId) {
      setError('Invalid QR code - missing table information');
      return;
    }

    try {
      const bookingData = {
        zoneUnitId: parseInt(unitId),
        venueId: parseInt(venueId),
        guestName: sanitizedName,
        guestPhone: sanitizedPhone,
        guestEmail: sanitizedEmail || '',
        guestCount: bookingForm.guestCount,
        notes: sanitizedNotes || '',
        startTime: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/public/Reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create reservation');
      }
      
      const result = await response.json();
      
      // 🚨 CRITICAL: Haptic feedback for booking success
      if (haptics.isSupported()) {
        haptics.success();
      }
      
      setReservationSuccess(result);
      setShowReserveModal(false);
      setBookingForm({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        guestCount: 2,
        notes: ''
      });
      setError(''); // Clear any previous errors
      
      // 🚨 CRITICAL: Send WhatsApp link for booking confirmation
      if (sanitizedPhone && result.bookingCode) {
        setTimeout(() => {
          whatsappLink.sendBookingLink(
            sanitizedPhone,
            result.bookingCode,
            venue?.name || 'Riviera',
            'Beach' // Zone name - could be enhanced later
          );
        }, 1000); // Delay to show success screen first
      }
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(err.message || 'Failed to create reservation. Please try again.');
      
      // Error haptic feedback
      if (haptics.isSupported()) {
        haptics.error();
      }
    }
  };

  // Check if venue allows ordering - uses backend's allowsDigitalOrdering field
  // Backend logic: null = auto (Restaurant=false, Beach/Pool/Bar=true), true/false = manual override
  const canOrder = venue?.allowsDigitalOrdering ?? false;
  // Check if venue allows table reservation (Beach/Pool only)
  const canReserve = venue?.type === 'BEACH' || venue?.type === 'POOL';

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-zinc-500 font-mono uppercase tracking-widest text-sm animate-pulse">Loading menu //</div>
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-mono text-sm mb-4 glow-primary">ERROR: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-surface-dark border border-border-dark text-white rounded text-sm font-mono tracking-widest uppercase hover:bg-zinc-800 transition-all duration-300"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 text-zinc-100 font-sans">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="relative mb-8 flex justify-center">
            <div className="w-24 h-24 bg-surface-dark border border-primary rounded flex items-center justify-center glow-primary z-10">
              <Check className="w-12 h-12 text-primary text-glow" strokeWidth={2} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded border border-primary animate-ping opacity-20"></div>
          </div>

          <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight uppercase">
            Order Placed
          </h2>
          
          <div className="inline-block bg-surface-dark rounded px-6 py-4 mb-6 border border-border-dark">
            <p className="text-xs tracking-widest uppercase text-zinc-500 mb-2 font-mono">Order Number</p>
            <p className="font-mono text-3xl text-primary font-bold text-glow">
              #{orderSuccess.orderNumber || orderSuccess.id}
            </p>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-sm mx-auto font-mono">
            Your order has been sent to the kitchen. We'll bring it to your spot shortly.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setOrderSuccess(null);
                setBookingForm({ guestName: '', guestPhone: '', guestEmail: '', guestCount: 2, notes: '' });
              }}
              className="px-8 py-4 bg-surface-dark border border-border-dark text-white rounded text-sm font-bold tracking-widest uppercase hover:bg-zinc-800 transition-all duration-300"
            >
              ORDER MORE
            </button>

            <button
              onClick={() => {
                exitSession();
                navigate(`/?mode=night&from=${venueId}`);
              }}
              className="px-8 py-4 bg-primary text-black rounded text-sm font-bold tracking-widest uppercase hover:bg-[#0ee57a] transition-all duration-300 flex items-center justify-center gap-2 glow-primary"
            >
              <span>🪩</span> SEE TONIGHT'S EVENTS
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-6 font-mono uppercase">Returning in 5s...</p>
        </div>
      </div>
    );
  }

  if (reservationSuccess) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 text-zinc-100 font-sans">
        <div className="text-center max-w-md animate-fadeIn">
          <div className="relative mb-8 flex justify-center">
            <div className="w-24 h-24 bg-surface-dark border border-primary rounded flex items-center justify-center glow-primary z-10">
              <Check className="w-12 h-12 text-primary text-glow" strokeWidth={2} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded border border-primary animate-ping opacity-20"></div>
          </div>

          <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight uppercase">
            Table Reserved
          </h2>
          
          <div className="inline-block bg-surface-dark rounded px-8 py-4 mb-6 border border-border-dark">
            <p className="text-xs tracking-widest uppercase text-zinc-500 mb-2 font-mono">Booking Code</p>
            <p className="font-mono text-4xl text-primary font-bold tracking-wider text-glow">
              {reservationSuccess.bookingCode}
            </p>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-sm mx-auto font-mono">
            Show this code upon arrival.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setReservationSuccess(null)}
              className="px-8 py-4 bg-surface-dark border border-border-dark text-white rounded text-sm font-bold tracking-widest uppercase hover:bg-zinc-800 transition-all duration-300"
            >
              BACK TO MENU
            </button>

            <button
              onClick={() => {
                exitSession();
                navigate(`/?mode=night&from=${venueId}`);
              }}
              className="px-8 py-4 bg-primary text-black rounded text-sm font-bold tracking-widest uppercase hover:bg-[#0ee57a] transition-all duration-300 flex items-center justify-center gap-2 glow-primary"
            >
              <span>🪩</span> SEE TONIGHT'S EVENTS
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-6 font-mono uppercase">Returning in 8s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[max(884px,100dvh)] bg-background-dark text-zinc-100 font-sans antialiased pb-32">
      {/* Reservation Modal - Dark Theme Adapted */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => { setShowReserveModal(false); setError(''); }}></div>
          <div className="relative w-full max-w-[480px] bg-surface-dark border-t border-border-dark rounded-t-lg shadow-2xl overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-zinc-800 rounded"></div>
            </div>
            <div className="flex items-center justify-between px-6 pt-2 pb-6 border-b border-border-dark">
              <h2 className="font-display text-2xl text-white tracking-wider uppercase font-bold">Reserve a Table</h2>
              <button onClick={() => { setShowReserveModal(false); setError(''); }} className="text-zinc-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReservation} className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-4"><p className="text-red-500 text-sm font-mono">{error}</p></div>}
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2">Name *</label>
                <input type="text" required value={bookingForm.guestName} onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm" placeholder="YOUR NAME" />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2">Phone *</label>
                <input type="tel" required value={bookingForm.guestPhone} onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2">Email</label>
                <input type="email" value={bookingForm.guestEmail} onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm" placeholder="YOUR@EMAIL.COM" />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2">Guests</label>
                <select value={bookingForm.guestCount} onChange={(e) => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num}>{num} {num === 1 ? 'GUEST' : 'GUESTS'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-zinc-500 mb-2">Notes</label>
                <textarea value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm resize-none h-24" placeholder="ANY REQUESTS?" />
              </div>
              <button type="submit" className="w-full bg-primary text-black px-8 py-4 rounded text-sm font-bold tracking-widest uppercase hover:bg-[#0ee57a] transition-all duration-300 mt-6 glow-primary">
                REQUEST RESERVATION
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="relative w-full h-64 md:h-80">
        <img 
          alt={venue?.name || "Venue"} 
          className="w-full h-full object-cover rounded-none" 
          src={venue?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD8WwQlTWCp-ILL2b_lkfUnaiP9s_hGxRZsn-2CAzXztNWkQieRJmoqS9akLFXLBRdX9c-jJQvaQuspeWk-ZnDGKwbZd7oXDHdUC3Xc8brjUZUdR8EBjcl4JbBvFNaV_FOvpawMlgzQ3ltJuJMqHjuTtHWlJLb5BlcrqOBl6LifJGu4Gu1VrjRpVC9Cwy5i5-cQIPBxiikNRKM23KeJIhy24G1nxGJS9ap35lyt4gXPVxgbu8fU8m3QxqQeB93tuvMcrHvuAGIa_I5r"}
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex-1 mx-3 relative max-w-md w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-zinc-400 text-lg">search</span>
            </div>
            <input 
              readOnly
              className="w-full bg-surface-dark/90 border border-border-dark text-zinc-100 rounded py-2 pl-10 pr-4 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono" 
              placeholder="SEARCH MENU" 
              type="text"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-dark to-transparent"></div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 min-w-24 px-4 h-16 bg-surface-dark rounded flex flex-col items-center justify-center border border-border-dark z-20">
          <span className="font-display font-bold text-xl tracking-widest text-white whitespace-nowrap">{venue?.name || 'RIVIERA'}</span>
          {unitId && <span className="text-primary font-mono text-[10px] uppercase text-glow border-t border-border-dark mt-1 pt-1">UNIT {unitId}</span>}
        </div>
      </header>

      {/* Venue Info Section */}
      <section className="px-4 pt-14 pb-6 text-center border-b border-border-dark">
        <h1 className="font-display text-3xl font-bold mb-2 tracking-tight text-white uppercase">{venue?.name || 'RIVIERA'}</h1>
        <div className="flex flex-wrap items-center justify-center text-xs text-zinc-400 gap-x-3 gap-y-1 mb-4 font-mono uppercase tracking-wider">
          <span className="flex items-center"><span className="material-symbols-outlined text-[14px] mr-1 text-primary text-glow">star</span> 9.8</span>
          <span>•</span>
          <span>Open</span>
          {canOrder && <span>•</span>}
          {canOrder && <span>Min. <span className="text-primary text-glow">ORDER</span></span>}
        </div>
        
        {/* Reservation Action Button */}
        {!canOrder && venue?.allowsDigitalOrdering && (
           <div className="mt-4 flex justify-center">
             <button onClick={() => setShowReserveModal(true)} className="px-6 py-3 bg-primary text-black rounded font-mono text-sm font-bold tracking-widest uppercase hover:bg-[#0ee57a] transition-all glow-primary">
               Reserve Table
             </button>
           </div>
        )}
      </section>

      {/* PLAN TONIGHT BANNER */}
      <div className="p-4">
        <div 
          onClick={() => { exitSession(); navigate(`/?mode=night&from=${venueId}`); }}
          className="bg-surface-dark border border-border-dark rounded p-4 flex items-center gap-4 relative overflow-hidden cursor-pointer hover:bg-zinc-900 transition-colors group"
        >
          <div className="w-12 h-12 bg-background-dark rounded border border-border-dark flex items-center justify-center shrink-0 z-10 glow-primary group-hover:scale-105 transition-transform">
            <span className="text-2xl">🪩</span>
          </div>
          <div className="z-10 flex-1">
            <h3 className="text-white text-sm font-bold uppercase tracking-wide mb-1">Plan Tonight</h3>
            <a className="text-primary text-glow text-xs font-mono flex items-center group-hover:underline uppercase pointer-events-none">
                See VIP events <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto w-full">
        <MenuDisplay 
          menu={menu} 
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          getTotalPrice={getTotalPrice}
          handlePlaceOrder={handlePlaceOrder}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          canOrder={canOrder}
        />
      </main>

      {/* Floating Cart Button */}
      {canOrder && cart.length > 0 && (
        <button
          onClick={() => setShowCartModal(true)}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-primary text-black p-4 rounded shadow-2xl z-40 group hover:bg-[#0ee57a] transition-colors flex items-center justify-between glow-primary border border-[#0ee57a]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black/10 rounded flex items-center justify-center font-mono font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <span className="font-bold tracking-widest uppercase text-sm">View Order</span>
          </div>
          <span className="font-mono font-bold border-l border-black/20 pl-4">
             €{getTotalPrice().toFixed(2)}
          </span>
        </button>
      )}

      {/* 🦅 POWERED BY XIXA FOOTER */}
      <div className="text-center py-8 border-t border-border-dark mt-8 mb-4">
        <button
          onClick={() => { exitSession(); navigate('/'); }}
          className="text-xs font-mono tracking-widest uppercase text-zinc-600 hover:text-zinc-400 transition-colors duration-300"
        >
          🦅 Powered by XIXA
        </button>
      </div>

      {/* 📱 GLASSMORPHIC BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-t border-border-dark z-50 flex items-center justify-around px-4">
        <button 
          onClick={() => { exitSession(); navigate('/'); }}
          className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-white transition-colors gap-1 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-0.5 transition-transform duration-300">wb_sunny</span>
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold">DAY EXP</span>
        </button>
        
        <div className="w-px h-8 bg-zinc-800"></div>

        <button 
          className="flex flex-col items-center justify-center w-full h-full text-primary glow-primary gap-1 cursor-default pointer-events-none"
        >
          <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-glow">MENU</span>
        </button>

        <div className="w-px h-8 bg-zinc-800"></div>

        <button 
          onClick={() => { exitSession(); navigate(`/?mode=night&from=${venueId}`); }}
          className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-white transition-colors gap-1 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-0.5 transition-transform duration-300">nightlife</span>
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold">EVENTS</span>
        </button>
      </nav>

      {/* Dark Theme Cart Modal */}
      {showCartModal && canOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowCartModal(false)}>
          <div className="bg-surface-dark rounded-t-lg border-t border-x border-border-dark p-6 w-full max-w-lg max-h-[85vh] flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-dark shrink-0">
              <h3 className="text-lg font-display tracking-widest uppercase font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-glow">shopping_cart</span>
                Your Order
              </h3>
              <button onClick={() => setShowCartModal(false)} className="text-zinc-500 hover:text-white transition-colors flex items-center justify-center p-2 rounded hover:bg-zinc-800">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-zinc-500 font-mono text-sm uppercase">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">remove_shopping_cart</span>
                Cart is empty
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 hide-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-start justify-between bg-background-dark p-4 rounded border border-border-dark">
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm uppercase tracking-wide">{item.name}</p>
                        <p className="font-mono text-xs text-zinc-400 mt-1">€{item.price.toFixed(2)} / ea</p>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-dark rounded border border-border-dark">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white">-</button>
                        <span className="w-4 text-center text-primary font-mono text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:text-white">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border-dark pt-6 shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono tracking-widest uppercase text-zinc-500">Total</span>
                    <span className="font-mono text-2xl text-primary font-bold text-glow">
                      €{getTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  <input type="text" placeholder="YOUR NAME (OPTIONAL)" value={bookingForm.guestName} onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm mb-3 uppercase" />

                  <textarea placeholder="SPECIAL REQUESTS (OPTIONAL)" value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={2} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm resize-none mb-4 uppercase" />

                  <button onClick={handlePlaceOrder} className="w-full bg-primary text-black px-8 py-4 rounded text-sm font-bold tracking-widest uppercase hover:bg-[#0ee57a] transition-all duration-300 glow-primary flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">send</span> SUBMIT ORDER
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Display Component
function MenuDisplay({ menu, cart, addToCart, updateQuantity, getTotalPrice, handlePlaceOrder, bookingForm, setBookingForm, canOrder }) {
  if (!menu || menu.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      {menu.map(category => (
        <section key={category.id} className="mt-6 border-t border-border-dark pt-6 first:border-t-0 first:pt-0">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">{category.name}</h2>
          </div>
          <div className="flex flex-col">
            {category.products?.map(product => {
              const cartItem = cart.find(item => item.id === product.id);
              
              return (
                <div key={product.id} className="flex items-start p-4 border-b border-border-dark hover:bg-zinc-900/50 cursor-pointer transition-colors">
                  <div className="flex-1 pr-4">
                    <h3 className="text-base font-bold text-zinc-100 mb-1 uppercase tracking-wide flex items-center gap-2">
                      {product.name}
                      {product.isAlcohol && <span className="text-red-500 text-xs border border-red-500/20 bg-red-500/10 px-1 rounded-sm">18+</span>}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-zinc-400 mb-2 leading-snug font-mono text-xs">{product.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-primary text-glow font-mono font-bold">€{product.price.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="text-zinc-600 line-through font-mono text-xs">€{product.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  {product.imageUrl ? (
                    <div className="w-24 h-24 shrink-0 bg-surface-dark border border-border-dark rounded overflow-hidden relative group">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover contrast-125 saturate-150 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {canOrder && (
                        <div className="absolute bottom-1 right-1 flex items-center bg-surface-dark rounded border border-border-dark glow-primary overflow-hidden">
                           {cartItem ? (
                             <>
                              <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">-</button>
                              <span className="w-4 text-center text-primary font-mono text-xs font-bold">{cartItem.quantity}</span>
                              <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }} className="w-8 h-8 flex items-center justify-center text-primary hover:text-white transition-colors">+</button>
                             </>
                           ) : (
                             <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                              className="w-8 h-8 flex items-center justify-center text-primary hover:bg-zinc-800 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px] text-glow">add</span>
                            </button>
                           )}
                        </div>
                      )}
                    </div>
                  ) : (
                    canOrder && (
                      <div className="self-center flex items-center bg-surface-dark rounded border border-border-dark glow-primary overflow-hidden ml-2">
                         {cartItem ? (
                           <>
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">-</button>
                            <span className="w-4 text-center text-primary font-mono text-xs font-bold">{cartItem.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }} className="w-8 h-8 flex items-center justify-center text-primary hover:text-white transition-colors">+</button>
                           </>
                         ) : (
                           <button 
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            className="w-10 h-10 flex items-center justify-center text-primary hover:bg-zinc-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px] text-glow">add</span>
                          </button>
                         )}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* ⭐ RATE YOUR EXPERIENCE CARD (Always Available) */}
      <section className="mt-8 px-4 pb-4 border-t border-border-dark pt-8">
         <div 
           onClick={() => { window.location.href = `/review?v=${menu[0]?.products[0]?.venueId || ''}`; }}
           className="bg-zinc-900 border border-border-dark rounded p-6 flex flex-col items-center text-center cursor-pointer hover:bg-zinc-800 transition-all duration-300 relative overflow-hidden group"
         >
           {/* Subtle glow effect behind stars */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 bg-amber-500/10 blur-xl rounded-full"></div>
           
           <h3 className="font-display text-xl text-white font-bold tracking-widest uppercase mb-1 z-10">Rate Your Experience</h3>
           <p className="text-xs font-mono text-zinc-400 mb-4 z-10 uppercase">Help us improve</p>
           
           <div className="flex items-center gap-2 z-10">
             {[1, 2, 3, 4, 5].map((star) => (
               <span 
                 key={star} 
                 className="material-symbols-outlined text-3xl text-zinc-700 group-hover:text-amber-400 transition-colors duration-300"
                 style={{ transitionDelay: `${star * 50}ms` }}
               >
                 star
               </span>
             ))}
           </div>
           
           {/* Pseudo-button for visual affordance */}
           <div className="mt-6 border border-zinc-700 text-zinc-400 text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors z-10">
              Leave Review
           </div>
         </div>
      </section>
    </div>
  );
}
