import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { feedbackApi } from '../services/feedbackApi';
import whatsappLink from '../utils/whatsappLink';
import haptics from '../utils/haptics';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

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
    link1.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@200;300;400;500&display=swap';
    link1.rel = 'stylesheet';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
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
      
      // Fetch menu to get business name (not venue name)
      const menuResponse = await fetch(`${API_URL}/api/public/Orders/menu?venueId=${actualVenueId}`);
      
      if (!menuResponse.ok) {
        throw new Error('Failed to load venue');
      }
      
      const menuData = await menuResponse.json();
      
      if (menuData.length > 0) {
        // Use businessName (e.g., "Hotel Coral Beach") not venueName (e.g., "Main Beach")
        const businessName = menuData[0].businessName || menuData[0].venueName || 'Venue';
        
        // Try to get location and coordinates from zones endpoint
        let location = 'Riviera';
        let latitude = null;
        let longitude = null;
        
        try {
          const zonesResponse = await fetch(`${API_URL}/api/public/Reservations/zones?venueId=${actualVenueId}`);
          if (zonesResponse.ok) {
            const zonesData = await zonesResponse.json();
            if (zonesData.length > 0 && zonesData[0].venue) {
              location = zonesData[0].venue.address || location;
              latitude = zonesData[0].venue.latitude;
              longitude = zonesData[0].venue.longitude;
            }
          }
        } catch (err) {
          console.warn('Could not fetch location data:', err);
        }
        
        setVenue({
          id: actualVenueId,
          name: businessName, // Business/Brand name, not venue name
          location: location,
          latitude: latitude,
          longitude: longitude
        });
      } else {
        throw new Error('Venue not found');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venue:', err);
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

        const response = await fetch(`${API_URL}/api/public/venues/${actualVenueId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
          console.error('Failed to submit review');
        } else {
          console.log('✅ Review submitted successfully');
        }

        // Redirect to Google Maps for high ratings
        if (venue.latitude && venue.longitude) {
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
      <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4">
            {error || 'Venue not found'}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="text-stone-600 dark:text-stone-400 hover:text-amber-600 underline"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-700"
      style={{ 
        backgroundColor: '#F5F5F4',
        fontFamily: 'Montserrat, sans-serif'
      }}
    >
      {/* Background Images */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          alt="Bright Riviera Beach" 
          className="absolute inset-0 w-full h-full object-cover opacity-100 dark:opacity-0 transition-opacity duration-1000 blur-sm" 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop"
        />
        <img 
          alt="Dark Beach at Dusk" 
          className="absolute inset-0 w-full h-full object-cover opacity-0 dark:opacity-100 transition-opacity duration-1000 blur-md scale-105" 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop"
        />
        <div className="absolute inset-0 bg-stone-100/70 dark:bg-black/60 backdrop-blur-[2px] transition-colors duration-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-100/50 to-stone-100/90 dark:via-black/20 dark:to-black/80 transition-colors duration-1000"></div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur-sm">
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="material-icons-round text-4xl text-white">favorite</span>
            </div>
            <h2 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Thank You
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              {rating >= 4 ? "Redirecting you to share your review on Google..." : "We appreciate your feedback"}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-8 flex flex-col items-center justify-between h-full py-12">
        {/* Header */}
        <header className="text-center w-full mt-8" style={{ animation: 'fadeIn 1.2s ease-out forwards' }}>
          <p 
            className="text-[10px] tracking-[0.25em] uppercase text-stone-500 dark:text-stone-400 mb-6 font-medium"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Your Experience At
          </p>
          <h1 
            className="text-5xl md:text-6xl font-normal text-stone-900 dark:text-stone-100 leading-[0.9] mb-4 tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {venue.name}
          </h1>
          <div className="flex items-center justify-center gap-2 opacity-80 mt-2">
            <span className="material-icons-round text-xs text-stone-600 dark:text-stone-400">place</span>
            <p className="text-xs tracking-wide text-stone-700 dark:text-stone-300 uppercase">
              {venue.location}
            </p>
          </div>
        </header>

        {/* Rating Section */}
        <section 
          className="flex flex-col items-center w-full my-12"
          style={{ animation: 'fadeIn 1.2s ease-out 0.3s forwards', opacity: 0 }}
        >
          <h2 
            className="text-3xl md:text-4xl italic text-stone-800 dark:text-stone-200 mb-10 text-center font-light"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            How was your<br/>experience?
          </h2>
          
          {/* Rating Circles */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 w-full">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={showSuccess}
                className={`
                  w-12 h-12 rounded-full border transition-all duration-500 flex items-center justify-center focus:outline-none relative overflow-hidden
                  ${star <= (hoveredRating || rating)
                    ? 'border-amber-500 bg-amber-500/25 shadow-lg shadow-amber-500/40'
                    : 'border-stone-400 dark:border-stone-600 bg-transparent hover:border-amber-500 hover:bg-amber-500/15 hover:shadow-lg hover:shadow-amber-500/40'
                  }
                `}
                aria-label={`Rate ${star} out of 5`}
              >
                <div 
                  className={`
                    w-full h-full rounded-full transition-opacity duration-500 blur-md
                    ${star <= (hoveredRating || rating) ? 'opacity-100 bg-amber-400' : 'opacity-0 bg-amber-400'}
                  `}
                ></div>
              </button>
            ))}
          </div>
          
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-500 opacity-60">
            Tap a circle to rate
          </p>
        </section>

        {/* Footer */}
        <footer 
          className="text-center w-full mb-6"
          style={{ animation: 'fadeIn 1.2s ease-out 0.6s forwards', opacity: 0 }}
        >
          <div className="w-12 h-[1px] bg-stone-400/30 dark:bg-stone-600/50 mx-auto mb-6"></div>
          <p 
            className="italic text-lg text-stone-700 dark:text-stone-300 mb-12 max-w-[260px] mx-auto leading-relaxed"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            "Your feedback helps us perfect the Riviera."
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-800 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300 border-b border-transparent hover:border-amber-600 pb-1"
          >
            Return to Home
          </button>
        </footer>
      </main>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `
      }} />
    </div>
  );
}
