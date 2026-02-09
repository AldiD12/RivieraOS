# Riviera OS - Customer Interfaces Plan

## 🎯 Two Distinct Customer Interfaces

---

## 1. 📱 Mobile App (Discovery Only - Day/Night Mode)

### Purpose
Help tourists and locals **discover** activities and events in the area

### Platform
- React Native (iOS + Android)
- Progressive Web App (PWA) as fallback

### Core Concept: Time-Based Discovery

#### **Day Mode** ☀️ (6:00 AM - 6:00 PM)
Shows daytime activities and venues:
- 🏖️ Beach clubs
- 🏊 Pool venues  
- 🌊 Water sports
- 🍽️ Restaurants
- ☀️ Daytime events
- 🏝️ Sunbed availability indicators

#### **Night Mode** 🌙 (6:00 PM - 6:00 AM)
Shows nighttime activities and venues:
- 🎉 Night clubs
- 🍸 Bars & Lounges
- 🎵 Live music venues
- 🎧 DJ performances
- ✨ Special events
- 🎊 Party venues

### Key Features

**Discovery**:
- Automatic day/night mode switching based on time
- Venue cards with photos, ratings, distance
- Filter by: Type, Distance, Price Range, Amenities
- Search functionality
- Map view with venue markers
- List view with sorting options

**Venue Details**:
- Photo gallery
- Description & amenities
- Location & directions
- Opening hours
- Price range
- Reviews & ratings
- Contact information
- "Get Directions" button

**Social Features**:
- Save favorites ❤️
- Share venues with friends
- View trending venues
- See what's popular now

**User Experience**:
- Swipe between venues (Tinder-style)
- Pull to refresh
- Smooth animations
- Offline mode (cached venues)

### What It Does NOT Do
- ❌ No booking/reservations
- ❌ No ordering
- ❌ No payments
- ❌ No user accounts (optional login for favorites)

### Design Style
**Ultra-Luxury** (Aman Resorts inspired):
- Sophisticated neutrals
- Large, elegant typography (Cormorant Garamond)
- Massive whitespace
- Blurred hero images
- Asymmetric layouts
- Smooth transitions

---

## 2. 🌐 Web Interface (At-Location Ordering & Services)

### Purpose
Customers use this **while at the venue** for ordering and services

### Platform
- Responsive Web App
- Accessed via QR code scan
- Works on any mobile browser

### Access Method
**QR Codes placed at**:
- Each sunbed
- Each table
- Entrance/Reception
- Around the venue

### Three Main Flows

---

### Flow A: 🍹 Ordering (QR Code at Sunbed/Table)

**User Journey**:
1. Customer scans QR code at their sunbed/table
2. Opens menu for that specific venue
3. Browses categories (Drinks, Food, Snacks)
4. Adds items to cart
5. Reviews cart
6. Places order
7. Gets order confirmation with number
8. Tracks order status (Preparing → Ready → Delivered)

**Features**:
- Auto-detect sunbed/table number from QR code
- Menu with photos and prices
- Dietary filters (vegetarian, vegan, gluten-free)
- Special requests field
- Order history
- Reorder previous items
- Call waiter button

**Design**: Premium but functional
- Clean, readable menu
- Large product images
- Clear pricing
- Easy cart management
- Minimal steps to order

---

### Flow B: 🏖️ Booking (At Reception/Entrance)

**User Journey**:
1. Customer arrives at venue
2. Staff shows QR code or customer scans at entrance
3. Opens booking interface
4. Selects zone (VIP, Regular, Family, etc.)
5. Views available sunbeds/tables on map
6. Selects preferred spot
7. Chooses duration (2 hours, 4 hours, full day)
8. Confirms booking
9. Gets booking confirmation
10. Staff assigns the spot

**Features**:
- Interactive zone map
- Real-time availability
- Price display per zone
- Duration selection
- Guest count input
- Special requests
- Booking confirmation screen

**Design**: Clear and efficient
- Visual zone map
- Color-coded availability
- Large touch targets
- Quick booking flow

---

### Flow C: ⭐ Review (After Visit)

**User Journey**:
1. Customer receives review link (SMS/Email after visit)
2. Opens review page
3. Rates experience (1-5 stars)
4. Writes review (optional)
5. Uploads photos (optional)
6. Submits review
7. Gets thank you message

