-- ============================================================================
-- FIX ZONES + CREATE TEST DATA FOR CRON JOB
-- ============================================================================
-- This script does 3 things:
-- 1. Adds is_active column to zones (if missing)
-- 2. Activates all existing zones
-- 3. Creates 8 test sunbed units for testing the cron job
-- ============================================================================

PRINT '🔧 Step 1: Fix Zones - Add is_active column';
PRINT '================================================';

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'catalog_venue_zones' 
    AND COLUMN_NAME = 'is_active'
)
BEGIN
    ALTER TABLE catalog_venue_zones ADD is_active BIT NOT NULL DEFAULT 1;
    PRINT '✅ Added is_active column to catalog_venue_zones';
END
ELSE
BEGIN
    PRINT '✓ is_active column already exists';
END

-- Set all existing zones to active
UPDATE catalog_venue_zones 
SET is_active = 1 
WHERE is_active IS NULL OR is_active = 0;

PRINT '✅ All zones are now active';
PRINT '';

-- ============================================================================
PRINT '🔧 Step 2: Create Test Sunbed Units';
PRINT '================================================';

-- Find the first active zone
DECLARE @ZoneId INT = (
    SELECT TOP 1 zone_id 
    FROM catalog_venue_zones 
    WHERE is_active = 1 
    ORDER BY zone_id
);

IF @ZoneId IS NULL
BEGIN
    PRINT '❌ ERROR: No active zones found. Please create a zone first.';
    RETURN;
END

PRINT 'Using Zone ID: ' + CAST(@ZoneId AS VARCHAR);
PRINT '';

-- Create 8 test sunbed units
DECLARE @Counter INT = 1;
WHILE @Counter <= 8
BEGIN
    DECLARE @UnitLabel VARCHAR(20) = 'TEST-' + CAST(@Counter AS VARCHAR);
    
    -- Check if unit already exists
    IF NOT EXISTS (
        SELECT 1 FROM catalog_zone_units 
        WHERE unit_label = @UnitLabel AND zone_id = @ZoneId
    )
    BEGIN
        INSERT INTO catalog_zone_units (
            zone_id, 
            unit_label, 
            unit_type,
            capacity_per_unit, 
            status, 
            is_active, 
            created_at
        )
        VALUES (
            @ZoneId, 
            @UnitLabel, 
            'Sunbed',
            2, 
            'Available', 
            1, 
            GETUTCDATE()
        );
        PRINT '   ✓ Created unit: ' + @UnitLabel;
    END
    ELSE
    BEGIN
        PRINT '   - Unit already exists: ' + @UnitLabel;
    END
    
    SET @Counter = @Counter + 1;
END

PRINT '';
PRINT '✅ TEST DATA READY!';
PRINT '';
PRINT '================================================';
PRINT 'NEXT STEPS:';
PRINT '================================================';
PRINT '1. Go to your frontend: /test-cron';
PRINT '2. Click "Create All 8 Test Bookings"';
PRINT '3. Wait until midnight (00:00 Italy time)';
PRINT '4. Check if Reserved + Active → Completed';
PRINT '';
PRINT '📊 EXPECTED RESULTS AT MIDNIGHT:';
PRINT '   - 2 Reserved bookings → Completed';
PRINT '   - 2 Active bookings → Completed';
PRINT '   - 2 Completed bookings → No change';
PRINT '   - 2 Cancelled bookings → No change';
PRINT '';
PRINT '🔍 VERIFICATION QUERY (Run tomorrow):';
PRINT '';
PRINT 'SELECT ';
PRINT '    b.id AS BookingId,';
PRINT '    u.unit_label AS Unit,';
PRINT '    b.customer_name AS Customer,';
PRINT '    b.status AS BookingStatus,';
PRINT '    u.status AS UnitStatus';
PRINT 'FROM catalog_zone_unit_bookings b';
PRINT 'INNER JOIN catalog_zone_units u ON b.unit_id = u.id';
PRINT 'WHERE u.unit_label LIKE ''TEST-%''';
PRINT '    AND b.is_deleted = 0';
PRINT 'ORDER BY b.status, u.unit_label;';
PRINT '';
PRINT '============================================================================';
