namespace StoreSync.React.Server.Models.Interfaces;

public interface ISoftDeletable : IEntity
{
    public bool IsDeleted { get; set; }
}
