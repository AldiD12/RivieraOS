import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { feedbackApi } from '../services/feedbackApi';
import whatsappLink from '../utils/whatsappLink';
import haptics from '../utils/haptics';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
const baseUrl = API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

export default function ReviewPage() {
  const { venueId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get venue ID from URL params or query string
  const actualVenueId = venueId || searchParams.get('v');

  useEffect(() => {
    // Add Google Fonts
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap';
    link1.rel = 'stylesheet';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link2.rel = 'stylesheet';
    document.head.appendChild(link2);

    // Fetch real venue data from backend
    if (actualVenueId) {
      fetchVenueData();
    } else {
      setError('No venue ID provided');
      setLoading(false);
    }

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, [actualVenueId]);

  const fetchVenueData = async () => {
    try {
      setLoading(true);
      
      // Step 1: Fetch venue to get businessId
      const venuesResponse = await fetch(`${baseUrl}/public/Venues`);
      
      if (!venuesResponse.ok) {
        throw new Error('Failed to load venues');
      }
      
      const venuesData = await venuesResponse.json();
      const venueData = venuesData.find(v => String(v.id) === String(actualVenueId));

      if (!venueData) {
        throw new Error('Venue not found');
      }

      // reviewLink is already embedded in the public venue response as businessReviewLink
      // — no need to call the authenticated /Businesses/ endpoint
      const reviewLink = venueData.businessReviewLink || null;
      const businessName = venueData.businessName || venueData.name || 'Venue';

      setVenue({
        id: actualVenueId,
        businessId: venueData.businessId,
        name: businessName,
        location: venueData.address || 'Riviera',
        latitude: venueData.latitude,
        longitude: venueData.longitude,
        reviewLink: reviewLink,
        googleMapsLink: venueData.businessGoogleMapsAddress || venueData.googleMapsAddress || null
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venue:', err);
      // Fallback UI error state
      setError('Failed to load venue information');
      setLoading(false);
    }
  };

  const handleRatingClick = async (selectedRating) => {
    setRating(selectedRating);
    
    // Haptic feedback
    if (haptics.isSupported()) {
      haptics.medium();
    }
    
    // Show success animation
    setShowSuccess(true);

    // Submit review to backend
    try {
      // 🚨 CRITICAL: Review Shield - Save negative feedback to database
      if (selectedRating <= 3) {
        console.log('🛡️ Review Shield: Intercepting negative feedback');
        
        const feedbackData = {
          venueId: actualVenueId,
          unitId: searchParams.get('u') || null,
          rating: selectedRating,
          comment: '', // Can be enhanced with text input later
          customerName: 'Anonymous',
          customerPhone: null,
          customerEmail: null
        };

        const feedbackResult = await feedbackApi.submitFeedback(feedbackData);
        console.log('✅ Negative feedback saved:', feedbackResult);
        
        // 🚨 CRITICAL: Send WhatsApp link for follow-up
        setTimeout(() => {
          const phone = whatsappLink.promptForPhone();
          if (phone && feedbackResult.id) {
            whatsappLink.sendFeedbackLink(phone, feedbackResult.id);
          }
        }, 1500); // Delay to show success screen first
        
        // Redirect after showing thank you
        setTimeout(() => navigate('/'), 4000);
        
      } else {
        // High rating (4-5) - Submit normal review
        const reviewData = {
          rating: selectedRating,
          comment: '',
          guestName: 'Anonymous'
        };

        const response = await fetch(`${baseUrl}/public/venues/${actualVenueId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
          console.error('Failed to submit review');
        } else {
          console.log('✅ Review submitted successfully');
        }

        // Redirect to the review link for high ratings
        // Priority: 1. Business reviewLink → 2. Google Maps link → 3. Coordinates fallback
        if (venue.reviewLink) {
          // Use the exact review link configured during business creation
          setTimeout(() => {
            window.open(venue.reviewLink, '_blank');
            setTimeout(() => navigate('/'), 2000);
          }, 2000);
        } else if (venue.googleMapsLink) {
          setTimeout(() => {
            window.open(venue.googleMapsLink, '_blank');
            setTimeout(() => navigate('/'), 2000);
          }, 2000);
        } else if (venue.latitude && venue.longitude) {
          setTimeout(() => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
            window.open(googleMapsUrl, '_blank');
            setTimeout(() => navigate('/'), 2000);
          }, 2000);
        } else {
          setTimeout(() => navigate('/'), 3000);
        }
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Error haptic feedback
      if (haptics.isSupported()) {
        haptics.error();
      }
      
      // Still show success to user even if API fails
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-8 brutalist-border rounded-3xl flex items-center justify-center border-xixa-green/20 animate-pulse">
            <div className="w-8 h-8 brutalist-border rounded-xl border-xixa-green animate-spin"></div>
          </div>
          <p className="text-xixa-green font-mono text-[10px] tracking-ultra-wide uppercase opacity-60">Loading Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="mb-10 flex justify-center">
            <div className="border border-zinc-800 rounded-full px-6 py-2">
              <span className="font-serif text-xl font-bold tracking-[0.3em] uppercase text-zinc-500">XIXA</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-light text-zinc-400 mb-8 italic">
            {error || 'Venue not found'}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="w-full border border-zinc-800 rounded-full py-4 px-6 flex items-center justify-center transition-all hover:bg-white hover:text-black group"
          >
            <span className="font-mono text-[10px] tracking-extra-wide uppercase">Return Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-mono selection:bg-xixa-green selection:text-black relative overflow-hidden">
      {/* Background grain effect if needed, but the design is clean black */}
      
      {/* Success Animation / Review Shield Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md transition-all duration-700">
          <div className="text-center animate-pulse px-8">
            <div className="w-20 h-20 mx-auto mb-10 brutalist-border rounded-full flex items-center justify-center border-xixa-green/30">
              <span className="material-symbols-outlined text-4xl text-xixa-green rating-glow">favorite</span>
            </div>
            <h2 className="font-serif text-5xl font-light mb-6 tracking-tight italic">
              Thank You
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] max-w-xs mx-auto leading-loose">
              {rating >= 4 
                ? "Connecting you to Google Maps to share your experience with the world..." 
                : "Your feedback has been received. We are committed to perfecting the Riviera."}
            </p>
          </div>
        </div>
      )}

      {/* BEGIN: MainHeader */}
      <header className="pt-16 pb-8 px-6 text-center border-b border-zinc-800/50">
        <div className="mb-12 flex justify-center">
          <div className="border border-white/30 rounded-full px-6 py-2">
            <span className="font-serif text-2xl font-bold tracking-[0.3em] uppercase">
              {venue?.name || 'XIXA'}
            </span>
          </div>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-light leading-tight mb-4 tracking-tight italic">
          How was your<br/>experience?
        </h1>
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] mt-6">
          {venue?.name || 'XIXA'} — GUEST FEEDBACK
        </p>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: RatingSection */}
      <main className="flex-grow flex flex-col justify-center px-8 py-12">
        <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`brutalist-border aspect-square flex items-center justify-center rounded-2xl transition-all duration-500 group active:scale-95 ${
                (hoveredRating || rating) === val ? 'selected-rating rating-glow' : 'hover:border-zinc-500'
              }`}
              onMouseEnter={() => setHoveredRating(val)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingClick(val)}
              disabled={showSuccess}
            >
              <span className={`material-symbols-outlined text-xl transition-all duration-500 ${
                (hoveredRating || rating) === val ? 'fill-1' : 'group-hover:scale-110 opacity-40'
              }`}>
                star
              </span>
            </button>
          ))}
        </div>
        <div className="mt-12 text-center h-4">
          <p className="text-xixa-green font-mono text-[10px] tracking-ultra-wide uppercase opacity-80 transition-opacity duration-300">
            {ratingLabels[hoveredRating || rating] || ''}
          </p>
        </div>
      </main>
      {/* END: RatingSection */}

      {/* BEGIN: FooterActions */}
      <footer className="p-8 pb-12 flex flex-col gap-6 max-w-sm mx-auto w-full">
        {/* Main Call to Action */}
        <button 
          onClick={() => navigate('/')}
          className="w-full border border-zinc-800 rounded-full py-5 px-6 flex items-center justify-center transition-all hover:bg-white hover:text-black group active:scale-[0.99] shadow-lg shadow-black/50"
        >
          <span className="font-mono text-[10px] tracking-extra-wide uppercase">Return to Home</span>
        </button>
        
        {/* Secondary Support Link */}
        <button 
          className="text-center text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors py-2"
        >
          Contact Concierge Support
        </button>
      </footer>
      {/* END: FooterActions */}
    </div>
  );
}

const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Excellent',
  5: 'Exceptional'
};
