using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.DataAccess;

public class AuditableBaseRepository<TEntity> : BaseRepository<TEntity> where TEntity : class, IAuditable
{
    public AuditableBaseRepository(AppDbContext context) : base(context) { }

    public TEntity? Get(string id, DateTime? date = null)
    {
        var entities = GetAll(entity => entity.Id == id);

        if (date is not null)
        {
            entities = entities.Where(e => e.DateCreated <= date.Value);
        }

        return entities
            .OrderByDescending(e => e.DateCreated)
            .FirstOrDefault();
    }

    public override void Insert(TEntity entity)
    {
        entity.DateCreated = DateTime.Now;

        base.Insert(entity);
    }
}
