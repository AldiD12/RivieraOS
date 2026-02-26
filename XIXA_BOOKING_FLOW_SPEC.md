# XIXA Booking Flow - Complete Specification

**Date:** February 26, 2026  
**Feature:** Off-site booking with WhatsApp bridge + SignalR live updates  
**Goal:** Tourist books from home, gets live confirmation when staff approves

---

## 🎯 THE FLOW (User Journey)

### Step 1: Tourist Opens Xixa (Discovery Mode)
```
Tourist → Opens riviera-os.vercel.app
       → Sees map with 15 venues
       → Taps venue marker
       → Bottom sheet shows availability
       → Selects zone (VIP Section)
       → Fills form: Name, Phone, 2 Guests, Date
       → Taps "KËRKO REZERVIM" (Request Booking)
```

### Step 2: Digital Ticket Generated
```
System → Creates reservation with status: "PENDING"
      → Generates booking code: #102
      → Shows elegant waiting page (Aman Style)
      
Page displays:
┌─────────────────────────────────────┐
│  REZERVIMI YT #102                  │
│                                     │
│  STATUSI: Duke pritur konfirmimin   │
│           nga stafi... ⏳           │
│                                     │
│  DETAJET:                           │
│  • 2 Persona                        │
│  • Zona VIP                         │
│  • Ora 11:00                        │
│  • Folie Beach Club                 │
│                                     │
│  [KONFIRMO NË WHATSAPP] 💬          │
└─────────────────────────────────────┘
```

### Step 3: WhatsApp Bridge (The Handshake)
```
Tourist → Taps "KONFIRMO NË WHATSAPP"
        → WhatsApp opens with pre-filled message:
        
"Përshëndetje! 👋

Dua të konfirmoj rezervimin tim:

📋 Rezervimi: #102
🏖️ Vendi: Folie Beach Club
👥 Persona: 2
📍 Zona: VIP Section
🕐 Ora: 11:00
📅 Data: 27 Shkurt 2026

Faleminderit!"

Tourist → Sends message
        → Returns to browser (Xixa stays open)
```

### Step 4: Live Refresh (The Magic)
```
Page stays open → SignalR connection active
                → Listening for booking #102 updates

Collector at Meridian → Opens CollectorDashboard
                      → Sees booking #102 in "Pending" list
                      → Taps [APPROVE]
                      → Backend updates status to "CONFIRMED"
                      → Assigns unit code: XP-99

SignalR → Pushes update to tourist's browser
        → Page auto-refreshes (no reload needed!)
        
New page state:
┌─────────────────────────────────────┐
│  REZERVIMI YT #102                  │
│                                     │
│  STATUSI: I KONFIRMUAR ✅           │
│                                     │
│  KODI YT: XP-99                     │
│  (Tregoja këtë kod djalit të plazhit)│
│                                     │
│  DETAJET:                           │
│  • 2 Persona                        │
│  • Zona VIP                         │
│  • Ora 11:00                        │
│  • Folie Beach Club                 │
│                                     │
│  [SHIKO NË HARTË] 🗺️               │
│  [KONTAKTO PLAZHIN] 💬              │
└─────────────────────────────────────┘
```

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Components Needed:

1. **BookingStatusPage.jsx** (NEW)
   - Shows booking status (Pending → Confirmed)
   - SignalR connection for live updates
   - WhatsApp button
   - Elegant Aman-style design

2. **VenueBottomSheet.jsx** (UPDATE)
   - After booking submitted → Navigate to BookingStatusPage
   - Pass booking ID as URL param

3. **SignalR Service** (NEW)
   - `frontend/src/services/signalrService.js`
   - Connect to BeachHub
   - Listen for booking updates
   - Auto-reconnect on disconnect

### Backend Requirements:

1. **POST /api/public/Reservations** (EXISTS)
   - Create reservation with status: "Pending"
   - Return booking ID and code

2. **GET /api/public/Reservations/{bookingCode}** (EXISTS)
   - Get booking status
   - Return: status, unit code, venue details

