-- Check Recipe_Detail table structure
USE [webQLQuanAn]
GO

-- Get column names and types
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Recipe_Detail'
ORDER BY ORDINAL_POSITION;

-- Check existing data in Recipe_Detail for recipe ID 2
SELECT TOP 10 *
FROM [dbo].[[Recipe_Detail]]
WHERE RecipeID = '2';

-- Check all recipe IDs and their details count
SELECT 
    RecipeID,
    COUNT(*) as DetailCount
FROM [dbo].[[Recipe_Detail]]
GROUP BY RecipeID;

-- Check ingredient IDs that exist
SELECT IngreID, IngreName
FROM [dbo].[[Ingredient]]
WHERE IngreID IN ('I002', 'I006', 'I007', 'I003')
ORDER BY IngreID;
