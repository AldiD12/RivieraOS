# Restaurant QR Ordering System MVP

A full-stack restaurant ordering system with QR code support, real-time order notifications, and separate customer/admin interfaces.

## Tech Stack

### Backend
- **.NET 9** Web API
- **Entity Framework Core** with In-Memory Database
- **SignalR** for real-time communication

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **SignalR Client** for real-time updates

## Features

### Customer Mode (`/menu/:tableId`) - No Login Required
- Mobile-first menu browsing
- Add items to cart
- Review order in modal
- Place order with "Pay Cash" option
- Real-time order status updates
- Clean, industrial minimalist UI

### Waiter Mode (`/waiter/tables`) - 4-Digit PIN Required
- View all tables (occupied/available)
- Real-time table status updates
- Click occupied tables to view bills
- Itemized bill with service charge and tax
- Mark tables as paid
- Fast PIN-based authentication (12-hour session)

### Admin/Kitchen Mode (`/admin/dashboard`) - Password Required
- Real-time order notifications
- Sound alert on new orders
- Visual flash animation for new orders
- View active and completed orders
- Update order status (Pending → Preparing → Ready → Completed)
- Filter orders by status
- Live updates via SignalR

### QR Code Generator (`/admin/qr-codes`) - Password Required
- Generate QR codes for any number of tables
- Customizable restaurant name and base URL
- Print-optimized layout
- Download individual QR codes as PNG
- Print all codes at once

## Authentication

The system uses **Role-Based Access Control (RBAC)** with JWT tokens:

### Default Credentials

**Waiter Login** (4-Digit PIN):
- PIN: `1111`
- Access: Waiter Dashboard, Table Management, Billing

**Manager Login** (Password):
- Password: `admin123`
- Access: Kitchen Dashboard, QR Code Generator, Order Management

**Customer Access**:
- No login required
- Direct access via QR code scan

For detailed authentication information, see [AUTHENTICATION.md](./AUTHENTICATION.md)

## Project Structure

```
restaurant-qr-ordering/
├── backend/                    # .NET 9 API
│   ├── Controllers/
│   │   ├── MenuController.cs
│   │   └── OrdersController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Hubs/
│   │   └── OrderHub.cs
│   ├── Models/
│   │   ├── MenuItem.cs
│   │   ├── Order.cs
│   │   └── OrderItem.cs
│   └── Program.cs
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── MenuPage.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── signalr.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 18+ and npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Restore dependencies (if needed):
```bash
dotnet restore
```

3. Run the backend:
```bash
dotnet run
```

The API will start at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if needed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## Usage

### Customer Flow (No Login)
1. Scan QR code or open `http://localhost:5173/menu/1`
2. Browse the menu
3. Add items to cart
4. Review order and place it
5. Receive real-time status updates

### Waiter Flow (PIN: 1111)
1. Open `http://localhost:5173/` and click "Waiter Dashboard"
2. Enter PIN: `1111` on the numpad
3. View table grid (green = available, red = occupied)
4. Click occupied table to view bill
5. Mark table as paid when customer is ready

### Admin/Kitchen Flow (Password: admin123)
1. Open `http://localhost:5173/` and click "Kitchen Dashboard"
2. Enter password: `admin123`
3. View incoming orders in real-time
4. Update order status as you prepare food
5. Generate QR codes from the QR Codes page

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (waiter PIN or admin password)
- `POST /api/auth/verify` - Verify JWT token

### Menu
- `GET /api/menu` - Get all menu items

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order (triggers SignalR event)
- `GET /api/orders/{id}` - Get specific order
- `PATCH /api/orders/{id}/status` - Update order status

### Billing
- `GET /api/bill/{tableId}` - Get bill for table
- `POST /api/bill/{tableId}/pay` - Mark table as paid
- `GET /api/bill/tables/status` - Get all active tables

### SignalR Hub
- Hub URL: `/orderhub`
- Admin Group: `AdminGroup`
- Events: 
  - `ReceiveOrder` - New order created
  - `OrderStatusUpdated` - Order status changed
  - `TableFreed` - Table marked as paid

## Sample Data

The system comes pre-seeded with 6 menu items:
- Margherita Pizza - $12.99
- Pepperoni Pizza - $14.99
- Caesar Salad - $8.99
- Cheeseburger - $11.99
- Coca Cola - $2.99
- Pasta Carbonara - $13.99

## Key Implementation Details

### Real-time Communication
- Backend uses SignalR `OrderHub` with admin group management
- When order is created via POST, it triggers `ReceiveOrder` event to all admin clients
- Frontend admin dashboard listens for `ReceiveOrder` and updates UI instantly

### CORS Configuration
Backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative React port)

### In-Memory Database
- Data persists only while backend is running
- Database is seeded on startup with sample menu items
- Perfect for MVP/demo purposes

## Development Notes

- JWT-based authentication with 12-hour token expiry
- Role-based route protection (Waiter/Admin)
- All orders default to "Cash" payment method
- Orders are sorted by creation time (newest first)
- SignalR automatically reconnects on connection loss
- Industrial/minimalist design inspired by Linear and Vercel

## Design System

The UI follows a hyper-minimalist, industrial aesthetic:
- **Typography**: Inter font with tight tracking
- **Colors**: Off-white backgrounds (zinc-50), solid black accents (zinc-900)
- **Borders**: 1px borders on all elements (no shadows)
- **Spacing**: Generous gaps for breathing room
- **Interactions**: Subtle, instant feedback
- **Layout**: Bento grid for dashboards, clean list layouts

## Future Enhancements

- Database persistence (PostgreSQL/MySQL)
- User management system
- Multiple payment methods (Card, Mobile)
- Order history and analytics
- Menu item management interface
- Table reservation system
- Receipt printing
- Multi-language support
- Kitchen printer integration

## License

MIT
