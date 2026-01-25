namespace LexicaNext.Core.Commands.DeleteSets.Interfaces;

public interface IDeleteSetsRepository
{
    Task DeleteSetsAsync(string userId, List<Guid> setIds, CancellationToken cancellationToken = default);
}
