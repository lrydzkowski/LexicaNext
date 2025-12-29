using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWordSets.Interfaces;

public interface IGetWordSetsRepository
{
    Task<List<SetRecord>> GetWordSetsAsync(Guid wordId, CancellationToken cancellationToken = default);
}
