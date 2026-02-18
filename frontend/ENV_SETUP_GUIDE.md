# Environment Variables Setup Guide

## Overview

This project uses **Vite** for building, which means environment variables use the `VITE_` prefix (not `REACT_APP_`).

## Files

- **`.env`** - Development environment (committed to git)
- **`.env.local`** - Local overrides (NOT committed to git) - create this for your local settings
- **`.env.production`** - Production environment (committed to git)

## Available Variables

### API Configuration

```env
# Backend API URL (without /api suffix)
VITE_API_URL=https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io
```

**Usage in code:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

### SuperAdmin Configuration

```env
# Single SuperAdmin
VITE_SUPERADMIN_EMAILS=superadmin@rivieraos.com

# Multiple SuperAdmins (comma-separated)
VITE_SUPERADMIN_EMAILS=superadmin@rivieraos.com,admin@rivieraos.com,sysadmin@rivieraos.com
```

**Usage in code:**
```javascript
const SUPERADMIN_EMAILS = (import.meta.env.VITE_SUPERADMIN_EMAILS || 'superadmin@rivieraos.com')
  .split(',')
  .map(e => e.trim());
```

### App Configuration

```env
VITE_APP_ENV=development
VITE_APP_NAME=Riviera Discovery Platform
```

## How to Use

### For Development

1. The `.env` file is already configured with default values
2. If you need local overrides, create `.env.local`:
   ```bash
   cp frontend/.env frontend/.env.local
   ```
3. Edit `.env.local` with your local settings
4. `.env.local` is gitignored and won't be committed

### For Production

1. The `.env.production` file is used automatically when building for production
2. Update values in `.env.production` as needed
3. This file IS committed to git

### Adding New SuperAdmins

**Option 1: Environment Variable (Recommended)**
```env
# In .env or .env.production
VITE_SUPERADMIN_EMAILS=superadmin@rivieraos.com,newadmin@rivieraos.com
```

**Option 2: Local Override**
```env
# In .env.local (not committed)
VITE_SUPERADMIN_EMAILS=superadmin@rivieraos.com,myemail@company.com
```

## Important Notes

### Vite vs Create React App

- ❌ **DON'T USE:** `process.env.REACT_APP_*`
- ✅ **USE:** `import.meta.env.VITE_*`

### Restart Required

After changing environment variables, you must restart the dev server:
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Build Time Variables

Environment variables are embedded at **build time**, not runtime. This means:
- Changing `.env` requires rebuilding the app
- Variables are visible in the browser (don't put secrets here!)
- Use backend environment variables for sensitive data

## Example: Local Development Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Create local environment file
cp .env .env.local

# 3. Edit with your settings
nano .env.local

# Add your email for SuperAdmin access:
VITE_SUPERADMIN_EMAILS=superadmin@rivieraos.com,youremail@company.com

# 4. Restart dev server
npm run dev
```

## Troubleshooting

### "Environment variable not working"

1. Check the prefix is `VITE_` not `REACT_APP_`
2. Restart the dev server
3. Check the variable is defined in `.env` or `.env.local`
4. Use `import.meta.env.VITE_*` not `process.env.REACT_APP_*`

### "SuperAdmin access denied"

1. Check your email is in `VITE_SUPERADMIN_EMAILS`
2. Restart the dev server after changing `.env`
3. Check browser console for verification logs
4. Ensure no extra spaces in email list

### "API URL not working"

1. Check `VITE_API_URL` is set correctly
2. Don't include `/api` suffix (it's added in the code)
3. Restart dev server after changes

## Security Best Practices

✅ **DO:**
- Use `.env.local` for personal/sensitive overrides
- Keep `.env` and `.env.production` with safe defaults
- Document all environment variables

❌ **DON'T:**
- Put API keys or secrets in environment variables (they're visible in browser!)
- Commit `.env.local` to git
- Use environment variables for runtime configuration

## Reference

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- Project uses Vite, not Create React App
- All variables must start with `VITE_` to be exposed to the app
