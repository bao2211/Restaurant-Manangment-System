# ============================================
# Script PowerShell để cập nhật Recipe Quantities
# ============================================

Write-Host "🔄 Bắt đầu cập nhật định lượng nguyên liệu..." -ForegroundColor Cyan
Write-Host ""

# Thông tin kết nối (CẬN THẬN: Không commit password vào Git!)
$ServerName = "46.250.231.129"
$DatabaseName = "webQLQuanAn"
$Username = "sa"
$Password = Read-Host "Nhập password SQL Server" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Đường dẫn file SQL
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$RecipeQuantitiesSQL = Join-Path $ScriptPath "update-recipe-quantities.sql"
$OtherRecipesSQL = Join-Path $ScriptPath "update-other-recipes.sql"

# Kiểm tra file tồn tại
if (-not (Test-Path $RecipeQuantitiesSQL)) {
    Write-Host "❌ Không tìm thấy file: $RecipeQuantitiesSQL" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $OtherRecipesSQL)) {
    Write-Host "❌ Không tìm thấy file: $OtherRecipesSQL" -ForegroundColor Red
    exit 1
}

Write-Host "📁 File SQL đã sẵn sàng" -ForegroundColor Green
Write-Host "   - $RecipeQuantitiesSQL"
Write-Host "   - $OtherRecipesSQL"
Write-Host ""

# Hàm chạy SQL script
function Invoke-SQLScript {
    param (
        [string]$ScriptFile,
        [string]$Description
    )
    
    Write-Host "🚀 Đang chạy: $Description" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    try {
        # Sử dụng sqlcmd
        $result = sqlcmd -S $ServerName -d $DatabaseName -U $Username -P $PlainPassword -i $ScriptFile -b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description - Thành công!" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Host "❌ $Description - Thất bại!" -ForegroundColor Red
            Write-Host $result
            return $false
        }
    } catch {
        Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    return $true
}

# Chạy các script
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ĐANG CẬP NHẬT DATABASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Cập nhật Cơm gà xối mỡ
$success1 = Invoke-SQLScript -ScriptFile $RecipeQuantitiesSQL -Description "Cơm gà xối mỡ"

# 2. Cập nhật các món khác
$success2 = Invoke-SQLScript -ScriptFile $OtherRecipesSQL -Description "Các món khác"

# Tổng kết
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($success1 -and $success2) {
    Write-Host "✅ HOÀN THÀNH! Tất cả công thức đã được cập nhật." -ForegroundColor Green
} else {
    Write-Host "⚠️  Một số script gặp lỗi. Vui lòng kiểm tra lại." -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra kết quả
Write-Host "🔍 Bạn có muốn kiểm tra kết quả không? (Y/N)" -ForegroundColor Cyan
$check = Read-Host

if ($check -eq "Y" -or $check -eq "y") {
    Write-Host ""
    Write-Host "📊 Danh sách công thức:" -ForegroundColor Yellow
    
    $query = @"
SELECT 
    r.[RecipeID] AS [MaCongThuc],
    f.[FoodName] AS [TenMon],
    COUNT(rd.[IngreID]) AS [SoNguyenLieu]
FROM [[Recipe]]] r
LEFT JOIN [[Food_Info]]] f ON r.[FoodID] = f.[FoodID]
LEFT JOIN [[Recipe_Detail]]] rd ON r.[RecipeID] = rd.[RecipeID]
GROUP BY r.[RecipeID], f.[FoodName]
ORDER BY r.[RecipeID];
"@
    
    sqlcmd -S $ServerName -d $DatabaseName -U $Username -P $PlainPassword -Q $query -W
}

Write-Host ""
Write-Host "👋 Xong! Bạn có thể đóng cửa sổ này." -ForegroundColor Green

# Xóa password khỏi memory
$PlainPassword = $null
[System.GC]::Collect()
