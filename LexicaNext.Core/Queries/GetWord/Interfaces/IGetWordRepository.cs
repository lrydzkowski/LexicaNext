using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWord.Interfaces;

public interface IGetWordRepository
{
    Task<Word?> GetWordAsync(Guid wordId, CancellationToken cancellationToken = default);
}