3. **SignalR Hub: BeachHub** (EXISTS)
   - Method: `JoinBookingGroup(bookingCode)`
   - Event: `BookingStatusChanged(bookingCode, status, unitCode)`

4. **Collector Approval** (EXISTS)
   - CollectorDashboard → Approve button
   - Updates status to "Confirmed"
   - Assigns unit code
   - Triggers SignalR event

---

## 📱 IMPLEMENTATION PLAN

### Phase 1: Create BookingStatusPage (2 hours)

**File:** `frontend/src/pages/BookingStatusPage.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationApi } from '../services/reservationApi';
import { signalrService } from '../services/signalrService';
import whatsappLink from '../utils/whatsappLink';
import haptics from '../utils/haptics';

export default function BookingStatusPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
    setupSignalR();
    
    return () => {
      signalrService.disconnect();
    };
  }, [bookingCode]);

  const loadBooking = async () => {
    try {
      const data = await reservationApi.getReservationStatus(bookingCode);
      setBooking(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load booking:', error);
      setLoading(false);
    }
  };

  const setupSignalR = async () => {
    try {
      await signalrService.connect();
      await signalrService.joinBookingGroup(bookingCode);
      
      signalrService.onBookingStatusChanged((code, status, unitCode) => {
        if (code === bookingCode) {
          console.log('🔔 Booking updated:', status, unitCode);
          
          // Haptic feedback
          if (haptics.isSupported()) {
            haptics.success();
          }
          
          // Update booking state
          setBooking(prev => ({
            ...prev,
            status,
            unitCode
          }));
        }
      });
    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!booking) return;
    
    const message = `Përshëndetje! 👋

Dua të konfirmoj rezervimin tim:

📋 Rezervimi: #${booking.bookingCode}
🏖️ Vendi: ${booking.venueName}
👥 Persona: ${booking.guestCount}
📍 Zona: ${booking.zoneName}
🕐 Ora: ${booking.reservationTime}
📅 Data: ${new Date(booking.reservationDate).toLocaleDateString('sq-AL')}

Faleminderit!`;

    whatsappLink.sendMessage(booking.venuePhone, message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-lg text-stone-600">Duke ngarkuar rezervimin...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-light text-stone-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Rezervimi nuk u gjet
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Kodi i rezervimit nuk është i vlefshëm.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
          >
            Kthehu te Harta
          </button>
        </div>
      </div>
    );
  }

  const isPending = booking.status === 'Pending';
  const isConfirmed = booking.status === 'Confirmed';

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-6xl font-light text-stone-900 mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Rezervimi Yt
          </h1>
          <p className="text-sm text-stone-500 uppercase tracking-widest">
            #{booking.bookingCode}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-white to-stone-50/50 backdrop-blur-2xl rounded-[2rem] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-200/40 mb-8">
          
          {/* Status Badge */}
          <div className="text-center mb-8">
            {isPending && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-light text-stone-900 mb-2">
                  Duke pritur konfirmimin
                </h2>
                <p className="text-stone-600">
                  nga stafi... ⏳
                </p>
              </>
            )}
            
            {isConfirmed && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-emerald-900 mb-2">
                  I Konfirmuar ✅
                </h2>
                {booking.unitCode && (
                  <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <p className="text-sm text-emerald-700 uppercase tracking-widest mb-2">
                      Kodi Yt
                    </p>
                    <p 
                      className="text-5xl font-light text-emerald-900"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {booking.unitCode}
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      Tregoja këtë kod djalit të plazhit
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm uppercase tracking-widest text-stone-500 font-medium">
              Detajet
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Vendi</p>
                <p className="text-lg text-stone-900">{booking.venueName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Zona</p>
                <p className="text-lg text-stone-900">{booking.zoneName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Persona</p>
                <p className="text-lg text-stone-900">{booking.guestCount}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Ora</p>
                <p className="text-lg text-stone-900">{booking.reservationTime || '11:00'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Data</p>
              <p className="text-lg text-stone-900">
                {new Date(booking.reservationDate).toLocaleDateString('sq-AL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {isPending && (
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full bg-[#25D366] text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-[#20BA5A] transition-all duration-300 shadow-[0_4px_14px_rgba(37,211,102,0.3)] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                KONFIRMO NË WHATSAPP
              </button>
            )}
            
            {isConfirmed && (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
                >
                  SHIKO NË HARTË
                </button>
                <button
                  onClick={handleWhatsAppConfirm}
                  className="w-full border border-stone-300 text-stone-700 px-8 py-4 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
                >
                  KONTAKTO PLAZHIN
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="text-center text-sm text-stone-500">
          <p>Mbaje këtë faqe të hapur për të marrë konfirmimin automatik</p>
          <p className="mt-2">🔔 Do të njoftohesh kur rezervimi të aprovohet</p>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 2: Create SignalR Service (1 hour)

**File:** `frontend/src/services/signalrService.js`

```javascript
import * as signalR from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('📡 SignalR already connected');
      return;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/beach`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      await this.connection.start();
      this.isConnected = true;
      console.log('✅ SignalR connected');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      console.log('🔌 SignalR disconnected');
    }
  }

  async joinBookingGroup(bookingCode) {
    if (!this.isConnected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('JoinBookingGroup', bookingCode);
      console.log(`📥 Joined booking group: ${bookingCode}`);
    } catch (error) {
      console.error('❌ Failed to join booking group:', error);
      throw error;
    }
  }

  onBookingStatusChanged(callback) {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }

    this.connection.on('BookingStatusChanged', (bookingCode, status, unitCode) => {
      console.log('🔔 Booking status changed:', { bookingCode, status, unitCode });
      callback(bookingCode, status, unitCode);
    });
  }
}

export const signalrService = new SignalRService();
export default signalrService;
```

