using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Features.Words.GetWords.Interfaces;

public interface IGetWordsRepository
{
    Task<ListInfo<WordRecord>> GetWordsAsync(
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    );
}
