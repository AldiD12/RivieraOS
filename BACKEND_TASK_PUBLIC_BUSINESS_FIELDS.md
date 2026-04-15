# 🔧 Backend Task: Expose Business-Level Fields in Public Venues API

## Priority: HIGH 🔴
## Date: April 15, 2026

---

## Problem

The frontend **Review Page** and **QR Landing Page** need access to business-level fields (`reviewLink`, `brandName`) to function correctly. Currently:

- `/api/public/Venues` returns `businessId` and `businessName` ✅ but **NOT** `reviewLink` or `brandName` ❌
- `/api/Businesses/{id}` returns everything we need ✅ but requires **authentication (401)** ❌
- `/api/public/Venues/{id}` doesn't even return `businessId` ❌

This means:
1. When a customer scans the QR code, we show the **venue name** (e.g., "Plazhi", "Bari") instead of the **business brand name** (e.g., "Hotel Coral Beach", "Libraria Bar")
2. When a customer gives a 4-5 star review, we **cannot redirect them** to the business's Google Review page because `reviewLink` is locked behind auth

---

## What We Need

### Option A (Preferred — Minimal Change)

Add these 2 fields to the **`PublicVenueListItemDto`** (used by `GET /api/public/Venues`):

```csharp
// Already exists:
public int BusinessId { get; set; }
public string BusinessName { get; set; }       // This is registeredName
public string BusinessPhoneNumber { get; set; }

// ADD THESE:
public string BusinessBrandName { get; set; }   // From Business.BrandName
public string BusinessReviewLink { get; set; }  // From Business.ReviewLink
```

And also add `businessId` to the **`PublicVenueDetailDto`** (used by `GET /api/public/Venues/{id}`):

```csharp
// Currently missing from this DTO:
public int BusinessId { get; set; }
public string BusinessName { get; set; }
public string BusinessBrandName { get; set; }
public string BusinessReviewLink { get; set; }
```

### Option B (Alternative — New Public Endpoint)

Create a new public endpoint:

```
GET /api/public/Businesses/{id}
```

That returns a limited public DTO:

```csharp
public class PublicBusinessDto
{
    public int Id { get; set; }
    public string BrandName { get; set; }
    public string RegisteredName { get; set; }
    public string ReviewLink { get; set; }
    public string GoogleMapsAddress { get; set; }
    public string PhoneNumber { get; set; }
    public string LogoUrl { get; set; }
}
```

---

## Why This Matters

### QR Scan Flow
Customer scans QR → sees **"Plazhi"** (venue name) instead of **"Hotel Coral Beach"** (business brand). This is confusing and looks broken.

### Review Flow  
Customer gives 5 stars → we want to redirect them to the business's Google Review link (`reviewLink` field from business creation) → but we **can't access it** because it's behind auth → so the redirect fails silently and nothing happens.

### The Review Shield Logic
- ⭐ 1-3 stars → Feedback saved privately to our dashboard (working ✅)
- ⭐ 4-5 stars → Redirect to business `reviewLink` for public Google review (BROKEN ❌ because `reviewLink` is 401-locked)

---

## Summary of Fields Needed in Public API

| Field | Currently Available Publicly? | Where It's Needed |
|-------|------|------|
| `businessId` | ✅ in `/public/Venues` list, ❌ in `/public/Venues/{id}` | QR Landing, Review Page |
| `businessName` | ✅ in `/public/Venues` list | QR Landing, Review Page |
| `brandName` | ❌ locked behind auth | QR Landing (hero title) |
| `reviewLink` | ❌ locked behind auth | Review Page (4-5 star redirect) |

---

## Once Done

Tell Aldi when deployed and the frontend will automatically pick up these fields. No frontend changes needed — the code is already written to check for `businessBrandName` and `reviewLink`, it just gets `null` because the API doesn't expose them publicly yet.
