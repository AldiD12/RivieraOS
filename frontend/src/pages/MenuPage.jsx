import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5171/api';
const VENUE_ID = 1;

// Premium menu items - Only 4 signature drinks with luxury images
const PREMIUM_MENU_ITEMS = [
  {
    id: 1,
    name: 'Mojito',
    description: 'Classic Cuban blend with fresh mint, white rum, sugar, lime juice, and soda water.',
    basePrice: 9.00,
    categoryName: 'Cocktails',
    category: 'cocktails',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFdm7_G0c1UeKqRpXKkXoWg73ALLgGr4dx1FO03ocBUPQ5iVG7Vguku0-8Xy36X7HNxraRM2IZ7poH50OE_1aU_wNP-v20gz2cNIf0b5ulg9JbE0O0JP-XSmM3qYHyStrkC6jCvgI48u2G3os4bP4YazzaEzXVea2p5LGssPUmE_GzC5EvAjjYmqD0nvTiQhbptA1Ct-hDSdX3KeGii7V0xcmYi9WdBQasuEP3dsVhHqWysRB-3RqVkoe4ZWiCNDyVwMMxgF5hw_5P'
  },
  {
    id: 2,
    name: 'French Fries',
    description: 'Crispy golden house fries served with truffle mayo.',
    basePrice: 5.00,
    categoryName: 'Food',
    category: 'food',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv7Yz3S7RFqVP1byv6OpuFQGD04xCR5qdQCCKObK7e46r93cA0Rb1CEDteunmUwwY9JPBOk9DD8ifSNRlkYbvfSq8UCqT8p0AEyxAN2HEbaKbM7IxQt-XKSJY0YhAhhcN6yBhoJy2p2cjfnDIIKk9HAs0BMCkMj8HGyn9zg5mrD-x5tVs9MMXXg8iLeg-BTmrx3QzZMPnRnm9dshQd_DEDotSNSKbJMpiEGlpPB40qD5xO_BUebNA7oMEztOTtvSIQH4JEG6JaxYa9'
  },
  {
    id: 3,
    name: 'Aperol Spritz',
    description: 'Italian aperitif with prosecco, Aperol and a splash of soda.',
    basePrice: 8.50,
    categoryName: 'Cocktails',
    category: 'cocktails',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe_mKdCvfNtNkvgzoNDG_wZFSg_OtAR5tn30feZAxzc_2aqC977zOcifY8bgb7kTwo5o8ENbl0hSVm0auzARYFYvArRKlBHxKK_DM5uAOfzUcxhxqe0W1G1TAj9MhTEo4IHCu7ZQihXDsBPsw9rGhjN9FJM52zQbRtuFU4azr3O9nra1euwMhbrJI3aXjAjry9D7zEyCANOsC6vst9x8UGxH9xaNtxVgv5LIr0Mnvg2wTcMHDYz1jAXu0opkkKIgI9u6_MSLMdYV6j'
  },
  {
    id: 4,
    name: 'Club Sandwich',
    description: 'Triple-decker with grilled chicken breast, bacon, lettuce, and tomato.',
    basePrice: 12.00,
    categoryName: 'Food',
    category: 'food',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdNil-FB8Ww7LMHPK41MBZSoYYiQiM3jc7jIhQjg4BBrhPomNS7jZc4NP63-2moJdsjqHrArY0QWZn4C2WrfRO0T1ZLLRwFYGPiaiwEK8wKOma3JuEbjSh39TebBwfwu0Qdmsbu73AcTXlnaBvX2lJWKA0b4s5qCx_LXgPGxuwMsQD4HWy4xmSDuoxzcBYYVXYWPxQtjUAHCxeGvNFGYWJCdd61pzTfYhJwpEeFZRw6NoybDFsdcgJ9IRMnoN5wnOHFPe0dIGtgoZ2'
  }
];

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
  const [sunbedName, setSunbedName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [sunbedNumber, setSunbedNumber] = useState('24');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [venueData, setVenueData] = useState(null);
  const [isDigitalOrderingEnabled, setIsDigitalOrderingEnabled] = useState(true);

  useEffect(() => {
    fetchVenueData();
    // Add Material Symbols font if not already present
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  const fetchVenueData = async () => {
    try {
      // Fetch venue details to get isDigitalOrderingEnabled flag
      try {
        const venueResponse = await fetch(`${API_URL}/venues/${VENUE_ID}`);
        if (venueResponse.ok) {
          const venue = await venueResponse.json();
          setVenueData(venue);
          setIsDigitalOrderingEnabled(venue.isDigitalOrderingEnabled ?? true);
          console.log('🏨 Venue digital ordering enabled:', venue.isDigitalOrderingEnabled);
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
        // Default to enabled if API fails
        setIsDigitalOrderingEnabled(true);
      }

      // If bedId is provided, fetch sunbed info from Discovery endpoint
      if (bedId) {
        try {
          const unitsResponse = await fetch(`${API_URL}/Discovery/${VENUE_ID}/status`);
          if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            // Find the sunbed by unitLabel
            for (const zone of unitsData.zones) {
              const sunbed = zone.units.find(u => u.unitLabel === bedId);
              if (sunbed) {
                setSunbedName(sunbed.unitLabel);
                setSunbedNumber(sunbed.unitLabel);
                break;
              }
            }
          }
        } catch (err) {
          console.error('Error fetching sunbed info:', err);
        }
      }
      
      // Use static premium menu items (4 items only)
      setMenuItems(PREMIUM_MENU_ITEMS);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue data:', error);
      setLoading(false);
    }
  };

  const categories = ['All Items', 'Cocktails', 'Food', 'Wine'];
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
      // Get the sunbed unit ID from bedId
      let unitId = null;
      
      if (bedId) {
        const unitsResponse = await fetch(`${API_URL}/Discovery/${VENUE_ID}/status`);
        if (unitsResponse.ok) {
          const unitsData = await unitsResponse.json();
          
          for (const zone of unitsData.zones) {
            const sunbed = zone.units.find(u => u.unitLabel === bedId);
            if (sunbed) {
              unitId = sunbed.id;
              break;
            }
          }
          
          // Fallback: if bedId is numeric, try to find the first available sunbed
          if (!unitId && /^\d+$/.test(bedId)) {
            for (const zone of unitsData.zones) {
              const sunbed = zone.units.find(u => u.currentStatus === 'Occupied');
              if (sunbed) {
                unitId = sunbed.id;
                setSunbedName(sunbed.unitLabel); // Update the display name
                break;
              }
            }
          }
        }
      }

      if (!unitId) {
        console.error('Could not find sunbed unit ID for bedId:', bedId);
        console.error('Please use a valid sunbed label like A1, A2, B1, etc.');
        console.error('Example: http://localhost:5173/menu?bedId=A1');
        return;
      }

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
        // Auto-advance to feedback after 5 seconds
        setTimeout(() => {
          setCurrentScreen('feedback');
        }, 5000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const resetToMenu = () => {
    setCart([]);
    setCurrentScreen('menu');
    setRating(0);
    setFeedbackNote('');
    setSpecialInstructions('');
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
          <h1 className="font-serif text-4xl text-black mb-4 leading-tight">Welcome to Riviera</h1>
          <p className="text-stone-600 text-lg font-light">Please scan your sunbed QR code to order</p>
        </div>
      </div>
    );
  }

  // MENU SCREEN
  if (currentScreen === 'menu') {
    return (
      <div className="bg-[#FDFBF7] text-black min-h-screen font-sans antialiased selection:bg-black selection:text-white pb-32">
        {/* Header */}
        <header className="pt-20 pb-12 px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-black tracking-tight leading-none">
            Riviera Beach<br/>
            <span className="italic font-normal text-3xl md:text-4xl text-black/85 mt-2 block">Club</span>
          </h1>
          {sunbedName && (
            <p className="text-center text-sm font-sans text-stone-500 uppercase tracking-widest mt-4">
              Sunbed {sunbedName}
            </p>
          )}
          {!isDigitalOrderingEnabled && (
            <div className="mt-6 max-w-sm mx-auto">
              <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-4">
                <p className="text-stone-600 font-sans text-sm leading-relaxed">
                  <span className="font-medium">Menu Catalog</span><br/>
                  Please order with your waiter
                </p>
              </div>
            </div>
          )}
        </header>

        {/* Category Navigation */}
        <div className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-sm py-6 border-b border-black/5">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 w-full items-center justify-start md:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 font-serif text-lg transition-colors ${
                  activeCategory === category
                    ? 'text-black italic border-b border-black pb-1 hover:opacity-70'
                    : 'text-black/50 hover:text-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <main className="max-w-md mx-auto px-6 pt-12">
          <div className="flex flex-col gap-24">
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

        {/* Floating Cart Button - Only show if digital ordering is enabled */}
        {cart.length > 0 && isDigitalOrderingEnabled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent"
          >
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setCurrentScreen('checkout')}
                className="w-full bg-black text-white font-serif text-lg py-4 px-6 flex items-center justify-between shadow-lg hover:bg-black/90 transition-colors"
              >
                <span className="font-medium">View Order</span>
                <span className="text-sm uppercase tracking-widest opacity-80">
                  {getTotalItems()} Item{getTotalItems() !== 1 ? 's' : ''}
                </span>
                <span className="font-medium">€{getCartTotal().toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Custom CSS for hiding scrollbar */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `
        }} />
      </div>
    );
  }

  // CHECKOUT SCREEN
  if (currentScreen === 'checkout') {
    return (
      <div className="bg-[#FDFBF7] text-black min-h-screen font-sans antialiased overflow-hidden">
        {/* Background blur */}
        <div className="opacity-30 pointer-events-none filter blur-[2px] transition-all duration-500">
          <header className="pt-20 pb-12 px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl text-black tracking-tight leading-none">
              Riviera Beach<br/>
              <span className="italic font-normal text-3xl md:text-4xl text-black/85 mt-2 block">Club</span>
            </h1>
          </header>
          <div className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-sm py-6 border-b border-black/5">
            <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 w-full items-center justify-start md:justify-center">
              <button className="flex-shrink-0 text-black font-serif text-lg italic border-b border-black pb-1">All Items</button>
              <button className="flex-shrink-0 text-black/50 font-serif text-lg">Cocktails</button>
              <button className="flex-shrink-0 text-black/50 font-serif text-lg">Food</button>
              <button className="flex-shrink-0 text-black/50 font-serif text-lg">Wine</button>
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
            className="relative w-full max-w-[480px] h-[92vh] bg-[#FDFBF7] rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="w-full flex justify-center pt-4 pb-2 bg-[#FDFBF7]">
              <div className="w-12 h-1 bg-black/10 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-8 pt-2 pb-6 border-b border-black/5 bg-[#FDFBF7]">
              <h2 className="font-serif text-3xl text-black tracking-tight">Your Order</h2>
              <button 
                onClick={() => setCurrentScreen('menu')}
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black"
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
              Your Order<br/>is on the Way
            </h1>
            <p className="font-sans text-black/60 text-sm leading-7 max-w-[280px] mx-auto font-light">
              Our team at <span className="italic font-serif">La Reserve</span> is preparing your selection. Estimated delivery to <span className="text-black font-medium">Sunbed #{sunbedNumber}</span> in 15 minutes.
            </p>
          </div>
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
