using LexicaNext.Core.Commands.CreateSet.Models;

namespace LexicaNext.Core.Commands.CreateSet.Interfaces;

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