---

### Phase 3: Update VenueBottomSheet (30 minutes)

**Update:** `frontend/src/components/VenueBottomSheet.jsx`

```javascript
// After successful booking submission:
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);
    
    // Create reservation
    const result = await reservationApi.createReservation({
      venueId: venue.id,
      zoneId: selectedZone.id,
      guestName: bookingData.guestName,
      guestPhone: bookingData.guestPhone,
      guestCount: bookingData.guestCount,
      reservationDate: bookingData.date,
      notes: 'Booked via Discovery Mode'
    });
    
    console.log('✅ Booking created:', result);
    
    // Success haptic
    if (haptics.isSupported()) {
      haptics.success();
    }
    
    // Navigate to booking status page
    navigate(`/booking/${result.bookingCode}`);
    
  } catch (error) {
    console.error('❌ Booking failed:', error);
    alert('Booking failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
```

---

### Phase 4: Add Route (5 minutes)

**Update:** `frontend/src/App.jsx`

```javascript
import BookingStatusPage from './pages/BookingStatusPage';

// Add route:
<Route path="/booking/:bookingCode" element={<BookingStatusPage />} />
```

---

## 🔧 BACKEND REQUIREMENTS

### SignalR Hub Method (Prof Kristi needs to add):

```csharp
// In BeachHub.cs
public async Task JoinBookingGroup(string bookingCode)
{
    await Groups.AddToGroupAsync(Context.ConnectionId, $"booking_{bookingCode}");
    _logger.LogInformation($"Client {Context.ConnectionId} joined booking group: {bookingCode}");
}

// When collector approves booking:
public async Task NotifyBookingStatusChanged(string bookingCode, string status, string unitCode)
{
    await Clients.Group($"booking_{bookingCode}")
        .SendAsync("BookingStatusChanged", bookingCode, status, unitCode);
}
```

---

## ✅ TESTING CHECKLIST

- [ ] Tourist can create booking from map
- [ ] Booking status page loads with "Pending" state
- [ ] WhatsApp button opens with pre-filled message
- [ ] SignalR connection established
- [ ] Page stays open after WhatsApp redirect
- [ ] Collector can see booking in dashboard
- [ ] Collector can approve booking
- [ ] Tourist's page auto-updates to "Confirmed"
- [ ] Unit code displays correctly
- [ ] Haptic feedback works
- [ ] Mobile responsive

---

**This is the complete Xixa booking flow with live updates!** 🐺🌊

