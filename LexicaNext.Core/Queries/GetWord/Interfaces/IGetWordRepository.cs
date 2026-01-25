using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWord.Interfaces;

public interface IGetWordRepository
{
    Task<Word?> GetWordAsync(string userId, Guid wordId, CancellationToken cancellationToken = default);

    Task<List<Guid>> GetExistingWordIdsAsync(
        string userId,
        List<Guid> wordIds,
        CancellationToken cancellationToken = default
    );
}
