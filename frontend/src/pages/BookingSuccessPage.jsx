import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Bed, CheckCircle, ArrowLeft, Share2 } from 'lucide-react';

export default function BookingSuccessPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load booking data from localStorage (temporary until backend API is ready)
  useEffect(() => {
    const tempBooking = localStorage.getItem('temp_booking');
    if (tempBooking) {
      const data = JSON.parse(tempBooking);
      setBooking(data);
      setLoading(false);
      
      // Clean up
      localStorage.removeItem('temp_booking');
    } else {
      // TODO: Replace with actual API call when backend is ready
      // const data = await reservationApi.getReservationStatus(bookingCode);
      // setBooking(data);
      // setLoading(false);
      
      setLoading(false);
      setBooking(null);
    }
  }, [bookingCode]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'XIXA Booking Confirmation',
        text: `Booking confirmed! Code: ${booking.bookingCode}`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 p-6">
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Discovery</span>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#10FF88]/20 border-2 border-[#10FF88] flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-[#10FF88]" />
            </div>
            <div className="absolute inset-0 rounded-full bg-[#10FF88]/20 animate-ping"></div>
          </div>
        </div>

        <h1 
          className="text-4xl font-light text-center mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Rezervimi u Konfirmua
        </h1>
        <p className="text-center text-zinc-400 text-sm uppercase tracking-widest">
          Booking Confirmed
        </p>
      </div>

      {/* Booking Code */}
      <div className="p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 text-center">
            Kodi Juaj / Your Code
          </p>
          <div className="text-center">
            <p 
              className="text-5xl font-light text-[#10FF88] mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {booking.bookingCode}
            </p>
            <p className="text-sm text-zinc-400">
              Tregoja këtë kod në plazh / Show this code at the beach
            </p>
          </div>
        </div>

        {/* Sunbed Codes */}
        {booking.unitCodes && booking.unitCodes.length > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
              Shtretërit Tuaj / Your Sunbeds
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {booking.unitCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-zinc-950 border border-[#10FF88] rounded-lg px-6 py-3"
                >
                  <p 
                    className="text-2xl font-mono text-[#10FF88]"
                  >
                    {code}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-zinc-500 mt-4">
              {booking.sunbedCount} shtretër pranë njëri-tjetrit
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4 text-center">
              Shtretërit Tuaj / Your Sunbeds
            </p>
            <div className="text-center">
              <p className="text-white mb-2">
                {booking.sunbedCount} shtretër të rezervuar
              </p>
              <p className="text-sm text-zinc-400">
                Kodet e shtretërve do t'ju jepen në plazh
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Sunbed codes will be assigned at the beach
              </p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
            Detajet / Details
          </p>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#10FF88] mt-0.5" />
            <div>
              <p className="text-white font-medium">{booking.venueName}</p>
              <p className="text-sm text-zinc-400">{booking.zoneName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#10FF88] mt-0.5" />
            <div>
              <p className="text-white font-medium">{booking.guestCount} Persona</p>
              <p className="text-sm text-zinc-400">{booking.guestCount} Guests</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bed className="w-5 h-5 text-[#10FF88] mt-0.5" />
            <div>
              <p className="text-white font-medium">{booking.sunbedCount} Shtretër</p>
              <p className="text-sm text-zinc-400">{booking.sunbedCount} Sunbeds</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#10FF88] mt-0.5" />
            <div>
              <p className="text-white font-medium">Ora e Arritjes: {booking.arrivalTime}</p>
              <p className="text-sm text-zinc-400">Arrival Time: {booking.arrivalTime}</p>
            </div>
          </div>
        </div>

        {/* Expiration Warning */}
        <div className="bg-amber-900/20 border border-amber-600/50 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-500 font-medium mb-1">
                ⏰ Rezervimi skadon në {booking.expirationTime}
              </p>
              <p className="text-sm text-amber-200/80">
                Reservation expires at {booking.expirationTime} (15 minutes after arrival time)
              </p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-zinc-400">Totali / Total</p>
            <p 
              className="text-4xl font-light text-[#10FF88]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              €{booking.totalPrice}
            </p>
          </div>
          <p className="text-xs text-zinc-500 text-right mt-1">
            €{(booking.totalPrice / booking.sunbedCount).toFixed(2)} × {booking.sunbedCount} shtretër
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:border-[#10FF88] transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span>Shpërndaj / Share</span>
          </button>

          <button
            onClick={() => navigate('/discover')}
            className="w-full bg-zinc-950 border border-[#10FF88] text-[#10FF88] px-6 py-4 rounded-full hover:bg-[#10FF88]/10 transition-all"
          >
            Shfleto Më Shumë Eksperienca / Browse More Experiences
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 mb-2">
            Pyetje? / Questions?
          </p>
          <a
            href={`https://wa.me/${booking.venuePhone || '+355692000000'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#10FF88] text-sm hover:underline"
          >
            Kontakto Plazhin / Contact Beach Club
          </a>
        </div>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ping {
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `
      }} />
    </div>
  );
}
