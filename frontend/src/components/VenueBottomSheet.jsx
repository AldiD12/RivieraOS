import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const getHaptics = () => import('../utils/haptics').then(m => m.default);
const getReservationApi = () => import('../services/reservationApi').then(m => m.reservationApi);
const MenuPreview = lazy(() => import('./MenuPreview'));

export default function VenueBottomSheet({ venue, onClose, isDayMode = false }) {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [bookingData, setBookingData] = useState(() => {
    const savedName = localStorage.getItem('riviera_guestName') || '';
    const savedPhone = localStorage.getItem('riviera_guestPhone') || '';

    const now = new Date();
    const defaultDate = now.getHours() >= 18
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : now;

    return {
      guestName: savedName,
      guestPhone: savedPhone,
      guestCount: 2,
      sunbedCount: 1,
      arrivalTime: '10:00',
      date: defaultDate.toISOString().split('T')[0]
    };
  });
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const venueType = (venue.type || '').toLowerCase();
  const isBeachVenue = venueType.includes('beach') || venueType.includes('plazh');

  const availability = venue.availability;
  const hasAvailability = availability && availability.availableUnits > 0;
  const isBeach = isBeachVenue;

  const handleZoneSelect = async (zone) => {
    setSelectedZone(zone);
    setShowBookingForm(true);
    try {
      const haptics = await getHaptics();
      if (haptics.isSupported()) haptics.light();
    } catch (_) {}
  };

  const getSortedZones = () => {
    if (!availability || !availability.zones) return [];
    return [...availability.zones].sort((a, b) => b.basePrice - a.basePrice);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedZone || !bookingData || !venue) return;

    try {
      setSubmitting(true);
      try {
        const haptics = await getHaptics();
        if (haptics.isSupported()) haptics.medium();
      } catch (_) {}

      // Save guest info
      localStorage.setItem('riviera_guestName', bookingData.guestName);
      localStorage.setItem('riviera_guestPhone', bookingData.guestPhone);

      const venueType = (venue.type || '').toLowerCase();
      const isBeach = venueType.includes('beach') || venueType.includes('plazh');
      const isRestaurant = venueType.includes('restaurant') || venueType.includes('restorant');

      if (isRestaurant) {
        // Restaurant: WhatsApp with real venue phone (no hardcoded fallback)
        const venuePhone = venue.whatsappNumber || venue.whatsAppNumber || venue.phone;
        if (!venuePhone) {
          showToast('This venue has no contact number configured yet.');
          setSubmitting(false);
          return;
        }

        const message = `Hi! 👋

I'd like to reserve a table:

🍽️ Restaurant: ${venue.name}
👥 Guests: ${bookingData.guestCount}
📅 Date: ${new Date(bookingData.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
🕐 Time: ${bookingData.arrivalTime}

Name: ${bookingData.guestName}
Phone: ${bookingData.guestPhone}

Thank you!`;

        const whatsappUrl = `https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setTimeout(() => onClose(), 500);

      } else if (isBeach) {
        // Beach: Real API reservation
        const apiPayload = {
          venueId: venue.id,
          zoneId: selectedZone.id,
          guestName: bookingData.guestName,
          guestPhone: bookingData.guestPhone,
          guestCount: bookingData.guestCount || 2,
          sunbedCount: bookingData.sunbedCount,
          arrivalTime: bookingData.arrivalTime,
          reservationDate: bookingData.date,
          startTime: bookingData.date + 'T' + bookingData.arrivalTime + ':00',
          notes: 'Booked via XIXA Discovery'
        };

        const resApi = await getReservationApi();
        const result = await resApi.createReservation(apiPayload);
        navigate(`/success/${result.bookingCode}`);
      } else {
        showToast('Booking not available for this venue type.');
      }

    } catch (error) {
      try {
        const haptics = await getHaptics();
        if (haptics.isSupported()) haptics.error();
      } catch (_) {}

      if (error.response?.data?.error === 'INSUFFICIENT_CAPACITY') {
        const available = error.response.data.availableUnits;
        showToast(`Only ${available} beds available in this zone. Please select fewer or try another zone.`);
      } else if (error.message?.includes('Invalid arrivalTime')) {
        showToast('Invalid arrival time. Please try again.');
      } else if (error.response?.status === 404) {
        showToast('Venue or zone not found. Please try again.');
      } else if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request';
        showToast(`Booking failed: ${msg}`);
      } else {
        showToast(`Booking failed: ${error.message || 'Unknown error'}. Please try again.`);
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
        style={{ animation: 'slideUp 0.5s ease-out', fontFamily: 'Inter, sans-serif' }}
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
          {venue.description && (
            <p className={`text-base mb-4 leading-relaxed ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {venue.description}
            </p>
          )}
          {venue.address && (
            <p className={`text-sm mb-4 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              {venue.address}
            </p>
          )}

          {/* View Menu Button (for any venue that might have a digital menu) */}
          {venue?.type?.toLowerCase() === 'restaurant' && (
            <button
              onClick={() => setShowMenu(true)}
              className={`w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-sm border transition-all duration-300 ${
                isDayMode
                  ? 'border-stone-300 text-stone-600 hover:border-stone-500 hover:bg-stone-50'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium tracking-wide">View Menu</span>
            </button>
          )}

          {/* Availability Summary */}
          {isBeachVenue && (
            hasAvailability ? (
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
            )
          )}

          {/* Zones */}
          {isBeachVenue && availability && availability.zones && availability.zones.length > 0 && (
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
                    w-full rounded-sm p-6 border text-left transition-all duration-300 ease-out
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
                      {zone.zoneType && (
                        <p className={`text-xs uppercase tracking-wider ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                          {zone.zoneType}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-light mb-1 ${isDayMode ? 'text-zinc-950' : 'text-[#10FF88]'}`}
                         style={{ fontFamily: 'Playfair Display, serif' }}>
                        €{zone.basePrice}
                      </p>
                      <p className={`text-xs ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{isBeach ? 'per day' : 'per person'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Get Directions */}
          {venue.latitude && venue.longitude && (
            <button
              onClick={() => {
                const dest = `${venue.latitude},${venue.longitude}`;
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const url = isIOS
                  ? `maps://maps.apple.com/?daddr=${dest}&q=${encodeURIComponent(venue.name)}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
                window.open(url, '_blank');
              }}
              className={`w-full mb-6 px-6 py-4 rounded-sm border flex items-center justify-center gap-3 transition-all duration-300 ${isDayMode ? 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-950 shadow-sm' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#10FF88] hover:text-[#10FF88]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-medium tracking-wide">Get Directions</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isBeachVenue ? (
              hasAvailability ? (
                <button
                  onClick={() => {
                    if (availability.zones && availability.zones.length === 1) {
                      handleZoneSelect(availability.zones[0]);
                    } else {
                      showToast('Please select a zone above');
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
              )
            ) : (
              <button
                onClick={() => {
                  setSelectedZone({ id: 'whatsapp-only', name: 'Reservation', basePrice: 0 });
                  setShowBookingForm(true);
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-8 py-4 rounded-sm text-sm tracking-widest uppercase transition-all duration-300 ${isDayMode ? 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg' : 'bg-[#25D366] text-zinc-950 hover:bg-[#128C7E] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Book via WhatsApp
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

        {/* Toast */}
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
            <div className={`px-5 py-3 rounded-sm shadow-lg text-sm font-mono tracking-wide ${isDayMode ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'}`}>
              {toast}
            </div>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedZone && (
        <div className={`fixed inset-0 backdrop-blur-lg flex items-center justify-center z-[60] p-4 ${isDayMode ? 'bg-black/30' : 'bg-black/60'}`}>
          <div
            className={`rounded-sm p-8 max-w-md w-full max-h-[90vh] overflow-y-auto ${isDayMode ? 'bg-white' : 'bg-zinc-950 border border-zinc-800'}`}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <h3 className={`text-3xl font-light mb-2 ${isDayMode ? 'text-zinc-950' : 'text-white'}`}
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Book Now
            </h3>
            <p className={`text-sm mb-6 ${isDayMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {venue.name} - {selectedZone.name}
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Your Name</label>
                <input
                  type="text" required
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88]'}`}
                  placeholder="John Doe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Phone</label>
                <input
                  type="tel" required
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88]'}`}
                  placeholder="+355 69 123 4567"
                />
              </div>

              {/* Guest Count (Restaurant) */}
              {(venue.type || '').toLowerCase().includes('restaurant') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Number of Guests</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[{ value: 2, label: '1-2' }, { value: 4, label: '3-4' }, { value: 6, label: '5-6' }, { value: 8, label: '7-8' }, { value: 10, label: '9+' }].map(option => (
                      <button key={option.value} type="button"
                        onClick={() => setBookingData({ ...bookingData, guestCount: option.value })}
                        className={`px-3 py-2 rounded-sm text-sm font-medium transition-all ${bookingData.guestCount === option.value
                          ? isDayMode ? 'bg-zinc-950 text-white' : 'bg-[#10FF88] text-zinc-950'
                          : isDayMode ? 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#10FF88]'
                        }`}
                      >{option.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sunbed Count (Beach) */}
              {(venue.type || '').toLowerCase().includes('beach') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Number of Sunbeds</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(count => (
                      <button key={count} type="button"
                        onClick={() => setBookingData({ ...bookingData, sunbedCount: count })}
                        className={`px-3 py-2 rounded-sm text-sm font-medium transition-all ${bookingData.sunbedCount === count
                          ? isDayMode ? 'bg-zinc-950 text-white' : 'bg-[#10FF88] text-zinc-950'
                          : isDayMode ? 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#10FF88]'
                        }`}
                      >{count}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Date</label>
                <input
                  type="date" required
                  value={bookingData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2 transition-all ${isDayMode ? 'border border-zinc-300 focus:ring-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-white focus:ring-[#10FF88]'}`}
                />
              </div>

              {/* Arrival Time */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDayMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Arrival Time</label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {timeSlots.map(time => {
                    const isToday = bookingData.date === new Date().toISOString().split('T')[0];
                    const now = new Date();
                    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    const isPastTime = isToday && time <= currentTime;

                    return (
                      <button key={time} type="button" disabled={isPastTime}
                        onClick={() => setBookingData({ ...bookingData, arrivalTime: time })}
                        className={`px-3 py-2 rounded-sm text-sm font-medium transition-all ${isPastTime
                          ? 'opacity-50 cursor-not-allowed bg-zinc-200 text-zinc-400'
                          : bookingData.arrivalTime === time
                            ? isDayMode ? 'bg-zinc-950 text-white' : 'bg-[#10FF88] text-zinc-950'
                            : isDayMode ? 'border border-zinc-300 text-zinc-700 hover:border-zinc-950' : 'border border-zinc-800 text-zinc-400 hover:border-[#10FF88]'
                        }`}
                      >{time}</button>
                    );
                  })}
                </div>
                {(venue.type || '').toLowerCase().includes('beach') && (
                  <div className={`mt-4 p-4 rounded-sm border ${isDayMode ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-700'}`}>
                    <p className={`text-sm ${isDayMode ? 'text-amber-700' : 'text-amber-300'}`}>
                      Your reservation expires <strong>15 minutes after arrival time</strong>. Please arrive on time.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary - CASH IS KING Psychology */}
              {isBeachVenue && (
                <div className={`text-center py-6 border-t ${isDayMode ? 'border-zinc-200' : 'border-zinc-800'}`}>
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
              )}

              {/* Submit */}
              <button
                type="submit" disabled={submitting}
                className={`w-full px-8 py-6 rounded-sm text-sm tracking-widest uppercase transition-all duration-300 font-bold ${submitting ? 'opacity-50 cursor-not-allowed' : ''} ${isDayMode
                  ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
                  : 'bg-zinc-950 text-[#10FF88] border border-zinc-800 hover:shadow-[0_0_30px_rgba(16,255,136,0.6)]'
                }`}
              >
                {submitting 
                  ? (isBeachVenue ? 'SECURING ACCESS...' : 'PREPARING MESSAGE...') 
                  : (isBeachVenue ? 'CONFIRM ACCESS' : 'SEND WHATSAPP REQUEST')
                }
              </button>
              
              {isBeachVenue ? (
                <p className={`text-center text-xs mt-3 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Pay €{Math.round(selectedZone.basePrice * bookingData.sunbedCount)} cash at the entrance
                </p>
              ) : (
                <p className={`text-center text-xs mt-3 ${isDayMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  You will be redirected to WhatsApp to complete your reservation
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Menu Preview Modal (read-only for Discovery) */}
      {showMenu && (
        <Suspense fallback={null}>
          <MenuPreview
            venueId={venue.id}
            venueName={venue.name}
            isDayMode={isDayMode}
            onClose={() => setShowMenu(false)}
          />
        </Suspense>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  );
}
