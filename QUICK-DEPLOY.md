# ⚡ Quick Deploy Guide - Riviera OS

**Time to Production: ~20 minutes**

---

## 🎯 What You Need

1. **Supabase Account** (free) - https://supabase.com
2. **Render Account** (free) - https://render.com  
3. **GitHub Repository** ✅ Already done: https://github.com/AldiD12/RivieraOS

---

## 📋 3-Step Deployment

### Step 1️⃣: Database (Supabase) - 5 minutes

1. Go to https://supabase.com → **New Project**
2. Fill in:
   - Name: `riviera-os-production`
   - Password: (Generate & SAVE IT!)
   - Region: Frankfurt (closest to Albania)
3. Wait 2 minutes for project creation
4. Go to **Settings** → **Database** → **Connection pooling** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[PASSWORD]` with your actual password
7. **SAVE THIS STRING** - you'll need it next

---

### Step 2️⃣: Backend (Render) - 10 minutes

1. Go to https://render.com → **New** → **Web Service**
2. Connect GitHub → Select `AldiD12/RivieraOS`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `riviera-os-api` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Runtime** | `.NET` |
| **Build Command** | `chmod +x deploy-backend.sh && ./deploy-backend.sh` |
| **Start Command** | `cd backend && dotnet run --configuration Release --urls "http://0.0.0.0:$PORT"` |
| **Instance Type** | Free (or Starter $7/month) |

4. Click **Advanced** → Add Environment Variables:

| Key | Value |
|-----|-------|
| `ConnectionStrings__DefaultConnection` | (Paste your Supabase connection string) |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://0.0.0.0:$PORT` |

5. Click **Create Web Service**
6. Wait 5-10 minutes for deployment
7. Once live, copy your backend URL (e.g., `https://riviera-os-api.onrender.com`)
8. **SAVE THIS URL** - you'll need it for frontend

#### Run Migrations:
1. In Render dashboard, click **Shell** tab
2. Run:
   ```bash
   cd backend
   dotnet ef database update
   ```
3. You should see "Applying migration '20260126111338_InitialCreate'... Done."

---

### Step 3️⃣: Frontend (Render) - 5 minutes

1. In Render dashboard → **New** → **Static Site**
2. Select `AldiD12/RivieraOS`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `riviera-os-app` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

4. Click **Advanced** → Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | (Paste your backend URL from Step 2) |

5. Click **Create Static Site**
6. Wait 3-5 minutes for deployment
7. Once live, you'll get your app URL (e.g., `https://riviera-os-app.onrender.com`)

---

## ✅ Test Your Deployment

### Test 1: Discovery Page
1. Open your frontend URL
2. You should see a map with 3 venues
3. Click "View Details" on Hotel Coral Beach

### Test 2: Login & Menu
1. Click "Staff Login"
2. Enter PIN: `1111` (Waiter)
3. Navigate to Menu
4. Add drinks to cart
5. Place an order

### Test 3: Real-Time Updates
1. Open Bar Display (KDS) in one browser tab
2. Open Menu in another tab
3. Place an order from Menu
4. Order should appear INSTANTLY in Bar Display (SignalR working!)

### Test 4: Admin Dashboard
1. Login with password: `admin123`
2. See sunbed layout
3. Click sunbeds to change status
4. Verify updates appear in real-time

---

## 🎉 You're Live!

**Your URLs:**
- **Customer App:** `https://riviera-os-app.onrender.com`
- **Backend API:** `https://riviera-os-api.onrender.com`
- **Database:** Supabase (managed)

**Default Credentials:**
- Waiter PIN: `1111`
- Admin Password: `admin123`

**⚠️ IMPORTANT:** Change these passwords in production! Edit `backend/Data/DbInitializer.cs` and redeploy.

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify connection string has port `6543` (pooled connection)
- Ensure password in connection string is correct

### Frontend can't connect to backend
- Verify `VITE_API_URL` environment variable is set
- Check backend URL is accessible (open in browser)
- Look for CORS errors in browser console

### SignalR not working
- Check browser console for WebSocket errors
- Verify backend is running and accessible
- Test backend URL directly: `https://your-api.onrender.com/api/venue/1/layout`

### Database connection errors
- Use **pooled connection** (port 6543) not direct (port 5432)
- Verify password is correct
- Check Supabase project is active (not paused)

---

## 💰 Cost Breakdown

**Free Tier (Perfect for Testing):**
- Supabase: Free (500MB database)
- Render Backend: Free (spins down after 15min inactivity)
- Render Frontend: Free
- **Total: $0/month**

**Production Tier (Recommended):**
- Supabase: Free (sufficient for 1-2 venues)
- Render Backend: $7/month (always on, no spin-down)
- Render Frontend: Free
- **Total: $7/month**

---

## 📚 Next Steps

1. **Change Default Passwords** - Edit `backend/Data/DbInitializer.cs`
2. **Add Custom Domain** - Configure in Render settings
3. **Set Up Monitoring** - Enable alerts in Render
4. **Test on Mobile** - Verify 4G/5G performance
5. **Load Test** - Simulate peak August traffic

---

## 📖 Full Documentation

- **Detailed Deployment:** [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Design System:** [.kiro/steering/premium-design-system.md](./.kiro/steering/premium-design-system.md)

---

**Need Help?** Check the troubleshooting section or review the full deployment checklist.

**Ready to Scale?** See DEPLOYMENT-CHECKLIST.md for multi-venue setup and advanced configuration.
