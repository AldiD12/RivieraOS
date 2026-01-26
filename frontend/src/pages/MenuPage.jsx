import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Check, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';
const VENUE_ID = 1;

// High-quality drink photos
const DRINK_IMAGES = {
  'Mojito': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'Piña Colada': 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80',
  'Aperol Spritz': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
  'Water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
  'Coca Cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
  'Beer': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
};

// Parallax Card Component
function ParallaxCard({ item, index, addToCart, addedItems }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={`relative ${index % 2 === 0 ? 'mt-0' : 'mt-32'}`}
    >
      {/* The Card */}
      <div className="group relative">
        {/* Ultra-Tall Portrait Image - Liquid Portal */}
        <motion.div 
          style={{ y, aspectRatio: '3/4' }}
          className="relative overflow-hidden rounded-2xl"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Reveal Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/90"></div>

          {/* Floating Orb - Magnetic Add Button */}
          <motion.button
            onClick={() => addToCart(item)}
            className="absolute bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center font-bold transition-all duration-300 active:scale-95 z-10"
            style={{ 
              background: '#9f7928',
              boxShadow: '0 8px 32px rgba(159, 121, 40, 0.6)'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {addedItems.has(item.id) ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-6 h-6 text-zinc-950 font-black" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <span className="font-geist-mono text-2xl text-zinc-950 font-black">+</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Content - The Story */}
        <div className="mt-6 px-2">
          {/* Title - Large Serif */}
          <h3 className="text-3xl md:text-4xl font-display font-light italic text-zinc-100 mb-3 tracking-tight leading-tight">
            {item.name}
          </h3>

          {/* Line Connector */}
          <div className="w-12 h-px bg-[#9f7928] mb-3"></div>

          {/* Price - Bronze Mono */}
          <div className="font-geist-mono text-sm font-bold text-[#9f7928] uppercase tracking-[0.3em] mb-3">
            €{item.basePrice.toFixed(2)}
          </div>

          {/* Description - Tiny Sans, Faded */}
          {item.description && (
            <p className="text-xs font-geist-sans text-zinc-500 leading-relaxed max-w-xs">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const bedId = searchParams.get('bedId');
  const [sunbedName, setSunbedName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    fetchVenueData();
  }, []);

  const fetchVenueData = async () => {
    try {
      const response = await fetch(`${API_URL}/venue/${VENUE_ID}/layout`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (bedId) {
        for (const zone of data.zones) {
          const sunbed = zone.products.find(p => p.id === parseInt(bedId));
          if (sunbed) {
            setSunbedName(sunbed.unitCode);
            break;
          }
        }
      }
      
      if (!data.categories) {
        console.error('No categories in response!');
        setLoading(false);
        return;
      }
      
      const drinkCategories = data.categories.filter(c => c.type === 1);
      const allDrinks = drinkCategories.flatMap(category => 
        category.products.map(product => ({
          ...product,
          categoryName: category.name,
          imageUrl: DRINK_IMAGES[product.name] || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80'
        }))
      );
      
      setMenuItems(allDrinks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue data:', error);
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.categoryName))];
  const filteredItems = activeCategory === 'all' 
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

    setAddedItems(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1000);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: VENUE_ID,
          productId: bedId ? parseInt(bedId) : null,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.basePrice
          }))
        })
      });

      if (response.ok) {
        setOrderPlaced(true);
        setCart([]);
        setTimeout(() => setOrderPlaced(false), 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a]">
        <div className="text-center">
          <div className="inline-block w-20 h-20 border-[2px] border-zinc-800 border-t-[#9f7928] rounded-full animate-spin mb-6"></div>
          <p className="text-zinc-400 font-geist-mono text-xl tracking-wide font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!bedId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a]">
        <div className="backdrop-blur-2xl bg-zinc-900/40 rounded-2xl p-16 text-center">
          <h1 className="text-5xl font-display font-light text-zinc-100 mb-4 tracking-tight">Welcome to Riviera</h1>
          <p className="text-zinc-400 text-lg">Please scan your sunbed QR code to order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a] pb-40">
      {/* Grain Overlay - 4% */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-50" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Heavy Vignette */}
      <div className="fixed inset-0 pointer-events-none z-40" style={{
        background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)'
      }}></div>

      {/* Massive Header - Graphic Element with Blend Mode */}
      <div className="sticky top-0 z-30 pt-12 pb-8 px-6">
        <h1 
          className="text-5xl md:text-8xl font-display font-light text-zinc-100 tracking-tighter leading-none text-center"
          style={{ mixBlendMode: 'difference' }}
        >
          Riviera Beach Club
        </h1>
        {sunbedName && (
          <p className="text-center text-sm font-geist-mono text-zinc-500 uppercase tracking-[0.3em] mt-4">
            Sunbed {sunbedName}
          </p>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-8 px-6 justify-center scrollbar-hide mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-xs font-geist-mono uppercase tracking-[0.3em] whitespace-nowrap px-6 py-3 rounded-full transition-all duration-500 ${
              activeCategory === category
                ? 'bg-[#9f7928] text-zinc-950'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-8 py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6" />
              <div>
                <p className="font-display font-light text-2xl">Order Placed</p>
                <p className="text-sm">Your drinks will arrive shortly</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fluid Brutalism Grid - Offset Staggered Layout */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-3xl text-zinc-500 font-display font-light italic">No items available</p>
        </div>
      ) : (
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
            {filteredItems.map((item, index) => (
              <ParallaxCard
                key={item.id}
                item={item}
                index={index}
                addToCart={addToCart}
                addedItems={addedItems}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-2xl p-6 z-40"
          style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -20px 60px -15px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-zinc-400" />
                <span className="text-lg font-geist-sans text-zinc-300">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <button onClick={() => setCart([])} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xl font-display font-light text-zinc-100">Total</span>
              <span className="text-4xl font-geist-mono font-bold text-[#9f7928] tabular-nums">
                €{getCartTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={placeOrder}
              className="w-full mt-6 text-zinc-950 py-5 rounded-2xl font-geist-mono font-black text-sm uppercase tracking-[0.3em] transition-all duration-300 active:scale-98"
              style={{ 
                background: '#9f7928',
                boxShadow: '0 8px 32px rgba(159, 121, 40, 0.6)'
              }}
            >
              Place Order
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
