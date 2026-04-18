using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.RegisterAnswer.Services;

public interface IRegisterAnswerRequestValidator
{
    Task<ValidationResult> ValidateAsync(RegisterAnswerRequest instance, CancellationToken cancellation);
}

public class RegisterAnswerRequestValidator
    : AbstractValidator<RegisterAnswerRequest>, IRegisterAnswerRequestValidator, ITransientService
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
    private static readonly string[] AllowedModeTypes = ["full", "open-questions", "spelling"];

    public RegisterAnswerRequestPayloadValidator()
    {
        AddValidationForModeType();
        AddValidationForQuestion();
        AddValidationForGivenAnswer();
        AddValidationForExpectedAnswer();
        AddValidationForIsCorrect();
    }

    private void AddValidationForModeType()
    {
        RuleFor(request => request.ModeType)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(50)
            .Must(value => value != null && AllowedModeTypes.Contains(value))
            .WithMessage($"'ModeType' must be one of: {string.Join(", ", AllowedModeTypes)}.")
            .WithName(nameof(RegisterAnswerRequestPayload.ModeType));
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

    private void AddValidationForIsCorrect()
    {
        RuleFor(request => request.IsCorrect)
            .NotNull()
            .WithName(nameof(RegisterAnswerRequestPayload.IsCorrect));
    }
}
