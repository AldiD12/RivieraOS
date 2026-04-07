import { useState, useEffect } from 'react';
import { ImageUpload } from '../../ImageUpload';

function buildPayload(formData) {
  const { entryType, businessId, ...rest } = formData; // strip frontend-only fields
  return {
    ...rest,
    venueId: formData.venueId ? parseInt(formData.venueId) : null,
    isTicketed: entryType === 'ticketed',
    ticketPrice: entryType === 'ticketed' ? parseFloat(formData.ticketPrice) || 0 : 0,
    minimumSpend: entryType === 'reservation' ? parseFloat(formData.minimumSpend) || 0 : 0,
    maxGuests: parseInt(formData.maxGuests) || 0,
    // Send local time as-is — avoid UTC conversion that shifts Albanian time by 2h
    startTime: formData.startTime ? formData.startTime + ':00' : null,
    endTime: formData.endTime ? formData.endTime + ':00' : null,
  };
}

function validate(formData) {
  if (!formData.name?.trim()) return 'Event name is required.';
  if (!formData.startTime) return 'Start time is required.';
  if (!formData.endTime) return 'End time is required.';
  if (formData.startTime >= formData.endTime) return 'End time must be after start time.';
  if (formData.entryType === 'ticketed' && !(parseFloat(formData.ticketPrice) > 0))
    return 'Ticket price must be greater than 0.';
  if (formData.entryType === 'reservation' && !(parseFloat(formData.minimumSpend) > 0))
    return 'Minimum spend must be greater than 0.';
  return null;
}

function EventForm({ formData, setFormData, venues, isSuperAdmin, businesses, error, loading, submitLabel, onClose }) {
  return (
    <div className="p-6 space-y-6">
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

      {/* Business selector — SuperAdmin only */}
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
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.brandName || b.registeredName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Venue selector — shown for everyone, filtered to business's venues */}
      {venues?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
          <select
            value={formData.venueId}
            onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            disabled={isSuperAdmin && !formData.businessId}
          >
            <option value="">All Venues (Business-level)</option>
            {(isSuperAdmin
              ? venues.filter(v => parseInt(v.businessId) === parseInt(formData.businessId))
              : venues
            ).map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Vibe */}
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
          <option value="Electronic">🎵 Electronic</option>
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
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
          placeholder="Join us for an unforgettable night..."
        />
      </div>

      {/* Flyer */}
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

      {/* Entry Type */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-400">Entry Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {['free', 'ticketed', 'reservation'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, entryType: type })}
              className={`px-4 py-3 rounded-md font-medium text-sm transition-all ${
                formData.entryType === type ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {type === 'free' ? 'FREE ENTRY' : type === 'ticketed' ? 'TICKETED' : 'RESERVATION'}
            </button>
          ))}
        </div>

        {formData.entryType === 'ticketed' && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Ticket Price (€) *</label>
            <input
              type="number" step="0.01" min="0" required
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="25.00"
            />
          </div>
        )}

        {formData.entryType === 'reservation' && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Minimum Spend (€) * <span className="text-zinc-500 text-xs">(per table)</span>
            </label>
            <input
              type="number" step="0.01" min="0" required
              value={formData.minimumSpend}
              onChange={(e) => setFormData({ ...formData, minimumSpend: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="500.00"
            />
          </div>
        )}

        {/* Max Guests — available for all entry types */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Max Guests <span className="text-zinc-500 text-xs">(0 = unlimited)</span>
          </label>
          <input
            type="number" min="0"
            value={formData.maxGuests}
            onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="200"
          />
        </div>
      </div>

      {/* Publish */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublished-field"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="w-5 h-5 bg-black border-zinc-700 rounded"
        />
        <label htmlFor="isPublished-field" className="ml-3 text-sm font-medium text-white">
          Publish immediately
        </label>
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </div>
  );
}

const defaultForm = {
  name: '', description: '', flyerImageUrl: '',
  startTime: '', endTime: '',
  entryType: 'free', ticketPrice: 0, minimumSpend: 0, maxGuests: 0,
  vibe: '', isPublished: false, venueId: '', businessId: ''
};

export function CreateEventModal({ isOpen, onClose, onSubmit, venues, isSuperAdmin = false, businesses = [] }) {
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isOpen) { setFormData(defaultForm); setError(''); } }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(formData);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(buildPayload(formData));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit}>
          <EventForm
            formData={formData} setFormData={setFormData}
            venues={venues} isSuperAdmin={isSuperAdmin} businesses={businesses}
            error={error} loading={loading} submitLabel="Create Event" onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}

export function EditEventModal({ isOpen, onClose, onSubmit, event, venues, isSuperAdmin = false, businesses = [] }) {
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event) return;
    const fmt = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };
    let entryType = 'free';
    if (event.minimumSpend > 0) entryType = 'reservation';
    else if (event.isTicketed) entryType = 'ticketed';

    setFormData({
      name: event.name || '',
      description: event.description || '',
      flyerImageUrl: event.flyerImageUrl || '',
      startTime: fmt(event.startTime),
      endTime: fmt(event.endTime),
      entryType,
      ticketPrice: event.ticketPrice || 0,
      minimumSpend: event.minimumSpend || 0,
      maxGuests: event.maxGuests || 0,
      vibe: event.vibe || '',
      isPublished: event.isPublished || false,
      venueId: event.venueId || '',
      businessId: event.businessId || ''
    });
    setError('');
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(formData);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(event.id, buildPayload(formData));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit}>
          <EventForm
            formData={formData} setFormData={setFormData}
            venues={venues} isSuperAdmin={isSuperAdmin} businesses={businesses}
            error={error} loading={loading} submitLabel="Save Changes" onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
}

export function DeleteEventModal({ isOpen, onClose, onConfirm, event }) {
  if (!isOpen || !event) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Delete Event?</h2>
        <p className="text-zinc-400 mb-6">
          Are you sure you want to delete "{event.name}"? This cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(event.id)} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
