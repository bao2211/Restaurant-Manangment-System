#!/bin/bash
# Production Deployment Script for RMS API Server
# This script will update the production server with the new Docker image

echo "🚀 Deploying RMS API Server with Status Field Fix"
echo "================================================="

# Configuration
DOCKER_IMAGE="bao2211/rms-api:latest"
CONTAINER_NAME="rms-api-server"
PORT="8080"
SERVER_IP="46.250.231.129"

echo "📋 Deployment Configuration:"
echo "   Docker Image: $DOCKER_IMAGE"
echo "   Container Name: $CONTAINER_NAME"
echo "   Port: $PORT"
echo "   Server: $SERVER_IP"
echo ""

echo "🔄 Step 1: Pulling latest Docker image..."
docker pull $DOCKER_IMAGE

echo "🛑 Step 2: Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || echo "   No existing container to stop"

echo "🗑️ Step 3: Removing existing container..."
docker rm $CONTAINER_NAME 2>/dev/null || echo "   No existing container to remove"

echo "🚀 Step 4: Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  --restart unless-stopped \
  $DOCKER_IMAGE

echo "⏳ Step 5: Waiting for container to start..."
sleep 10

echo "🧪 Step 6: Testing API endpoint..."
echo "Testing: http://$SERVER_IP:$PORT/api/OrderDetail/order/HD16D450CE"
curl -s -H "Accept: application/json" "http://$SERVER_IP:$PORT/api/OrderDetail/order/HD16D450CE" | jq '.[0] | keys'

echo ""
echo "✅ Deployment completed!"
echo "🔍 To verify status field fix:"
echo "   curl -H \"Accept: application/json\" http://$SERVER_IP:$PORT/api/OrderDetail/order/HD16D450CE"
echo ""
echo "📊 Container status:"
docker ps | grep $CONTAINER_NAME

echo ""
echo "📝 Container logs (last 20 lines):"
docker logs $CONTAINER_NAME --tail 20