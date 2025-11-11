# 📚 TÓM TẮT: CẬP NHẬT ĐỊNH LƯỢNG NGUYÊN LIỆU

## ✅ ĐÃ TẠO CÁC FILE SAU:

### 📄 SQL Scripts (Khuyên dùng)
1. **`update-recipe-quantities.sql`** - Cập nhật Cơm gà xối mỡ với 7 nguyên liệu
2. **`update-other-recipes.sql`** - Cập nhật 3 món khác (Mì xào, Cơm sườn, Gà chiên mắm)

### 🔧 PowerShell Script
3. **`run-update-recipes.ps1`** - Script tự động chạy cả 2 file SQL ở trên

### 📖 Documentation
4. **`README-UPDATE-RECIPES.md`** - Hướng dẫn chi tiết

---

## 🎯 CÔNG THỨC ĐÃ CẬP NHẬT:

### 1️⃣ CƠM GÀ XỐI MỠ
```
✅ Gạo: 300g
✅ Gà: 500g
✅ Cà rốt: 50g
✅ Hành tây: 30g
✅ Nghệ: 5g
✅ Gừng: 10g
✅ Tỏi: 15g
```

### 2️⃣ MÌ XÀO HẢI SẢN
```
✅ Mì: 200g
✅ Cà rốt: 100g
✅ Hành tây: 50g
✅ Tỏi: 10g
```

### 3️⃣ CƠM SƯỜN
```
✅ Gạo: 250g
✅ Cà rốt: 30g
✅ Hành tây: 20g
✅ Tỏi: 10g
✅ Gừng: 5g
```

### 4️⃣ GÀ CHIÊN MẮM
```
✅ Gà: 600g
✅ Tỏi: 20g
✅ Gừng: 15g
✅ Nghệ: 3g
```

---

## 🚀 CÁCH SỬ DỤNG (3 PHƯƠNG ÁN):

### 📌 Phương án 1: Chạy PowerShell Script (ĐƠN GIẢN NHẤT)

```powershell
cd "d:\rm\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer"
.\run-update-recipes.ps1
```

Script sẽ hỏi password và tự động chạy tất cả.

---

### 📌 Phương án 2: Chạy SQL thủ công (AN TOÀN NHẤT)

**Bước 1:** Mở SQL Server Management Studio (SSMS)

**Bước 2:** Kết nối đến server:
- Server: `46.250.231.129`
- Database: `webQLQuanAn`
- Authentication: SQL Server
- Username: `sa`
- Password: [Nhập password của bạn]

**Bước 3:** Mở và chạy các file SQL theo thứ tự:
1. Mở `update-recipe-quantities.sql` → Nhấn F5
2. Mở `update-other-recipes.sql` → Nhấn F5

---

### 📌 Phương án 3: Chạy sqlcmd (CHO DEV)

```bash
# Cơm gà xối mỡ
sqlcmd -S 46.250.231.129 -d webQLQuanAn -U sa -P YourPassword -i update-recipe-quantities.sql

# Các món khác  
sqlcmd -S 46.250.231.129 -d webQLQuanAn -U sa -P YourPassword -i update-other-recipes.sql
```

---

## ✅ KIỂM TRA KẾT QUẢ

### 1. Kiểm tra bằng SQL:

```sql
-- Xem tổng quan
SELECT 
    f.[FoodName],
    COUNT(rd.[IngreID]) as [SoNguyenLieu]
FROM [[Recipe]]] r
INNER JOIN [[Food_Info]]] f ON r.[FoodID] = f.[FoodID]
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
GROUP BY f.[FoodName]
ORDER BY f.[FoodName];

-- Xem chi tiết Cơm gà
SELECT 
    i.[IngreName],
    rd.[Quantity],
    rd.[UnitMeasurement]
FROM [[Recipe_Detail]]] rd
INNER JOIN [[Ingredient]]] i ON rd.[IngreID] = i.[IngreID]
WHERE rd.[RecipeID] = '1         ';
```

### 2. Kiểm tra trên App Mobile:

1. Mở app React Native
2. Vào **Menu** → **Quản lý công thức**
3. Nhấn vào món **Cơm gà xối mỡ**
4. Kiểm tra xem có hiển thị đầy đủ 7 nguyên liệu với định lượng không

---

## 🐛 TROUBLESHOOTING

| Vấn đề | Giải pháp |
|--------|-----------|
| `Cannot open database` | Kiểm tra connection string và firewall |
| `Login failed for user` | Kiểm tra username/password |
| `Duplicate key` | Chạy DELETE trước hoặc dùng MERGE |
| `Foreign key constraint` | Kiểm tra RecipeID và IngreID tồn tại |

---

## 📱 TIẾP THEO

Sau khi chạy SQL scripts thành công:

1. ✅ Reload app React Native (shake → Reload)
2. ✅ Vào màn hình "Quản lý công thức"
3. ✅ Kiểm tra các món đã có định lượng
4. ✅ Test tạo/sửa/xóa công thức

---

## 📞 LƯU Ý BẢO MẬT

⚠️ **QUAN TRỌNG:**
- Không commit file chứa password vào Git
- Sử dụng biến môi trường cho connection string trong production
- Backup database trước khi chạy script

---

**Chúc bạn thành công! 🎉**
