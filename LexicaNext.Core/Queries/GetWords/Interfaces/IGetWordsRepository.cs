using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWords.Interfaces;

public interface IGetWordsRepository
{
    Task<ListInfo<WordRecord>> GetWordsAsync(
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    );
}
