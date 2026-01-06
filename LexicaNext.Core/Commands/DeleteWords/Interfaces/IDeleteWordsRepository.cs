namespace LexicaNext.Core.Commands.DeleteWords.Interfaces;

public interface IDeleteWordsRepository
{
    Task DeleteWordsAsync(List<Guid> wordIds, CancellationToken cancellationToken = default);
}
