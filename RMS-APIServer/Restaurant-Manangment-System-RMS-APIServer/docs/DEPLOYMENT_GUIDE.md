# RMS Database + API Server Deployment Guide

## Current Problem
The API server is running in Docker on 46.250.231.129 but **cannot connect to the database** because:
- The database container `rms-sqlserver` is NOT running
- The API is trying to connect to `Server=db` (docker-compose service name) which doesn't exist
- Error: "pre-login handshake failed" when connecting to SQL Server

## Solution
Deploy BOTH database and API together using docker-compose on server 192.168.192.85

---

## Quick Deployment (Using Command Line)

### Step 1: Upload docker-compose.yml
Open PowerShell or Command Prompt and run:

```cmd
scp "c:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMS-APIServer\Restaurant-Manangment-System-RMS-APIServer\docker-compose.yml" root@192.168.192.85:/root/rms-deployment/
```

- When prompted for password, enter: `CaoBao2211`
- Press Enter

### Step 2: Connect to Server via SSH  
```cmd
ssh root@192.168.192.85
```

- When prompted for password, enter: `CaoBao2211`
- Press Enter

### Step 3: Run Deployment Commands

Once connected to the server, run these commands ONE BY ONE:

```bash
# Navigate to deployment directory
cd /root/rms-deployment

# Stop any existing containers
docker-compose down
docker stop rms-api-server rms-sqlserver 2>/dev/null
docker rm rms-api-server rms-sqlserver 2>/dev/null

# Pull latest API image
docker pull bao2211/rms-apiserver:latest

# Start both database and API containers
docker-compose up -d

# Wait for containers to start
sleep 15

# Check if containers are running
docker ps

# Check database logs (should see "SQL Server is now ready for client connections")
docker logs rms-sqlserver --tail 30

# Check API logs (should see "Now listening on: http://0.0.0.0:8080")
docker logs rms-api-server --tail 30

# Test API endpoint
curl http://localhost:8080/api/Food

# Exit SSH session
exit
```

---

## Verification Steps

### 1. Check Containers Are Running
After running `docker ps`, you should see BOTH containers:

```
CONTAINER ID   IMAGE                              STATUS         PORTS                    NAMES
xxxxx          bao2211/rms-apiserver:latest      Up 30 seconds  0.0.0.0:8080->8080/tcp   rms-api-server
xxxxx          mcr.microsoft.com/mssql/server... Up 45 seconds  0.0.0.0:1433->1433/tcp   rms-sqlserver
```

✅ **BOTH** containers should show STATUS "Up"

### 2. Check Database Logs
The database logs should contain:

```
SQL Server is now ready for client connections.
```

✅ This confirms SQL Server started successfully

### 3. Check API Logs
The API logs should contain:

```
Now listening on: http://0.0.0.0:8080
Application started. Press Ctrl+C to shut down.
```

✅ This confirms the API server is running

❌ If you see "pre-login handshake failed", the database is not ready yet - wait 30 seconds and check again

### 4. Test API from Your Computer
Open PowerShell and test:

```powershell
# Test Food endpoint
Invoke-RestMethod -Uri "http://192.168.192.85:8080/api/Food" -Method GET

# Test User login
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.192.85:8080/api/User/login" -Method POST -Body $body -ContentType "application/json"
```

✅ Should return data (not errors)

---

## Docker Compose Configuration

The `docker-compose.yml` file defines TWO services:

### 1. Database Service (`db`)
- **Image**: mcr.microsoft.com/mssql/server:2025-latest
- **Container Name**: rms-sqlserver
- **Port**: 1433 (SQL Server)
- **Hostname**: `db` (used by API to connect)
- **Password**: yB7Y%0Q137cMe%
- **Healthcheck**: Ensures database is ready before starting API

### 2. API Service (`rms-api`)
- **Image**: bao2211/rms-apiserver:latest
- **Container Name**: rms-api-server
- **Port**: 8080 (HTTP API)
-**Depends On**: `db` service (waits for database to be healthy)
- **Connection String**: Server=db;Database=webQLQuanAn;...

**IMPORTANT**: The API connects to `Server=db` which is the docker-compose service name. This ONLY works when both containers run together via docker-compose!

---

## Troubleshooting

### Problem: "docker-compose: command not found"
Install docker-compose:
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

Or use `docker compose` (newer Docker versions):
```bash
docker compose up -d
docker compose ps
docker compose logs
```

### Problem: Containers keep restarting
Check logs:
```bash
docker logs rms-sqlserver
docker logs rms-api-server
```

Common causes:
- Database not enough memory (needs 512MB minimum, 2GB recommended)
- Port 1433 or 8080 already in use
- Firewall blocking connections

### Problem: Database "not ready for connections"
Wait longer:
```bash
# Database takes 30-60 seconds to start
sleep 30
docker logs rms-sqlserver --tail 20
```

### Problem: API can't connect to database
Check if containers are in same network:
```bash
docker inspect rms-api-server | grep NetworkMode
docker inspect rms-sqlserver | grep NetworkMode
```

Both should show `rms-deployment_rms-network` or similar.

---

## Alternative: Using WinSCP for File Upload

If SCP command doesn't work:

1. Download WinSCP: https://winscp.net/
2. Open WinSCP and create new connection:
   - File protocol: SCP
   - Host name: 192.168.192.85
   - Port: 22
   - User name: root
   - Password: CaoBao2211
3. Click "Login"
4. Navigate to `/root/rms-deployment/`
5. Upload `docker-compose.yml` file
6. Use PuTTY or terminal to SSH and run deployment commands

---

## Success Criteria

✅ **Deployment Successful** when ALL of these are true:

1. `docker ps` shows BOTH containers with STATUS "Up"
2. Database logs show "SQL Server is now ready for client connections"
3. API logs show "Now listening on: http://0.0.0.0:8080"
4. API logs DO NOT show "pre-login handshake failed" errors
5. `curl http://localhost:8080/api/Food` returns JSON data
6. Web app can login and see menu items

---

## Post-Deployment

### Update Web App API URL (if needed)
If the API server moved from 46.250.231.129 to 192.168.192.85:

Edit: `RMSMobile/Restaurant-Manangment-System-RMSMobile-Testing/services/apiService.js`

```javascript
// Change this:
const API_BASE_URL = 'http://46.250.231.129:8080/api';

// To this:
const API_BASE_URL = 'http://192.168.192.85:8080/api';
```

Then restart the web app:
```powershell
cd "c:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\RMSMobile\Restaurant-Manangment-System-RMSMobile-Testing"
npx expo start --web --port 19006 --force
```

---

## Questions?

- **Where is the database data stored?** In Docker volume `sqlData` - persists across container restarts
- **How to view live logs?** `docker logs -f rms-api-server` or `docker logs -f rms-sqlserver`
- **How to restart?** `docker-compose restart` or `docker-compose down; docker-compose up -d`
- **How to stop?** `docker-compose down`
- **How to update API?** `docker-compose pull; docker-compose up -d`

