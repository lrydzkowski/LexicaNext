using LexicaNext.Core.Features.Words.CreateWord.Models;

namespace LexicaNext.Core.Features.Words.CreateWord.Interfaces;

public interface ICreateWordRepository
{
    Task<Guid> CreateWordAsync(CreateWordCommand createWordCommand, CancellationToken cancellationToken = default);

    Task<bool> WordExistsAsync(
        string userId,
        string word,
        string wordType,
        CancellationToken cancellationToken = default
    );
}
