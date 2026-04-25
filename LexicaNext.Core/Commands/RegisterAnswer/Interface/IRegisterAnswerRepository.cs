using LexicaNext.Core.Commands.RegisterAnswer.Models;

namespace LexicaNext.Core.Commands.RegisterAnswer.Interface;

public interface IRegisterAnswerRepository
{
    Task RegisterAnswerAsync(RegisterAnswerCommand registerAnswerCommand);

    Task<bool> WordExistsAsync(string userId, Guid wordId, CancellationToken cancellationToken = default);
}
