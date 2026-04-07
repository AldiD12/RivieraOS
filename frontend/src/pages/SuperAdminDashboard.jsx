import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi, unitApi, eventsApi } from '../services/superAdminApi.js';
import { CreateVenueModal, EditVenueModal } from '../components/dashboard/modals/VenueModals';
import { CreateZoneModal, EditZoneModal } from '../components/dashboard/modals/ZoneModals';
import { CreateStaffModal, EditStaffModal, ResetPasswordModal } from '../components/dashboard/modals/StaffModals';
import { CreateBusinessModal, EditBusinessModal } from '../components/dashboard/modals/BusinessModals';
import { CreateCategoryModal, EditCategoryModal } from '../components/dashboard/modals/CategoryModals';
import { CreateProductModal, EditProductModal } from '../components/dashboard/modals/ProductModals';
import { CreateEventModal, EditEventModal, DeleteEventModal } from '../components/dashboard/modals/EventModals';
import { SuperAdminFeaturesPanel } from '../components/SuperAdminFeaturesPanel';
import BulkProductImport from '../components/BulkProductImport';

// Utility function to normalize phone numbers (match backend format)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

// Business Tab Component - Extracted outside
const BusinessTab = ({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect, 
  onCreateBusiness, 
  onEditBusiness, 
  onDeleteBusiness,
  onManageFeatures,
  loading 
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Business Management</h2>
      <button
        onClick={onCreateBusiness}
        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        + Create Business
      </button>
    </div>

    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div
            key={business.id}
            className={`bg-zinc-800 rounded-lg p-6 cursor-pointer transition-all ${
              selectedBusiness?.id === business.id 
                ? 'ring-2 ring-blue-500 bg-zinc-700' 
                : 'hover:bg-zinc-700'
            }`}
            onClick={() => onBusinessSelect(business)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                {business.brandName || business.registeredName}
              </h3>
              <span className={`px-2 py-1 rounded text-xs ${
                business.isActive 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {business.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-zinc-400 text-sm mb-2">
              {business.contactEmail}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBusiness(business);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageFeatures(business);
                }}
                className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 transition-colors flex items-center gap-1"
              >
                ⚡ Features
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBusiness(business.id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Staff Tab Component - Extracted outside
const StaffTab = ({ 
  staffMembers, 
  selectedBusiness, 
  onCreateStaff, 
  onEditStaff, 
  onDeleteStaff, 
  onResetPassword,
  onToggleActivation,
  loading 
}) => {
  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Please select a business first to manage staff members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Management</h2>
          <p className="text-zinc-400">Managing staff for: {selectedBusiness.brandName || selectedBusiness.registeredName}</p>
        </div>
        <button
          onClick={onCreateStaff}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  PIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-zinc-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {staff.fullName || 'No name'}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {staff.phoneNumber || 'No phone number'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {staff.venueName ? (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-900/20 text-purple-400 rounded-full">
                        {staff.venueName}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      staff.hasPinSet 
                        ? 'bg-emerald-900/20 text-emerald-400' 
                        : 'bg-amber-900/20 text-amber-400'
                    }`}>
                      {staff.hasPinSet ? '✓ Set' : '✗ Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActivation(staff.id)}
                      className={`px-2 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                        staff.isActive 
                          ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                          : 'bg-red-900 text-red-300 hover:bg-red-800'
                      }`}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEditStaff(staff)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onResetPassword(staff)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => onDeleteStaff(staff.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {staffMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-zinc-400">No staff members found for this business.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Menu Tab Component - Extracted outside
const MenuTab = ({ 
  selectedBusiness, 
  categories, 
  selectedCategory, 
  products, 
  onCategorySelect, 
  onCreateCategory, 
  onEditCategory, 
  onDeleteCategory,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  isMenuLoading,
  productsLoading 
}) => {
  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Please select a business first to manage menu items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-zinc-400">Managing menu for: {selectedBusiness.brandName || selectedBusiness.registeredName}</p>
        </div>
        <button
          onClick={onCreateCategory}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Create Category
        </button>
      </div>

      {isMenuLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedCategory?.id === category.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                    onClick={() => onCategorySelect(category)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(category);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(category.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {categories.length === 0 && (
                <p className="text-zinc-400 text-sm">No categories found. Create one to get started.</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Products {selectedCategory && `- ${selectedCategory.name}`}
                </h3>
                {selectedCategory && (
                  <button
                    onClick={onCreateProduct}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Product
                  </button>
                )}
              </div>

              {!selectedCategory ? (
                <p className="text-zinc-400 text-sm">Select a category to view products.</p>
              ) : productsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-zinc-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{product.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.isAvailable 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <p className="text-zinc-400 text-sm mb-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-white font-semibold">
                          €{product.price.toFixed(2)}
                          {product.oldPrice && (
                            <span className="text-zinc-400 line-through ml-2">
                              €{product.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedCategory && products.length === 0 && !productsLoading && (
                <p className="text-zinc-400 text-sm">No products found in this category.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Events Tab Component - Extracted outside
const EventsTab = ({
  events,
  businesses,
  venues,
  selectedBusiness,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onTogglePublish,
  onRestoreEvent,
  eventsLoading
}) => {
  const [filterBusiness, setFilterBusiness] = useState('all');
  const [filterVenue, setFilterVenue] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVibe, setFilterVibe] = useState('all');
  const [filterEntryType, setFilterEntryType] = useState('all');

  // Filter events with improved logic
  const filteredEvents = events.filter(event => {
    // Business filter
    if (filterBusiness !== 'all' && event.businessId !== parseInt(filterBusiness)) return false;
    
    // Venue filter (depends on business selection)
    if (filterVenue !== 'all' && event.venueId !== parseInt(filterVenue)) return false;
    
    // Status filter with proper deleted event handling
    if (filterStatus === 'published' && (!event.isPublished || event.isDeleted)) return false;
    if (filterStatus === 'draft' && (event.isPublished || event.isDeleted)) return false;
    if (filterStatus === 'deleted' && !event.isDeleted) return false;
    
    // For 'all' status, exclude deleted events unless explicitly showing deleted
    if (filterStatus === 'all' && event.isDeleted) return false;
    
    // VIP filters
    if (filterVibe !== 'all' && event.vibe !== filterVibe) return false;
    if (filterEntryType !== 'all' && event.entryType?.toLowerCase() !== filterEntryType.toLowerCase()) return false;
    
    return true;
  });

  // Get venues for selected business
  const businessVenues = filterBusiness !== 'all' 
    ? venues.filter(v => v.businessId === parseInt(filterBusiness))
    : venues;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Events Management</h2>
          <div className="flex items-center gap-6 mt-2 text-sm text-zinc-400">
            <span>📊 {events.length} Total Events</span>
            <span>✅ {events.filter(e => e.isPublished && !e.isDeleted).length} Published</span>
            <span>📝 {events.filter(e => !e.isPublished && !e.isDeleted).length} Drafts</span>
            <span>🗑️ {events.filter(e => e.isDeleted).length} Deleted</span>
            <span>🏢 {new Set(events.map(e => e.businessId)).size} Businesses</span>
          </div>
        </div>
        <button
          onClick={onCreateEvent}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          + Create Event
        </button>
      </div>

      {/* Quick Business Actions */}
      {filterBusiness !== 'all' && (
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-400">🏢</span>
              <div>
                <h3 className="text-white font-medium">
                  {businesses.find(b => b.id === parseInt(filterBusiness))?.brandName || 
                   businesses.find(b => b.id === parseInt(filterBusiness))?.registeredName}
                </h3>
                <p className="text-sm text-zinc-400">
                  {filteredEvents.length} events • {businessVenues.length} venues
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCreateEvent}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Event
              </button>
              <button
                onClick={() => setFilterBusiness('all')}
                className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-600"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <select
          value={filterBusiness}
          onChange={(e) => {
            setFilterBusiness(e.target.value);
            setFilterVenue('all');
          }}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
        >
          <option value="all">All Businesses</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.brandName || b.registeredName}</option>
          ))}
        </select>

        <select
          value={filterVenue}
          onChange={(e) => setFilterVenue(e.target.value)}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
          disabled={filterBusiness === 'all'}
        >
          <option value="all">All Venues</option>
          {businessVenues.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="deleted">Deleted</option>
        </select>

        <select
          value={filterVibe}
          onChange={(e) => setFilterVibe(e.target.value)}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
        >
          <option value="all">All Vibes</option>
          <option value="House">🎵 House</option>
          <option value="Techno">🎵 Techno</option>
          <option value="Commercial">🎵 Commercial</option>
          <option value="Live Music">🎵 Live Music</option>
          <option value="Hip Hop">🎵 Hip Hop</option>
          <option value="Chill">🎵 Chill</option>
        </select>

        <select
          value={filterEntryType}
          onChange={(e) => setFilterEntryType(e.target.value)}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
        >
          <option value="all">All Entry Types</option>
          <option value="free">🆓 Free</option>
          <option value="reservation">💎 Reservation</option>
          <option value="ticketed">🎫 Ticketed</option>
        </select>
      </div>

      {eventsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            const isUpcoming = startDate > new Date();
            const isPast = endDate < new Date();
            
            return (
              <div
                key={event.id}
                className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all duration-300"
              >
                {/* Event Flyer */}
                <div className="h-48 bg-zinc-900 overflow-hidden relative">
                  {event.flyerImageUrl ? (
                    <img
                      src={event.flyerImageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-20">🎉</span>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {event.isPublished && !event.isDeleted && (
                      <span className="px-2 py-1 bg-green-900/80 text-green-300 text-xs rounded backdrop-blur-sm">
                        Published
                      </span>
                    )}
                    {!event.isPublished && !event.isDeleted && (
                      <span className="px-2 py-1 bg-yellow-900/80 text-yellow-300 text-xs rounded backdrop-blur-sm">
                        Draft
                      </span>
                    )}
                    {event.isDeleted && (
                      <span className="px-2 py-1 bg-red-900/80 text-red-300 text-xs rounded backdrop-blur-sm">
                        Deleted
                      </span>
                    )}
                    {isPast && !event.isDeleted && (
                      <span className="px-2 py-1 bg-zinc-900/80 text-zinc-400 text-xs rounded backdrop-blur-sm">
                        Past
                      </span>
                    )}
                    {isUpcoming && !event.isDeleted && (
                      <span className="px-2 py-1 bg-blue-900/80 text-blue-300 text-xs rounded backdrop-blur-sm">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Title & Business */}
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate">{event.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">🏢</span>
                          <span className="font-medium text-blue-300">{event.businessName}</span>
                        </div>
                      </div>
                      {filterBusiness === 'all' && (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/30">
                          Business {event.businessId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">📍</span>
                        <span className="text-zinc-300">{event.venueName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="text-sm text-zinc-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">📅</span>
                      <span>{startDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">⏰</span>
                      <span>
                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">{event.description}</p>
                  )}

                  {/* VIP Features */}
                  <div className="flex flex-wrap gap-2">
                    {/* Vibe Tag */}
                    {event.vibe && (
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        event.vibe === 'House' ? 'bg-purple-900/30 text-purple-300 border border-purple-700/30' :
                        event.vibe === 'Techno' ? 'bg-red-900/30 text-red-300 border border-red-700/30' :
                        event.vibe === 'Commercial' ? 'bg-orange-900/30 text-orange-300 border border-orange-700/30' :
                        event.vibe === 'Live Music' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/30' :
                        event.vibe === 'Hip Hop' ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700/30' :
                        event.vibe === 'Chill' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-700/30' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        🎵 {event.vibe}
                      </span>
                    )}
                    
                    {/* Entry Type */}
                    {event.entryType && (
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        event.entryType.toLowerCase() === 'free' ? 'bg-green-900/30 text-green-300 border border-green-700/30' :
                        event.entryType.toLowerCase() === 'reservation' ? 'bg-amber-900/30 text-amber-300 border border-amber-700/30' :
                        event.entryType.toLowerCase() === 'ticketed' ? 'bg-blue-900/30 text-blue-300 border border-blue-700/30' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        {event.entryType.toLowerCase() === 'free' ? '🆓' :
                         event.entryType.toLowerCase() === 'reservation' ? '💎' :
                         event.entryType.toLowerCase() === 'ticketed' ? '🎫' : '🎟️'} {event.entryType}
                      </span>
                    )}
                    
                    {/* Minimum Spend for VIP Events */}
                    {event.minimumSpend && event.minimumSpend > 0 && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 border border-yellow-700/30 text-xs rounded font-medium">
                        💰 €{event.minimumSpend} min
                      </span>
                    )}
                  </div>

                  {/* Ticket Info */}
                  {event.isTicketed && (
                    <div className="text-sm text-zinc-300">
                      <span className="font-medium">🎫 €{event.ticketPrice}</span>
                      {event.maxGuests > 0 && (
                        <span className="text-zinc-400 ml-2">
                          • {event.spotsRemaining || 0}/{event.maxGuests} spots left
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="text-xs text-zinc-500">
                    {event.bookingCount || 0} bookings • {event.totalGuests || 0} guests
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-700">
                    {!event.isDeleted && (
                      <>
                        <button
                          onClick={() => onEditEvent(event)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onTogglePublish(event)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            event.isPublished
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {event.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {event.isDeleted && (
                      <button
                        onClick={() => onRestoreEvent(event.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredEvents.length === 0 && !eventsLoading && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No events found matching the selected filters.</p>
        </div>
      )}
    </div>
  );
};

// Main SuperAdminDashboard Component
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  
  // Core state
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Staff state
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Menu state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Venues state
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  
  // Venue exclusion state
  const [categoryExcludedVenues, setCategoryExcludedVenues] = useState([]);
  const [productExcludedVenues, setProductExcludedVenues] = useState([]);
  const [loadingExclusions, setLoadingExclusions] = useState(false);
  
  // Units state
  const [selectedZone, setSelectedZone] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  
  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  
  // Business state
  const [editingBusiness, setEditingBusiness] = useState(null);
  
  // Modal states
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);
  const [showEditVenueModal, setShowEditVenueModal] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [showFeaturesPanel, setShowFeaturesPanel] = useState(false);
  const [featuresBusiness, setFeaturesBusiness] = useState(null);
  
  // Form states
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    fullName: '',
    role: '',
    pin: '',
    isActive: true,
    venueId: null,
    venues: []
  });

  const [businessForm, setBusinessForm] = useState({
    registeredName: '',
    brandName: '',
    taxId: '',
    contactEmail: '',
    logoUrl: '',
    phoneNumber: '',
    operationZone: '',
    googleMapsAddress: '',
    reviewLink: '',
    isActive: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sortOrder: 0,
    isActive: true
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    oldPrice: null,
    isAvailable: true,
    isAlcohol: false,
    categoryId: '' // Add categoryId for dropdown
  });

  const [venueForm, setVenueForm] = useState({
    name: '',
    type: '',
    description: '',
    address: '',
    imageUrl: '',
    latitude: null,
    longitude: null,
    orderingEnabled: true,
    googlePlaceId: '',
    isDigitalOrderingEnabled: null
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    zoneType: '',
    description: '',
    capacityPerUnit: 1,
    basePrice: 0,
    sortOrder: 0,
    isActive: true
  });

  const [bulkUnitForm, setBulkUnitForm] = useState({
    prefix: '',
    startNumber: 1,
    count: 10,
    unitType: 'Sunbed',
    basePrice: 0
  });

  // Memoized form handlers to prevent re-renders
  const handleStaffFormChange = useCallback((field, value) => {
    setStaffForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBusinessFormChange = useCallback((field, value) => {
    setBusinessForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryFormChange = useCallback((field, value) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProductFormChange = useCallback((field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVenueFormChange = useCallback((field, value) => {
    setVenueForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleZoneFormChange = useCallback((field, value) => {
    setZoneForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Authentication check
  useEffect(() => {
    const checkUserRole = () => {
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      
      if (!token || role !== 'SuperAdmin') {
        localStorage.clear();
        window.location.href = '/superadmin/login';
        return;
      }
      
      setUserInfo({
        role,
        name: userName || 'Super Administrator',
        email: userEmail || 'superadmin@rivieraos.com'
      });
    };
    
    checkUserRole();
  }, []);

  // Fetch businesses when authenticated
  useEffect(() => {
    if (userInfo) {
      fetchBusinesses();
    }
  }, [userInfo]);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await businessApi.superAdmin.getAll();
      const businessesArray = Array.isArray(data) ? data : data?.items || [];
      setBusinesses(businessesArray);
      setError('');
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to fetch businesses: ' + (err.response?.data?.message || err.message));
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBusinessSelect = useCallback(async (business) => {
    // Clear all previous business data before loading new business
    setSelectedBusiness(business);
    setStaffMembers([]);
    setCategories([]);
    setSelectedCategory(null);
    setProducts([]);
    setVenues([]);
    setSelectedVenue(null);
    setZones([]);
    setSelectedZone(null);
    setUnits([]);
    setError('');
    
    // Fetch staff for selected business
    try {
      setStaffLoading(true);
      const staffData = await staffApi.getByBusiness(business.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffMembers([]);
    } finally {
      setStaffLoading(false);
    }

    // Fetch menu data for selected business
    try {
      setCategories([]);
      setSelectedCategory(null);
      setProducts([]);
      setIsMenuLoading(true);
      setError('');

      const categoryData = await categoryApi.business.getByBusiness(business.id);
      setCategories(Array.isArray(categoryData) ? categoryData : []);

      if (categoryData && categoryData.length > 0) {
        const firstCategory = categoryData[0];
        setSelectedCategory(firstCategory);

        const productData = await productApi.getByCategory(firstCategory.id);
        setProducts(Array.isArray(productData) ? productData : []);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      if (err.response?.status !== 404) {
        setError('Failed to load menu: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsMenuLoading(false);
    }
    
    // Fetch venues for selected business
    try {
      setVenuesLoading(true);
      const venueData = await venueApi.getByBusiness(business.id);
      setVenues(Array.isArray(venueData) ? venueData : []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setVenues([]);
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  // Business Management Functions
  const handleCreateBusiness = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...businessForm,
        brandName: businessForm.brandName?.trim() || null,
        taxId: businessForm.taxId?.trim() || null,
        logoUrl: businessForm.logoUrl?.trim() || null,
        phoneNumber: businessForm.phoneNumber?.trim() || null,
        operationZone: businessForm.operationZone?.trim() || null,
        googleMapsAddress: businessForm.googleMapsAddress?.trim() || null,
        reviewLink: businessForm.reviewLink?.trim() || null
      };

      await businessApi.superAdmin.create(payload);
      setShowCreateBusinessModal(false);
      setBusinessForm({
        registeredName: '',
        brandName: '',
        taxId: '',
        contactEmail: '',
        logoUrl: '',
        phoneNumber: '',
        operationZone: '',
        googleMapsAddress: '',
        reviewLink: '',
        isActive: true
      });
      
      // Refresh businesses list
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error creating business:', err);
      setError('Failed to create business: ' + (err.response?.data?.message || err.message));
    }
  }, [businessForm, fetchBusinesses]);

  const handleUpdateBusiness = useCallback(async (e) => {
    e.preventDefault();
    if (!editingBusiness) return;
    
    try {
      const payload = {
        ...businessForm,
        brandName: businessForm.brandName?.trim() || null,
        taxId: businessForm.taxId?.trim() || null,
        logoUrl: businessForm.logoUrl?.trim() || null,
        phoneNumber: businessForm.phoneNumber?.trim() || null,
        operationZone: businessForm.operationZone?.trim() || null,
        googleMapsAddress: businessForm.googleMapsAddress?.trim() || null,
        reviewLink: businessForm.reviewLink?.trim() || null
      };

      await businessApi.superAdmin.update(editingBusiness.id, payload);
      setShowEditBusinessModal(false);
      setEditingBusiness(null);
      setBusinessForm({
        registeredName: '',
        brandName: '',
        taxId: '',
        contactEmail: '',
        logoUrl: '',
        phoneNumber: '',
        operationZone: '',
        googleMapsAddress: '',
        reviewLink: '',
        isActive: true
      });
      
      // Refresh businesses list
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error updating business:', err);
      setError('Failed to update business: ' + (err.response?.data?.message || err.message));
    }
  }, [editingBusiness, businessForm, fetchBusinesses]);

  const handleDeleteBusiness = useCallback(async (businessId) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
    
    try {
      await businessApi.superAdmin.delete(businessId);
      await fetchBusinesses();
      setError('');
    } catch (err) {
      console.error('Error deleting business:', err);
      setError('Failed to delete business: ' + (err.response?.data?.message || err.message));
    }
  }, [fetchBusinesses]);

  // Features Management Functions
  const handleManageFeatures = useCallback((business) => {
    console.log('🔧 Opening features panel for business:', business.brandName || business.registeredName);
    setFeaturesBusiness(business);
    setShowFeaturesPanel(true);
  }, []);

  const handleCloseFeaturesPanel = useCallback(() => {
    setShowFeaturesPanel(false);
    setFeaturesBusiness(null);
  }, []);

  // Staff Management Functions
  const handleCreateStaff = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    
    try {
      // Create staff member with email, password, phone number and PIN
      // Normalize phone number to match backend format
      const staffData = {
        email: staffForm.email,
        password: staffForm.password,
        phoneNumber: normalizePhoneNumber(staffForm.phoneNumber),
        fullName: staffForm.fullName,
        role: staffForm.role,
        pin: staffForm.pin,
        isActive: staffForm.isActive,
        venueId: staffForm.venueId || null
      };
      
      console.log('📤 Creating staff with data:', {
        email: staffData.email,
        password: '************',
        phoneNumber: staffData.phoneNumber,
        fullName: staffData.fullName,
        role: staffData.role,
        pin: '****',
        businessId: selectedBusiness.id
      });
      
      await staffApi.create(selectedBusiness.id, staffData);
      setShowCreateStaffModal(false);
      setStaffForm({
        email: '',
        password: '',
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true,
        venueId: null,
        venues: []
      });
      
      // Refresh staff list
      const refreshedStaffData = await staffApi.getByBusiness(selectedBusiness.id);
      console.log('📊 Refreshed staff data:', refreshedStaffData);
      setStaffMembers(Array.isArray(refreshedStaffData) ? refreshedStaffData : []);
      setError('');
      
      console.log('✅ Staff member created successfully');
    } catch (err) {
      console.error('Error creating staff:', err);
      setError('Failed to create staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, staffForm]);

  const handleUpdateStaff = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff) return;
    
    try {
      // Update staff member with email, phone number and PIN
      // Only include PIN if it's not empty to avoid 400 validation error (regex ^\d{4}$)
      const staffData = {
        email: staffForm.email,
        phoneNumber: normalizePhoneNumber(staffForm.phoneNumber),
        fullName: staffForm.fullName,
        role: staffForm.role,
        isActive: staffForm.isActive,
        venueId: staffForm.venueId || null
      };

      if (staffForm.pin && staffForm.pin.trim() !== '') {
        staffData.pin = staffForm.pin;
      }
      
      await staffApi.update(selectedBusiness.id, editingStaff.id, staffData);
      setShowEditStaffModal(false);
      setEditingStaff(null);
      setStaffForm({
        email: '',
        phoneNumber: '',
        fullName: '',
        role: '',
        pin: '',
        isActive: true,
        venueId: null,
        venues: []
      });
      
      // Refresh staff list
      const refreshedStaffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(refreshedStaffData) ? refreshedStaffData : []);
      setError('');
    } catch (err) {
      console.error('Error updating staff:', err);
      setError('Failed to update staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingStaff, staffForm]);

  const handleDeleteStaff = useCallback(async (staffId) => {
    if (!selectedBusiness) return;
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await staffApi.delete(selectedBusiness.id, staffId);
      
      // Refresh staff list
      const staffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness]);

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !editingStaff || !newPassword) {
      console.warn('Missing required data for password reset:', {
        selectedBusiness: !!selectedBusiness,
        editingStaff: !!editingStaff,
        newPassword: !!newPassword
      });
      setError('Missing required information for password reset');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setError('');
      console.log('🔄 Attempting to reset password for staff:', {
        businessId: selectedBusiness.id,
        staffId: editingStaff.id,
        staffName: editingStaff.fullName,
        passwordLength: newPassword.length
      });
      
      const result = await staffApi.resetPassword(selectedBusiness.id, editingStaff.id, newPassword);
      
      console.log('✅ Password reset successful:', result);
      
      setShowResetPasswordModal(false);
      setEditingStaff(null);
      setNewPassword('');
      setError('');
      
      // Better success feedback
      setSuccessMessage(`Password reset successfully for ${editingStaff.fullName}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('❌ Error resetting password:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      let errorMessage = 'Failed to reset password';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized - Please check your login status';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to reset passwords';
      } else if (err.response?.status === 404) {
        errorMessage = 'Staff member not found';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  }, [selectedBusiness, editingStaff, newPassword]);

  const handleToggleStaffActivation = useCallback(async (staffId) => {
    if (!selectedBusiness) return;
    
    try {
      await staffApi.toggleActivation(selectedBusiness.id, staffId);
      
      // Refresh staff list
      const staffData = await staffApi.getByBusiness(selectedBusiness.id);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError('');
    } catch (err) {
      console.error('Error toggling staff activation:', err);
      setError('Failed to toggle staff activation: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness]);

  // Menu Management Functions
  const fetchMenuForBusiness = useCallback(async (businessId) => {
    if (!businessId) return;

    setCategories([]);
    setSelectedCategory(null);
    setProducts([]);
    setIsMenuLoading(true);
    setError('');

    try {
      const categoryData = await categoryApi.business.getByBusiness(businessId);
      setCategories(Array.isArray(categoryData) ? categoryData : []);

      if (categoryData && categoryData.length > 0) {
        const firstCategory = categoryData[0];
        setSelectedCategory(firstCategory);

        const productData = await productApi.getByCategory(firstCategory.id);
        setProducts(Array.isArray(productData) ? productData : []);
      } else {
        setSelectedCategory(null);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      if (err.response?.status === 404) {
        setCategories([]);
        setSelectedCategory(null);
        setProducts([]);
        setError('');
      } else {
        setError('Failed to load menu: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsMenuLoading(false);
    }
  }, []);

  const handleCategorySelect = useCallback(async (category) => {
    if (!category) return;

    setSelectedCategory(category);
    setProductsLoading(true);
    
    try {
      const productData = await productApi.getByCategory(category.id);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error('Error fetching products for category:', err);
      setProducts([]);
      setError('Failed to fetch products: ' + (err.response?.data?.message || err.message));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const handleCreateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id) return;
    
    try {
      const newCategory = await categoryApi.business.create(selectedBusiness.id, categoryForm);
      
      // Set exclusions for new category
      if (categoryExcludedVenues.length > 0) {
        await categoryApi.business.setExclusions(selectedBusiness.id, newCategory.id, categoryExcludedVenues);
      }
      
      setShowCreateCategoryModal(false);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, categoryForm, categoryExcludedVenues]);

  const handleUpdateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id || !editingCategory) return;
    
    try {
      // Update category data
      await categoryApi.business.update(selectedBusiness.id, editingCategory.id, categoryForm);
      
      // Update exclusions
      await categoryApi.business.setExclusions(selectedBusiness.id, editingCategory.id, categoryExcludedVenues);
      
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sortOrder: 0,
        isActive: true
      });
      setCategoryExcludedVenues([]);
      await fetchMenuForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingCategory, categoryForm, categoryExcludedVenues]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (!selectedBusiness?.id) return;
    if (!confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) return;
    
    try {
      await categoryApi.business.delete(selectedBusiness.id, categoryId);
      await fetchMenuForBusiness(selectedBusiness.id);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setProducts([]);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, selectedCategory]);

  const handleCreateProduct = useCallback(async (e) => {
    e.preventDefault();
    
    // Require explicit category selection - no fallback to selectedCategory
    const categoryId = productForm.categoryId;
    
    if (!categoryId) {
      setError('Please select a category from the dropdown');
      return;
    }
    
    try {
      const newProduct = await productApi.create(categoryId, productForm);
      
      // Set exclusions for new product
      if (productExcludedVenues.length > 0) {
        await productApi.setExclusions(categoryId, newProduct.id, productExcludedVenues);
      }
      
      setShowCreateProductModal(false);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false,
        categoryId: ''
      });
      setProductExcludedVenues([]);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(categoryId);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product: ' + (err.response?.data?.message || err.message));
    }
  }, [productForm, productExcludedVenues]);

  const handleUpdateProduct = useCallback(async (e) => {
    e.preventDefault();
    
    // Use categoryId from form (allows changing category in modal)
    const categoryId = productForm.categoryId || selectedCategory?.id;
    
    if (!categoryId || !editingProduct) {
      setError('Please select a category');
      return;
    }
    
    try {
      // Update product data
      await productApi.update(categoryId, editingProduct.id, productForm);
      
      // Update exclusions
      await productApi.setExclusions(categoryId, editingProduct.id, productExcludedVenues);
      
      setShowEditProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        oldPrice: null,
        isAvailable: true,
        isAlcohol: false,
        categoryId: ''
      });
      setProductExcludedVenues([]);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(categoryId);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product: ' + (err.response?.data?.message || err.message));
    }
  }, [productForm, selectedCategory, editingProduct]);

  const handleDeleteProduct = useCallback(async (productId) => {
    if (!selectedCategory) return;
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      await productApi.delete(selectedCategory.id, productId);
      
      // Refresh products for current category
      const productData = await productApi.getByCategory(selectedCategory.id);
      setProducts(Array.isArray(productData) ? productData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedCategory]);

  // Exclusion management functions
  const fetchCategoryExclusions = useCallback(async (businessId, categoryId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await categoryApi.business.getExclusions(businessId, categoryId);
      setCategoryExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching category exclusions:', err);
      setCategoryExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
    }
  }, []);

  const fetchProductExclusions = useCallback(async (categoryId, productId) => {
    try {
      setLoadingExclusions(true);
      const exclusions = await productApi.getExclusions(categoryId, productId);
      setProductExcludedVenues(exclusions.map(e => e.venueId));
    } catch (err) {
      console.error('Error fetching product exclusions:', err);
      setProductExcludedVenues([]);
    } finally {
      setLoadingExclusions(false);
    }
  }, []);

  // Venues Management Functions
  const fetchVenuesForBusiness = useCallback(async (businessId) => {
    if (!businessId) return;

    setVenuesLoading(true);
    try {
      const venueData = await venueApi.getByBusiness(businessId);
      setVenues(Array.isArray(venueData) ? venueData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching venues:', err);
      setVenues([]);
      if (err.response?.status !== 404) {
        setError('Failed to fetch venues: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  const handleVenueSelect = useCallback(async (venue) => {
    setSelectedVenue(venue);
    
    // Fetch zones for selected venue
    try {
      const zoneData = await zoneApi.getByVenue(venue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setZones([]);
    }
  }, []);

  const handleCreateVenue = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id) return;
    
    try {
      // Sanitize venue form to convert empty strings to null for backend
      const sanitizedVenue = {
        ...venueForm,
        type: venueForm.type || null,
        description: venueForm.description || null,
        address: venueForm.address || null,
        imageUrl: venueForm.imageUrl || null,
        googlePlaceId: venueForm.googlePlaceId || null
      };
      
      await venueApi.create(selectedBusiness.id, sanitizedVenue);
      setShowCreateVenueModal(false);
      setVenueForm({
        name: '',
        type: '',
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true,
        googlePlaceId: '',
        isDigitalOrderingEnabled: null
      });
      await fetchVenuesForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error creating venue:', err);
      setError('Failed to create venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, venueForm]);

  const handleUpdateVenue = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedBusiness?.id || !editingVenue) return;
    
    try {
      await venueApi.update(selectedBusiness.id, editingVenue.id, venueForm);
      setShowEditVenueModal(false);
      setEditingVenue(null);
      setVenueForm({
        name: '',
        type: '',
        description: '',
        address: '',
        imageUrl: '',
        latitude: null,
        longitude: null,
        orderingEnabled: true,
        googlePlaceId: '',
        isDigitalOrderingEnabled: null
      });
      await fetchVenuesForBusiness(selectedBusiness.id);
      setError('');
    } catch (err) {
      console.error('Error updating venue:', err);
      setError('Failed to update venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, editingVenue, venueForm]);

  const handleDeleteVenue = useCallback(async (venueId) => {
    if (!selectedBusiness?.id) return;
    if (!confirm('Are you sure you want to delete this venue? This will also delete all zones in this venue.')) return;
    
    try {
      await venueApi.delete(selectedBusiness.id, venueId);
      await fetchVenuesForBusiness(selectedBusiness.id);
      if (selectedVenue?.id === venueId) {
        setSelectedVenue(null);
        setZones([]);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError('Failed to delete venue: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedBusiness, selectedVenue]);

  const handleCreateZone = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;
    
    try {
      console.log('📤 [SuperAdmin] Creating zone with data:', {
        name: zoneForm.name,
        zoneType: zoneForm.zoneType,
        capacityPerUnit: zoneForm.capacityPerUnit,
        capacityType: typeof zoneForm.capacityPerUnit,
        basePrice: zoneForm.basePrice,
        description: zoneForm.description,
        sortOrder: zoneForm.sortOrder,
        isActive: zoneForm.isActive
      });
      
      const response = await zoneApi.create(selectedVenue.id, zoneForm);
      
      console.log('✅ [SuperAdmin] Zone created successfully:', response);
      
      setShowCreateZoneModal(false);
      setZoneForm({
        name: '',
        zoneType: '',
        description: '',
        capacityPerUnit: 1,
        basePrice: 0,
        sortOrder: 0,
        isActive: true
      });
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      console.log('📊 [SuperAdmin] Refreshed zone data:', zoneData);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('❌ [SuperAdmin] Error creating zone:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to create zone: ' + errorMessage);
    }
  }, [selectedVenue, zoneForm]);

  const handleUpdateZone = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue || !editingZone) return;
    
    try {
      await zoneApi.update(selectedVenue.id, editingZone.id, zoneForm);
      setShowEditZoneModal(false);
      setEditingZone(null);
      setZoneForm({
        name: '',
        zoneType: '',
        description: '',
        capacityPerUnit: 1,
        basePrice: 0,
        sortOrder: 0,
        isActive: true
      });
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error updating zone:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to update zone: ' + errorMessage);
    }
  }, [selectedVenue, editingZone, zoneForm]);

  const handleDeleteZone = useCallback(async (zoneId) => {
    if (!selectedVenue) return;
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) return;
    
    try {
      await zoneApi.delete(selectedVenue.id, zoneId);
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error deleting zone:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to delete zone: ' + errorMessage);
    }
  }, [selectedVenue]);

  const handleToggleZoneActive = useCallback(async (zoneId) => {
    if (!selectedVenue) return;
    
    try {
      await zoneApi.toggleActive(selectedVenue.id, zoneId);
      
      // Refresh zones for current venue
      const zoneData = await zoneApi.getByVenue(selectedVenue.id);
      setZones(Array.isArray(zoneData) ? zoneData : []);
      setError('');
    } catch (err) {
      console.error('Error toggling zone active status:', err);
      setError('Failed to toggle zone: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue]);

  // Units Management Functions
  const fetchUnitsForZone = useCallback(async (venueId, zoneId) => {
    if (!venueId || !zoneId) return;
    
    setUnitsLoading(true);
    try {
      const unitData = await unitApi.getByVenue(venueId, { zoneId });
      setUnits(Array.isArray(unitData) ? unitData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching units:', err);
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  }, []);

  const handleZoneSelect = useCallback((zone) => {
    setSelectedZone(zone);
    if (selectedVenue) {
      fetchUnitsForZone(selectedVenue.id, zone.id);
    }
  }, [selectedVenue, fetchUnitsForZone]);

  const handleBulkCreateUnits = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedVenue || !selectedZone) return;
    
    try {
      // Sanitize bulk unit form
      const sanitizedBulkData = {
        venueZoneId: selectedZone.id,
        ...bulkUnitForm,
        prefix: bulkUnitForm.prefix || null // Convert empty string to null (since I made it optional in backend)
      };
      
      await unitApi.bulkCreate(selectedVenue.id, sanitizedBulkData);
      setShowBulkCreateModal(false);
      setBulkUnitForm({
        prefix: '',
        startNumber: 1,
        count: 10,
        unitType: 'Sunbed',
        basePrice: 0
      });
      await fetchUnitsForZone(selectedVenue.id, selectedZone.id);
      setError('');
    } catch (err) {
      console.error('Error bulk creating units:', err);
      setError('Failed to create units: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, selectedZone, bulkUnitForm, fetchUnitsForZone]);

  const handleDeleteUnit = useCallback(async (unitId) => {
    if (!selectedVenue || !selectedZone) return;
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await unitApi.delete(selectedVenue.id, unitId);
      await fetchUnitsForZone(selectedVenue.id, selectedZone.id);
      setError('');
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedVenue, selectedZone, fetchUnitsForZone]);

  // Events Management Functions
  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      console.log('🔄 Fetching SuperAdmin events...');
      
      // Check if we have a valid token
      const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        setEvents([]);
        return;
      }
      
      const response = await eventsApi.list();
      console.log('✅ SuperAdmin events response:', response);
      
      // Handle different response structures
      const eventsData = response.items || response.data || response || [];
      console.log('📊 Events data:', eventsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // Set empty array on error to prevent UI issues
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const handleToggleEventPublish = async (event) => {
    try {
      if (event.isPublished) {
        await eventsApi.unpublish(event.id);
      } else {
        await eventsApi.publish(event.id);
      }
      await fetchEvents();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error toggling event publish status:', err);
      setError(`Failed to ${event.isPublished ? 'unpublish' : 'publish'} event: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRestoreEvent = async (eventId) => {
    try {
      await eventsApi.restore(eventId);
      await fetchEvents();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error restoring event:', err);
      setError(`Failed to restore event: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      // Backend now allows optional venueId
      if (!eventData.venueId || isNaN(eventData.venueId)) {
        eventData.venueId = null;
      } else {
        // Ensure venueId is a proper integer
        eventData.venueId = parseInt(eventData.venueId);
      }
      console.log('📤 Creating event with payload:', JSON.stringify(eventData, null, 2));
      await eventsApi.create(eventData);
      setShowCreateEventModal(false);
      await fetchEvents();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating event:', err);
      console.error('Response data:', err.response?.data);
      setError(`Failed to create event: ${err.response?.data?.message || err.response?.data || err.message}`);
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      if (!eventData.venueId || isNaN(eventData.venueId)) {
        eventData.venueId = null;
      } else {
        eventData.venueId = parseInt(eventData.venueId);
      }
      console.log('📤 Updating event with payload:', JSON.stringify(eventData, null, 2));
      await eventsApi.update(eventId, eventData);
      setShowEditEventModal(false);
      setEditingEvent(null);
      await fetchEvents();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error updating event:', err);
      console.error('Response data:', err.response?.data);
      setError(`Failed to update event: ${err.response?.data?.message || err.response?.data || err.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    
    try {
      await eventsApi.delete(deletingEvent.id);
      setShowDeleteEventModal(false);
      setDeletingEvent(null);
      await fetchEvents();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(`Failed to delete event: ${err.response?.data?.message || err.message}`);
    }
  };

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Businesses</h3>
                <p className="text-3xl font-bold text-blue-400">
                  {businesses.length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Active Businesses</h3>
                <p className="text-3xl font-bold text-green-400">
                  {businesses.filter(b => b.isActive).length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Staff</h3>
                <p className="text-3xl font-bold text-purple-400">
                  {staffMembers.length}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-medium mb-2 text-zinc-300">Total Venues</h3>
                <p className="text-3xl font-bold text-amber-400">
                  {venues.length}
                </p>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/bar')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🍹</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">Bar Display</h4>
                  <p className="text-sm text-zinc-400">Kitchen/Bar order queue screen</p>
                </button>
                
                <button
                  onClick={() => navigate('/collector')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">🏖️</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">Collector Dashboard</h4>
                  <p className="text-sm text-zinc-400">Manage bookings and reservations</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('qr-generator')}
                  className="bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 rounded-lg p-6 text-left transition-all"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="text-lg font-semibold mb-1 text-white">QR Code Generator</h4>
                  <p className="text-sm text-zinc-400">Generate QR codes for zones</p>
                </button>
              </div>
            </div>

            {/* Business Selector Hint */}
            {!selectedBusiness && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-blue-300">
                  💡 Select a business from the Businesses tab to manage its staff, menu, and venues.
                </p>
              </div>
            )}
          </div>
        );

      case 'bulk-import':
        return (
          <div className="space-y-6">
            {!selectedBusiness ? (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-blue-300">
                  💡 Select a business from the Businesses tab to bulk import products.
                </p>
              </div>
            ) : (
              <BulkProductImport 
                businessId={selectedBusiness.id} 
                existingCategories={categories}
                onImportComplete={() => {
                  fetchMenuForBusiness(selectedBusiness.id);
                  setActiveTab('menu');
                }}
              />
            )}
          </div>
        );

      case 'events':
        return (
          <EventsTab
            events={events}
            businesses={businesses}
            venues={venues}
            selectedBusiness={selectedBusiness}
            onCreateEvent={() => setShowCreateEventModal(true)}
            onEditEvent={(event) => {
              setEditingEvent(event);
              setShowEditEventModal(true);
            }}
            onDeleteEvent={(event) => {
              setDeletingEvent(event);
              setShowDeleteEventModal(true);
            }}
            onTogglePublish={handleToggleEventPublish}
            onRestoreEvent={handleRestoreEvent}
            eventsLoading={eventsLoading}
          />
        );

      case 'qr-generator':
        if (!selectedBusiness) {
          return (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg mb-4">Please select a business first</p>
              <button
                onClick={() => setActiveTab('businesses')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Go to Businesses
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">QR Code Generator</h2>
                <p className="text-zinc-400 mt-1">
                  Business: {selectedBusiness.brandName || selectedBusiness.registeredName}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <p className="text-zinc-300 mb-4">
                Generate QR codes for zones and units. Customers can scan these to access menus and make orders/bookings.
              </p>
              
              {venues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No venues found for this business</p>
                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create Venue First
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500">
                    Navigate to Venues & Zones tab to generate QR codes for specific zones and units.
                  </p>
                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Venues & Zones
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'businesses':
        return (
          <BusinessTab
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onBusinessSelect={handleBusinessSelect}
            onCreateBusiness={() => setShowCreateBusinessModal(true)}
            onEditBusiness={async (business) => {
              try {
                const fullBusiness = await businessApi.superAdmin.getById(business.id);
                setEditingBusiness(fullBusiness);
                setBusinessForm({
                  registeredName: fullBusiness.registeredName || '',
                  brandName: fullBusiness.brandName || '',
                  taxId: fullBusiness.taxId || '',
                  contactEmail: fullBusiness.contactEmail || '',
                  logoUrl: fullBusiness.logoUrl || '',
                  phoneNumber: fullBusiness.phoneNumber || '',
                  operationZone: fullBusiness.operationZone || '',
                  googleMapsAddress: fullBusiness.googleMapsAddress || '',
                  reviewLink: fullBusiness.reviewLink || '',
                  isActive: fullBusiness.isActive !== undefined ? fullBusiness.isActive : true
                });
                setShowEditBusinessModal(true);
              } catch (err) {
                console.error('Failed to fetch full business details for editing', err);
                // Fallback to basic list data if fetch fails
                setEditingBusiness(business);
                setBusinessForm({
                  registeredName: business.registeredName || '',
                  brandName: business.brandName || '',
                  taxId: business.taxId || '',
                  contactEmail: business.contactEmail || '',
                  logoUrl: business.logoUrl || '',
                  phoneNumber: business.phoneNumber || '',
                  operationZone: business.operationZone || '',
                  googleMapsAddress: business.googleMapsAddress || '',
                  reviewLink: business.reviewLink || '',
                  isActive: business.isActive !== undefined ? business.isActive : true
                });
                setShowEditBusinessModal(true);
              }
            }}
            onDeleteBusiness={handleDeleteBusiness}
            onManageFeatures={handleManageFeatures}
            loading={loading}
          />
        );
      case 'staff':
        return (
          <StaffTab
            staffMembers={staffMembers}
            selectedBusiness={selectedBusiness}
            onCreateStaff={() => {
              // Venues already fetched in handleBusinessSelect
              setStaffForm(prev => ({
                ...prev,
                venues: venues
              }));
              setShowCreateStaffModal(true);
            }}
            onEditStaff={(staff) => {
              // Venues already fetched in handleBusinessSelect
              setEditingStaff(staff);
              setStaffForm({
                email: staff.email || '',
                phoneNumber: staff.phoneNumber || '',
                fullName: staff.fullName || '',
                role: staff.role || 'Staff',
                pin: '', // Don't pre-fill PIN for security, update logic will omit if empty
                isActive: staff.isActive,
                venueId: staff.venueId || null,
                venues: venues
              });
              setShowEditStaffModal(true);
            }}
            onDeleteStaff={handleDeleteStaff}
            onResetPassword={(staff) => {
              setEditingStaff(staff);
              setNewPassword('');
              setShowResetPasswordModal(true);
            }}
            onToggleActivation={handleToggleStaffActivation}
            loading={staffLoading}
          />
        );
      case 'menu':
        return (
          <MenuTab
            selectedBusiness={selectedBusiness}
            categories={categories}
            selectedCategory={selectedCategory}
            products={products}
            onCategorySelect={handleCategorySelect}
            onCreateCategory={() => setShowCreateCategoryModal(true)}
            onEditCategory={async (category) => {
              setEditingCategory(category);
              setCategoryForm({
                name: category.name || '',
                sortOrder: category.sortOrder || 0,
                isActive: category.isActive
              });
              setShowEditCategoryModal(true);
              if (selectedBusiness?.id) {
                await fetchCategoryExclusions(selectedBusiness.id, category.id);
              }
            }}
            onDeleteCategory={handleDeleteCategory}
            onCreateProduct={() => {
              // Pre-fill categoryId with selected category
              setProductForm({
                name: '',
                description: '',
                imageUrl: '',
                price: 0,
                oldPrice: null,
                isAvailable: true,
                isAlcohol: false,
                categoryId: selectedCategory?.id || ''
              });
              setShowCreateProductModal(true);
            }}
            onEditProduct={async (product) => {
              setEditingProduct(product);
              setProductForm({
                name: product.name || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                price: product.price || 0,
                oldPrice: product.oldPrice || null,
                isAvailable: product.isAvailable,
                isAlcohol: product.isAlcohol,
                categoryId: product.categoryId || selectedCategory?.id || ''
              });
              setShowEditProductModal(true);
              const categoryId = product.categoryId || selectedCategory?.id;
              if (categoryId) {
                await fetchProductExclusions(categoryId, product.id);
              }
            }}
            onDeleteProduct={handleDeleteProduct}
            isMenuLoading={isMenuLoading}
            productsLoading={productsLoading}
          />
        );
      case 'venues':
        if (!selectedBusiness) {
          return (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg mb-4">Please select a business first</p>
              <button
                onClick={() => setActiveTab('businesses')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Go to Businesses
              </button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Venues & Zones</h2>
                <p className="text-zinc-400">
                  Business: {selectedBusiness.brandName || selectedBusiness.registeredName}
                </p>
              </div>
              <button
                onClick={() => setShowCreateVenueModal(true)}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                + Create Venue
              </button>
            </div>

            {venuesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Venues Column */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Venues</h3>
                    <div className="space-y-3">
                      {venues.map((venue) => (
                        <div
                          key={venue.id}
                          className={`p-4 rounded cursor-pointer transition-colors ${
                            selectedVenue?.id === venue.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                          onClick={() => handleVenueSelect(venue)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{venue.name}</h4>
                              {venue.type && <p className="text-sm opacity-75">{venue.type}</p>}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.isActive 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          {venue.address && (
                            <p className="text-sm opacity-75 mb-2">{venue.address}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.orderingEnabled 
                                ? 'bg-green-900/20 text-green-400' 
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {venue.orderingEnabled ? '🛒 Ordering' : '🚫 No Ordering'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              venue.allowsDigitalOrdering 
                                ? 'bg-blue-900/20 text-blue-400' 
                                : 'bg-amber-900/20 text-amber-400'
                            }`}>
                              {venue.isDigitalOrderingEnabled === null 
                                ? '🤖 Auto Menu' 
                                : venue.allowsDigitalOrdering 
                                  ? '✓ Menu Enabled' 
                                  : '✗ Menu Disabled'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/venues/${venue.id}/mapper`);
                                }}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                                title="Visual Mapper"
                              >
                                🗺️
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVenue(venue);
                                  setVenueForm({
                                    name: venue.name,
                                    type: venue.type || '',
                                    description: venue.description || '',
                                    address: venue.address || '',
                                    imageUrl: venue.imageUrl || '',
                                    latitude: venue.latitude,
                                    longitude: venue.longitude,
                                    orderingEnabled: venue.orderingEnabled,
                                    googlePlaceId: venue.googlePlaceId || '',
                                    isDigitalOrderingEnabled: venue.isDigitalOrderingEnabled ?? null
                                  });
                                  setShowEditVenueModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete "${venue.name}"?`)) {
                                    handleDeleteVenue(venue.id);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {venues.length === 0 && (
                      <p className="text-zinc-400 text-sm">No venues found. Create one to get started.</p>
                    )}
                  </div>
                </div>

                {/* Zones Column */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Zones {selectedVenue && `- ${selectedVenue.name}`}
                      </h3>
                      {selectedVenue && (
                        <button
                          onClick={() => setShowCreateZoneModal(true)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          + Zone
                        </button>
                      )}
                    </div>

                    {!selectedVenue ? (
                      <p className="text-zinc-400 text-sm">Select a venue to view zones</p>
                    ) : venuesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {zones.map((zone) => (
                          <div 
                            key={zone.id} 
                            className={`p-4 rounded cursor-pointer transition-colors ${
                              selectedZone?.id === zone.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-700 hover:bg-zinc-600'
                            }`}
                            onClick={() => handleZoneSelect(zone)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-white">{zone.name}</h4>
                                <p className="text-sm text-zinc-400">{zone.zoneType}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleZoneActive(zone.id);
                                  }}
                                  className={`text-sm ${
                                    zone.isActive 
                                      ? 'text-yellow-400 hover:text-yellow-300' 
                                      : 'text-green-400 hover:text-green-300'
                                  }`}
                                >
                                  {zone.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingZone(zone);
                                    setZoneForm({
                                      name: zone.name,
                                      zoneType: zone.zoneType || '',
                                      capacityPerUnit: zone.capacityPerUnit || 1,
                                      basePrice: zone.basePrice || 0,
                                      sortOrder: zone.sortOrder || 0,
                                      isActive: zone.isActive !== undefined ? zone.isActive : true
                                    });
                                    setShowEditZoneModal(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete zone "${zone.name}"?`)) {
                                      handleDeleteZone(zone.id);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-zinc-400">
                              <p>Capacity: {zone.capacityPerUnit} per unit</p>
                              <p>Base Price: €{zone.basePrice}</p>
                              {zone.units && <p>Units: {zone.units.length}</p>}
                            </div>
                          </div>
                        ))}
                        
                        {zones.length === 0 && (
                          <p className="text-zinc-400 text-sm">No zones found. Create one to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Units Column */}
                <div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Units {selectedZone && `- ${selectedZone.name}`}
                      </h3>
                      {selectedZone && (
                        <button
                          onClick={() => setShowBulkCreateModal(true)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          + Bulk Create
                        </button>
                      )}
                    </div>

                    {!selectedZone ? (
                      <p className="text-zinc-400 text-sm">Select a zone to view units</p>
                    ) : unitsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Total</p>
                            <p className="text-2xl font-bold">{units.length}</p>
                          </div>
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Available</p>
                            <p className="text-2xl font-bold text-green-400">
                              {units.filter(u => u.status === 'Available').length}
                            </p>
                          </div>
                          <div className="bg-zinc-900 rounded p-3">
                            <p className="text-xs text-zinc-400">Occupied</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {units.filter(u => u.status === 'Occupied' || u.status === 'Reserved').length}
                            </p>
                          </div>
                        </div>

                        {/* Units Grid */}
                        <div className="max-h-[500px] overflow-y-auto">
                          {units.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-zinc-400 text-sm mb-3">No units created yet.</p>
                              <button
                                onClick={() => setShowBulkCreateModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Create First Units
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {units.map((unit) => (
                                <div
                                  key={unit.id}
                                  className="bg-zinc-700 rounded p-3 hover:bg-zinc-600 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-bold text-white">{unit.unitCode}</p>
                                      <p className="text-xs text-zinc-400">{unit.unitType}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Delete unit "${unit.unitCode}"?`)) {
                                          handleDeleteUnit(unit.id);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                                      unit.status === 'Available' ? 'bg-green-900 text-green-300' :
                                      unit.status === 'Occupied' ? 'bg-red-900 text-red-300' :
                                      unit.status === 'Reserved' ? 'bg-yellow-900 text-yellow-300' :
                                      'bg-gray-900 text-gray-300'
                                    }`}>
                                      {unit.status}
                                    </span>
                                    <p className="text-xs text-zinc-400">€{unit.basePrice}</p>
                                    {unit.currentBooking && (
                                      <p className="text-xs text-yellow-400 truncate">
                                        {unit.currentBooking.guestName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, businesses, selectedBusiness, staffMembers, categories, selectedCategory, products, venues, selectedVenue, zones, selectedZone, units, loading, staffLoading, isMenuLoading, productsLoading, venuesLoading, unitsLoading, handleBusinessSelect, handleDeleteBusiness, handleDeleteStaff, handleToggleStaffActivation, handleCategorySelect, handleDeleteCategory, handleDeleteProduct, handleVenueSelect, handleDeleteVenue, handleDeleteZone, handleZoneSelect, handleDeleteUnit]);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {userInfo.name}</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/superadmin/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <span>✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-3 mx-6 mt-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'businesses', label: 'Businesses' },
              { id: 'staff', label: 'Staff Management' },
              { id: 'menu', label: 'Menu Management' },
              { id: 'bulk-import', label: 'Bulk Import' },
              { id: 'venues', label: 'Venues & Zones' },
              { id: 'events', label: 'Events' },
              { id: 'qr-generator', label: 'QR Codes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {tabContent}
      </div>

      {/* Modals */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleCreateStaff}
        isSuperAdmin={true}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={showEditStaffModal}
        onClose={() => {
          setShowEditStaffModal(false);
          setEditingStaff(null);
        }}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleUpdateStaff}
        isSuperAdmin={true}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setEditingStaff(null);
          setNewPassword('');
          setError('');
        }}
        staffMember={editingStaff}
        newPassword={newPassword}
        onPasswordChange={setNewPassword}
        onSubmit={handleResetPassword}
        error={error}
        loading={loading}
      />

      {/* Create Business Modal */}
      <CreateBusinessModal
        isOpen={showCreateBusinessModal}
        onClose={() => setShowCreateBusinessModal(false)}
        businessForm={businessForm}
        onFormChange={handleBusinessFormChange}
        onSubmit={handleCreateBusiness}
      />

      {/* Edit Business Modal */}
      <EditBusinessModal
        isOpen={showEditBusinessModal}
        onClose={() => {
          setShowEditBusinessModal(false);
          setEditingBusiness(null);
        }}
        businessForm={businessForm}
        onFormChange={handleBusinessFormChange}
        onSubmit={handleUpdateBusiness}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => {
          setShowCreateCategoryModal(false);
          setCategoryExcludedVenues([]);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleCreateCategory}
        venues={venues}
        excludedVenueIds={categoryExcludedVenues}
        onExclusionsChange={setCategoryExcludedVenues}
        loadingVenues={venuesLoading}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
          setCategoryExcludedVenues([]);
        }}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleUpdateCategory}
        venues={venues}
        excludedVenueIds={categoryExcludedVenues}
        onExclusionsChange={setCategoryExcludedVenues}
        loadingVenues={loadingExclusions}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => {
          setShowCreateProductModal(false);
          setProductExcludedVenues([]);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleCreateProduct}
        categories={categories}
        venues={venues}
        excludedVenueIds={productExcludedVenues}
        onExclusionsChange={setProductExcludedVenues}
        loadingVenues={venuesLoading}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setEditingProduct(null);
          setProductExcludedVenues([]);
        }}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleUpdateProduct}
        categories={categories}
        venues={venues}
        excludedVenueIds={productExcludedVenues}
        onExclusionsChange={setProductExcludedVenues}
        loadingVenues={loadingExclusions}
      />

      {/* Create Venue Modal */}
      <CreateVenueModal
        isOpen={showCreateVenueModal}
        onClose={() => setShowCreateVenueModal(false)}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleCreateVenue}
      />

      {/* Edit Venue Modal */}
      <EditVenueModal
        isOpen={showEditVenueModal}
        onClose={() => {
          setShowEditVenueModal(false);
          setEditingVenue(null);
        }}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleUpdateVenue}
      />

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={showCreateZoneModal}
        onClose={() => setShowCreateZoneModal(false)}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleCreateZone}
        selectedVenue={selectedVenue}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={showEditZoneModal}
        onClose={() => {
          setShowEditZoneModal(false);
          setEditingZone(null);
        }}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleUpdateZone}
        selectedVenue={selectedVenue}
      />

      {/* Bulk Create Units Modal */}
      {showBulkCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">Bulk Create Units</h2>
            <form onSubmit={handleBulkCreateUnits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Unit Type
                </label>
                <select
                  value={bulkUnitForm.unitType}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, unitType: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  required
                >
                  <option value="Sunbed">Sunbed</option>
                  <option value="Table">Table</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Prefix (optional)
                </label>
                <input
                  type="text"
                  value={bulkUnitForm.prefix}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, prefix: e.target.value }))}
                  maxLength="10"
                  placeholder="e.g., A, B, VIP"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave empty for numbers only</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={bulkUnitForm.startNumber}
                    onChange={(e) => setBulkUnitForm(prev => ({ ...prev, startNumber: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    min="1"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    First unit number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Count
                  </label>
                  <input
                    type="number"
                    value={bulkUnitForm.count}
                    onChange={(e) => setBulkUnitForm(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    min="1"
                    max="100"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    How many units
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Base Price (€)
                </label>
                <input
                  type="number"
                  value={bulkUnitForm.basePrice}
                  onChange={(e) => setBulkUnitForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded p-3">
                <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                <p className="text-white font-mono text-sm">
                  {bulkUnitForm.prefix}{bulkUnitForm.startNumber}, {bulkUnitForm.prefix}{bulkUnitForm.startNumber + 1}, {bulkUnitForm.prefix}{bulkUnitForm.startNumber + 2}...
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Will create {bulkUnitForm.count} units ({bulkUnitForm.prefix}{bulkUnitForm.startNumber} to {bulkUnitForm.prefix}{bulkUnitForm.startNumber + bulkUnitForm.count - 1})
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Create Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modals */}
      {showCreateEventModal && (
        <CreateEventModal
          isOpen={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onSubmit={handleCreateEvent}
          venues={venues}
          businesses={businesses}
          isSuperAdmin={true}
        />
      )}

      {showEditEventModal && editingEvent && (
        <EditEventModal
          isOpen={showEditEventModal}
          onClose={() => {
            setShowEditEventModal(false);
            setEditingEvent(null);
          }}
          onSubmit={handleUpdateEvent}
          event={editingEvent}
          venues={venues}
          businesses={businesses}
          isSuperAdmin={true}
        />
      )}

      {showDeleteEventModal && deletingEvent && (
        <DeleteEventModal
          isOpen={showDeleteEventModal}
          onClose={() => {
            setShowDeleteEventModal(false);
            setDeletingEvent(null);
          }}
          onConfirm={handleDeleteEvent}
          event={deletingEvent}
        />
      )}

      {/* SuperAdmin Features Panel - "The Breaker Panel" */}
      {showFeaturesPanel && featuresBusiness && (
        <SuperAdminFeaturesPanel
          businessId={featuresBusiness.id}
          businessName={featuresBusiness.brandName || featuresBusiness.registeredName}
          onClose={handleCloseFeaturesPanel}
        />
      )}
    </div>
  );
}

