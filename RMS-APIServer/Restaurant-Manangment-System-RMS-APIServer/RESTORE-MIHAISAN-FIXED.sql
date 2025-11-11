-- Restore Mì xào hải sản recipe details
-- Recipe ID: 2
-- Food: Mì xào hải sản

USE [webQLQuanAn]
GO

-- Delete existing details (if any)
DELETE FROM [dbo].[[Recipe_Detail]]
WHERE RecipeID = '2';

-- Insert new recipe details
INSERT INTO [dbo].[[Recipe_Detail]] (RecipeID, IngreID, UnitMeasurement, Quantity)
VALUES 
    ('2', 'I002', N'g', 200),  -- Mì 200g
    ('2', 'I006', N'g', 150),  -- Tôm 150g
    ('2', 'I007', N'g', 100),  -- Mực 100g
    ('2', 'I003', N'g', 50);   -- Cà rốt 50g

-- Verify
SELECT 
    rd.RecipeID,
    rd.IngreID,
    i.IngreName,
    rd.Quantity,
    rd.UnitMeasurement
FROM [dbo].[[Recipe_Detail]] rd
INNER JOIN [dbo].[[Ingredient]] i ON rd.IngreID = i.IngreID
WHERE rd.RecipeID = '2'
ORDER BY i.IngreName;

-- Check count
SELECT COUNT(*) AS TotalIngredients
FROM [dbo].[[Recipe_Detail]]
WHERE RecipeID = '2';

PRINT 'Recipe restored successfully!';
