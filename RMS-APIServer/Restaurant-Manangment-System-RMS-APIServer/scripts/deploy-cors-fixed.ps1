# Restaurant Management System API Server - CORS-Fixed Deployment Script (Windows)
# This script builds and deploys the API server with comprehensive CORS support
# Author: Assistant
# Date: 2024-09-28

Write-Host "🚀 Starting RMS API Server Deployment with CORS Fixes..." -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

# Configuration
$IMAGE_NAME = "bao2211/rms-api-server"
$CONTAINER_NAME = "rms-api-server"
$VERSION_TAG = "cors-fixed-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$LATEST_TAG = "latest"

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Step 1: Clean up existing containers and images
Write-Status "Cleaning up existing containers..."
try {
    docker stop $CONTAINER_NAME 2>$null
    Write-Success "Container $CONTAINER_NAME stopped"
} catch {
    Write-Warning "Container $CONTAINER_NAME was not running"
}

try {
    docker rm $CONTAINER_NAME 2>$null
    Write-Success "Container $CONTAINER_NAME removed"
} catch {
    Write-Warning "Container $CONTAINER_NAME did not exist"
}

# Step 2: Build the new image with CORS fixes
Write-Status "Building Docker image with CORS fixes..."
Set-Location -Path "RMS-APIServer"

$buildResult = docker build -t "${IMAGE_NAME}:${VERSION_TAG}" -t "${IMAGE_NAME}:${LATEST_TAG}" .
if ($LASTEXITCODE -eq 0) {
    Write-Success "Docker image built successfully"
} else {
    Write-Error "Docker build failed"
    exit 1
}

# Step 3: Test the image locally first
Write-Status "Testing the new image locally..."
$testResult = docker run -d --name "${CONTAINER_NAME}-test" -p 8081:8080 `
    -e ASPNETCORE_ENVIRONMENT=Production `
    -e ASPNETCORE_URLS=http://+:8080 `
    -e DOTNET_RUNNING_IN_CONTAINER=true `
    "${IMAGE_NAME}:${LATEST_TAG}"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Test container started"
    
    # Wait for container to start
    Start-Sleep -Seconds 15
    
    # Test if the API is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/Category" -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Local test successful - API is responding"
            docker stop "${CONTAINER_NAME}-test"
            docker rm "${CONTAINER_NAME}-test"
        } else {
            throw "API returned status code: $($response.StatusCode)"
        }
    } catch {
        Write-Error "Local test failed - API is not responding: $_"
        docker logs "${CONTAINER_NAME}-test"
        docker stop "${CONTAINER_NAME}-test"
        docker rm "${CONTAINER_NAME}-test"
        exit 1
    }
} else {
    Write-Error "Failed to start test container"
    exit 1
}

# Step 4: Push to Docker Hub
Write-Status "Pushing image to Docker Hub..."
$pushResult1 = docker push "${IMAGE_NAME}:${VERSION_TAG}"
$pushResult2 = docker push "${IMAGE_NAME}:${LATEST_TAG}"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Image pushed to Docker Hub successfully"
} else {
    Write-Error "Failed to push image to Docker Hub"
    exit 1
}

# Step 5: Deploy using docker-compose
Write-Status "Deploying with docker-compose..."
Set-Location -Path ".."

docker-compose down
if ($LASTEXITCODE -eq 0) {
    Write-Success "Previous deployment stopped"
}

$deployResult = docker-compose pull
$deployResult = docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Success "New deployment started"
} else {
    Write-Error "Deployment failed"
    exit 1
}

# Step 6: Wait for service to be ready
Write-Status "Waiting for service to be ready..."
Start-Sleep -Seconds 20

# Step 7: Test the deployed service
Write-Status "Testing deployed service..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/Category" -Method Get -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Success "Deployment test successful"
    } else {
        throw "API returned status code: $($response.StatusCode)"
    }
} catch {
    Write-Error "Deployment test failed: $_"
    Write-Status "Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
}

# Step 8: Test CORS functionality
Write-Status "Testing CORS functionality..."

try {
    # Test basic CORS headers
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/Category" -Method Get -TimeoutSec 10
    $corsHeader = $corsResponse.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader) {
        Write-Success "CORS headers are present: $corsHeader"
    } else {
        Write-Warning "CORS headers not found in response"
    }

    # Test OPTIONS preflight
    $optionsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/Order" -Method Options `
        -Headers @{
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type"
        } -TimeoutSec 10

    if ($optionsResponse.StatusCode -eq 204 -or $optionsResponse.StatusCode -eq 200) {
        Write-Success "CORS preflight (OPTIONS) is working"
        Write-Host "OPTIONS response headers:"
        $optionsResponse.Headers.Keys | ForEach-Object {
            if ($_ -like "*Access-Control*") {
                Write-Host "  $_`: $($optionsResponse.Headers[$_])" -ForegroundColor Gray
            }
        }
    } else {
        Write-Warning "CORS preflight test failed with status: $($optionsResponse.StatusCode)"
    }
} catch {
    Write-Warning "CORS functionality test encountered an error: $_"
}

# Step 9: Display deployment information
Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Success "🎉 Deployment completed successfully!"
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "Image: " -NoNewline -ForegroundColor Cyan
Write-Host "${IMAGE_NAME}:${LATEST_TAG}"
Write-Host "Version: " -NoNewline -ForegroundColor Cyan
Write-Host $VERSION_TAG
Write-Host "Container: " -NoNewline -ForegroundColor Cyan
Write-Host $CONTAINER_NAME
Write-Host "API URL: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8080/api"

$containerStatus = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String $CONTAINER_NAME
Write-Host "Status: " -NoNewline -ForegroundColor Cyan
Write-Host $containerStatus

Write-Host ""
Write-Host "CORS Test URL: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:8080/../cors-test-comprehensive.html"
Write-Host "API Documentation: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:8080/swagger (if enabled)"
Write-Host ""

Write-Host "✅ CORS Configuration Applied:" -ForegroundColor Green
Write-Host "   - Allow any origin (*)"
Write-Host "   - Support for preflight requests"
Write-Host "   - Comprehensive headers allowed"
Write-Host "   - Error responses include CORS headers"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the API with the CORS test page"
Write-Host "2. Update your client applications to use the new endpoint"
Write-Host "3. Monitor logs: docker logs $CONTAINER_NAME"
Write-Host "4. Check container health: docker ps"
Write-Host ""

# Step 10: Show useful commands
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "View logs:     docker logs $CONTAINER_NAME -f"
Write-Host "Restart:       docker-compose restart"
Write-Host "Stop:          docker-compose down"
Write-Host "Update:        docker-compose pull && docker-compose up -d"
Write-Host "Shell access:  docker exec -it $CONTAINER_NAME /bin/bash"
Write-Host ""

Write-Success "Deployment script completed successfully!"

# Optional: Open CORS test page
$openTest = Read-Host "Would you like to open the CORS test page in your browser? (y/n)"
if ($openTest -eq 'y' -or $openTest -eq 'Y') {
    Start-Process "http://localhost:8080/../cors-test-comprehensive.html"
}