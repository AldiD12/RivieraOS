import { useState } from 'react';

export default function AssetBottomSheet({ asset, isOpen, onClose, isDayMode }) {
  if (!isOpen || !asset) return null;

  // Generate professional concierge WhatsApp message
  const handleInquireCharter = () => {
    const whatsappNumber = asset.whatsappNumber || asset.whatsAppNumber || asset.phone;
    
    if (!whatsappNumber) {
      alert(`Sorry, ${asset.name} doesn't have a WhatsApp number configured yet.`);
      return;
    }

    // Professional concierge message template
    const message = `🦅 XIXA CONCIERGE: YACHT CHARTER

Inquiry for: ${asset.name}
Location: ${asset.location || 'Albanian Riviera'}

I am interested in chartering this vessel. Please advise on:
• Daily/weekly rates
• Availability for upcoming dates
• Captain and crew included
• Fuel and additional costs

Thank you for your time.`;

    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Opening WhatsApp for yacht charter inquiry:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  // Map venue amenities to yacht specs
  const getAssetSpecs = () => {
    const specs = [];
    
    // Default yacht specs (can be customized per asset)
    if (asset.capacity || asset.maxGuests) {
      specs.push({ icon: '👥', label: `${asset.capacity || asset.maxGuests} PAX` });
    }
    
    if (asset.cabins) {
      specs.push({ icon: '🛏️', label: `${asset.cabins} CABINS` });
    }
    
    // Always include captain for yachts
    specs.push({ icon: '👨‍✈️', label: 'CAPTAIN INCLUDED' });
    
    if (asset.length) {
      specs.push({ icon: '📏', label: `${asset.length}M LENGTH` });
    }
    
    // Fuel typically excluded for charters
    specs.push({ icon: '⛽', label: 'FUEL EXCLUDED' });
    
    return specs;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Asset Sheet */}
      <div className={`
        relative w-full max-h-[85vh] overflow-y-auto
        ${isDayMode ? 'bg-stone-50' : 'bg-zinc-950'}
        rounded-t-3xl shadow-2xl
        transform transition-transform duration-500 ease-out
      `}>
        {/* Hero Image - Edge to Edge */}
        <div className="relative h-64 w-full overflow-hidden">
          {asset.imageUrl ? (
            <img 
              src={asset.imageUrl} 
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDayMode ? 'bg-stone-200' : 'bg-zinc-800'}`}>
              <span className="text-6xl">🛥️</span>
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Asset Details */}
        <div className="p-8">
          {/* Asset Name & Type */}
          <div className="mb-6">
            <h1 className={`font-serif text-4xl font-light tracking-tight mb-2 ${isDayMode ? 'text-stone-900' : 'text-white'}`}>
              {asset.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[#10FF88]">🛥️</span>
              <span className={`text-sm font-mono uppercase tracking-widest ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
                LUXURY YACHT CHARTER
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-4 h-4 ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`text-sm font-mono uppercase tracking-widest ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                LOCATION
              </span>
            </div>
            <p className={`text-lg ${isDayMode ? 'text-stone-700' : 'text-zinc-300'}`}>
              📍 {asset.location || 'Port of Orikum, Albanian Riviera'}
            </p>
          </div>

          {/* Asset Specs (Replaces Amenities) */}
          <div className="mb-8">
            <h3 className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
              SPECIFICATIONS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {getAssetSpecs().map((spec, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border
                    ${isDayMode 
                      ? 'bg-white border-stone-200 text-stone-700' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }
                  `}
                >
                  <span className="text-lg">{spec.icon}</span>
                  <span className="font-mono text-xs uppercase tracking-widest">
                    {spec.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="mb-8">
              <h3 className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                ABOUT THIS VESSEL
              </h3>
              <p className={`text-lg leading-relaxed ${isDayMode ? 'text-stone-600' : 'text-zinc-400'}`}>
                {asset.description}
              </p>
            </div>
          )}

          {/* Single CTA - Inquire Charter */}
          <div className="pt-6 border-t border-stone-200/40">
            <button
              onClick={handleInquireCharter}
              className={`
                w-full py-6 rounded-2xl font-mono text-sm uppercase tracking-widest
                transition-all duration-300 shadow-lg hover:shadow-xl
                ${isDayMode 
                  ? 'bg-stone-900 text-white hover:bg-stone-800' 
                  : 'bg-[#10FF88] text-zinc-950 hover:bg-[#0FE077] hover:shadow-[0_0_30px_rgba(16,255,136,0.4)]'
                }
              `}
            >
              📱 INQUIRE CHARTER
            </button>
            
            <p className={`text-center text-xs mt-3 ${isDayMode ? 'text-stone-500' : 'text-zinc-500'}`}>
              Professional concierge inquiry via WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}