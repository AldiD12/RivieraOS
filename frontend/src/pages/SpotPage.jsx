import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Check, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export default function SpotPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu (public endpoint)
      const menuResponse = await fetch(`${API_URL}/public/Orders/menu?venueId=${venueId}`);
      if (!menuResponse.ok) throw new Error('Failed to load menu');
      const menuData = await menuResponse.json();
      
      // DEBUG: Log menu data to check if imageUrl is present
      console.log('📋 Menu data received:', menuData);
      if (menuData.length > 0 && menuData[0].products?.length > 0) {
        console.log('🖼️ First product imageUrl:', menuData[0].products[0].imageUrl);
      }
      
      setMenu(menuData);

      // Fetch venue details to get venue type (NEW: Prof Kristi implemented this!)
      let venueType = 'OTHER'; // default
      let venueName = menuData[0]?.venueName || 'Venue';
      
      try {
        // NEW: Backend now returns venue: { id, name, type } on each zone
        const zonesResponse = await fetch(`${API_URL}/public/Reservations/zones?venueId=${venueId}`);
        if (zonesResponse.ok) {
          const zonesData = await zonesResponse.json();
          // Each zone now includes venue info with type!
          if (zonesData.length > 0 && zonesData[0].venue) {
            venueType = zonesData[0].venue.type || 'OTHER';
            venueName = zonesData[0].venue.name || venueName;
            console.log('✅ Venue type loaded from backend:', venueType);
          }
        }
      } catch (err) {
        console.warn('Could not fetch venue details, defaulting to OTHER:', err);
      }

      // Set venue info
      setVenue({
        id: venueId,
        name: venueName,
        type: venueType,
        zoneId: zoneId,
        unitId: unitId
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load venue information');
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

    try {
      const orderData = {
        venueId: parseInt(venueId),
        zoneId: parseInt(zoneId),
        customerName: bookingForm.guestName || 'Guest',
        notes: bookingForm.notes || '',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${API_URL}/public/Orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to place order');
      
      const result = await response.json();
      setOrderSuccess(result);
      setCart([]);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    
    try {
      const bookingData = {
        zoneUnitId: parseInt(unitId),
        venueId: parseInt(venueId),
        guestName: bookingForm.guestName,
        guestPhone: bookingForm.guestPhone,
        guestEmail: bookingForm.guestEmail,
        guestCount: bookingForm.guestCount,
        notes: bookingForm.notes,
        startTime: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/public/Reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error('Failed to create reservation');
      
      const result = await response.json();
      alert(`Table reserved! Booking code: ${result.bookingCode}`);
      setShowReserveModal(false);
      setBookingForm({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        guestCount: 2,
        notes: ''
      });
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Failed to create reservation. Please try again.');
    }
  };

  // Check if venue allows ordering - uses backend's allowsDigitalOrdering field
  // Backend logic: null = auto (Restaurant=false, Beach/Pool/Bar=true), true/false = manual override
  const canOrder = venue?.allowsDigitalOrdering ?? false;
  // Check if venue allows table reservation (Beach/Pool only)
  const canReserve = venue?.type === 'BEACH' || venue?.type === 'POOL';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-[#57534E] text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#57534E] text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-stone-900 text-stone-50 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    // Auto-redirect after 5 seconds
    setTimeout(() => {
      setOrderSuccess(null);
      setBookingForm({ guestName: '', guestPhone: '', guestEmail: '', guestCount: 2, notes: '' });
    }, 5000);

    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fadeIn">
          {/* Success Icon with Animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] animate-scaleIn">
              <Check className="w-12 h-12 text-white animate-checkmark" strokeWidth={3} />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
          </div>

          {/* Success Message */}
          <h2 className="font-['Cormorant_Garamond'] text-5xl font-light text-[#1C1917] mb-4 tracking-tight">
            Order Placed!
          </h2>
          
          {/* Order Number */}
          <div className="inline-block bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-xl rounded-2xl px-6 py-3 mb-6 border border-stone-200/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm tracking-widest uppercase text-[#78716C] mb-1">Order Number</p>
            <p className="font-['Cormorant_Garamond'] text-3xl text-[#92400E] font-medium">
              #{orderSuccess.orderNumber || orderSuccess.id}
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-[#57534E] leading-relaxed mb-8 max-w-sm mx-auto">
            Your order has been sent to the kitchen. We'll bring it to your spot shortly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setOrderSuccess(null);
                setBookingForm({ guestName: '', guestPhone: '', guestEmail: '', guestCount: 2, notes: '' });
              }}
              className="px-8 py-4 bg-stone-900 text-stone-50 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
            >
              Place Another Order
            </button>
            <button
              onClick={() => navigate(`/review?v=${venueId}`)}
              className="px-8 py-4 border border-stone-300 text-stone-700 rounded-full text-sm tracking-widest uppercase hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
            >
              Leave a Review
            </button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-xs text-[#78716C] mt-6 opacity-60">
            Returning to menu in 5 seconds...
          </p>
        </div>

        {/* Custom animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scaleIn {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
            @keyframes checkmark {
              0% { transform: scale(0) rotate(-45deg); }
              50% { transform: scale(1.2) rotate(-45deg); }
              100% { transform: scale(1) rotate(0deg); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.6s ease-out;
            }
            .animate-scaleIn {
              animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .animate-checkmark {
              animation: checkmark 0.6s ease-out 0.3s both;
            }
          `
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Reservation Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setShowReserveModal(false)}
          ></div>
          <div 
            className="relative w-full max-w-[480px] bg-[#FAFAF9] rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-stone-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-2 pb-6 border-b border-stone-200/40">
              <h2 className="font-['Cormorant_Garamond'] text-2xl text-stone-900 tracking-tight">Reserve a Table</h2>
              <button 
                onClick={() => setShowReserveModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleReservation} className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                  className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={bookingForm.guestPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                  className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Email</label>
                <input
                  type="email"
                  value={bookingForm.guestEmail}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                  className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Guests</label>
                <select
                  value={bookingForm.guestCount}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })}
                  className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm uppercase tracking-widest text-stone-500 mb-2">Special Requests</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full bg-white border border-stone-200/40 rounded-xl px-4 py-3 text-stone-900 focus:border-stone-400 focus:ring-0 transition-colors resize-none h-24"
                  placeholder="Allergies, preferences, or special occasions..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] mt-6"
              >
                Request Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-white to-stone-50/50 border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#92400E]" />
            <p className="text-sm tracking-widest uppercase text-[#78716C]">
              {unitId ? `Unit ${unitId}` : 'Welcome'}
            </p>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-6xl md:text-7xl font-light tracking-tighter leading-none text-[#1C1917]">
            {venue?.name || 'Riviera'}
          </h1>
          
          {/* Reserve Table Button (Beach/Pool only) */}
          {canReserve && (
            <button
              onClick={() => setShowReserveModal(true)}
              className="mt-6 px-8 py-4 border-2 border-stone-900 text-stone-900 rounded-full text-sm tracking-widest uppercase hover:bg-stone-900 hover:text-stone-50 transition-all duration-300"
            >
              Reserve Table
            </button>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
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
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/80 backdrop-blur-sm border-t border-stone-200/40">
        <div className="max-w-md mx-auto flex items-center justify-around py-3">
          <button className="flex flex-col items-center gap-1 text-stone-900">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
              <path d="M8 12h8v2H8z"/>
            </svg>
            <span className="text-xs uppercase tracking-wider font-medium">Menu</span>
          </button>
          <button 
            onClick={() => setShowReserveModal(true)}
            className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs uppercase tracking-wider font-medium">Book Table</span>
          </button>
          <button 
            onClick={() => navigate(`/review?v=${venueId}`)}
            className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Star className="w-6 h-6" />
            <span className="text-xs uppercase tracking-wider font-medium">Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Menu Display Component
function MenuDisplay({ menu, cart, addToCart, updateQuantity, getTotalPrice, handlePlaceOrder, bookingForm, setBookingForm, canOrder }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (menu.length > 0 && !selectedCategory) {
      setSelectedCategory(menu[0].id);
    }
  }, [menu]);

  const currentCategory = menu.find(cat => cat.id === selectedCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Menu */}
      <div className={canOrder ? "lg:col-span-2" : "lg:col-span-3"}>
        {/* Category Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {menu.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-stone-900 text-stone-50'
                  : 'border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-8 ${canOrder ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {currentCategory?.products?.map(product => (
            <div
              key={product.id}
              className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out group"
            >
              {product.imageUrl && (
                <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.error('❌ Failed to load image:', product.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {!product.imageUrl && (
                <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-stone-100 flex items-center justify-center border border-stone-200/40">
                  <p className="text-stone-400 text-sm">No image</p>
                </div>
              )}
              <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#1C1917] mb-2">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-[#78716C] text-sm leading-relaxed mb-4">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="font-['Cormorant_Garamond'] text-3xl text-[#92400E]">
                  €{product.price.toFixed(2)}
                </span>
                {canOrder && (
                  <button
                    onClick={() => addToCart(product)}
                    className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full text-sm tracking-wider uppercase hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar (Beach/Pool only) */}
      {canOrder && (
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-white to-stone-50/50 rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-200/40 sticky top-32">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-5 h-5 text-[#92400E]" />
              <h3 className="text-sm tracking-widest uppercase text-[#78716C]">Your Order</h3>
            </div>

            {cart.length === 0 ? (
              <p className="text-[#78716C] text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-[#1C1917] font-medium">{item.name}</p>
                        <p className="text-sm text-[#78716C]">€{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-[#1C1917]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200/40 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm tracking-widest uppercase text-[#78716C]">Total</span>
                    <span className="font-['Cormorant_Garamond'] text-4xl text-[#92400E]">
                      €{getTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    className="w-full px-4 py-3 rounded-full border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] mb-3 focus:outline-none focus:border-stone-400 transition-colors"
                  />

                  <textarea
                    placeholder="Special requests (optional)"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] mb-4 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full px-8 py-4 bg-stone-900 text-stone-50 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
