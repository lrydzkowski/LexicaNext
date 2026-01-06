namespace LexicaNext.Core.Commands.DeleteSets.Interfaces;

public interface IDeleteSetsRepository
{
    Task DeleteSetsAsync(List<Guid> setIds, CancellationToken cancellationToken = default);
}
