using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RMS_APIServer.Models;

public partial class DBContext : DbContext
{
    public DBContext()
    {
    }

    public DBContext(DbContextOptions<DBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bill> Bills { get; set; }

    public virtual DbSet<BillDetail> BillDetails { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<FoodInfo> FoodInfos { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Recipe> Recipes { get; set; }

    public virtual DbSet<RecipeDetail> RecipeDetails { get; set; }

    public virtual DbSet<Table> Tables { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("Server=46.250.231.129;Database=webQLQuanAn;User Id=sa;Password=yB7Y%0Q137cMe%;Encrypt=True;TrustServerCertificate=True;");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bill>(entity =>
        {
            entity.HasKey(e => e.BillId).HasName("PK_Bill");

            entity.ToTable("[Bill]");

            entity.Property(e => e.BillId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("BillID");
            entity.Property(e => e.CreatedTime).HasColumnType("datetime");
            entity.Property(e => e.Discount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("OrderID");
            entity.Property(e => e.Payment).HasMaxLength(50);
            entity.Property(e => e.Total).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TotalFinal).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("UserID");

            entity.HasOne(d => d.Order).WithMany(p => p.Bills)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Bill_Order");

            entity.HasOne(d => d.User).WithMany(p => p.Bills)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Bill_User");
        });

        modelBuilder.Entity<BillDetail>(entity =>
        {
            entity.HasKey(e => new { e.OrderId, e.BillId }).HasName("PK_Bill_Detail");

            entity.ToTable("[Bill_Detail]");

            entity.Property(e => e.OrderId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("OrderID");
            entity.Property(e => e.BillId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("BillID");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Bill).WithMany(p => p.BillDetails)
                .HasForeignKey(d => d.BillId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bill_Detail_Bill");

            entity.HasOne(d => d.Order).WithMany(p => p.BillDetails)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bill_Detail_Order");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CateId).HasName("PK_Category");

            entity.ToTable("[Category]");

            entity.HasIndex(e => e.CateName, "IX_Category").IsUnique();

            entity.Property(e => e.CateId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("CateID");
            entity.Property(e => e.CateName).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(200);
        });

        modelBuilder.Entity<FoodInfo>(entity =>
        {
            entity.HasKey(e => e.FoodId).HasName("PK_Food_Info");

            entity.ToTable("[Food_Info]");

            entity.HasIndex(e => e.FoodName, "IX_Food_Info").IsUnique();

            entity.Property(e => e.FoodId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("FoodID");
            entity.Property(e => e.CateId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("CateID");
            entity.Property(e => e.Description).HasMaxLength(300);
            entity.Property(e => e.FoodImage).IsUnicode(false);
            entity.Property(e => e.FoodName).HasMaxLength(100);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Cate).WithMany(p => p.FoodInfos)
                .HasForeignKey(d => d.CateId)
                .HasConstraintName("FK_Food_Info_Category");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.IngreId).HasName("PK_Ingredient");

            entity.ToTable("[Ingredient]");

            entity.HasIndex(e => e.IngreName, "IX_Ingredient").IsUnique();

            entity.Property(e => e.IngreId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("IngreID");
            entity.Property(e => e.IngreName).HasMaxLength(100);
            entity.Property(e => e.UnitMeasurement).HasMaxLength(50);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK_Order");

            entity.ToTable("[Order]");

            entity.Property(e => e.OrderId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("OrderID");
            entity.Property(e => e.CreatedTime).HasColumnType("datetime");
            entity.Property(e => e.Discount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Note).HasMaxLength(200);
            entity.Property(e => e.ReservationId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("ReservationID");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TableId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("TableID");
            entity.Property(e => e.Total).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("UserID");

            entity.HasOne(d => d.Table).WithMany(p => p.Orders)
                .HasForeignKey(d => d.TableId)
                .HasConstraintName("FK_Order_Table");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Order_User");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => new { e.FoodId, e.OrderId }).HasName("PK_Order_Detail_1");

            entity.ToTable("[Order_Detail]", tb => tb.HasTrigger("TR_C_Order_Detail_UpdateStatus"));

            entity.Property(e => e.FoodId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("FoodID");
            entity.Property(e => e.OrderId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("OrderID");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Food).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.FoodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Detail_Food_Info");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Detail_Order");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.RecipeId).HasName("PK_Recipe");

            entity.ToTable("[Recipe]");

            entity.Property(e => e.RecipeId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("RecipeID");
            entity.Property(e => e.FoodId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("FoodID");
            entity.Property(e => e.RecipeDescription).HasMaxLength(200);

            entity.HasOne(d => d.Food).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.FoodId)
                .HasConstraintName("FK_Recipe_Food_Info");
        });

        modelBuilder.Entity<RecipeDetail>(entity =>
        {
            entity.HasKey(e => new { e.RecipeId, e.IngreId }).HasName("PK_Recipe_Detail");

            entity.ToTable("[Recipe_Detail]");

            entity.Property(e => e.RecipeId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("RecipeID");
            entity.Property(e => e.IngreId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("IngreID");
            entity.Property(e => e.UnitMeasurement).HasMaxLength(20);

            entity.HasOne(d => d.Ingre).WithMany(p => p.RecipeDetails)
                .HasForeignKey(d => d.IngreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Recipe_Detail_Ingredient");

            entity.HasOne(d => d.Recipe).WithMany(p => p.RecipeDetails)
                .HasForeignKey(d => d.RecipeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Recipe_Detail_Recipe_Detail");
        });

        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(e => e.TableId).HasName("PK_Table");

            entity.ToTable("[Table]");

            entity.HasIndex(e => e.TableName, "IX_Table").IsUnique();

            entity.Property(e => e.TableId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("TableID");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TableName).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK_User");

            entity.ToTable("[User]");

            entity.HasIndex(e => e.UserName, "IX_User").IsUnique();

            entity.HasIndex(e => e.Phone, "IX_User_1").IsUnique();

            entity.HasIndex(e => e.Email, "IX_User_2").IsUnique();

            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("UserID");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(250);
            entity.Property(e => e.Password)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Right).HasMaxLength(25);
            entity.Property(e => e.Role).HasMaxLength(25);
            entity.Property(e => e.UserName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
