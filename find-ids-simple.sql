-- ============================================================================
-- SIMPLE: Find All IDs at Once
-- ============================================================================
-- This shows all businesses, venues, and zones in one query
-- Pick the ones you want and copy the IDs to test-cron-job-bookings.sql
-- ============================================================================

SELECT 
    b.id AS BusinessId,
    b.name AS BusinessName,
    v.id AS VenueId,
    v.name AS VenueName,
    z.id AS ZoneId,
    z.name AS ZoneName,
    z.capacity AS ZoneCapacity
FROM catalog_businesses b
INNER JOIN catalog_venues v ON v.business_id = b.id
INNER JOIN catalog_venue_zones z ON z.venue_id = v.id
WHERE b.is_active = 1
    AND v.is_active = 1
    AND z.is_active = 1
ORDER BY b.id, v.id, z.id;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Run this query in SQL Server Management Studio or Azure Data Studio
-- 2. Look at the results and pick one row
-- 3. Copy the BusinessId, VenueId, and ZoneId from that row
-- 4. Open test-cron-job-bookings.sql
-- 5. Replace the values at the top:
--    DECLARE @BusinessId INT = [your BusinessId];
--    DECLARE @VenueId INT = [your VenueId];
--    DECLARE @ZoneId INT = [your ZoneId];
-- 6. Run test-cron-job-bookings.sql
-- ============================================================================
