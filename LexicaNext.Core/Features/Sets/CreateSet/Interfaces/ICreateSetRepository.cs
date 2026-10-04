using LexicaNext.Core.Features.Sets.CreateSet.Models;

namespace LexicaNext.Core.Features.Sets.CreateSet.Interfaces;

public interface ICreateSetRepository
{
    Task<Guid> CreateSetAsync(CreateSetCommand createSetCommand, CancellationToken cancellationToken = default);

    Task<bool> SetExistsAsync(
        string userId,
        string setName,
        Guid? ignoreSetId,
        CancellationToken cancellationToken = default
    );
}
