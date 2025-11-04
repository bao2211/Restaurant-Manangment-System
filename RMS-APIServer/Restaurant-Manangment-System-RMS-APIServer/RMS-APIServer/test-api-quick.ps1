# Restaurant Management System - API Quick Test Script
# PowerShell script to quickly test all auxiliary features APIs

param(
    [string]$BaseUrl = "http://46.250.231.129:8080",
    [string]$Username = "admin", 
    [string]$Password = "admin123",
    [string]$TestFoodId = "F001",
    [string]$TestOrderId = "O001", 
    [string]$TestTableId = "T001"
)

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-ColorOutput {
    param([string]$Message, [System.ConsoleColor]$Color = [System.ConsoleColor]::White)
    $host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = [System.ConsoleColor]::White
}

function Test-ApiEndpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description
    )
    
    try {
        Write-ColorOutput "Testing: $Description" $Blue
        
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-ColorOutput "✓ SUCCESS: $Description" $Green
        return $response
    }
    catch {
        Write-ColorOutput "✗ FAILED: $Description" $Red
        Write-ColorOutput "  Error: $($_.Exception.Message)" $Red
        return $null
    }
}

# Main execution
Write-ColorOutput "=== Restaurant Management System API Tests ===" $Yellow
Write-ColorOutput "Base URL: $BaseUrl" $Blue
Write-ColorOutput "Testing auxiliary features APIs..." $Blue
Write-Output ""

# Step 1: Authentication
Write-ColorOutput "Step 1: Authentication" $Yellow
$loginBody = @{
    userName = $Username
    password = $Password
} | ConvertTo-Json

$loginResponse = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/User/login" -Body $loginBody -Description "User Login"

if (-not $loginResponse) {
    Write-ColorOutput "Authentication failed. Cannot continue tests." $Red
    exit 1
}

$token = $loginResponse.token
$userId = $loginResponse.userId
Write-ColorOutput "✓ Authenticated as User ID: $userId" $Green
Write-Output ""

# Setup headers with auth token
$authHeaders = @{
    "Authorization" = "Bearer $token"
}

# Step 2: User Favorites Tests
Write-ColorOutput "Step 2: User Favorites API Tests" $Yellow

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/Favorites" -Headers $authHeaders -Description "Get User Favorites (Empty)"

$null = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/Favorites/$TestFoodId" -Headers $authHeaders -Description "Add Food to Favorites"

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/Favorites" -Headers $authHeaders -Description "Get User Favorites (With Data)"

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/Favorites/$TestFoodId/status" -Headers $authHeaders -Description "Check Favorite Status"

$null = Test-ApiEndpoint -Method "DELETE" -Url "$BaseUrl/api/Favorites/$TestFoodId" -Headers $authHeaders -Description "Remove Food from Favorites"

Write-Output ""

# Step 3: Order History Tests  
Write-ColorOutput "Step 3: Order History API Tests" $Yellow

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/OrderHistory?page=1&pageSize=10" -Headers $authHeaders -Description "Get Order History (Paginated)"

$orderHistoryBody = @{
    orderId = $TestOrderId
} | ConvertTo-Json

$null = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/OrderHistory" -Headers $authHeaders -Body $orderHistoryBody -Description "Create Order History Entry"

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/OrderHistory?page=1&pageSize=10" -Headers $authHeaders -Description "Get Order History (After Creation)"

Write-Output ""

# Step 4: Table Reservation Tests
Write-ColorOutput "Step 4: Table Reservation History API Tests" $Yellow

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/ReservationHistory?page=1&pageSize=10" -Headers $authHeaders -Description "Get Reservation History (Paginated)"

$reservationBody = @{
    tableId = $TestTableId
    reservationDate = "2024-12-15T00:00:00Z"
    reservationTime = "18:30:00" 
    partySize = 4
    note = "PowerShell test reservation"
} | ConvertTo-Json

$reservationResponse = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/ReservationHistory" -Headers $authHeaders -Body $reservationBody -Description "Create Table Reservation"

$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/ReservationHistory?page=1&pageSize=10" -Headers $authHeaders -Description "Get Reservation History (After Creation)"

Write-Output ""

# Step 5: Error Handling Tests
Write-ColorOutput "Step 5: Error Handling Tests" $Yellow

# Test without authentication
$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/Favorites" -Description "Unauthorized Access Test (Expected to Fail)"

# Test with invalid data
$null = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/Favorites/INVALID_FOOD_ID" -Headers $authHeaders -Description "Invalid Food ID Test (Expected to Fail)"

Write-Output ""

# Summary
Write-ColorOutput "=== Test Summary ===" $Yellow
Write-ColorOutput "API Base URL: $BaseUrl" $Blue
Write-ColorOutput "Authentication: Successful" $Green
Write-ColorOutput "User Favorites: 5 tests completed" $Blue
Write-ColorOutput "Order History: 3 tests completed" $Blue  
Write-ColorOutput "Reservation History: 3 tests completed" $Blue
Write-ColorOutput "Error Handling: 2 tests completed" $Blue
Write-Output ""
Write-ColorOutput "All auxiliary features APIs have been tested!" $Green
Write-ColorOutput "Check individual test results above for any failures." $Yellow

# Additional information
Write-Output ""
Write-ColorOutput "=== Next Steps ===" $Yellow
Write-ColorOutput "1. Import Postman collections for detailed testing:" $Blue
Write-ColorOutput "   - Auxiliary_Features_API_Tests.postman_collection.json" $Blue
Write-ColorOutput "   - Quick_API_Tests.postman_collection.json" $Blue
Write-ColorOutput "2. Update test IDs in Postman variables with real database IDs" $Blue
Write-ColorOutput "3. Run full test suite in Postman for comprehensive validation" $Blue
Write-ColorOutput "4. Check API server logs for any errors during testing" $Blue

Write-Output ""
Write-ColorOutput "For detailed testing guide, see: POSTMAN_TESTING_GUIDE.md" $Green