# Docker Hub Upload Guide - RMS API Server
## Database Updated to 192.168.192.86

This guide explains how to build and upload your Restaurant Management System API Server to Docker Hub.

---

## Prerequisites

1. **Docker Desktop** installed and running
2. **Docker Hub account** (create one at https://hub.docker.com if you don't have one)
3. **Updated database connection** - Already configured to point to `192.168.192.86`

---

## Quick Start - Automated Script

### Option 1: Run the PowerShell Script

The easiest way is to use the automated script:

```powershell
cd "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer"

.\build-and-push-docker.ps1
```

The script will:
1. ✅ Check if Docker is running
2. ✅ Prompt for your Docker Hub username
3. ✅ Login to Docker Hub
4. ✅ Build the Docker image
5. ✅ Push to Docker Hub with `latest` tag
6. ✅ Create and push a date-tagged version

**When prompted:**
- Enter your Docker Hub username (e.g., `yourusername`)
- Enter your Docker Hub password

---

## Manual Steps (Alternative)

If you prefer to do it manually:

### Step 1: Navigate to the API Server Directory

```powershell
cd "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\RMS-APIServer"
```

### Step 2: Login to Docker Hub

```powershell
docker login
```

Enter your Docker Hub username and password when prompted.

### Step 3: Build the Docker Image

Replace `yourusername` with your actual Docker Hub username:

```powershell
docker build -t yourusername/rms-apiserver:latest .
```

This will:
- Read the `Dockerfile`
- Download the .NET 8.0 base images
- Copy your API code
- Build the application
- Create a Docker image

⏱️ **Build time:** 2-5 minutes depending on your internet speed

### Step 4: Push to Docker Hub

```powershell
docker push yourusername/rms-apiserver:latest
```

⏱️ **Upload time:** 3-10 minutes depending on your internet speed

### Step 5: (Optional) Create a Date-Tagged Version

```powershell
docker tag yourusername/rms-apiserver:latest yourusername/rms-apiserver:20241117
docker push yourusername/rms-apiserver:20241117
```

---

## Verify Upload

After uploading, verify your image on Docker Hub:

1. Go to: `https://hub.docker.com/r/yourusername/rms-apiserver`
2. You should see your image with tags: `latest` and date-tagged versions

---

## Configuration Summary

### Database Connection
- **Server:** `192.168.192.86`
- **Database:** `webQLQuanAn`
- **User:** `sa`
- **Password:** `yB7Y%0Q137cMe%`
- **Encryption:** Enabled with TrustServerCertificate

### Ports Exposed
- **8080:** HTTP API endpoint
- **8081:** HTTPS (if configured)

### Environment
- **ASPNETCORE_ENVIRONMENT:** Production
- **.NET Version:** 8.0

---

## Using Your Docker Image on Another Machine

Once uploaded to Docker Hub, you can pull and run it anywhere:

### Pull the Image
```bash
docker pull yourusername/rms-apiserver:latest
```

### Run the Container
```bash
docker run -d \
  -p 8080:8080 \
  --name rms-api \
  yourusername/rms-apiserver:latest
```

### Run with Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
    image: yourusername/rms-apiserver:latest
    container_name: rms-api
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

---

## Troubleshooting

### Error: "docker: command not found"
**Solution:** Make sure Docker Desktop is installed and running

### Error: "denied: requested access to the resource is denied"
**Solution:** 
1. Make sure you're logged in: `docker login`
2. Verify your username is correct in the image name

### Error: "Cannot connect to the Docker daemon"
**Solution:** Start Docker Desktop and wait for it to fully initialize

### Build fails with "project file not found"
**Solution:** Make sure you're in the correct directory:
```powershell
cd "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\RMS-APIServer"
```

### Database connection fails when running the container
**Solution:** 
- Ensure the database server `192.168.192.86` is accessible from where the Docker container is running
- Check firewall rules allow connections to SQL Server port 1433
- Verify SQL Server is configured to allow remote connections

---

## Important Notes

### Database Connectivity
⚠️ **The database server `192.168.192.86` must be accessible from wherever you run the Docker container.**

- If running locally: Your machine must be able to reach `192.168.192.86`
- If running on a server: That server must be able to reach `192.168.192.86`
- If running in the cloud: You may need to update the connection string to use a public IP or domain

### Connection String Updates
If you need to change the database connection later without rebuilding the image, you can override it with environment variables:

```bash
docker run -d \
  -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Server=YOUR_SERVER;Database=webQLQuanAn;User Id=sa;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=True;" \
  --name rms-api \
  yourusername/rms-apiserver:latest
```

---

## Next Steps

After successfully uploading to Docker Hub:

1. ✅ Test pulling and running the image locally
2. ✅ Update your deployment scripts to use the Docker Hub image
3. ✅ Share the image name with your team
4. ✅ Consider setting up automated builds on Docker Hub

---

## Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify you're logged into Docker Hub
3. Ensure the database server is accessible
4. Check the container logs: `docker logs rms-api`

---

**Last Updated:** 2024-11-17
**Database Server:** 192.168.192.86
**Image:** Your Docker Hub Image URL will be shown after upload
