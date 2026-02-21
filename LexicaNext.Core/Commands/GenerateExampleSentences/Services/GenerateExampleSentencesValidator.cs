using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.GenerateExampleSentences.Services;

public interface IGenerateExampleSentencesValidator
{
    Task<ValidationResult> ValidateAsync(GenerateExampleSentencesRequest instance, CancellationToken cancellation);
}

public class GenerateExampleSentencesValidator
    : AbstractValidator<GenerateExampleSentencesRequest>, IGenerateExampleSentencesValidator, ITransientService
{
    public GenerateExampleSentencesValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
        AddValidationForCount();
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

    private void AddValidationForCount()
    {
        RuleFor(request => request.Count)
            .InclusiveBetween(1, 10)
            .WithName(nameof(GenerateExampleSentencesRequest.Count));
    }
}
