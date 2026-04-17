# BlackBear Services - Project Documentation

## Overview

BlackBear Services is a multi-tenant SaaS platform built with .NET 10 for managing businesses, venues, events, and products. The platform supports role-based access control with multi-tenancy isolation.

## Azure Infrastructure

### Container Apps (Production)
| Resource | Value |
|----------|-------|
| **API URL** | https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io |
| **Container App Name** | `blackbear-api` |
| **Environment** | `env-blackbear-dev` |
| **Resource Group** | `rg-blackbear-dev-001` |
| **Region** | Italy North |

### Container Registry
| Resource | Value |
|----------|-------|
| **Registry Name** | `blackbearapiark` |
| **Login Server** | `blackbearapiark.azurecr.io` |
| **Image** | `blackbearapiark.azurecr.io/blackbear-api:latest` |

### Azure SQL Database
| Resource | Value |
|----------|-------|
| **Server** | `srv-blackbear-main.database.windows.net` |
| **Database** | `sql-blackbear-core` |
| **Port** | 1433 |

### Allowed Origins (CORS)
- `https://blackbear-web.azurewebsites.net`
- `https://riviera-os.vercel.app`
- `http://localhost:3000` (development)

## Architecture

### Tech Stack
- **Backend**: .NET 10 / ASP.NET Core Web API
- **Database**: Azure SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer Tokens
- **Containerization**: Docker (multi-stage build)
- **Hosting**: Azure Container Apps (Consumption workload)
- **API Documentation**: Swagger/OpenAPI

### Project Structure
```
BlackBear.Services/
└── BlackBear.Services.Core/
    ├── Controllers/
    │   ├── AuthController.cs              # Authentication (login/register/PIN)
    │   ├── BusinessesController.cs        # Business operations
    │   ├── Business/                      # Business owner/manager endpoints
    │   │   ├── VenuesController.cs
    │   │   ├── ZonesController.cs
    │   │   ├── CategoriesController.cs
    │   │   ├── ProductsController.cs
    │   │   ├── StaffController.cs
    │   │   ├── EventsController.cs
    │   │   ├── OrdersController.cs
    │   │   ├── UnitsController.cs         # Zone unit management (Caderman)
    │   │   └── UnitBookingsController.cs  # Unit booking management (Caderman)
    │   ├── Public/                        # Public endpoints (no auth)
    │   │   ├── EventsController.cs
    │   │   ├── OrdersController.cs
    │   │   └── ReservationsController.cs  # Guest unit reservations
    │   └── SuperAdmin/                    # Admin-only endpoints
    │       ├── DashboardController.cs
    │       ├── BusinessesController.cs
    │       ├── VenuesController.cs
    │       ├── ZonesController.cs
    │       ├── CategoriesController.cs
    │       ├── ProductsController.cs
    │       ├── UsersController.cs
    │       ├── EventsController.cs
    │       └── OrdersController.cs
    ├── DTOs/
    │   ├── Auth/                          # Authentication DTOs
    │   ├── Business/                      # Business admin DTOs (Biz prefix)
    │   ├── Public/                        # Public DTOs
    │   └── SuperAdmin/                    # SuperAdmin DTOs
    ├── Entities/                          # Database entities
    │   ├── User.cs
    │   ├── Business.cs
    │   ├── Venue.cs
    │   ├── VenueZone.cs
    │   ├── Category.cs
    │   ├── Product.cs
    │   ├── Role.cs
    │   ├── UserRole.cs
    │   ├── ScheduledEvent.cs
    │   ├── EventBooking.cs
    │   ├── Order.cs
    │   ├── OrderItem.cs
    │   ├── ZoneUnit.cs
    │   └── ZoneUnitBooking.cs
    ├── Data/
    │   └── BlackBearDbContext.cs          # EF Core DbContext
    ├── Services/
    │   └── CurrentUserService.cs          # User context service
    ├── Interfaces/
    │   └── ICurrentUserService.cs
    └── Migrations/
```

### Role-Based Access Control
| Role | Access Level |
|------|--------------|
| **SuperAdmin** | Full system access, all businesses |
| **BusinessOwner** | Full access to owned business |
| **Manager** | Manage venues, products, staff |
| **Caderman** | Manage sunbeds/umbrellas and guest check-in/out |
| **Barman** | Handle drink/food orders |
| **Staff** | Limited operational access |
| **Guest** | Default role for new registrations |

