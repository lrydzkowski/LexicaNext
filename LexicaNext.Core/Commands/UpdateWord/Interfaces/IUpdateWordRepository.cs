using LexicaNext.Core.Commands.UpdateWord.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Interfaces;

public interface IUpdateWordRepository
{
    Task UpdateWordAsync(UpdateWordCommand updateWordCommand, CancellationToken cancellationToken = default);

    Task<bool> WordExistsAsync(Guid wordId, CancellationToken cancellationToken = default);
}
