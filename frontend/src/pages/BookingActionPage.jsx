import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import collectorApi from '../services/collectorApi';

export default function BookingActionPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUnitGrid, setShowUnitGrid] = useState(false);
  const [processing, setProcessing] = useState(false);
  // 🚨 MULTI-SELECT: Changed from single unitId to array of unitIds
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unitsToSelect, setUnitsToSelect] = useState(0);

  useEffect(() => {
    checkAuthAndLoadBooking();
  }, [bookingCode]);

  const checkAuthAndLoadBooking = async () => {
    // 🔐 SECURITY CHECK: Must have staff token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || (role !== 'Collector' && role !== 'Manager')) {
      // Redirect to staff login or show "waiting" screen
      navigate(`/login?redirect=/action/${bookingCode}`);
      return;
    }

    try {
      setLoading(true);
      const bookingData = await collectorApi.getBookingDetails(bookingCode);
      setBooking(bookingData);
      
      if (bookingData.status !== 'Pending') {
        setError(`This booking is already ${bookingData.status}`);
      }
    } catch (err) {
      console.error('Error loading booking:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate(`/login?redirect=/action/${bookingCode}`);
      } else {
        setError('Booking not found or you do not have access');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = async () => {
    try {
      // Load available units for visual selection
      const units = await collectorApi.getAvailableUnits(bookingCode);
      setAvailableUnits(units);
      setShowUnitGrid(true);
      
      // 🚨 MULTI-SELECT: Set how many units need to be selected
      setUnitsToSelect(booking.unitsNeeded || 1);
      setSelectedUnits([]);
    } catch (err) {
      console.error('Error loading units:', err);
      alert('Failed to load available units');
    }
  };

  // 🚨 MULTI-SELECT: Toggle unit selection (add/remove from array)
  const handleUnitToggle = (unitId, unitCode) => {
    if (processing) return;
    
    // Check if already selected
    if (selectedUnits.includes(unitId)) {
      // Deselect
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    } else {
      // Select (if not at limit)
      if (selectedUnits.length < unitsToSelect) {
        setSelectedUnits(prev => [...prev, unitId]);
      } else {
        alert(`You can only select ${unitsToSelect} unit${unitsToSelect > 1 ? 's' : ''}`);
      }
    }
  };

  // 🚨 MULTI-SELECT: Confirm selection and approve booking
  const handleConfirmSelection = async () => {
    if (selectedUnits.length !== unitsToSelect) {
      alert(`Please select exactly ${unitsToSelect} unit${unitsToSelect > 1 ? 's' : ''}`);
      return;
    }

    // Get unit codes for confirmation message
    const selectedUnitCodes = availableUnits
      .filter(u => selectedUnits.includes(u.id))
      .map(u => u.unitCode)
      .join(', ');

    if (!confirm(`Assign ${selectedUnits.length} unit${selectedUnits.length > 1 ? 's' : ''} (${selectedUnitCodes}) to Booking #${bookingCode}?`)) {
      return;
    }

    try {
      setProcessing(true);
      
      // 🚨 MULTI-SELECT: Send array of unit IDs
      await collectorApi.approveBooking(bookingCode, selectedUnits);
      
      // Success!
      setBooking(prev => ({ ...prev, status: 'Reserved' }));
      setShowUnitGrid(false);
      
      // Show success message
      alert(`✅ Booking approved! ${selectedUnits.length} unit${selectedUnits.length > 1 ? 's' : ''} assigned: ${selectedUnitCodes}`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/collector');
      }, 2000);
      
    } catch (err) {
      console.error('Error approving booking:', err);
      
      // 🚨 TWEAK 2: Translate error messages to Albanian
      const errorData = err.response?.data;
      let errorMessage = 'Failed to approve booking';
      
      if (errorData?.error === 'BOOKING_NOT_PENDING') {
        errorMessage = 'Kjo kërkesë ka skaduar ose është anulluar.';
        
        if (errorData.currentStatus === 'Reserved') {
          errorMessage += '\n\nKjo rezervim është tashmë konfirmuar.';
        } else if (errorData.currentStatus === 'Cancelled') {
          errorMessage += '\n\nKjo rezervim është anulluar.';
        } else if (errorData.currentStatus === 'Active') {
          errorMessage += '\n\nKlienti është tashmë në plazh.';
        }
      } else if (errorData?.error === 'INCORRECT_UNIT_COUNT') {
        errorMessage = `Wrong number of units selected. Need ${errorData.unitsNeeded || unitsToSelect}.`;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
      
      alert(errorMessage);
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Reject booking #${bookingCode}?`)) {
      return;
    }

    try {
      setProcessing(true);
      await collectorApi.rejectBooking(bookingCode);
      
      setBooking(prev => ({ ...prev, status: 'Cancelled' }));
      alert('❌ Booking rejected');
      
      setTimeout(() => {
        navigate('/collector');
      }, 2000);
      
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-lg text-zinc-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-bold text-zinc-900 mb-4">⚠️</h2>
          <p className="text-lg text-zinc-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/collector')}
            className="bg-zinc-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-zinc-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Show unit grid for selection
  if (showUnitGrid) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setShowUnitGrid(false)}
              disabled={processing}
              className="text-zinc-400 hover:text-white mb-4 disabled:opacity-50"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-black mb-2">
              {unitsToSelect > 1 ? `Select ${unitsToSelect} Units` : 'Select Unit'}
            </h1>
            <p className="text-zinc-400">
              Booking #{bookingCode} • {booking.guestName} • {booking.zoneName}
            </p>
            {unitsToSelect > 1 && (
              <p className="text-amber-400 mt-2">
                ⚠️ Pick {unitsToSelect} adjacent units for {booking.guestCount} guests
              </p>
            )}
          </div>

          {/* 🎨 VISUAL UNIT GRID - Green squares with multi-select */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {availableUnits.map(unit => {
              const isSelected = selectedUnits.includes(unit.id);
              
              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitToggle(unit.id, unit.unitCode)}
                  disabled={processing}
                  className={`
                    rounded-lg p-6 aspect-square flex flex-col items-center justify-center
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSelected 
                      ? 'bg-yellow-500 border-4 border-yellow-600 scale-110' 
                      : 'bg-green-900 border-2 border-green-600 hover:scale-105 hover:bg-green-800'
                    }
                  `}
                >
                  <p className="text-3xl font-black text-white mb-2">{unit.unitCode}</p>
                  {isSelected ? (
                    <span className="text-xs px-2 py-1 rounded bg-white text-yellow-900 font-bold">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-green-500 text-white font-bold">
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 🚨 MULTI-SELECT: Selection counter and confirm button */}
          <div className="mt-6 text-center">
            <p className="text-xl text-white mb-4">
              Selected: {selectedUnits.length} / {unitsToSelect}
            </p>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedUnits.length !== unitsToSelect || processing}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing ? 'PROCESSING...' : 'CONFIRM SELECTION'}
            </button>
          </div>

          {availableUnits.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-xl">No available units in {booking.zoneName}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main approval page - Clean and simple
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Booking Details Card */}
        <div className="bg-zinc-50 rounded-2xl p-8 mb-6 border border-zinc-200">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black text-zinc-900 mb-2">
              #{bookingCode}
            </h1>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-900' :
              booking.status === 'Reserved' ? 'bg-green-100 text-green-900' :
              'bg-red-100 text-red-900'
            }`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Guest</p>
              <p className="text-2xl font-bold text-zinc-900">{booking.guestName}</p>
            </div>

            {booking.guestPhone && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-lg font-mono text-zinc-900">{booking.guestPhone}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Zone</p>
                <p className="text-lg font-bold text-zinc-900">{booking.zoneName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Guests</p>
                <p className="text-lg font-bold text-zinc-900">{booking.guestCount}</p>
              </div>
            </div>

            {/* 🚨 MULTI-SELECT: Show units needed if > 1 */}
            {booking.unitsNeeded && booking.unitsNeeded > 1 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-xs text-amber-700 uppercase tracking-wider mb-1">Units Needed</p>
                <p className="text-2xl font-bold text-amber-900">{booking.unitsNeeded}</p>
                <p className="text-xs text-amber-600 mt-1">
                  You will select {booking.unitsNeeded} adjacent units
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Requested Time</p>
              <p className="text-lg text-zinc-900">
                {new Date(booking.requestedTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - MASSIVE */}
        {booking.status === 'Pending' && (
          <div className="space-y-4">
            <button
              onClick={handleApproveClick}
              disabled={processing}
              className="w-full bg-green-600 text-white px-8 py-6 rounded-2xl text-2xl font-black hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg"
            >
              ✅ APPROVE
            </button>
            
            <button
              onClick={handleReject}
              disabled={processing}
              className="w-full bg-red-600 text-white px-8 py-6 rounded-2xl text-2xl font-black hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
            >
              ❌ REJECT
            </button>
          </div>
        )}

        {booking.status !== 'Pending' && (
          <div className="text-center">
            <p className="text-zinc-600 mb-4">
              This booking has already been {booking.status.toLowerCase()}
            </p>
            <button
              onClick={() => navigate('/collector')}
              className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
