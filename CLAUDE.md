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
    │   ├── AuthController.cs          # Authentication (login/register)
    │   ├── BusinessesController.cs    # Business operations
    │   └── SuperAdmin/                # Admin-only endpoints
    │       ├── DashboardController.cs
    │       ├── BusinessesController.cs
    │       ├── VenuesController.cs
    │       ├── ZonesController.cs
    │       ├── CategoriesController.cs
    │       ├── ProductsController.cs
    │       └── UsersController.cs
    ├── DTOs/                          # Data Transfer Objects
    ├── Entities/                      # Database entities
    │   ├── User.cs
    │   ├── Business.cs
    │   ├── Venue.cs
    │   ├── VenueZone.cs
    │   ├── Category.cs
    │   ├── Product.cs
    │   ├── Role.cs
    │   ├── UserRole.cs
    │   ├── ScheduledEvent.cs
    │   └── EventBooking.cs
    ├── Data/
    │   └── BlackBearDbContext.cs      # EF Core DbContext
    ├── Services/
    │   └── CurrentUserService.cs      # User context service
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
| POST | `/api/auth/login` | Login and receive JWT token |

### SuperAdmin APIs (`/api/superadmin/*`)
Requires `SuperAdmin` role.

| Controller | Endpoints |
|------------|-----------|
| Dashboard | GET stats, metrics |
| Businesses | CRUD operations for businesses |
| Venues | CRUD operations for venues |
| Zones | CRUD operations for venue zones |
| Categories | CRUD operations for product categories |
| Products | CRUD operations for products |
| Users | CRUD operations for users |

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

### Environment Variables (Container App)
Set via Azure Portal or CLI:
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience
- `ASPNETCORE_ENVIRONMENT` - Production

## Future APIs (Planned)

### Business Owner APIs (`/api/business/*`)
- Business profile management
- Staff/user management within business
- Venue management for owned business
- Reports and analytics

### Venue Management (`/api/venues/*`)
- Zone configuration
- Capacity management
- Operating hours

### Events & Bookings (`/api/events/*`)
- Create/manage scheduled events
- Event bookings
- Ticket management
- Guest lists

### Products & Menu (`/api/menu/*`)
- Product catalog management
- Category organization
- Pricing and variants
- Inventory tracking

### Orders (`/api/orders/*`)
- Order creation
- Order status tracking
- Payment integration
- Order history

### Notifications (`/api/notifications/*`)
- Push notifications
- Email notifications
- In-app notifications

### Analytics (`/api/analytics/*`)
- Sales reports
- Customer insights
- Performance metrics
- Revenue tracking

### Public APIs (`/api/public/*`)
- Public venue information
- Event discovery
- Menu browsing (no auth required)

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
