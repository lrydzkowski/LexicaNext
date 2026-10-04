namespace LexicaNext.Core.Features.Sets.DeleteSets.Interfaces;

public interface IDeleteSetsRepository
{
    Task DeleteSetsAsync(string userId, List<Guid> setIds, CancellationToken cancellationToken = default);
}
