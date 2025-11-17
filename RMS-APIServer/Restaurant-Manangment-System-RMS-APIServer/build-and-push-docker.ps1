# RMS API Server - Docker Build and Push Script
# Database: 192.168.192.86

param(
    [string]$DockerUsername = "",
    [string]$ImageName = "rms-apiserver",
    [string]$Tag = "latest"
)

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "RMS API Server - Docker Build and Push to Docker Hub" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\RMS-APIServer"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Get Docker Hub username
if ([string]::IsNullOrWhiteSpace($DockerUsername)) {
    $DockerUsername = Read-Host "Enter your Docker Hub username"
}

if ([string]::IsNullOrWhiteSpace($DockerUsername)) {
    Write-Host "Docker Hub username is required!" -ForegroundColor Red
    exit 1
}

$FullImageName = "${DockerUsername}/${ImageName}:${Tag}"

Write-Host "Build Configuration:" -ForegroundColor Cyan
Write-Host "  Docker Hub Username: $DockerUsername"
Write-Host "  Image Name: $ImageName"
Write-Host "  Tag: $Tag"
Write-Host "  Full Image Name: $FullImageName"
Write-Host "  Database Server: 192.168.192.86"
Write-Host ""

# Login to Docker Hub
Write-Host "Step 1: Logging in to Docker Hub..." -ForegroundColor Yellow
docker login
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Hub login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Successfully logged in" -ForegroundColor Green
Write-Host ""

# Build Docker image
Write-Host "Step 2: Building Docker image..." -ForegroundColor Yellow
docker build -t $FullImageName .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Image built successfully" -ForegroundColor Green
Write-Host ""

# Push to Docker Hub
Write-Host "Step 3: Pushing image to Docker Hub..." -ForegroundColor Yellow
docker push $FullImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Image pushed successfully" -ForegroundColor Green
Write-Host ""

# Create date tag
Write-Host "Step 4: Creating date-tagged version..." -ForegroundColor Yellow
$DateTag = Get-Date -Format "yyyyMMdd"
$DateImageName = "${DockerUsername}/${ImageName}:${DateTag}"
docker tag $FullImageName $DateImageName
docker push $DateImageName
Write-Host "Date-tagged image pushed: $DateImageName" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Docker image uploaded to Docker Hub" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your images are available at:"
Write-Host "  - $FullImageName" -ForegroundColor Cyan
Write-Host "  - $DateImageName" -ForegroundColor Cyan
Write-Host ""
Write-Host "To pull and run:"
Write-Host "  docker pull $FullImageName" -ForegroundColor Yellow
Write-Host "  docker run -d -p 8080:8080 --name rms-api $FullImageName" -ForegroundColor Yellow
Write-Host ""
