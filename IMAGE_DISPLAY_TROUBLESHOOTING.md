# Image Display Troubleshooting

**Issue:** Product images not showing on SpotPage (customer menu)

---

## ✅ What's Working

1. **Backend Schema:** `PublicMenuItemDto` includes `imageUrl` field ✅
2. **Frontend Code:** SpotPage correctly renders images if `product.imageUrl` exists ✅
3. **Image Upload Component:** `ImageUpload.jsx` is implemented and working ✅
4. **Imgur Integration:** `imageUpload.js` utility is configured ✅

---

## ❌ What's Likely Wrong

### Most Likely: Products Don't Have Images Yet

**Problem:** Products in the database have `NULL` or empty `imageUrl` values.

**How to Check:**
1. Open BusinessAdminDashboard or SuperAdminDashboard
2. Go to "Menu Management" tab
3. Click "Edit" on any product
4. Check if "Product Image" field is empty

**Solution:** Add images to products!

---

## How to Add Images to Products

### Option 1: Upload via Imgur (Recommended)

1. **Open Dashboard** (Business Admin or SuperAdmin)
2. **Go to Menu Management tab**
3. **Click "Edit" on a product**
4. **In the "Product Image" section:**
   - Click "Choose File"
   - Select an image (max 10MB)
   - Click "Upload" button
   - Wait for upload to complete
   - URL will appear in the text field
5. **Click "Save"**
6. **Test:** Open SpotPage QR code and verify image shows

### Option 2: Paste Image URL

If you already have images hosted somewhere:

1. **Open Dashboard**
2. **Edit product**
3. **Paste image URL** directly into "Product Image" field
4. **Save**

**Good URL sources:**
- Your website
- Google Drive (public links)
- Unsplash (free stock photos)
- Imgur (after manual upload)

---

## Testing Image Display

### Test with Sample Product

1. **Create/Edit a test product**
2. **Use this test image URL:**
   ```
   https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800
   ```
   (This is a free cocktail image from Unsplash)

3. **Save product**
4. **Open SpotPage QR code**
5. **Verify image displays**

If the test image shows, then the system works - you just need to add images to your products!

---

## Common Issues & Fixes

### Issue 1: "Image not found" placeholder shows

**Cause:** Invalid or broken image URL

**Fix:**
- Check if URL is accessible (paste in browser)
- Make sure URL starts with `https://`
- Verify image hasn't been deleted from host

### Issue 2: Upload button doesn't work

**Cause:** Imgur Client ID not configured or rate limit exceeded

**Fix:**
1. Check if `VITE_IMGUR_CLIENT_ID` is set in `.env`
2. Default Client ID: `c2593243d3ea679` (should work)
3. If rate limited (12,500 uploads/day), wait 24 hours or get your own Client ID

**Get your own Imgur Client ID:**
1. Go to https://api.imgur.com/oauth2/addclient
2. Fill in:
   - Application name: Riviera OS
   - Authorization type: Anonymous usage
   - Email: your@email.com
3. Copy Client ID
4. Add to `frontend/.env`:
   ```
   VITE_IMGUR_CLIENT_ID=your_client_id_here
   ```

### Issue 3: Images show in dashboard but not on SpotPage

**Cause:** Backend not returning `imageUrl` in menu API

**Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Load SpotPage
4. Find request to `/api/public/Orders/menu?venueId=X`
5. Check response - do products have `imageUrl` field?

**If imageUrl is missing from API response:**
- This is a BACKEND issue
- Prof Kristi needs to ensure `PublicMenuItemDto` includes `imageUrl`
- Check backend `OrdersController.cs` - `GetPublicMenu` method

### Issue 4: CORS error in console

**Cause:** Image host blocking cross-origin requests

**Fix:**
- Use Imgur (no CORS issues)
- Or use images from same domain
- Or configure CORS on your image host

---

## Quick Win: Add Test Images Now

Want to see images immediately? Add these free stock photo URLs to your products:

**Cocktails:**
```
https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800
https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800
https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800
```

**Food:**
```
https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800
https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800
https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800
```

**Beer/Drinks:**
```
https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800
https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800
```

---

## Verification Checklist

- [ ] Open BusinessAdminDashboard
- [ ] Go to Menu Management tab
- [ ] Edit a product
- [ ] Add image URL (paste or upload)
- [ ] Save product
- [ ] Open SpotPage QR code
- [ ] Verify image displays
- [ ] Check browser console for errors (F12)

---

## Next Steps

1. **Add images to 2-3 test products** using Unsplash URLs above
2. **Test on SpotPage** - do images show?
3. **If YES:** System works! Add images to all products
4. **If NO:** Check browser console for errors and report back

---

## For Prof Kristi (Backend)

If images still don't show after adding URLs to products, verify:

1. **PublicMenuItemDto includes imageUrl:**
   ```csharp
   public class PublicMenuItemDto
   {
       public int Id { get; set; }
       public string Name { get; set; }
       public string Description { get; set; }
       public string ImageUrl { get; set; }  // ← Must be here
       public double Price { get; set; }
       // ... other fields
   }
   ```

2. **GetPublicMenu maps imageUrl:**
   ```csharp
   var products = await _context.Products
       .Where(p => p.CategoryId == category.Id && p.IsAvailable)
       .Select(p => new PublicMenuItemDto
       {
           Id = p.Id,
           Name = p.Name,
           Description = p.Description,
           ImageUrl = p.ImageUrl,  // ← Must be mapped
           Price = p.Price,
           // ... other fields
       })
       .ToListAsync();
   ```

3. **Products table has ImageUrl column:**
   ```sql
   SELECT TOP 5 Id, Name, ImageUrl FROM Products;
   ```

If any of these are missing, that's the issue!

---

## Summary

**Most likely cause:** Products don't have images yet - `imageUrl` is NULL in database.

**Quick fix:** Add test image URLs to products and verify they display.

**Long-term:** Use ImageUpload component to upload professional product photos via Imgur.
