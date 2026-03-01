import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import haptics from '../utils/haptics';

export default function VenueBottomSheet({ venue, onClose, isDayMode = false }) {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  // 🚨 TRAP 2 FIX: Load saved guest info from localStorage
  const [bookingData, setBookingData] = useState(() => {
    const savedName = localStorage.getItem('riviera_guestName') || '';
    const savedPhone = localStorage.getItem('riviera_guestPhone') || '';
    
    // Get current hour + 1 for default arrival time
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const defaultArrivalTime = `${nextHour.getHours().toString().padStart(2, '0')}:00`;
    
    return {
      guestName: savedName,
      guestPhone: savedPhone,
      guestCount: 2,
      sunbedCount: 1, // NEW: Default 1 sunbed
      arrivalTime: defaultArrivalTime, // NEW: Arrival time
      date: new Date().toISOString().split('T')[0]
    };
  });
  const [submitting, setSubmitting] = useState(false);

  // Helper: Suggest sunbed count based on guest count
  const suggestSunbedCount = (guestCount) => {
    if (guestCount <= 2) return 1;
    if (guestCount <= 4) return 2;
    if (guestCount <= 6) return 3;
    if (guestCount <= 8) return 4;
    return Math.ceil(guestCount / 2);
  };

  // Helper: Get helpful tip
  const getTip = () => {
    const { guestCount, sunbedCount } = bookingData;
    const suggested = suggestSunbedCount(guestCount);
    
    if (sunbedCount < suggested) {
      return `💡 Për ${guestCount} persona, rekomandojmë ${suggested} shtretër`;
    }
    return `✅ ${sunbedCount} shtretër ${sunbedCount === 1 ? 'është' : 'janë'} të mjaftueshëm për ${guestCount} persona`;
  };

  // Time slots (09:00 - 18:00, 30-min intervals)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const availability = venue.availability;
  const hasAvailability = availability && availability.availableUnits > 0;

  const handleZoneSelect = (zone) => {
      setSelectedZone(zone);
      setShowBookingForm(true);

      // Haptic feedback
      if (haptics.isSupported()) {
        haptics.light();
      }
    };

    // Sort zones by price (highest first = closest to beach)
    const getSortedZones = () => {
      if (!availability || !availability.zones) return [];
      return [...availability.zones].sort((a, b) => b.basePrice - a.basePrice);
    };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedZone) return;
    
    try {
      setSubmitting(true);
      
      // Haptic feedback
      if (haptics.isSupported()) {
        haptics.medium();
      }
      
      console.log('📝 Submitting booking...', {
        zone: selectedZone,
        booking: bookingData,
        venueType: venue.type
      });
      
      // Save guest info to localStorage
      localStorage.setItem('riviera_guestName', bookingData.guestName);
      localStorage.setItem('riviera_guestPhone', bookingData.guestPhone);
      
      // Check venue type
      const isBeach = venue.type === 'Beach';
      const isRestaurant = venue.type === 'Restaurant';
      
      if (isRestaurant) {
        // RESTAURANT: Open WhatsApp with prefilled message
        const venuePhone = venue.phone || '+355692000000';
        const message = `Përshëndetje! 👋

Dua të rezervoj tavolinë:

🍽️ Restoranti: ${venue.name}
👥 Persona: ${bookingData.guestCount}
📅 Data: ${new Date(bookingData.date).toLocaleDateString('sq-AL')}
🕐 Ora: ${bookingData.arrivalTime}

Emri: ${bookingData.guestName}
Telefoni: ${bookingData.guestPhone}

Faleminderit!`;

        window.open(
          `https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
          '_blank'
        );
        
        onClose();
      } else if (isBeach) {
        // BEACH: Instant booking (mock for now)
        const mockBookingCode = `XIXA-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        localStorage.setItem('temp_booking', JSON.stringify({
          bookingCode: mockBookingCode,
          venueName: venue.name,
          venuePhone: venue.phone,
          zoneName: selectedZone.name,
          unitCodes: [],
          guestCount: bookingData.guestCount,
          sunbedCount: bookingData.sunbedCount,
          arrivalTime: bookingData.arrivalTime,
          expirationTime: calculateExpiration(bookingData.arrivalTime),
          totalPrice: selectedZone.basePrice * bookingData.sunbedCount,
          status: 'CONFIRMED'
        }));
        
        navigate(`/success/${mockBookingCode}`);
      }
      
    } catch (error) {
      console.error('❌ Booking failed:', error);
      
      if (haptics.isSupported()) {
        haptics.error();
      }
      
      alert('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Calculate expiration time (arrival + 15 min)
  const calculateExpiration = (arrivalTime) => {
    const [hours, minutes] = arrivalTime.split(':').map(Number);
    const expMinutes = minutes + 15;
    const expHours = hours + Math.floor(expMinutes / 60);
    const finalMinutes = expMinutes % 60;
    return `${expHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-500 ${isDayMode ? 'bg-black/30' : 'bg-black/60'}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 rounded-t-[2rem] shadow-2xl z-50 max-h-[80vh] overflow-y-auto border-t ${isDayMode ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}
        style={{
          animation: 'slideUp 0.5s ease-out',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className={`w-12 h-1 rounded-full ${isDayMode ? 'bg-zinc-300' : 'bg-zinc-700'}`}></div>
        </div>

        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 transition-colors duration-300 ${isDayMode ? 'text-zinc-400 hover:text-zinc-950' : 'text-zinc-500 hover:text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Venue Header */}
          <h2 
            className={`text-5xl font-light mb-2 tracking-tight pr-8 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {venue.name}
          </h2>
          <p className={`text-sm uppercase tracking-widest mb-2 ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {venue.type}
          </p>
          <p className={`text-base mb-6 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {venue.address}
          </p>

          {/* Availability Summary */}
          {hasAvailability ? (
            <div className={`rounded-xl p-6 mb-8 border ${isDayMode ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isDayMode ? 'bg-emerald-500' : 'bg-[#10FF88]'}`}></div>
                <p className={`text-lg font-medium ${isDayMode ? 'text-emerald-900' : 'text-[#10FF88]'}`}>
                  {isDayMode ? 'Available Now' : 'LIVE NOW'}
                </p>
              </div>
              <p className={`text-2xl font-light mb-1 ${isDayMode ? 'text-emerald-800' : 'text-white'}`}>
                {availability.availableUnits} sunbeds available
              </p>
              {availability.zones && availability.zones.length > 0 && (
                <p className={`text-sm ${isDayMode ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  From €{Math.min(...availability.zones.map(z => z.basePrice))} per day
                </p>
              )}
            </div>
          ) : (
            <div className={`rounded-xl p-6 mb-8 border ${isDayMode ? 'bg-stone-50 border-stone-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <p className={`text-lg font-medium mb-1 ${isDayMode ? 'text-stone-700' : 'text-zinc-400'}`}>
                Fully Booked
              </p>
              <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-zinc-500'}`}>
                No availability at this time
              </p>
            </div>
          )}

          {/* Zones */}
          {availability && availability.zones && availability.zones.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className={`text-sm uppercase tracking-widest font-medium ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Available Zones
              </h3>
              {getSortedZones().map((zone, index) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneSelect(zone)}
                  disabled={zone.availableUnits === 0}
                  className={`
                    w-full rounded-xl p-6 border text-left
                    transition-all duration-300 ease-out
                    ${zone.availableUnits > 0 
                      ? isDayMode
                        ? 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-lg cursor-pointer'
                        : 'bg-zinc-900 border-zinc-800 hover:border-[#10FF88]/50 hover:shadow-[0_0_20px_rgba(16,255,136,0.2)] cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                    }
                    ${isDayMode ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`text-xl font-medium mb-2 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}>
                        Zone {index + 1} - {zone.name}
                      </h4>
                      <p className={`text-sm mb-1 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {zone.availableUnits} / {zone.totalUnits} available
                      </p>
                      <p className={`text-xs uppercase tracking-wider ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {zone.zoneType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p 
                        className={`text-3xl font-light mb-1 ${isDayMode ? 'text-zinc-950' : 'text-[#10FF88]'}`}
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        €{zone.basePrice}
                      </p>
                      <p className={`text-xs ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>per day</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          {venue.description && (
            <div className="mb-8">
              <h3 className={`text-sm uppercase tracking-widest font-medium mb-3 ${isDayMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                About
              </h3>
              <p className={`text-base leading-relaxed ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {venue.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {hasAvailability ? (
              <button
                onClick={() => {
                  if (availability.zones && availability.zones.length === 1) {
                    handleZoneSelect(availability.zones[0]);
                  } else {
                    alert('Please select a zone above');
                  }
                }}
                className={`flex-1 px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg' : 'bg-zinc-950 text-[#10FF88] border border-zinc-800 hover:shadow-[0_0_20px_rgba(16,255,136,0.4)]'}`}
              >
                Book Now
              </button>
            ) : (
              <button
                disabled
                className={`flex-1 px-8 py-4 rounded-full text-sm tracking-widest uppercase cursor-not-allowed ${isDayMode ? 'bg-zinc-200 text-zinc-400' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
              >
                Fully Booked
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 border px-8 py-4 rounded-full transition-all duration-300 ${isDayMode ? 'border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-stone-50' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedZone && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-4 ${isDayMode ? 'bg-black/30' : 'bg-black/60'}`}>
          <div 
            className={`rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto ${isDayMode ? 'bg-white' : 'bg-zinc-950 border border-zinc-800'}`}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <h3 
              className={`text-3xl font-light mb-2 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Rezervo Tani
            </h3>
            <p className={`text-sm mb-6 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {venue.name} - {selectedZone.name}
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Emri Juaj
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950 focus:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88] focus:border-[#10FF88]'}`}
                  placeholder="John Doe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Telefoni
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950 focus:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88] focus:border-[#10FF88]'}`}
                  placeholder="+355 69 123 4567"
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Sa persona jeni?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 2, label: '1-2' },
                    { value: 4, label: '3-4' },
                    { value: 6, label: '5-6' },
                    { value: 8, label: '7-8' },
                    { value: 10, label: '9+' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const newGuestCount = option.value;
                        setBookingData({
                          ...bookingData,
                          guestCount: newGuestCount,
                          sunbedCount: venue.type === 'Beach' ? suggestSunbedCount(newGuestCount) : 1
                        });
                      }}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${bookingData.guestCount === option.value
                          ? isDayMode
                            ? 'bg-zinc-950 text-white'
                            : 'bg-[#10FF88] text-zinc-950'
                          : isDayMode
                            ? 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#10FF88]'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunbed Count (Beach only) */}
              {venue.type === 'Beach' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                    Numri i shtretërve
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, sunbedCount: count })}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${bookingData.sunbedCount === count
                            ? isDayMode
                              ? 'bg-zinc-950 text-white'
                              : 'bg-[#10FF88] text-zinc-950'
                            : isDayMode
                              ? 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#10FF88]'
                          }
                        `}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <p className={`text-xs mt-2 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {getTip()}
                  </p>
                </div>
              )}

              {/* Arrival Time */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Ora e Arritjes
                </label>
                <select
                  value={bookingData.arrivalTime}
                  onChange={(e) => setBookingData({ ...bookingData, arrivalTime: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950 focus:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88] focus:border-[#10FF88]'}`}
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {venue.type === 'Beach' && (
                  <p className={`text-xs mt-2 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    ⏰ Rezervimi skadon 15 minuta pas orës së arritjes
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className={`rounded-lg p-4 border ${isDayMode ? 'bg-stone-50 border-zinc-300' : 'bg-zinc-900 border-zinc-800'}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Përmbledhje
                </p>
                {venue.type === 'Beach' ? (
                  <>
                    <p className={`text-sm mb-1 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      ✅ Do të rezervojmë {bookingData.sunbedCount} shtretër{bookingData.sunbedCount > 1 ? '' : ''} pranë njëri-tjetrit
                    </p>
                    <p className={`text-2xl font-light ${isDayMode ? 'text-zinc-950' : 'text-[#10FF88]'}`}>
                      €{(selectedZone.basePrice * bookingData.sunbedCount).toFixed(2)}
                    </p>
                    <p className={`text-xs ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {bookingData.sunbedCount} shtretër × €{selectedZone.basePrice}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`text-sm mb-1 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      📱 Do të dërgoni mesazh në WhatsApp për të konfirmuar rezervimin
                    </p>
                    <p className={`text-sm ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {bookingData.guestCount} persona • {bookingData.arrivalTime}
                    </p>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`
                  w-full px-8 py-4 rounded-full text-sm tracking-widest uppercase
                  transition-all duration-300 font-medium
                  ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDayMode
                    ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg'
                    : 'bg-zinc-950 text-[#10FF88] border border-zinc-800 hover:shadow-[0_0_20px_rgba(16,255,136,0.4)]'
                  }
                `}
              >
                {submitting 
                  ? 'Duke procesuar...' 
                  : venue.type === 'Beach' 
                    ? 'REZERVO TANI' 
                    : 'DËRGO MESAZH'
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `
      }} />
    </>
  );
}
