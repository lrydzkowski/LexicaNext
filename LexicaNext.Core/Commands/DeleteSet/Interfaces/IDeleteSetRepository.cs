namespace LexicaNext.Core.Commands.DeleteSet.Interfaces;

public interface IDeleteSetRepository
{
    Task DeleteSetAsync(Guid setId, CancellationToken cancellationToken = default);
}
