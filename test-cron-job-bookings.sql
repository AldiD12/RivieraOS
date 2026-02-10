-- ============================================================================
-- TEST DATA FOR CRON JOB - DailyUnitResetService
-- ============================================================================
-- Purpose: Test if the midnight cron job resets bookings correctly
-- Creates: 2 bookings with each status (Reserved, Active, Completed, Cancelled)
-- 
-- INSTRUCTIONS:
-- 1. Replace @BusinessId, @VenueId, @ZoneId with your actual IDs
-- 2. Run this script in SQL Server Management Studio or Azure Data Studio
-- 3. Wait until midnight (00:00 Italy time) to see the cron job run
-- 4. Check the results the next morning using the verification query at the end
-- ============================================================================

-- STEP 1: Replace these with actual IDs from your database
DECLARE @BusinessId INT = 1;  -- ⚠️ CHANGE THIS to your business ID
DECLARE @VenueId INT = 1;     -- ⚠️ CHANGE THIS to your venue ID  
DECLARE @ZoneId INT = 1;      -- ⚠️ CHANGE THIS to your zone ID

PRINT '🔧 Creating test data for cron job testing...';
PRINT '';

-- STEP 2: Create 8 test sunbed units (2 for each status)
PRINT '📍 Creating test sunbed units...';

-- Units for Reserved bookings
IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-R1' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-R1', 2, 'Reserved', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-R1 (Reserved)';
END

IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-R2' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-R2', 2, 'Reserved', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-R2 (Reserved)';
END

-- Units for Active bookings
IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-A1' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-A1', 2, 'Occupied', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-A1 (Occupied)';
END

IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-A2' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-A2', 2, 'Occupied', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-A2 (Occupied)';
END

-- Units for Completed bookings
IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-C1' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-C1', 2, 'Available', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-C1 (Available)';
END

IF NOT EXISTS (SELECT 1 FROM catalog_zone_units WHERE unit_label = 'TEST-C2' AND zone_id = @ZoneId)
BEGIN
    INSERT INTO catalog_zone_units (zone_id, unit_label, capacity_per_unit, status, is_active, created_at)
    VALUES (@ZoneId, 'TEST-C2', 2, 'Available', 1, GETUTCDATE());
    PRINT '   ✓ Created unit TEST-C2 (Available)';
END

-- Units for Cancelled bookings (reuse R1 and R2 for second bookings)
PRINT '';
PRINT '📋 Creating test bookings...';

-- Get the unit IDs
DECLARE @UnitR1 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-R1' AND zone_id = @ZoneId);
DECLARE @UnitR2 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-R2' AND zone_id = @ZoneId);
DECLARE @UnitA1 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-A1' AND zone_id = @ZoneId);
DECLARE @UnitA2 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-A2' AND zone_id = @ZoneId);
DECLARE @UnitC1 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-C1' AND zone_id = @ZoneId);
DECLARE @UnitC2 INT = (SELECT id FROM catalog_zone_units WHERE unit_label = 'TEST-C2' AND zone_id = @ZoneId);

-- STEP 3: Create test bookings

-- 2 bookings with status "Reserved" (should be completed by cron job)
INSERT INTO catalog_zone_unit_bookings (unit_id, customer_name, customer_phone, customer_email, booking_date, status, checked_in_at, created_at, is_deleted)
VALUES 
    (@UnitR1, 'Test Customer R1', '+355691111111', 'test.r1@example.com', CAST(GETUTCDATE() AS DATE), 'Reserved', NULL, GETUTCDATE(), 0),
    (@UnitR2, 'Test Customer R2', '+355691111112', 'test.r2@example.com', CAST(GETUTCDATE() AS DATE), 'Reserved', NULL, GETUTCDATE(), 0);
PRINT '   ✓ Created 2 bookings with status "Reserved"';

-- 2 bookings with status "Active" (should be completed by cron job)
INSERT INTO catalog_zone_unit_bookings (unit_id, customer_name, customer_phone, customer_email, booking_date, status, checked_in_at, created_at, is_deleted)
VALUES 
    (@UnitA1, 'Test Customer A1', '+355691111113', 'test.a1@example.com', CAST(GETUTCDATE() AS DATE), 'Active', GETUTCDATE(), GETUTCDATE(), 0),
    (@UnitA2, 'Test Customer A2', '+355691111114', 'test.a2@example.com', CAST(GETUTCDATE() AS DATE), 'Active', GETUTCDATE(), GETUTCDATE(), 0);
PRINT '   ✓ Created 2 bookings with status "Active"';

