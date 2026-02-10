import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Users, Clock, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

export default function SpotPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL parameters
  const venueId = searchParams.get('v');
  const zoneId = searchParams.get('z');
  const unitId = searchParams.get('u');

  // State
  const [activeTab, setActiveTab] = useState('order'); // 'order' or 'book'
  const [venue, setVenue] = useState(null);
  const [menu, setMenu] = useState([]);
  const [unit, setUnit] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

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
      setMenu(menuData);

      // Fetch venue info (we'll use the menu data for now, or add a public venue endpoint)
      setVenue({
        id: venueId,
        name: menuData[0]?.venueName || 'Venue',
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

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
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

  const handleBooking = async (e) => {
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

      if (!response.ok) throw new Error('Failed to create booking');
      
      const result = await response.json();
      setBookingSuccess(result);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  };

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

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
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
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('order')}
              className={`py-6 text-sm tracking-widest uppercase transition-all duration-300 ${
                activeTab === 'order'
                  ? 'text-[#1C1917] border-b-2 border-stone-900'
                  : 'text-[#78716C] hover:text-[#57534E]'
              }`}
            >
              Order
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`py-6 text-sm tracking-widest uppercase transition-all duration-300 ${
                activeTab === 'book'
                  ? 'text-[#1C1917] border-b-2 border-stone-900'
                  : 'text-[#78716C] hover:text-[#57534E]'
              }`}
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'order' ? (
          <OrderTab
            menu={menu}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            getTotalPrice={getTotalPrice}
            handlePlaceOrder={handlePlaceOrder}
            orderSuccess={orderSuccess}
            bookingForm={bookingForm}
            setBookingForm={setBookingForm}
          />
        ) : (
          <BookTab
            venue={venue}
            unitId={unitId}
            bookingForm={bookingForm}
            setBookingForm={setBookingForm}
            handleBooking={handleBooking}
            bookingSuccess={bookingSuccess}
          />
        )}
      </div>
    </div>
  );
}

// Order Tab Component
function OrderTab({ menu, cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, handlePlaceOrder, orderSuccess, bookingForm, setBookingForm }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (menu.length > 0 && !selectedCategory) {
      setSelectedCategory(menu[0].id);
    }
  }, [menu]);

  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#1C1917] mb-4">
            Order Placed
          </h2>
          <p className="text-lg text-[#57534E] mb-2">
            Order #{orderSuccess.orderNumber}
          </p>
          <p className="text-[#78716C] leading-relaxed">
            Your order has been sent to the kitchen. We'll bring it to you shortly.
          </p>
        </div>
      </div>
    );
  }

  const currentCategory = menu.find(cat => cat.id === selectedCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Menu */}
      <div className="lg:col-span-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  />
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
                <button
                  onClick={() => addToCart(product)}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full text-sm tracking-wider uppercase hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
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
    </div>
  );
}

// Book Tab Component
function BookTab({ venue, unitId, bookingForm, setBookingForm, handleBooking, bookingSuccess }) {
  if (bookingSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#1C1917] mb-4">
            Booking Confirmed
          </h2>
          <p className="text-lg text-[#57534E] mb-2">
            Booking Code: {bookingSuccess.bookingCode}
          </p>
          <p className="text-[#78716C] leading-relaxed">
            Your reservation has been confirmed. See you soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white to-stone-50/50 rounded-[2rem] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-200/40">
        <div className="mb-8">
          <p className="text-sm tracking-widest uppercase text-[#78716C] mb-2">Reserve This Spot</p>
          <h2 className="font-['Cormorant_Garamond'] text-5xl font-light text-[#1C1917] mb-4">
            {venue?.name}
          </h2>
          <p className="text-lg text-[#57534E]">Unit {unitId}</p>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-[#78716C] mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={bookingForm.guestName}
              onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
              className="w-full px-6 py-4 rounded-full border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase text-[#78716C] mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={bookingForm.guestPhone}
              onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
              className="w-full px-6 py-4 rounded-full border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="+355 69 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase text-[#78716C] mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={bookingForm.guestEmail}
              onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
              className="w-full px-6 py-4 rounded-full border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase text-[#78716C] mb-2">
              <Users className="inline w-4 h-4 mr-2" />
              Number of Guests
            </label>
            <select
              value={bookingForm.guestCount}
              onChange={(e) => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })}
              className="w-full px-6 py-4 rounded-full border border-stone-300 text-[#1C1917] focus:outline-none focus:border-stone-400 transition-colors"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase text-[#78716C] mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              rows={3}
              className="w-full px-6 py-4 rounded-2xl border border-stone-300 text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-stone-400 transition-colors resize-none"
              placeholder="Any special requirements..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-8 py-4 bg-stone-900 text-stone-50 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
