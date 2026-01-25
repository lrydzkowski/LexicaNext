using LexicaNext.Core.Commands.UpdateWord.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Interfaces;

public interface IUpdateWordRepository
{
    Task UpdateWordAsync(UpdateWordCommand updateWordCommand, CancellationToken cancellationToken = default);

    Task<bool> WordExistsAsync(string userId, Guid wordId, CancellationToken cancellationToken = default);

    Task<bool> WordExistsAsync(
        string userId,
        string word,
        string wordType,
        Guid ignoreWordId,
        CancellationToken cancellationToken = default
    );
}
