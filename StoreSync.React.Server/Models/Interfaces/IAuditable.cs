namespace StoreSync.React.Server.Models.Interfaces;

public interface IAuditable : IEntity
{
    public DateTime DateCreated { get; set; }
}
