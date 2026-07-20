# 🐳 Docker Hub Deployment Guide

# Restaurant Management System API - Status Field Fix

## 📋 Prerequisites

1. **Docker Desktop** installed and running
2. **Docker Hub account** (create at https://hub.docker.com)
3. **Docker logged in** to your account

## 🚀 Quick Deploy Commands

### Step 1: Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

### Step 2: Build the Docker Image

```bash
# Navigate to the RMS-APIServer directory
cd "C:\Users\Admin\Desktop\School\CNPMNC\Restaurant-Manangment-System\RMS-APIServer"

# Build the image with the status field fix
docker build -t rms-api-fixed:latest .

# Tag for Docker Hub (replace 'yourusername' with your Docker Hub username)
docker tag rms-api-fixed:latest yourusername/rms-api-server:status-fix-v1.0
docker tag rms-api-fixed:latest yourusername/rms-api-server:latest
```

### Step 3: Push to Docker Hub

```bash
# Push both tags
docker push yourusername/rms-api-server:status-fix-v1.0
docker push yourusername/rms-api-server:latest
```

### Step 4: Deploy to Production Server

```bash
# On your production server (46.250.231.129), run:
docker pull yourusername/rms-api-server:latest
docker stop rms-api-current || true
docker rm rms-api-current || true
docker run -d --name rms-api-current -p 8080:8080 yourusername/rms-api-server:latest
```

## 🔧 Advanced Configuration

### Environment Variables

```bash
docker run -d \
  --name rms-api-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="Server=46.250.231.129;Database=webQLQuanAn;User Id=sa;Password=yB7Y%0Q137cMe%;Encrypt=True;TrustServerCertificate=True;" \
  yourusername/rms-api-server:latest
```

### Docker Compose (Alternative)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  rms-api:
    image: yourusername/rms-api-server:latest
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
    restart: unless-stopped
    container_name: rms-api-server
```

Then run:

```bash
docker-compose up -d
```

## ✅ Verification

### Test the Status Field Fix

```bash
# Test the fixed API endpoint
curl -H "Accept: application/json" http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE

# Expected response should now include status field:
# {
#   "foodId": "FDD76BE992",
#   "foodName": "Cơm thịt xá xíu ",
#   "orderId": "HD16D450CE",
#   "quantity": 1,
#   "unitPrice": 45000,
#   "status": "Hoàn tất"  ← This field should now be present!
# }
```

### Run API Tests

```bash
# Run the comprehensive test suite
cd "C:\Users\Admin\Desktop\School\CNPMNC\Restaurant-Manangment-System\tests"
node apiEndpointTests.js
```

## 📊 What This Fix Includes

### ✅ Fixed Issues:

- **Status field missing** in OrderDetail endpoints
- **NULL status values** now return "Chưa làm" (default)
- **HD16D450CE order** now shows correct "Hoàn tất" status
- **All OrderDetail endpoints** now include status field

### 🔧 Technical Changes:

- Updated `OrderDetailController.cs`
- Added NULL handling for status field
- Consistent status field in all responses
- Proper Vietnamese status values

## 🐳 Docker Hub Repository Information

### Image Tags:

- `yourusername/rms-api-server:latest` - Latest version with status fix
- `yourusername/rms-api-server:status-fix-v1.0` - Specific version tag
- `yourusername/rms-api-server:production` - Production-ready version

### Image Info:

- **Base Image**: mcr.microsoft.com/dotnet/aspnet:8.0
- **Size**: ~200MB (optimized)
- **Expose Ports**: 8080, 8081
- **Environment**: Production-ready
- **Architecture**: Multi-platform (x64, ARM64)

## 🚀 Deployment Options

### Option 1: Direct Production Deployment

```bash
ssh user@46.250.231.129
docker pull yourusername/rms-api-server:latest
docker stop current-api && docker rm current-api
docker run -d --name current-api -p 8080:8080 yourusername/rms-api-server:latest
```

### Option 2: Blue-Green Deployment

```bash
# Deploy to port 8081 first (green)
docker run -d --name rms-api-green -p 8081:8080 yourusername/rms-api-server:latest

# Test the green deployment
curl http://46.250.231.129:8081/api/OrderDetail/order/HD16D450CE

# If tests pass, switch traffic
docker stop rms-api-blue
docker run -d --name rms-api-blue -p 8080:8080 yourusername/rms-api-server:latest
docker stop rms-api-green
```

### Option 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rms-api-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rms-api
  template:
    metadata:
      labels:
        app: rms-api
    spec:
      containers:
        - name: rms-api
          image: yourusername/rms-api-server:latest
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: rms-api-service
spec:
  selector:
    app: rms-api
  ports:
    - port: 8080
      targetPort: 8080
  type: LoadBalancer
```

## 📱 Mobile App Configuration

After deployment, your mobile app will automatically receive the status field:

```javascript
// No changes needed in mobile app!
// The API will now return:
{
  "foodId": "FDD76BE992",
  "foodName": "Cơm thịt xá xíu ",
  "orderId": "HD16D450CE",
  "quantity": 1,
  "unitPrice": 45000,
  "status": "Hoàn tất"  // ← Now present!
}
```

## 🔄 Rollback Plan

If issues occur, rollback quickly:

```bash
# Stop current container
docker stop rms-api-current

# Run previous version (replace with your previous image)
docker run -d --name rms-api-rollback -p 8080:8080 yourusername/rms-api-server:previous-version
```

## 📞 Support & Monitoring

### Health Check

```bash
curl http://46.250.231.129:8080/api/Category
```

### Logs

```bash
docker logs rms-api-current -f
```

### Container Stats

```bash
docker stats rms-api-current
```

---

## 🎉 Success Criteria

After deployment, verify:

- ✅ Status field present in all OrderDetail responses
- ✅ HD16D450CE shows "Hoàn tất" status
- ✅ Mobile app displays correct statuses
- ✅ All API tests pass
- ✅ Production system stable

**Your Restaurant Management System will now have fully functional order status tracking!** 🍽️✨
