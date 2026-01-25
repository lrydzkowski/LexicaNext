using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetSets.Interfaces;

public interface IGetSetsRepository
{
    Task<ListInfo<SetRecord>> GetSetsAsync(
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    );
}