-- 2 bookings with status "Completed" (should NOT be changed by cron job)
INSERT INTO catalog_zone_unit_bookings (unit_id, customer_name, customer_phone, customer_email, booking_date, status, checked_in_at, checked_out_at, created_at, is_deleted)
VALUES 
    (@UnitC1, 'Test Customer C1', '+355691111115', 'test.c1@example.com', CAST(GETUTCDATE() AS DATE), 'Completed', GETUTCDATE(), GETUTCDATE(), GETUTCDATE(), 0),
    (@UnitC2, 'Test Customer C2', '+355691111116', 'test.c2@example.com', CAST(GETUTCDATE() AS DATE), 'Completed', GETUTCDATE(), GETUTCDATE(), GETUTCDATE(), 0);
PRINT '   ✓ Created 2 bookings with status "Completed"';

-- 2 bookings with status "Cancelled" (should NOT be changed by cron job)
INSERT INTO catalog_zone_unit_bookings (unit_id, customer_name, customer_phone, customer_email, booking_date, status, created_at, is_deleted)
VALUES 
    (@UnitR1, 'Test Customer X1', '+355691111117', 'test.x1@example.com', CAST(GETUTCDATE() AS DATE), 'Cancelled', GETUTCDATE(), 0),
    (@UnitR2, 'Test Customer X2', '+355691111118', 'test.x2@example.com', CAST(GETUTCDATE() AS DATE), 'Cancelled', GETUTCDATE(), 0);
PRINT '   ✓ Created 2 bookings with status "Cancelled"';

PRINT '';
PRINT '✅ TEST DATA CREATED SUCCESSFULLY!';
PRINT '';
PRINT '📊 Summary:';
PRINT '   - 6 test sunbed units created (TEST-R1, TEST-R2, TEST-A1, TEST-A2, TEST-C1, TEST-C2)';
PRINT '   - 8 test bookings created:';
PRINT '     • 2 with status "Reserved" (will be completed at midnight)';
PRINT '     • 2 with status "Active" (will be completed at midnight)';
PRINT '     • 2 with status "Completed" (will NOT change)';
PRINT '     • 2 with status "Cancelled" (will NOT change)';
PRINT '';
PRINT '🕐 EXPECTED BEHAVIOR AT MIDNIGHT (00:00 Italy time):';
PRINT '   1. Reserved bookings → Status changes to "Completed"';
PRINT '   2. Active bookings → Status changes to "Completed"';
PRINT '   3. Units with Reserved/Occupied status → Status changes to "Available"';
PRINT '   4. Completed and Cancelled bookings → No changes';
PRINT '';
PRINT '🔍 HOW TO VERIFY TOMORROW:';
PRINT '   Run this query after midnight:';
PRINT '';

-- Show current state
PRINT '📋 CURRENT STATE (Before Midnight):';
PRINT '';

SELECT 
    b.id AS BookingId,
    u.unit_label AS Unit,
    b.customer_name AS Customer,
    b.status AS BookingStatus,
    u.status AS UnitStatus,
    b.booking_date AS BookingDate,
    b.checked_in_at AS CheckedIn,
    b.checked_out_at AS CheckedOut
FROM catalog_zone_unit_bookings b
INNER JOIN catalog_zone_units u ON b.unit_id = u.id
WHERE u.unit_label LIKE 'TEST-%' 
    AND u.zone_id = @ZoneId
    AND b.is_deleted = 0
ORDER BY b.status, u.unit_label;

PRINT '';
PRINT '============================================================================';
PRINT 'VERIFICATION QUERY (Run this tomorrow after midnight):';
PRINT '============================================================================';
PRINT '';
PRINT 'SELECT ';
PRINT '    b.id AS BookingId,';
PRINT '    u.unit_label AS Unit,';
PRINT '    b.customer_name AS Customer,';
PRINT '    b.status AS BookingStatus,';
PRINT '    u.status AS UnitStatus,';
PRINT '    b.booking_date AS BookingDate';
PRINT 'FROM catalog_zone_unit_bookings b';
PRINT 'INNER JOIN catalog_zone_units u ON b.unit_id = u.id';
PRINT 'WHERE u.unit_label LIKE ''TEST-%''';
PRINT '    AND u.zone_id = ' + CAST(@ZoneId AS VARCHAR);
PRINT '    AND b.is_deleted = 0';
PRINT 'ORDER BY b.status, u.unit_label;';
PRINT '';
PRINT '📊 Expected Results Tomorrow:';
PRINT '   - 4 bookings with status "Completed" (2 Reserved + 2 Active changed)';
PRINT '   - 2 bookings still "Completed" (unchanged)';
PRINT '   - 2 bookings still "Cancelled" (unchanged)';
PRINT '   - All units should have status "Available"';
PRINT '';
PRINT '⏰ Now wait until midnight and check again!';
PRINT '============================================================================';
