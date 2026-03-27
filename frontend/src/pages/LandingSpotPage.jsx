import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { venueApi } from '../services/venueApi';
import { Check } from 'lucide-react';

function LandingSpotPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startSession, mode, isSessionActive } = useAppStore();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [venueId, setVenueId] = useState(null);
  const [unitId, setUnitId] = useState(null);
  const [zoneId, setZoneId] = useState(null);

  useEffect(() => {
    // 1. Extract context
    const v = searchParams.get('v');
    const u = searchParams.get('u');
    const z = searchParams.get('z');

    if (!v) {
      setError('Invalid QR Code. Missing Venue ID.');
      setLoading(false);
      return;
    }

    setVenueId(v);
    setUnitId(u);
    setZoneId(z);

    // 2. Start Session immediately to lock them into the "Venue Jail"
    console.log('🔍 Pre-Menu Landing: QR code detected:', { venueId: v, unitId: u });
    startSession(v, u || '', '');

    // 3. Fetch Venue details for the Hero Image & Name
    const fetchVenueDetails = async () => {
      try {
        const venueData = await venueApi.getById(v);
        setVenue(venueData);
        // Update session with correct venue name
        startSession(v, u || '', venueData.name);
      } catch (err) {
        console.error('Failed to load venue details:', err);
        // We don't block the user if venue details fail, they just won't see the custom hero image
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();

    // Auto-scroll to top
    window.scrollTo(0, 0);
  }, [searchParams, startSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-stone-400 font-mono uppercase tracking-widest text-sm animate-pulse">Loading experience...</div>
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-mono text-sm mb-4">ERROR: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-zinc-950 text-white rounded-sm text-sm font-mono tracking-widest uppercase hover:bg-zinc-800 transition-all duration-300"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  // Helper to carry all params forward
  const getMenuUrl = () => {
    let url = `/spot/menu?v=${venueId}`;
    if (unitId) url += `&u=${unitId}`;
    if (zoneId) url += `&z=${zoneId}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans antialiased flex flex-col">
      {/* Hero Header */}
      <header className="relative w-full h-[40vh] md:h-[50vh] shrink-0">
        <img
          alt={venue?.name || "Venue"}
          className="w-full h-full object-cover rounded-none"
          src={venue?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD8WwQlTWCp-ILL2b_lkfUnaiP9s_hGxRZsn-2CAzXztNWkQieRJmoqS9akLFXLBRdX9c-jJQvaQuspeWk-ZnDGKwbZd7oXDHdUC3Xc8brjUZUdR8EBjcl4JbBvFNaV_FOvpawMlgzQ3ltJuJMqHjuTtHWlJLb5BlcrqOBl6LifJGu4Gu1VrjRpVC9Cwy5i5-cQIPBxiikNRKM23KeJIhy24G1nxGJS9ap35lyt4gXPVxgbu8fU8m3QxqQeB93tuvMcrHvuAGIa_I5r"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#FAFAF9] z-10"></div>

        <div className="absolute bottom-6 left-0 right-0 px-6 z-20 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white uppercase mb-2 drop-shadow-lg">
            {venue?.name || 'RIVIERA'}
          </h1>
          {unitId && (
            <div className="inline-block border border-stone-300 bg-white/90 px-3 py-1 rounded-sm text-stone-700 font-mono text-xs tracking-widest uppercase shadow-sm">
              UNIT {unitId}
            </div>
          )}
        </div>
      </header>

      {/* Navigation Options */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col gap-5 z-20 -mt-2">

        {/* OPTION 1: MENU */}
        {(venue?.allowsDigitalOrdering || venue?.type?.toLowerCase() === 'restaurant') && (
          <button
            onClick={() => navigate(getMenuUrl())}
            className="w-full bg-white border border-stone-200 p-5 flex items-center gap-5 rounded-sm relative overflow-hidden group hover:bg-stone-50 transition-colors text-left shadow-sm"
          >
            <div className="w-14 h-14 bg-[#FAFAF9] rounded-sm border border-stone-200 flex items-center justify-center shrink-0 z-10 group-hover:scale-105 transition-transform duration-500">
              <span className="material-symbols-outlined text-stone-900 text-3xl">restaurant</span>
            </div>
            <div className="z-10 flex-1">
              <h3 className="text-stone-900 font-display text-xl font-bold uppercase tracking-wide mb-1">Business Menu</h3>
              <p className="text-stone-400 font-mono text-xs uppercase tracking-wider">Order Food & Drinks</p>
            </div>
            <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-600 transition-colors">chevron_right</span>
          </button>
        )}

        {/* OPTION 2: EVENTS */}
        <button
          onClick={() => navigate(`/?mode=night&from=${venueId}`)}
          className="w-full bg-white border border-stone-200 p-5 flex items-center gap-5 rounded-sm relative overflow-hidden group hover:bg-stone-50 transition-colors text-left shadow-sm"
        >
          <div className="w-14 h-14 bg-[#FAFAF9] rounded-sm border border-stone-200 flex items-center justify-center shrink-0 z-10 group-hover:scale-105 transition-transform duration-500">
            <span className="text-2xl">🪩</span>
          </div>
          <div className="z-10 flex-1">
            <h3 className="text-stone-900 font-display text-xl font-bold uppercase tracking-wide mb-1">Business Events</h3>
            <p className="text-stone-400 font-mono text-xs uppercase tracking-wider">VIP Tables & Nightlife</p>
          </div>
          <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-600 transition-colors">chevron_right</span>
        </button>

        {/* OPTION 3: REVIEW */}
        <button
          onClick={() => navigate(`/review?v=${venueId}`)}
          className="w-full bg-white border border-stone-200 p-5 flex items-center gap-5 rounded-sm relative overflow-hidden group hover:bg-stone-50 transition-colors text-left mt-2 shadow-sm"
        >
          <div className="w-14 h-14 bg-[#FAFAF9] rounded-sm border border-stone-200 flex items-center justify-center shrink-0 z-10 group-hover:border-amber-300 transition-colors group-hover:scale-105 duration-500">
            <span className="material-symbols-outlined text-amber-500 text-3xl">star</span>
          </div>
          <div className="z-10 flex-1">
            <h3 className="text-stone-900 font-display text-xl font-bold uppercase tracking-wide mb-1">Leave a Review</h3>
            <p className="text-stone-400 font-mono text-xs uppercase tracking-wider">Rate Your Experience</p>
          </div>
          <span className="material-symbols-outlined text-stone-300 group-hover:text-amber-500 transition-colors">chevron_right</span>
        </button>

      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 border-t border-stone-200 mt-auto shrink-0 text-center relative z-20">
        <a href="/" className="text-xs font-mono tracking-widest uppercase text-stone-400 hover:text-stone-600 transition-colors duration-300">
          Powered by XIXA
        </a>
      </footer>
    </div>
  );
}

export default LandingSpotPage;
