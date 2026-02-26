/**
 * Feedback API Service
 * Handles negative feedback submission (Review Shield)
 * Industrial Grade: Error handling, retry logic
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';

class FeedbackApiService {
  /**
   * Submit negative feedback
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>}
   */
  async submitFeedback(feedbackData) {
    try {
      console.log('🌐 Submitting negative feedback...', feedbackData);
      
      const response = await fetch(`${API_URL}/api/public/Feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venueId: feedbackData.venueId,
          unitId: feedbackData.unitId,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          customerName: feedbackData.customerName || null,
          customerPhone: feedbackData.customerPhone || null,
          customerEmail: feedbackData.customerEmail || null,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log('✅ Feedback submitted successfully:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      
      // Queue for retry if network error
      if (error.message.includes('Failed to fetch')) {
        console.log('📥 Queueing feedback for retry...');
        this.queueForRetry(feedbackData);
      }
      
      throw error;
    }
  }

  /**
   * Queue feedback for retry (offline support)
   * @param {Object} feedbackData
   */
  queueForRetry(feedbackData) {
    try {
      const queue = JSON.parse(localStorage.getItem('feedback-retry-queue') || '[]');
      queue.push({
        data: feedbackData,
        timestamp: Date.now()
      });
      localStorage.setItem('feedback-retry-queue', JSON.stringify(queue));
      console.log('✅ Feedback queued for retry');
    } catch (error) {
      console.error('❌ Failed to queue feedback:', error);
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('feedback-retry-queue') || '[]');
      
      if (queue.length === 0) return;
      
      console.log(`📤 Processing ${queue.length} queued feedback items...`);
      
      const results = await Promise.allSettled(
        queue.map(item => this.submitFeedback(item.data))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      if (successful === queue.length) {
        // All successful - clear queue
        localStorage.removeItem('feedback-retry-queue');
        console.log('✅ All queued feedback submitted');
      } else {
        // Some failed - keep failed items in queue
        const failed = queue.filter((_, i) => results[i].status === 'rejected');
        localStorage.setItem('feedback-retry-queue', JSON.stringify(failed));
        console.log(`⚠️ ${failed.length} feedback items still in queue`);
      }
      
    } catch (error) {
      console.error('❌ Failed to process retry queue:', error);
    }
  }
}

export const feedbackApi = new FeedbackApiService();
export default feedbackApi;
