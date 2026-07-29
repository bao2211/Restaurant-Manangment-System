#!/bin/bash

# Enhanced Docker deployment script with CORS fixes
echo "🚀 Starting enhanced CORS-fixed deployment..."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images to force rebuild
echo "🗑️ Removing old images..."
docker rmi bao2211/rms-api-server:latest -f 2>/dev/null || true

# Build new image with CORS fixes
echo "🔨 Building Docker image with CORS fixes..."
docker build -t bao2211/rms-api-server:latest ./RMS-APIServer/

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push bao2211/rms-api-server:latest

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    exit 1
fi

# Deploy with docker-compose
echo "🚀 Deploying with docker-compose..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Docker compose deployment failed!"
    exit 1
fi

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test the deployment
echo "🧪 Testing CORS configuration..."

# Test API endpoint
if curl -s --max-time 10 "http://localhost:8080/api/Category" > /dev/null; then
    echo "✅ API endpoint test successful!"
else
    echo "⚠️ API endpoint test failed"
fi

# Test CORS preflight
if curl -s --max-time 10 -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "http://localhost:8080/api/Category" > /dev/null; then
    echo "✅ CORS preflight test successful!"
else
    echo "⚠️ CORS preflight test failed"
fi

# Show container logs
echo "📋 Container logs (last 20 lines):"
docker logs rms-api-server --tail 20

echo "🎉 Deployment completed!"
echo "🌐 API URL: http://46.250.231.129:8080"
echo "📚 Swagger UI: http://46.250.231.129:8080/swagger"
echo "🔧 CORS is configured to allow all origins for maximum compatibility"

# Show running containers
echo ""
echo "🐳 Running containers:"
docker ps --filter "name=rms-api-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"