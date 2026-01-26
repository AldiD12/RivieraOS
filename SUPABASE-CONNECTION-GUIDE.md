# 🔌 How to Get Supabase Pooled Connection String

**Why Pooled?** The pooled connection (port 6543) is optimized for serverless environments like Render. It handles connection limits better than direct connections (port 5432).

---

## Step-by-Step Guide

### Step 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **"New Project"** (green button)
3. Fill in the form:
   - **Name:** `riviera-os-production` (or any name you like)
   - **Database Password:** Click "Generate a password" or create your own
   - **⚠️ CRITICAL:** Copy and save this password immediately! You'll need it later.
   - **Region:** Select **Frankfurt (eu-central-1)** - closest to Albania
   - **Pricing Plan:** Free (default)
4. Click **"Create new project"**
5. Wait ~2 minutes while Supabase sets up your database

---

### Step 2: Navigate to Database Settings

Once your project is created:

1. In the left sidebar, click **"Settings"** (gear icon at bottom)
2. Click **"Database"** in the settings menu
3. Scroll down to the **"Connection string"** section

---

### Step 3: Get the POOLED Connection String

**IMPORTANT:** There are TWO types of connection strings. You need the **POOLED** one!

In the "Connection string" section, you'll see tabs:

```
┌─────────────┬──────────────────┬────────┐
│ URI         │ Connection pooling │ JDBC  │
└─────────────┴──────────────────┴────────┘
```

1. Click the **"Connection pooling"** tab (middle tab)
2. You'll see a connection string that looks like this:

```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Key indicators you have the RIGHT connection string:**
- ✅ Contains `.pooler.supabase.com` (the word "pooler")
- ✅ Port is `6543` (not 5432)
- ✅ Contains `[YOUR-PASSWORD]` placeholder

---

### Step 4: Replace the Password Placeholder

The connection string has `[YOUR-PASSWORD]` in it. You need to replace this with your actual database password from Step 1.

**Example:**

**Before (what you see in Supabase):**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**After (what you use in Render):**
```
postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**⚠️ Important:** 
- No spaces around the password
- No brackets `[]` around the password
- Just replace `[YOUR-PASSWORD]` with your actual password

---

### Step 5: Copy the Complete Connection String

1. Click the **"Copy"** button next to the connection string
2. Paste it into a text editor (Notepad, VS Code, etc.)
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Copy the complete string
5. **Save it somewhere safe** - you'll paste this into Render

---

## Visual Reference

Here's what you're looking for in the Supabase dashboard:

```
Settings → Database → Connection string

┌─────────────────────────────────────────────────────────┐
│ Connection string                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [ URI ]  [ Connection pooling ]  [ JDBC ]              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ postgresql://postgres.xxxxx:[YOUR-PASSWORD]@   │    │
│  │ aws-0-eu-central-1.pooler.supabase.com:6543/   │ 📋 │
│  │ postgres                                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ⚠️ Mode: Transaction                                   │
│  Port: 6543 (pooled connection)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

❌ **Wrong Tab:** Using "URI" tab instead of "Connection pooling" tab
- URI tab gives you port 5432 (direct connection)
- You need port 6543 (pooled connection)

❌ **Forgot to Replace Password:** Leaving `[YOUR-PASSWORD]` in the string
- Render will fail to connect
- You must replace it with your actual password

❌ **Lost Password:** Can't find the password you created
- Solution: Reset the database password in Settings → Database → "Reset database password"
- You'll get a new password to use

❌ **Wrong Region:** Selected a region far from Albania
- Not critical, but will add latency
- Frankfurt (eu-central-1) is closest to Albania

---

## Troubleshooting

### "I can't find the Connection pooling tab"

Make sure you're in the right place:
1. Left sidebar → **Settings** (gear icon)
2. Settings menu → **Database**
3. Scroll down to **"Connection string"** section
4. Look for tabs above the connection string box

### "I forgot my database password"

1. Go to **Settings** → **Database**
2. Scroll to **"Reset database password"**
3. Click **"Generate new password"**
4. Copy the new password
5. Update your connection string with the new password

### "The connection string doesn't have [YOUR-PASSWORD]"

If you see the actual password already filled in:
- Great! Supabase sometimes auto-fills it
- Just copy the entire string as-is
- No need to replace anything

### "Should I use Transaction or Session mode?"

The connection string shows "Mode: Transaction" or "Mode: Session":
- **Transaction mode** (default) - ✅ Use this for Riviera OS
- **Session mode** - Not needed for this project
- You can change this in Settings → Database → Connection pooling mode

---

## What to Do Next

Once you have your pooled connection string:

1. ✅ Verify it contains `.pooler.supabase.com`
2. ✅ Verify port is `6543`
3. ✅ Verify password is replaced (no `[YOUR-PASSWORD]`)
4. ✅ Copy the complete string
5. ➡️ Go to Render.com and follow Step 2 in QUICK-DEPLOY.md
6. ➡️ Paste this string as the `ConnectionStrings__DefaultConnection` environment variable

---

## Example Connection Strings

**✅ CORRECT (Pooled - Port 6543):**
```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**❌ WRONG (Direct - Port 5432):**
```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-eu-central-1.supabase.com:5432/postgres
```

**Key Difference:** 
- ✅ `.pooler.supabase.com:6543` (pooled)
- ❌ `.supabase.com:5432` (direct)

---

## Security Note

🔒 **Keep this connection string SECRET!**
- Never commit it to GitHub
- Never share it publicly
- Only paste it into Render's environment variables (which are encrypted)
- If exposed, reset your database password immediately

---

## Need Help?

If you're still stuck:
1. Take a screenshot of your Supabase Database settings page
2. Make sure to hide/blur the password and connection string
3. Check that you're on the "Connection pooling" tab
4. Verify your project is fully created (not still setting up)

---

**Next Step:** Once you have your connection string, go back to **QUICK-DEPLOY.md** and continue with Step 2 (Deploy Backend to Render).
