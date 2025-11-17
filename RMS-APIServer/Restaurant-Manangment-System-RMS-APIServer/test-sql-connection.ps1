# ============================================================================
# SQL Server Connection Test Script
# Server: 192.168.192.86,1433
# ============================================================================

$serverInstance = "192.168.192.86,1433"
$database = "master" # Connect to master first to check if webQLQuanAn exists
$username = "sa"
$password = "yB7Y%0Q137cMe%"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Testing SQL Server Connection" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Server: $serverInstance" -ForegroundColor White
Write-Host "Database: $database" -ForegroundColor White
Write-Host ""

# Create connection string
$connectionString = "Server=$serverInstance;Database=$database;User Id=$username;Password=$password;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30"

try {
    Write-Host "Attempting to connect..." -ForegroundColor Yellow
    
    # Create SQL connection
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    Write-Host "✓ Successfully connected to SQL Server!" -ForegroundColor Green
    Write-Host ""
    
    # Query to list all databases
    $query = @"
SELECT name AS DatabaseName, 
       database_id AS ID,
       state_desc AS State,
       recovery_model_desc AS RecoveryModel
FROM sys.databases
ORDER BY name;
"@
    
    Write-Host "Available Databases:" -ForegroundColor Cyan
    Write-Host "--------------------" -ForegroundColor Cyan
    
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $reader = $command.ExecuteReader()
    
    $databases = @()
    while ($reader.Read()) {
        $dbName = $reader["DatabaseName"]
        $state = $reader["State"]
        $databases += $dbName
        Write-Host "  - $dbName ($state)" -ForegroundColor White
    }
    $reader.Close()
    
    Write-Host ""
    
    # Check if webQLQuanAn exists
    if ($databases -contains "webQLQuanAn") {
        Write-Host "✓ Database 'webQLQuanAn' EXISTS on the server" -ForegroundColor Green
        
        # Try to connect to webQLQuanAn specifically
        Write-Host ""
        Write-Host "Testing connection to webQLQuanAn database..." -ForegroundColor Yellow
        $connection.Close()
        
        $webQLConnectionString = "Server=$serverInstance;Database=webQLQuanAn;User Id=$username;Password=$password;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30"
        $webQLConnection = New-Object System.Data.SqlClient.SqlConnection
        $webQLConnection.ConnectionString = $webQLConnectionString
        $webQLConnection.Open()
        
        Write-Host "✓ Successfully connected to webQLQuanAn database!" -ForegroundColor Green
        
        # Count tables
        $tableQuery = "SELECT COUNT(*) FROM sys.tables"
        $tableCommand = $webQLConnection.CreateCommand()
        $tableCommand.CommandText = $tableQuery
        $tableCount = $tableCommand.ExecuteScalar()
        
        Write-Host "  Tables in database: $tableCount" -ForegroundColor White
        
        $webQLConnection.Close()
    }
    else {
        Write-Host "✗ Database 'webQLQuanAn' DOES NOT EXIST on the server" -ForegroundColor Red
        Write-Host ""
        Write-Host "To create the database, run:" -ForegroundColor Yellow
        Write-Host "  CREATE DATABASE webQLQuanAn;" -ForegroundColor White
        Write-Host "  GO" -ForegroundColor White
    }
    
    $connection.Close()
    
} catch {
    Write-Host "✗ Connection Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server is not running on 192.168.192.86" -ForegroundColor White
    Write-Host "  2. Port 1433 is blocked by firewall" -ForegroundColor White
    Write-Host "  3. SQL Server is not configured for remote connections" -ForegroundColor White
    Write-Host "  4. Incorrect username or password" -ForegroundColor White
    Write-Host "  5. SQL Server Authentication is not enabled" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
