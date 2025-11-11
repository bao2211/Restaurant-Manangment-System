# ============================================
# HƯỚNG DẪN CẬP NHẬT ĐỊNH LƯỢNG NGUYÊN LIỆU
# ============================================

## 📋 MÔ TẢ

Script này cập nhật định lượng nguyên liệu cho các công thức món ăn trong database.

## 🍽️ CÁC MÓN ĐÃ CẬP NHẬT

### 1. CƠM GÀ XỐI MỠ (Recipe ID: 1)
**Mô tả:** Cơm gà Hải Nam truyền thống với gà luộc mềm, cơm thơm mùi hành và gừng, ăn kèm nước chấm đặc biệt

**Nguyên liệu:**
- Gạo: 300g
- Gà: 500g
- Cà rốt: 50g
- Hành tây: 30g
- Nghệ: 5g
- Gừng: 10g
- Tỏi: 15g

### 2. MÌ XÀO HẢI SẢN (Recipe ID: 2)
**Mô tả:** Mì xào giòn với hải sản tươi ngon, rau củ đa dạng, nước sốt đậm đà

**Nguyên liệu:**
- Mì: 200g
- Cà rốt: 100g
- Hành tây: 50g
- Tỏi: 10g

### 3. CƠM SƯỜN (Recipe ID: 3)
**Mô tả:** Cơm sườn nướng thơm ngon với sườn ướp gia vị đặc biệt, ăn kèm rau sống

**Nguyên liệu:**
- Gạo: 250g
- Cà rốt: 30g
- Hành tây: 20g
- Tỏi: 10g
- Gừng: 5g

### 4. GÀ CHIÊN MẮM (Recipe ID: 4)
**Mô tả:** Gà chiên giòn với mắm đậm đà, gia vị thơm ngon, ăn kèm rau sống

**Nguyên liệu:**
- Gà: 600g
- Tỏi: 20g
- Gừng: 15g
- Nghệ: 3g

## 🚀 CÁCH CHẠY SQL SCRIPTS

### Phương án 1: Sử dụng SQL Server Management Studio (SSMS)

1. Mở SQL Server Management Studio
2. Kết nối đến server: `46.250.231.129` 
3. Mở file `update-recipe-quantities.sql`
4. Nhấn F5 hoặc Execute để chạy
5. Sau đó mở và chạy `update-other-recipes.sql`

### Phương án 2: Sử dụng sqlcmd (Command Line)

```bash
# Cập nhật Cơm gà xối mỡ
sqlcmd -S 46.250.231.129 -U sa -P YourPassword -i update-recipe-quantities.sql

# Cập nhật các món khác
sqlcmd -S 46.250.231.129 -U sa -P YourPassword -i update-other-recipes.sql
```

### Phương án 3: Sử dụng Azure Data Studio

1. Mở Azure Data Studio
2. Kết nối đến server
3. Mở file SQL
4. Nhấn Run để thực thi

## ✅ KIỂM TRA KẾT QUẢ

Sau khi chạy script, kiểm tra bằng query:

```sql
-- Xem tất cả công thức với số lượng nguyên liệu
SELECT 
    r.[RecipeID],
    f.[FoodName],
    COUNT(rd.[IngreID]) as [SoNguyenLieu]
FROM [[Recipe]]] r
LEFT JOIN [[Food_Info]]] f ON r.[FoodID] = f.[FoodID]
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
GROUP BY r.[RecipeID], f.[FoodName]
ORDER BY r.[RecipeID];

-- Xem chi tiết công thức Cơm gà xối mỡ
SELECT 
    i.[IngreName],
    rd.[Quantity],
    rd.[UnitMeasurement]
FROM [[Recipe_Detail]]] rd
INNER JOIN [[Ingredient]]] i ON rd.[IngreID] = i.[IngreID]
WHERE rd.[RecipeID] = '1         '
ORDER BY rd.[IngreID];
```

## 📱 KIỂM TRA TRÊN APP

Sau khi chạy SQL scripts, mở app React Native:

1. Vào menu → **Quản lý công thức**
2. Nhấn vào món **Cơm gà xối mỡ**
3. Kiểm tra xem có hiển thị đầy đủ nguyên liệu với định lượng không

## 📝 GHI CHÚ

- Tất cả ID đều có 10 ký tự (padded với spaces)
- Định lượng được lưu dạng `bigint` (số nguyên lớn)
- Đơn vị đo là `nvarchar` (hỗ trợ Unicode)
- Script sẽ tự động xóa dữ liệu cũ trước khi insert mới

## 🔧 TROUBLESHOOTING

Nếu gặp lỗi:

**Lỗi: "Cannot insert duplicate key"**
→ Chạy DELETE trước khi INSERT

**Lỗi: "Foreign key constraint"**
→ Kiểm tra RecipeID và IngreID có tồn tại không

**Lỗi: "String or binary data would be truncated"**
→ Kiểm tra độ dài của ID (phải đúng 10 ký tự)

## 📞 HỖ TRỢ

Nếu cần hỗ trợ, kiểm tra:
- Connection string trong `appsettings.json`
- Firewall có mở port 1433 không
- User có quyền INSERT/UPDATE/DELETE không
