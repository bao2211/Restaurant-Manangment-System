Add-Type -AssemblyName System.Data

$connStr = "Server=192.168.192.86;Database=webQLQuanAn;User Id=sa;Password='yB7Y%0Q137cMe%';TrustServerCertificate=True;Connection Timeout=30"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()

$outputFile = "C:\Users\Admin\Documents\School\CNPMNC\RMS\Restaurant-Manangment-System\webQLQuanAn_mysql.sql"
$sw = [System.IO.StreamWriter]::new($outputFile, $false, [System.Text.Encoding]::UTF8)

$sw.WriteLine("-- ============================================")
$sw.WriteLine("-- MySQL-compatible export of webQLQuanAn database")
$sw.WriteLine("-- Source: SQL Server on 192.168.192.86")
$sw.WriteLine("-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$sw.WriteLine("-- For phpMyAdmin import")
$sw.WriteLine("-- ============================================")
$sw.WriteLine("")
$sw.WriteLine("SET NAMES utf8mb4;")
$sw.WriteLine("SET FOREIGN_KEY_CHECKS = 0;")
$sw.WriteLine("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';")
$sw.WriteLine("")
$sw.WriteLine("CREATE DATABASE IF NOT EXISTS `webQLQuanAn` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
$sw.WriteLine("USE `webQLQuanAn`;")
$sw.WriteLine("")

function Convert-SqlType {
    param([string]$sqlType, [object]$maxLen, [object]$precision, [object]$scale)
    
    $t = $sqlType.ToLower()
    switch ($t) {
        "nvarchar" { 
            if ($null -ne $maxLen -and $maxLen -ne [DBNull]::Value -and [int]$maxLen -gt 0) { 
                $len = [int]$maxLen
                if ($len -gt 65535) { return "LONGTEXT" }
                elseif ($len -gt 16383) { return "TEXT" }
                else { return "VARCHAR($len)" }
            }
            return "TEXT"
        }
        "varchar" { 
            if ($null -ne $maxLen -and $maxLen -ne [DBNull]::Value -and [int]$maxLen -gt 0) { 
                $len = [int]$maxLen
                if ($len -gt 65535) { return "LONGTEXT" }
                return "VARCHAR($len)" 
            }
            return "TEXT"
        }
        "char" { 
            if ($null -ne $maxLen -and $maxLen -ne [DBNull]::Value -and [int]$maxLen -gt 0) { 
                return "CHAR($([int]$maxLen))" 
            }
            return "CHAR(10)"
        }
        "int" { return "INT" }
        "bigint" { return "BIGINT" }
        "decimal" {
            $p = if ($null -ne $precision -and $precision -ne [DBNull]::Value) { [int]$precision } else { 18 }
            $s = if ($null -ne $scale -and $scale -ne [DBNull]::Value) { [int]$scale } else { 2 }
            if ($p -gt 38) { $p = 18 }
            return "DECIMAL($p,$s)"
        }
        "datetime" { return "DATETIME" }
        "datetime2" { return "DATETIME(6)" }
        "date" { return "DATE" }
        "time" { return "TIME" }
        "bit" { return "TINYINT(1)" }
        "varbinary" { return "LONGBLOB" }
        "uniqueidentifier" { return "VARCHAR(36)" }
        "float" { return "DOUBLE" }
        "real" { return "FLOAT" }
        default { return "TEXT" }
    }
}

function Escape-String {
    param([string]$val)
    if ($null -eq $val) { return "NULL" }
    $escaped = $val -replace '\\', '\\\\' -replace "'", "''" -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'
    return "'$escaped'"
}

function Format-Value {
    param([object]$val, [string]$colType)
    if ($null -eq $val -or $val -eq [DBNull]::Value) { return "NULL" }
    
    switch ($colType) {
        "String" { return Escape-String ([string]$val) }
        "DateTime" {
            $dt = [datetime]$val
            return "'$($dt.ToString('yyyy-MM-dd HH:mm:ss'))'"
        }
        "TimeSpan" {
            $ts = [TimeSpan]$val
            return "'$($ts.ToString())'"
        }
        "Boolean" {
            return if ($val) { "1" } else { "0" }
        }
        "Byte[]" {
            if ($val.Length -eq 0) { return "NULL" }
            return "0x" + [BitConverter]::ToString([byte[]]$val) -replace '-', ''
        }
        "Guid" {
            return "'$([string]$val)'"
        }
        default {
            $s = [string]$val
            if ($s -match '^\d+\.?\d*$') { return $s }
            return Escape-String $s
        }
    }
}

# Get all table names with their actual names (including brackets)
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT name FROM sys.objects WHERE type='U' AND name != 'sysdiagrams' AND name != '__EFMigrationsHistory' ORDER BY name"
$reader = $cmd.ExecuteReader()
$allTables = @()
while ($reader.Read()) { 
    $allTables += [string]$reader["name"]
}
$reader.Close()

Write-Host "Found $($allTables.Count) tables: $($allTables -join ', ')"

foreach ($rawTableName in $allTables) {
    $cleanName = $rawTableName -replace '[\[\]]', ''
    Write-Host "Processing: $rawTableName -> $cleanName"
    
    $sw.WriteLine("-- =============================================")
    $sw.WriteLine("-- Table: $cleanName (SQL Server name: $rawTableName)")
    $sw.WriteLine("-- =============================================")
    
    # Get columns via INFORMATION_SCHEMA (which returns clean names)
    $cmd2 = $conn.CreateCommand()
    $cmd2.CommandText = "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tname AND TABLE_SCHEMA = 'dbo' ORDER BY ORDINAL_POSITION"
    $cmd2.Parameters.AddWithValue("@tname", $rawTableName) | Out-Null
    $reader2 = $cmd2.ExecuteReader()
    $columns = @()
    while ($reader2.Read()) {
        $columns += [PSCustomObject]@{
            Name = [string]$reader2["COLUMN_NAME"]
            Type = [string]$reader2["DATA_TYPE"]
            MaxLen = $reader2["CHARACTER_MAXIMUM_LENGTH"]
            Precision = $reader2["NUMERIC_PRECISION"]
            Scale = $reader2["NUMERIC_SCALE"]
            Nullable = [string]$reader2["IS_NULLABLE"]
        }
    }
    $reader2.Close()
    
    if ($columns.Count -eq 0) {
        Write-Host "  WARNING: No columns found for $rawTableName"
        continue
    }
    
    # Generate CREATE TABLE
    $createLines = @()
    foreach ($col in $columns) {
        $mysqlType = Convert-SqlType $col.Type $col.MaxLen $col.Precision $col.Scale
        $nullStr = if ($col.Nullable -eq "YES") { "NULL" } else { "NOT NULL" }
        $line = "  ``$($col.Name)`` $mysqlType $nullStr"
        $createLines += $line
    }
    
    $sw.WriteLine("DROP TABLE IF EXISTS ``$cleanName``;")
    $sw.WriteLine("CREATE TABLE ``$cleanName`` (")
    $sw.WriteLine(($createLines -join ",`n"))
    $sw.WriteLine(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;")
    $sw.WriteLine("")
    
    # Get data using sp_executesql with QUOTENAME
    $cmd3 = $conn.CreateCommand()
    $cmd3.CommandText = "DECLARE @sql NVARCHAR(MAX) = N'SELECT * FROM ' + QUOTENAME(@tname); EXEC sp_executesql @sql"
    $cmd3.Parameters.AddWithValue("@tname", $rawTableName) | Out-Null
    $reader3 = $cmd3.ExecuteReader()
    
    $colNames = @()
    $colTypes = @()
    for ($i = 0; $i -lt $reader3.FieldCount; $i++) {
        $colNames += $reader3.GetName($i)
        $colTypes += $reader3.GetFieldType($i).Name
    }
    
    $rowCount = 0
    while ($reader3.Read()) {
        $rowVals = @()
        for ($i = 0; $i -lt $reader3.FieldCount; $i++) {
            $rowVals += (Format-Value $reader3[$i] $colTypes[$i])
        }
        
        $colNamesEsc = $colNames | ForEach-Object { "``$_``" }
        $valuesStr = $rowVals -join ', '
        $sw.WriteLine("INSERT INTO ``$cleanName`` ($($colNamesEsc -join ', ')) VALUES ($valuesStr);")
        $rowCount++
    }
    $reader3.Close()
    $sw.WriteLine("-- $rowCount rows inserted")
    $sw.WriteLine("")
    Write-Host "  $rowCount rows exported"
}

$sw.WriteLine("SET FOREIGN_KEY_CHECKS = 1;")
$sw.WriteLine("")
$sw.WriteLine("-- End of export")
$sw.Close()
$conn.Close()

$fileSize = (Get-Item $outputFile).Length / 1KB
Write-Host "`nDone! File saved to: $outputFile ($([math]::Round($fileSize, 1)) KB)"
