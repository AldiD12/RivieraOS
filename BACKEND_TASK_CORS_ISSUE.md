# 🔧 Backend Task: Fix CORS Policy for `xixa.app` Domain

## Priority: CRITICAL 🔴
## Date: April 15, 2026

---

## Problem
The frontend application (`https://xixa.app`) is completely failing to load data because the backend API is rejecting its requests due to CORS (Cross-Origin Resource Sharing) restrictions.

**Error shown in the browser console:**
```
Access to fetch at 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues' from origin 'https://xixa.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means the backend is blocking requests coming from our production domain (`https://xixa.app`). The frontend is completely broken for users visiting `xixa.app`.

---

## What We Need

You need to update the backend CORS configuration to explicitly allow requests from our production domains. 

In your `Program.cs` or `Startup.cs` file (where CORS is configured), make sure to add `https://xixa.app` (and its `www` variant) to the allowed origins.

**Example Fix (C#):**
```csharp
app.UseCors(builder => builder
    .WithOrigins(
        "http://localhost:5173", // Local development
        "https://xixa.app",      // Production domain 1
        "https://www.xixa.app"   // Production domain 2
        // add any other Vercel preview domains if necessary
    )
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
);
```

Or, if you are currently using `.AllowAnyOrigin()` but missing headers, please ensure the CORS middleware is placed correctly in the request pipeline (usually before `UseAuthorization` and `UseEndpoints`).

---

## Why This Matters
Without this fix, the browser's security mechanism blocks the frontend from reading any responses from the API, causing a completely blank or crashed app for the end-users on `xixa.app`.

Please deploy this fix urgently so the live app can start communicating with the backend again!
