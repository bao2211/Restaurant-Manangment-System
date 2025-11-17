# Database Connection Timeout Troubleshooting

## 🔴 Error Details
```
Connection Timeout Expired. The timeout period elapsed during the post-login phase.
The connection could have timed out while waiting for server to complete the login process and respond;
Or it could have timed out while attempting to create multiple active connections.
Duration: [Pre-Login] initialization=102; handshake=2807; [Login] initialization=0; authentication=1; [Post-Login] complete=12905;
```

**Total Time:** ~16 seconds (timeout limit reached)

## 🔍 Root Causes

### 1. **SQL Server Under Heavy Load**
   - Too many concurrent connections
   - Long-running queries blocking resources
   - Insufficient server resources (CPU/Memory)

### 2. **Network Issues**
   - Slow network between API server and database
   - Firewall blocking connections
   - DNS resolution delays

### 3. **Connection Pool Exhausted**
   - All connections in pool are busy
   - Connection leaks (connections not properly closed)
   - Pool size too small for current load

### 4. **Database Performance Issues**
   - Missing indexes causing slow queries
   - Large tables without proper indexing
   - Statistics out of date

## ✅ Solutions

### **Immediate Fix - Increase Timeout**

**File:** `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your_server;Database=webQLQuanAn;User Id=your_user;Password=your_pass;TrustServerCertificate=true;Connection Timeout=60;Max Pool Size=200;"
  }
}
```

**Changes:**
- `Connection Timeout=60` (increase from default 15 to 60 seconds)
- `Max Pool Size=200` (increase connection pool)

### **Connection String Optimizations**

Add these parameters to your connection string:

```
Server=your_server;
Database=webQLQuanAn;
User Id=your_user;
Password=your_pass;
TrustServerCertificate=true;
Connection Timeout=60;
Max Pool Size=200;
Min Pool Size=5;
Pooling=true;
MultipleActiveResultSets=true;
```

**Parameters Explained:**
- `Connection Timeout=60` - Wait up to 60 seconds for connection
- `Max Pool Size=200` - Allow up to 200 connections in pool
- `Min Pool Size=5` - Keep 5 connections always ready
- `Pooling=true` - Enable connection pooling
- `MultipleActiveResultSets=true` - Allow multiple queries on same connection

### **Check Database Performance**

Run these queries on your SQL Server:

```sql
-- 1. Check active connections
SELECT 
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections,
    loginame as LoginName
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, loginame
ORDER BY NumberOfConnections DESC;

-- 2. Check for blocking queries
SELECT 
    blocking_session_id,
    session_id,
    wait_type,
    wait_time,
    wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;

-- 3. Check long-running queries
SELECT 
    r.session_id,
    r.status,
    r.command,
    r.cpu_time,
    r.total_elapsed_time / 1000 as elapsed_seconds,
    t.text as query_text
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.total_elapsed_time > 5000  -- Queries running more than 5 seconds
ORDER BY r.total_elapsed_time DESC;

-- 4. Find missing indexes
SELECT 
    OBJECT_NAME(d.object_id) as TableName,
    d.equality_columns,
    d.inequality_columns,
    d.included_columns,
    s.avg_user_impact,
    s.user_seeks
FROM sys.dm_db_missing_index_details d
INNER JOIN sys.dm_db_missing_index_groups g ON d.index_handle = g.index_handle
INNER JOIN sys.dm_db_missing_index_group_stats s ON g.index_group_handle = s.group_handle
WHERE d.database_id = DB_ID('webQLQuanAn')
ORDER BY s.avg_user_impact DESC;
```

### **Add Database Indexes**

Based on your queries, add these indexes:

```sql
USE [webQLQuanAn];
GO

-- Index for Order queries
CREATE INDEX IX_Order_CreatedTime 
ON [[Order]]] (CreatedTime DESC)
INCLUDE (Status, Total, TableID, UserID);

-- Index for Bill queries
CREATE INDEX IX_Bill_CreatedTime 
ON [[Bill]]] (CreatedTime DESC)
INCLUDE (Total, TotalFinal, Payment, Status);

-- Index for User lookups
CREATE INDEX IX_User_Role 
ON [[User]]] (Role)
INCLUDE (UserID, UserName, FullName);

-- Update statistics
UPDATE STATISTICS [[Order]]];
UPDATE STATISTICS [[Bill]]];
UPDATE STATISTICS [[User]]];
UPDATE STATISTICS [[Order_Detail]]];
```

