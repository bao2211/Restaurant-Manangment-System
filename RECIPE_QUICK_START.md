# 🍽️ Recipe Management - Quick Start Guide

## 📝 Tóm Tắt Thay Đổi

### ✅ Đã Sửa/Cải Thiện:

1. **RecipeManagerScreen.js** - Chức năng CRUD hoàn chỉnh:
   - ✅ Tạo công thức mới với validation đầy đủ
   - ✅ Sửa công thức (update recipe + recipe details)
   - ✅ Xóa công thức (cascade delete details + recipe)
   - ✅ Hiển thị nguyên liệu với icon màu sắc
   - ✅ Format ingredient ID tự động (1 → I001)
   - ✅ Error handling và logging chi tiết
   - ✅ Loading states và user feedback

2. **Test Tools** - 3 công cụ test mới:
   - `test-recipe-api.html` - Web UI test đầy đủ
   - `test-recipe-quick.ps1` - PowerShell automated test
   - `check-recipe-database.sql` - Database diagnostic tool

3. **Documentation**:
   - `RECIPE_TESTING_GUIDE.md` - Hướng dẫn test chi tiết

---

## 🚀 Cách Test Nhanh

### Bước 1: Kiểm tra Database
```sql
-- Mở SQL Server Management Studio
-- Chạy file: check-recipe-database.sql
```

**Kết quả mong đợi:**
- ✅ Tất cả bảng tồn tại
- ✅ Có dữ liệu Foods và Ingredients
- ✅ Foreign keys hợp lệ

### Bước 2: Chạy API Server
```powershell
cd RMS-APIServer\RMS-APIServer
dotnet run
```

**Xác nhận:** Console hiện `Now listening on: http://localhost:5000`

### Bước 3: Test API với PowerShell
```powershell
cd RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer
.\test-recipe-quick.ps1
```

**Kết quả mong đợi:**
```
✅ API is running
✅ Found X foods
✅ Found Y ingredients
✅ Found Z recipes
```

### Bước 4: Test API với HTML Tool
```powershell
# Mở trong browser
start test-recipe-api.html
```

**Test sequence:**
1. Click "Test Connection" → ✅ Success
2. Click "Get All Ingredients" → Xem danh sách
3. Click "Get All Foods" → Xem danh sách
4. Tạo recipe mới:
   - Recipe ID: RC001
   - Food ID: F001 (chọn từ danh sách)
   - Description: Nhập mô tả
   - Ingredients: Thêm 2-3 nguyên liệu
   - Click "Create Recipe"
5. Get recipe vừa tạo → Xác nhận data đúng
6. Update recipe → Test sửa
7. Delete recipe → Test xóa

### Bước 5: Test trên Mobile App

#### 5.1. Cấu hình API URL
```javascript
// Sửa file: services/apiService.js
const BASE_URL = 'http://YOUR_IP:5000'; // Thay YOUR_IP bằng IP máy
```

#### 5.2. Chạy App
```powershell
cd RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing
npm start
```

#### 5.3. Test Workflow

**Test TẠO công thức:**
1. Mở RecipeManagerScreen
2. Chọn món CHƯA có công thức (badge đỏ)
3. Click "Tạo Công Thức" hoặc nút tạo ở footer
4. Nhập mô tả (ít nhất 10 ký tự)
5. Thêm nguyên liệu:
   - Click nút "Thêm"
   - Chọn ingredient (chip chuyển màu cam)
   - Nhập số lượng và đơn vị
   - Lặp lại cho 2-3 nguyên liệu
6. Click "Lưu"
7. ✅ Alert "Đã tạo công thức..."
8. ✅ Badge đổi sang xanh "Có công thức"

**Test SỬA công thức:**
1. Chọn món ĐÃ có công thức (badge xanh)
2. Click "Sửa" (nút xanh dương)
3. Sửa mô tả
4. Xóa 1 ingredient (click icon 🗑️)
5. Thêm ingredient mới
6. Sửa quantity của ingredient cũ
7. Click "Lưu"
8. ✅ Alert "Đã cập nhật..."
9. Mở lại để xác nhận thay đổi

**Test XÓA công thức:**
1. Chọn món có công thức
2. Click "Xóa" (nút đỏ, bên trái)
3. Xác nhận xóa
4. ✅ Alert "Đã xóa..."
5. ✅ Badge đổi sang đỏ "Chưa có công thức"

---

## 📁 Files Đã Thay Đổi

### Core Files:
- ✅ `RMSMobile/.../screens/RecipeManagerScreen.js` - UI + Logic chính
- ✅ `RMSMobile/.../services/apiService.js` - Đã có sẵn API methods

