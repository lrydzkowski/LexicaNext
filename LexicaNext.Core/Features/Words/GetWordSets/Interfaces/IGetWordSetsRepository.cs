using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Features.Words.GetWordSets.Interfaces;

public interface IGetWordSetsRepository
{
    Task<List<SetRecord>> GetWordSetsAsync(string userId, Guid wordId, CancellationToken cancellationToken = default);
}
