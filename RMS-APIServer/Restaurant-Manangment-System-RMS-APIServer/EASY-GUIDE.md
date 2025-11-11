# 🚀 HƯỚNG DẪN NHANH - 3 BƯỚC ĐƠN GIẢN

## ✅ CÁCH 1: SỬ DỤNG AZURE DATA STUDIO (KHUYÊN DÙNG - DỄ NHẤT!)

### Bước 1: Mở Azure Data Studio
- Nếu chưa có, tải tại: https://aka.ms/azuredatastudio
- Hoặc dùng SQL Server Management Studio (SSMS)

### Bước 2: Kết nối
```
Server: 46.250.231.129
Authentication: SQL Login
User: sa
Password: [nhập password của bạn]
Database: webQLQuanAn
```

### Bước 3: Chạy SQL
1. Mở file `SIMPLE-UPDATE.sql`
2. Nhấn **Run** hoặc **F5**
3. Xong! ✅

---

## ✅ CÁCH 2: SỬ DỤNG COMMAND LINE (NHANH NHẤT!)

Mở PowerShell và chạy:

```powershell
cd "d:\rm\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer"

sqlcmd -S 46.250.231.129 -d webQLQuanAn -U sa -P YourPasswordHere -i SIMPLE-UPDATE.sql
```

**Thay `YourPasswordHere` bằng password SQL Server của bạn**

---

## ✅ CÁCH 3: COPY-PASTE VÀO WEB TOOL

Nếu bạn có tool web để quản lý SQL Server:

1. Mở file `SIMPLE-UPDATE.sql`
2. Copy toàn bộ nội dung
3. Paste vào web tool
4. Chạy!

---

## 📊 KIỂM TRA KẾT QUẢ

Sau khi chạy, bạn sẽ thấy:

```
TenMon              SoNguyenLieu
─────────────────── ────────────
Cơm gà xối mỡ       7
Cơm sườn            5
Gà chiên mắm        4
Mì xào hải sản      4
```

---

## 🔧 NẾU GẶP LỖI

### Lỗi: "Login failed"
→ Kiểm tra username và password

### Lỗi: "Cannot open database"  
→ Kiểm tra tên database: `webQLQuanAn`

### Lỗi: "Sqlcmd not found"
→ Cài SQL Server Command Line Utilities

---

## 📱 KIỂM TRA TRÊN APP

1. Reload app React Native (shake device → Reload)
2. Vào **Menu** → **Quản lý công thức**
3. Nhấn vào **Cơm gà xối mỡ**
4. Bạn sẽ thấy 7 nguyên liệu với đầy đủ định lượng! 🎉

---

## ⚡ LƯU Ý

- File `SIMPLE-UPDATE.sql` chứa TẤT CẢ các lệnh cần thiết
- Chỉ cần chạy 1 file duy nhất này!
- Mất khoảng 2-3 giây để hoàn thành

**Chúc bạn thành công!** 🎉
