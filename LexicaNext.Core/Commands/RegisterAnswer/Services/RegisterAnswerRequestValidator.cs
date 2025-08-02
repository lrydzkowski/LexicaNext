using FluentValidation;

namespace LexicaNext.Core.Commands.RegisterAnswer.Services;

public class RegisterAnswerRequestValidator : AbstractValidator<RegisterAnswerRequest>
{
    public RegisterAnswerRequestValidator()
    {
        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new RegisterAnswerRequestPayloadValidator());
    }
}

internal class RegisterAnswerRequestPayloadValidator : AbstractValidator<RegisterAnswerRequestPayload>
{
    public RegisterAnswerRequestPayloadValidator()
    {
        AddValidationForQuestion();
        AddValidationForGivenAnswer();
        AddValidationForExpectedAnswer();
    }

    private void AddValidationForQuestion()
    {
        RuleFor(request => request.Question).NotEmpty().MaximumLength(500);
    }

    private void AddValidationForGivenAnswer()
    {
        RuleFor(request => request.GivenAnswer)
            .MaximumLength(500)
            .WithName(nameof(RegisterAnswerRequestPayload.GivenAnswer));
    }

    private void AddValidationForExpectedAnswer()
    {
        RuleFor(request => request.ExpectedAnswer)
            .NotEmpty()
            .MaximumLength(500)
            .WithName(nameof(RegisterAnswerRequestPayload.ExpectedAnswer));
    }
}
