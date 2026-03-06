import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import haptics from '../utils/haptics';
import { reservationApi } from '../services/reservationApi';

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
      arrivalTime: defaultArrivalTime, // Use calculated default time
      date: new Date().toISOString().split('T')[0]
    };
  });
  const [submitting, setSubmitting] = useState(false);



  // Get current hour + 1 for default arrival time
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultArrivalTime = `${nextHour.getHours().toString().padStart(2, '0')}:00`;

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
        venueType: venue.type,
        venueName: venue.name,
        fullVenue: venue,
        apiPayload: {
          venueId: venue.id,
          zoneId: selectedZone.id,
          guestName: bookingData.guestName,
          guestPhone: bookingData.guestPhone,
          sunbedCount: bookingData.sunbedCount,
          arrivalTime: bookingData.arrivalTime,
          reservationDate: bookingData.date,
          notes: 'Booked via XIXA Discovery'
        }
      });
      
      // Save guest info to localStorage
      localStorage.setItem('riviera_guestName', bookingData.guestName);
      localStorage.setItem('riviera_guestPhone', bookingData.guestPhone);
      
      // Check venue type (case-insensitive and partial match)
      const venueType = (venue.type || '').toLowerCase();
      const isBeach = venueType.includes('beach') || venueType.includes('plazh');
      const isRestaurant = venueType.includes('restaurant') || venueType.includes('restorant');
      
      console.log('🔍 Type check:', { venueType, isBeach, isRestaurant });
      
      if (isRestaurant) {
        // RESTAURANT: Open WhatsApp with prefilled message
        console.log('📱 Opening WhatsApp for restaurant booking...');
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

        const whatsappUrl = `https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        console.log('📱 WhatsApp URL:', whatsappUrl);
        
        window.open(whatsappUrl, '_blank');
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 500);
        
      } else if (isBeach) {
        // BEACH: Real instant booking API
        console.log('🏖️ Creating beach reservation...', {
          venueId: venue.id,
          zoneId: selectedZone.id,
          guestName: bookingData.guestName,
          guestPhone: bookingData.guestPhone,
          guestCount: bookingData.guestCount,
          sunbedCount: bookingData.sunbedCount,
          arrivalTime: bookingData.arrivalTime,
          reservationDate: bookingData.date
        });
        
        const result = await reservationApi.createReservation({
          venueId: venue.id,
          zoneId: selectedZone.id,
          guestName: bookingData.guestName,
          guestPhone: bookingData.guestPhone,
          sunbedCount: bookingData.sunbedCount,
          arrivalTime: bookingData.arrivalTime + ":00", // Add seconds format
          reservationDate: bookingData.date,
          notes: 'Booked via XIXA Discovery'
        });
        
        console.log('✅ Booking successful:', result);
        navigate(`/success/${result.bookingCode}`);
      } else {
        console.warn('⚠️ Unknown venue type:', venueType);
        alert('Lloji i vendit nuk është i njohur. Ju lutem kontaktoni stafin.');
      }
      
    } catch (error) {
      console.error('❌ Booking failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      if (haptics.isSupported()) {
        haptics.error();
      }
      
      // Better error handling
      if (error.response?.data?.error === 'INSUFFICIENT_CAPACITY') {
        const available = error.response.data.availableUnits;
        alert(`Na vjen keq, vetëm ${available} shtretër të lirë në këtë zonë. Ju lutem zgjidhni më pak shtretër ose provoni zonë tjetër.`);
      } else if (error.message.includes('Invalid arrivalTime')) {
        alert('Ora e arritjes është e pavlefshme. Ju lutem provoni përsëri.');
      } else if (error.response?.status === 404) {
        alert('Vendi ose zona nuk u gjet. Ju lutem provoni përsëri.');
      } else if (error.response?.status === 400) {
        console.error('❌ 400 Bad Request Details:', {
          data: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers
        });
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data || 'Invalid request data';
        alert(`Bad Request: ${JSON.stringify(errorMsg)}\n\nPlease check the console for details.`);
      } else {
        alert(`Rezervimi dështoi: ${error.message}\n\nJu lutem provoni përsëri ose kontaktoni stafin.`);
      }
    } finally {
      setSubmitting(false);
    }
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
          <div className={`w-12 h-1 rounded-sm ${isDayMode ? 'bg-zinc-300' : 'bg-zinc-700'}`}></div>
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
            <div className={`rounded-sm p-6 mb-8 border ${isDayMode ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-sm animate-pulse ${isDayMode ? 'bg-emerald-500' : 'bg-[#10FF88]'}`}></div>
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
            <div className={`rounded-sm p-6 mb-8 border ${isDayMode ? 'bg-stone-50 border-stone-200' : 'bg-zinc-900 border-zinc-800'}`}>
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
                    w-full rounded-sm p-6 border text-left
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

          {/* Get Directions Button */}
          {venue.latitude && venue.longitude && (
            <button
              onClick={() => {
                // Open native maps app with directions
                const destination = `${venue.latitude},${venue.longitude}`;
                const label = encodeURIComponent(venue.name);
                
                // Detect platform and open appropriate maps app
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);
                
                let mapsUrl;
                if (isIOS) {
                  // Apple Maps
                  mapsUrl = `maps://maps.apple.com/?daddr=${destination}&q=${label}`;
                } else if (isAndroid) {
                  // Google Maps
                  mapsUrl = `google.navigation:q=${destination}`;
                } else {
                  // Desktop - Google Maps web
                  mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`;
                }
                
                window.open(mapsUrl, '_blank');
                
                // Haptic feedback
                if (haptics.isSupported()) {
                  haptics.light();
                }
              }}
              className={`w-full mb-6 px-6 py-4 rounded-sm border flex items-center justify-center gap-3 transition-all duration-300 ${isDayMode ? 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-950 hover:bg-stone-50 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#10FF88] hover:text-[#10FF88]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-medium tracking-wide">Get Directions</span>
            </button>
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
                className={`flex-1 px-8 py-4 rounded-sm text-sm tracking-widest uppercase transition-all duration-300 ${isDayMode ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg' : 'bg-zinc-950 text-[#10FF88] border border-zinc-800 hover:shadow-[0_0_20px_rgba(16,255,136,0.4)]'}`}
              >
                Book Now
              </button>
            ) : (
              <button
                disabled
                className={`flex-1 px-8 py-4 rounded-sm text-sm tracking-widest uppercase cursor-not-allowed ${isDayMode ? 'bg-zinc-200 text-zinc-400' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
              >
                Fully Booked
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 border px-8 py-4 rounded-sm transition-all duration-300 ${isDayMode ? 'border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-stone-50' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedZone && (
        <div className={`fixed inset-0 backdrop-blur-lg flex items-center justify-center z-[60] p-4 ${isDayMode ? 'bg-black/30' : 'bg-black/60'}`}>
          <div 
            className={`rounded-sm p-8 max-w-md w-full max-h-[90vh] overflow-y-auto ${isDayMode ? 'bg-white' : 'bg-zinc-950 border border-zinc-800'}`}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <h3 
              className={`text-3xl font-light mb-2 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
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
                  className={`w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950 focus:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88] focus:border-[#10FF88]'}`}
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
                  className={`w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950 focus:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88] focus:border-[#10FF88]'}`}
                  placeholder="+355 69 123 4567"
                />
              </div>

              {/* Guest Count (Restaurant only) */}
              {(venue.type || '').toLowerCase().includes('restaurant') && (
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
                        onClick={() => setBookingData({ ...bookingData, guestCount: option.value })}
                        className={`
                          px-3 py-2 rounded-sm text-sm font-medium transition-all
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
              )}

              {/* Sunbed Count (Beach only) */}
              {(venue.type || '').toLowerCase().includes('beach') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                    Sa shtretër dëshironi?
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, sunbedCount: count })}
                        className={`
                          px-3 py-2 rounded-sm text-sm font-medium transition-all
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
                </div>
              )}



              {/* Arrival Time */}
              {/* Arrival Time - Simple 4-Button Grid (CONCIERGE UX) */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  When will you arrive?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { time: '09:00', label: 'MORNING', desc: '9:00 AM' },
                    { time: '12:00', label: 'NOON', desc: '12:00 PM' },
                    { time: '15:00', label: 'AFTERNOON', desc: '3:00 PM' },
                    { time: '17:00', label: 'LATE', desc: '5:00 PM' }
                  ].map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, arrivalTime: slot.time })}
                      className={`
                        py-4 px-3 rounded-sm border text-center transition-all duration-300
                        ${bookingData.arrivalTime === slot.time
                          ? isDayMode
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-[#10FF88] bg-[#10FF88]/10 text-[#10FF88]'
                          : isDayMode
                          ? 'border-zinc-300 text-zinc-700 hover:border-zinc-950'
                          : 'border-zinc-700 text-zinc-400 hover:border-[#10FF88]'
                        }
                      `}
                    >
                      <div className="font-medium text-sm tracking-widest">{slot.label}</div>
                      <div className="text-xs opacity-70 mt-1">{slot.desc}</div>
                    </button>
                  ))}
                </div>
                {(venue.type || '').toLowerCase().includes('beach') && (
                  <p className={`text-xs mt-3 text-center ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    ⏰ Reservation expires 15 minutes after arrival time
                  </p>
                )}
              </div>

              {/* Summary - CASH IS KING Psychology */}
              <div className="text-center py-6 border-t border-zinc-200">
                <p className={`text-xs uppercase tracking-widest mb-2 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  TOTAL TO PAY IN CASH
                </p>
                <h2 className={`text-5xl font-serif mb-2 ${isDayMode ? 'text-zinc-950' : 'text-[#10FF88]'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  €{Math.round(selectedZone.basePrice * bookingData.sunbedCount)}
                </h2>
                <p className={`text-xs ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Pay at entrance • No prepayment required
                </p>
              </div>

              {/* Submit Button */}
              {/* Submit Button - VIP GLOW EFFECT */}
              <button
                type="submit"
                disabled={submitting}
                className={`
                  w-full px-8 py-6 rounded-sm text-sm tracking-widest uppercase
                  transition-all duration-300 font-bold
                  ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDayMode
                    ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
                    : 'bg-zinc-950 text-[#10FF88] border border-zinc-800 hover:shadow-[0_0_30px_rgba(16,255,136,0.6)] shadow-[0_0_20px_rgba(16,255,136,0.3)]'
                  }
                `}
              >
                {submitting 
                  ? 'SECURING ACCESS...' 
                  : 'CONFIRM ACCESS'
                }
              </button>
              
              <p className={`text-center text-xs mt-3 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Pay €{Math.round(selectedZone.basePrice * bookingData.sunbedCount)} cash at the entrance
              </p>
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
