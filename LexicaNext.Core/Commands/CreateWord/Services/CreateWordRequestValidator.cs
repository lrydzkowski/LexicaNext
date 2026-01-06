using FluentValidation;
using LexicaNext.Core.Commands.CreateWord.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateWord.Services;

public class CreateWordRequestValidator : AbstractValidator<CreateWordRequest>
{
    public CreateWordRequestValidator(ICreateWordRepository createWordRepository)
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new CreateWordRequestPayloadValidator(createWordRepository));
    }
}

internal class CreateWordRequestPayloadValidator : AbstractValidator<CreateWordRequestPayload>
{
    public CreateWordRequestPayloadValidator(ICreateWordRepository createWordRepository)
    {
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
                    bool exists = await createWordRepository.WordExistsAsync(
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
