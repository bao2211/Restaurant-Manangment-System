-- =====================================
-- 🔍 Recipe Database Diagnostic Script
-- =====================================
-- Use this script to check the database structure and data
-- for Recipe Management System

USE [webQLQuanAn]
GO

PRINT '╔════════════════════════════════════════════════════════╗'
PRINT '║       🔍 Recipe Database Diagnostic Tool 🔍           ║'
PRINT '╚════════════════════════════════════════════════════════╝'
PRINT ''

-- =====================================
-- 1. CHECK TABLE EXISTENCE
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '1️⃣  Checking Table Existence...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

IF OBJECT_ID('dbo.[[Recipe]]]', 'U') IS NOT NULL
    PRINT '✅ Table [Recipe] exists'
ELSE
    PRINT '❌ Table [Recipe] NOT FOUND!'

IF OBJECT_ID('dbo.[[Recipe_Detail]]]', 'U') IS NOT NULL
    PRINT '✅ Table [Recipe_Detail] exists'
ELSE
    PRINT '❌ Table [Recipe_Detail] NOT FOUND!'

IF OBJECT_ID('dbo.[[Food_Info]]]', 'U') IS NOT NULL
    PRINT '✅ Table [Food_Info] exists'
ELSE
    PRINT '❌ Table [Food_Info] NOT FOUND!'

IF OBJECT_ID('dbo.[[Ingredient]]]', 'U') IS NOT NULL
    PRINT '✅ Table [Ingredient] exists'
ELSE
    PRINT '❌ Table [Ingredient] NOT FOUND!'

PRINT ''

-- =====================================
-- 2. CHECK TABLE STRUCTURE
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '2️⃣  Checking Table Structure...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

-- Recipe table structure
PRINT '📋 Recipe Table Columns:'
SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    CHARACTER_MAXIMUM_LENGTH as [Max Length],
    IS_NULLABLE as [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Recipe'
ORDER BY ORDINAL_POSITION

PRINT ''

-- Recipe_Detail table structure
PRINT '📋 Recipe_Detail Table Columns:'
SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    CHARACTER_MAXIMUM_LENGTH as [Max Length],
    IS_NULLABLE as [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Recipe_Detail'
ORDER BY ORDINAL_POSITION

PRINT ''

-- =====================================
-- 3. CHECK FOREIGN KEY RELATIONSHIPS
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '3️⃣  Checking Foreign Key Relationships...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

SELECT 
    OBJECT_NAME(f.parent_object_id) AS [Table],
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS [Column],
    OBJECT_NAME (f.referenced_object_id) AS [Referenced Table],
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS [Referenced Column],
    f.name AS [FK Name]
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) IN ('Recipe', 'Recipe_Detail')
ORDER BY [Table]

PRINT ''

-- =====================================
-- 4. DATA COUNT
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '4️⃣  Counting Records...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

DECLARE @FoodCount INT, @IngreCount INT, @RecipeCount INT, @DetailCount INT

SELECT @FoodCount = COUNT(*) FROM [[Food_Info]]]
SELECT @IngreCount = COUNT(*) FROM [[Ingredient]]]
SELECT @RecipeCount = COUNT(*) FROM [[Recipe]]]
SELECT @DetailCount = COUNT(*) FROM [[Recipe_Detail]]]

PRINT '📊 Record Counts:'
PRINT '   Foods:          ' + CAST(@FoodCount AS VARCHAR(10))
PRINT '   Ingredients:    ' + CAST(@IngreCount AS VARCHAR(10))
PRINT '   Recipes:        ' + CAST(@RecipeCount AS VARCHAR(10))
PRINT '   Recipe Details: ' + CAST(@DetailCount AS VARCHAR(10))
PRINT ''

-- =====================================
-- 5. SAMPLE DATA
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '5️⃣  Sample Data...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

-- Sample Foods
PRINT '🍽️  Sample Foods (First 5):'
SELECT TOP 5 
    FoodID,
    FoodName,
    CategoryID,
    Price
FROM [[Food_Info]]]
ORDER BY FoodID

PRINT ''

-- Sample Ingredients
PRINT '🥬 Sample Ingredients (First 5):'
SELECT TOP 5 
    IngreID,
    IngreName,
    IngreDescription,
    IngreUnit
FROM [[Ingredient]]]
ORDER BY IngreID

PRINT ''

-- Sample Recipes
IF @RecipeCount > 0
BEGIN
    PRINT '📜 Existing Recipes:'
    SELECT 
        r.RecipeID,
        f.FoodName,
        r.RecipeDescription,
        (SELECT COUNT(*) FROM [[Recipe_Detail]]] WHERE RecipeID = r.RecipeID) as [Ingredient Count]
    FROM [[Recipe]]] r
    LEFT JOIN [[Food_Info]]] f ON r.FoodID = f.FoodID
    ORDER BY r.RecipeID
END
ELSE
BEGIN
    PRINT '⚠️  No recipes found in database'
END

PRINT ''

-- =====================================
-- 6. RECIPE DETAILS
-- =====================================
IF @RecipeCount > 0
BEGIN
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    PRINT '6️⃣  Recipe Details...'
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    PRINT ''

    SELECT 
        rd.RecipeID,
        f.FoodName as [Recipe For],
        i.IngreName as [Ingredient],
        rd.Quantity,
        rd.UnitMeasurement
    FROM [[Recipe_Detail]]] rd
    INNER JOIN [[Recipe]]] r ON rd.RecipeID = r.RecipeID
    INNER JOIN [[Food_Info]]] f ON r.FoodID = f.FoodID
    INNER JOIN [[Ingredient]]] i ON rd.IngreID = i.IngreID
    ORDER BY rd.RecipeID, i.IngreName
