﻿using StoreSync.React.Server.Models;

namespace StoreSync.React.Server.DataAccess;

public class UnitOfWork : IDisposable
{
    private bool _isDisposed = false;
    private readonly AppDbContext _context;
    private SoftBaseRepository<Product> _products = default!;
    private AuditableBaseRepository<Price> _prices = default!;
    private BaseRepository<Purchase> _purchases = default!;
    private BaseRepository<Sale> _sales = default!;

    public SoftBaseRepository<Product> Products => _products ??= new SoftBaseRepository<Product>(_context);
    public AuditableBaseRepository<Price> Prices => _prices ??= new AuditableBaseRepository<Price>(_context);
    public BaseRepository<Purchase> Purchases => _purchases ??= new BaseRepository<Purchase>(_context);
    public BaseRepository<Sale> Sales => _sales ??= new BaseRepository<Sale>(_context);

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public virtual void Save()
    {
        _context.SaveChanges();
    }

    public void Dispose(bool disposing)
    {
        if (disposing && !_isDisposed)
        {
            _context.Dispose();
        }

        _isDisposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}