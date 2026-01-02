using FluentValidation;
using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Services;

public class UpdateWordRequestValidator : AbstractValidator<UpdateWordRequest>
{
    public UpdateWordRequestValidator()
    {
        RuleFor(request => request.WordId)
            .NotEmpty()
            .Must(id => Guid.TryParse(id, out _))
            .WithMessage("'{PropertyName}' must be a valid GUID.");

        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new UpdateWordRequestPayloadValidator());
    }
}

internal class UpdateWordRequestPayloadValidator : AbstractValidator<UpdateWordRequestPayload>
{
    public UpdateWordRequestPayloadValidator()
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
            .WithName(nameof(UpdateWordCommand.Word));
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(UpdateWordCommand.WordType))
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
        RuleForEach(request => request.ExampleSentences).NotEmpty().MaximumLength(500);
    }
}