END

PRINT ''

-- =====================================
-- 7. DATA INTEGRITY CHECKS
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '7️⃣  Data Integrity Checks...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

-- Check for orphaned recipes (FoodID doesn't exist)
DECLARE @OrphanRecipes INT
SELECT @OrphanRecipes = COUNT(*) 
FROM [[Recipe]]] r
LEFT JOIN [[Food_Info]]] f ON r.FoodID = f.FoodID
WHERE f.FoodID IS NULL

IF @OrphanRecipes > 0
    PRINT '⚠️  Found ' + CAST(@OrphanRecipes AS VARCHAR(10)) + ' orphaned recipes (invalid FoodID)'
ELSE
    PRINT '✅ All recipes have valid FoodID'

-- Check for orphaned recipe details (RecipeID doesn't exist)
DECLARE @OrphanDetails INT
SELECT @OrphanDetails = COUNT(*) 
FROM [[Recipe_Detail]]] rd
LEFT JOIN [[Recipe]]] r ON rd.RecipeID = r.RecipeID
WHERE r.RecipeID IS NULL

IF @OrphanDetails > 0
    PRINT '⚠️  Found ' + CAST(@OrphanDetails AS VARCHAR(10)) + ' orphaned recipe details (invalid RecipeID)'
ELSE
    PRINT '✅ All recipe details have valid RecipeID'

-- Check for invalid ingredient IDs in recipe details
DECLARE @InvalidIngredients INT
SELECT @InvalidIngredients = COUNT(*) 
FROM [[Recipe_Detail]]] rd
LEFT JOIN [[Ingredient]]] i ON rd.IngreID = i.IngreID
WHERE i.IngreID IS NULL

IF @InvalidIngredients > 0
    PRINT '⚠️  Found ' + CAST(@InvalidIngredients AS VARCHAR(10)) + ' recipe details with invalid IngreID'
ELSE
    PRINT '✅ All recipe details have valid IngreID'

-- Check for recipes without details
DECLARE @RecipesNoDetails INT
SELECT @RecipesNoDetails = COUNT(*)
FROM [[Recipe]]] r
LEFT JOIN [[Recipe_Detail]]] rd ON r.RecipeID = rd.RecipeID
WHERE rd.RecipeID IS NULL

IF @RecipesNoDetails > 0
    PRINT '⚠️  Found ' + CAST(@RecipesNoDetails AS VARCHAR(10)) + ' recipes without any details'
ELSE
    PRINT '✅ All recipes have at least one detail'

PRINT ''

-- =====================================
-- 8. FOOD WITHOUT RECIPES
-- =====================================
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '8️⃣  Foods Without Recipes...'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

DECLARE @FoodsNoRecipe INT
SELECT @FoodsNoRecipe = COUNT(*)
FROM [[Food_Info]]] f
LEFT JOIN [[Recipe]]] r ON f.FoodID = r.FoodID
WHERE r.RecipeID IS NULL

PRINT '📊 Foods without recipes: ' + CAST(@FoodsNoRecipe AS VARCHAR(10)) + ' / ' + CAST(@FoodCount AS VARCHAR(10))

IF @FoodsNoRecipe > 0 AND @FoodsNoRecipe <= 10
BEGIN
    PRINT ''
    PRINT 'Foods that need recipes:'
    SELECT TOP 10
        f.FoodID,
        f.FoodName,
        c.CateName as Category
    FROM [[Food_Info]]] f
    LEFT JOIN [[Recipe]]] r ON f.FoodID = r.FoodID
    LEFT JOIN [[Category]]] c ON f.CategoryID = c.CategoryID
    WHERE r.RecipeID IS NULL
    ORDER BY f.FoodName
END

PRINT ''

-- =====================================
-- 9. SUMMARY
-- =====================================
PRINT '╔════════════════════════════════════════════════════════╗'
PRINT '║                    📊 SUMMARY 📊                       ║'
PRINT '╚════════════════════════════════════════════════════════╝'
PRINT ''

PRINT '✅ Database Structure: OK'
IF @FoodCount > 0 AND @IngreCount > 0
    PRINT '✅ Master Data: Foods (' + CAST(@FoodCount AS VARCHAR(10)) + '), Ingredients (' + CAST(@IngreCount AS VARCHAR(10)) + ')'
ELSE
    PRINT '⚠️  Master Data: Missing or insufficient'

IF @RecipeCount > 0
    PRINT '✅ Recipes: ' + CAST(@RecipeCount AS VARCHAR(10)) + ' recipes with ' + CAST(@DetailCount AS VARCHAR(10)) + ' details'
ELSE
    PRINT '⚠️  Recipes: No recipes in database'

PRINT ''
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '✅ Diagnostic Complete!'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''
PRINT 'Next Steps:'
PRINT '  1. Test API endpoints using test-recipe-api.html'
PRINT '  2. Run PowerShell test: .\test-recipe-quick.ps1'
PRINT '  3. Test mobile app with RecipeManagerScreen'
PRINT ''
