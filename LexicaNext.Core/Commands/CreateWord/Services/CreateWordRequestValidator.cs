using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateWord.Services;

public class CreateWordRequestValidator : AbstractValidator<CreateWordRequest>
{
    public CreateWordRequestValidator()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new CreateWordRequestPayloadValidator());
    }
}

internal class CreateWordRequestPayloadValidator : AbstractValidator<CreateWordRequestPayload>
{
    public CreateWordRequestPayloadValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
        AddValidationForTranslations();
        AddValidationForExampleSentences();
    }

    private void AddValidationForWord()
    {
        RuleFor(request => request.Word)
            .NotEmpty()
            .MaximumLength(200)
            .WithName(nameof(CreateWordRequestPayload.Word));
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
