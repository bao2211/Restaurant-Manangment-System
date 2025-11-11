-- Check if RecipeID and IngreID exist
USE [webQLQuanAn]
GO

-- Check Recipe exists
SELECT 'Recipe Check' AS CheckType, RecipeID, FoodID, RecipeDescription
FROM [dbo].[[[Recipe]]]
WHERE RecipeID = 'RCS5098426';

-- Check Ingredients exist
SELECT 'Ingredient Check' AS CheckType, IngreID, IngreName, UnitMeasurement
FROM [dbo].[[[Ingredient]]]
WHERE IngreID IN ('I001', 'I002', 'I003', 'I004', 'I005');

-- Try manual insert to see exact error
BEGIN TRY
    INSERT INTO [dbo].[[[Recipe_Detail]]] (RecipeID, IngreID, UnitMeasurement, Quantity)
    VALUES ('RCS5098426', 'I004', N'g', 1);
    
    PRINT 'SUCCESS: Manual insert worked!';
    
    -- Clean up test
    DELETE FROM [dbo].[[[Recipe_Detail]]]
    WHERE RecipeID = 'RCS5098426' AND IngreID = 'I004';
    
END TRY
BEGIN CATCH
    PRINT 'ERROR: ' + ERROR_MESSAGE();
END CATCH;
