namespace LexicaNext.Core.Commands.DeleteWord.Interfaces;

public interface IDeleteWordRepository
{
    Task DeleteWordAsync(Guid wordId, CancellationToken cancellationToken = default);
}