### Multi-Tenancy
- Users are scoped to their `BusinessId`
- Global query filters automatically filter data by tenant
- SuperAdmin bypasses tenant filters using `IgnoreQueryFilters()`

### Soft Delete
All major entities support soft delete with:
- `IsDeleted` (bool)
- `DeletedAt` (DateTime?)

## Current APIs

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (Guest role) |
| POST | `/api/auth/login` | Login with email/password, receive JWT token |
| POST | `/api/auth/pin-login` | Login with PIN code (for staff) |

### SuperAdmin APIs (`/api/superadmin/*`)
Requires `SuperAdmin` role. Full access to all resources across all businesses.

#### Dashboard (`/api/superadmin/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform-wide statistics |
| GET | `/recent-activity` | Recent platform activity |

#### Businesses (`/api/superadmin/businesses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all businesses (paginated, searchable) |
| GET | `/{id}` | Get business details |
| POST | `/` | Create new business |
| PUT | `/{id}` | Update business |
| DELETE | `/{id}` | Soft delete business |
| POST | `/{id}/restore` | Restore deleted business |

#### Venues (`/api/superadmin/venues`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all venues (paginated, filterable by business) |
| GET | `/{id}` | Get venue details |
| POST | `/` | Create new venue |
| PUT | `/{id}` | Update venue |
| DELETE | `/{id}` | Soft delete venue |
| POST | `/{id}/restore` | Restore deleted venue |

#### Zones (`/api/superadmin/zones`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all zones (filterable by venue) |
| GET | `/{id}` | Get zone details |
| POST | `/` | Create new zone |
| PUT | `/{id}` | Update zone |
| DELETE | `/{id}` | Soft delete zone |
| POST | `/{id}/restore` | Restore deleted zone |

#### Categories (`/api/superadmin/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all categories (filterable by business) |
| GET | `/{id}` | Get category details |
| POST | `/` | Create new category |
| PUT | `/{id}` | Update category |
| DELETE | `/{id}` | Soft delete category |
| POST | `/{id}/restore` | Restore deleted category |

#### Products (`/api/superadmin/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all products (paginated, filterable) |
| GET | `/{id}` | Get product details |
| POST | `/` | Create new product |
| PUT | `/{id}` | Update product |
| DELETE | `/{id}` | Soft delete product |
| POST | `/{id}/restore` | Restore deleted product |

#### Users (`/api/superadmin/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all users (paginated, filterable) |
| GET | `/{id}` | Get user details |
| POST | `/` | Create new user |
| PUT | `/{id}` | Update user |
| DELETE | `/{id}` | Soft delete user |
| POST | `/{id}/restore` | Restore deleted user |

#### Events (`/api/superadmin/events`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all events (paginated, filterable) |
| GET | `/{id}` | Get event details |
| POST | `/` | Create new event |
| PUT | `/{id}` | Update event |
| DELETE | `/{id}` | Soft delete event |
| POST | `/{id}/publish` | Publish event |
| POST | `/{id}/unpublish` | Unpublish event |
| POST | `/{id}/restore` | Restore deleted event |

#### Orders (`/api/superadmin/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all orders (paginated, filterable) |
| GET | `/{id}` | Get order details |
| DELETE | `/{id}` | Soft delete order |
| POST | `/{id}/restore` | Restore deleted order |

**Query Parameters for GET `/`:**
- `page`, `pageSize` - Pagination
- `venueId` - Filter by venue
- `businessId` - Filter by business
- `zoneId` - Filter by zone
- `status` - Filter by status (Pending, Preparing, Ready, Delivered, Cancelled)
- `search` - Search by order number or customer name

### Business Admin APIs (`/api/business/*`)
Requires `BusinessOwner` or `Manager` role. Access scoped to user's business.

#### Venues (`/api/business/venues`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List business venues |
| GET | `/{id}` | Get venue details |
| GET | `/{id}/config` | Get venue configuration |
| POST | `/` | Create venue (BusinessOwner only) |
| PUT | `/{id}` | Update venue (BusinessOwner only) |
| PUT | `/{id}/config` | Update venue config (BusinessOwner only) |
| DELETE | `/{id}` | Soft delete venue (BusinessOwner only) |

