# Deployment & Utility Scripts

This folder contains deployment scripts and utility tools for the RMS API Server.

## 📁 Scripts Overview

### 🚀 Deployment Scripts

#### Production Deployment
- **deploy-production.ps1** / **deploy-production.sh** - Main production deployment
- **deploy-to-remote.ps1** - Deploy to remote server

#### CORS-Fixed Deployments
- **deploy-cors-fixed.ps1** / **deploy-cors-fixed.sh** - Deploy with CORS fixes (v1)
- **deploy-cors-fixed-v2.ps1** / **deploy-cors-fixed-v2.sh** - Deploy with CORS fixes (v2)

#### Database Deployment
- **deploy-with-database.sh** - Deploy with database initialization

### 🧪 Testing & Diagnostics
- **test-api-quick.ps1** - Quick API endpoint testing
- **start-test-server.ps1** - Start test development server
- **diagnose-orders-issue.ps1** - Diagnose order-related issues

### 🗄️ Database Utilities
- **check-remote-database.ps1** - Check remote database connectivity
- **create-test-data.ps1** - Generate test data for development

## 🎯 Usage Examples

### Deploy to Production
```powershell
# Windows
.\scripts\deploy-production.ps1

# Linux/Mac
./scripts/deploy-production.sh
```

### Quick API Test
```powershell
.\scripts\test-api-quick.ps1
```

### Check Database
```powershell
.\scripts\check-remote-database.ps1
```

## ⚙️ Prerequisites

- **PowerShell**: For .ps1 scripts (Windows/cross-platform)
- **Bash**: For .sh scripts (Linux/Mac)
- **Docker**: For deployment scripts
- **SQL Server Tools**: For database scripts

## 📝 Notes

- Always test deployment scripts in staging before production
- Ensure Docker is running before executing deployment scripts
- Database scripts require proper credentials configured
- CORS-fixed versions include additional CORS middleware configuration
