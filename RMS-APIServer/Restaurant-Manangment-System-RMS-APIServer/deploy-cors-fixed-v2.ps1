# Enhanced Docker deployment script with CORS fixes
Write-Host "🚀 Starting enhanced CORS-fixed deployment..." -ForegroundColor Green

# Stop and remove existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Remove old images to force rebuild
Write-Host "🗑️ Removing old images..." -ForegroundColor Yellow
docker rmi bao2211/rms-api-server:latest -f 2>$null

# Build new image with CORS fixes
Write-Host "🔨 Building Docker image with CORS fixes..." -ForegroundColor Blue
docker build -t bao2211/rms-api-server:latest ./RMS-APIServer/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Push to Docker Hub
Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Blue
docker push bao2211/rms-api-server:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

# Deploy with docker-compose
Write-Host "🚀 Deploying with docker-compose..." -ForegroundColor Green
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker compose deployment failed!" -ForegroundColor Red
    exit 1
}

# Wait for container to start
Write-Host "⏳ Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test the deployment
Write-Host "🧪 Testing CORS configuration..." -ForegroundColor Cyan

# Test API endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/Category" -Method GET -TimeoutSec 10
    Write-Host "✅ API endpoint test successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ API endpoint test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test CORS preflight
try {
    $headers = @{
        'Origin' = 'http://localhost:3000'
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/Category" -Method OPTIONS -Headers $headers -TimeoutSec 10
    Write-Host "✅ CORS preflight test successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ CORS preflight test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Show container logs
Write-Host "📋 Container logs (last 20 lines):" -ForegroundColor Cyan
docker logs rms-api-server --tail 20

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "🌐 API URL: http://46.250.231.129:8080" -ForegroundColor Cyan
Write-Host "📚 Swagger UI: http://46.250.231.129:8080/swagger" -ForegroundColor Cyan
Write-Host "🔧 CORS is configured to allow all origins for maximum compatibility" -ForegroundColor Blue

# Show running containers
Write-Host "`n🐳 Running containers:" -ForegroundColor Cyan
docker ps --filter "name=rms-api-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"