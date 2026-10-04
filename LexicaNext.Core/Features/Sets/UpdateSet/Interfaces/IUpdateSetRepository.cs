using LexicaNext.Core.Features.Sets.UpdateSet.Models;

namespace LexicaNext.Core.Features.Sets.UpdateSet.Interfaces;

public interface IUpdateSetRepository
{
    Task UpdateSetAsync(UpdateSetCommand updateSetCommand, CancellationToken cancellationToken = default);

    Task<bool> SetExistsAsync(
        string userId,
        string setName,
        Guid? ignoreSetId,
        CancellationToken cancellationToken = default
    );

    Task<bool> SetExistsAsync(string userId, Guid setId, CancellationToken cancellationToken = default);
}
