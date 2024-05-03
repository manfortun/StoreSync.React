using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.DataAccess;

public class AuditableBaseRepository<TEntity> : BaseRepository<TEntity> where TEntity : class, IAuditable
{
    public AuditableBaseRepository(AppDbContext context) : base(context) { }

    public TEntity? Get(string id, DateTime? date = null)
    {
        var entities = GetAll(entity => entity.Id == id);

        TEntity? returnEntity = default!;

        if (date is not null)
        {
            foreach (var entity in entities.OrderBy(e => e.DateCreated))
            {
                // obtain the entity that is less to the date of creation
                // but not greater than the date of creation
                if (date < entity.DateCreated)
                {
                    break;
                }
                else
                {
                    returnEntity = entity;
                }
            }
        }
        else
        {
            // obtain the latest created entity when date is not specified
            returnEntity = entities.MaxBy(e => e.DateCreated);
        }

        return returnEntity ?? entities.MaxBy(e => e.DateCreated);
    }

    public override void Insert(TEntity entity)
    {
        entity.DateCreated = DateTime.Now;

        base.Insert(entity);
    }
}
