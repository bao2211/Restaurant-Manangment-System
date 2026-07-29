# Production Deployment Script for RMS API Server (PowerShell)
# This script will update the production server with the new Docker image

Write-Host "🚀 Deploying RMS API Server with Status Field Fix" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuration
$DOCKER_IMAGE = "bao2211/rms-api:latest"
$CONTAINER_NAME = "rms-api-server"
$PORT = "8080"
$SERVER_IP = "46.250.231.129"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "   Docker Image: $DOCKER_IMAGE"
Write-Host "   Container Name: $CONTAINER_NAME"
Write-Host "   Port: $PORT"
Write-Host "   Server: $SERVER_IP"
Write-Host ""

Write-Host "🔄 Step 1: Pulling latest Docker image..." -ForegroundColor Cyan
docker pull $DOCKER_IMAGE

Write-Host "🛑 Step 2: Stopping existing container..." -ForegroundColor Cyan
docker stop $CONTAINER_NAME 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "   No existing container to stop" -ForegroundColor Gray }

Write-Host "🗑️ Step 3: Removing existing container..." -ForegroundColor Cyan
docker rm $CONTAINER_NAME 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "   No existing container to remove" -ForegroundColor Gray }

Write-Host "🚀 Step 4: Starting new container..." -ForegroundColor Cyan
docker run -d `
  --name $CONTAINER_NAME `
  -p "${PORT}:8080" `
  -e ASPNETCORE_ENVIRONMENT=Production `
  -e ASPNETCORE_URLS=http://+:8080 `
  --restart unless-stopped `
  $DOCKER_IMAGE

Write-Host "⏳ Step 5: Waiting for container to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "🧪 Step 6: Testing API endpoint..." -ForegroundColor Cyan
Write-Host "Testing: http://$SERVER_IP:$PORT/api/OrderDetail/order/HD16D450CE"

try {
    $response = Invoke-WebRequest -Uri "http://$SERVER_IP:$PORT/api/OrderDetail/order/HD16D450CE" -Headers @{"Accept"="application/json"} -TimeoutSec 30
    $jsonResponse = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ API Response received!" -ForegroundColor Green
    Write-Host "📋 Response keys: $($jsonResponse[0].PSObject.Properties.Name -join ', ')" -ForegroundColor White
    
    if ($jsonResponse[0].status) {
        Write-Host "🎉 SUCCESS: Status field is present!" -ForegroundColor Green
        Write-Host "   Status value: $($jsonResponse[0].status)" -ForegroundColor Green
    } else {
        Write-Host "❌ ISSUE: Status field is still missing" -ForegroundColor Red
        Write-Host "   Available fields: $($jsonResponse[0].PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green

Write-Host "🔍 To manually verify status field fix:" -ForegroundColor Yellow
Write-Host '   Invoke-WebRequest -Uri "http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE" -Headers @{"Accept"="application/json"} | Select-Object -ExpandProperty Content'

Write-Host ""
Write-Host "📊 Container status:" -ForegroundColor Yellow
docker ps --filter "name=$CONTAINER_NAME"

Write-Host ""
Write-Host "📝 Container logs (last 10 lines):" -ForegroundColor Yellow
docker logs $CONTAINER_NAME --tail 10