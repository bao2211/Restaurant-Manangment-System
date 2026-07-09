-- =============================================
-- Script: Add Take Away Table
-- Description: Creates a special table entry for Take Away orders
-- Date: 2025-11-11
-- =============================================

USE [RMS_Database]
GO

-- Check if table with ID '0' already exists
IF NOT EXISTS (SELECT 1 FROM [dbo].[Table] WHERE TableId = '0')
BEGIN
    -- Insert Take Away table
    INSERT INTO [dbo].[Table] (TableId, Capacity, Status)
    VALUES ('0', 0, 'Available')
    
    PRINT 'Take Away table (ID: 0) created successfully'
END
ELSE
BEGIN
    -- Update existing table to ensure it's set up for take away
    UPDATE [dbo].[Table]
    SET Capacity = 0,
        Status = 'Available'
    WHERE TableId = '0'
    
    PRINT 'Take Away table (ID: 0) already exists and has been updated'
END
GO

-- Verify the table was created/updated
SELECT * FROM [dbo].[Table] WHERE TableId = '0'
GO

PRINT 'Take Away table setup completed!'
GO
