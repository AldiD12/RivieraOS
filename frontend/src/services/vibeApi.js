const API_URL = 'http://localhost:5171/api';

/**
 * Vibe Poll API Service
 * Handles feedback submission and WhatsApp integration for the psychological vibe poll system
 */

export const vibeApi = {
  /**
   * Submit vibe feedback to the backend
   * @param {Object} feedback - Feedback data
   * @param {number} feedback.venueId - Venue ID
   * @param {number} feedback.rating - Rating (1-5)
   * @param {string} feedback.comment - Feedback comment
   * @param {string} feedback.unitCode - Sunbed/unit code
   * @returns {Promise<Object>} API response
   */
  async submitFeedback(feedback) {
    try {
      const response = await fetch(`${API_URL}/public/Feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueId: feedback.venueId,
          rating: feedback.rating,
          comment: feedback.comment,
          unitCode: feedback.unitCode,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting vibe feedback:', error);
      throw error;
    }
  },

  /**
   * Submit review to the backend
   * @param {Object} review - Review data
   * @param {number} review.venueId - Venue ID
   * @param {number} review.rating - Rating (1-5)
   * @param {string} review.comment - Review comment
   * @param {string} review.customerName - Customer name (optional)
   * @returns {Promise<Object>} API response
   */
  async submitReview(review) {
    try {
      const response = await fetch(`${API_URL}/public/venues/${review.venueId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment,
          customerName: review.customerName || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Generate WhatsApp complaint URL
   * @param {string} phoneNumber - WhatsApp business number
   * @param {string} message - Complaint message
   * @param {string} sunbedNumber - Sunbed identifier
   * @returns {string} WhatsApp URL
   */
  generateWhatsAppUrl(phoneNumber, message, sunbedNumber) {
    const fullMessage = `🏖️ Complaint from Sunbed ${sunbedNumber}:\n\n${message}\n\n⏰ ${new Date().toLocaleString()}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  },

  /**
   * Generate Google Reviews URL
   * @param {string} googleBusinessId - Google Business Profile ID
   * @returns {string} Google Reviews URL
   */
  generateGoogleReviewsUrl(googleBusinessId) {
    // Replace with actual Google Business Profile ID
    return `https://g.page/r/${googleBusinessId}/review`;
  },

  /**
   * Map vibe response to rating
   * @param {string} vibeResponse - 'dead', 'okay', or 'elite'
   * @returns {number} Rating (1-5)
   */
  mapVibeToRating(vibeResponse) {
    const mapping = {
      'dead': 1,
      'okay': 2,
      'elite': 5
    };
    return mapping[vibeResponse] || 3;
  },

  /**
   * Get vibe response comment
   * @param {string} vibeResponse - 'dead', 'okay', or 'elite'
   * @returns {string} Comment text
   */
  getVibeComment(vibeResponse) {
    const comments = {
      'dead': 'Dead vibe - needs improvement',
      'okay': 'Okay vibe - average experience',
      'elite': 'Elite vibe - excellent experience'
    };
    return comments[vibeResponse] || 'Neutral feedback';
  }
};

export default vibeApi;