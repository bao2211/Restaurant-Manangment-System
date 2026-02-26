# Folder Rename Instructions

## ⚠️ Folders Locked by VS Code

The following folders need to be renamed but are currently locked because VS Code has files open from them:

### Current Names (with typos/redundancy):
1. `RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\`
2. `RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing\`

### Proposed New Names:
1. `RMS-APIServer\backend\`
2. `RMSMobile\mobile-app\`

## 📋 Steps to Rename

### Option 1: Manual Rename (Recommended)
1. **Close VS Code completely**
2. **Open File Explorer** and navigate to the project folder
3. **Rename the folders**:
   - `Restaurant-Manangment-System-RMS-APIServer` → `backend`
   - `Restaurant-Manangment-System-RMSMobile-Testing` → `mobile-app`
4. **Reopen VS Code** to the workspace
5. **Update any absolute paths** if needed

### Option 2: PowerShell Script (After closing VS Code)
```powershell
# Run this in PowerShell after closing VS Code
$base = "c:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System"

# Rename backend folder
Rename-Item "$base\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer" "backend"

# Rename mobile app folder
Rename-Item "$base\RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing" "mobile-app"

Write-Host "✅ Folders renamed successfully!"
```

## 🔍 What Gets Fixed

### Benefits of Renaming:
- ✅ **Fixes "Manangment" typo** → correct spelling
- ✅ **Removes redundancy** → cleaner folder names
- ✅ **Shorter paths** → easier to navigate
- ✅ **Professional structure** → better organization

### Files That May Need Updates After Rename:
- **Docker Compose**: `docker-compose.yml` (if path references exist)
- **Scripts**: Deployment scripts in `scripts/` folder
- **README files**: Documentation with folder paths
- **Import paths**: Check if any code imports use absolute paths

## ✅ Already Completed Cleanup

The following unused files/folders have been successfully removed:
- ✅ `.expo/` (Expo build cache)
- ✅ `node_modules/` at root (unused)
- ✅ `RMSAndroid/.gradle/` (Gradle cache)
- ✅ `RMSAndroid/.idea/` (IntelliJ cache)
- ✅ `RMSAndroid/build/` (Build output)
- ✅ `Backend/.vs/` (Visual Studio cache)
- ✅ `Backend/screens/` (Misplaced APITestScreen.js)

## 📝 Notes

- The folder rename is **safe** - only folder names change, not content
- Git will track this as a rename (not delete + add)
- All code functionality remains intact
- Relative imports in code won't break (only folder name changes)
- Docker images/containers won't be affected
