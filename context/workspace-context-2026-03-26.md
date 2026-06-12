# Workspace Context

## Repository Layout

- Root contains a Visual Studio solution: `Restaurant-Manangment-System.sln`.
- Main backend project: `RMS-APIServer/Restaurant-Manangment-System-RMS-APIServer/RMS-APIServer`.
- Mobile client: `RMSMobile/Restaurant-Manangment-System-RMSMobile-Testing` (Expo / React Native).
- Android client: `RMSAndroid` (Gradle / Jetpack Compose work).
- Browser/UI tests: `PLaywright/Khang/RMSMobile.PlaywrightTests`.

## Backend Snapshot

- Backend is a .NET 8 API server.
- Dockerfile location: `RMS-APIServer/Restaurant-Manangment-System-RMS-APIServer/RMS-APIServer/Dockerfile`.
- Dockerfile uses:
  - base image `mcr.microsoft.com/dotnet/aspnet:8.0`
  - build image `mcr.microsoft.com/dotnet/sdk:8.0`
  - exposed ports `8080` and `8081`
  - `ASPNETCORE_ENVIRONMENT=Production`
  - `ASPNETCORE_URLS=http://+:8080`

## Backend Configuration Findings

- `appsettings.json` points `DefaultConnection` at `192.168.192.86` for database access.
- Repository docs also reference public production access through `46.250.231.129:8080`.
- Some server code and docs still hardcode the public IP:
  - `Program.cs` CORS allow-list includes `46.250.231.129` origins.
  - `Models/DBContext.cs` and `Models/WebQlquanAnContext.cs` include hardcoded SQL Server connection strings using the public IP.
- This means local code and deployment docs are not aligned around a single source of truth for runtime connection settings.

## Mobile App Snapshot

- Mobile app package name: `restaurant-management-mobile`.
- Stack: Expo 54, React 19.1, React Native 0.81.
- Main API client file: `RMSMobile/Restaurant-Manangment-System-RMSMobile-Testing/services/apiService.js`.
- Current default API base URL in source:
  - `process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.192.85:8080'`

## Mobile App API Findings

- `API_BASE_URL` intentionally has no trailing slash.
- Many call sites concatenate paths as `${API_BASE_URL}api/...` instead of `${API_BASE_URL}/api/...`.
- Existing logs in the repo show malformed URLs such as `http://192.168.192.85:8080api/Category`.
- Result: there is a real client-side URL joining issue in at least part of the mobile app codebase.

## Deployment Docs Drift

The repo contains multiple deployment stories at once:

- Public production server path:
  - `46.250.231.129`
  - API docs and Docker deployment docs point here.
- Private/LAN deployment path:
  - `192.168.192.85` for API host
  - `192.168.192.86` for SQL Server host
  - mobile app source currently defaults here.
- Docker image naming is inconsistent across docs and scripts:
  - `bao2211/rms-api-server`
  - `bao2211/rms-apiserver`

## Scripts Relevant To Deployment

- `scripts/check-remote-database.ps1`
  - targets `46.250.231.129`
  - expects containers `rms-api-server` and `rms-sqlserver`
- `scripts/deploy-production.sh`
  - deploys a single API container to `46.250.231.129`
- `scripts/deploy-to-remote.ps1`
  - targets `192.168.192.85`
  - describes deploying both API and database together
- `scripts/deploy-with-database.sh`
  - targets `46.250.231.129`
  - expects `rms-api-server` and `rms-sqlserver`

## Missing/Important Artifact

- The repository references `docker-compose.yml` in multiple docs and scripts.
- A `docker-compose.yml` file was not found inside the workspace during this exploration.
- The live server does have `/root/docker-compose.yml`, so the active compose definition currently lives on the server rather than in this workspace.