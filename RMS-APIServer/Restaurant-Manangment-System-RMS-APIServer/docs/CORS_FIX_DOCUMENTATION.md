# CORS Fix Documentation for RMS API Server

## Overview

This document outlines the comprehensive CORS (Cross-Origin Resource Sharing) fixes implemented to resolve issues when the API server is deployed in Docker containers and accessed by web applications.

## Problem Description

When deploying the RMS API Server in Docker, CORS blocks were preventing the React Native/Web application from making successful API calls. This was occurring because:

1. **Docker network isolation**: The API server in Docker had different networking context
2. **Incorrect CORS headers**: Missing or improperly configured CORS headers
3. **Client-side CORS interference**: Incorrect headers being sent from the client
4. **Preflight request handling**: OPTIONS requests not being handled properly

## Solutions Implemented

### 1. Enhanced Server-Side CORS Configuration

#### Program.cs Updates

- **Multiple CORS Policies**: Added Development, Production, and AllowAll policies
- **Docker Detection**: Automatic policy selection based on environment
- **Comprehensive Headers**: Added all necessary CORS headers including exposed headers
- **Origin Flexibility**: Support for wildcard origins and specific origin lists

```csharp
// Enhanced CORS configuration with Docker support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Content-Length", "Content-Range", "Content-Type");
    });

    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(/* specific origins */)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Length", "Content-Range", "Content-Type");
    });
});
```

#### CorsMiddleware.cs Enhancements

- **Origin Detection**: Dynamic origin handling for better compatibility
- **Container Awareness**: Different behavior when running in Docker
- **Comprehensive Headers**: All necessary CORS headers including Vary header
- **Debugging Support**: Console logging for CORS requests
- **Preflight Optimization**: Proper OPTIONS request handling with 204 status

### 2. Client-Side Improvements

#### apiService.js Updates

- **Removed Client CORS Headers**: Eliminated conflicting headers that should only be set by server
- **Request/Response Interceptors**: Better error handling and logging
- **Fetch Fallback**: Alternative fetch implementation for CORS issues
- **Proper Credentials Handling**: Set withCredentials: false for wildcard CORS

### 3. Docker Configuration Updates

#### docker-compose.yml

- **Environment Variables**: Added DOTNET_RUNNING_IN_CONTAINER flag
- **CORS Environment**: Added CORS_ORIGINS environment variable
- **Container Detection**: Proper container environment setup

### 4. Deployment Scripts

#### Enhanced Deployment Scripts

- **CORS Testing**: Built-in CORS validation after deployment
- **Multi-method Testing**: Tests both API endpoints and preflight requests
- **Error Detection**: Specific error messages for CORS issues
- **Container Health Checks**: Verify container is running properly

## Testing Tools

### CORS Test HTML Page

Created `cors-test-enhanced.html` with:

- **Comprehensive Testing**: Multiple types of CORS tests
- **Real-time Results**: Live testing with detailed logging
- **Export Functionality**: Save test results for analysis
- **Multiple Scenarios**: Different origin, credentials, custom headers testing

## Configuration Details

### Server Environment Variables

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
DOTNET_RUNNING_IN_CONTAINER=true
CORS_ORIGINS=*
```

### Client Configuration

```javascript
// Axios configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: false, // Important for wildcard CORS
});
```

### CORS Headers Set by Server

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name
Access-Control-Expose-Headers: Content-Length, Content-Range, Content-Type
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: false
Vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers
```

## Deployment Instructions

### 1. Rebuild and Deploy API Server

```powershell
# Windows PowerShell
.\deploy-cors-fixed-v2.ps1
```

```bash
# Linux/MacOS
./deploy-cors-fixed-v2.sh
```

### 2. Test CORS Configuration

1. Open `cors-test-enhanced.html` in a web browser
2. Set API URL to your deployed server (http://46.250.231.129:8080)
3. Run all test categories
4. Verify all tests pass, especially preflight tests

### 3. Update Client Application

1. Ensure apiService.js is updated with the new configuration
2. Remove any client-side CORS headers
3. Set withCredentials: false for axios requests
4. Use proper fetch configuration for fallback requests

## Troubleshooting

### Common Issues and Solutions

#### 1. "CORS block" errors

- **Cause**: Server not sending proper CORS headers
- **Solution**: Verify middleware is applied and container has proper environment variables

#### 2. "Credentials cannot be used with wildcard origin"

- **Cause**: Client sending withCredentials: true with server using Access-Control-Allow-Origin: \*
- **Solution**: Set withCredentials: false in client or use specific origins on server

#### 3. Preflight requests failing

- **Cause**: OPTIONS requests not handled properly
- **Solution**: Verify CorsMiddleware handles OPTIONS with 204 status

#### 4. Mobile app still failing

- **Cause**: Mobile apps may have different CORS behavior
- **Solution**: Test with Expo web version first, then native app

### Debugging Steps

1. **Check Container Logs**:

   ```bash
   docker logs rms-api-server --tail 50
   ```

2. **Verify CORS Headers**:

   ```bash
   curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -X OPTIONS http://46.250.231.129:8080/api/Category -v
   ```

3. **Test API Endpoints**:

   ```bash
   curl http://46.250.231.129:8080/api/Category -v
   ```

4. **Use Browser DevTools**:
   - Check Network tab for CORS-related errors
   - Look for preflight OPTIONS requests
   - Verify response headers

## Best Practices

### 1. Development vs Production

- **Development**: Use permissive CORS settings for faster development
- **Production**: Use specific origins for better security

### 2. Security Considerations

- **Wildcard Origins**: Only use \* for development or when security is not critical
- **Credentials**: Only enable when necessary and with specific origins
- **Headers**: Only allow necessary headers

### 3. Performance

- **Max-Age**: Set appropriate cache time for preflight requests (24 hours)
- **Middleware Order**: Apply CORS middleware early in pipeline

### 4. Monitoring

- **Logging**: Enable CORS request logging for debugging
- **Testing**: Regular CORS testing with automated tools
- **Updates**: Keep CORS configuration updated with new client domains

## Files Modified

1. **RMS-APIServer/Program.cs** - Enhanced CORS policies and middleware configuration
2. **RMS-APIServer/Middleware/CorsMiddleware.cs** - Comprehensive CORS header handling
3. **docker-compose.yml** - Added container environment variables
4. **services/apiService.js** - Removed conflicting headers, added interceptors
5. **deploy-cors-fixed-v2.ps1/.sh** - Enhanced deployment with CORS testing
6. **cors-test-enhanced.html** - Comprehensive CORS testing tool

## Success Metrics

After implementing these fixes, you should see:

- ✅ No CORS errors in browser console
- ✅ Successful API calls from web application
- ✅ Proper preflight request handling
- ✅ All CORS test scenarios passing
- ✅ Mobile app connectivity (for React Native/Expo)

## Support

If CORS issues persist:

1. Run the enhanced CORS test tool
2. Check container logs for CORS-related messages
3. Verify client configuration matches server CORS policy
4. Test with curl commands to isolate server vs client issues

This comprehensive CORS fix should resolve all cross-origin issues between your Docker-deployed API server and web/mobile applications.
