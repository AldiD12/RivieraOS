# Events System - Final Setup Guide
## March 5, 2026

**Time Required:** 5-10 minutes
**Access Required:** SuperAdmin Dashboard

---

## Task 1: Set WhatsApp Numbers on Venues (CRITICAL)

**Why:** Without WhatsApp numbers, event booking buttons won't work

**Steps:**

1. Go to https://riviera-os.vercel.app/superadmin/login
2. Login with SuperAdmin credentials
3. Navigate to **Venues** tab
4. For each venue that hosts events:
   - Click **Edit** button
   - Find the **WhatsApp Number** field
   - Enter the venue's WhatsApp number
   - Format: `355123456789` (country code + number, no spaces or +)
   - Click **Save**

**Example:**
```
Venue: Beach Bar
WhatsApp Number: 355123456789
```

**Venues to Update:**
- Beach Bar (ID: 16) - Currently hosting "summer party" and "techno" events
- Any other venues that will host events

**Test:**
- After saving, go to Discovery Page → Night Mode
- Click on an event
- Click "Book Now" button
- Should open WhatsApp with pre-filled message

---

## Task 2: Update Existing Events with Vibe/EntryType

**Why:** Enables vibe filtering and shows entry requirements

**Steps:**

1. Go to https://riviera-os.vercel.app/business/login
2. Login with Business Admin credentials
3. Navigate to **Events** tab
4. For each event:
   - Click **Edit** button
   - Fill in missing fields:
     - **Vibe:** Choose from dropdown (House, Techno, Commercial, Live Music, Hip Hop, Chill)
     - **Entry Type:** Choose from dropdown (Free, Ticketed, Reservation)
     - **Minimum Spend:** Enter amount if applicable (e.g., 200 for VIP tables)
     - **Description:** Add event description if missing
   - Click **Save**

**Example for "summer party" event:**
```
Name: summer party
Description: Epic summer beach party with international DJs
Vibe: House
Entry Type: Free
Minimum Spend: 0
```

**Example for "techno" event:**
```
Name: techno
Description: Underground techno night with local and international artists
Vibe: Techno
Entry Type: Reservation
Minimum Spend: 200
```

**Test:**
- After saving, go to Discovery Page → Night Mode
- Use vibe filter chips (HOUSE, TECHNO, etc.)
- Events should filter correctly
- Event cards should show entry type and minimum spend

---

## Quick Reference: Vibe Options

- **House** 🎵 - House music events
- **Techno** ⚡ - Techno/electronic events
- **Commercial** 🎤 - Pop/commercial music
- **Live Music** 🎸 - Live bands/performances
- **Hip Hop** 🎧 - Hip hop/rap events
- **Chill** 🌊 - Lounge/chill vibes

---

## Quick Reference: Entry Type Options

- **Free** - No entry fee, walk-in
- **Ticketed** - Requires ticket purchase
- **Reservation** - Requires table reservation (usually with minimum spend)

---

## Verification Checklist

After completing both tasks:

### WhatsApp Numbers
- [ ] All event venues have WhatsApp numbers set
- [ ] WhatsApp numbers are in correct format (no spaces, no +)
- [ ] Test: Click event "Book Now" → WhatsApp opens with message

### Event Details
- [ ] All events have vibe set
- [ ] All events have entry type set
- [ ] Minimum spend set for reservation events
- [ ] Test: Vibe filters work on Discovery Page
- [ ] Test: Event cards show entry type and minimum spend

---

## Alternative: SQL Direct Update (For Kristi)

If you prefer to update via SQL instead of UI:

### Set WhatsApp Numbers:
```sql
-- Beach Bar
UPDATE Venues SET WhatsappNumber = '355123456789' WHERE Id = 16;

-- Add more venues as needed
UPDATE Venues SET WhatsappNumber = '355987654321' WHERE Name = 'Another Venue';
```

### Update Events:
```sql
-- Update "summer party" event
UPDATE ScheduledEvents 
SET Vibe = 'House', 
    EntryType = 'Free', 
    MinimumSpend = 0,
    Description = 'Epic summer beach party with international DJs'
WHERE Id = 1;

-- Update "techno" event
UPDATE ScheduledEvents 
SET Vibe = 'Techno', 
    EntryType = 'Reservation', 
    MinimumSpend = 200,
    Description = 'Underground techno night with local and international artists'
WHERE Id = 2;
```

---

## Expected Results

### Before Setup:
- ❌ WhatsApp booking doesn't work (venueWhatsappNumber is null)
- ❌ Vibe filters don't work (vibe is null)
- ❌ Entry type not shown (entryType is null)
- ❌ Minimum spend not shown (minimumSpend is 0)

### After Setup:
- ✅ WhatsApp booking works perfectly
- ✅ Vibe filters work (can filter by House, Techno, etc.)
- ✅ Entry type shown on event cards
- ✅ Minimum spend shown for reservation events
- ✅ Full event details displayed

---

## Support

**Frontend:** https://riviera-os.vercel.app
**Backend API:** https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api

**Questions?** Check the API response:
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Events
```

Should show all fields populated after setup.

---

**Last Updated:** March 5, 2026
**Status:** Ready for manual data entry
