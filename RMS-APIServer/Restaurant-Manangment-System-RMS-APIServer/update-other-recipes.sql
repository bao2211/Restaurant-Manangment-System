-- ============================================
-- THÊM CÔNG THỨC CHO CÁC MÓN ĂN KHÁC
-- ============================================

USE [webQLQuanAn]
GO

PRINT '🔄 Thêm công thức cho các món ăn khác...'
PRINT ''

-- ============================================
-- 1. MÌ XÀO HẢI SẢN (RecipeID: 2)
-- ============================================
PRINT '📝 1. MÌ XÀO HẢI SẢN'
PRINT '─────────────────────────────────────────────────────────'

-- Cập nhật mô tả
UPDATE [[Recipe]]]
SET [RecipeDescription] = N'Mì xào giòn với hải sản tươi ngon, rau củ đa dạng, nước sốt đậm đà'
WHERE [RecipeID] = '2         ';

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '2         ';

-- Thêm nguyên liệu
INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('2         ', '1         ', 200, N'g');  -- Gạo (có thể dùng làm mì)
PRINT '   ✅ Mì: 200g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('2         ', '3         ', 100, N'g');  -- Cà rốt
PRINT '   ✅ Cà rốt: 100g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('2         ', '4         ', 50, N'g');   -- Hành tây
PRINT '   ✅ Hành tây: 50g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('2         ', '7         ', 10, N'g');   -- Tỏi
PRINT '   ✅ Tỏi: 10g'

PRINT ''

-- ============================================
-- 2. CƠM SƯỜN (RecipeID: 3)
-- ============================================
PRINT '📝 2. CƠM SƯỜN'
PRINT '─────────────────────────────────────────────────────────'

-- Cập nhật mô tả
UPDATE [[Recipe]]]
SET [RecipeDescription] = N'Cơm sườn nướng thơm ngon với sườn ướp gia vị đặc biệt, ăn kèm rau sống'
WHERE [RecipeID] = '3         ';

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '3         ';

-- Thêm nguyên liệu
INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('3         ', '1         ', 250, N'g');  -- Gạo
PRINT '   ✅ Gạo: 250g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('3         ', '3         ', 30, N'g');   -- Cà rốt
PRINT '   ✅ Cà rốt: 30g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('3         ', '4         ', 20, N'g');   -- Hành tây
PRINT '   ✅ Hành tây: 20g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('3         ', '7         ', 10, N'g');   -- Tỏi
PRINT '   ✅ Tỏi: 10g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('3         ', '6         ', 5, N'g');    -- Gừng
PRINT '   ✅ Gừng: 5g'

PRINT ''

-- ============================================
-- 3. GÀ CHIÊN MẮM (RecipeID: 4)
-- ============================================
PRINT '📝 3. GÀ CHIÊN MẮM'
PRINT '─────────────────────────────────────────────────────────'

-- Cập nhật mô tả
UPDATE [[Recipe]]]
SET [RecipeDescription] = N'Gà chiên giòn với mắm đậm đà, gia vị thơm ngon, ăn kèm rau sống'
WHERE [RecipeID] = '4         ';

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '4         ';

-- Thêm nguyên liệu
INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('4         ', '2         ', 600, N'g');  -- Gà
PRINT '   ✅ Gà: 600g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('4         ', '7         ', 20, N'g');   -- Tỏi
PRINT '   ✅ Tỏi: 20g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('4         ', '6         ', 15, N'g');   -- Gừng
PRINT '   ✅ Gừng: 15g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('4         ', '5         ', 3, N'g');    -- Nghệ
PRINT '   ✅ Nghệ: 3g'

PRINT ''
PRINT '✅ Đã thêm công thức cho 3 món'
PRINT ''

-- ============================================
-- 4. KIỂM TRA TỔNG HỢP
-- ============================================
PRINT '═══════════════════════════════════════════════════════'
PRINT '🔍 KIỂM TRA TỔNG HỢP TẤT CẢ CÔNG THỨC'
PRINT '═══════════════════════════════════════════════════════'
PRINT ''

SELECT 
    r.[RecipeID] AS [MaCongThuc],
    f.[FoodName] AS [TenMon],
    r.[RecipeDescription] AS [MoTa],
    COUNT(rd.[IngreID]) AS [SoNguyenLieu]
FROM [[Recipe]]] r
LEFT JOIN [[Food_Info]]] f ON r.[FoodID] = f.[FoodID]
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
GROUP BY r.[RecipeID], f.[FoodName], r.[RecipeDescription]
ORDER BY r.[RecipeID];

PRINT ''
PRINT '═══════════════════════════════════════════════════════'
PRINT '✅ HOÀN THÀNH CÁC CÔNG THỨC BỔ SUNG!'
PRINT '═══════════════════════════════════════════════════════'
GO
