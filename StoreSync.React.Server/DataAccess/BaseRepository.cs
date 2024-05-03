using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace StoreSync.React.Server.DataAccess;

public class BaseRepository<TEntity> where TEntity : class
{
    protected readonly DbSet<TEntity> _dbSet;
    protected readonly AppDbContext _context;

    public BaseRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<TEntity>();
    }

    public virtual TEntity? Get(string id)
    {
        return _dbSet.Find(id);
    }

    public virtual IEnumerable<TEntity> GetAll(Expression<Func<TEntity, bool>>? predicate = null)
    {
        var set = _dbSet.AsQueryable();

        if (predicate is not null)
        {
            set = set.Where(predicate);
        }

        return [.. set];
    }

    public virtual void Insert(TEntity entity)
    {
        _dbSet.Add(entity);
    }

    public virtual void Update(TEntity entity)
    {
        _dbSet.Update(entity);
    }

    public virtual void Delete(string id)
    {
        var entity = Get(id);

        if (entity is not null)
        {
            Delete(entity);
        }
    }

    public virtual void Delete(TEntity entity)
    {
        if (_context.Entry(entity).State == EntityState.Detached)
        {
            _dbSet.Attach(entity);
        }

        _dbSet.Remove(entity);
    }
}
