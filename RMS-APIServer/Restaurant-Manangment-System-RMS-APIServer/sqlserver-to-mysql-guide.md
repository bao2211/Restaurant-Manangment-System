# SQL Server to MySQL Migration Guide

## Method 1: Using MySQL Workbench Migration Wizard (Easiest)

### Step 1: Install MySQL Workbench
1. Download from: https://dev.mysql.com/downloads/workbench/
2. Install on your machine

### Step 2: Run Migration Wizard
1. Open MySQL Workbench
2. Click **Database** → **Migration Wizard**
3. Click **Start Migration**

### Step 3: Configure Source (SQL Server)
- Connection Method: **SQL Server (ODBC)**
- Server: `192.168.192.86`
- Port: `1433`
- Username: `sa`
- Password: `yB7Y%0Q137cMe%`
- Database: `webQLQuanAn`
- Click **Test Connection** → **Next**

### Step 4: Configure Target (MySQL)
- Server: Your MySQL server address
- Port: `3306` (default)
- Username: Your MySQL username
- Password: Your MySQL password
- Click **Test Connection** → **Next**

### Step 5: Select Schemas
- Select `webQLQuanAn` database
- Click **Next**

### Step 6: Review & Migrate
- Review the migration plan
- Click **Next** to start migration
- Wait for completion

---

## Method 2: Manual Export/Import with Scripts

### Step A: Export from SQL Server

#### Export Schema (Structure)
```sql
-- In SSMS, right-click database → Tasks → Generate Scripts
-- Select specific tables or entire database
-- Choose "Schema only" or "Schema and data"
-- Save to file: webQLQuanAn_schema.sql
```

#### Export Data as INSERT Statements
```sql
-- Right-click database → Tasks → Generate Scripts
-- Select "Types of data to script" → Schema and data
-- Advanced → Types of data to script: Data only
-- Save to file: webQLQuanAn_data.sql
```

### Step B: Convert SQL Server Syntax to MySQL

Common conversions needed:

#### 1. Data Types
```sql
-- SQL Server → MySQL
NVARCHAR(MAX) → TEXT
DATETIME2 → DATETIME
BIT → TINYINT(1) or BOOLEAN
UNIQUEIDENTIFIER → CHAR(36)
MONEY → DECIMAL(19,4)
```

#### 2. Identity Columns
```sql
-- SQL Server:
[Id] INT IDENTITY(1,1) PRIMARY KEY

-- MySQL:
Id INT AUTO_INCREMENT PRIMARY KEY
```

#### 3. Square Brackets to Backticks
```sql
-- SQL Server:
[TableName], [ColumnName]

-- MySQL:
`TableName`, `ColumnName`
```

#### 4. TOP to LIMIT
```sql
-- SQL Server:
SELECT TOP 10 * FROM Users

-- MySQL:
SELECT * FROM Users LIMIT 10
```

### Step C: Import to MySQL
```bash
mysql -h your_mysql_host -u username -p database_name < webQLQuanAn_converted.sql
```

---

## Method 3: Using Third-Party Tools

### **A. SQLines SQL Converter (Free Online)**
- Website: http://www.sqlines.com/online
- Paste SQL Server script
- Convert to MySQL
- Copy result

### **B. Full Convert Enterprise (Commercial)**
- Direct database-to-database migration
- Handles large databases efficiently
- Website: https://www.spectralcore.com/fullconvert

### **C. DBConvert (Commercial)**
- Specifically designed for SQL Server to MySQL
- Website: https://dbconvert.com/mssql/mysql/

---

## Method 4: Export as CSV + Import to MySQL

### Export from SQL Server
```sql
-- For each table:
bcp "SELECT * FROM webQLQuanAn.dbo.Users" queryout "C:\Export\Users.csv" -S 192.168.192.86 -U sa -P "yB7Y%0Q137cMe%" -c -t, -r\n
```

Or in SSMS:
1. Right-click database → Tasks → Export Data
2. Choose **Flat File Destination**
3. Select CSV format
4. Export each table

### Import to MySQL
```sql
LOAD DATA INFILE '/path/to/Users.csv'
INTO TABLE Users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

---

## Method 5: Using Python Script (Programmatic)

```python
import pyodbc
import pymysql

# Connect to SQL Server
sqlserver_conn = pyodbc.connect(
    'DRIVER={SQL Server};'
    'SERVER=192.168.192.86;'
    'DATABASE=webQLQuanAn;'
    'UID=sa;'
    'PWD=yB7Y%0Q137cMe%'
)

# Connect to MySQL
mysql_conn = pymysql.connect(
    host='your_mysql_host',
    user='your_user',
    password='your_password',
    database='webQLQuanAn'
)

# Migrate each table
sqlserver_cursor = sqlserver_conn.cursor()
mysql_cursor = mysql_conn.cursor()

# Get all tables
sqlserver_cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'")
tables = sqlserver_cursor.fetchall()

for table in tables:
    table_name = table[0]
    print(f"Migrating {table_name}...")
    
    # Read from SQL Server
    sqlserver_cursor.execute(f"SELECT * FROM {table_name}")
    rows = sqlserver_cursor.fetchall()
    
    # Write to MySQL
    for row in rows:
        placeholders = ', '.join(['%s'] * len(row))
        mysql_cursor.execute(f"INSERT INTO {table_name} VALUES ({placeholders})", row)
    
    mysql_conn.commit()
    print(f"✓ {table_name} migrated")

mysql_conn.close()
sqlserver_conn.close()
```

---

## Recommendation for Your Project

**For webQLQuanAn database, I recommend:**

1. **Quick & Easy:** Use **MySQL Workbench Migration Wizard**
   - Fastest setup
   - Handles most conversions automatically
   - Good for one-time migration

2. **Alternative:** Export via SSMS + Manual Conversion
   - More control
   - Good for understanding the schema
   - Better for complex customizations

---

## Important Notes

### After Migration, Update Your Connection String:

**Current (SQL Server):**
```json
"Server=192.168.192.86;Database=webQLQuanAn;User Id=sa;Password=yB7Y%0Q137cMe%;Encrypt=True;TrustServerCertificate=True;"
```

**New (MySQL):**
```json
"Server=your_mysql_host;Port=3306;Database=webQLQuanAn;Uid=your_user;Pwd=your_password;SslMode=Required;"
```

### Update Your .NET Code:
- Change from `Microsoft.Data.SqlClient` to `MySql.Data.MySqlClient`
- Update NuGet package: `MySql.Data` or `Pomelo.EntityFrameworkCore.MySql`

---

## Need Help?

Let me know:
1. Which method you'd like to use?
2. Do you have MySQL already set up?
3. Do you need help updating the .NET API to work with MySQL?
