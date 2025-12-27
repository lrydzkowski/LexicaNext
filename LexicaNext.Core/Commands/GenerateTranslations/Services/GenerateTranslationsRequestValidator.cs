using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.GenerateTranslations.Services;

public class GenerateTranslationsRequestValidator : AbstractValidator<GenerateTranslationsRequest>
{
    public GenerateTranslationsRequestValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
    }

    private void AddValidationForWord()
    {
        RuleFor(request => request.Word).NotEmpty().MaximumLength(200);
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(GenerateTranslationsRequest.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }
}
