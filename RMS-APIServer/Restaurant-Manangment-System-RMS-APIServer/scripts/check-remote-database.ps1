# Check Remote Database Connection Script
# This script helps diagnose SQL Server connection issues

param(
    [string]$RemoteHost = "46.250.231.129",
    [string]$SSHUser = "root"
)

Write-Host "🔍 Checking Docker containers on $RemoteHost..." -ForegroundColor Cyan

# Check if SSH is available
$sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $sshAvailable) {
    Write-Host "❌ SSH client not found. Please install OpenSSH or use PuTTY." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps to run on the remote server:" -ForegroundColor Yellow
    Write-Host "1. SSH into $RemoteHost" -ForegroundColor White
    Write-Host "2. Run: docker ps -a" -ForegroundColor White
    Write-Host "3. Check if 'rms-sqlserver' container is running" -ForegroundColor White
    Write-Host "4. If not, run: docker-compose up -d" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Checking containers on remote server..." -ForegroundColor Yellow
Write-Host "Command: ssh $SSHUser@$RemoteHost 'docker ps -a'" -ForegroundColor Gray

# Try to connect and check containers
try {
    $containers = ssh "$SSHUser@$RemoteHost" "docker ps -a" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Connected successfully!" -ForegroundColor Green
        Write-Host "Container Status:" -ForegroundColor Cyan
        Write-Host $containers
        
        # Check for SQL Server container
        if ($containers -match "rms-sqlserver") {
            if ($containers -match "rms-sqlserver.*Up") {
                Write-Host ""
                Write-Host "✅ SQL Server container is running" -ForegroundColor Green
                Write-Host ""
                Write-Host "Checking logs for SQL Server..." -ForegroundColor Yellow
                ssh "$SSHUser@$RemoteHost" "docker logs --tail 50 rms-sqlserver"
            }
            else {
                Write-Host ""
                Write-Host "❌ SQL Server container exists but is NOT running" -ForegroundColor Red
                Write-Host ""
                Write-Host "To start it, run on remote server:" -ForegroundColor Yellow
                Write-Host "  docker-compose up -d" -ForegroundColor White
            }
        }
        else {
            Write-Host ""
            Write-Host "❌ SQL Server container 'rms-sqlserver' NOT FOUND" -ForegroundColor Red
            Write-Host ""
            Write-Host "You need to start docker-compose on the remote server:" -ForegroundColor Yellow
            Write-Host "  cd /path/to/docker-compose" -ForegroundColor White
            Write-Host "  docker-compose up -d" -ForegroundColor White
        }
        
        # Check for API container
        Write-Host ""
        if ($containers -match "rms-api-server") {
            Write-Host "✅ API Server container found" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  API Server container 'rms-api-server' not found in docker-compose" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host ""
        Write-Host "❌ Could not connect to remote server" -ForegroundColor Red
        Write-Host "Error: $containers" -ForegroundColor Red
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error connecting to remote server: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SUMMARY OF FIXES:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SSH into remote server: ssh $SSHUser@$RemoteHost" -ForegroundColor White
Write-Host "2. Navigate to docker-compose directory" -ForegroundColor White
Write-Host "3. Run: docker-compose down" -ForegroundColor White
Write-Host "4. Run: docker-compose up -d" -ForegroundColor White
Write-Host "5. Verify: docker ps" -ForegroundColor White
Write-Host ""
Write-Host "Expected containers:" -ForegroundColor Yellow
Write-Host "  - rms-sqlserver (SQL Server database)" -ForegroundColor White
Write-Host "  - rms-api-server (API Server)" -ForegroundColor White
Write-Host ""
