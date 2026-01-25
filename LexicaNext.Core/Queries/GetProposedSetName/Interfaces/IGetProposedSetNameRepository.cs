namespace LexicaNext.Core.Queries.GetProposedSetName.Interfaces;

public interface IGetProposedSetNameRepository
{
    Task<string> GetProposedSetNameAsync(string userId, CancellationToken cancellationToken = default);
}