#### Zones (`/api/business/zones`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List zones (filterable by venue) |
| GET | `/{id}` | Get zone details |
| POST | `/` | Create zone |
| PUT | `/{id}` | Update zone |
| DELETE | `/{id}` | Soft delete zone |

#### Categories (`/api/business/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List business categories |
| GET | `/{id}` | Get category details |
| POST | `/` | Create category |
| PUT | `/{id}` | Update category |
| DELETE | `/{id}` | Soft delete category |

#### Products (`/api/business/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List products (paginated, filterable) |
| GET | `/{id}` | Get product details |
| POST | `/` | Create product |
| PUT | `/{id}` | Update product |
| DELETE | `/{id}` | Soft delete product |

#### Staff (`/api/business/staff`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List staff members |
| GET | `/{id}` | Get staff details |
| POST | `/` | Create staff member |
| PUT | `/{id}` | Update staff member |
| DELETE | `/{id}` | Soft delete staff member |
| POST | `/{id}/reset-password` | Reset staff password |
| POST | `/{id}/set-pin` | Set staff PIN code |

#### Events (`/api/business/events`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List business events (Manager+) |
| GET | `/{id}` | Get event details (Manager+) |
| POST | `/` | Create event (BusinessOwner only) |
| PUT | `/{id}` | Update event (BusinessOwner only) |
| DELETE | `/{id}` | Soft delete event (BusinessOwner only) |
| POST | `/{id}/publish` | Publish event (BusinessOwner only) |
| POST | `/{id}/unpublish` | Unpublish event (BusinessOwner only) |

#### Orders (`/api/business/orders`)
Requires `Barman`, `Manager`, or `BusinessOwner` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List orders (filterable by venue, status, zone) |
| GET | `/active` | Get all active orders (Pending, Preparing, Ready) |
| GET | `/zone/{zoneId}` | Get orders for specific zone |
| GET | `/{id}` | Get order details |
| PUT | `/{id}/status` | Update order status |

**Order Status Flow:**
```
Pending → Preparing → Ready → Delivered
    ↓         ↓         ↓
         Cancelled
```

#### Units (`/api/business/venues/{venueId}/units`)
Requires `Caderman`, `Manager`, or `BusinessOwner` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all units (filter by zone, status, type) |
| GET | `/{id}` | Get unit details |
| GET | `/by-qr/{qrCode}` | Get unit by QR code (for scanning) |
| GET | `/stats` | Get unit/booking statistics |
| POST | `/` | Create unit (Manager+) |
| POST | `/bulk` | Create multiple units at once (Manager+) |
| PUT | `/{id}` | Update unit (Manager+) |
| PUT | `/{id}/status` | Update unit status (Caderman can do this) |
| DELETE | `/{id}` | Soft delete unit (Manager+) |

**Unit Status Flow:**
```
Available ←→ Reserved ←→ Occupied
    ↑           ↓           ↓
    └── Maintenance ←───────┘
```

#### Unit Bookings (`/api/business/venues/{venueId}/bookings`)
Requires `Caderman`, `Manager`, or `BusinessOwner` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List bookings (filter by date, status, zone) |
| GET | `/active` | Get active bookings (Reserved, Active) |
| GET | `/{id}` | Get booking details |
| POST | `/` | Create walk-in booking |
| POST | `/{id}/check-in` | Check in guest |
| POST | `/{id}/check-out` | Check out guest |
| POST | `/{id}/cancel` | Cancel booking |
| POST | `/{id}/no-show` | Mark as no-show |

**Booking Status Flow:**
```
Reserved → Active → Completed
    ↓         ↓
  NoShow  Cancelled
```

### Public APIs (`/api/public/*`)
No authentication required. Read-only access to published content.

#### Events (`/api/public/events`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List upcoming published events |
| GET | `/{id}` | Get event details (published only) |
| GET | `/venue/{venueId}` | List events by venue |
| GET | `/business/{businessId}` | List events by business |

