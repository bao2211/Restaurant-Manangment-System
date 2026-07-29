# Database SQL Scripts

This folder contains all SQL scripts for the Restaurant Management System database.

## 📁 Folder Structure

```
databaseSQL/
├── DatabaseQuery.sql             # Main database schema and structure
├── migrations/                   # Database migration scripts
│   ├── create_auxiliary_tables.sql
│   ├── add_user_favorites_constraints.sql
│   └── attach-database.sql
└── tests/                        # SQL test scripts
    ├── test_double_bracket.sql
    ├── test_table_access.sql
    ├── test_user_table.sql
    └── check-data.sql
```

## 📊 File Descriptions

### Main Schema
- **DatabaseQuery.sql** - Complete database schema with all tables, relationships, and initial data

### Migrations
- **create_auxiliary_tables.sql** - Create auxiliary feature tables (favorites, etc.)
- **add_user_favorites_constraints.sql** - Add foreign key constraints for user favorites
- **attach-database.sql** - Attach existing database files to SQL Server instance

### Test Scripts
- **test_double_bracket.sql** - Test double bracket syntax handling
- **test_table_access.sql** - Test table access permissions
- **test_user_table.sql** - Test user table operations
- **check-data.sql** - Verify data integrity and check sample data

## 🚀 Usage

### Initial Database Setup
```sql
-- 1. Run main schema
sqlcmd -S localhost -U sa -P <password> -i DatabaseQuery.sql

-- 2. Apply migrations (in order)
sqlcmd -S localhost -U sa -P <password> -i migrations/create_auxiliary_tables.sql
sqlcmd -S localhost -U sa -P <password> -i migrations/add_user_favorites_constraints.sql
```

### Testing
```sql
-- Run test scripts to verify database is working
sqlcmd -S localhost -U sa -P <password> -i tests/check-data.sql
```

### Docker Environment
```bash
# Copy SQL files into container
docker cp databaseSQL/ rms-sqlserver:/tmp/

# Execute inside container
docker exec -it rms-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P <password> -i /tmp/databaseSQL/DatabaseQuery.sql -C
```

## 📝 Database Schema Overview

### Core Tables
- **User** - User accounts (customers, staff, admin)
- **Food** - Food menu items
- **Category** - Food categories
- **Table** - Restaurant tables
- **Order** - Customer orders
- **OrderDetail** - Order line items
- **Bill** - Payment bills
- **BillDetail** - Bill line items

### Auxiliary Tables
- **UserFavorites** - User favorite food items
- **Ingredient** - Recipe ingredients
- **Recipe** - Food recipes
- **RecipeDetail** - Recipe ingredients details

## 🔒 Security Notes

- Keep database credentials secure
- Use parameterized queries in production
- Apply migrations in order (numbered/dated)
- Always backup before running migrations
- Test migrations in development first

## 🐛 Troubleshooting

- **Connection errors**: Check SQL Server is running
- **Permission errors**: Verify user has proper permissions
- **Syntax errors**: Check SQL Server version compatibility
- **Foreign key violations**: Ensure parent records exist before child records

## 📚 Additional Resources

- **API Documentation**: See `../docs/API_Documentation.md`
- **Deployment Guide**: See `../docs/DOCKER_DEPLOYMENT.md`
- **Migration Scripts**: See `../scripts/` for automation tools
