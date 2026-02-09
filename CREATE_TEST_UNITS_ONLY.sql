-- ============================================================================
-- CREATE 8 TEST SUNBED UNITS FOR CRON JOB TESTING
-- ============================================================================
-- Simple script to create test sunbed units
-- After running this, use the frontend /test-cron page to create bookings
-- ============================================================================

PRINT '🔧 Creating 8 Test Sunbed Units';
PRINT '================================================';

-- Find the first zone (active or inactive - doesn't matter for testing)
DECLARE @ZoneId INT = (
    SELECT TOP 1 zone_id 
    FROM catalog_venue_zones 
    ORDER BY zone_id
);

IF @ZoneId IS NULL
BEGIN
    PRINT '❌ ERROR: No zones found. Please create a zone first.';
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
PRINT '✅ 8 TEST UNITS CREATED!';
PRINT '';
PRINT '================================================';
PRINT 'NEXT STEPS:';
PRINT '================================================';
PRINT '1. Go to your frontend: /test-cron';
PRINT '2. Click "Create All 8 Test Bookings"';
PRINT '3. Wait until midnight (00:00 Italy time)';
PRINT '4. Click "Refresh" to see if cron job worked';
PRINT '';
PRINT '📊 EXPECTED RESULTS AT MIDNIGHT:';
PRINT '   - 2 Reserved bookings → Completed';
PRINT '   - 2 Active bookings → Completed';
PRINT '   - 2 Completed bookings → No change';
PRINT '   - 2 Cancelled bookings → No change';
PRINT '';
PRINT '============================================================================';
