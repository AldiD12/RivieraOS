/**
 * Image Optimizer - Cloudinary Integration
 * MANDATORY: Never serve raw image URLs
 * Industrial Grade: Automatic optimization for beach conditions
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/riviera-os/image/upload';

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) {
    console.warn('⚠️ No publicId provided for image optimization');
    return '';
  }

  const {
    width = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Build transformation string
  const transforms = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
    `g_${gravity}`
  ].join(',');

  return `${CLOUDINARY_BASE}/${transforms}/${publicId}`;
};

/**
 * Image presets for common use cases
 */
export const ImagePresets = {
  /**
   * Thumbnail - Small preview images
   * @param {string} publicId
   * @returns {string}
   */
  thumbnail: (publicId) => getOptimizedImageUrl(publicId, {
    width: 400,
    quality: 'auto',
    format: 'auto'
  }),
  
  /**
   * Hero - Large banner images
   * @param {string} publicId
   * @returns {string}
   */
  hero: (publicId) => getOptimizedImageUrl(publicId, {
    width: 1200,
    quality: 80,
    format: 'auto'
  }),
  
  /**
   * Avatar - Profile pictures
   * @param {string} publicId
   * @returns {string}
   */
  avatar: (publicId) => getOptimizedImageUrl(publicId, {
    width: 200,
    quality: 'auto',
    format: 'auto',
    crop: 'thumb',
    gravity: 'face'
  }),
  
  /**
   * Card - Medium-sized card images
   * @param {string} publicId
   * @returns {string}
   */
  card: (publicId) => getOptimizedImageUrl(publicId, {
    width: 600,
    quality: 'auto',
    format: 'auto'
  }),
  
  /**
   * Menu item - Food/drink images
   * @param {string} publicId
   * @returns {string}
   */
  menuItem: (publicId) => getOptimizedImageUrl(publicId, {
    width: 500,
    quality: 85,
    format: 'auto',
    crop: 'fill'
  })
};

export default ImagePresets;
