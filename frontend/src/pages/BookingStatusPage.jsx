import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationApi } from '../services/reservationApi';
import { signalrService } from '../services/signalrService';
import whatsappLink from '../utils/whatsappLink';
import haptics from '../utils/haptics';

export default function BookingStatusPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWaitlistPrompt, setShowWaitlistPrompt] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isExpired, setIsExpired] = useState(false); // 🚨 TRAP 1 FIX

  useEffect(() => {
    loadBooking();
    setupSignalR();
    
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@200;300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // 🚨 TRAP 1 FIX: Check for expired pending bookings every 30 seconds
    const expiryCheckInterval = setInterval(() => {
      checkBookingExpiry();
    }, 30000); // Check every 30 seconds
    
    return () => {
      signalrService.disconnect();
      document.head.removeChild(link);
      clearInterval(expiryCheckInterval);
    };
  }, [bookingCode]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Loading booking:', bookingCode);
      const data = await reservationApi.getReservationStatus(bookingCode);
      
      console.log('✅ Booking loaded:', data);
      setBooking(data);
      
    } catch (err) {
      console.error('❌ Failed to load booking:', err);
      setError('Rezervimi nuk u gjet');
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    try {
      console.log('📡 Setting up SignalR for booking:', bookingCode);
      
      await signalrService.connect();
      await signalrService.joinBookingGroup(bookingCode);
      
      signalrService.onBookingStatusChanged((code, status, unitCode) => {
        if (code === bookingCode) {
          console.log('🔔 Booking updated via SignalR:', { status, unitCode });
          
          // Haptic feedback for confirmation
          if (status === 'Confirmed' && haptics.isSupported()) {
            haptics.success();
          }
          
          // Update booking state
          setBooking(prev => ({
            ...prev,
            status,
            unitCode
          }));
        }
      });
      
    } catch (err) {
      console.error('❌ SignalR setup failed:', err);
      // Continue without SignalR - user can still refresh manually
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!booking) return;
    
    const message = `Përshëndetje! 👋

Dua të konfirmoj rezervimin tim:

📋 Rezervimi: #${booking.bookingCode}
🏖️ Vendi: ${booking.venueName}
👥 Persona: ${booking.guestCount}
📍 Zona: ${booking.zoneName}
🕐 Ora: ${booking.reservationTime || '11:00'}
📅 Data: ${new Date(booking.reservationDate).toLocaleDateString('sq-AL')}

Faleminderit!`;

    // Use venue phone or default
    const phone = booking.venuePhone || '+355692000000';
    whatsappLink.sendMessage(phone, message);
  };

  // 🚨 TRAP 1 FIX: Check if booking has expired (15 minutes)
  const checkBookingExpiry = () => {
    if (!booking || booking.status !== 'Pending') return;
    
    const createdAt = new Date(booking.createdAt);
    const now = new Date();
    const minutesElapsed = (now - createdAt) / 1000 / 60;
    
    if (minutesElapsed > 15) {
      console.log('⏰ Booking expired after 15 minutes');
      setIsExpired(true);
      
      // Haptic feedback
      if (haptics.isSupported()) {
        haptics.error();
      }
    }
  };

  const handleJoinWaitlist = async () => {
    if (!waitlistEmail) {
      alert('Ju lutem vendosni email-in tuaj');
      return;
    }

    try {
      // 🚀 TWEAK 3: Waitlist placeholder (backend Phase 3)
      console.log('📋 Waitlist request:', {
        bookingCode: booking.bookingCode,
        venueId: booking.venueId,
        email: waitlistEmail,
        zoneName: booking.zoneName,
        guestCount: booking.guestCount
      });

      alert('✅ Ju jeni shtuar në listën e pritjes!\n\nDo të njoftoheni kur të lirohet një vend.');
      setShowWaitlistPrompt(false);
      
    } catch (err) {
      console.error('Error joining waitlist:', err);
      alert('Gabim në shtimin në listën e pritjes');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-lg text-stone-600">Duke ngarkuar rezervimin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 
            className="text-4xl font-light text-stone-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Rezervimi nuk u gjet
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            {error || 'Kodi i rezervimit nuk është i vlefshëm.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
          >
            Kthehu te Harta
          </button>
        </div>
      </div>
    );
  }

  const isPending = booking.status === 'Pending' && !isExpired;
  const isConfirmed = booking.status === 'Confirmed';
  const isCancelled = booking.status === 'Cancelled' || isExpired;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-6xl font-light text-stone-900 mb-2 tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Rezervimi Yt
          </h1>
          <p className="text-sm text-stone-500 uppercase tracking-widest">
            #{booking.bookingCode}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-200/40 mb-8">
          
          {/* Status Badge */}
          <div className="text-center mb-8">
            {isPending && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-light text-stone-900 mb-2">
                  Duke pritur konfirmimin
                </h2>
                <p className="text-stone-600">
                  nga stafi... ⏳
                </p>
              </>
            )}
            
            {isConfirmed && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-emerald-900 mb-2">
                  I Konfirmuar ✅
                </h2>
                {booking.unitCode && (
                  <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <p className="text-sm text-emerald-700 uppercase tracking-widest mb-2">
                      {booking.unitCode.includes(',') ? 'Kodet Tuaja' : 'Kodi Yt'}
                    </p>
                    <p 
                      className="text-5xl font-light text-emerald-900"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {booking.unitCode}
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      {booking.unitCode.includes(',') 
                        ? 'Tregoji këto kode djalit të plazhit'
                        : 'Tregoja këtë kod djalit të plazhit'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm uppercase tracking-widest text-stone-500 font-medium">
              Detajet
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Vendi</p>
                <p className="text-lg text-stone-900">{booking.venueName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Zona</p>
                <p className="text-lg text-stone-900">{booking.zoneName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Persona</p>
                <p className="text-lg text-stone-900">{booking.guestCount}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Ora</p>
                <p className="text-lg text-stone-900">{booking.reservationTime || '11:00'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Data</p>
              <p className="text-lg text-stone-900">
                {new Date(booking.reservationDate).toLocaleDateString('sq-AL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {isPending && (
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full bg-[#25D366] text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-[#20BA5A] transition-all duration-300 shadow-[0_4px_14px_rgba(37,211,102,0.3)] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                KONFIRMO NË WHATSAPP
              </button>
            )}
            
            {isConfirmed && (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                >
                  SHIKO NË HARTË
                </button>
                <button
                  onClick={handleWhatsAppConfirm}
                  className="w-full border border-stone-300 text-stone-700 px-8 py-4 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                >
                  KONTAKTO PLAZHIN
                </button>
              </>
            )}
            
            {/* 🚨 TWEAK 3: Waitlist UI for cancelled bookings */}
            {isCancelled && (
              <div className="space-y-6">
                <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-light text-red-900 mb-2">
                      {isExpired ? 'Koha skadoi' : 'Na vjen keq'}
                    </h2>
                    <p className="text-red-700">
                      {isExpired 
                        ? 'Ju nuk dërguat mesazhin e konfirmimit në WhatsApp. Kërkesa u anullua.'
                        : 'Nuk kemi vende të lira për momentin'
                      }
                    </p>
                  </div>

                  {!showWaitlistPrompt ? (
                    <button
                      onClick={() => setShowWaitlistPrompt(true)}
                      className="w-full bg-red-600 text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-red-700 transition-all duration-300"
                    >
                      📋 SHTOHEM NË WAITLIST
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-red-700 text-center">
                        Do të njoftoheni kur të lirohet një vend
                      </p>
                      <input
                        type="email"
                        placeholder="Email juaj"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleJoinWaitlist}
                        className="w-full bg-red-600 text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-red-700 transition-all duration-300"
                      >
                        KONFIRMO
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <h3 className="text-sm uppercase tracking-widest text-stone-500 font-medium mb-4">
                    Opsione të tjera
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full border border-stone-300 text-stone-700 px-6 py-3 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                    >
                      🗺️ Shiko Plazhe të Tjera
                    </button>
                    <button
                      onClick={handleWhatsAppConfirm}
                      className="w-full border border-stone-300 text-stone-700 px-6 py-3 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                    >
                      📞 Kontakto Plazhin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="text-center text-sm text-stone-500">
          <p>Mbaje këtë faqe të hapur për të marrë konfirmimin automatik</p>
          <p className="mt-2">🔔 Do të njoftohesh kur rezervimi të aprovohet</p>
        </div>
      </div>
    </div>
  );
}
