import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Bed, CheckCircle, ArrowLeft, Share2 } from 'lucide-react';
import { reservationApi } from '../services/reservationApi';
import PageLoader from '../components/PageLoader';

export default function BookingSuccessPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await reservationApi.getReservationStatus(bookingCode);

        const transformedBooking = {
          bookingCode: data.bookingCode,
          venueName: data.venueName,
          venuePhone: data.venuePhone || '+355692000000',
          zoneName: data.zoneName,
          unitCodes: data.unitCodes || [],
          guestCount: data.guestCount,
          sunbedCount: data.unitsNeeded || 1,
          arrivalTime: data.startTime
            ? new Date(data.startTime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })
            : 'N/A',
          expirationTime: data.expirationTime
            ? new Date(data.expirationTime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })
            : 'N/A',
          totalPrice: data.totalPrice || null,
          status: data.status,
        };

        setBooking(transformedBooking);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch booking:', err);
        setError('Booking not found');
      } finally {
        setLoading(false);
      }
    };

    if (bookingCode) {
      fetchBooking();
    }
  }, [bookingCode]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'XIXA Booking Confirmation',
        text: `Booking confirmed! Code: ${booking.bookingCode}`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return <PageLoader message="Loading booking..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <p className="text-stone-500 font-mono text-sm uppercase tracking-widest mb-6">
            {error || 'Booking not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-mono tracking-widest uppercase hover:bg-stone-700 transition-all"
          >
            Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-widest">Back to Discovery</span>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
        </div>

        <h1
          className="text-3xl font-light text-center mb-1 text-stone-900"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Rezervimi u Konfirmua
        </h1>
        <p className="text-center text-stone-400 text-[10px] font-mono uppercase tracking-widest">
          Booking Confirmed
        </p>
      </div>

      {/* Content */}
      <div className="p-6 max-w-lg mx-auto">
        {/* Booking Code */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 mb-4 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3 text-center">
            Kodi Juaj / Your Code
          </p>
          <div className="text-center">
            <p
              className="text-5xl font-light text-stone-900 mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {booking.bookingCode}
            </p>
            <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">
              Show this code at the beach
            </p>
          </div>
        </div>

        {/* Sunbed Codes */}
        {booking.unitCodes && booking.unitCodes.length > 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-4 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4">
              Shtretërit Tuaj / Your Sunbeds
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {booking.unitCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-stone-50 border border-stone-300 rounded-full px-6 py-3"
                >
                  <p className="text-2xl font-mono text-stone-900">{code}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs font-mono text-stone-400 mt-4 uppercase tracking-wider">
              {booking.sunbedCount} sunbed{booking.sunbedCount !== 1 ? 's' : ''} side by side
            </p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-4 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4 text-center">
              Shtretërit Tuaj / Your Sunbeds
            </p>
            <div className="text-center">
              <p className="text-stone-700 font-mono text-sm mb-1">
                {booking.sunbedCount} sunbed{booking.sunbedCount !== 1 ? 's' : ''} reserved
              </p>
              <p className="text-xs text-stone-400">
                Sunbed codes will be assigned at the beach
              </p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-4 space-y-4 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
            Detajet / Details
          </p>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-stone-900 font-medium text-sm">{booking.venueName}</p>
              <p className="text-xs text-stone-400">{booking.zoneName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-stone-900 text-sm">{booking.guestCount} Persona / Guests</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bed className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-stone-900 text-sm">
                {booking.sunbedCount} Shtretër / Sunbed{booking.sunbedCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-stone-900 text-sm">Ora e Arritjes / Arrival: {booking.arrivalTime}</p>
            </div>
          </div>
        </div>

        {/* Expiration Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-700 text-sm font-medium mb-0.5">
                Reservation expires at {booking.expirationTime}
              </p>
              <p className="text-xs text-amber-600">
                15 minutes after arrival time — arrive on time to keep your spot
              </p>
            </div>
          </div>
        </div>

        {/* Price — only shown when a real value is available */}
        {booking.totalPrice != null && booking.totalPrice > 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-4 shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-xs font-mono uppercase tracking-widest text-stone-400">
                Totali / Total
              </p>
              <p
                className="text-3xl font-light text-stone-900"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                €{booking.totalPrice}
              </p>
            </div>
            <p className="text-xs text-stone-400 text-right mt-1 font-mono">
              €{(booking.totalPrice / booking.sunbedCount).toFixed(2)} × {booking.sunbedCount}{' '}
              shtretër
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-white border border-stone-200 text-stone-700 px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:border-stone-400 transition-all text-xs font-mono uppercase tracking-widest"
          >
            <Share2 className="w-4 h-4" />
            <span>Shpërndaj / Share</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-stone-900 text-white px-6 py-4 rounded-full hover:bg-stone-700 transition-all text-xs font-mono uppercase tracking-widest"
          >
            Browse More Experiences
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400 mb-2 font-mono uppercase tracking-widest">
            Pyetje? / Questions?
          </p>
          <a
            href={`https://wa.me/${booking.venuePhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 text-xs font-mono hover:text-stone-900 underline underline-offset-2 transition-colors"
          >
            Kontakto Plazhin / Contact Beach Club
          </a>
        </div>
      </div>
    </div>
  );
}
