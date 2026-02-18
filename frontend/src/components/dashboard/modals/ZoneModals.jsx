

export const CreateZoneModal = ({ 
  isOpen, 
  onClose, 
  zoneForm, 
  onFormChange, 
  onSubmit,
  selectedVenue
}) => {
  // Auto-generate prefix from zone name
  const generatePrefix = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const handleNameChange = (value) => {
    onFormChange('name', value);
    if (!zoneForm.prefix || zoneForm.prefix === generatePrefix(zoneForm.name)) {
      onFormChange('prefix', generatePrefix(value));
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div
            className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              Create Zone {selectedVenue && `for ${selectedVenue.name}`}
            </h2>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g., VIP Section, Regular Area"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zone Type *
                  </label>
                  <select
                    required
                    value={zoneForm.zoneType}
                    onChange={(e) => onFormChange('zoneType', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="sunbed">Sunbed</option>
                    <option value="table">Table</option>
                    <option value="cabana">Cabana</option>
                    <option value="vip">VIP</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Capacity Per Unit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={zoneForm.capacityPerUnit}
                    onChange={(e) => onFormChange('capacityPerUnit', parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={zoneForm.basePrice}
                    onChange={(e) => onFormChange('basePrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Unit Code Prefix *
                </label>
                <input
                  type="text"
                  required
                  maxLength="3"
                  value={zoneForm.prefix}
                  onChange={(e) => onFormChange('prefix', e.target.value.toUpperCase())}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  placeholder="e.g., VIP, REG, CAB"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Preview: {zoneForm.prefix || 'XXX'}-1, {zoneForm.prefix || 'XXX'}-2, {zoneForm.prefix || 'XXX'}-3...
                </p>
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
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const EditZoneModal = ({ 
  isOpen, 
  onClose, 
  zoneForm, 
  onFormChange, 
  onSubmit,
  selectedVenue
}) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Edit Zone {selectedVenue && `in ${selectedVenue.name}`}
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={zoneForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Zone Type *
                </label>
                <select
                  required
                  value={zoneForm.zoneType}
                  onChange={(e) => onFormChange('zoneType', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="sunbed">Sunbed</option>
                  <option value="table">Table</option>
                  <option value="cabana">Cabana</option>
                  <option value="vip">VIP</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Capacity Per Unit *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={zoneForm.capacityPerUnit}
                  onChange={(e) => onFormChange('capacityPerUnit', parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Base Price (€) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={zoneForm.basePrice}
                  onChange={(e) => onFormChange('basePrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Unit Code Prefix *
              </label>
              <input
                type="text"
                required
                maxLength="3"
                value={zoneForm.prefix}
                onChange={(e) => onFormChange('prefix', e.target.value.toUpperCase())}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
              />
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
                Update Zone
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
