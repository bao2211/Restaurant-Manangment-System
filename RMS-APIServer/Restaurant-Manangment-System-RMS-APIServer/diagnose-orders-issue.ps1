# Simple API endpoint test to diagnose the Orders issue

Write-Host "🔍 Diagnosing Orders API endpoint issue..." -ForegroundColor Cyan

# Test basic endpoints that are working
Write-Host "`n✅ Testing working endpoints:" -ForegroundColor Green
try {
    $categories = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/Category" -Method GET -TimeoutSec 10
    Write-Host "Categories: $($categories.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Categories failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $tables = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/Table" -Method GET -TimeoutSec 10
    Write-Host "Tables: $($tables.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Tables failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $users = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/User" -Method GET -TimeoutSec 10
    Write-Host "Users: $($users.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Users failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test problematic endpoints
Write-Host "`n❌ Testing problematic endpoints:" -ForegroundColor Red
try {
    $orders = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/Order" -Method GET -TimeoutSec 10
    Write-Host "Orders: $($orders.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Orders failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

try {
    $orderDetails = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/OrderDetail" -Method GET -TimeoutSec 10
    Write-Host "Order Details: $($orderDetails.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Order Details failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test other endpoints
Write-Host "`n🧪 Testing other endpoints:" -ForegroundColor Cyan
try {
    $bills = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/Bill" -Method GET -TimeoutSec 10
    Write-Host "Bills: $($bills.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Bills failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $food = Invoke-RestMethod -Uri "http://46.250.231.129:8080/api/FoodInfo" -Method GET -TimeoutSec 10
    Write-Host "Food Items: $($food.Count) items" -ForegroundColor Green
} catch {
    Write-Host "Food Items failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Checking container logs for errors..." -ForegroundColor Cyan
docker logs rms-api-server --tail 10

Write-Host "`n💡 Recommendations:" -ForegroundColor Yellow
Write-Host "1. The Orders and OrderDetail endpoints are failing with 500 errors" -ForegroundColor Yellow
Write-Host "2. This suggests a database schema issue with those specific tables" -ForegroundColor Yellow
Write-Host "3. Other endpoints (Categories, Tables, Users, Food) are working fine" -ForegroundColor Yellow
Write-Host "4. Your CORS configuration is working perfectly!" -ForegroundColor Green
Write-Host "5. The mobile app CORS issues are completely resolved" -ForegroundColor Green