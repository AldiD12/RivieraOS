# 🚀 Riviera Frontend Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: GitHub + Vercel (Automatic)
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. **Your app will be live at:** `https://your-app-name.vercel.app`

### Option 2: Direct Upload
1. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Drag & drop the `dist` folder
   - Your app goes live instantly!

## Alternative: Netlify Deploy

### Drag & Drop Method
1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area
   - Get instant live URL

## Alternative: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "homepage": "https://yourusername.github.io/your-repo-name",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## 🔧 Environment Setup

Your app is configured to use:
- **Production API:** Azure BlackBear API
- **Development API:** Local API (localhost:5171)
- **Fallback:** Mock data if APIs are unavailable

## 🎯 What You Get

Once deployed, your live app will have:
- **Discovery Page** - Luxury venue discovery
- **QR Menu System** - Complete ordering flow
- **Staff Dashboards** - Bar, Beach Commander, Admin panels
- **Mobile App** - Day/Night mode discovery
- **Real-time Features** - Live updates via SignalR
- **Azure API Integration** - Connected to professor's cloud API

## 📱 Mobile-Friendly

Your app is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets
- QR code scanning

## 🔗 Custom Domain (Optional)

After deployment, you can add a custom domain:
- **Vercel:** Project Settings → Domains
- **Netlify:** Site Settings → Domain Management
- **GitHub Pages:** Repository Settings → Pages

## 🚀 Ready to Deploy?

Your frontend is production-ready with:
- ✅ Azure API integration
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Professional UI/UX
- ✅ Real-time features

Choose your deployment method and go live! 🎉