#!/bin/bash
# Production Deployment Script for RMS (with Database)
# This script deploys both API Server AND SQL Server using docker-compose

echo "🚀 Deploying RMS API Server + Database"
echo "======================================="

# Configuration
REMOTE_SERVER="46.250.231.129"
REMOTE_USER="root"
DOCKER_IMAGE="bao2211/rms-apiserver:latest"

echo "📋 Deployment Configuration:"
echo "   Server: $REMOTE_SERVER"
echo "   User: $REMOTE_USER"
echo "   Docker Image: $DOCKER_IMAGE"
echo ""

# Step 1: Pull latest image
echo "🔄 Step 1: Pulling latest Docker image..."
docker pull $DOCKER_IMAGE

if [ $? -eq 0 ]; then
    echo "✅ Image pulled successfully"
else
    echo "❌ Failed to pull image"
    exit 1
fi

# Step 2: Copy docker-compose.yml to remote server
echo ""
echo "📤 Step 2: Copying docker-compose.yml to remote server..."
scp docker-compose.yml ${REMOTE_USER}@${REMOTE_SERVER}:/root/rms-deployment/

if [ $? -eq 0 ]; then
    echo "✅ docker-compose.yml copied successfully"
else
    echo "❌ Failed to copy docker-compose.yml"
    echo "⚠️  Make sure you have SSH access and the directory exists"
    exit 1
fi

# Step 3: Deploy on remote server
echo ""
echo "🚀 Step 3: Deploying on remote server..."
ssh ${REMOTE_USER}@${REMOTE_SERVER} << 'ENDSSH'
echo "📍 Connected to remote server"
cd /root/rms-deployment

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🧹 Pulling latest images..."
docker-compose pull

echo "🚀 Starting containers (database + API)..."
docker-compose up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔍 Checking database health..."
docker logs rms-sqlserver --tail 20

echo ""
echo "🔍 Checking API logs..."
docker logs rms-api-server --tail 20

echo ""
echo "✅ Deployment completed!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Remote deployment successful!"
else
    echo ""
    echo "❌ Remote deployment failed"
    exit 1
fi

# Step 4: Test API endpoint
echo ""
echo "🧪 Step 4: Testing API endpoint..."
sleep 5
curl -s "http://${REMOTE_SERVER}:8080/api/Food" | head -n 20

echo ""
echo "================================================"
echo "✅ Deployment completed successfully!"
echo "================================================"
echo ""
echo "🌐 API is running at: http://${REMOTE_SERVER}:8080"
echo "🗄️  Database is running in container: rms-sqlserver"
echo ""
echo "To check status:"
echo "  ssh ${REMOTE_USER}@${REMOTE_SERVER} 'docker ps'"
echo ""
echo "To view logs:"
echo "  ssh ${REMOTE_USER}@${REMOTE_SERVER} 'docker logs rms-api-server'"
echo "  ssh ${REMOTE_USER}@${REMOTE_SERVER} 'docker logs rms-sqlserver'"
echo ""
