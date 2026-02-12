// Imgur API integration for free image hosting
// Get your Client ID from: https://api.imgur.com/oauth2/addclient

const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID || 'c2593243d3ea679';

/**
 * Upload image to Imgur and return permanent URL
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Permanent image URL
 */
export const uploadToImgur = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be less than 10MB');
  }

  // Create form data
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    // Upload to Imgur
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.data?.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return data.data.link; // Returns permanent URL
  } catch (error) {
    console.error('Imgur upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Validate if URL is a valid image
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} - True if valid image URL
 */
export const validateImageUrl = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch {
    return false;
  }
};

/**
 * Compress image before upload (optional, for better performance)
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
    };
    
    reader.onerror = reject;
  });
};
