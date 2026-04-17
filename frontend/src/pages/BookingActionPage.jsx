import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import collectorApi from '../services/collectorApi';

// Inline toast notification (replaces alert())
function Toast({ message, type = 'info', onDismiss }) {
  const colors = {
    info: 'bg-zinc-900 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };
  return (
    <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 ${colors[type]}`}>
      <span className="flex-1 text-sm font-bold">{message}</span>
      <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// Inline confirm dialog (replaces confirm())
function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = 'bg-green-600' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <p className="text-zinc-900 text-base font-semibold mb-6 text-center leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full border border-zinc-300 text-zinc-700 font-bold text-sm hover:bg-zinc-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full text-white font-bold text-sm transition-all ${confirmClass} hover:opacity-90`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingActionPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUnitGrid, setShowUnitGrid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unitsToSelect, setUnitsToSelect] = useState(0);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type }

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm, confirmLabel, confirmClass }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const showConfirm = (message, onConfirm, confirmLabel = 'Confirm', confirmClass = 'bg-green-600') => {
    setConfirmDialog({ message, onConfirm, confirmLabel, confirmClass });
  };

  useEffect(() => {
    checkAuthAndLoadBooking();
  }, [bookingCode]);

  const checkAuthAndLoadBooking = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || (role !== 'Collector' && role !== 'Manager')) {
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
      const units = await collectorApi.getAvailableUnits(bookingCode);
      setAvailableUnits(units);
      setShowUnitGrid(true);
      setUnitsToSelect(booking.unitsNeeded || 1);
      setSelectedUnits([]);
    } catch (err) {
      console.error('Error loading units:', err);
      showToast('Failed to load available units', 'error');
    }
  };

  const handleUnitToggle = (unitId) => {
    if (processing) return;

    if (selectedUnits.includes(unitId)) {
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    } else {
      if (selectedUnits.length < unitsToSelect) {
        setSelectedUnits(prev => [...prev, unitId]);
      } else {
        showToast(`You can only select ${unitsToSelect} unit${unitsToSelect > 1 ? 's' : ''}`, 'info');
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedUnits.length !== unitsToSelect) {
      showToast(`Please select exactly ${unitsToSelect} unit${unitsToSelect > 1 ? 's' : ''}`, 'error');
      return;
    }

    const selectedUnitCodes = availableUnits
      .filter(u => selectedUnits.includes(u.id))
      .map(u => u.unitCode)
      .join(', ');

    showConfirm(
      `Assign ${selectedUnits.length} unit${selectedUnits.length > 1 ? 's' : ''} (${selectedUnitCodes}) to Booking #${bookingCode}?`,
      () => doApprove(selectedUnitCodes),
      'Assign Units',
      'bg-green-600'
    );
  };

  const doApprove = async (selectedUnitCodes) => {
    setConfirmDialog(null);
    try {
      setProcessing(true);
      await collectorApi.approveBooking(bookingCode, selectedUnits);

      setBooking(prev => ({ ...prev, status: 'Reserved' }));
      setShowUnitGrid(false);
      showToast(`Booking approved! ${selectedUnits.length} unit${selectedUnits.length > 1 ? 's' : ''} assigned: ${selectedUnitCodes}`, 'success');

      setTimeout(() => navigate('/collector'), 2500);
    } catch (err) {
      console.error('Error approving booking:', err);

      const errorData = err.response?.data;
      let errorMessage = 'Failed to approve booking';

      if (errorData?.error === 'BOOKING_NOT_PENDING') {
        errorMessage = 'Kjo kërkesë ka skaduar ose është anulluar.';
        if (errorData.currentStatus === 'Reserved') {
          errorMessage += ' Kjo rezervim është tashmë konfirmuar.';
        } else if (errorData.currentStatus === 'Cancelled') {
          errorMessage += ' Kjo rezervim është anulluar.';
        } else if (errorData.currentStatus === 'Active') {
          errorMessage += ' Klienti është tashmë në plazh.';
        }
      } else if (errorData?.error === 'INCORRECT_UNIT_COUNT') {
        errorMessage = `Wrong number of units selected. Need ${errorData.unitsNeeded || unitsToSelect}.`;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      showToast(errorMessage, 'error');
      setProcessing(false);
    }
  };

  const handleReject = () => {
    showConfirm(
      `Reject booking #${bookingCode}? This cannot be undone.`,
      doReject,
      'Reject',
      'bg-red-600'
    );
  };

  const doReject = async () => {
    setConfirmDialog(null);
    try {
      setProcessing(true);
      await collectorApi.rejectBooking(bookingCode);

      setBooking(prev => ({ ...prev, status: 'Cancelled' }));
      showToast('Booking rejected', 'info');

      setTimeout(() => navigate('/collector'), 2000);
    } catch (err) {
      console.error('Error rejecting booking:', err);
      showToast('Failed to reject booking', 'error');
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
            className="bg-zinc-900 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  // Show unit grid for selection
  if (showUnitGrid) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
            confirmLabel={confirmDialog.confirmLabel}
            confirmClass={confirmDialog.confirmClass}
          />
        )}

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

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {availableUnits.map(unit => {
              const isSelected = selectedUnits.includes(unit.id);

              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitToggle(unit.id)}
                  disabled={processing}
                  className={`
                    rounded-3xl p-6 aspect-square flex flex-col items-center justify-center
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSelected
                      ? 'bg-yellow-500 border-4 border-yellow-600 scale-110'
                      : 'bg-green-900 border-2 border-green-600 hover:scale-105 hover:bg-green-800'
                    }
                  `}
                >
                  <p className="text-3xl font-black text-white mb-2">{unit.unitCode}</p>
                  {isSelected ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-white text-yellow-900 font-bold shadow-sm">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500 text-white font-bold shadow-sm">
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xl text-white mb-4">
              Selected: {selectedUnits.length} / {unitsToSelect}
            </p>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedUnits.length !== unitsToSelect || processing}
              className="bg-green-600 text-white px-8 py-4 rounded-full text-xl font-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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

  // Main approval page
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmLabel={confirmDialog.confirmLabel}
          confirmClass={confirmDialog.confirmClass}
        />
      )}

      <div className="max-w-md w-full">
        {/* Booking Details Card */}
        <div className="bg-zinc-50 rounded-3xl p-8 mb-6 border border-zinc-200 shadow-sm">
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

            {booking.unitsNeeded && booking.unitsNeeded > 1 && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-inner">
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

        {/* Action Buttons */}
        {booking.status === 'Pending' && (
          <div className="space-y-4">
            <button
              onClick={handleApproveClick}
              disabled={processing}
              className="w-full bg-green-600 text-white px-8 py-6 rounded-full text-2xl font-black hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg"
            >
              ✅ APPROVE
            </button>

            <button
              onClick={handleReject}
              disabled={processing}
              className="w-full bg-red-600 text-white px-8 py-6 rounded-full text-2xl font-black hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
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
              className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-md"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
