@echo off
SET SERVER=192.168.192.85
SET USER=root
SET PASSWORD=CaoBao2211

echo ========================================================
echo    RMS Deployment to %SERVER%
echo ========================================================
echo.
echo This script will connect to the remote server and deploy
echo the database + API server using docker-compose.
echo.
echo Username: %USER%
echo Password: %PASSWORD%
echo.
echo ========================================================
echo.

echo Step 1: Uploading docker-compose.yml...
scp "%~dp0docker-compose.yml" %USER%@%SERVER%:/root/rms-deployment/
if errorlevel 1 (
    echo Failed to upload docker-compose.yml
    pause
    exit /b 1
)

echo.
echo Step 2: Connecting to server and deploying...
echo.

ssh %USER%@%SERVER% "cd /root/rms-deployment && docker-compose down; docker pull bao2211/rms-apiserver:latest; docker-compose up -d; sleep 10; docker ps; docker logs rms-sqlserver --tail 20; docker logs rms-api-server --tail 20"

if errorlevel 1 (
    echo Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo    Deployment Complete!
echo ========================================================
echo.
pause
