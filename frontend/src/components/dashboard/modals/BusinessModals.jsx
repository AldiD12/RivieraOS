import { useState, useRef } from 'react';
import { uploadToAzureBlob } from '../../../utils/azureBlobUpload';

function ImageUploadField({ label, value, fieldName, onFormChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadToAzureBlob(file);
      onFormChange(fieldName, url);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          {value ? (
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-zinc-700 mb-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => onFormChange(fieldName, '')}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              <span className="text-zinc-500 text-2xl mb-1">🖼️</span>
              <span className="text-zinc-500 text-xs">
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {!value && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mt-2 w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
          )}
          {uploadError && (
            <p className="text-red-400 text-xs mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessFormFields({ businessForm, onFormChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Registered Name *
        </label>
        <input
          type="text"
          required
          value={businessForm.registeredName}
          onChange={(e) => onFormChange('registeredName', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter registered business name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Brand Name
        </label>
        <input
          type="text"
          value={businessForm.brandName}
          onChange={(e) => onFormChange('brandName', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter brand name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Tax ID
        </label>
        <input
          type="text"
          value={businessForm.taxId}
          onChange={(e) => onFormChange('taxId', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter tax ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Contact Email *
        </label>
        <input
          type="email"
          required
          value={businessForm.contactEmail}
          onChange={(e) => onFormChange('contactEmail', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter contact email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          WhatsApp / Phone Number
        </label>
        <input
          type="tel"
          value={businessForm.phoneNumber || ''}
          onChange={(e) => onFormChange('phoneNumber', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter WhatsApp number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Operation Zone
        </label>
        <input
          type="text"
          value={businessForm.operationZone || ''}
          onChange={(e) => onFormChange('operationZone', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="e.g. Tirana, Vlore"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Google Maps Address
        </label>
        <input
          type="text"
          value={businessForm.googleMapsAddress || ''}
          onChange={(e) => onFormChange('googleMapsAddress', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter Maps URL or physical address"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Review Link
        </label>
        <input
          type="url"
          value={businessForm.reviewLink || ''}
          onChange={(e) => onFormChange('reviewLink', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter Google Review Link"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Logo URL
        </label>
        <input
          type="url"
          value={businessForm.logoUrl || ''}
          onChange={(e) => onFormChange('logoUrl', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
          placeholder="Enter logo URL"
        />
      </div>

      <ImageUploadField
        label="Cover Image (shown on landing & spot pages)"
        value={businessForm.coverImageUrl || ''}
        fieldName="coverImageUrl"
        onFormChange={onFormChange}
      />
    </div>
  );
}

export function CreateBusinessModal({
  isOpen,
  onClose,
  businessForm,
  onFormChange,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">Create New Business</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <BusinessFormFields businessForm={businessForm} onFormChange={onFormChange} />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={businessForm.isActive}
              onChange={(e) => onFormChange('isActive', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-zinc-300">
              Active Business
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create Business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditBusinessModal({
  isOpen,
  onClose,
  businessForm,
  onFormChange,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">Edit Business</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <BusinessFormFields businessForm={businessForm} onFormChange={onFormChange} />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editBusinessIsActive"
              checked={businessForm.isActive}
              onChange={(e) => onFormChange('isActive', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="editBusinessIsActive" className="text-sm text-zinc-300">
              Active Business
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Update Business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Keep default export for any legacy import
export const CreateBusinessModalLegacy = CreateBusinessModal;
export const EditBusinessModalLegacy = EditBusinessModal;
