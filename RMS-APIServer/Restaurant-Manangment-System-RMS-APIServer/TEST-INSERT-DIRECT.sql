USE [webQLQuanAn]
GO

-- Test insert for Mì xào bò (RecipeID: RCS5098456)
INSERT INTO [dbo].[Recipe_Detail] (RecipeID, IngreID, UnitMeasurement, Quantity)
VALUES ('RCS5098456', 'I001', N'g', 10);

-- Verify
SELECT * FROM [dbo].[Recipe_Detail] WHERE RecipeID = 'RCS5098456';

PRINT 'SUCCESS!';
