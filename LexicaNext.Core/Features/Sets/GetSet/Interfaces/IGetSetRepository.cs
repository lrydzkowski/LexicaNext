using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Features.Sets.GetSet.Interfaces;

public interface IGetSetRepository
{
    Task<Set?> GetSetAsync(string userId, Guid setId, CancellationToken cancellationToken = default);
}
