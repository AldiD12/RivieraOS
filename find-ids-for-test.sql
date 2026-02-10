-- ============================================================================
-- FIND IDs FOR TEST DATA
-- ============================================================================
-- Run these queries to find your Business ID, Venue ID, and Zone ID
-- Copy the IDs and paste them into test-cron-job-bookings.sql
-- ============================================================================

PRINT '🔍 Finding IDs for test data...';
PRINT '';

-- ============================================================================
-- STEP 1: Find Business ID
-- ============================================================================
PRINT '📊 STEP 1: Available Businesses';
PRINT '================================';

SELECT 
    id AS BusinessId,
    name AS BusinessName,
    email AS Email,
    is_active AS IsActive
FROM catalog_businesses
WHERE is_active = 1
ORDER BY id;

PRINT '';
PRINT '👉 Copy the BusinessId from the business you want to test with';
PRINT '';

-- ============================================================================
-- STEP 2: Find Venue ID (Replace @BusinessId with your business ID)
-- ============================================================================
DECLARE @BusinessId INT = 1;  -- ⚠️ CHANGE THIS after running Step 1

PRINT '📊 STEP 2: Available Venues for Business ID: ' + CAST(@BusinessId AS VARCHAR);
PRINT '================================';

SELECT 
    v.id AS VenueId,
    v.name AS VenueName,
    v.business_id AS BusinessId,
    v.is_active AS IsActive
FROM catalog_venues v
WHERE v.business_id = @BusinessId
    AND v.is_active = 1
ORDER BY v.id;

PRINT '';
PRINT '👉 Copy the VenueId from the venue you want to test with';
PRINT '';

-- ============================================================================
-- STEP 3: Find Zone ID (Replace @VenueId with your venue ID)
-- ============================================================================
DECLARE @VenueId INT = 1;  -- ⚠️ CHANGE THIS after running Step 2

PRINT '📊 STEP 3: Available Zones for Venue ID: ' + CAST(@VenueId AS VARCHAR);
PRINT '================================';

SELECT 
    z.id AS ZoneId,
    z.name AS ZoneName,
    z.venue_id AS VenueId,
    z.capacity AS Capacity,
    z.is_active AS IsActive
FROM catalog_venue_zones z
WHERE z.venue_id = @VenueId
    AND z.is_active = 1
ORDER BY z.id;

PRINT '';
PRINT '👉 Copy the ZoneId from the zone you want to test with';
PRINT '';

-- ============================================================================
-- STEP 4: Summary (Run this after you have all IDs)
-- ============================================================================
DECLARE @ZoneId INT = 1;  -- ⚠️ CHANGE THIS after running Step 3

PRINT '📋 SUMMARY - Copy these values to test-cron-job-bookings.sql';
PRINT '================================';

SELECT 
    b.id AS BusinessId,
    b.name AS BusinessName,
    v.id AS VenueId,
    v.name AS VenueName,
    z.id AS ZoneId,
    z.name AS ZoneName
FROM catalog_businesses b
INNER JOIN catalog_venues v ON v.business_id = b.id
INNER JOIN catalog_venue_zones z ON z.venue_id = v.id
WHERE b.id = @BusinessId
    AND v.id = @VenueId
    AND z.id = @ZoneId;

PRINT '';
PRINT '✅ Now copy these IDs to test-cron-job-bookings.sql:';
PRINT '   DECLARE @BusinessId INT = ' + CAST(@BusinessId AS VARCHAR) + ';';
PRINT '   DECLARE @VenueId INT = ' + CAST(@VenueId AS VARCHAR) + ';';
PRINT '   DECLARE @ZoneId INT = ' + CAST(@ZoneId AS VARCHAR) + ';';
PRINT '';
PRINT '============================================================================';
