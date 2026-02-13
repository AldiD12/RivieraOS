/**
 * Azure Blob Storage Upload Utility
 * Uploads images to backend Azure Blob Storage via /api/images/upload
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

/**
 * Upload an image file to Azure Blob Storage via backend
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The Azure Blob URL of the uploaded image
 */
export async function uploadToAzureBlob(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Get auth token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);

  console.log('📤 Uploading to Azure Blob:', file.name, file.type, file.size);

  try {
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Azure Blob upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Azure Blob upload success:', data.url);

    if (!data.url) {
      throw new Error('No URL returned from server');
    }

    return data.url;
  } catch (error) {
    console.error('❌ Azure Blob upload error:', error);
    throw error;
  }
}
