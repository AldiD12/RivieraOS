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
    
    return {
      guestName: savedName,
      guestPhone: savedPhone,
      guestCount: 2,
      date: new Date().toISOString().split('T')[0]
    };
  });
  const [submitting, setSubmitting] = useState(false);

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
        booking: bookingData
      });
      
      // 🚨 TRAP 2 FIX: Save guest info to localStorage for next time
      localStorage.setItem('riviera_guestName', bookingData.guestName);
      localStorage.setItem('riviera_guestPhone', bookingData.guestPhone);
      console.log('💾 Guest info saved for future bookings');
      
      // 🚨 TEMPORARY: Backend requires zoneUnitId but we only have zoneId
      // This needs backend update to support zone-level booking with auto-assignment
      // For now, show user-friendly message
      
      alert('⚠️ Booking system is being updated.\n\nPlease contact the venue directly via WhatsApp to reserve your spot.\n\nWe apologize for the inconvenience!');
      
      // Open WhatsApp to venue
      const venuePhone = venue.phone || '+355692000000';
      const message = `Përshëndetje! 👋

Dua të rezervoj:

🏖️ Vendi: ${venue.name}
📍 Zona: ${selectedZone.name}
👥 Persona: ${bookingData.guestCount}
📅 Data: ${new Date(bookingData.date).toLocaleDateString('sq-AL')}

Emri: ${bookingData.guestName}
Telefoni: ${bookingData.guestPhone}

Faleminderit!`;

      window.open(
        `https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
        '_blank'
      );
      
      // Close bottom sheet
      onClose();
      
      // TODO: Implement proper booking when backend supports zone-level booking
      // const result = await reservationApi.createReservation({
      //   venueId: venue.id,
      //   zoneId: selectedZone.id, // Backend needs to accept zoneId and auto-assign unit
      //   guestName: bookingData.guestName,
      //   guestPhone: bookingData.guestPhone,
      //   guestCount: bookingData.guestCount,
      //   reservationDate: bookingData.date,
      //   notes: 'Booked via Discovery Mode'
      // });
      
    } catch (error) {
      console.error('❌ Booking failed:', error);
      
      // Error haptic feedback
      if (haptics.isSupported()) {
        haptics.error();
      }
      
      alert('Booking failed. Please try again.');
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
              {availability.zones.map(zone => (
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
                        {zone.name}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <h3 
              className="text-3xl font-light text-stone-900 mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Complete Booking
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              {venue.name} - {selectedZone.name}
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+355 69 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={bookingData.guestCount}
                  onChange={(e) => setBookingData({ ...bookingData, guestCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedZone(null);
                  }}
                  disabled={submitting}
                  className="flex-1 border border-stone-300 text-stone-700 px-6 py-3 rounded-full hover:bg-stone-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
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
