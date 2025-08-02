using LexicaNext.Core.Commands.RegisterAnswer.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.RegisterAnswer.Services;

internal interface IRegisterAnswerCommandMapper
{
    RegisterAnswerCommand Map(RegisterAnswerRequest request);
}

internal class RegisterAnswerCommandMapper
    : ISingletonService, IRegisterAnswerCommandMapper
{
    public RegisterAnswerCommand Map(RegisterAnswerRequest request)
    {
        return new RegisterAnswerCommand
        {
            Question = request.Payload?.Question ?? "",
            GivenAnswer = request.Payload?.GivenAnswer ?? "",
            ExpectedAnswer = request.Payload?.ExpectedAnswer ?? ""
        };
    }
}
