# RMS Project Handover Document

## Project Overview
**Project:** Restaurant Management System (RMS)
**Branch:** `RMSMobile-Testing`
**Student:** Cao Thien Bao, ID: 23DH114212
**Location:** `C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System`

The project is a restaurant management system with:
- **RMS-APIServer** — ASP.NET Core 8.0 backend (migrated to MySQL)
- **RMSMobile** — React Native (Expo) frontend supporting Android/iOS/Web
- **Restaurant Management features:** Menu management, Order management, Table management, Bill management, Reports, User management, Ingredient management

---

## Server Information & Configuration

### Server Access
- **IP:** `192.168.192.85`
- **SSH:** `root` / `CaoBao2211`
- **NOTE:** SSH connection hangs from local machine (password auth timeout). Use **Portainer** at `http://192.168.192.85:9000` for all server/deployment operations.

### MySQL Database
- **Container:** `rms-mysql`
- **Port:** `3306`
- **Root Password:** `CaoBao2211`
- **Database:** `webQLQuanAn`
- **Tables:** 14 tables, 482 rows total

### API Server
- **Container:** `rms-api-server`
- **Port:** `8080`
- **URL:** `http://192.168.192.85:8080`
- **Stack:** ASP.NET Core 8.0 + Pomelo.EntityFrameworkCore.MySql 8.0.2
- **Connection String:** `Server=db;Database=webQLQuanAn;User=root;Password=CaoBao2211;AllowPublicKeyRetrieval=True;SslMode=None;`

### WordPress Site
- **URL:** `http://192.168.192.85:8082`
- **Admin Login:** `admin` / `CaoBao2211`
- **XML-RPC Endpoint:** `http://192.168.192.85:8082/xmlrpc.php`

### Frontend (Web)
- **Local Dev Server:** `http://localhost:8081`
- **Start Command:**
  ```
  cd C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing
  npm run web
  ```

---

## User Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | VAnh | VAnh123 |
| Staff | abc | abc1234 |
| Kitchen | khang | khang123 |
| Cashier | bao | bao2211 |
| Customer | ngoc | Ngoc123 |

---

## MCP Tools Configured
- **opencode.json:** `C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\opencode.json`
- **BrowserOS:** `http://127.0.0.1:9000/mcp` (may need manual start)
- **Figma Write Server:** Cloned and built
- **WordPress MCP:** `docdyhr/mcp-wordpress` cloned and built
- **PDF Reader:** `mcp-pdf` v1.1.0 installed

---

## What Has Been Done

### 1. Database Migration (SQL Server → MySQL)
- Exported all 14 tables (482 rows) from SQL Server to MySQL-compatible `.sql` file (`webQLQuanAn_mysql.sql`)
- Created `export_to_mysql.ps1` script
- Replaced SQL Server with Pomelo.EntityFrameworkCore.MySql 8.0.2
- Updated `DBContext.cs`, `WebQlquanAnContext.cs`, `Program.cs`

### 2. Docker Deployment
- `docker-compose.yml` — MySQL 8.0 + API server containers
- Built `rms-api-build.tar` (219 KB) and deployed via Portainer
- API accessible at `http://192.168.192.85:8080`

### 3. Figma Page Layouts Created
- Client Flow: Home, Menu, Login, Orders, Profile screens
- Admin Flow: Admin Home Dashboard
- Screenshots saved as `.png` files in project root

### 4. WordPress LAB2 Exercises (LAB2-TH-TMDT.pdf)
- **Bài tập 1 (COMPLETED):**
  - Created 8 Categories (Thời sự, Chính trị, Pháp luật, Kinh tế, Giáo dục, Tuyển Sinh, Nhà trường, Du lịch)
  - Created 9 Tags (ChatGPT, Chương trình đào tạo, Trí tuệ nhân tạo, Chuẩn đầu ra, Chương trình học, Chỉ tiêu tuyển sinh, Giá vàng, Lãi suất, Bất động sản)
  - Created Pages (Trang chủ, Giới thiệu, Liên hệ)
  - Created User `tacgia`/`tacgia123` with Author role
  - Site title set to "Cao Thien Bao - 23DH114212"
  - Theme changed to Twenty Twenty-Five
  - Screenshots saved: `LAB2_Screenshots/bai_tap1_categories.png`, `bai_tap1_tags.png`, `bai_tap1_pages.png`, `bai_tap1_users.png`

- **Bài tập 2 (PARTIALLY DONE):**
  - Theme Twenty Twenty-Five activated, Hello Elementor + NexusSlash installed
  - Theme install page screenshot saved: `LAB2_Screenshots/bai_tap2_themes_installed.png`
  - NEED: Proper screenshot of installed themes from Themes page

- **Bài tập 3 (PARTIALLY DONE):**
  - Contact Form 7 is NOT installed (searched but not found in plugins list)
  - Advanced Editor Tools is NOT installed
  - Screenshots exist from plugin search page but plugins are not actually installed
  - NEED: Actually install Contact Form 7 + Advanced Editor Tools, then take screenshots

- **Bài tập 4 (NOT DONE):**
  - Navigation menu NOT configured
  - NEED: Create menu with Trang chủ + Liên hệ pages, assign to primary menu location, take screenshot

---

## What Needs To Be Done Next

### WordPress LAB2 (Priority)
1. **Install Contact Form 7 plugin** — Go to `http://192.168.192.85:8082/wp-admin/plugin-install.php`, search "Contact Form 7", install and activate
2. **Install Advanced Editor Tools plugin** — Same page, search "Advanced Editor Tools", install and activate
3. **Take screenshots** of both plugins installed on the Plugins page (`/wp-admin/plugins.php`)
4. **Configure navigation menu** — Go to Appearance > Menus, create menu with Trang chủ + Liên hệ pages, assign to Primary Menu location
5. **Take screenshot** of the menu configuration
6. **Save all screenshots** to `LAB2_Screenshots/`

### Remaining Work
- Create remaining Figma admin screens (Menu Management, Reports, Tables, User Management, Ingredients, Order Details)
- Full testing of all 5 roles after deployment

---

## Key Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Docker deployment config |
| `.env` | MySQL password, JWT key |
| `opencode.json` | MCP tool configuration |
| `webQLQuanAn_mysql.sql` | MySQL database import file |
| `rms-api-build.tar` | Docker build context |
| `export_to_mysql.ps1` | SQL Server to MySQL export script |
| `LAB2-TH-TMDT.pdf` | WordPress lab exercise PDF |
| `LAB2_Screenshots/` | Output folder for exercise screenshots |
| `RMSMobile/Restaurant-Manangment-System-RMSMobile-Testing/` | Main frontend (Expo React Native) |
| `RMS-APIServer/` | Backend API source code |
