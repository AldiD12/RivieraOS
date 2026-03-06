import { useNavigate } from 'react-router-dom';

export default function BusinessBottomSheet({ business, onClose, onVenueSelect, isDayMode }) {
  const navigate = useNavigate();

  if (!business) return null;

  // Check if this business should show individual venues (Restaurant and Beach only)
  const shouldShowVenues = business.venues.some(v => 
    v.type === 'Restaurant' || v.type === 'RESTAURANT' || 
    v.type === 'Beach' || v.type === 'BEACH'
  );

  // Generate features/amenities based on venue types
  const getBusinessFeatures = () => {
    const features = [];
    const venueTypes = [...new Set(business.venues.map(v => v.type))];
    
    venueTypes.forEach(type => {
      switch(type) {
        case 'Beach':
        case 'BEACH':
          features.push(
            { icon: '🏖️', name: 'Beach Access', description: 'Private beach area with sunbeds' },
            { icon: '🏊‍♂️', name: 'Swimming Pool', description: 'Infinity pool with sea views' },
            { icon: '🍹', name: 'Pool Bar', description: 'Cocktails and refreshments' }
          );
          break;
        case 'Restaurant':
        case 'RESTAURANT':
          features.push(
            { icon: '🍽️', name: 'Fine Dining', description: 'Gourmet cuisine experience' },
            { icon: '🍷', name: 'Wine Selection', description: 'Curated wine collection' },
            { icon: '👨‍🍳', name: 'Chef\'s Table', description: 'Exclusive dining experience' }
          );
          break;
        case 'Bar':
        case 'BAR':
          features.push(
            { icon: '🍸', name: 'Cocktail Bar', description: 'Premium spirits and mixology' },
            { icon: '🎵', name: 'Live Music', description: 'Evening entertainment' },
            { icon: '🌅', name: 'Sunset Views', description: 'Perfect for golden hour' }
          );
          break;
        case 'Boat':
        case 'BOAT':
          features.push(
            { icon: '⛵', name: 'Yacht Charter', description: 'Luxury boat experiences' },
            { icon: '🐠', name: 'Snorkeling', description: 'Explore underwater life' },
            { icon: '🏝️', name: 'Island Hopping', description: 'Visit secluded beaches' }
          );
          break;
        default:
          features.push(
            { icon: '✨', name: 'Premium Service', description: 'Exceptional hospitality' },
            { icon: '🌊', name: 'Sea Views', description: 'Stunning coastal panoramas' },
            { icon: '🍾', name: 'VIP Experience', description: 'Exclusive amenities' }
          );
      }
    });
    
    // Remove duplicates and limit to 6 features
    const uniqueFeatures = features.filter((feature, index, self) => 
      index === self.findIndex(f => f.name === feature.name)
    ).slice(0, 6);
    
    return uniqueFeatures;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
      <div 
        className={`
          rounded-t-[2rem] overflow-hidden
          max-h-[70vh] overflow-y-auto
          ${isDayMode 
            ? 'bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl border-t border-stone-200/40' 
            : 'bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-800'
          }
        `}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-6 border-b ${isDayMode ? 'bg-white/80 backdrop-blur-md border-stone-200/40' : 'bg-zinc-900/90 backdrop-blur-md border-zinc-800'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className={`text-3xl font-serif font-light tracking-tight mb-2 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>
                {business.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {business.venues.length} {business.venues.length === 1 ? 'venue' : 'venues'}
                </span>
                {business.totalAvailableUnits > 0 && (
                  <span className={`${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {business.totalAvailableUnits} spots available
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-colors
                ${isDayMode 
                  ? 'bg-stone-100 hover:bg-stone-200 text-zinc-950' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {shouldShowVenues ? (
            /* Show individual venues for Restaurant and Beach */
            <div className="space-y-4">
              <h3 className={`text-lg font-medium mb-4 ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                Available Venues
              </h3>
              {business.venues.map((venue) => {
                const isAvailable = venue.availableUnitsCount >= 15;
                const isFewLeft = venue.availableUnitsCount > 0 && venue.availableUnitsCount < 15;
                const isFull = venue.availableUnitsCount === 0;

                return (
                  <div
                    key={venue.id}
                    onClick={() => onVenueSelect(venue)}
                    className={`
                      group relative overflow-hidden rounded-xl cursor-pointer
                      transition-all duration-300
                      ${isDayMode 
                        ? 'bg-white border border-stone-200/40 hover:shadow-lg' 
                        : 'bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800'
                      }
                    `}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className={`text-xl font-serif tracking-tight mb-1 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>
                            {venue.name}
                          </h4>
                          <p className={`text-sm ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {venue.type}
                          </p>
                        </div>
                        
                        {/* Availability Badge - only for beach venues */}
                        {(venue.type === 'Beach' || venue.type === 'BEACH') && (
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-bold
                            ${isAvailable 
                              ? isDayMode
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                              : isFewLeft
                              ? isDayMode
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-amber-900/30 text-amber-400 border border-amber-800'
                              : isDayMode
                              ? 'bg-stone-100 text-stone-600 border border-stone-200'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }
                          `}>
                            {isFull ? 'Full' : `${venue.availableUnitsCount} spots`}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {venue.description && (
                        <p className={`text-sm mb-4 line-clamp-2 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {venue.description}
                        </p>
                      )}

                      {/* Action Button */}
                      <button
                        className={`
                          w-full py-3 rounded-lg text-sm font-medium uppercase tracking-wider
                          transition-all duration-300
                          ${isDayMode 
                            ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
                            : 'bg-white text-zinc-950 hover:bg-zinc-100'
                          }
                          ${isFull ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        disabled={isFull}
                      >
                        {isFull ? 'Fully Booked' : 'View Details'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Show features/amenities for other venue types */
            <div className="space-y-6">
              <h3 className={`text-lg font-medium mb-4 ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                Features & Amenities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {getBusinessFeatures().map((feature, index) => (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-xl transition-all duration-300
                      ${isDayMode 
                        ? 'bg-white border border-stone-200/40 hover:shadow-sm' 
                        : 'bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h4 className={`font-medium mb-1 ${isDayMode ? 'text-zinc-900' : 'text-white'}`}>
                      {feature.name}
                    </h4>
                    <p className={`text-xs ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Contact Button */}
              <button
                className={`
                  w-full py-4 rounded-xl text-sm font-medium uppercase tracking-wider
                  transition-all duration-300
                  ${isDayMode 
                    ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
                    : 'bg-white text-zinc-950 hover:bg-zinc-100'
                  }
                `}
              >
                Contact for Reservations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
