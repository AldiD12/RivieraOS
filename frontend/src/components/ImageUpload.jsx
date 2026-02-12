import { useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export const ImageUpload = ({ value, onChange, label = "Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const [pendingUpload, setPendingUpload] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setPendingUpload(true); // Mark that upload is needed
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    try {
      setUploading(true);
      setError('');
      const imageUrl = await uploadToCloudinary(imageFile);
      console.log('✅ Image uploaded successfully to Cloudinary:', imageUrl);
      onChange(imageUrl);
      console.log('📤 Calling onChange with imageUrl:', imageUrl);
      setPreview(imageUrl);
      setImageFile(null);
      setPendingUpload(false); // Upload complete
    } catch (err) {
      setError(err.message);
      console.error('❌ Cloudinary upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url) => {
    onChange(url);
    setPreview(url);
    setImageFile(null);
    setPendingUpload(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
      </label>

      {/* URL Input */}
      <input
        type="url"
        value={value || ''}
        onChange={(e) => handleUrlChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none mb-2"
        placeholder="https://example.com/image.jpg"
      />

      {/* OR Divider */}
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-zinc-700"></div>
        <span className="text-xs text-zinc-500 uppercase">Or Upload</span>
        <div className="flex-1 h-px bg-zinc-700"></div>
      </div>

      {/* File Upload */}
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
        />
        {imageFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {/* Warning if file selected but not uploaded */}
      {pendingUpload && !uploading && (
        <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ Click "Upload" button to save this image before submitting the form!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-3">
          <p className="text-xs text-zinc-400 mb-2">Preview:</p>
          <div className="relative w-full h-48 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2327272a" width="200" height="200"/%3E%3Ctext fill="%2371717a" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-zinc-500 mt-2">
        Paste a URL or upload an image (max 10MB). Free hosting via Cloudinary.
      </p>
    </div>
  );
};
