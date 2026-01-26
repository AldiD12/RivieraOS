# 🏖️ Riviera OS

**High-performance beach club management system for the Albanian Riviera**

A modular monolith built for speed, designed for luxury. Handles sunbed reservations, real-time orders, and customer feedback at scale during peak August season.

**Live Demo:** Coming soon  
**GitHub:** https://github.com/AldiD12/RivieraOS

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend
dotnet run
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Default Credentials:**
- Waiter PIN: `1111`
- Admin Password: `admin123`

### Production Deployment

See **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** for step-by-step Supabase + Render deployment.

---

## 🏗️ Tech Stack

**Backend:**
- .NET 9 Web API (Modular Monolith)
- Entity Framework Core 9
- PostgreSQL (Supabase) / In-Memory (dev)
- SignalR for real-time updates
- FluentValidation for request validation

**Frontend:**
- React 18 + Vite
- Tailwind CSS + Framer Motion
- React Router v6
- Leaflet (OpenStreetMap)
- SignalR Client

---

## ✨ Features

### Customer-Facing (Luxury Design)

**Discovery Page** - "Waze for Beaches"
- Interactive map with real-time sunbed availability
- Live occupancy stats per venue
- Coastal intelligence theme with bronze accents

**Menu Page** - Midnight Editorial Design
- Fluid brutalism with staggered layout
- Ultra-tall portrait product images
- Parallax scrolling effects
- Floating bronze orb buttons

**Review Page** - Feedback Shield
- 4-5 star reviews → Google redirect
- 1-3 star reviews → Internal alert (WhatsApp)
- Midnight editorial aesthetic

### Staff-Facing (Industrial Minimalist)

