// Cloudinary upload utility - more reliable than Imgur
// Cloud name from your Cloudinary account

const CLOUDINARY_CLOUD_NAME = 'dtedk8w0x';
const CLOUDINARY_UPLOAD_PRESET = 'riviera_products'; // You'll need to create this in Cloudinary dashboard

/**
 * Upload image to Cloudinary and return permanent URL
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Permanent image URL
 */
export const uploadToCloudinary = async (file) => {
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
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'riviera-products'); // Organize images in folder
  
  try {
    // Upload to Cloudinary (unsigned upload)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image');
    }
    
    const data = await response.json();
    
    // Return optimized URL with auto format and quality
    // This URL will automatically serve WebP to supported browsers
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 800,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/` +
    `w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};
