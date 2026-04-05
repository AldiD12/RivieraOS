import { useState, useEffect } from 'react';
import { ImageUpload } from '../../ImageUpload';

// Create Event Modal
export function CreateEventModal({ isOpen, onClose, onSubmit, venues, isSuperAdmin = false, businesses = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flyerImageUrl: '',
    startTime: '',
    endTime: '',
    entryType: 'free', // 'free' | 'ticketed' | 'reservation'
    ticketPrice: 0,
    minimumSpend: 0,
    maxGuests: 0,
    vibe: '', // House | Techno | Commercial | Live Music | Hip Hop | Chill
    isPublished: false,
    venueId: '',
    businessId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to proper format
    const eventData = {
      ...formData,
      venueId: formData.venueId ? parseInt(formData.venueId) : null,
      businessId: formData.businessId ? parseInt(formData.businessId) : null,
      isTicketed: formData.entryType === 'ticketed',
      ticketPrice: formData.entryType === 'ticketed' ? parseFloat(formData.ticketPrice) || 0 : 0,
      minimumSpend: formData.entryType === 'reservation' ? parseFloat(formData.minimumSpend) || 0 : 0,
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

          {/* Business Selection - Only shown for SuperAdmin */}
          {isSuperAdmin && businesses?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Business *</label>
              <select
                required
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value, venueId: '' })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">Select a Business</option>
                {businesses?.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.brandName || business.registeredName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Venue Selection - Only shown for SuperAdmin */}
          {isSuperAdmin && venues?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                disabled={!formData.businessId}
              >
                <option value="">All Venues (Business-level)</option>
                {venues?.filter(v => parseInt(v.businessId) === parseInt(formData.businessId)).map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Vibe Tag - Discovery Engine */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Vibe * <span className="text-zinc-500 text-xs">(for Discovery Map filtering)</span>
            </label>
            <select
              required
              value={formData.vibe}
              onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Select vibe</option>
              <option value="House">🎵 House</option>
              <option value="Techno">⚡ Techno</option>
              <option value="Commercial">🎤 Commercial</option>
              <option value="Live Music">🎸 Live Music</option>
              <option value="Hip Hop">🎧 Hip Hop</option>
              <option value="Chill">🌊 Chill</option>
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
              value={formData.flyerImageUrl}
              onChange={(url) => setFormData({ ...formData, flyerImageUrl: url })}
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

          {/* VIP Configuration - Entry Type Segmented Control */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-400">Entry Type *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'free' })}
                className={`px-4 py-3 rounded-md font-medium transition-all ${
                  formData.entryType === 'free'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                FREE ENTRY
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'ticketed' })}
                className={`px-4 py-3 rounded-md font-medium transition-all ${
                  formData.entryType === 'ticketed'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                TICKETED
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'reservation' })}
                className={`px-4 py-3 rounded-md font-medium transition-all ${
                  formData.entryType === 'reservation'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                RESERVATION ONLY
              </button>
            </div>

            {/* Ticketed Configuration */}
            {formData.entryType === 'ticketed' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Price (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
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

            {/* Reservation Only Configuration */}
            {formData.entryType === 'reservation' && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Minimum Spend (€) * <span className="text-zinc-500 text-xs">(per table/reservation)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.minimumSpend}
                  onChange={(e) => setFormData({ ...formData, minimumSpend: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="500.00"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  💎 Users will contact via WhatsApp to book a table with this minimum spend
                </p>
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
export function EditEventModal({ isOpen, onClose, onSubmit, event, venues, isSuperAdmin = false, businesses = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flyerImageUrl: '',
    startTime: '',
    endTime: '',
    entryType: 'free',
    ticketPrice: 0,
    minimumSpend: 0,
    maxGuests: 0,
    vibe: '',
    isPublished: false,
    venueId: '',
    businessId: ''
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

      // Determine entry type from existing data (backward compatibility)
      let entryType = 'free';
      if (event.minimumSpend && event.minimumSpend > 0) {
        entryType = 'reservation';
      } else if (event.isTicketed) {
        entryType = 'ticketed';
      }

      setFormData({
        name: event.name || '',
        description: event.description || '',
        flyerImageUrl: event.flyerImageUrl || '',
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
        entryType: entryType,
        ticketPrice: event.ticketPrice || 0,
        minimumSpend: event.minimumSpend || 0,
        maxGuests: event.maxGuests || 0,
        vibe: event.vibe || '',
        isPublished: event.isPublished || false,
        venueId: event.venueId || '',
        businessId: event.businessId || ''
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      venueId: formData.venueId ? parseInt(formData.venueId) : null,
      isTicketed: formData.entryType === 'ticketed',
      ticketPrice: formData.entryType === 'ticketed' ? parseFloat(formData.ticketPrice) || 0 : 0,
      minimumSpend: formData.entryType === 'reservation' ? parseFloat(formData.minimumSpend) || 0 : 0,
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

          {/* Business Selection - Only shown for SuperAdmin */}
          {isSuperAdmin && businesses?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Business *</label>
              <select
                required
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value, venueId: '' })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">Select a Business</option>
                {businesses?.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.brandName || business.registeredName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Venue Selection - Only shown for SuperAdmin */}
          {isSuperAdmin && venues?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                disabled={!formData.businessId}
              >
                <option value="">All Venues (Business-level)</option>
                {venues?.filter(v => parseInt(v.businessId) === parseInt(formData.businessId)).map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>
          )}

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
              value={formData.flyerImageUrl}
              onChange={(url) => setFormData({ ...formData, flyerImageUrl: url })}
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

          {/* Vibe Tag Dropdown - VIP Feature */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Vibe * <span className="text-zinc-500 text-xs">(for Discovery Map filtering)</span>
            </label>
            <select
              required
              value={formData.vibe}
              onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Select a vibe</option>
              <option value="House">🎵 House</option>
              <option value="Techno">⚡ Techno</option>
              <option value="Commercial">🎤 Commercial</option>
              <option value="Live Music">🎸 Live Music</option>
              <option value="Hip Hop">🎧 Hip Hop</option>
              <option value="Chill">🌊 Chill</option>
            </select>
          </div>

          {/* Entry Type Segmented Control - VIP Feature */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-400">
              Entry Type * <span className="text-zinc-500 text-xs">(how guests access this event)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-black rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'free' })}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  formData.entryType === 'free'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                FREE ENTRY
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'ticketed' })}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  formData.entryType === 'ticketed'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                TICKETED
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, entryType: 'reservation' })}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  formData.entryType === 'reservation'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                RESERVATION ONLY
              </button>
            </div>

            {/* Ticketed Configuration */}
            {formData.entryType === 'ticketed' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Price (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
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

            {/* Reservation Only Configuration */}
            {formData.entryType === 'reservation' && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Minimum Spend (€) * <span className="text-zinc-500 text-xs">(per table/reservation)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.minimumSpend}
                  onChange={(e) => setFormData({ ...formData, minimumSpend: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="500.00"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  💎 Users will contact via WhatsApp to book a table with this minimum spend
                </p>
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