**Query Parameters for GET `/`:**
- `venueId` - Filter by venue
- `businessId` - Filter by business
- `limit` - Max results (default: 50)

#### Orders (`/api/public/orders`)
No authentication required. For guest QR code ordering.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menu?venueId=1` | Get venue menu (categories with products) |
| POST | `/` | Create new order (guest places order) |
| GET | `/{orderNumber}?venueId=1` | Check order status |

**Create Order Request Body:**
```json
{
  "venueId": 1,
  "zoneId": 5,
  "customerName": "John",
  "notes": "No ice please",
  "items": [
    { "productId": 10, "quantity": 2, "notes": "Extra lemon" }
  ]
}
```

#### Reservations (`/api/public/reservations`)
No authentication required. For guest sunbed/umbrella reservations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/availability?venueId=1&date=2024-01-15` | Get available units by venue/date |
| GET | `/zones?venueId=1` | Get zones with availability counts |
| POST | `/` | Create reservation |
| GET | `/{bookingCode}` | Check reservation status |
| DELETE | `/{bookingCode}` | Cancel reservation |

**Create Reservation Request Body:**
```json
{
  "venueId": 1,
  "zoneUnitId": 5,
  "guestName": "John Doe",
  "guestPhone": "+39123456789",
  "guestEmail": "john@example.com",
  "guestCount": 2,
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T18:00:00Z",
  "notes": "Need an umbrella with shade"
}
```

### Health Checks
| Endpoint | Description |
|----------|-------------|
| `/health` | All health checks |
| `/health/live` | Liveness probe (always healthy) |
| `/health/ready` | Readiness probe (database check) |

## Deployment

### Build and Deploy to Azure Container Apps

1. **Login to Azure Container Registry**
   ```bash
   az acr login --name blackbearapiark
   ```

2. **Build Docker Image**
   ```bash
   cd BlackBear.Services/BlackBear.Services.Core
   docker build -t blackbearapiark.azurecr.io/blackbear-api:latest .
   ```

3. **Push to ACR**
   ```bash
   docker push blackbearapiark.azurecr.io/blackbear-api:latest
   ```

4. **Update Container App**
   ```bash
   az containerapp update \
     --name blackbear-api \
     --resource-group rg-blackbear-dev-001 \
     --image blackbearapiark.azurecr.io/blackbear-api:latest
   ```

5. **Force New Revision (if needed)**
   ```bash
   az containerapp revision copy \
     --name blackbear-api \
     --resource-group rg-blackbear-dev-001
   ```

### Environment Variables (Container App)
Set via Azure Portal or CLI:
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience
- `ASPNETCORE_ENVIRONMENT` - Production

## Future APIs (Planned)

### Event Bookings (`/api/bookings/*`)
- Create/manage event bookings
- Ticket management
- Guest lists
- Check-in functionality

### Notifications (`/api/notifications/*`)
- Push notifications
- Email notifications
- In-app notifications

### Analytics (`/api/analytics/*`)
- Sales reports
- Customer insights
- Performance metrics
- Revenue tracking

### Public APIs (Additional)
- Public venue information

## Development

### Prerequisites
- .NET 10 SDK
- Docker Desktop
- Azure CLI
- SQL Server (local or Azure)

### Local Development
```bash
cd BlackBear.Services/BlackBear.Services.Core
dotnet run
```

API available at: `https://localhost:5001` or `http://localhost:5000`
Swagger UI: `https://localhost:5001/swagger`

### Database Migrations
```bash
# Add new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update
```

## Configuration Files

| File | Purpose |
|------|---------|
| `appsettings.json` | Base configuration |
| `appsettings.Development.json` | Development overrides |
| `appsettings.Production.json` | Production overrides (CORS only) |
| `Dockerfile` | Container build instructions |

## DTO Naming Conventions

To avoid Swagger schema ID conflicts between namespaces:
- **SuperAdmin DTOs**: Standard names (e.g., `VenueListItemDto`, `CreateVenueRequest`)
- **Business DTOs**: Prefixed with `Biz` (e.g., `BizVenueListItemDto`, `BizCreateVenueRequest`)
- **Public DTOs**: Prefixed with `Public` (e.g., `PublicEventListItemDto`, `PublicEventDetailDto`)
