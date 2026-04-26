using LexicaNext.Core.Commands.RegisterAnswer.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.RegisterAnswer.Services;

internal interface IRegisterAnswerCommandMapper
{
    RegisterAnswerCommand Map(string userId, RegisterAnswerRequest request);
}

internal class RegisterAnswerCommandMapper
    : ISingletonService, IRegisterAnswerCommandMapper
{
    public RegisterAnswerCommand Map(string userId, RegisterAnswerRequest request)
    {
        return new RegisterAnswerCommand
        {
            UserId = userId,
            ModeType = request.Payload?.ModeType ?? "",
            QuestionType = request.Payload?.QuestionType ?? "",
            Question = request.Payload?.Question ?? "",
            GivenAnswer = request.Payload?.GivenAnswer ?? "",
            ExpectedAnswer = request.Payload?.ExpectedAnswer ?? "",
            IsCorrect = request.Payload?.IsCorrect ?? false,
            WordId = request.Payload?.WordId ?? Guid.Empty
        };
    }
}
