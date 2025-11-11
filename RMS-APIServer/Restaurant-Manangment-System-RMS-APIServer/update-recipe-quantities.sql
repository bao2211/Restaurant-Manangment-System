-- ============================================
-- CẬP NHẬT ĐỊNH LƯỢNG NGUYÊN LIỆU CHO CÔNG THỨC
-- ============================================

USE [webQLQuanAn]
GO

PRINT '🔄 Bắt đầu cập nhật định lượng nguyên liệu...'
PRINT ''

-- ============================================
-- 1. XÓA DỮ LIỆU CŨ (nếu có)
-- ============================================
PRINT '🗑️  Xóa dữ liệu cũ của Recipe_Detail...'
DELETE FROM [[Recipe_Detail]]] WHERE [RecipeID] = '1         ';
PRINT '   ✅ Đã xóa'
PRINT ''

-- ============================================
-- 2. THÊM ĐỊNH LƯỢNG CHO CƠM GÀ XỐI MỠ
-- ============================================
PRINT '📝 Thêm định lượng cho CƠM GÀ XỐI MỠ (RecipeID: 1)'
PRINT '─────────────────────────────────────────────────────────'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '1         ', 300, N'g');
PRINT '   ✅ Gạo: 300g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '2         ', 500, N'g');
PRINT '   ✅ Gà: 500g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '3         ', 50, N'g');
PRINT '   ✅ Cà rốt: 50g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '4         ', 30, N'g');
PRINT '   ✅ Hành tây: 30g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '5         ', 5, N'g');
PRINT '   ✅ Nghệ: 5g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '6         ', 10, N'g');
PRINT '   ✅ Gừng: 10g'

INSERT INTO [[Recipe_Detail]]] ([RecipeID], [IngreID], [Quantity], [UnitMeasurement])
VALUES ('1         ', '7         ', 15, N'g');
PRINT '   ✅ Tỏi: 15g'

PRINT ''
PRINT '✅ Đã thêm 7 nguyên liệu cho Cơm gà xối mỡ'
PRINT ''

-- ============================================
-- 3. CẬP NHẬT MÔ TẢ CÔNG THỨC
-- ============================================
PRINT '📝 Cập nhật mô tả công thức...'
UPDATE [[Recipe]]]
SET [RecipeDescription] = N'Cơm gà Hải Nam truyền thống với gà luộc mềm, cơm thơm mùi hành và gừng, ăn kèm nước chấm đặc biệt'
WHERE [RecipeID] = '1         ';
PRINT '   ✅ Đã cập nhật mô tả'
PRINT ''

-- ============================================
-- 4. KIỂM TRA KẾT QUẢ
-- ============================================
PRINT '═══════════════════════════════════════════════════════'
PRINT '🔍 KIỂM TRA KẾT QUẢ'
PRINT '═══════════════════════════════════════════════════════'
PRINT ''

SELECT 
    r.[RecipeID],
    r.[RecipeDescription],
    COUNT(rd.[IngreID]) as [SoLuongNguyenLieu]
FROM [[Recipe]]] r
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
WHERE r.[RecipeID] = '1         '
GROUP BY r.[RecipeID], r.[RecipeDescription];

PRINT ''
PRINT '📋 CHI TIẾT NGUYÊN LIỆU:'
PRINT ''

SELECT 
    ROW_NUMBER() OVER (ORDER BY rd.[IngreID]) AS [STT],
    i.[IngreName] AS [TenNguyenLieu],
    rd.[Quantity] AS [SoLuong],
    rd.[UnitMeasurement] AS [DonVi]
FROM [[Recipe_Detail]]] rd
INNER JOIN [[Ingredient]]] i ON rd.[IngreID] = i.[IngreID]
WHERE rd.[RecipeID] = '1         '
ORDER BY rd.[IngreID];

PRINT ''
PRINT '═══════════════════════════════════════════════════════'
PRINT '✅ HOÀN THÀNH!'
PRINT '═══════════════════════════════════════════════════════'
GO
