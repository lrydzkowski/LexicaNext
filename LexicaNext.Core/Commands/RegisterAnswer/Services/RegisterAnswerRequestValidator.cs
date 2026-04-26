using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.RegisterAnswer.Interface;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.RegisterAnswer.Services;

public interface IRegisterAnswerRequestValidator
{
    Task<ValidationResult> ValidateAsync(RegisterAnswerRequest instance, CancellationToken cancellation);
}

public class RegisterAnswerRequestValidator
    : AbstractValidator<RegisterAnswerRequest>, IRegisterAnswerRequestValidator, ITransientService
{
    private readonly IRegisterAnswerRepository _registerAnswerRepository;
    private readonly IUserContextResolver _userContextResolver;

    public RegisterAnswerRequestValidator(
        IRegisterAnswerRepository registerAnswerRepository,
        IUserContextResolver userContextResolver
    )
    {
        _registerAnswerRepository = registerAnswerRepository;
        _userContextResolver = userContextResolver;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(_ => new RegisterAnswerRequestPayloadValidator(_userContextResolver, _registerAnswerRepository));
    }
}

internal class RegisterAnswerRequestPayloadValidator : AbstractValidator<RegisterAnswerRequestPayload>
{
    private static readonly string[] AllowedModeTypes = ["full", "open-questions", "spelling"];

    private static readonly string[] AllowedQuestionTypes =
        ["english-close", "native-close", "english-open", "native-open", "spelling"];

    private readonly IRegisterAnswerRepository _registerAnswerRepository;
    private readonly IUserContextResolver _userContextResolver;

    public RegisterAnswerRequestPayloadValidator(
        IUserContextResolver userContextResolver,
        IRegisterAnswerRepository registerAnswerRepository
    )
    {
        _userContextResolver = userContextResolver;
        _registerAnswerRepository = registerAnswerRepository;

        AddValidationForModeType();
        AddValidationForQuestionType();
        AddValidationForQuestion();
        AddValidationForGivenAnswer();
        AddValidationForExpectedAnswer();
        AddValidationForIsCorrect();
        AddValidationForWordId();
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

    private void AddValidationForQuestionType()
    {
        RuleFor(request => request.QuestionType)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(50)
            .Must(value => value != null && AllowedQuestionTypes.Contains(value))
            .WithMessage($"'QuestionType' must be one of: {string.Join(", ", AllowedQuestionTypes)}.")
            .WithName(nameof(RegisterAnswerRequestPayload.QuestionType));
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

    private void AddValidationForWordId()
    {
        RuleFor(request => request.WordId)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(value => value != Guid.Empty)
            .WithMessage("'WordId' must be a non-empty GUID.")
            .MustAsync(
                async (wordId, cancellationToken) =>
                {
                    string? userId = _userContextResolver.GetUserId();
                    if (userId is null)
                    {
                        return false;
                    }

                    return await _registerAnswerRepository.WordExistsAsync(userId, wordId!.Value, cancellationToken);
                }
            )
            .WithMessage("'WordId' must reference an existing word owned by the current user.")
            .WithName(nameof(RegisterAnswerRequestPayload.WordId));
    }
}
