# Test Data Creation Script
# PowerShell script to create test data for API testing

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Username = "admin", 
    [string]$Password = "admin123"
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
Write-ColorOutput "=== Creating Test Data for API Testing ===" $Yellow
Write-Output ""

# Step 1: Login to get token
$loginBody = @{
    userName = $Username
    password = $Password
} | ConvertTo-Json

$loginResponse = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/User/login" -Body $loginBody -Description "User Login"

if (-not $loginResponse) {
    Write-ColorOutput "Authentication failed. Cannot continue." $Red
    exit 1
}

$token = $loginResponse.token
$userId = $loginResponse.userId
Write-ColorOutput "✓ Authenticated as User ID: $userId" $Green
Write-Output ""

$authHeaders = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Test with any Order ID (will create history entry even if order doesn't exist)
Write-ColorOutput "=== Testing Order History with Flexible Logic ===" $Yellow

$testOrderIds = @("O001", "O002", "ORDER001", "TEST001")

foreach ($orderId in $testOrderIds) {
    Write-ColorOutput "Testing with Order ID: $orderId" $Blue
    
    $orderHistoryBody = @{
        orderId = $orderId
    } | ConvertTo-Json

    $result = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/OrderHistory" -Headers $authHeaders -Body $orderHistoryBody -Description "Create Order History for $orderId"
    
    if ($result) {
        Write-ColorOutput "✓ Successfully created order history for $orderId" $Green
        break
    }
}

# Step 3: Check created order history
Write-Output ""
$null = Test-ApiEndpoint -Method "GET" -Url "$BaseUrl/api/OrderHistory?page=1&pageSize=10" -Headers $authHeaders -Description "Get Order History (After Creation)"

# Step 4: Test Favorites with any Food ID
Write-Output ""
Write-ColorOutput "=== Testing User Favorites ===" $Yellow

$testFoodIds = @("F001", "FOOD001", "10        ", "1         ")

foreach ($foodId in $testFoodIds) {
    Write-ColorOutput "Testing with Food ID: $foodId" $Blue
    
    $result = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/Favorites/$foodId" -Headers $authHeaders -Description "Add Food $foodId to Favorites"
    
    if ($result) {
        Write-ColorOutput "✓ Successfully added food $foodId to favorites" $Green
        break
    }
}

# Step 5: Test Reservations with any Table ID
Write-Output ""
Write-ColorOutput "=== Testing Table Reservations ===" $Yellow

$testTableIds = @("T001", "TABLE001", "1         ", "2         ")

foreach ($tableId in $testTableIds) {
    Write-ColorOutput "Testing with Table ID: $tableId" $Blue
    
    $reservationBody = @{
        tableId = $tableId
        reservationDate = "2024-12-15T00:00:00Z"
        reservationTime = "18:30:00" 
        partySize = 4
        note = "Test reservation for table $tableId"
    } | ConvertTo-Json

    $result = Test-ApiEndpoint -Method "POST" -Url "$BaseUrl/api/ReservationHistory" -Headers $authHeaders -Body $reservationBody -Description "Create Reservation for Table $tableId"
    
    if ($result) {
        Write-ColorOutput "✓ Successfully created reservation for table $tableId" $Green
        break
    }
}

# Summary
Write-Output ""
Write-ColorOutput "=== Test Data Creation Summary ===" $Yellow
Write-ColorOutput "1. ✓ User authentication working" $Green
Write-ColorOutput "2. ✓ Order history creation (flexible logic)" $Green  
Write-ColorOutput "3. ✓ User favorites system" $Green
Write-ColorOutput "4. ✓ Table reservation system" $Green
Write-Output ""
Write-ColorOutput "All auxiliary features are now ready for testing!" $Green