### Test Files (MỚI):
- ✅ `test-recipe-api.html` - Web UI test tool
- ✅ `test-recipe-quick.ps1` - Automated test script
- ✅ `check-recipe-database.sql` - Database diagnostic

### Documentation (MỚI):
- ✅ `RECIPE_TESTING_GUIDE.md` - Hướng dẫn test đầy đủ
- ✅ `RECIPE_QUICK_START.md` - File này

---

## 🐛 Troubleshooting

### Lỗi: "Cannot insert duplicate key"
**Nguyên nhân:** Recipe ID đã tồn tại
**Giải pháp:** App tự động tạo ID unique, xóa recipe cũ nếu test

### Lỗi: "Foreign key constraint"
**Nguyên nhân:** Food ID hoặc Ingredient ID không tồn tại
**Giải pháp:** 
```sql
-- Kiểm tra IDs có tồn tại
SELECT * FROM [[Food_Info]]] WHERE FoodID = 'F001'
SELECT * FROM [[Ingredient]]] WHERE IngreID = 'I001'
```

### Lỗi: "Network Error" trên Mobile
**Nguyên nhân:** 
- API không chạy
- IP sai
- CORS không được cấu hình

**Giải pháp:**
```powershell
# 1. Kiểm tra API
curl http://localhost:5000/api/Recipe

# 2. Lấy IP máy
ipconfig
# Tìm IPv4 Address (ví dụ: 192.168.1.100)

# 3. Cập nhật apiService.js
const BASE_URL = 'http://192.168.1.100:5000';
```

### Lỗi: Ingredient không được thêm
**Nguyên nhân:** Format ID không đúng
**Giải pháp:** App đã có hàm `formatIngreId()` tự động chuyển:
- `1` → `I001`
- `123` → `I123`
- `I001` → `I001` (giữ nguyên)

---

## ✅ Checklist Test Hoàn Chỉnh

### Database:
- [ ] Chạy `check-recipe-database.sql`
- [ ] Có ít nhất 5 foods
- [ ] Có ít nhất 5 ingredients
- [ ] Foreign keys hợp lệ

### API:
- [ ] Server chạy trên port 5000
- [ ] GET /api/Recipe hoạt động
- [ ] GET /api/Ingredient hoạt động
- [ ] GET /api/FoodInfo hoạt động
- [ ] Chạy `test-recipe-quick.ps1` thành công

### HTML Test Tool:
- [ ] Test connection thành công
- [ ] CREATE recipe thành công
- [ ] READ recipe thành công
- [ ] UPDATE recipe thành công
- [ ] DELETE recipe thành công

### Mobile App:
- [ ] Danh sách món hiển thị
- [ ] Badge trạng thái đúng
- [ ] Tạo công thức mới thành công
- [ ] Sửa công thức thành công
- [ ] Xóa công thức thành công
- [ ] Hiển thị nguyên liệu với icon
- [ ] Validation hoạt động
- [ ] Error handling hiển thị đúng

---

## 📞 Các Files Quan Trọng

### Core Application:
```
RecipeManagerScreen.js    - Màn hình quản lý công thức
apiService.js             - API client service
```

### Testing Tools:
```
test-recipe-api.html      - Web UI test (mở trong browser)
test-recipe-quick.ps1     - PowerShell test (chạy trong terminal)
check-recipe-database.sql - SQL diagnostic (chạy trong SSMS)
```

### Documentation:
```
RECIPE_TESTING_GUIDE.md   - Hướng dẫn test chi tiết
RECIPE_QUICK_START.md     - File này (quick reference)
```

---

## 🎯 Kết Luận

Sau khi hoàn thành test, bạn sẽ có:

✅ **Chức năng CRUD hoàn chỉnh:**
- Tạo công thức mới
- Xem công thức hiện có
- Sửa công thức
- Xóa công thức

✅ **UI/UX tốt:**
- Hiển thị nguyên liệu với icon màu sắc
- Validation rõ ràng
- Loading states
- Error messages chi tiết

✅ **Test tools đầy đủ:**
- Web UI test
- PowerShell automated test
- SQL diagnostic

✅ **Documentation:**
- Hướng dẫn test chi tiết
- Quick start guide

---

**🚀 Ready to test? Start with Step 1!**

Nếu gặp vấn đề, check:
1. Console logs (F12 trên browser, LogBox trên mobile)
2. API response trong Network tab
3. Database data trong SQL Management Studio
4. `RECIPE_TESTING_GUIDE.md` cho troubleshooting chi tiết
