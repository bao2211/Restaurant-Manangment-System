# 🚀 Production Deployment Instructions
# Docker Image: bao2211/rms-api:latest (Status Fix v2.0)
# Upload completed successfully to Docker Hub!

## ✅ Upload Status: COMPLETED
- **Repository**: bao2211/rms-api
- **Tags**: latest, status-fix-v2.0
- **Image Size**: 348MB
- **Status Field Fix**: ✅ Included

## 🖥️ Production Server Deployment Commands

### SSH into your production server:
```bash
ssh user@46.250.231.129
```

### Deploy the updated API server:
```bash
# Pull the latest image with status field fix
docker pull bao2211/rms-api:latest

# Stop and remove existing container
docker stop rms-api-server 2>/dev/null || true
docker rm rms-api-server 2>/dev/null || true

# Start new container with the fix
docker run -d \
  --name rms-api-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  --restart unless-stopped \
  bao2211/rms-api:latest

# Wait for container to start
sleep 10

# Test the status field fix
curl -H "Accept: application/json" http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE
```

## 🧪 Quick Test Command (Run after deployment):
```bash
curl -H "Accept: application/json" http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE
```

**Expected Result**: You should now see the status field in the response:
```json
[{
  "foodId": "FDD76BE992",
  "foodName": "Cơm thịt xá xíu ",
  "orderId": "HD16D450CE",
  "quantity": 1,
  "unitPrice": 45000.00,
  "status": "Hoàn tất"  ← This should now be present!
}]
```

## 🔄 Alternative: One-Line Deployment
```bash
docker pull bao2211/rms-api:latest && docker stop rms-api-server && docker rm rms-api-server && docker run -d --name rms-api-server -p 8080:8080 --restart unless-stopped bao2211/rms-api:latest
```

## 📋 Container Management
```bash
# Check container status
docker ps | grep rms-api

# View container logs
docker logs rms-api-server

# Restart container if needed
docker restart rms-api-server
```

## 🎯 What This Fix Includes:
- ✅ Status field now present in all OrderDetail endpoints
- ✅ NULL database values return "Chưa làm" as default
- ✅ HD16D450CE order shows correct "Hoàn tất" status
- ✅ All Vietnamese status values properly handled
- ✅ Production-optimized Docker configuration

## 🚨 Rollback (if needed):
```bash
# If you need to rollback to previous version
docker stop rms-api-server
docker rm rms-api-server
docker run -d --name rms-api-server -p 8080:8080 --restart unless-stopped [PREVIOUS_IMAGE]
```

---

**Your Docker image is now available on Docker Hub! Deploy it to your production server to activate the status field fix.** 🐳✨