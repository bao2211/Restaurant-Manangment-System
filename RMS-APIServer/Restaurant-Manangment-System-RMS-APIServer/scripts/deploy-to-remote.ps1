# Deploy RMS to Remote Server with Database
# Server: 192.168.192.85

Write-Host "🚀 Deploying RMS API  Server + Database to 192.168.192.85" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

$RemoteServer = "192.168.192.85"
$RemoteUser = "root"
$DockerImage = "bao2211/rms-apiserver:latest"

# Step 1: Upload docker-compose.yml to remote server
Write-Host ""
Write-Host "📤 Step 1: Uploading docker-compose.yml to remote server..." -ForegroundColor Cyan

$dockerComposePath = "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\docker-compose.yml"

Write-Host "Using SCP to upload file..." -ForegroundColor Yellow
Write-Host "File: $dockerComposePath" -ForegroundColor Gray
Write-Host "Destination: ${RemoteUser}@${RemoteServer}:/root/rms-deployment/docker-compose.yml" -ForegroundColor Gray
Write-Host ""

# Create the commands to run on remote server
$remoteCommands = @"
echo '🔍 Checking current Docker containers...'
docker ps -a

echo ''
echo '📁 Creating deployment directory...'
mkdir -p /root/rms-deployment
cd /root/rms-deployment

echo ''
echo '🛑 Stopping existing containers...'
docker-compose down 2>/dev/null || docker stop rms-api-server rms-sqlserver 2>/dev/null
docker rm rms-api-server rms-sqlserver 2>/dev/null

echo ''
echo '🧹 Pulling latest Docker image...'
docker pull ${DockerImage}

echo ''
echo '🗑️ Removing old volumes (optional)...'
docker volume ls

echo ''  
echo '📊 Starting containers with docker-compose...'
docker-compose up -d

echo ''
echo '⏳ Waiting for containers to start...'
sleep 15

echo ''
echo '📊 Container Status:'
docker ps

echo ''
echo '🔍 Checking database logs...'
docker logs rms-sqlserver --tail 30

echo ''
echo '🔍 Checking API logs...'
docker logs rms-api-server --tail 30

echo ''
echo '✅ Deployment completed!'
"@

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "MANUAL DEPLOYMENT STEPS" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Since PowerShell SSH doesn't support password authentication easily," -ForegroundColor White
Write-Host "please run these commands manually:" -ForegroundColor White
Write-Host ""
Write-Host "1. Upload docker-compose.yml:" -ForegroundColor Cyan
Write-Host "   scp `"$dockerComposePath`" ${RemoteUser}@${RemoteServer}:/root/rms-deployment/" -ForegroundColor White
Write-Host ""
Write-Host "2. SSH into the server:" -ForegroundColor Cyan
Write-Host "   ssh ${RemoteUser}@${RemoteServer}" -ForegroundColor White
Write-Host "   Password: CaoBao2211" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run deployment commands:" -ForegroundColor Cyan
Write-Host $remoteCommands -ForegroundColor White
Write-Host ""

Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "OR use this single command:" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "ssh ${RemoteUser}@${RemoteServer} << 'EOF'" -ForegroundColor White
Write-Host $remoteCommands -ForegroundColor White
Write-Host "EOF" -ForegroundColor White
Write-Host ""

# Save commands to file for easy execution
$commandFile = "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\remote-deploy-commands.sh"
$remoteCommands | Out-File -FilePath $commandFile -Encoding UTF8
Write-Host "📝 Commands saved to: $commandFile" -ForegroundColor Green
Write-Host ""