### **API Server Code Optimization**

**Option 1: Add Caching**

```csharp
// In Program.cs or Startup.cs
builder.Services.AddMemoryCache();

// In your controller
private readonly IMemoryCache _cache;

public YourController(IMemoryCache cache)
{
    _cache = cache;
}

[HttpGet]
public async Task<IActionResult> GetDashboardData()
{
    var cacheKey = "dashboard_data";
    
    if (!_cache.TryGetValue(cacheKey, out DashboardData data))
    {
        data = await FetchDashboardDataFromDatabase();
        
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(5));
        
        _cache.Set(cacheKey, data, cacheOptions);
    }
    
    return Ok(data);
}
```

**Option 2: Use Async Operations with Timeout**

```csharp
// Add timeout to database operations
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

try 
{
    var orders = await _context.Orders
        .AsNoTracking()  // Important: prevents change tracking overhead
        .ToListAsync(cts.Token);
}
catch (OperationCanceledException)
{
    return StatusCode(504, "Database query timeout");
}
```

## 🔧 Quick Server Restart

If the issue persists, restart services:

```powershell
# Restart SQL Server (run as Administrator)
Restart-Service -Name "MSSQLSERVER" -Force

# Or restart specific instance
Restart-Service -Name "MSSQL$INSTANCENAME" -Force

# Restart IIS (if using IIS)
iisreset /restart

# Check SQL Server status
Get-Service -Name "*SQL*" | Select-Object Name, Status, DisplayName
```

## 📊 Monitor Connection Pool

Add logging to see connection pool status:

```csharp
// In appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information",
      "Microsoft.EntityFrameworkCore.Infrastructure": "Information"
    }
  }
}
```

## 🎯 Testing After Changes

1. **Test single endpoint:**
   ```powershell
   curl http://46.250.231.129:8080/api/Bill
   ```

2. **Test with timeout:**
   ```powershell
   Measure-Command { 
       Invoke-WebRequest -Uri "http://46.250.231.129:8080/api/Bill" 
   }
   ```

3. **Monitor logs:**
   - Check API server logs for slow queries
   - Check SQL Server error logs

## 🚨 Emergency Response

If issue is critical and immediate fix needed:

1. **Reduce Mobile App Load:**
   - Add longer cache times in mobile app
   - Reduce auto-refresh frequency
   - Load data on-demand instead of on mount

2. **Server-Side:**
   - Kill long-running queries
   - Clear connection pool
   - Restart SQL Server service

3. **Database:**
   - Run: `DBCC FREEPROCCACHE` (clears procedure cache)
   - Run: `CHECKPOINT` (flushes dirty pages)
   - Update statistics: `EXEC sp_updatestats`

## 📱 Mobile App Fallbacks (Already Implemented)

The HomeScreen now has:
- ✅ Graceful error handling with retry option
- ✅ Sample data fallback
- ✅ Parallel requests with `Promise.allSettled`
- ✅ Individual request failure tolerance
- ✅ User-friendly timeout messages
- ✅ Loading indicators

## 📈 Long-term Solutions

1. **Database Optimization:**
   - Add proper indexes
   - Partition large tables
   - Archive old data

2. **API Optimization:**
   - Implement caching (Redis/Memory)
   - Add pagination for large datasets
   - Use GraphQL for selective data fetching

3. **Infrastructure:**
   - Upgrade database server resources
   - Use read replicas for reporting queries
   - Implement connection pooling middleware

4. **Monitoring:**
   - Set up Application Insights
   - Monitor query performance
   - Alert on slow queries/timeouts

## 📞 Next Steps

1. Check current connection string in `appsettings.json`
2. Increase timeout to 60 seconds
3. Add indexes to frequently queried tables
4. Monitor connection count
5. Consider implementing caching

Need more help? Check these logs:
- API Server: `logs/` folder
- SQL Server: Event Viewer → Application logs
- Network: `ping 46.250.231.129` and `tracert 46.250.231.129`
