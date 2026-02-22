using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.CreateWord.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateWord.Services;

public interface ICreateWordRequestValidator
{
    Task<ValidationResult> ValidateAsync(CreateWordRequest instance, CancellationToken cancellation);
}

public class CreateWordRequestValidator
    : AbstractValidator<CreateWordRequest>, ICreateWordRequestValidator, ITransientService
{
    private readonly ICreateWordRepository _createWordRepository;
    private readonly IUserContextResolver _userContextResolver;

    public CreateWordRequestValidator(
        ICreateWordRepository createWordRepository,
        IUserContextResolver userContextResolver
    )
    {
        _createWordRepository = createWordRepository;
        _userContextResolver = userContextResolver;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .DependentRules(
                () =>
                {
                    RuleFor(request => request.Payload!)
                        .SetValidator(
                            request =>
                            {
                                string? userId = _userContextResolver.GetUserId();
                                return new CreateWordRequestPayloadValidator(userId, _createWordRepository);
                            }
                        );
                }
            );
    }
}

internal class CreateWordRequestPayloadValidator : AbstractValidator<CreateWordRequestPayload>
{
    private readonly string? _userId;

    public CreateWordRequestPayloadValidator(string? userId, ICreateWordRepository createWordRepository)
    {
        _userId = userId;
        AddValidationForWord(createWordRepository);
        AddValidationForWordType();
        AddValidationForTranslations();
        AddValidationForExampleSentences();
    }

    private void AddValidationForWord(ICreateWordRepository createWordRepository)
    {
        RuleFor(request => request.Word)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(() => AddValidationForWordUniqueness(createWordRepository))
            .WithName(nameof(CreateWordRequestPayload.Word));
    }

    private void AddValidationForWordUniqueness(ICreateWordRepository createWordRepository)
    {
        RuleFor(request => request)
            .MustAsync(
                async (request, cancellationToken) =>
                {
                    if (_userId is null)
                    {
                        return false;
                    }

                    bool exists = await createWordRepository.WordExistsAsync(
                        _userId,
                        request.Word,
                        request.WordType,
                        cancellationToken
                    );

                    return !exists;
                }
            )
            .WithMessage(request => $"The word '{request.Word}' with the type = '{request.WordType}' already exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(CreateWordRequestPayload.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForTranslations()
    {
        RuleFor(request => request.Translations)
            .NotEmpty()
            .DependentRules(() => RuleForEach(request => request.Translations).NotEmpty().MaximumLength(200));
    }

    private void AddValidationForExampleSentences()
    {
        RuleForEach(request => request.ExampleSentences)
            .NotEmpty()
            .MaximumLength(500)
            .WithName(nameof(CreateWordRequestPayload.ExampleSentences));
    }
}
