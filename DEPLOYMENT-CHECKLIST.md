# 🚀 Riviera OS Deployment Checklist

## Prerequisites
- [x] Code pushed to GitHub: https://github.com/AldiD12/RivieraOS
- [ ] Supabase account created
- [ ] Render.com account created

---

## Step 1: Set Up Supabase Database (5 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name:** `riviera-os-production`
   - **Database Password:** (Generate strong password - SAVE THIS!)
   - **Region:** Choose closest to Albania (e.g., Frankfurt, eu-central-1)
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **Connection pooling** tab (IMPORTANT!)
4. Copy the **Connection string** (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. **SAVE THIS CONNECTION STRING** - you'll need it for Render

### 1.3 Configure Database (Optional but Recommended)
1. Go to **SQL Editor** in Supabase
2. Run this query to enable UUID extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

---

## Step 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Web Service
1. Go to https://render.com
2. Click **New** → **Web Service**
3. Connect your GitHub account
4. Select repository: `AldiD12/RivieraOS`
5. Click **Connect**

### 2.2 Configure Service
Fill in the following settings:

**Basic Settings:**
- **Name:** `riviera-os-api`
- **Region:** Frankfurt (EU Central) - closest to Albania
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `.NET`
- **Build Command:** `chmod +x deploy-backend.sh && ./deploy-backend.sh`
- **Start Command:** `cd backend && dotnet run --configuration Release --urls "http://0.0.0.0:$PORT"`

**Instance Type:**
- Select **Free** (for testing) or **Starter** ($7/month for production)

### 2.3 Add Environment Variables
Click **Advanced** → **Add Environment Variable**

Add these variables:

| Key | Value |
|-----|-------|
| `ConnectionStrings__DefaultConnection` | (Paste your Supabase connection string from Step 1.2) |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://0.0.0.0:$PORT` |

### 2.4 Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see a URL like: `https://riviera-os-api.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend

### 2.5 Run Database Migrations
1. In Render dashboard, go to your service
2. Click **Shell** tab
3. Run:
   ```bash
   cd backend
   dotnet ef database update
   ```
4. Verify migrations ran successfully

### 2.6 Test Backend
Open in browser: `https://riviera-os-api.onrender.com/api/venue/1/layout`

You should see JSON response with Hotel Coral Beach data.

---

## Step 3: Deploy Frontend to Render (5 minutes)

### 3.1 Create Static Site
1. In Render dashboard, click **New** → **Static Site**
2. Select repository: `AldiD12/RivieraOS`
3. Click **Connect**

### 3.2 Configure Static Site
Fill in the following settings:

**Basic Settings:**
- **Name:** `riviera-os-app`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`

### 3.3 Add Environment Variables
Click **Advanced** → **Add Environment Variable**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://riviera-os-api.onrender.com` (your backend URL from Step 2.4) |

### 3.4 Deploy
1. Click **Create Static Site**
2. Wait for deployment (3-5 minutes)
3. Once deployed, you'll see a URL like: `https://riviera-os-app.onrender.com`

### 3.5 Test Frontend
1. Open: `https://riviera-os-app.onrender.com`
2. You should see the Discovery Page with map
3. Test login:
   - Waiter PIN: `1111`
   - Admin Password: `admin123`

---

## Step 4: Verify Deployment (5 minutes)

### 4.1 Test Discovery Page
- [ ] Map loads with 3 venues (Hotel Coral Beach, Folie Beach Bar, Hotel Coral)
- [ ] Venue cards show photos and stats
- [ ] "View Details" links work

### 4.2 Test Login & Menu
- [ ] Login with PIN `1111` (Waiter role)
- [ ] Navigate to Menu page
- [ ] See drinks menu with photos
- [ ] Add items to cart
- [ ] Place order

### 4.3 Test Real-Time Updates
- [ ] Open Bar Display (KDS) in one tab
- [ ] Place order from Menu in another tab
- [ ] Order appears instantly in Bar Display (SignalR working)

### 4.4 Test Admin Dashboard
- [ ] Login with password `admin123` (Admin role)
- [ ] See sunbed layout map
- [ ] Click sunbeds to change status
- [ ] Verify real-time updates

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain to Render
1. In Render dashboard, go to your static site
2. Click **Settings** → **Custom Domains**
3. Add your domain (e.g., `app.rivieraos.com`)
4. Follow DNS instructions to point domain to Render

### 5.2 Update Backend CORS
If using custom domain, update `backend/Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://riviera-os-app.onrender.com",
            "https://app.rivieraos.com" // Add your custom domain
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify connection string is correct (port 6543 for pooling)
- Ensure migrations ran successfully

### Frontend can't connect to backend
- Verify `VITE_API_URL` environment variable is set correctly
- Check backend CORS settings allow frontend domain
- Test backend URL directly in browser

### SignalR not working
- Verify backend URL in `frontend/src/services/signalr.js`
- Check browser console for WebSocket errors
- Ensure backend is running and accessible

### Database connection errors
- Use **pooled connection** (port 6543) not direct connection (port 5432)
- Verify password is correct in connection string
- Check Supabase project is active

---

## Production Checklist

Before going live with real customers:

- [ ] Change default passwords in `DbInitializer.cs`
- [ ] Set up database backups in Supabase
- [ ] Enable SSL/HTTPS (automatic on Render)
- [ ] Set up monitoring/alerts in Render
- [ ] Test on mobile devices (4G/5G)
- [ ] Load test with multiple concurrent users
- [ ] Set up error logging (e.g., Sentry)
- [ ] Create admin user accounts for each venue
- [ ] Test all user flows end-to-end

---

## Cost Estimate

**Free Tier (Testing):**
- Supabase: Free (500MB database, 2GB bandwidth)
- Render Backend: Free (spins down after 15min inactivity)
- Render Frontend: Free
- **Total: $0/month**

**Production Tier:**
- Supabase: Free tier sufficient for 1-2 venues
- Render Backend: $7/month (Starter instance, always on)
- Render Frontend: Free
- **Total: $7/month**

**Scale Tier (5+ venues):**
- Supabase: $25/month (Pro plan, 8GB database)
- Render Backend: $25/month (Standard instance, 2GB RAM)
- Render Frontend: Free
- **Total: $50/month**

---

## Support

- **Documentation:** See `DEPLOYMENT.md` and `ARCHITECTURE.md`
- **GitHub:** https://github.com/AldiD12/RivieraOS
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Next Step:** Start with Step 1 - Create your Supabase project!
