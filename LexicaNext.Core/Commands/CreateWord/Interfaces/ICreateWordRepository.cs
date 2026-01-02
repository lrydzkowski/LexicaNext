using LexicaNext.Core.Commands.CreateWord.Models;

namespace LexicaNext.Core.Commands.CreateWord.Interfaces;

public interface ICreateWordRepository
{
    Task<Guid> CreateWordAsync(CreateWordCommand createWordCommand, CancellationToken cancellationToken = default);
}
