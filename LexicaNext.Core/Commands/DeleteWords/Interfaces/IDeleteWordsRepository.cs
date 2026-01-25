namespace LexicaNext.Core.Commands.DeleteWords.Interfaces;

public interface IDeleteWordsRepository
{
    Task DeleteWordsAsync(string userId, List<Guid> wordIds, CancellationToken cancellationToken = default);
}
