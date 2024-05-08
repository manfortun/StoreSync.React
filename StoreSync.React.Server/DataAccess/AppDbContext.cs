using Microsoft.EntityFrameworkCore;
using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.DataAccess;

public class AppDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Price> Prices { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<Debtor> Debtors { get; set; }
    public DbSet<Debt> Debts { get; set; }
    public DbSet<DebtPayment> DebtPayments { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Price>()
            .HasKey(p => new { p.Id, p.DateCreated });

        modelBuilder.Entity<Price>()
            .HasOne(p => p.Product)
            .WithMany(p => p.Prices)
            .HasForeignKey(p => p.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Sale>()
            .Property(e => e.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<Purchase>()
            .HasKey(p => new { p.ProductId, p.SaleId });

        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Sale)
            .WithMany(s => s.Purchases)
            .HasForeignKey(p => p.SaleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.Product)
            .WithMany(p => p.Purchases)
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Debtor>()
            .HasKey(d => d.Name);

        modelBuilder.Entity<Debt>()
            .HasOne(d => d.Debtor)
            .WithMany(d => d.Debts)
            .HasForeignKey(d => d.DebtorName)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Debt>()
            .Property(d => d.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<DebtPayment>()
            .HasOne(d => d.Debtor)
            .WithMany(d => d.Payments)
            .HasForeignKey(d => d.DebtorName)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DebtPayment>()
            .Property(d => d.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<Sale>()
            .HasOne(s => s.Debt)
            .WithMany(d => d.Sales)
            .HasForeignKey(s => s.DebtId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
