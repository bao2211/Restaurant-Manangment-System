-- Add recipe details for Mì xào bò
-- RecipeID: RCS5098426 (just created)

USE [webQLQuanAn]
GO

-- Insert recipe details
INSERT INTO [dbo].[[[Recipe_Detail]]] (RecipeID, IngreID, UnitMeasurement, Quantity)
VALUES 
    ('RCS5098426', 'I002', N'g', 200),  -- Mì 200g
    ('RCS5098426', 'I005', N'g', 300),  -- Bò 300g
    ('RCS5098426', 'I003', N'g', 50);   -- Cà rốt 50g

-- Verify
SELECT 
    rd.RecipeID,
    rd.IngreID,
    i.IngreName,
    rd.Quantity,
    rd.UnitMeasurement
FROM [dbo].[[[Recipe_Detail]]] rd
INNER JOIN [dbo].[[[Ingredient]]] i ON rd.IngreID = i.IngreID
WHERE rd.RecipeID = 'RCS5098426'
ORDER BY i.IngreName;

PRINT 'Recipe details added successfully!';
