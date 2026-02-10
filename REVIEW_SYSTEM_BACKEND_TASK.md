# Review System Backend Implementation

**For:** Prof Kristi (Backend Developer)  
**Priority:** Medium (Post-MVP, but good for launch)  
**Status:** Not Started  

---

## Overview

Implement a "Review Shield" system where customers can rate their experience. High ratings (4-5 stars) redirect to Google Maps for public reviews, while low ratings (1-3 stars) are captured internally for improvement.

---

## Business Logic: Review Shield

**Purpose:** Protect public reputation while capturing honest feedback

**Flow:**
1. Customer completes visit (order or booking)
2. Receives review link: `/review/{venueId}`
3. Selects star rating (1-5)
4. **If 4-5 stars:** Redirect to Google Maps review page
5. **If 1-3 stars:** Show internal feedback form, send WhatsApp alert to manager

---

## Database Schema

### Review Entity

**Table:** `feedback_reviews`

```csharp
public class Review
{
    public int Id { get; set; }
    
    // Relationships
    public int VenueId { get; set; }
    public Venue Venue { get; set; }
    
    public int? UserId { get; set; }  // Nullable for guest reviews
    public User? User { get; set; }
    
    public int? OrderId { get; set; }  // Link to order if applicable
    public Order? Order { get; set; }
    
    public int? BookingId { get; set; }  // Link to booking if applicable
    public ZoneUnitBooking? Booking { get; set; }
    
    // Review Data
    public int Rating { get; set; }  // 1-5 stars (required)
    public string? Comment { get; set; }  // Text feedback (optional)
    public string? CustomerName { get; set; }  // For guest reviews
    public string? CustomerEmail { get; set; }  // For follow-up
    
    // Metadata
    public bool IsPublic { get; set; }  // 4-5 stars = true, 1-3 stars = false
    public bool RedirectedToGoogle { get; set; }  // Track if sent to Google
    public bool AlertSent { get; set; }  // Track if manager was notified
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

### Migration

```csharp
public partial class AddReviewSystem : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "feedback_reviews",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                VenueId = table.Column<int>(nullable: false),
                UserId = table.Column<int>(nullable: true),
                OrderId = table.Column<int>(nullable: true),
                BookingId = table.Column<int>(nullable: true),
                Rating = table.Column<int>(nullable: false),
                Comment = table.Column<string>(maxLength: 1000, nullable: true),
                CustomerName = table.Column<string>(maxLength: 100, nullable: true),
                CustomerEmail = table.Column<string>(maxLength: 255, nullable: true),
                IsPublic = table.Column<bool>(nullable: false, defaultValue: false),
                RedirectedToGoogle = table.Column<bool>(nullable: false, defaultValue: false),
                AlertSent = table.Column<bool>(nullable: false, defaultValue: false),
                CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                UpdatedAt = table.Column<DateTime>(nullable: true),
                IsDeleted = table.Column<bool>(nullable: false, defaultValue: false),
                DeletedAt = table.Column<DateTime>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_feedback_reviews", x => x.Id);
                table.ForeignKey(
                    name: "FK_feedback_reviews_catalog_venues_VenueId",
                    column: x => x.VenueId,
                    principalTable: "catalog_venues",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_feedback_reviews_core_users_UserId",
                    column: x => x.UserId,
                    principalTable: "core_users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_feedback_reviews_orders_orders_OrderId",
                    column: x => x.OrderId,
                    principalTable: "orders_orders",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_feedback_reviews_catalog_zone_unit_bookings_BookingId",
                    column: x => x.BookingId,
                    principalTable: "catalog_zone_unit_bookings",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_VenueId",
            table: "feedback_reviews",
            column: "VenueId");

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_UserId",
            table: "feedback_reviews",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_OrderId",
            table: "feedback_reviews",
            column: "OrderId");

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_BookingId",
            table: "feedback_reviews",
            column: "BookingId");

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_Rating",
            table: "feedback_reviews",
            column: "Rating");

        migrationBuilder.CreateIndex(
            name: "IX_feedback_reviews_CreatedAt",
            table: "feedback_reviews",
            column: "CreatedAt");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "feedback_reviews");
    }
}
```

---

## API Endpoints

### Public Controller: ReviewsController

**Location:** `Controllers/Public/ReviewsController.cs`

#### 1. Submit Review (Public)

```csharp
[HttpPost]
[Route("api/public/venues/{venueId}/reviews")]
public async Task<IActionResult> SubmitReview(int venueId, [FromBody] SubmitReviewDto dto)
{
    // Validate venue exists
    var venue = await _context.Venues
        .FirstOrDefaultAsync(v => v.Id == venueId && v.IsActive && !v.IsDeleted);
    
    if (venue == null)
        return NotFound("Venue not found");
    
    // Validate rating (1-5)
    if (dto.Rating < 1 || dto.Rating > 5)
        return BadRequest("Rating must be between 1 and 5");
    
    // Create review
    var review = new Review
    {
        VenueId = venueId,
        Rating = dto.Rating,
        Comment = dto.Comment,
        CustomerName = dto.CustomerName,
        CustomerEmail = dto.CustomerEmail,
        OrderId = dto.OrderId,
        BookingId = dto.BookingId,
        IsPublic = dto.Rating >= 4,  // 4-5 stars are public
        RedirectedToGoogle = dto.Rating >= 4,
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Reviews.Add(review);
    await _context.SaveChangesAsync();
    
    // Send alert for low ratings (1-3 stars)
    if (dto.Rating < 4)
    {
        await SendLowRatingAlert(venue, review);
        review.AlertSent = true;
        await _context.SaveChangesAsync();
    }
    
    // Return response with redirect info
    return Ok(new
    {
        reviewId = review.Id,
        shouldRedirectToGoogle = review.RedirectedToGoogle,
        googleMapsUrl = review.RedirectedToGoogle 
            ? GetGoogleMapsReviewUrl(venue) 
            : null,
        message = review.RedirectedToGoogle
            ? "Thank you! Please share your experience on Google."
            : "Thank you for your feedback. We'll work to improve."
    });
}

// Helper: Get Google Maps review URL
private string GetGoogleMapsReviewUrl(Venue venue)
{
    // If venue has Google Place ID, use it
    if (!string.IsNullOrEmpty(venue.GooglePlaceId))
    {
        return $"https://search.google.com/local/writereview?placeid={venue.GooglePlaceId}";
    }
    
    // Otherwise, use search URL
    var searchQuery = Uri.EscapeDataString($"{venue.Name} {venue.Address}");
    return $"https://www.google.com/search?q={searchQuery}";
}

// Helper: Send low rating alert
private async Task SendLowRatingAlert(Venue venue, Review review)
{
    // TODO: Implement WhatsApp/Email notification
    // For now, just log
    _logger.LogWarning(
        "Low rating alert: Venue {VenueId} received {Rating} stars. Comment: {Comment}",
        venue.Id, review.Rating, review.Comment);
    
    // Future: Send WhatsApp message to business owner
    // await _whatsAppService.SendMessage(venue.Business.PhoneNumber, 
    //     $"⚠️ Low rating alert: {review.Rating} stars at {venue.Name}");
}
```

**DTO:**
```csharp
public class SubmitReviewDto
{
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }
    
    [MaxLength(1000)]
    public string? Comment { get; set; }
    
    [MaxLength(100)]
    public string? CustomerName { get; set; }
    
    [EmailAddress]
    [MaxLength(255)]
    public string? CustomerEmail { get; set; }
    
    public int? OrderId { get; set; }
    public int? BookingId { get; set; }
}
```

---

#### 2. Get Public Reviews (Public)

```csharp
[HttpGet]
[Route("api/public/venues/{venueId}/reviews")]
public async Task<IActionResult> GetReviews(
    int venueId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    // Only return public reviews (4-5 stars)
    var reviews = await _context.Reviews
        .Where(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted)
        .OrderByDescending(r => r.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(r => new
        {
            id = r.Id,
            rating = r.Rating,
            comment = r.Comment,
            customerName = r.CustomerName ?? "Anonymous",
            createdAt = r.CreatedAt
        })
        .ToListAsync();
    
    var totalCount = await _context.Reviews
        .CountAsync(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted);
    
    var averageRating = await _context.Reviews
        .Where(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted)
        .AverageAsync(r => (double?)r.Rating) ?? 0;
    
    return Ok(new
    {
        reviews,
        totalCount,
        averageRating = Math.Round(averageRating, 1),
        page,
        pageSize,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
}
```

---

#### 3. Get Venue Rating Summary (Public)

```csharp
[HttpGet]
[Route("api/public/venues/{venueId}/rating")]
public async Task<IActionResult> GetRatingSummary(int venueId)
{
    var reviews = await _context.Reviews
        .Where(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted)
        .ToListAsync();
    
    if (!reviews.Any())
    {
        return Ok(new
        {
            averageRating = 0,
            totalReviews = 0,
            distribution = new { star5 = 0, star4 = 0, star3 = 0, star2 = 0, star1 = 0 }
        });
    }
    
    return Ok(new
    {
        averageRating = Math.Round(reviews.Average(r => r.Rating), 1),
        totalReviews = reviews.Count,
        distribution = new
        {
            star5 = reviews.Count(r => r.Rating == 5),
            star4 = reviews.Count(r => r.Rating == 4),
            star3 = reviews.Count(r => r.Rating == 3),
            star2 = reviews.Count(r => r.Rating == 2),
            star1 = reviews.Count(r => r.Rating == 1)
        }
    });
}
```

---

### Business Controller: ReviewsController

**Location:** `Controllers/Business/ReviewsController.cs`

#### 1. Get All Reviews (Including Private)

```csharp
[HttpGet]
[Route("api/business/venues/{venueId}/reviews")]
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetAllReviews(
    int venueId,
    [FromQuery] int? minRating = null,
    [FromQuery] int? maxRating = null,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    var businessId = _currentUserService.BusinessId;
    if (!businessId.HasValue)
        return Forbid();
    
    // Verify venue belongs to business
    var venue = await _context.Venues
        .FirstOrDefaultAsync(v => v.Id == venueId && v.BusinessId == businessId.Value);
    
    if (venue == null)
        return NotFound();
    
    var query = _context.Reviews
        .Where(r => r.VenueId == venueId && !r.IsDeleted);
    
    if (minRating.HasValue)
        query = query.Where(r => r.Rating >= minRating.Value);
    
    if (maxRating.HasValue)
        query = query.Where(r => r.Rating <= maxRating.Value);
    
    var reviews = await query
        .OrderByDescending(r => r.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(r => new
        {
            id = r.Id,
            rating = r.Rating,
            comment = r.Comment,
            customerName = r.CustomerName,
            customerEmail = r.CustomerEmail,
            isPublic = r.IsPublic,
            alertSent = r.AlertSent,
            createdAt = r.CreatedAt,
            orderId = r.OrderId,
            bookingId = r.BookingId
        })
        .ToListAsync();
    
    var totalCount = await query.CountAsync();
    
    return Ok(new
    {
        reviews,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
}
```

---

#### 2. Get Review Statistics

```csharp
[HttpGet]
[Route("api/business/venues/{venueId}/reviews/stats")]
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetReviewStats(int venueId)
{
    var businessId = _currentUserService.BusinessId;
    if (!businessId.HasValue)
        return Forbid();
    
    var venue = await _context.Venues
        .FirstOrDefaultAsync(v => v.Id == venueId && v.BusinessId == businessId.Value);
    
    if (venue == null)
        return NotFound();
    
    var allReviews = await _context.Reviews
        .Where(r => r.VenueId == venueId && !r.IsDeleted)
        .ToListAsync();
    
    var publicReviews = allReviews.Where(r => r.IsPublic).ToList();
    var privateReviews = allReviews.Where(r => !r.IsPublic).ToList();
    
    return Ok(new
    {
        total = allReviews.Count,
        public = publicReviews.Count,
        private = privateReviews.Count,
        averageRating = allReviews.Any() 
            ? Math.Round(allReviews.Average(r => r.Rating), 1) 
            : 0,
        publicAverageRating = publicReviews.Any()
            ? Math.Round(publicReviews.Average(r => r.Rating), 1)
            : 0,
        distribution = new
        {
            star5 = allReviews.Count(r => r.Rating == 5),
            star4 = allReviews.Count(r => r.Rating == 4),
            star3 = allReviews.Count(r => r.Rating == 3),
            star2 = allReviews.Count(r => r.Rating == 2),
            star1 = allReviews.Count(r => r.Rating == 1)
        },
        recentLowRatings = allReviews
            .Where(r => r.Rating < 4)
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .Select(r => new
            {
                rating = r.Rating,
                comment = r.Comment,
                createdAt = r.CreatedAt
            })
    });
}
```

---

## Optional: Add GooglePlaceId to Venue

To enable direct Google review links, add this field to Venue entity:

```csharp
public class Venue
{
    // ... existing fields ...
    
    public string? GooglePlaceId { get; set; }  // e.g., "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

**Migration:**
```csharp
migrationBuilder.AddColumn<string>(
    name: "GooglePlaceId",
    table: "catalog_venues",
    maxLength: 255,
    nullable: true);
```

---

## Testing

### Test 1: High Rating (4-5 stars)
1. POST `/api/public/venues/1/reviews` with rating=5
2. Should return `shouldRedirectToGoogle: true`
3. Should return Google Maps URL
4. Review should be marked as `IsPublic: true`

### Test 2: Low Rating (1-3 stars)
1. POST `/api/public/venues/1/reviews` with rating=2
2. Should return `shouldRedirectToGoogle: false`
3. Should log alert (check logs)
4. Review should be marked as `IsPublic: false`

### Test 3: Get Public Reviews
1. GET `/api/public/venues/1/reviews`
2. Should only return 4-5 star reviews
3. Should not include 1-3 star reviews

### Test 4: Manager View All Reviews
1. Login as Manager
2. GET `/api/business/venues/1/reviews`
3. Should return ALL reviews (including private)

---

## Frontend Integration

**Review Page URL:** `/review/{venueId}`

**Flow:**
1. Customer selects 1-5 stars
2. Frontend calls: `POST /api/public/venues/{venueId}/reviews`
3. If response has `shouldRedirectToGoogle: true`:
   - Show "Thank you!" message
   - Redirect to `googleMapsUrl` after 2 seconds
4. If response has `shouldRedirectToGoogle: false`:
   - Show feedback form (optional comment)
   - Show "Thank you for your feedback" message
   - No redirect

---

## Priority

**Phase:** Post-MVP (Nice to have for launch)

**Why:**
- Builds trust with high ratings on Google
- Captures improvement feedback privately
- Simple to implement (no complex logic)

**Estimated Time:** 3-4 hours

---

## Future Enhancements

1. **WhatsApp Alerts:** Send low rating alerts to manager via WhatsApp
2. **Email Follow-up:** Send thank you emails to reviewers
3. **Photo Upload:** Allow customers to upload photos with reviews
4. **Response System:** Allow managers to respond to reviews
5. **Analytics:** Track review trends over time
6. **Sentiment Analysis:** AI-powered sentiment analysis of comments

---

## Summary

**What to implement:**
1. Create Review entity and migration
2. Create Public ReviewsController (submit, get public reviews)
3. Create Business ReviewsController (view all reviews, stats)
4. Add GooglePlaceId to Venue (optional but recommended)

**Result:** Complete review system with "Review Shield" logic that protects public reputation while capturing honest feedback.
