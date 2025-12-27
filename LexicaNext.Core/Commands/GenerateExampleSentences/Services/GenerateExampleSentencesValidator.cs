using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.GenerateExampleSentences.Services;

public class GenerateExampleSentencesValidator : AbstractValidator<GenerateExampleSentencesRequest>
{
    public GenerateExampleSentencesValidator()
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
            .WithName(nameof(GenerateExampleSentencesRequest.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }
}
