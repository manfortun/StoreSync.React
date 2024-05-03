using Microsoft.EntityFrameworkCore;
using StoreSync.React.Server.Models.Interfaces;
using System.Linq.Expressions;

namespace StoreSync.React.Server.DataAccess;

public class SoftBaseRepository<TEntity> : BaseRepository<TEntity> where TEntity : class, ISoftDeletable
{
    public SoftBaseRepository(AppDbContext context) : base(context) { }

    public override TEntity? Get(string id)
    {
        return Get(id, false);
    }

    public TEntity? Get(string id, bool includeDeleted)
    {
        var entity = base.Get(id);

        if (includeDeleted)
        {
            return entity;
        }
        else
        {
            return entity?.IsDeleted != true ? entity : null;
        }
    }

    public override IEnumerable<TEntity> GetAll(Expression<Func<TEntity, bool>>? predicate = null)
    {
        return GetAll(false, predicate);
    }

    public IEnumerable<TEntity> GetAll(bool includeDeleted, Expression<Func<TEntity, bool>>? predicate = null)
    {
        var set = base.GetAll(predicate);

        if (includeDeleted)
        {
            return set;
        }
        else
        {
            return set.Where(s => !s.IsDeleted);
        }
    }

    public override void Delete(TEntity entity)
    {
        if (_context.Entry(entity).State == EntityState.Detached)
        {
            _context.Attach(entity);
        }

        entity.IsDeleted = true;
        Update(entity);
    }
}
