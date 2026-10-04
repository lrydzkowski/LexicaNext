namespace LexicaNext.Core.Features.Sets.GetProposedSetName.Interfaces;

public interface IGetProposedSetNameRepository
{
    Task<string> GetProposedSetNameAsync(string userId, CancellationToken cancellationToken = default);
}
