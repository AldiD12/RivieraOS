export default function BusinessBottomSheet({ business, onClose, onVenueSelect, isDayMode }) {
  if (!business) return null;

  // DEBUG: See what the database is actually sending
  console.log("VENUE DATA RECEIVED:", business.venues);

  // SAFE EXTRACTION: Accounts for nulls, cases, and variations (e.g., "Beach Club", "Main Restaurant")
  const getSafeType = (v) => (v.type || v.venueType || v.category || "").toLowerCase();

  // 1. EXTRACT ACTION ZONES (Fuzzy Match)
  const beachVenue = business.venues.find(v => 
    getSafeType(v).includes('beach') || getSafeType(v).includes('sunbed')
  );
  const restaurantVenue = business.venues.find(v => 
    getSafeType(v).includes('restaurant') || getSafeType(v).includes('dining')
  );

  // 2. EXTRACT AMENITIES (Everything else)
  const amenityVenues = business.venues.filter(v => 
    !getSafeType(v).includes('beach') &&
    !getSafeType(v).includes('sunbed') &&
    !getSafeType(v).includes('restaurant') &&
    !getSafeType(v).includes('dining')
  );

  console.log("EXTRACTED DATA:", {
    beachVenue,
    restaurantVenue,
    amenityVenues,
    totalVenues: business.venues.length
  });

  // Generate amenity icons based on venue types
  const getAmenityIcons = () => {
    const amenities = [];
    
    // Always add private beach if this business has beach access
    if (beachVenue) {
      amenities.push({ icon: '🏖️', name: 'Private Beach' });
    }
    
    // Add amenities based on other venue types
    amenityVenues.forEach(venue => {
      switch(venue.type.toLowerCase()) {
        case 'bar':
          amenities.push({ icon: '🍸', name: 'Cocktail Bar' });
          break;
        case 'pool':
          amenities.push({ icon: '🏊‍♂️', name: 'Pool' });
          break;
        case 'lounge':
          amenities.push({ icon: '🛋️', name: 'VIP Lounge' });
          break;
        case 'boat':
          amenities.push({ icon: '⛵', name: 'Yacht Charter' });
          break;
        default:
          amenities.push({ icon: '✨', name: venue.type });
      }
    });

    // Add some standard luxury amenities
    amenities.push(
      { icon: '🎧', name: 'Live DJ' },
      { icon: '🅿️', name: 'Valet' }
    );
    
    // Remove duplicates and limit
    return amenities.filter((amenity, index, self) => 
      index === self.findIndex(a => a.name === amenity.name)
    ).slice(0, 6);
  };

  const startDirectBooking = (venueId) => {
    // Find the venue and trigger the booking flow
    const venue = business.venues.find(v => v.id === venueId);
    if (venue) {
      onVenueSelect(venue);
    }
  };

  const openWhatsApp = (phone) => {
    // Open WhatsApp with the restaurant's phone number
    const message = encodeURIComponent(`Hi! I'd like to make a reservation at ${business.name}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
      <div className="bg-[#F6F5F2] text-[#111111] p-6 rounded-t-sm">
        
        {/* TITLE & HEADER */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="font-serif text-4xl uppercase tracking-tight">{business.name}</h1>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-zinc-200 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* THE VIBE (Amenities Grid) -> NO CLICKS, JUST INFO */}
        <div className="flex flex-wrap gap-2 mb-8">
          {getAmenityIcons().map((amenity, index) => (
            <span 
              key={index}
              className="border border-zinc-300 px-3 py-1 text-xs font-mono uppercase"
            >
              {amenity.icon} {amenity.name}
            </span>
          ))}
        </div>

        {/* THE ACTION ZONES -> ONLY RENDER IF THEY EXIST */}
        <div className="flex flex-col gap-4">
          
          {/* BEACH CARD (Direct Booking) */}
          {beachVenue && (
            <div className="bg-white border border-zinc-300 p-4 rounded-sm flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-lg">THE BEACH</h3>
                <p className="text-[#10B981] font-mono text-xs mt-1">
                  🟢 {beachVenue.availableUnitsCount || 0} BEDS AVAILABLE
                </p>
              </div>
              <button 
                onClick={() => startDirectBooking(beachVenue.id)} 
                className="bg-[#111111] text-white px-4 py-3 font-mono text-xs uppercase font-bold hover:bg-zinc-800 transition-colors"
              >
                Secure Sunbed
              </button>
            </div>
          )}

          {/* RESTAURANT CARD (WhatsApp Bridge) */}
          {restaurantVenue && (
            <div className="bg-white border border-zinc-300 p-4 rounded-sm flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-lg">RESTAURANT</h3>
                <p className="text-zinc-500 font-mono text-xs mt-1">Mediterranean • €€</p>
              </div>
              <button 
                onClick={() => openWhatsApp(restaurantVenue.phone || business.phone)} 
                className="border border-[#111111] text-[#111111] px-4 py-3 font-mono text-xs uppercase font-bold hover:bg-zinc-100 transition-colors"
              >
                Request Table
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
