using LexicaNext.Core.Commands.RegisterAnswer.Models;

namespace LexicaNext.Core.Commands.RegisterAnswer.Interface;

public interface IRegisterAnswerRepository
{
    Task RegisterAnswerAsync(RegisterAnswerCommand registerAnswerCommand);
}