**Features**:
- Star rating (tap to rate)
- Text review field
- Photo upload (up to 5 photos)
- Category ratings (Service, Food, Ambiance, Value)
- Anonymous option
- Share review on social media

**Design**: Elegant and simple
- Blurred venue background
- Minimal star interface
- Large text area
- Easy photo upload
- Smooth submission

---

## 📊 Technical Architecture

### Mobile App (Discovery)
```
React Native
├── Screens
│   ├── DiscoveryScreen (Day/Night mode)
│   ├── VenueDetailScreen
│   ├── MapScreen
│   └── FavoritesScreen
├── Components
│   ├── VenueCard
│   ├── FilterBar
│   ├── ModeToggle (Day/Night)
│   └── SearchBar
└── Services
    ├── VenueAPI
    ├── LocationService
    └── TimeService (auto mode switching)
```

### Web Interface (At-Location)
```
React (Responsive)
├── Pages
│   ├── MenuPage (QR → Ordering)
│   ├── BookingPage (QR → Booking)
│   └── ReviewPage (Link → Review)
├── Components
│   ├── MenuCategory
│   ├── ProductCard
│   ├── Cart
│   ├── ZoneMap
│   └── StarRating
└── Services
    ├── OrderAPI
    ├── BookingAPI
    └── ReviewAPI
```

---

## 🎨 Design Systems

### Mobile App (Discovery)
**Style**: Ultra-Luxury
- Background: #FAFAF9 (warm off-white)
- Headings: Cormorant Garamond, 4xl-7xl, font-light
- Body: Inter, text-lg
- Cards: Rounded-[2rem], subtle shadows
- Animations: 500ms ease-out
- Images: Full-bleed with overlays

### Web Interface (At-Location)
**Style**: Premium Functional
- Background: White/Light gray
- Headings: Inter, font-semibold
- Body: Inter, text-base
- Cards: Rounded-lg, clean borders
- Buttons: Large, high contrast
- Focus: Easy ordering, clear CTAs

---

## 🚀 Implementation Priority

### Phase 1: Web Interface (2 weeks)
**Why first?** Immediate revenue - customers can order now
1. MenuPage (QR ordering) - Week 1
2. BookingPage (Reception booking) - Week 2
3. ReviewPage (Post-visit) - Week 2

### Phase 2: Mobile App (4 weeks)
**Why second?** Discovery drives traffic to venues
1. Discovery Screen (Day mode) - Week 1-2
2. Night mode + Mode switching - Week 3
3. Venue Details + Map - Week 4
4. Polish + Testing - Week 4

---

## 📱 QR Code System

### QR Code Types

**Type 1: Sunbed/Table QR**
```
URL: https://riviera.app/order?venue=5&unit=A12
Opens: MenuPage with venue menu
Auto-fills: Venue ID, Unit number
```

**Type 2: Entrance/Reception QR**
```
URL: https://riviera.app/book?venue=5
Opens: BookingPage
Shows: Available zones and units
```

**Type 3: Review QR (SMS/Email)**
```
URL: https://riviera.app/review?venue=5&booking=123
Opens: ReviewPage
Pre-filled: Venue info, Booking reference
```

---

## 🎯 Success Metrics

### Mobile App (Discovery)
- Daily active users
- Venues viewed per session
- Time spent in app
- Favorite venues saved
- Directions requested

### Web Interface (At-Location)
- Orders placed per day
- Average order value
- Booking conversion rate
- Review submission rate
- Order completion time

---

## 💡 Future Enhancements

### Mobile App
- Push notifications for events
- Personalized recommendations
- Social features (friend activity)
- Loyalty program integration
- Multi-language support

### Web Interface
- Payment integration (Stripe)
- Tip functionality
- Split bill feature
- Reorder favorites
- Order scheduling (pre-order)

---

## 🔑 Key Takeaways

1. **Mobile App = Discovery Only** (No booking, just browsing)
2. **Web Interface = Action** (Order, Book, Review)
3. **Day/Night Mode** is core to mobile app UX
4. **QR Codes** are the bridge to web interface
5. **Two Different Design Systems** (Luxury vs Functional)
6. **Web Interface First** (Faster ROI)