**Bar KDS (Kitchen Display System)** - "The Cockpit"
- High-density masonry grid (3 columns)
- Smart card states (NEW/CLAIMED/LATE)
- Real-time timer with color coding
- Single-tap claim, tap-to-complete
- NO PRICES (bartender doesn't need them)

**Collector Dashboard** - Sunbed Management
- Real-time sunbed status grid
- Quick status changes (Available/Occupied/Reserved)
- SignalR live updates across all devices

**Admin Dashboard** - Command Center
- Split-panel layout (70% map, 30% inspector)
- Sunbed status management
- Order monitoring
- Real-time venue overview

---

## 🏛️ Architecture

**Modular Monolith** with 4 core modules:

1. **Core** - Business, User entities
2. **Catalog** - Venue, VenueZone, Category, Product
3. **Ops** - Order, OrderItem, Device
4. **Feedback** - Review

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed documentation.

---

## 📊 Performance

**Target:** Sub-200ms API response time on 4G/5G

**Optimizations:**
- Database indexes on high-traffic queries
- Single-query DTO projections with `AsNoTracking()`
- Filtered at database level (no in-memory filtering)
- SignalR for real-time updates (no polling)

**Example:** Menu endpoint executes 1 SQL query instead of 5+

---

## 🎨 Design System

**Two-Track Philosophy:**

**Customer Pages** - Ultra-Luxury ($20K+ Standard)
- Benchmark: Aman Resorts, Six Senses, Soho House
- Typography: Playfair Display (serif) + Geist Sans/Mono
- Colors: Deep water gradient (zinc-950 → #0f172a), bronze accents
- 4% grain overlay, heavy vignette, parallax effects

**Staff Pages** - Industrial Minimalist
- High contrast: white on black (zinc-950)
- Monospace for all numbers
- Sharp corners, 1-2px borders
- Zero decorative elements

See **[.kiro/steering/premium-design-system.md](./.kiro/steering/premium-design-system.md)** for complete specs.

---

## 📁 Project Structure

```
RivieraOS/
├── backend/
│   ├── Controllers/          # API endpoints
│   ├── Data/
│   │   ├── Migrations/       # EF Core migrations
│   │   ├── RivieraDbContext.cs
│   │   └── DbInitializer.cs  # Seed data
│   ├── Hubs/
│   │   └── BeachHub.cs       # SignalR hub
│   ├── Modules/
│   │   ├── Core/             # Business, User
│   │   ├── Catalog/          # Venue, Product, Category
│   │   ├── Ops/              # Order, OrderItem, Device
│   │   └── Feedback/         # Review
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DiscoveryPage.jsx      # Customer: Map view
│   │   │   ├── MenuPage.jsx           # Customer: Order menu
│   │   │   ├── ReviewPage.jsx         # Customer: Feedback
│   │   │   ├── BarDisplay.jsx         # Staff: KDS
│   │   │   ├── CollectorDashboard.jsx # Staff: Sunbeds
│   │   │   ├── AdminDashboard.jsx     # Staff: Command center
│   │   │   └── LoginPage.jsx          # Staff: Auth
│   │   ├── services/
│   │   │   ├── api.js         # Axios instance
│   │   │   ├── auth.js        # JWT handling
│   │   │   └── signalr.js     # Real-time connection
│   │   └── components/
│   └── package.json
│
├── DEPLOYMENT-CHECKLIST.md   # Step-by-step deployment guide
├── ARCHITECTURE.md            # System documentation
└── README.md
```

---

## 🔌 API Endpoints

### Venue & Menu
- `GET /api/venue` - List all venues
- `GET /api/venue/{id}/layout` - Get sunbed layout + stats
- `GET /api/venue/{id}/menu` - Get menu with categories

### Orders
- `POST /api/order` - Create order (triggers SignalR)
- `GET /api/order/venue/{venueId}` - Get venue orders
- `PATCH /api/order/{id}/status` - Update order status
- `PATCH /api/order/{id}/assign` - Claim order (waiter)

### Products (Sunbeds)
- `PATCH /api/venue/products/{id}/status` - Update sunbed status

### Reviews
- `POST /api/review` - Submit feedback
- `GET /api/review/venue/{venueId}` - Get venue reviews

### SignalR Hub (`/beachhub`)
- `LayoutUpdate` - Sunbed status changed
- `NewOrder` - Order placed
- `OrderStatusChanged` - Order updated
- `OrderAssigned` - Order claimed by waiter

---

## 🗄️ Database Schema

**Key Entities:**
- `Business` - Venue owner/operator
- `User` - Staff (Waiter, Admin)
- `Venue` - Beach club/restaurant
- `VenueZone` - Sections (VIP, Front Row, etc.)
- `Category` - Menu categories (Drinks, Food)
- `Product` - Menu items + Sunbeds (with UnitCode)
- `Order` - Customer orders
- `OrderItem` - Line items
- `Review` - Customer feedback

**Performance Indexes:**
- `Product(CategoryId, VenueZoneId, Status, IsAvailable)`
- `Order(VenueId, Status, CreatedAt, AssignedUserId)`
- `Category(VenueId, Type)`

---

## 🧪 Sample Data

**Venues:**
- Hotel Coral Beach (20 sunbeds, full menu)
- Folie Beach Bar
- Hotel Coral

**Sunbeds:** A1-A10, B1-B10 (Zone A: VIP Front, Zone B: Standard)

**Menu:** 6 drinks (Mojito, Aperol Spritz, Espresso, etc.)

---

## 🚢 Deployment

**Recommended Stack:**
- **Database:** Supabase PostgreSQL (free tier)
- **Backend:** Render.com Web Service (free/$7/month)
- **Frontend:** Render.com Static Site (free)

**Cost:** $0-7/month for 1-2 venues

See **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** for complete guide.

---

## 🛠️ Development

**Prerequisites:**
- .NET 9 SDK
- Node.js 18+
- PostgreSQL (optional, uses in-memory by default)

**Environment Variables:**

Backend (`appsettings.Production.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://..."
  }
}
```

Frontend (`.env.production`):
```
VITE_API_URL=https://your-api.onrender.com
```

---

## 📝 Key Implementation Details

**Dual-Mode Database:**
- Development: In-memory (no setup required)
- Production: PostgreSQL (via connection string)

**Shadow Fiscal Model:**
- System calculates totals
- Waiter manually enters final amount into fiscal device
- NOT a POS system

**Review Shield:**
- Rating ≥ 4 → Redirect to Google Maps review
- Rating < 4 → Internal alert (WhatsApp stub)

**3-Tap Rule:**
- Every action completes in ≤3 taps
- Optimized for speed during peak hours

---

## 🔐 Security

- JWT-based authentication (12-hour expiry)
- Role-based access control (Waiter/Admin)
- FluentValidation on all inputs
- CORS restricted to known origins
- UUIDs for all primary keys (no guessable IDs)

---

## 🎯 Roadmap

**Phase 1: MVP** ✅
- [x] Modular monolith architecture
- [x] Real-time order system
- [x] Sunbed management
- [x] Premium design system
- [x] PostgreSQL support
- [x] Deployment ready

**Phase 2: Scale** (Q2 2026)
- [ ] Multi-venue support (25+ venues)
- [ ] WhatsApp integration (alerts)
- [ ] Analytics dashboard
- [ ] Mobile apps (React Native)
- [ ] Payment gateway integration

**Phase 3: Intelligence** (Q3 2026)
- [ ] Predictive occupancy
- [ ] Dynamic pricing
- [ ] Customer profiles
- [ ] Loyalty program

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a private project for Albanian Riviera beach clubs. For inquiries, contact the repository owner.

---

**Built with ❤️ for the Albanian Riviera**
