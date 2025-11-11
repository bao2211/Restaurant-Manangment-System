-- ============================================
-- SCRIPT ĐƠN GIẢN - COPY VÀ PASTE VÀO SQL TOOL
-- ============================================

USE [webQLQuanAn]
GO

-- Xóa dữ liệu cũ
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '1         ';

-- CƠM GÀ XỐI MỠ - 7 nguyên liệu
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '1         ', N'g', 300);  -- Gạo 300g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '2         ', N'g', 500);  -- Gà 500g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '3         ', N'g', 50);   -- Cà rốt 50g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '4         ', N'g', 30);   -- Hành tây 30g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '5         ', N'g', 5);    -- Nghệ 5g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '6         ', N'g', 10);   -- Gừng 10g
INSERT INTO [[Recipe_Detail]]] VALUES ('1         ', '7         ', N'g', 15);   -- Tỏi 15g

-- Cập nhật mô tả
UPDATE [[Recipe]]] SET [RecipeDescription] = N'Cơm gà Hải Nam truyền thống với gà luộc mềm, cơm thơm mùi hành và gừng, ăn kèm nước chấm đặc biệt' WHERE [RecipeID] = '1         ';

-- MÌ XÀO HẢI SẢN
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '2         ';
INSERT INTO [[Recipe_Detail]]] VALUES ('2         ', '1         ', N'g', 200);  -- Mì 200g
INSERT INTO [[Recipe_Detail]]] VALUES ('2         ', '3         ', N'g', 100);  -- Cà rốt 100g
INSERT INTO [[Recipe_Detail]]] VALUES ('2         ', '4         ', N'g', 50);   -- Hành tây 50g
INSERT INTO [[Recipe_Detail]]] VALUES ('2         ', '7         ', N'g', 10);   -- Tỏi 10g
UPDATE [[Recipe]]] SET [RecipeDescription] = N'Mì xào giòn với hải sản tươi ngon, rau củ đa dạng, nước sốt đậm đà' WHERE [RecipeID] = '2         ';

-- CƠM SƯỜN
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '3         ';
INSERT INTO [[Recipe_Detail]]] VALUES ('3         ', '1         ', N'g', 250);  -- Gạo 250g
INSERT INTO [[Recipe_Detail]]] VALUES ('3         ', '3         ', N'g', 30);   -- Cà rốt 30g
INSERT INTO [[Recipe_Detail]]] VALUES ('3         ', '4         ', N'g', 20);   -- Hành tây 20g
INSERT INTO [[Recipe_Detail]]] VALUES ('3         ', '7         ', N'g', 10);   -- Tỏi 10g
INSERT INTO [[Recipe_Detail]]] VALUES ('3         ', '6         ', N'g', 5);    -- Gừng 5g
UPDATE [[Recipe]]] SET [RecipeDescription] = N'Cơm sườn nướng thơm ngon với sườn ướp gia vị đặc biệt, ăn kèm rau sống' WHERE [RecipeID] = '3         ';

-- GÀ CHIÊN MẮM
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '4         ';
INSERT INTO [[Recipe_Detail]]] VALUES ('4         ', '2         ', N'g', 600);  -- Gà 600g
INSERT INTO [[Recipe_Detail]]] VALUES ('4         ', '7         ', N'g', 20);   -- Tỏi 20g
INSERT INTO [[Recipe_Detail]]] VALUES ('4         ', '6         ', N'g', 15);   -- Gừng 15g
INSERT INTO [[Recipe_Detail]]] VALUES ('4         ', '5         ', N'g', 3);    -- Nghệ 3g
UPDATE [[Recipe]]] SET [RecipeDescription] = N'Gà chiên giòn với mắm đậm đà, gia vị thơm ngon, ăn kèm rau sống' WHERE [RecipeID] = '4         ';

-- Kiểm tra kết quả
SELECT 
    f.[FoodName] AS [TenMon],
    COUNT(rd.[IngreID]) AS [SoNguyenLieu]
FROM [[Recipe]]] r
LEFT JOIN [[Food_Info]]] f ON r.[FoodID] = f.[FoodID]
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
GROUP BY f.[FoodName]
ORDER BY f.[FoodName];

PRINT 'HOÀN THÀNH!'
GO
