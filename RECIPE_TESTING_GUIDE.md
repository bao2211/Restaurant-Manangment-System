# 🧪 HƯỚNG DẪN TEST CHỨC NĂNG QUẢN LÝ CÔNG THỨC

## 📋 Mục Lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Test API bằng HTML Tool](#test-api-bằng-html-tool)
3. [Test trên Mobile App](#test-trên-mobile-app)
4. [Các lỗi thường gặp](#các-lỗi-thường-gặp)
5. [Checklist](#checklist)

---

## 🔧 Chuẩn Bị

### 1. Kiểm tra Database
Đảm bảo database có cấu trúc đúng:

```sql
-- Bảng Recipe
CREATE TABLE [dbo].[[Recipe]]](
    [RecipeID] [char](10) NOT NULL PRIMARY KEY,
    [RecipeDescription] [nvarchar](200) NULL,
    [FoodID] [char](10) NULL
)

-- Bảng Recipe_Detail
CREATE TABLE [dbo].[[Recipe_Detail]]](
    [RecipeID] [char](10) NOT NULL,
    [IngreID] [char](10) NOT NULL,
    [UnitMeasurement] [nvarchar](20) NULL,
    [Quantity] [bigint] NULL,
    PRIMARY KEY (RecipeID, IngreID)
)
```

### 2. Kiểm tra dữ liệu mẫu

```sql
-- Xem danh sách Food
SELECT TOP 5 * FROM [[Food_Info]]]
-- Kết quả mong đợi: F001, F002, F003...

-- Xem danh sách Ingredient
SELECT TOP 5 * FROM [[Ingredient]]]
-- Kết quả mong đợi: I001, I002, I003...

-- Xem Recipe hiện có
SELECT * FROM [[Recipe]]]

-- Xem Recipe Detail hiện có
SELECT * FROM [[Recipe_Detail]]]
```

### 3. Chạy API Server

```powershell
# Chuyển đến thư mục API
cd D:\rm\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\RMS-APIServer

# Chạy server
dotnet run
```

**Xác nhận server đang chạy:**
- Console hiện: `Now listening on: http://localhost:5000`
- Không có lỗi CORS

---

## 🌐 Test API Bằng HTML Tool

### Bước 1: Mở file test HTML

```powershell
# Mở file trong trình duyệt
start D:\rm\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\test-recipe-api.html
```

### Bước 2: Test Connection

1. Đảm bảo API URL là: `http://localhost:5000`
2. Click nút **"🔍 Test Connection"**
3. **Kết quả mong đợi:** 
   ```
   ✅ Connection successful!
   Status: 200
   API is reachable.
   ```

### Bước 3: Test GET - Xem dữ liệu

#### 3.1. Get All Recipes
- Click **"Get All Recipes"**
- **Kết quả mong đợi:** Danh sách tất cả recipes (có thể rỗng nếu chưa có dữ liệu)

#### 3.2. Get All Ingredients
- Click **"Get All Ingredients"**
- **Kết quả mong đợi:**
  ```json
  [
    {
      "ingreId": "I001",
      "ingreName": "Thịt Bò",
      "ingreDescription": "...",
      "ingreUnit": "kg"
    },
    ...
  ]
  ```

#### 3.3. Get All Foods
- Click **"Get All Foods"**
- **Kết quả mong đợi:**
  ```json
  [
    {
      "foodId": "F001",
      "foodName": "Phở Bò",
      "categoryId": "C001",
      ...
    },
    ...
  ]
  ```

### Bước 4: Test CREATE - Tạo công thức mới

#### 4.1. Chuẩn bị dữ liệu
Từ danh sách Foods và Ingredients ở bước 3, chọn:
- 1 Food ID (ví dụ: `F001`)
- 2-3 Ingredient IDs (ví dụ: `I001`, `I002`, `I003`)

#### 4.2. Tạo Recipe mới

1. **Recipe ID:** `RC001` (hoặc tự động: `RC` + timestamp)
2. **Food ID:** `F001` (món bạn chọn)
3. **Description:** 
   ```
   Thái thịt bò mỏng, ướp gia vị. 
   Luộc bánh phở. 
   Nấu nước dùng với xương bò.
   Trình bày và ăn nóng.
   ```

4. **Ingredients:**
   - Row 1: `I001` | `500` | `g`
   - Row 2: `I002` | `200` | `g`
   - Row 3: `I003` | `50` | `ml`

5. Click **"💾 Create Recipe"**

6. **Kết quả mong đợi:**
   ```
   ✅ Recipe Created Successfully!
   
   Recipe: {
     "recipeId": "RC001",
     "foodId": "F001",
     "recipeDescription": "..."
   }
   
   Details:
   ✅ Added: I001 - 500g
   ✅ Added: I002 - 200g
   ✅ Added: I003 - 50ml
   ```

### Bước 5: Test READ - Xem công thức vừa tạo

1. Nhập **Food ID:** `F001` (món vừa tạo)
2. Click **"Get Recipe"**
3. **Kết quả mong đợi:**
   ```json
   [
     {
       "recipeId": "RC001",
       "foodId": "F001",
       "foodName": "Phở Bò",
       "recipeDescription": "...",
       "recipeDetails": [
         {
           "ingredientId": "I001",
           "ingredientName": "Thịt Bò",
           "quantity": 500,
           "unitMeasurement": "g"
         },
         ...
       ]
     }
   ]
   ```

### Bước 6: Test UPDATE - Cập nhật công thức

1. **Recipe ID:** `RC001`
2. **Food ID:** `F001`
3. **New Description:**
   ```
   Công thức đã được cập nhật.
   Thêm hành tây và rau thơm.
   ```
4. Click **"💾 Update Recipe"**
5. **Kết quả mong đợi:**
   ```
   ✅ Recipe RC001 updated successfully!
   ```

### Bước 7: Test Recipe Details Management

#### 7.1. Thêm ingredient mới vào recipe
1. **Recipe ID:** `RC001`
2. **Ingredient ID:** `I004`
3. **Quantity:** `100`
4. **Unit:** `g`
5. Click **"➕ Add Detail"**

#### 7.2. Xem tất cả details
1. **Recipe ID:** `RC001`
2. Click **"📋 Get Details"**
3. Xác nhận có ingredient mới

#### 7.3. Xóa một detail
1. **Recipe ID:** `RC001`
2. **Ingredient ID:** `I004`
3. Click **"❌ Delete Detail"**

### Bước 8: Test DELETE - Xóa công thức

1. **Recipe ID:** `RC001`
2. Click **"🗑️ Delete Recipe"**
3. Xác nhận xóa
4. **Kết quả mong đợi:**
   ```json
   {
     "message": "Recipe deleted successfully.",
     "deletedRecipe": {
       "recipeId": "RC001",
       ...
     }
   }
   ```

---

## 📱 Test Trên Mobile App

### Bước 1: Chạy App

```powershell
# Chuyển đến thư mục Mobile
cd D:\rm\Restaurant-Manangment-System\RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing

# Chạy app
npm start
# hoặc
npx expo start
```

### Bước 2: Kiểm tra API Configuration

1. Mở file: `services/apiService.js`
2. Xác nhận `BASE_URL` đúng:
   ```javascript
   const BASE_URL = 'http://192.168.1.x:5000'; // IP của máy chạy API
   ```

### Bước 3: Test RecipeManagerScreen

#### 3.1. Vào màn hình Recipe Manager
1. Mở app trên điện thoại/emulator
2. Đăng nhập với tài khoản Manager
3. Vào menu **"Quản lý công thức"**

#### 3.2. Test Hiển thị danh sách
✅ **Checklist:**
- [ ] Danh sách món ăn hiển thị đầy đủ
- [ ] Ảnh món ăn hiển thị đúng
- [ ] Badge "Có công thức" / "Chưa có" hiển thị chính xác
- [ ] Thanh tìm kiếm hoạt động
- [ ] Nút refresh hoạt động

#### 3.3. Test Xem công thức

1. **Chọn món có công thức:**
   - Xem có hiển thị mô tả không
   - Xem có hiển thị danh sách nguyên liệu không
   - Mỗi nguyên liệu có:
     - Icon màu sắc đúng
     - Tên nguyên liệu
     - Số lượng + đơn vị

2. **Chọn món chưa có công thức:**
   - Hiển thị "Chưa có công thức cho món này"
   - Có nút "Tạo Công Thức"

#### 3.4. Test TẠO công thức mới

1. Chọn món **CHƯA CÓ** công thức
2. Click nút **"Tạo Công Thức"** (hoặc nút tạo ở dưới)
3. Chuyển sang chế độ Edit
4. Nhập mô tả công thức (ít nhất 10 ký tự)
5. Thêm nguyên liệu:
   - Click **"Thêm"**
   - Chọn ingredient từ danh sách chips (màu cam khi chọn)
   - Nhập số lượng (ví dụ: 500)
   - Nhập đơn vị (ví dụ: g)
   - Thêm thêm 2-3 nguyên liệu nữa
6. Click **"Lưu"**
7. Đợi loading
8. **Kết quả mong đợi:**
   - Alert "Đã tạo công thức mới với X nguyên liệu"
   - Modal đóng
   - Reload data
   - Badge món đổi sang "Có công thức" (màu xanh)

#### 3.5. Test SỬA công thức

1. Chọn món **ĐÃ CÓ** công thức
2. Xem công thức hiện tại
3. Click nút **"Sửa"** (màu xanh dương)
4. Chế độ Edit được bật
5. Sửa mô tả công thức
6. Xóa 1 nguyên liệu (click icon 🗑️)
7. Thêm 1 nguyên liệu mới
8. Sửa số lượng của nguyên liệu hiện có
9. Click **"Lưu"**
10. **Kết quả mong đợi:**
    - Alert "Đã cập nhật công thức với X nguyên liệu"
    - Modal đóng
    - Reload data
    - Mở lại món để xem thay đổi

#### 3.6. Test XÓA công thức

1. Chọn món có công thức
2. Click nút **"Xóa"** (màu đỏ, bên trái)
3. Xác nhận xóa trong Alert
4. **Kết quả mong đợi:**
   - Alert "Đã xóa công thức"
   - Modal đóng
   - Reload data
   - Badge món đổi sang "Chưa có công thức" (màu đỏ)

---

## ⚠️ Các Lỗi Thường Gặp

### 1. Lỗi: "Cannot insert duplicate key"

**Nguyên nhân:** Recipe ID hoặc Recipe Detail đã tồn tại

**Giải pháp:**
- Kiểm tra ID có tồn tại chưa
- Dùng ID mới hoặc xóa recipe cũ trước

### 2. Lỗi: "Foreign key constraint"

**Nguyên nhân:** 
- Food ID không tồn tại
- Ingredient ID không tồn tại

**Giải pháp:**
```sql
-- Kiểm tra Food ID có tồn tại
SELECT * FROM [[Food_Info]]] WHERE FoodID = 'F001'

-- Kiểm tra Ingredient ID có tồn tại
SELECT * FROM [[Ingredient]]] WHERE IngreID = 'I001'
```

### 3. Lỗi: Ingredient ID không đúng format

**Nguyên nhân:** API cần format `I001`, nhưng app gửi `1`

**Giải pháp:** Đã có hàm `formatIngreId()` trong code để tự động chuyển đổi
```javascript
// 1 → I001
// I001 → I001
```

### 4. Lỗi: Network Error

**Nguyên nhân:**
- API server không chạy
- IP không đúng
- CORS không được cấu hình

**Giải pháp:**
```powershell
# Kiểm tra API đang chạy
curl http://localhost:5000/api/Recipe

# Kiểm tra IP của máy
ipconfig

# Cập nhật BASE_URL trong apiService.js
```

### 5. Lỗi: Quantity phải là số

**Nguyên nhân:** Nhập chữ vào trường số lượng

**Giải pháp:** Đảm bảo `keyboardType="numeric"` và `parseFloat()` trước khi gửi

---

## ✅ Checklist Kiểm Tra Hoàn Chỉnh

### API Backend
- [ ] API server đang chạy (port 5000)
- [ ] Database có dữ liệu Food và Ingredient
- [ ] CORS được cấu hình đúng
- [ ] Test connection thành công bằng HTML tool

### HTML Test Tool
- [ ] GET all recipes hoạt động
- [ ] GET all ingredients hoạt động
- [ ] GET all foods hoạt động
- [ ] GET recipe by food ID hoạt động
- [ ] CREATE recipe thành công
- [ ] CREATE recipe details thành công
- [ ] UPDATE recipe thành công
- [ ] DELETE recipe detail thành công
- [ ] DELETE recipe thành công

### Mobile App - Display
- [ ] Danh sách món hiển thị đầy đủ
- [ ] Ảnh món hiển thị
- [ ] Badge trạng thái công thức chính xác
- [ ] Search hoạt động
- [ ] Refresh hoạt động
- [ ] Modal mở/đóng mượt mà

### Mobile App - Read
- [ ] Xem công thức của món có sẵn
- [ ] Hiển thị mô tả công thức
- [ ] Hiển thị danh sách nguyên liệu với icon
- [ ] Hiển thị số lượng và đơn vị
- [ ] Xử lý món chưa có công thức

### Mobile App - Create
- [ ] Nút "Tạo công thức" xuất hiện
- [ ] Chuyển sang chế độ edit
- [ ] Nhập mô tả hoạt động
- [ ] Thêm/xóa dòng nguyên liệu
- [ ] Chọn ingredient từ chips
- [ ] Nhập số lượng và đơn vị
- [ ] Validation (mô tả, ít nhất 1 nguyên liệu)
- [ ] Lưu thành công
- [ ] Hiển thị thông báo thành công
- [ ] Reload và cập nhật badge

### Mobile App - Update
- [ ] Nút "Sửa" xuất hiện khi có công thức
- [ ] Chuyển sang chế độ edit
- [ ] Load dữ liệu cũ đúng
- [ ] Sửa mô tả
- [ ] Thêm nguyên liệu mới
- [ ] Xóa nguyên liệu cũ
- [ ] Sửa số lượng nguyên liệu
- [ ] Lưu thành công
- [ ] Reload và xem thay đổi

### Mobile App - Delete
- [ ] Nút "Xóa" xuất hiện
- [ ] Hiển thị xác nhận xóa
- [ ] Xóa thành công
- [ ] Hiển thị thông báo
- [ ] Reload và cập nhật badge

### Error Handling
- [ ] Validation trường trống
- [ ] Validation số lượng phải > 0
- [ ] Xử lý network error
- [ ] Xử lý API error
- [ ] Hiển thị thông báo lỗi rõ ràng
- [ ] Loading indicator khi xử lý

---

## 📊 Test Cases Mẫu

### Test Case 1: Tạo công thức Phở Bò
```
Recipe ID: RC001
Food ID: F001 (Phở Bò)
Description: Luộc xương bò 2 tiếng. Thái thịt mỏng. Trần bánh phở. Cho vào tô và ăn nóng.

Ingredients:
- I001 (Thịt Bò): 300g
- I005 (Bánh Phở): 200g
- I008 (Hành lá): 20g
- I010 (Nước mắm): 30ml
```

### Test Case 2: Sửa công thức Cơm Gà
```
Recipe ID: RC002 (existing)
Update Description: Thêm gừng vào khi nấu để thơm hơn.

Remove Ingredient: I015
Add Ingredient: I012 (Gừng): 50g
Update Quantity: I002 (500g → 600g)
```

### Test Case 3: Xóa công thức không dùng
```
Recipe ID: RC003
Confirm: Yes
Expected: Recipe và tất cả details bị xóa
```

---

## 🎯 Kết Luận

Sau khi hoàn thành tất cả các bước test:

1. ✅ **API hoạt động:** GET, POST, PUT, DELETE
2. ✅ **Database structure đúng:** Recipe, Recipe_Detail
3. ✅ **Mobile app CRUD:** Tạo, Đọc, Sửa, Xóa
4. ✅ **Error handling:** Validation, network, API errors
5. ✅ **User experience:** Loading, alerts, navigation

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra console logs (F12 trên browser, LogBox trên app)
2. Kiểm tra API response trong Network tab
3. Xem database bằng SQL Management Studio
4. Review lại các bước trong guide này

**Happy Testing! 🚀**
