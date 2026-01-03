namespace LexicaNext.Core.Queries.GetProposedSetName.Interfaces;

public interface IGetProposedSetNameRepository
{
    Task<string> GetProposedSetNameAsync(CancellationToken cancellationToken = default);
}
