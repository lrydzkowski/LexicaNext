using LexicaNext.Core.Commands.UpdateSet.Models;

namespace LexicaNext.Core.Commands.UpdateSet.Interfaces;

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
