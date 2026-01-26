import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Send, Heart } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';

export default function ReviewPage() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    fetchVenue();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      const response = await fetch(`${API_URL}/venue/${venueId}/layout`);
      const data = await response.json();
      setVenue(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue:', error);
      setLoading(false);
    }
  };

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
    
    // If 1-3 stars, show comment box
    if (selectedRating < 4) {
      setShowCommentBox(true);
      setShowSuccess(false);
    } 
    // If 4-5 stars, show success animation
    else {
      setShowCommentBox(false);
      setShowSuccess(true);
      // Auto-submit after 1.5 seconds
      setTimeout(() => {
        handleSubmit(selectedRating);
      }, 1500);
    }
  };

  const handleSubmit = async (submittedRating = rating) => {
    if (submittedRating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: parseInt(venueId),
          rating: submittedRating,
          comment: comment || null,
          customerName: customerName || null,
          customerEmail: customerEmail || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If high rating (4-5), redirect to Google Maps
        if (data.redirect) {
          setTimeout(() => {
            // Generate Google Maps review URL
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
            window.location.href = googleMapsUrl;
          }, 2000);
        } else {
          // Show thank you message for low ratings
          setShowSuccess(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-20 h-20 border-[2px] border-zinc-800 border-t-[#9f7928] rounded-full animate-spin mb-6"></div>
          <p className="text-zinc-400 font-geist-mono text-xl tracking-wide font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a] flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-4xl text-zinc-100 font-display font-light tracking-tight mb-4">Venue not found</p>
          <a href="/" className="text-zinc-400 hover:text-zinc-100 underline text-lg transition-colors duration-300 font-geist-sans">
            Return home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#0f172a]">
      {/* Grain Overlay - 4% */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-50" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Heavy Vignette */}
      <div className="fixed inset-0 pointer-events-none z-40" style={{
        background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)'
      }}></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12 py-16 md:py-24">
        <div className="w-full max-w-4xl">
          {/* Success Animation (4-5 stars) */}
          <AnimatePresence>
            {showSuccess && rating >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <motion.div 
                  className="mb-12 relative"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="inline-block">
                    <Heart 
                      className="w-32 h-32 text-[#9f7928]" 
                      fill="currentColor"
                      style={{ filter: 'drop-shadow(0 0 30px rgba(159, 121, 40, 0.6))' }}
                    />
                  </div>
                </motion.div>
                <h1 className="text-7xl md:text-8xl font-display font-light text-zinc-100 mb-8 tracking-tighter leading-none">
                  Thank You
                </h1>
                <p className="text-2xl md:text-3xl font-geist-sans text-zinc-300 mb-6 leading-relaxed">
                  We're delighted you enjoyed your experience
                </p>
                <p className="text-lg md:text-xl font-geist-sans text-zinc-500 leading-relaxed">
                  Redirecting you to share your review on Google...
                </p>
                <div className="mt-12">
                  <div className="inline-block w-12 h-12 border-[2px] border-zinc-800 border-t-[#9f7928] rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}

            {/* Success Message (1-3 stars after submit) */}
            {showSuccess && rating < 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="mb-12">
                  <Heart className="w-32 h-32 text-zinc-500 mx-auto" />
                </div>
                <h1 className="text-7xl md:text-8xl font-display font-light text-zinc-100 mb-8 tracking-tighter leading-none">
                  Thank You
                </h1>
                <p className="text-2xl md:text-3xl font-geist-sans text-zinc-300 mb-6 leading-relaxed">
                  We appreciate your honest feedback
                </p>
                <p className="text-lg md:text-xl font-geist-sans text-zinc-500 leading-relaxed">
                  We'll work hard to improve your next experience
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review Form */}
          {!showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Venue Name - Massive Header with Parallax */}
              <motion.div style={{ y }} className="mb-20">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600 mb-6 font-geist-mono">
                  Your Experience At
                </p>
                <h1 
                  className="text-6xl md:text-8xl font-display font-light text-zinc-100 mb-6 tracking-tighter leading-none"
                  style={{ mixBlendMode: 'difference' }}
                >
                  {venue.name}
                </h1>
                <p className="text-xl font-geist-sans text-zinc-400 leading-relaxed">
                  {venue.location}
                </p>
              </motion.div>

              {/* Question */}
              <h2 className="text-4xl md:text-5xl font-display font-light italic text-zinc-200 mb-16 tracking-tight">
                How was your experience?
              </h2>

              {/* Star Rating - Floating Bronze Orbs */}
              <div className="flex justify-center gap-4 md:gap-6 mb-16">
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <motion.button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none group"
                    disabled={isSubmitting}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    whileHover={{ scale: 1.15, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star
                      className={`w-16 h-16 md:w-24 md:h-24 transition-all duration-500 ${
                        star <= (hoveredRating || rating)
                          ? 'text-[#9f7928] fill-[#9f7928]'
                          : 'text-zinc-700 fill-transparent'
                      }`}
                      style={
                        star <= (hoveredRating || rating)
                          ? { filter: 'drop-shadow(0 0 20px rgba(159, 121, 40, 0.6))' }
                          : {}
                      }
                    />
                  </motion.button>
                ))}
              </div>

              {/* Rating Labels */}
              <AnimatePresence mode="wait">
                {rating > 0 && (
                  <motion.p
                    key={rating}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-display font-light italic text-zinc-400 mb-16 tracking-wide"
                  >
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Comment Box (1-3 stars only) */}
              <AnimatePresence>
                {showCommentBox && rating < 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="backdrop-blur-2xl bg-zinc-900/50 rounded-2xl p-10 md:p-12 mb-8 border border-zinc-800">
                      <p className="text-3xl md:text-4xl font-display font-light italic text-zinc-200 mb-10 tracking-tight leading-tight">
                        We're sorry to hear that. Tell us what went wrong?
                      </p>

                      {/* Customer Name (Optional) */}
                      <div className="mb-6">
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your name (optional)"
                          className="w-full px-6 py-4 border border-zinc-700 bg-zinc-900/50 rounded-xl focus:ring-2 focus:ring-[#9f7928] focus:border-[#9f7928] outline-none transition-all duration-300 font-geist-sans text-lg text-zinc-100 placeholder:text-zinc-600"
                        />
                      </div>

                      {/* Customer Email (Optional) */}
                      <div className="mb-6">
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Your email (optional)"
                          className="w-full px-6 py-4 border border-zinc-700 bg-zinc-900/50 rounded-xl focus:ring-2 focus:ring-[#9f7928] focus:border-[#9f7928] outline-none transition-all duration-300 font-geist-sans text-lg text-zinc-100 placeholder:text-zinc-600"
                        />
                      </div>

                      {/* Comment Textarea */}
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Please share your feedback..."
                        rows={6}
                        className="w-full px-6 py-4 border border-zinc-700 bg-zinc-900/50 rounded-xl focus:ring-2 focus:ring-[#9f7928] focus:border-[#9f7928] outline-none transition-all duration-300 resize-none font-geist-sans text-lg leading-relaxed text-zinc-100 placeholder:text-zinc-600"
                      />

                      {/* Submit Button - Bronze Orb */}
                      <motion.button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="w-full mt-8 px-8 py-5 text-zinc-950 text-lg font-geist-mono font-black rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-[0.3em]"
                        style={{ 
                          background: '#9f7928',
                          boxShadow: '0 8px 32px rgba(159, 121, 40, 0.6)'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-6 h-6 border-[3px] border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Feedback
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Helper Text */}
              {!showCommentBox && rating === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-geist-sans text-zinc-600 leading-relaxed"
                >
                  Tap a star to rate your experience
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Footer */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="/"
              className="text-sm font-geist-mono text-zinc-600 hover:text-[#9f7928] transition-colors duration-300 uppercase tracking-[0.3em]"
            >
              Return to home
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
