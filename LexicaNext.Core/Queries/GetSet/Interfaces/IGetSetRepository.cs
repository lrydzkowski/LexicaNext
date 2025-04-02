using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetSet.Interfaces;

public interface IGetSetRepository
{
    Task<Set?> GetSetAsync(Guid setId, CancellationToken cancellationToken = default);
}
