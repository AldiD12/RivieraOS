# Business-Level Menu System - Backend Requirements

## Overview

The current menu system is venue-based, but the business requirement is that **all venues within a business should share the same menu**. This document outlines the backend changes needed to implement business-level menu management.

## Current Problem

- Categories are tied to venues: `/api/superadmin/venues/{venueId}/Categories`
- Products are tied to categories: `/api/superadmin/categories/{categoryId}/Products`
- This forces users to create venues before managing menus
- Each venue has separate categories/products instead of sharing them

## Required Solution

**Business-Level Menu System**: Categories should be tied to businesses, not venues. All venues within a business automatically share the same menu.

---

## New API Endpoints Required

### 1. Business-Level Category Management

#### GET /api/superadmin/businesses/{businessId}/Categories
- **Purpose**: Get all categories for a business
- **Response**: Array of category objects
- **Logic**: Return all categories that belong to the specified business

#### POST /api/superadmin/businesses/{businessId}/Categories
- **Purpose**: Create a new category for a business
- **Request Body**: Category data (name, description, sortOrder, isActive)
- **Response**: Created category object
- **Logic**: Create category associated with the business (not a specific venue)

#### GET /api/superadmin/businesses/{businessId}/Categories/{categoryId}
- **Purpose**: Get specific category details for a business
- **Response**: Category object
- **Logic**: Return category if it belongs to the specified business

#### PUT /api/superadmin/businesses/{businessId}/Categories/{categoryId}
- **Purpose**: Update a business category
- **Request Body**: Updated category data
- **Response**: Updated category object
- **Logic**: Update category if it belongs to the specified business

#### DELETE /api/superadmin/businesses/{businessId}/Categories/{categoryId}
- **Purpose**: Delete a business category
- **Response**: Success confirmation
- **Logic**: Delete category and all associated products if it belongs to the business

---

## Database Schema Changes

### Current Schema
```
Categories Table:
- Id (Primary Key)
- VenueId (Foreign Key to Venues)
- Name
- Description
- SortOrder
- IsActive
```

### Required Schema
```
Categories Table:
- Id (Primary Key)
- BusinessId (Foreign Key to Businesses) ← NEW
- VenueId (Foreign Key to Venues) ← Make NULLABLE for backward compatibility
- Name
- Description
- SortOrder
- IsActive
```

### Migration Strategy
1. Add `BusinessId` column to Categories table (nullable initially)
2. Update existing categories to set `BusinessId` based on their venue's business
3. Create new business-level categories with `BusinessId` and `VenueId = null`
4. Keep venue-level categories for backward compatibility (if needed)

---

## API Logic Changes

### Category Retrieval Logic
```csharp
// For business-level categories
public async Task<List<Category>> GetCategoriesByBusiness(int businessId)
{
    return await _context.Categories
        .Where(c => c.BusinessId == businessId)
        .OrderBy(c => c.SortOrder)
        .ToListAsync();
}
```

### Category Creation Logic
```csharp
// For business-level categories
public async Task<Category> CreateCategoryForBusiness(int businessId, CreateCategoryDto dto)
{
    var category = new Category
    {
        BusinessId = businessId,
        VenueId = null, // Business-level categories don't belong to specific venues
        Name = dto.Name,
        Description = dto.Description,
        SortOrder = dto.SortOrder,
        IsActive = dto.IsActive
    };
    
    _context.Categories.Add(category);
    await _context.SaveChangesAsync();
    return category;
}
```

---

## Frontend Integration

### Current Frontend Code (Updated)
The frontend has been updated to use the new business-level APIs:

```javascript
// New API calls in superAdminApi.js
categoryApi.getByBusiness(businessId)
categoryApi.createForBusiness(businessId, categoryData)
categoryApi.updateForBusiness(businessId, categoryId, categoryData)
categoryApi.deleteForBusiness(businessId, categoryId)

// Updated functions in SuperAdminDashboard.jsx
fetchBusinessCategories(businessId)
handleCreateCategory() // Now uses selectedBusiness instead of selectedVenue
handleUpdateCategory() // Now uses selectedBusiness instead of selectedVenue
handleDeleteCategory() // Now uses selectedBusiness instead of selectedVenue
```

### Menu Flow (Updated)
1. **Select Business** → 2. **Manage Categories** → 3. **Manage Products**
   - ❌ **Removed**: Venue selection step
   - ✅ **Added**: Business-level menu notice
   - ✅ **Added**: Direct category management

---

## Benefits of Business-Level Menu System

1. **Simplified Workflow**: No need to create venues before managing menus
2. **Consistent Menus**: All venues automatically share the same menu
3. **Easier Management**: Single place to manage menu for entire business
4. **Better UX**: Clearer mental model for business owners
5. **Scalable**: Easy to add new venues without menu duplication

---

## Implementation Priority

### Phase 1: Core Business-Level APIs ⭐ **HIGH PRIORITY**
- [ ] Add `BusinessId` column to Categories table
- [ ] Implement `GET /api/superadmin/businesses/{businessId}/Categories`
- [ ] Implement `POST /api/superadmin/businesses/{businessId}/Categories`
- [ ] Implement `PUT /api/superadmin/businesses/{businessId}/Categories/{categoryId}`
- [ ] Implement `DELETE /api/superadmin/businesses/{businessId}/Categories/{categoryId}`

### Phase 2: Data Migration (if needed)
- [ ] Migrate existing venue-level categories to business-level
- [ ] Update existing products to work with new category structure

### Phase 3: Testing & Validation
- [ ] Test all CRUD operations for business-level categories
- [ ] Verify products still work correctly with new category structure
- [ ] Test SuperAdmin dashboard integration

---

## Testing Checklist

### API Testing
- [ ] Create business-level category
- [ ] Get all categories for a business
- [ ] Update business-level category
- [ ] Delete business-level category
- [ ] Verify products still work with business-level categories

### Frontend Integration Testing
- [ ] SuperAdmin can create categories without creating venues first
- [ ] Categories appear immediately after creation
- [ ] Category updates work correctly
- [ ] Category deletion works correctly
- [ ] Products can be added to business-level categories

### Edge Cases
- [ ] Handle businesses with no categories
- [ ] Handle category deletion with existing products
- [ ] Verify proper error handling for invalid business IDs
- [ ] Test permissions (only SuperAdmin can manage business categories)

---

## Current Status

✅ **Frontend**: Updated to use business-level category APIs
❌ **Backend**: Needs implementation of new business-level endpoints
❌ **Database**: Needs schema changes for BusinessId in Categories table

The frontend is ready and waiting for the backend implementation!