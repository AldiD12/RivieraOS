# Riviera OS - Production Deployment Guide

## Overview
This guide will help you deploy Riviera OS to production using:
- **Backend**: Render.com (Free tier with PostgreSQL)
- **Database**: Supabase (Free tier PostgreSQL)
- **Frontend**: Render.com Static Site (Free tier)

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Account**: Your code should be in a GitHub repository

---

## Step 1: Setup Supabase Database

### 1.1 Create a New Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `riviera-production`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `eu-central-1` for Europe)
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Connection String
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password
5. **Save this connection string** - you'll need it for Render

### 1.3 Enable Connection Pooling (Important!)
1. In Supabase, go to **Database** → **Connection Pooling**
2. Enable **Transaction Mode**
3. Copy the **pooled connection string** (port 6543):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
   ```
4. Use this for production (handles more connections)

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Your Repository
1. Push your code to GitHub
2. Make sure `backend/` folder contains:
   - `RestaurantQRApi.csproj`
   - `Program.cs`
   - `appsettings.Production.json`

### 2.2 Create Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `riviera-api`
   - **Region**: Same as Supabase (e.g., `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` or `.NET`
   - **Build Command**: `dotnet publish -c Release -o out`
   - **Start Command**: `dotnet out/RestaurantQRApi.dll`
   - **Instance Type**: `Free`

### 2.3 Add Environment Variables
In Render, go to **Environment** tab and add:

```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
Jwt__Key=YOUR_SUPER_SECRET_JWT_KEY_CHANGE_THIS_IN_PRODUCTION_MIN_32_CHARS
Jwt__Issuer=RivieraApi
ASPNETCORE_URLS=http://+:10000
```

**Important Notes:**
- Replace `[PASSWORD]` with your Supabase password
- Generate a strong JWT key (min 32 characters)
- Render uses port `10000` by default

### 2.4 Deploy
1. Click **Create Web Service**
2. Render will build and deploy (takes 3-5 minutes)
3. Once deployed, you'll get a URL like: `https://riviera-api.onrender.com`

### 2.5 Run Database Migrations
After first deployment, you need to create the database schema:

**Option A: Using Render Shell**
1. In Render dashboard, go to your service
2. Click **Shell** tab
3. Run:
   ```bash
   dotnet ef database update
   ```

**Option B: Using Local Machine**
1. Update your local `appsettings.json` with production connection string
2. Run:
   ```bash
   cd backend
   dotnet ef database update --connection "YOUR_SUPABASE_CONNECTION_STRING"
   ```

---

## Step 3: Deploy Frontend to Render

### 3.1 Update API URL
1. Open `frontend/src/services/api.js` (or wherever API_URL is defined)
2. Change:
   ```javascript
   const API_URL = import.meta.env.PROD 
     ? 'https://riviera-api.onrender.com/api'
     : 'http://localhost:5000/api';
   ```

### 3.2 Create Static Site on Render
1. In Render dashboard, click **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `riviera-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3.3 Add Environment Variables
```
VITE_API_URL=https://riviera-api.onrender.com/api
```

### 3.4 Deploy
1. Click **Create Static Site**
2. Render will build and deploy (takes 2-3 minutes)
3. You'll get a URL like: `https://riviera-frontend.onrender.com`

---

## Step 4: Configure CORS

Update `backend/Program.cs` to allow your frontend domain:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174", 
            "http://localhost:3000",
            "https://riviera-frontend.onrender.com"  // Add your Render frontend URL
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

Commit and push - Render will auto-deploy.

---

## Step 5: Seed Production Database

### 5.1 Option A: Automatic Seeding (First Run)
The `DbInitializer.Initialize()` in `Program.cs` will seed data on first run.

### 5.2 Option B: Manual Seeding via Supabase
1. Go to Supabase → **SQL Editor**
2. Run seed SQL manually (create venues, products, etc.)

---

## Step 6: Test Your Deployment

### 6.1 Test Backend
```bash
curl https://riviera-api.onrender.com/api/venue
```

Should return JSON with venues.

### 6.2 Test Frontend
1. Open `https://riviera-frontend.onrender.com`
2. Navigate to Discovery Page
3. Check if venues load
4. Try placing an order

### 6.3 Test SignalR
1. Open Bar Display: `https://riviera-frontend.onrender.com/bar`
2. Place an order from Menu Page
3. Verify order appears in real-time

---

## Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → Your Service → Logs
- Verify connection string is correct
- Ensure JWT key is at least 32 characters

### Database connection fails
- Use **pooled connection string** (port 6543)
- Check Supabase is in same region as Render
- Verify password is correct (no special characters causing issues)

### Frontend can't reach backend
- Check CORS configuration
- Verify API_URL in frontend matches backend URL
- Check browser console for errors

### SignalR not working
- Ensure WebSocket support is enabled
- Check CORS allows credentials
- Verify HUB_URL in frontend is correct

---

## Free Tier Limitations

### Render Free Tier
- **Backend**: Spins down after 15 minutes of inactivity (cold start ~30s)
- **Frontend**: Always on, but limited bandwidth
- **Solution**: Upgrade to paid tier ($7/month) for always-on backend

### Supabase Free Tier
- **Database**: 500MB storage, 2GB bandwidth/month
- **Connections**: 60 concurrent (pooling helps)
- **Solution**: Upgrade to Pro ($25/month) for more resources

---

## Production Checklist

- [ ] Supabase project created
- [ ] Database connection string saved
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Frontend deployed to Render
- [ ] CORS configured correctly
- [ ] Test orders work end-to-end
- [ ] SignalR real-time updates work
- [ ] JWT secret is strong and secure
- [ ] Database is seeded with initial data

---

## Monitoring

### Render
- View logs: Dashboard → Service → Logs
- Monitor metrics: Dashboard → Service → Metrics

### Supabase
- Database usage: Dashboard → Database → Usage
- Query performance: Dashboard → Database → Query Performance

---

## Backup Strategy

### Database Backups
Supabase automatically backs up your database daily (free tier: 7 days retention).

**Manual Backup:**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" > backup.sql
```

**Restore:**
```bash
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" < backup.sql
```

---

## Next Steps

1. **Custom Domain**: Add your own domain in Render settings
2. **SSL Certificate**: Render provides free SSL automatically
3. **Monitoring**: Set up Sentry or similar for error tracking
4. **Analytics**: Add Google Analytics or Plausible
5. **Email Notifications**: Integrate SendGrid for order notifications

---

## Support

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **EF Core Migrations**: https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/

---

**Your production URLs:**
- Backend API: `https://riviera-api.onrender.com`
- Frontend: `https://riviera-frontend.onrender.com`
- Database: Supabase Dashboard

🚀 **Riviera OS is now live!**
