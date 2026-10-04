using LexicaNext.Core.Features.Answers.RegisterAnswer.Models;

namespace LexicaNext.Core.Features.Answers.RegisterAnswer.Interface;

public interface IRegisterAnswerRepository
{
    Task RegisterAnswerAsync(RegisterAnswerCommand registerAnswerCommand);

    Task<bool> WordExistsAsync(string userId, Guid wordId, CancellationToken cancellationToken = default);
}
