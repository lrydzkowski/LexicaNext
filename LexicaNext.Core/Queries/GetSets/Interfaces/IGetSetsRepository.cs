using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetSets.Interfaces;

public interface IGetSetsRepository
{
    public Task<ListInfo<SetRecord>> GetSetsAsync(
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    );
}
