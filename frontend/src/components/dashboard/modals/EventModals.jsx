import { useState, useEffect } from 'react';
import ImageUpload from '../../ImageUpload';

// Create Event Modal
export function CreateEventModal({ isOpen, onClose, onSubmit, venues }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flyerImageUrl: '',
    startTime: '',
    endTime: '',
    isTicketed: false,
    ticketPrice: 0,
    maxGuests: 0,
    isPublished: false,
    venueId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to proper format
    const eventData = {
      ...formData,
      venueId: parseInt(formData.venueId),
      ticketPrice: parseFloat(formData.ticketPrice) || 0,
      maxGuests: parseInt(formData.maxGuests) || 0,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    };
    
    onSubmit(eventData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create Event</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Name *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Summer Beach Party 2026"
            />
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Venue *</label>
            <select
              required
              value={formData.venueId}
              onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Select a venue</option>
              {venues?.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Join us for an unforgettable night..."
            />
          </div>

          {/* Flyer Image */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Flyer</label>
            <ImageUpload
              currentImageUrl={formData.flyerImageUrl}
              onImageUrlChange={(url) => setFormData({ ...formData, flyerImageUrl: url })}
              label="Upload Flyer"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {/* Ticketing */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTicketed"
                checked={formData.isTicketed}
                onChange={(e) => setFormData({ ...formData, isTicketed: e.target.checked })}
                className="w-5 h-5 bg-black border-zinc-700 rounded"
              />
              <label htmlFor="isTicketed" className="ml-3 text-sm font-medium text-white">
                This is a ticketed event
              </label>
            </div>

            {formData.isTicketed && (
              <div className="grid grid-cols-2 gap-4 pl-8">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Max Guests</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publish Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-5 h-5 bg-black border-zinc-700 rounded"
            />
            <label htmlFor="isPublished" className="ml-3 text-sm font-medium text-white">
              Publish immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors font-medium"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Event Modal
export function EditEventModal({ isOpen, onClose, onSubmit, event, venues }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flyerImageUrl: '',
    startTime: '',
    endTime: '',
    isTicketed: false,
    ticketPrice: 0,
    maxGuests: 0,
    isPublished: false,
    venueId: ''
  });

  useEffect(() => {
    if (event) {
      // Convert ISO dates to datetime-local format
      const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: event.name || '',
        description: event.description || '',
        flyerImageUrl: event.flyerImageUrl || '',
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
        isTicketed: event.isTicketed || false,
        ticketPrice: event.ticketPrice || 0,
        maxGuests: event.maxGuests || 0,
        isPublished: event.isPublished || false,
        venueId: event.venueId || ''
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      venueId: parseInt(formData.venueId),
      ticketPrice: parseFloat(formData.ticketPrice) || 0,
      maxGuests: parseInt(formData.maxGuests) || 0,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    };
    
    onSubmit(event.id, eventData);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Event</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Same form fields as CreateEventModal */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Name *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Venue *</label>
            <select
              required
              value={formData.venueId}
              onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Select a venue</option>
              {venues?.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Flyer</label>
            <ImageUpload
              currentImageUrl={formData.flyerImageUrl}
              onImageUrlChange={(url) => setFormData({ ...formData, flyerImageUrl: url })}
              label="Upload Flyer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTicketed-edit"
                checked={formData.isTicketed}
                onChange={(e) => setFormData({ ...formData, isTicketed: e.target.checked })}
                className="w-5 h-5 bg-black border-zinc-700 rounded"
              />
              <label htmlFor="isTicketed-edit" className="ml-3 text-sm font-medium text-white">
                This is a ticketed event
              </label>
            </div>

            {formData.isTicketed && (
              <div className="grid grid-cols-2 gap-4 pl-8">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Max Guests</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished-edit"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-5 h-5 bg-black border-zinc-700 rounded"
            />
            <label htmlFor="isPublished-edit" className="ml-3 text-sm font-medium text-white">
              Published
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
export function DeleteEventModal({ isOpen, onClose, onConfirm, event }) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Delete Event?</h2>
          <p className="text-zinc-400 mb-6">
            Are you sure you want to delete "{event.name}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(event.id)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
