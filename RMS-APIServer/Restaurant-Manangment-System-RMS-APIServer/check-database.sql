-- ============================================================================
-- Database Verification Script for 192.168.192.86
-- ============================================================================
-- Run this script to check if the database exists and is accessible
-- ============================================================================

-- 1. List all databases on the server
PRINT '=== Available Databases ==='
SELECT 
    name AS DatabaseName,
    database_id AS ID,
    create_date AS CreatedDate,
    state_desc AS State,
    recovery_model_desc AS RecoveryModel
FROM sys.databases
ORDER BY name;
GO

-- 2. Check if webQLQuanAn exists specifically
PRINT ''
PRINT '=== Checking for webQLQuanAn database ==='
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'webQLQuanAn')
BEGIN
    PRINT '✓ Database webQLQuanAn EXISTS'
    
    -- Show database details
    SELECT 
        name AS DatabaseName,
        state_desc AS State,
        recovery_model_desc AS RecoveryModel,
        compatibility_level AS CompatibilityLevel,
        collation_name AS Collation
    FROM sys.databases 
    WHERE name = 'webQLQuanAn';
    
    -- Check database size
    USE webQLQuanAn;
    EXEC sp_spaceused;
    
    -- List tables in the database
    PRINT ''
    PRINT '=== Tables in webQLQuanAn ==='
    SELECT 
        SCHEMA_NAME(schema_id) AS SchemaName,
        name AS TableName,
        create_date AS CreatedDate
    FROM sys.tables
    ORDER BY name;
END
ELSE
BEGIN
    PRINT '✗ Database webQLQuanAn DOES NOT EXIST'
    PRINT 'Available databases are listed above.'
END
GO

-- 3. Check current user permissions
PRINT ''
PRINT '=== Current User and Permissions ==='
SELECT 
    SYSTEM_USER AS CurrentUser,
    USER_NAME() AS DatabaseUser,
    IS_SRVROLEMEMBER('sysadmin') AS IsSysAdmin;
GO

-- 4. If database doesn't exist, here's how to create it:
PRINT ''
PRINT '=== To create webQLQuanAn database, run: ==='
PRINT 'CREATE DATABASE webQLQuanAn;'
PRINT 'GO'
