using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWordsStatistics.Interfaces;

public interface IGetWordsStatisticsRepository
{
    Task<ListInfo<WordStatisticsRecord>> GetWordsStatisticsAsync(
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    );
}
