# Email to Prof Kristi - Context-Aware Routing Backend Tasks

---

**Subject:** Backend APIs Needed for Context-Aware Routing (8-11 hours total)

---

Hi Prof Kristi,

We're implementing a "Context-Aware Routing" architecture where the app switches between two modes:
- **SPOT MODE** (on-site, QR scanned) - Enhanced ordering + events
- **DISCOVER MODE** (off-site, browsing) - Map + venue discovery

**GREAT NEWS:** 90% of the APIs we need already exist! You've been building ahead! 🎉

I've attached a complete API specification document. Here's the quick summary:

---

## 🚨 CRITICAL MISSING APIS (Do First!)

These fix critical business logic gaps:

### 1. Negative Feedback Tracking ("Review Shield")
**Endpoint:** `POST /api/public/Feedback`  
**Time:** 2 hours  
**Why:** Save bad reviews before WhatsApp redirect for analytics proof  
**Value:** "I stopped 50 bad reviews for you" - data is power!

**Request:**
```json
{
  "venueId": 1,
  "rating": 2,
  "comment": "Warm beer, slow service",
  "unitCode": "42",
  "guestName": "John Doe",
  "guestPhone": "+355691234567",
  "submittedAt": "2026-02-25T15:30:00Z"
}
```

**Database:** New table `NegativeFeedback` (schema in attached doc)

---

### 2. Manual Zone Override ("Owner Switch")
**Endpoint:** `PUT /api/business/zones/{id}/availability`  
**Time:** 2-3 hours  
**Why:** Allow managers to mark zones as FULL (cash payments aren't tracked automatically)  
**Value:** Managers can override automatic counting for private events

**Request:**
```json
{
  "isAvailable": false,
  "reason": "VIP section fully booked for private event",
  "overrideUntil": "2026-02-25T20:00:00Z"
}
```

**Database:** Add columns to `VenueZones` table (migration in attached doc)

---

## 🟡 PHASE 2 APIS (Week 2)

### 3. List All Venues
**Endpoint:** `GET /api/public/Venues`  
**Time:** 1-2 hours  
**Why:** Show all venues on map with availability

### 4. Venue Availability Details
**Endpoint:** `GET /api/public/Venues/{id}/availability`  
**Time:** 1 hour  
**Why:** Real-time availability for bottom sheet

---

## 🟢 PHASE 3 API (Week 3 - Optional)

### 5. Curated Content
**Endpoint:** `GET /api/public/Content`  
**Time:** 2-3 hours  
**Why:** Show content while order is being prepared  
**Database:** New table `Content` (schema in attached doc)

---

## ✅ WHAT ALREADY EXISTS (No Work Needed!)

These are all working:
- ✅ `/api/public/Venues/{id}` - Venue details
- ✅ `/api/public/Orders/menu` - Menu
- ✅ `/api/public/Orders` - Place order
- ✅ `/api/public/Reservations` - Create reservation
- ✅ `/api/public/Events` - List events
- ✅ `/api/public/Events/venue/{id}` - Venue events
- ✅ `/api/public/venues/{id}/reviews` - Submit review
- ✅ `/api/collector/units/{id}/status` - Update unit status

**Frontend can start Phase 1 immediately using existing APIs!**

---

## 📊 SUMMARY

| Priority | Endpoint | Time | When Needed |
|----------|----------|------|-------------|
| 🔴 CRITICAL | `POST /api/public/Feedback` | 2h | Week 1 |
| 🔴 CRITICAL | `PUT /api/business/zones/{id}/availability` | 2-3h | Week 1 |
| 🟡 Phase 2 | `GET /api/public/Venues` | 1-2h | Week 2 |
| 🟡 Phase 2 | `GET /api/public/Venues/{id}/availability` | 1h | Week 2 |
| 🟢 Phase 3 | `GET /api/public/Content` | 2-3h | Week 3 |

**Total:** 8-11 hours

---

## 📅 PROPOSED TIMELINE

### Week 1 (This Week)
**Your Work:** Implement critical APIs (4-5 hours)
- Day 1-2: Feedback tracking + Zone override
- Day 3: Test and deploy

**My Work:** Build SPOT MODE (frontend)
- Uses existing APIs (menu, orders, events, reviews)
- No waiting needed!

### Week 2 (Next Week)
**Your Work:** Implement venues list + availability (2-3 hours)
- Day 1: Venues list endpoint
- Day 2: Availability endpoint
- Day 3: Test and deploy

**My Work:** Build DISCOVER MODE map interface
- Waiting for your APIs

### Week 3 (Optional)
**Your Work:** Implement content API (2-3 hours)
**My Work:** Experience deck + polish

---

## 📎 ATTACHED DOCUMENT

`BACKEND_CONTEXT_AWARE_ROUTING_APIS.md` contains:
- Complete API specifications with request/response examples
- Database schemas (SQL CREATE TABLE statements)
- Implementation notes
- SQL query examples
- Testing checklist

---

## ❓ QUESTIONS

1. Can you complete the critical APIs (Feedback + Zone Override) this week?
2. Do you need help with SQL schema creation?
3. Will you deploy to Azure Container Apps as usual?

---

Let me know if you have any questions!

Best,
[Your Name]

---

**P.S.** The good news is that most of the work is already done! The Events API you built is perfect - we can use it immediately for the Nightlife tab. The two critical missing pieces (Feedback + Zone Override) are small but important for business logic.
