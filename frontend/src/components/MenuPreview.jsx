import { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

/**
 * Read-only menu viewer for Discovery mode.
 * Fetches menu from /api/public/orders/menu?venueId=X
 * Shows categories and products — no ordering, just browsing.
 */
export default function MenuPreview({ venueId, venueName, isDayMode, onClose }) {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (!venueId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/public/Orders/menu?venueId=${venueId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setMenu(data);
        // Set first category as active
        const categories = data?.categories || data || [];
        if (Array.isArray(categories) && categories.length > 0) {
          setActiveCategory(categories[0].id || categories[0].name);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [venueId]);

  // Normalize menu data — API might return { categories: [...] } or just [...]
  const categories = useMemo(() => {
    if (!menu) return [];
    if (Array.isArray(menu)) return menu;
    if (menu.categories && Array.isArray(menu.categories)) return menu.categories;
    return [];
  }, [menu]);

  const activeProducts = useMemo(() => {
    if (!activeCategory || categories.length === 0) return [];
    const cat = categories.find(c => (c.id || c.name) === activeCategory);
    if (!cat) return [];
    return (cat.products || cat.items || []).filter(p => p.isAvailable !== false);
  }, [categories, activeCategory]);

  return (
    <div className={`fixed inset-0 z-[70] flex items-end`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu Sheet */}
      <div
        className={`relative w-full max-h-[90vh] flex flex-col rounded-t-2xl shadow-2xl overflow-hidden ${
          isDayMode ? 'bg-[#FAFAF9]' : 'bg-zinc-950'
        }`}
        style={{ animation: 'menuSlideUp 0.4s ease-out' }}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 pt-6 pb-4 border-b ${
          isDayMode ? 'bg-[#FAFAF9] border-stone-200' : 'bg-zinc-950 border-zinc-800'
        }`}>
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className={`w-10 h-1 rounded-full ${isDayMode ? 'bg-stone-300' : 'bg-zinc-700'}`} />
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                Menu
              </p>
              <h2 className={`text-2xl font-serif tracking-tight ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
                {venueName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isDayMode ? 'hover:bg-stone-200 text-stone-500' : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Browse-only notice */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-sm text-[10px] font-mono uppercase tracking-wider ${
            isDayMode ? 'bg-stone-100 text-stone-500 border border-stone-200' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Browse only — order on-site via QR
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar -mx-6 px-6">
              {categories.map(cat => {
                const catId = cat.id || cat.name;
                const isActive = activeCategory === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className={`whitespace-nowrap px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                      isActive
                        ? isDayMode
                          ? 'bg-stone-900 text-white'
                          : 'bg-white text-zinc-950'
                        : isDayMode
                          ? 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {cat.name}
                    {cat.products?.length > 0 && (
                      <span className={`ml-1.5 ${isActive ? 'opacity-60' : 'opacity-40'}`}>
                        {cat.products.filter(p => p.isAvailable !== false).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className={`w-10 h-10 border-2 rounded-full animate-spin mb-4 ${
                isDayMode ? 'border-stone-200 border-t-stone-800' : 'border-zinc-800 border-t-white'
              }`} />
              <p className={`text-sm font-mono ${isDayMode ? 'text-stone-400' : 'text-zinc-500'}`}>
                Loading menu...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className={`text-sm font-mono mb-2 ${isDayMode ? 'text-stone-500' : 'text-zinc-400'}`}>
                Menu not available
              </p>
              <p className={`text-xs ${isDayMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                This venue hasn't published their menu yet
              </p>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className={`text-sm font-mono ${isDayMode ? 'text-stone-500' : 'text-zinc-400'}`}>
                No menu items available
              </p>
            </div>
          )}

          {!loading && !error && activeProducts.map(product => (
            <div
              key={product.id || product.name}
              className={`flex gap-4 p-4 rounded-sm border transition-colors ${
                isDayMode
                  ? 'bg-white border-stone-200'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Product Image */}
              {product.imageUrl && (
                <div className="w-20 h-20 rounded-sm overflow-hidden shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-medium text-sm ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
                    {product.name}
                  </h4>
                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-bold ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
                      €{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                    {product.oldPrice > 0 && product.oldPrice !== product.price && (
                      <span className={`block text-[10px] line-through ${isDayMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                        €{product.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                    {product.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex gap-1.5 mt-2">
                  {product.isAlcohol && (
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm ${
                      isDayMode ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-amber-900/30 text-amber-400 border border-amber-800'
                    }`}>
                      21+
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes menuSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
