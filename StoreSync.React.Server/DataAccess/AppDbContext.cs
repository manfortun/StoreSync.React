using Microsoft.EntityFrameworkCore;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.DataAccess;

public class AppDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Price> Prices { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Price>()
            .HasKey(p => new { p.Id, p.DateCreated });

        modelBuilder.Entity<Price>()
            .HasOne(p => p.Product)
            .WithMany(p => p.Prices)
            .HasForeignKey(p => p.Id);

        modelBuilder.Entity<Sale>()
            .Property(e => e.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<Purchase>()
            .HasKey(p => new { p.ProductId, p.SaleId });

        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Sale)
            .WithMany(s => s.Purchases)
            .HasForeignKey(p => p.SaleId);

        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Product)
            .WithMany(p => p.Purchases)
            .HasForeignKey(p => p.ProductId);

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = "4902430453295", Name = "Downy", Subtitle = "Garden Bloom", IsDeleted = false },
            new Product { Id = "7622300637996", Name = "Tang", Subtitle = "Grapes", IsDeleted = false },
            new Product { Id = "4800361410816", Name = "Bear Brand", Subtitle = "Swak", IsDeleted = false });

        modelBuilder.Entity<Price>().HasData(
            new Price { Id = "4902430453295", DateCreated = DateTime.Now, Value = 8.00d },
            new Price { Id = "7622300637996", DateCreated = DateTime.Now, Value = 22.00d },
            new Price { Id = "4800361410816", DateCreated = DateTime.Now, Value = 13.00d });
    }
}
